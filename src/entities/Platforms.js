import { LEVEL_WIDTH, GAME_HEIGHT } from '../config.js';

const TILE_W = 64;
const TILE_H = 32;

// Construye el suelo, plataformas flotantes, puntos de aparicion de
// enemigos, zonas de calor y el objetivo final (la heladeria). Es el
// primer nivel, pensado para editarse a mano o sustituirse por un tilemap
// de Tiled mas adelante.
export function buildLevel(scene) {
  const platforms = scene.physics.add.staticGroup();

  const groundY = GAME_HEIGHT - TILE_H / 2;
  for (let x = 0; x < LEVEL_WIDTH; x += TILE_W) {
    platforms.create(x + TILE_W / 2, groundY, 'platform');
  }

  // Plataformas flotantes a lo largo de todo el nivel, alternando altura
  // para que el salto no se vuelva repetitivo. Los ultimos tramos (a partir
  // de floater16) quedan libres a proposito: es la recta final, sin
  // obstaculos, para llegar tranquilo a la heladeria.
  const floaters = [
    { x: 300, y: 380, tiles: 3 },
    { x: 700, y: 340, tiles: 3 },
    { x: 1100, y: 440, tiles: 4 },
    { x: 1500, y: 320, tiles: 3 },
    { x: 1900, y: 380, tiles: 4 },
    { x: 2300, y: 300, tiles: 3 },
    { x: 2700, y: 420, tiles: 4 },
    { x: 3100, y: 340, tiles: 3 },
    { x: 3550, y: 400, tiles: 4 },
    { x: 3950, y: 280, tiles: 3 },
    { x: 4350, y: 380, tiles: 4 },
    { x: 4750, y: 320, tiles: 3 },
    { x: 5150, y: 420, tiles: 4 },
    { x: 5550, y: 340, tiles: 3 },
    { x: 5950, y: 400, tiles: 4 },
    { x: 6350, y: 300, tiles: 3 }
  ];

  floaters.forEach((f) => {
    for (let i = 0; i < f.tiles; i += 1) {
      platforms.create(f.x + i * TILE_W, f.y, 'platform');
    }
  });

  // Enemigos: alternan patrullas por el suelo (rango amplio) y patrullas
  // sobre una plataforma flotante concreta (rango ajustado al ancho de esa
  // plataforma, con medio bloque de margen). La velocidad crece poco a poco
  // segun se avanza para que el nivel gane dificultad de forma progresiva.
  const enemySpawns = [
    { x: 500, y: groundY - 60, minX: 420, maxX: 620, speed: 55 },
    { x: 750, y: 284, minX: 700, maxX: 828, speed: 50 },
    { x: 1180, y: 384, minX: 1100, maxX: 1292, speed: 60 },
    { x: 1550, y: 264, minX: 1500, maxX: 1628, speed: 60 },
    { x: 2000, y: groundY - 60, minX: 1900, maxX: 2150, speed: 70 },
    { x: 2350, y: 244, minX: 2300, maxX: 2428, speed: 65 },
    { x: 2750, y: 364, minX: 2700, maxX: 2892, speed: 75 },
    { x: 3350, y: groundY - 60, minX: 3230, maxX: 3550, speed: 80 },
    { x: 4000, y: 224, minX: 3950, maxX: 4078, speed: 80 },
    { x: 4400, y: 324, minX: 4350, maxX: 4542, speed: 85 },
    { x: 4800, y: 264, minX: 4750, maxX: 4878, speed: 85 },
    { x: 4950, y: groundY - 60, minX: 4900, maxX: 5100, speed: 90 },
    { x: 5600, y: 284, minX: 5550, maxX: 5678, speed: 90 },
    { x: 6000, y: 344, minX: 5950, maxX: 6142, speed: 95 }
  ];

  // Zonas de calor: tramos de suelo (asfalto derretido) que ralentizan y
  // dañan poco a poco a Begitxo mientras las pisa. No son enemigos: no se
  // disparan, se esquivan o se cruzan corriendo. Se reparten por los tramos
  // de suelo abierto entre plataformas; la recta final antes de la
  // heladeria queda limpia de hazards para cerrar el nivel sin agobios.
  const heatZones = [
    { x: 950, y: groundY, width: 192, height: TILE_H },
    { x: 1750, y: groundY, width: 192, height: TILE_H },
    { x: 2550, y: groundY, width: 192, height: TILE_H },
    { x: 3800, y: groundY, width: 192, height: TILE_H },
    { x: 4600, y: groundY, width: 192, height: TILE_H },
    { x: 5850, y: groundY, width: 192, height: TILE_H }
  ];

  // Objetivo del nivel: la heladeria, al final de la recta despejada.
  const goal = { x: LEVEL_WIDTH - 160, y: groundY - 100 };

  return { platforms, enemySpawns, heatZones, goal };
}
