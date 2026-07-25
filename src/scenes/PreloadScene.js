import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.image('city-sky', 'assets/city-parallax/layer-01-sky-sun.png');
    this.load.image('city-distant-a', 'assets/city-parallax/layer-02-distant-buildings-blend.png');
    this.load.image('city-distant-b', 'assets/city-parallax/layer-02-distant-buildings-b-blend.png');
    this.load.image('city-mid-a', 'assets/city-parallax/layer-03-mid-buildings-blend.png');
    this.load.image('city-mid-b', 'assets/city-parallax/layer-03-mid-buildings-b-blend.png');
    this.load.image('city-foreground-full', 'assets/city-parallax/layer-04-foreground-full-7200-v3.png');
    this.load.image('begitxo-source', 'assets/begitxo-poses-6-green.png');
    this.load.spritesheet('hot-air-vent', 'assets/hazards/hot-air-vent-wide-6x192.png', {
      frameWidth: 192,
      frameHeight: 64
    });
    this.load.image('health-bar-clean', 'assets/health-bar-clean.png');
    this.load.image('health-bar-burned', 'assets/health-bar-burned.png');
    this.load.image('heladeria', 'assets/heladeria-begitxo.png');
    this.load.image('eguzkitzarra', 'assets/eguzkitzarra-boss-concept-v3.png');
    this.load.image('obstacle-crate', 'assets/obstacles/crate-03.png');
    this.load.image('obstacle-container', 'assets/obstacles/container-04-large.png');
    this.load.spritesheet('heatwave', 'assets/fire-tornado-spin-6x64.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('boss-fire-column', 'assets/boss-fire-columns-6x341.png', {
      frameWidth: 341,
      frameHeight: 724
    });
  }

  create() {
    this.createBegitxoSpritesheet();
    this.createHeatWaveAnimation();
    this.createBossFireColumnAnimation();
    this.createHotAirVentAnimation();
    this.generatePlaceholderTextures();
    this.scene.start('Title');
  }

  createHeatWaveAnimation() {
    this.anims.create({
      key: 'heatwave-spin',
      frames: this.anims.generateFrameNumbers('heatwave', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: -1
    });
  }

  createBossFireColumnAnimation() {
    this.anims.create({
      key: 'boss-fire-column-burn',
      frames: this.anims.generateFrameNumbers('boss-fire-column', { start: 0, end: 5 }),
      frameRate: 9,
      repeat: -1
    });
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

    // Suelo continuo de la calle. Esta textura se repite en todas las
    // celdas fisicas para que las juntas del pavimento mantengan siempre
    // el mismo angulo, independientemente del panel de fachadas situado
    // detras. Los extremos izquierdo y derecho son compatibles.
    g.fillStyle(0x9a6445, 1);
    g.fillRect(0, 0, 64, 17);
    g.fillStyle(0x6f4638, 1);
    g.fillRect(0, 17, 64, 7);
    g.fillStyle(0x292830, 1);
    g.fillRect(0, 24, 64, 8);

    g.lineStyle(1, 0x5c3c35, 1);
    g.lineBetween(0, 16, 64, 16);
    g.lineBetween(0, 23, 64, 23);
    // Dos juntas inclinadas por baldosa. Al repetirse conservan pendiente,
    // ritmo y punto de encuentro en todos los cambios de imagen.
    g.lineBetween(18, 0, 14, 16);
    g.lineBetween(50, 0, 46, 16);
    g.lineStyle(1, 0xb87b52, 0.7);
    g.lineBetween(0, 1, 64, 1);
    g.generateTexture('street-ground', 64, 32);
    g.clear();

    g.destroy();
  }

  createHotAirVentAnimation() {
    this.anims.create({
      key: 'hot-air-vent-blow',
      frames: this.anims.generateFrameNumbers('hot-air-vent', { start: 0, end: 5 }),
      frameRate: 7,
      repeat: -1
    });
  }
}
