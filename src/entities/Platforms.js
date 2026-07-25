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

  // Los primeros 400 px forman una zona de salida completamente despejada.
  // A partir de ahi, cajas y contenedores se alternan con tramos reservados
  // para llamas y rejillas de calor; sus siluetas nunca comparten espacio.
  const obstacles = [
    { x: 500, key: 'obstacle-crate' },
    { x: 950, key: 'obstacle-container' },
    { x: 1350, key: 'obstacle-crate' },
    { x: 1800, key: 'obstacle-container' },
    { x: 2200, key: 'obstacle-crate' },
    { x: 2670, key: 'obstacle-container' },
    { x: 3060, key: 'obstacle-crate' },
    { x: 3540, key: 'obstacle-container' },
    { x: 3930, key: 'obstacle-crate' },
    { x: 4420, key: 'obstacle-container' },
    { x: 4810, key: 'obstacle-crate' },
    { x: 5320, key: 'obstacle-container' },
    { x: 5710, key: 'obstacle-crate' }
  ];

  const streetTopY = GAME_HEIGHT - TILE_H;
  obstacles.forEach(({ x, key }) => {
    const isContainer = key === 'obstacle-container';
    const width = isContainer ? 176 : 112;
    const height = isContainer ? 104 : 74;
    const obstacle = platforms
      .create(x, streetTopY - height / 2, key)
      .setDisplaySize(width, height)
      .refreshBody();

    // Las siluetas no son rectangulos perfectos: la caja tiene esquinas
    // superiores inclinadas y el contenedor asas y laterales salientes. Un
    // cuerpo del tamaño completo incluye esos pixeles transparentes y hace
    // que Begitxo parezca flotar. El cuerpo interior conserva la base en el
    // asfalto y elimina ese margen invisible de colision.
    const insetX = isContainer ? 12 : 10;
    const insetTop = isContainer ? 7 : 10;
    obstacle.body
      .setSize(width - insetX * 2, height - insetTop, false)
      .setOffset(insetX, insetTop);
  });

  // Cada llama patrulla solo por un tramo de asfalto libre. Se deja ademas
  // medio sprite (32 px) entre los limites de patrulla y cualquier objeto,
  // para que nunca pase visualmente por delante de una caja o contenedor.
  const tornadoGroundY = groundY - 60;
  const enemySpawns = [
    { x: 680, y: tornadoGroundY, minX: 650, maxX: 800, speed: 55 },
    { x: 1500, y: tornadoGroundY, minX: 1500, maxX: 1630, speed: 60 },
    { x: 2350, y: tornadoGroundY, minX: 2350, maxX: 2500, speed: 65 },
    { x: 3210, y: tornadoGroundY, minX: 3210, maxX: 3380, speed: 70 },
    { x: 4100, y: tornadoGroundY, minX: 4100, maxX: 4250, speed: 75 },
    { x: 5000, y: tornadoGroundY, minX: 5000, maxX: 5170, speed: 80 }
  ];

  // Zonas de calor: tramos de suelo (asfalto derretido) que ralentizan y
  // dañan poco a poco a Begitxo mientras las pisa. No son enemigos: no se
  // disparan, se esquivan o se cruzan corriendo. Se reparten por los tramos
  // de suelo abierto entre plataformas; la recta final antes de la
  // heladeria queda limpia de hazards para cerrar el nivel sin agobios.
  const heatZones = [
    { x: 1170, y: groundY, width: 192, height: TILE_H },
    { x: 2020, y: groundY, width: 192, height: TILE_H },
    { x: 2880, y: groundY, width: 192, height: TILE_H },
    { x: 3750, y: groundY, width: 192, height: TILE_H },
    { x: 4630, y: groundY, width: 192, height: TILE_H },
    { x: 5530, y: groundY, width: 192, height: TILE_H }
  ];

  // Objetivo del nivel: la heladeria, al final de la recta despejada.
  // Objetivo al final del nivel. La imagen mide 200 px de alto y queda
  // apoyada sobre el borde superior de las baldosas.
  const goal = { x: LEVEL_WIDTH - 160, y: groundY - TILE_H / 2 - 100 };
  // Al activarse el combate, Eguzkitzarra debe quedar claramente dentro de
  // la camara. Antes aparecia demasiado cerca del extremo derecho y su
  // oscilacion podia dejar el sprite completamente fuera de pantalla aunque
  // el HUD indicase que la pelea ya habia empezado.
  const boss = {
    x: 6500,
    // Queda apenas por encima del asfalto: lo bastante bajo para combatir a
    // la altura de Begitxo, con un pequeno margen de flotacion visible.
    y: 370,
    // Se cierra justo detras del jugador en cuanto arranca el combate, para
    // que no pueda retroceder y esquivar al jefe saliendo de la arena.
    // Recupera el ancho original del ring: 940 px entre ambos muros.
    arenaEntranceX: 6000,
    arenaExitX: 6940,
    stormGroundY: tornadoGroundY
  };

  return { platforms, enemySpawns, heatZones, goal, boss };
}
