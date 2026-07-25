import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const COLORS = {
  ink: 0x28172d,
  cream: 0xfff2ce,
  coral: 0xf05245,
  orange: 0xff9a48,
  yellow: 0xffd85a,
  blue: 0x24a8cf
};

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.hasStarted = false;
    this.drawBackdrop();
    this.drawTitle();
    this.drawStartButton();
    this.drawFooter();

    this.input.keyboard.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
  }

  drawBackdrop() {
    this.add.image(0, 0, 'city-sky').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    this.add.image(0, 0, 'city-distant-a').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setAlpha(0.84);
    this.add.image(0, 12, 'city-mid-b').setOrigin(0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setAlpha(0.9);

    const shade = this.add.graphics();
    shade.fillGradientStyle(0x3c1e3f, 0x3c1e3f, 0xf05245, 0xf05245, 0.06, 0.06, 0.28, 0.28);
    shade.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    shade.fillStyle(COLORS.ink, 0.86);
    shade.fillRect(0, 435, GAME_WIDTH, 105);

    this.add
      .image(126, 363, 'player', 0)
      .setScale(0.66)
      .setFlipX(true)
      .setOrigin(0.5, 0.72);

    const heat = this.add.graphics();
    [0, 1, 2].forEach((index) => {
      heat.lineStyle(3, COLORS.cream, 0.42 - index * 0.1);
      const y = 70 + index * 21;
      const curve = new Phaser.Curves.CubicBezier(
        new Phaser.Math.Vector2(36, y),
        new Phaser.Math.Vector2(52, y - 10),
        new Phaser.Math.Vector2(66, y + 10),
        new Phaser.Math.Vector2(82, y)
      );
      heat.strokePoints(curve.getPoints(20), false);
    });
  }

  drawTitle() {
    this.add
      .text(GAME_WIDTH / 2, 65, 'BEGITXO IZOZKI BILA', {
        fontFamily: 'sans-serif',
        fontSize: '61px',
        fontStyle: 'bold',
        color: '#fff2ce',
        stroke: '#28172d',
        strokeThickness: 12,
        shadow: { offsetX: 5, offsetY: 6, color: '#f05245', blur: 0, fill: true }
      })
      .setOrigin(0.5);

  }

  drawStartButton() {
    const button = this.add.container(GAME_WIDTH / 2, 318);
    const shadow = this.add.rectangle(5, 8, 270, 72, COLORS.ink, 0.72).setOrigin(0.5);
    const face = this.add.rectangle(0, 0, 270, 72, COLORS.coral).setOrigin(0.5).setStrokeStyle(4, COLORS.cream);
    const label = this.add
      .text(0, -1, 'EMPEZAR', {
        fontFamily: 'sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#fff2ce'
      })
      .setOrigin(0.5);

    button.add([shadow, face, label]);
    button.setSize(270, 72).setInteractive({ useHandCursor: true });
    button.on('pointerover', () => {
      face.setFillStyle(COLORS.orange);
      this.tweens.add({ targets: button, scaleX: 1.04, scaleY: 1.04, duration: 90 });
    });
    button.on('pointerout', () => {
      face.setFillStyle(COLORS.coral);
      this.tweens.add({ targets: button, scaleX: 1, scaleY: 1, duration: 90 });
    });
    button.on('pointerdown', () => this.startGame());

    this.add
      .text(GAME_WIDTH / 2, 372, 'PULSA ENTER', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#fff2ce'
      })
      .setOrigin(0.5)
      .setAlpha(0.82);
  }

  drawFooter() {
    this.add
      .text(26, 483, '← →  MOVER     ↑  SALTAR     ESPACIO  DISPARAR', {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#fff2ce'
      })
      .setOrigin(0, 0.5);

    this.add
      .text(GAME_WIDTH - 24, 483, 'FAST FOSS GAME · EE34', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffd85a'
      })
      .setOrigin(1, 0.5);
  }

  startGame() {
    if (this.hasStarted) return;
    this.hasStarted = true;
    this.cameras.main.fadeOut(220, 40, 23, 45);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Game'));
  }
}
