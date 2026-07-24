import Phaser from 'phaser';
import Player from '../entities/Player.js';
import HeatWave from '../entities/HeatWave.js';
import { buildLevel } from '../entities/Platforms.js';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  LEVEL_WIDTH,
  PLAYER_TOUCH_DAMAGE,
  BULLET_DAMAGE,
  WATER_GUN_RANGE,
  HEAT_ZONE_SLOW_FACTOR,
  HEAT_ZONE_DAMAGE_PER_TICK,
  HEAT_ZONE_TICK_MS,
  PLAYER_MAX_HEALTH
} from '../config.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.isRestarting = false;
    this.hasWon = false;
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT);

    this.drawBackground();

    const { platforms, enemySpawns, heatZones, goal } = buildLevel(this);
    this.platforms = platforms;

    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 40,
      allowGravity: false
    });

    this.player = new Player(this, 100, GAME_HEIGHT - 150, this.bullets);
    this.player.setDepth(2);

    this.enemies = this.physics.add.group();
    enemySpawns.forEach((spawn) => {
      const enemy = new HeatWave(
        this,
        spawn.x,
        spawn.y,
        spawn.minX,
        spawn.maxX,
        spawn.speed
      );
      enemy.setDepth(2);
      this.enemies.add(enemy);
    });

    this.heatZoneRects = heatZones.map(
      (zone) => new Phaser.Geom.Rectangle(zone.x - zone.width / 2, zone.y - zone.height / 2, zone.width, zone.height)
    );
    heatZones.forEach((zone) => {
      // Una variante por baldosa evita que los tres tramos repitan el mismo
      // dibujo. Comparten centro y tamano con las tablas del suelo, de modo
      // que actuan como decal por encima de la madera.
      const startX = zone.x - zone.width / 2;
      for (let offset = 0; offset < zone.width; offset += 64) {
        const variant = (offset / 64) % 3;
        // El decal es ligeramente mas alto que la baldosa y se desplaza dos
        // pixeles hacia abajo para ajustar visualmente su linea de suelo.
        this.add
          .image(startX + offset + 32, zone.y + 2, `heat-zone-${variant + 1}`)
          .setDisplaySize(64, 36)
          .setDepth(1);
      }
    });
    this.nextHeatZoneDamageAt = 0;

    // Objetivo del nivel: la heladeria al final del recorrido. Tocarla gana
    // la partida.
    this.goal = this.physics.add.staticImage(goal.x, goal.y, 'heladeria').setDepth(2);

    this.physics.add.collider(this.player, this.platforms);
    // Los tornados flotan en un carril fijo y no necesitan apoyo fisico de
    // las plataformas; el colisionador podia expulsarlos en las uniones.
    this.physics.add.collider(this.bullets, this.platforms, (bullet) => this.deactivateBullet(bullet));

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => this.onBulletHitsEnemy(bullet, enemy));
    this.physics.add.collider(this.player, this.enemies, (player, enemy) => this.onPlayerTouchesEnemy(enemy));
    this.physics.add.overlap(this.player, this.goal, () => this.onReachGoal());

    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.score = 0;
    this.createHUD();
  }

  update(time) {
    if (this.isRestarting || this.hasWon) return;

    this.updateHeatZones(time);
    this.player.update(time);
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) enemy.update(time);
    });

    this.bullets.getChildren().forEach((bullet) => {
      const outOfRange = Math.abs(bullet.x - bullet.spawnX) > WATER_GUN_RANGE;
      if (bullet.active && (bullet.x < 0 || bullet.x > LEVEL_WIDTH || outOfRange)) {
        this.deactivateBullet(bullet);
      }
    });
  }

  updateHeatZones(time) {
    // getBounds() incluye toda la celda visual del spritesheet, con bastante
    // espacio transparente alrededor de Begitxo. El cuerpo Arcade refleja la
    // zona fisica real y evita recibir dano antes de tocar el suelo caliente.
    const body = this.player.body;
    const bounds = new Phaser.Geom.Rectangle(body.x, body.y, body.width, body.height);
    const inZone = this.heatZoneRects.some((zone) => Phaser.Geom.Intersects.RectangleToRectangle(bounds, zone));

    this.player.speedMultiplier = inZone ? HEAT_ZONE_SLOW_FACTOR : 1;

    if (inZone && time >= this.nextHeatZoneDamageAt) {
      this.nextHeatZoneDamageAt = time + HEAT_ZONE_TICK_MS;
      this.damagePlayer(HEAT_ZONE_DAMAGE_PER_TICK, time);
    }
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
    this.add
      .image(12, 12, 'health-bar-clean')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(10);

    this.burnedHealthBar = this.add
      .image(12, 12, 'health-bar-burned')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(11);

    this.scoreText = this.add
      .text(GAME_WIDTH - 16, 16, '', { fontSize: '20px', fontFamily: 'monospace', color: '#ffffff' })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);

    this.updateHUD();
  }

  updateHUD() {
    this.drawHealthBar();
    this.scoreText.setText(`${this.score}`);
  }

  drawHealthBar() {
    const burnedFraction = Phaser.Math.Clamp(1 - this.player.health / PLAYER_MAX_HEALTH, 0, 1);
    const iconWidth = 34;
    const cellsWidth = this.burnedHealthBar.width - iconWidth;
    const burnedWidth = Math.round(iconWidth + cellsWidth * burnedFraction);

    this.burnedHealthBar.setVisible(burnedFraction > 0);
    if (burnedFraction > 0) {
      this.burnedHealthBar.setCrop(0, 0, burnedWidth, this.burnedHealthBar.height);
    }
  }

  onBulletHitsEnemy(bullet, enemy) {
    // Una bala puede solaparse con varios cuerpos durante el mismo paso de
    // fisicas. Solo el primer impacto debe causar dano y dar puntos.
    if (!bullet.active || !enemy.active) return;

    this.deactivateBullet(bullet);
    const died = enemy.takeDamage(BULLET_DAMAGE);
    if (died) {
      this.score += 10;
      this.updateHUD();
    }
  }

  onPlayerTouchesEnemy(enemy) {
    if (this.isRestarting || !enemy.active) return;

    this.damagePlayer(PLAYER_TOUCH_DAMAGE, this.time.now);
  }

  // Punto unico de dano al jugador: aplica la vida, refresca el HUD y
  // arranca el reinicio si muere. Lo usan tanto el contacto con enemigos
  // como los proyectiles de calor y las zonas de calor.
  damagePlayer(amount, time) {
    const died = this.player.takeDamage(amount, time);
    this.updateHUD();
    if (died) {
      this.isRestarting = true;
      this.physics.pause();
      this.time.delayedCall(150, () => this.scene.restart());
    }
    return died;
  }

  onReachGoal() {
    if (this.isRestarting || this.hasWon) return;

    this.hasWon = true;
    this.player.setVelocity(0, 0);
    this.player.play('begitxo-idle', true);
    this.physics.pause();

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '¡Begitxo llega a la heladeria!\n¡Nivel completado!', {
        fontSize: '28px',
        fontFamily: 'monospace',
        color: '#ffffff',
        align: 'center'
      })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(20);
  }

  deactivateBullet(bullet) {
    if (!bullet?.active) return;

    bullet.setVelocity(0, 0);
    bullet.setActive(false).setVisible(false);
    bullet.body.enable = false;
  }
}
