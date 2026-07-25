import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const root = process.cwd();
const previewUrl = 'http://127.0.0.1:4173/';
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

function findChromium() {
  const candidates = [
    process.env.CHROMIUM_BIN,
    'chromium',
    'chromium-browser'
  ].filter(Boolean);

  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ['--version'], {
      encoding: 'utf8',
      shell: false,
      windowsHide: true
    });
    if (!probe.error && probe.status === 0) {
      return { executable: candidate, version: probe.stdout.trim() || probe.stderr.trim() };
    }
  }

  throw new Error(
    'No se encontró Chromium. Instala el paquete chromium de la distribución ' +
    'o define CHROMIUM_BIN con la ruta del ejecutable.'
  );
}

function waitForServer(url, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const probe = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode === 200) return resolve();
        retry(new Error(`El servidor respondió HTTP ${response.statusCode}.`));
      });
      request.on('error', retry);
      request.setTimeout(1_000, () => request.destroy(new Error('Tiempo de espera agotado.')));
    };
    const retry = (lastError) => {
      if (Date.now() >= deadline) return reject(lastError);
      setTimeout(probe, 150);
    };
    probe();
  });
}

async function run() {
  if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
    throw new Error('Falta dist/index.html. Ejecuta primero npm run build.');
  }

  const chromium = findChromium();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fast-foss-chromium-'));
  const server = spawn(process.execPath, [
    viteBin,
    'preview',
    '--host', '127.0.0.1',
    '--port', '4173',
    '--strictPort'
  ], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  let serverError = '';
  server.stderr.on('data', (chunk) => { serverError += chunk; });

  try {
    await waitForServer(previewUrl);

    const chromiumArgs = [
      '--headless=new',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--enable-logging=stderr',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=5000',
      `--user-data-dir=${profile}`,
      '--dump-dom',
      previewUrl
    ];
    if (process.getuid?.() === 0) chromiumArgs.unshift('--no-sandbox');

    const result = spawnSync(chromium.executable, chromiumArgs, {
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
      timeout: 30_000,
      windowsHide: true
    });

    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(`Chromium terminó con código ${result.status}:\n${result.stderr}`);
    }
    if (!/<canvas\b/i.test(result.stdout)) {
      throw new Error('Phaser no llegó a crear el canvas del juego.');
    }

    const pageErrors = result.stderr
      .split(/\r?\n/)
      .filter((line) => /Failed to load resource|Uncaught|SyntaxError|ReferenceError|TypeError/i.test(line));
    if (pageErrors.length > 0) {
      throw new Error(`Chromium registró errores de página:\n${pageErrors.join('\n')}`);
    }

    console.log(`Prueba Chromium superada con ${chromium.version}.`);
  } finally {
    server.kill();
    fs.rmSync(profile, { recursive: true, force: true });
    if (server.exitCode && server.exitCode !== 0 && serverError) {
      console.error(serverError.trim());
    }
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
