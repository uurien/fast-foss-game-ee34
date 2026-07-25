import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const APPROVED_NPM_LICENSES = new Set([
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'MIT'
]);

function walk(directory, extension) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(entryPath, extension);
    return entry.isFile() && entry.name.endsWith(extension) ? [entryPath] : [];
  });
}

export function checkCompliance(root = globalThis.process?.cwd?.() ?? '.') {
  const failures = [];
  const assert = (condition, message) => {
    if (!condition) failures.push(message);
  };
  const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
  const readJson = (relativePath) => JSON.parse(read(relativePath));

  const manifest = readJson('package.json');
  const lock = readJson('package-lock.json');
  const readme = read('README.md');
  const viteConfig = read('vite.config.js');
  const sourceFiles = walk(path.join(root, 'src'), '.js');
  const source = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

  assert(manifest.license === 'MIT', 'package.json debe declarar la licencia MIT.');
  assert(manifest.dependencies?.phaser === '3.90.0', 'Phaser debe permanecer fijado en 3.90.0.');
  assert(manifest.devDependencies?.vite === '5.4.21', 'Vite debe permanecer fijado en 5.4.21.');
  assert(lock.packages?.['']?.license === 'MIT', 'El lockfile debe declarar MIT para el proyecto.');
  assert(viteConfig.includes("base: './'"), 'La build debe usar rutas relativas para alojamiento estático.');
  assert(fs.existsSync(path.join(root, 'LICENSE')), 'Falta el fichero LICENSE.');
  assert(fs.existsSync(path.join(root, 'ASSET_LICENSES.md')), 'Falta el inventario de licencias de assets.');
  assert(
    fs.existsSync(path.join(root, 'public', 'ASSET_LICENSES.txt')),
    'Falta la declaración de assets que debe copiarse a la build.'
  );
  assert(
    read('LICENSE').replace(/\r\n/g, '\n').trim() ===
      read('public/LICENSE.txt').replace(/\r\n/g, '\n').trim(),
    'public/LICENSE.txt debe ser idéntico a LICENSE para licenciar la build.'
  );
  assert(
    fs.existsSync(path.join(root, 'public', 'THIRD_PARTY_NOTICES.txt')),
    'Faltan los avisos de terceros que deben copiarse a la build.'
  );

  let packageCount = 0;
  for (const [packagePath, metadata] of Object.entries(lock.packages ?? {})) {
    if (!packagePath.startsWith('node_modules/')) continue;
    packageCount += 1;
    assert(Boolean(metadata.license), `${packagePath} no declara licencia en package-lock.json.`);
    assert(
      APPROVED_NPM_LICENSES.has(metadata.license),
      `${packagePath} usa una licencia no revisada: ${metadata.license ?? 'sin licencia'}.`
    );
  }

  for (const dependency of [
    'Phaser',
    'eventemitter3',
    'Vite',
    'esbuild',
    'Rollup',
    'postcss',
    'nanoid',
    'picocolors',
    'source-map-js',
    '@types/estree',
    'fsevents'
  ]) {
    assert(readme.includes(dependency), `README.md no documenta la dependencia ${dependency}.`);
  }

  assert(!/https?:\/\//i.test(source), 'El código de ejecución contiene una URL remota.');
  assert(!/Arial Black|\bImpact\b/i.test(source), 'El código solicita una fuente propietaria por nombre.');

  const assetPattern = /this\.load\.(?:image|spritesheet)\(\s*[^,]+,\s*['"]([^'"]+)['"]/g;
  const loadedAssets = [...source.matchAll(assetPattern)].map((match) => match[1]);
  for (const asset of loadedAssets) {
    assert(!asset.includes('://'), `El asset ${asset} se carga desde la red.`);
    assert(
      fs.existsSync(path.join(root, 'public', ...asset.split('/'))),
      `No existe el asset cargado public/${asset}.`
    );
  }

  if (failures.length > 0) {
    throw new Error(`Auditoría de cumplimiento fallida:\n- ${failures.join('\n- ')}`);
  }

  return { packages: packageCount, loadedAssets: loadedAssets.length, sourceFiles: sourceFiles.length };
}

const runtimeProcess = globalThis.process;
const invokedPath = runtimeProcess?.argv?.[1];
if (invokedPath && import.meta.url === pathToFileURL(path.resolve(invokedPath)).href) {
  try {
    const result = checkCompliance();
    console.log(
      `Cumplimiento comprobado: ${result.packages} paquetes, ` +
      `${result.loadedAssets} assets cargados y ${result.sourceFiles} ficheros fuente.`
    );
  } catch (error) {
    console.error(error.message);
    runtimeProcess.exitCode = 1;
  }
}
