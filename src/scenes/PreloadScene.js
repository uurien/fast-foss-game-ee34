import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.image('begitxo-source', 'assets/begitxo-summer-v4-clean.png');
    this.load.image('heat-zone-1', 'assets/heat-zone-1.png');
    this.load.image('heat-zone-2', 'assets/heat-zone-2.png');
    this.load.image('heat-zone-3', 'assets/heat-zone-3.png');
    this.load.image('heatwave', 'assets/heatwave.png');
  }

  create() {
    this.createBegitxoSpritesheet();
    this.generatePlaceholderTextures();
    this.scene.start('Game');
  }

  createBegitxoSpritesheet() {
    const source = this.textures.get('begitxo-source').getSourceImage();
    const texture = this.textures.createCanvas('player', source.width, source.height);
    const context = texture.context;
    const frameWidth = source.width / 3;
    const frameHeight = source.height / 2;

    // Los dos dibujos de carrera no comparten centro ni linea de suelo en
    // el arte original. Los realineamos dentro de sus celdas para evitar
    // que Begitxo tiemble hacia los lados al alternarlos.
    const frameOffsets = [
      { x: 0, y: 0 },
      { x: 18, y: -14 },
      { x: 78, y: 0 },
      { x: -17, y: 36 },
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ];
    frameOffsets.forEach((offset, frame) => {
      const sourceX = (frame % 3) * frameWidth;
      const sourceY = Math.floor(frame / 3) * frameHeight;
      context.drawImage(
        source,
        sourceX,
        sourceY,
        frameWidth,
        frameHeight,
        sourceX + offset.x,
        sourceY + offset.y,
        frameWidth,
        frameHeight
      );
    });

    for (let frame = 0; frame < 6; frame += 1) {
      texture.add(frame, 0, (frame % 3) * frameWidth, Math.floor(frame / 3) * frameHeight, frameWidth, frameHeight);
    }
    texture.refresh();
  }

  // Genera texturas de un solo color para poder jugar y probar la logica
  // del juego antes de tener arte definitivo. Sustituir por load.image/
  // load.spritesheet cuando llegue el arte final.
  generatePlaceholderTextures() {
    const g = this.add.graphics();

    g.fillStyle(0xe74c3c, 1);
    g.fillRect(0, 0, 64, 64);
    g.generateTexture('enemy', 64, 64);
    g.clear();

    // Chorro de la pistola de agua: el mismo palito de antes, pero azul.
    g.fillStyle(0x1976d2, 1);
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
