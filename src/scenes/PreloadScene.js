import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    // Cuando haya arte real, cargarlo aqui, por ejemplo:
    // this.load.spritesheet('begitxo', 'assets/begitxo.png', { frameWidth: 32, frameHeight: 48 });
    // this.load.image('platform', 'assets/platform.png');
  }

  create() {
    this.generatePlaceholderTextures();
    this.scene.start('Game');
  }

  // Genera texturas de un solo color para poder jugar y probar la logica
  // del juego antes de tener arte definitivo. Sustituir por load.image/
  // load.spritesheet cuando llegue el arte final.
  generatePlaceholderTextures() {
    const g = this.add.graphics();

    g.fillStyle(0x3498db, 1);
    g.fillRect(0, 0, 28, 48);
    g.generateTexture('player', 28, 48);
    g.clear();

    g.fillStyle(0xe74c3c, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('enemy', 32, 32);
    g.clear();

    g.fillStyle(0xf1c40f, 1);
    g.fillRect(0, 0, 12, 6);
    g.generateTexture('bullet', 12, 6);
    g.clear();

    g.fillStyle(0x8d6e37, 1);
    g.fillRect(0, 0, 64, 32);
    g.lineStyle(2, 0x6b5227, 1);
    g.strokeRect(1, 1, 62, 30);
    g.generateTexture('platform', 64, 32);
    g.clear();

    g.destroy();
  }
}
