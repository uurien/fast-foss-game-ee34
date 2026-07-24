import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.image('begitxo-source', 'assets/begitxo-poses-6-green.png');
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

    // Alinea las cuatro poses terrestres por la planta de los pies. El salto
    // conserva su posicion vertical para que siga leyendose como una pose en
    // el aire. Sin esta correccion el frame 3 queda 18 px por encima del resto
    // y el personaje parece flotar al correr.
    const frameOffsetY = [2, 0, 1, 19, 0, 0];
    frameOffsetY.forEach((offsetY, frame) => {
      const sourceX = (frame % 3) * frameWidth;
      const sourceY = Math.floor(frame / 3) * frameHeight;
      context.drawImage(
        source,
        sourceX,
        sourceY,
        frameWidth,
        frameHeight,
        sourceX,
        sourceY + offsetY,
        frameWidth,
        frameHeight
      );
    });

    // La hoja se entrega sobre fondo verde para poder usarlo como croma.
    // Se elimina al vuelo y se reduce el verde de los pixeles del borde para
    // evitar un halo alrededor de los contornos suavizados.
    const imageData = context.getImageData(0, 0, source.width, source.height);
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
      const red = pixels[i];
      const green = pixels[i + 1];
      const blue = pixels[i + 2];
      const greenExcess = green - Math.max(red, blue);
      if (greenExcess <= 12) continue;

      const opacity = 1 - Math.min(1, (greenExcess - 12) / 100);
      pixels[i + 1] = Math.min(green, Math.max(red, blue));
      pixels[i + 3] = Math.round(pixels[i + 3] * opacity);
    }
    context.putImageData(imageData, 0, 0);

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
