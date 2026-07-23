import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import { buildLevel } from '../entities/Platforms.js';
import { GAME_HEIGHT, LEVEL_WIDTH, PLAYER_TOUCH_DAMAGE, BULLET_DAMAGE } from '../config.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT);

    this.drawBackground();

    const { platforms, enemySpawns } = buildLevel(this);
    this.platforms = platforms;

    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 40,
      allowGravity: false
    });

    this.player = new Player(this, 100, GAME_HEIGHT - 150, this.bullets);

    this.enemies = this.physics.add.group();
    enemySpawns.forEach((spawn) => {
      const enemy = new Enemy(this, spawn.x, spawn.y, spawn.minX, spawn.maxX, spawn.speed);
      this.enemies.add(enemy);
    });

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.bullets, this.platforms, (bullet) => this.deactivateBullet(bullet));

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => this.onBulletHitsEnemy(bullet, enemy));
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => this.onPlayerTouchesEnemy(enemy));

    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.score = 0;
    this.createHUD();
  }

  update(time) {
    this.player.update(time);
    this.enemies.getChildren().forEach((enemy) => enemy.update());

    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.active && (bullet.x < 0 || bullet.x > LEVEL_WIDTH)) {
        this.deactivateBullet(bullet);
      }
    });
  }

  drawBackground() {
    // Fondo de "ola de calor": degradado naranja/rojo con sol, de fondo
    // provisional hasta tener arte definitivo del tema.
    const g = this.add.graphics();
    g.fillGradientStyle(0xffb347, 0xffb347, 0xff5e62, 0xff5e62, 1);
    g.fillRect(0, 0, LEVEL_WIDTH, GAME_HEIGHT);
    g.setScrollFactor(0.3);

    const sun = this.add.circle(150, 100, 50, 0xfff176, 1);
    sun.setScrollFactor(0.3);
  }

  createHUD() {
    this.healthText = this.add
      .text(16, 16, '', { fontSize: '20px', fontFamily: 'monospace', color: '#ffffff' })
      .setScrollFactor(0)
      .setDepth(10);

    this.scoreText = this.add
      .text(16, 40, '', { fontSize: '20px', fontFamily: 'monospace', color: '#ffffff' })
      .setScrollFactor(0)
      .setDepth(10);

    this.updateHUD();
  }

  updateHUD() {
    this.healthText.setText(`Vida: ${this.player.health}`);
    this.scoreText.setText(`Puntos: ${this.score}`);
  }

  onBulletHitsEnemy(bullet, enemy) {
    this.deactivateBullet(bullet);
    const died = enemy.takeDamage(BULLET_DAMAGE);
    if (died) {
      this.score += 10;
      this.updateHUD();
    }
  }

  onPlayerTouchesEnemy(enemy) {
    const died = this.player.takeDamage(PLAYER_TOUCH_DAMAGE, this.time.now);
    this.updateHUD();
    if (died) {
      this.scene.restart();
    }
  }

  deactivateBullet(bullet) {
    bullet.setActive(false).setVisible(false);
    bullet.body.enable = false;
  }
}
