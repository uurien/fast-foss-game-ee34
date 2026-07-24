import levelText from '../levels/level1.txt?raw';
import { parseLevel } from '../levels/levelLoader.js';

// Construye el suelo, plataformas flotantes, puntos de aparicion de
// enemigos, zonas de calor, spawn del jugador y el objetivo final (la
// heladeria) a partir del archivo de texto en src/levels/level1.txt. Editar
// ese archivo para rediseñar el nivel sin tocar codigo.
export function buildLevel(scene) {
  const { platformTiles, heatZones, enemySpawns, playerSpawn, goal } = parseLevel(levelText);

  const platforms = scene.physics.add.staticGroup();
  platformTiles.forEach((tile) => platforms.create(tile.x, tile.y, 'platform'));

  return { platforms, enemySpawns, heatZones, playerSpawn, goal };
}
