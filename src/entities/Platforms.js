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

  const floaters = [
    { x: 300, y: 420, tiles: 3 },
    { x: 700, y: 340, tiles: 3 },
    { x: 1100, y: 440, tiles: 4 },
    { x: 1500, y: 320, tiles: 3 },
    { x: 1900, y: 420, tiles: 4 }
  ];

  floaters.forEach((f) => {
    for (let i = 0; i < f.tiles; i += 1) {
      platforms.create(f.x + i * TILE_W, f.y, 'platform');
    }
  });

  const enemySpawns = [
    { x: 500, y: groundY - 60, minX: 420, maxX: 620, speed: 60 },
    // Los limites dejan medio enemigo de margen para que no abandone la
    // plataforma antes de poder cambiar de direccion.
    { x: 750, y: 300, minX: 684, maxX: 844, speed: 50 },
    { x: 1180, y: 400, minX: 1084, maxX: 1308, speed: 70 },
    { x: 1550, y: 280, minX: 1484, maxX: 1644, speed: 50 },
    { x: 2000, y: groundY - 60, minX: 1900, maxX: 2150, speed: 80 }
  ];

  return { platforms, enemySpawns };
}
