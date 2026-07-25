import { LEVEL_WIDTH, GAME_HEIGHT } from '../config.js';

const TILE_W = 64;
const TILE_H = 32;

// Construye el suelo, obstaculos urbanos, puntos de aparicion de
// enemigos, zonas de calor y el objetivo final (la heladeria). Es el
// primer nivel, pensado para editarse a mano o sustituirse por un tilemap
// de Tiled mas adelante.
export function buildLevel(scene) {
  const platforms = scene.physics.add.staticGroup();

  const groundY = GAME_HEIGHT - TILE_H / 2;
  for (let x = 0; x < LEVEL_WIDTH; x += TILE_W) {
    // El suelo usa una unica baldosa repetible. No depende de las imágenes
    // de fachadas, de modo que sus juntas nunca cambian de perspectiva al
    // pasar de un panel urbano al siguiente.
    platforms.create(x + TILE_W / 2, groundY, 'street-ground');
  }

  // Las antiguas plataformas flotantes se sustituyen por cajas y
  // contenedores apoyados directamente sobre el asfalto. El contenedor es
  // deliberadamente mas grande para alternar dos ritmos de salto. La recta
  // final sigue limpia para que la llegada a la heladeria respire.
  const obstacles = [
    { x: 300, key: 'obstacle-crate' },
    { x: 700, key: 'obstacle-container' },
    { x: 1100, key: 'obstacle-crate' },
    { x: 1500, key: 'obstacle-container' },
    { x: 1900, key: 'obstacle-crate' },
    { x: 2300, key: 'obstacle-container' },
    { x: 2700, key: 'obstacle-crate' },
    { x: 3100, key: 'obstacle-container' },
    { x: 3550, key: 'obstacle-crate' },
    { x: 3950, key: 'obstacle-container' },
    { x: 4350, key: 'obstacle-crate' },
    { x: 4750, key: 'obstacle-container' },
    { x: 5150, key: 'obstacle-crate' },
    { x: 5550, key: 'obstacle-container' },
    { x: 5950, key: 'obstacle-crate' },
    { x: 6350, key: 'obstacle-container' }
  ];

  const streetTopY = GAME_HEIGHT - TILE_H;
  obstacles.forEach(({ x, key }) => {
    const isContainer = key === 'obstacle-container';
    const width = isContainer ? 176 : 82;
    const height = isContainer ? 104 : 84;
    platforms
      .create(x, streetTopY - height / 2, key)
      .setDisplaySize(width, height)
      .refreshBody();
  });

  // Todos los tornados patrullan a ras de suelo. Conservan recorridos de
  // distinta longitud y aumentan su velocidad poco a poco para que el nivel
  // gane dificultad sin volver a introducir enemigos flotantes.
  const tornadoGroundY = groundY - 60;
  const enemySpawns = [
    { x: 500, y: tornadoGroundY, minX: 420, maxX: 620, speed: 55 },
    { x: 750, y: tornadoGroundY, minX: 700, maxX: 828, speed: 50 },
    { x: 1180, y: tornadoGroundY, minX: 1100, maxX: 1292, speed: 60 },
    { x: 1550, y: tornadoGroundY, minX: 1500, maxX: 1628, speed: 60 },
    { x: 2000, y: tornadoGroundY, minX: 1900, maxX: 2150, speed: 70 },
    { x: 2350, y: tornadoGroundY, minX: 2300, maxX: 2428, speed: 65 },
    { x: 2750, y: tornadoGroundY, minX: 2700, maxX: 2892, speed: 75 },
    { x: 3350, y: tornadoGroundY, minX: 3230, maxX: 3550, speed: 80 },
    { x: 4000, y: tornadoGroundY, minX: 3950, maxX: 4078, speed: 80 },
    { x: 4400, y: tornadoGroundY, minX: 4350, maxX: 4542, speed: 85 },
    { x: 4800, y: tornadoGroundY, minX: 4750, maxX: 4878, speed: 85 },
    { x: 4950, y: tornadoGroundY, minX: 4900, maxX: 5100, speed: 90 },
    { x: 5600, y: tornadoGroundY, minX: 5550, maxX: 5678, speed: 90 },
    { x: 6000, y: tornadoGroundY, minX: 5950, maxX: 6142, speed: 95 }
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
  // Objetivo al final del nivel. La imagen mide 200 px de alto y queda
  // apoyada sobre el borde superior de las baldosas.
  const goal = { x: LEVEL_WIDTH - 160, y: groundY - TILE_H / 2 - 100 };

  return { platforms, enemySpawns, heatZones, goal };
}
