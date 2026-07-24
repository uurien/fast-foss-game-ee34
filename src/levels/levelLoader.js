// Formato de nivel en texto plano: un grid ASCII (una fila por linea, una
// columna por tile) mas una tabla de parametros para los enemigos. Se
// referencian por su posicion (columna,fila) en vez de un id de un solo
// caracter para no limitar cuantos enemigos puede tener un nivel.
export const TILE_W = 64;
export const TILE_H = 32;

const SECTION_GRID = 'GRID';
const SECTION_ENEMIES = 'ENEMIES';

const GRID_LINE = /^row=(\d+):\s?(.*)$/;
const ENEMY_LINE = /^\((\d+),(\d+)\)\s+minX=(-?\d+)\s+maxX=(-?\d+)\s+speed=(-?\d+)$/;

export function parseLevel(text) {
  const gridRows = [];
  const enemyParams = new Map();
  let section = null;

  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return;

    if (line === SECTION_GRID || line === SECTION_ENEMIES) {
      section = line;
      return;
    }

    if (section === SECTION_GRID) {
      const match = line.match(GRID_LINE);
      if (!match) throw new Error(`Linea de GRID invalida: "${line}"`);
      gridRows.push({ row: Number(match[1]), chars: match[2] });
    } else if (section === SECTION_ENEMIES) {
      const match = line.match(ENEMY_LINE);
      if (!match) throw new Error(`Linea de ENEMIES invalida: "${line}"`);
      const [, col, row, minX, maxX, speed] = match;
      enemyParams.set(`${col},${row}`, { minX: Number(minX), maxX: Number(maxX), speed: Number(speed) });
    }
  });

  const platformTiles = [];
  const enemySpawns = [];
  const heatZoneRuns = [];
  let playerSpawn = null;
  let goal = null;

  gridRows.forEach(({ row, chars }) => {
    let heatRunStart = null;

    for (let col = 0; col <= chars.length; col += 1) {
      const ch = chars[col];

      if (ch === '~') {
        if (heatRunStart === null) heatRunStart = col;
      } else if (heatRunStart !== null) {
        heatZoneRuns.push({ row, startCol: heatRunStart, endCol: col - 1 });
        heatRunStart = null;
      }

      if (ch === undefined) continue;

      const x = col * TILE_W + TILE_W / 2;
      const y = row * TILE_H + TILE_H / 2;

      if (ch === '#' || ch === '~') {
        platformTiles.push({ x, y });
      } else if (ch === 'E') {
        const params = enemyParams.get(`${col},${row}`);
        if (!params) throw new Error(`Enemigo en (${col},${row}) sin parametros en la seccion ENEMIES`);
        enemySpawns.push({ x, y, ...params });
      } else if (ch === 'P') {
        playerSpawn = { x, y };
      } else if (ch === 'G') {
        goal = { x, y };
      }
    }
  });

  const heatZones = heatZoneRuns.map(({ row, startCol, endCol }) => {
    const width = (endCol - startCol + 1) * TILE_W;
    return {
      x: startCol * TILE_W + width / 2,
      y: row * TILE_H + TILE_H / 2,
      width,
      height: TILE_H
    };
  });

  if (!playerSpawn) throw new Error('El nivel no define spawn de jugador (marcador P)');
  if (!goal) throw new Error('El nivel no define meta (marcador G)');

  return { platformTiles, heatZones, enemySpawns, playerSpawn, goal };
}
