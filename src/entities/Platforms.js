import { LEVEL_WIDTH, GAME_HEIGHT } from '../config.js';

const TILE_W = 64;
const TILE_H = 32;

// Construye el suelo, un puñado de plataformas flotantes y los puntos de
// aparicion de enemigos con su rango de patrulla. Es un nivel de ejemplo
// pensado para editarse a mano o sustituirse por un tilemap de Tiled.
export function buildLevel(scene) {
  const platforms = scene.physics.add.staticGroup();

  const groundY = GAME_HEIGHT - TILE_H / 2;
  for (let x = 0; x < LEVEL_WIDTH; x += TILE_W) {
    platforms.create(x + TILE_W / 2, groundY, 'platform');
  }

  // floater1 y floater5 se elevan respecto al diseno original: con el
  // suelo continuo debajo y el jugador/enemigos mas grandes, a 420 no
  // dejaban hueco vertical suficiente y quedaban atascados contra el
  // borde inferior al intentar pasar por debajo.
  const floaters = [
    { x: 300, y: 380, tiles: 3 },
    { x: 700, y: 340, tiles: 3 },
    { x: 1100, y: 440, tiles: 4 },
    { x: 1500, y: 320, tiles: 3 },
    { x: 1900, y: 380, tiles: 4 }
  ];

  floaters.forEach((f) => {
    for (let i = 0; i < f.tiles; i += 1) {
      platforms.create(f.x + i * TILE_W, f.y, 'platform');
    }
  });

  const enemySpawns = [
    { x: 500, y: groundY - 60, minX: 420, maxX: 620, speed: 60 },
    // Los limites dejan medio enemigo de margen para que no abandone la
    // plataforma antes de poder cambiar de direccion. La altura de aparicion
    // deja hueco suficiente para caer sobre la plataforma sin nacer ya
    // solapado con ella (con el enemigo mas grande, nacian dentro del
    // bloque y lo atravesaban en caida libre hasta el suelo).
    { x: 750, y: 284, minX: 700, maxX: 828, speed: 50 },
    { x: 1180, y: 384, minX: 1100, maxX: 1292, speed: 70 },
    { x: 1550, y: 264, minX: 1500, maxX: 1628, speed: 50 },
    { x: 2000, y: groundY - 60, minX: 1900, maxX: 2150, speed: 80 }
  ];

  // Zonas de calor: tramos de suelo (asfalto derretido) que ralentizan y
  // dañan poco a poco a Begitxo mientras las pisa. No son enemigos: no se
  // disparan, se esquivan o se cruzan corriendo.
  const heatZones = [
    { x: 950, y: groundY, width: 192, height: TILE_H },
    { x: 1750, y: groundY, width: 192, height: TILE_H }
  ];

  return { platforms, enemySpawns, heatZones };
}
