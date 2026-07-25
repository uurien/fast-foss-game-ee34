import Phaser from 'phaser';
import Player from '../entities/Player.js';
import HeatWave from '../entities/HeatWave.js';
import FireStorm from '../entities/FireStorm.js';
import Eguzkitzarra from '../entities/Eguzkitzarra.js';
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
  PLAYER_MAX_HEALTH,
  BOSS_MAX_HEALTH,
  BOSS_TRIGGER_X,
  BOSS_MAX_STORMS
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

    const { platforms, enemySpawns, heatZones, goal, boss } = buildLevel(this);
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

    this.bossStorms = this.physics.add.group();
    this.bossDefeated = false;
    this.boss = new Eguzkitzarra(this, boss.x, boss.y);
    this.bossStormGroundY = boss.stormGroundY;

    this.heatZoneRects = heatZones.map(
      (zone) => new Phaser.Geom.Rectangle(zone.x - zone.width / 2, zone.y - zone.height / 2, zone.width, zone.height)
    );
    heatZones.forEach((zone) => {
      // Una sola rejilla continua cubre el tramo completo de la zona. En el
      // frame, el borde superior visible empieza 10 px por encima del centro;
      // situar el sprite 6 px sobre el centro de la baldosa deja ese borde
      // exactamente a ras de la superficie que pisa Begitxo (y = 508).
      this.add
        .sprite(zone.x, zone.y - 6, 'hot-air-vent')
        .setDisplaySize(zone.width, 64)
        .setDepth(1)
        .play('hot-air-vent-blow');
    });
    this.nextHeatZoneDamageAt = 0;

    // Objetivo del nivel: la heladeria al final del recorrido. Tocarla gana
    // la partida.
    this.goal = this.physics.add.staticImage(goal.x, goal.y, 'heladeria').setDepth(2);
    this.goal.setVisible(false).setAlpha(0);
    this.goal.body.enable = false;

    this.arenaColumns = this.physics.add.staticGroup();
    [boss.arenaEntranceX, boss.arenaExitX].forEach((x) => {
      const column = this.arenaColumns
        // La hoja conserva 33-34 px transparentes bajo la base de la llama.
        // Escalada a 620 px son unos 29 px: anclar el lienzo casi al borde
        // inferior coloca el fuego visible exactamente sobre el asfalto.
        .create(x, GAME_HEIGHT + 7, 'boss-fire-column', 0)
        .setOrigin(0.5, 1)
        .setDisplaySize(92, 620)
        .setDepth(7)
        .refreshBody()
        .setVisible(false);
      column.body.enable = false;
      column.play('boss-fire-column-burn');
    });

    this.physics.add.collider(this.player, this.platforms);
    // Los tornados mantienen su base fijada al asfalto y no necesitan un
    // colisionador con el suelo, que podria expulsarlos en las uniones.
    this.physics.add.collider(this.bullets, this.platforms, (bullet) => this.deactivateBullet(bullet));
    this.physics.add.collider(this.player, this.arenaColumns);
    this.physics.add.collider(this.bossStorms, this.platforms, (storm) => storm.land());

    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => this.onBulletHitsEnemy(bullet, enemy));
    this.physics.add.overlap(this.bullets, this.bossStorms, (bullet, storm) => this.onBulletHitsEnemy(bullet, storm));
    // Cuando uno de los dos lados es un objeto suelto (no un grupo), Arcade
    // Physics invierte el orden de los argumentos del callback respecto al
    // orden en que se registraron aqui (los pasa como sprite-suelto,
    // miembro-del-grupo). Comprobamos pertenencia al grupo en vez de fiarnos
    // de la posicion: si no, "bullet"/"enemy" reciben en realidad al jefe o
    // al jugador y se les aplica deactivateBullet()/daño por error.
    this.physics.add.overlap(this.bullets, this.boss, (a, b) => {
      this.onBulletHitsBoss(this.bullets.contains(a) ? a : b);
    });
    this.physics.add.collider(this.player, this.enemies, (a, b) => {
      this.onPlayerTouchesEnemy(this.enemies.contains(a) ? a : b);
    });
    this.physics.add.overlap(this.player, this.bossStorms, (a, b) => {
      this.onPlayerTouchesEnemy(this.bossStorms.contains(a) ? a : b);
    });
    this.physics.add.overlap(this.player, this.boss, () => this.damagePlayer(PLAYER_TOUCH_DAMAGE, this.time.now));
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
    if (!this.boss.awake && this.player.x >= BOSS_TRIGGER_X) this.startBossFight(time);
    if (this.boss.active) this.boss.update(time);
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) enemy.update(time);
    });
    this.bossStorms.getChildren().forEach((storm) => {
      if (storm.active) storm.update(time);
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
    const panelWidth = GAME_WIDTH;
    // Las versiones blend llevan 128 px de fundido en una fuente de 1672
    // px. Escalado al viewport son unos 74 px por borde. El solape debe
    // cubrir los dos fundidos: asi siempre hay un panel completamente opaco
    // bajo el que se desvanece y no se transparenta la capa inferior.
    const backgroundOverlap = 148;
    const backgroundPanelStep = panelWidth - backgroundOverlap;

    this.add
      .image(0, 0, 'city-sky')
      .setOrigin(0)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setScrollFactor(0)
      .setDepth(-40);

    this.addParallaxStrip({
      keys: ['city-distant-a', 'city-distant-b'],
      scrollFactor: 0.15,
      depth: -30,
      y: 0,
      panelWidth,
      panelStep: backgroundPanelStep
    });

    this.addParallaxStrip({
      keys: ['city-mid-a', 'city-mid-b', 'city-mid-b', 'city-mid-a'],
      scrollFactor: 0.4,
      depth: -20,
      y: 0,
      panelWidth,
      panelStep: backgroundPanelStep
    });

    // Una sola textura cubre todo el nivel para evitar repeticiones y
    // costuras creadas en tiempo de ejecucion.
    const foreground = this.add
      .image(0, 0, 'city-foreground-full')
      .setOrigin(0)
      .setDisplaySize(LEVEL_WIDTH, 620)
      .setScrollFactor(1)
      .setDepth(-10);
    const foregroundCropHeight = Math.ceil(
      foreground.height * ((GAME_HEIGHT - 32) / 620)
    );
    foreground.setCrop(0, 0, foreground.width, foregroundCropHeight);
  }

  addParallaxStrip({
    keys,
    scrollFactor,
    depth,
    y,
    panelWidth,
    panelHeight = GAME_HEIGHT,
    cropBottomAt = null,
    alternateFlip = true,
    panelStep
  }) {
    const cameraTravel = Math.max(0, LEVEL_WIDTH - GAME_WIDTH);
    const visibleTravel = cameraTravel * scrollFactor;
    const panelCount = Math.ceil((visibleTravel + GAME_WIDTH) / panelStep) + 1;
    const edgeFeather = 74;

    for (let index = 0; index < panelCount; index += 1) {
      const image = this.add
        // El primer fundido queda fuera del viewport; asi no aparece una
        // franja transparente al inicio del nivel.
        .image(index * panelStep - edgeFeather, y, keys[index % keys.length])
        .setOrigin(0)
        .setDisplaySize(panelWidth, panelHeight)
        .setScrollFactor(scrollFactor)
        .setDepth(depth);

      // Alternar la orientacion reduce aun mas la repeticion sin cambiar la
      // altura de las bandas de suelo ni el ancho del solape.
      image.setFlipX(alternateFlip && index % 2 === 1);

      if (cropBottomAt !== null) {
        const sourceCropHeight = Math.ceil(image.height * ((cropBottomAt - y) / panelHeight));
        image.setCrop(0, 0, image.width, sourceCropHeight);
      }
    }
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

    this.bossHud = this.add.container(GAME_WIDTH / 2, 22)
      .setScrollFactor(0)
      .setDepth(12)
      .setVisible(false);
    this.bossBarBack = this.add.rectangle(0, 0, 330, 18, 0x28172d, 0.95)
      .setStrokeStyle(3, 0xffd85a);
    this.bossBarFill = this.add.rectangle(-160, 0, 320, 10, 0xf05245)
      .setOrigin(0, 0.5);
    this.bossName = this.add.text(0, 17, 'EGUZKITZARRA', {
      fontFamily: 'monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fff2ce'
    }).setOrigin(0.5, 0);
    this.bossHealthText = this.add.text(0, -1, `${BOSS_MAX_HEALTH} / ${BOSS_MAX_HEALTH}`, {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#fff2ce'
    }).setOrigin(0.5);
    this.bossHud.add([this.bossBarBack, this.bossBarFill, this.bossName, this.bossHealthText]);

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

  startBossFight(time) {
    this.boss.awaken(time);
    this.bossHud.setVisible(true);
    this.arenaColumns.getChildren().forEach((column) => {
      column.setVisible(true);
      column.body.enable = true;
    });
  }

  launchBossStorms(count) {
    const available = BOSS_MAX_STORMS - this.bossStorms.countActive(true);
    const launchCount = Math.min(count, available);
    if (launchCount <= 0) return;

    const offsets = launchCount === 1 ? [0] : [-120, 0, 120];
    for (let index = 0; index < launchCount; index += 1) {
      const targetX = Phaser.Math.Clamp(this.player.x + offsets[index], 6080, 6860);
      const storm = new FireStorm(
        this,
        this.boss.x - 45,
        this.boss.y - 55,
        targetX,
        this.bossStormGroundY
      );
      this.bossStorms.add(storm);
    }
  }

  onBulletHitsBoss(bullet) {
    if (!bullet.active || !this.boss.active) return;

    this.deactivateBullet(bullet);
    const result = this.boss.takeDamage(BULLET_DAMAGE);
    if (!result.hit) {
      this.cameras.main.shake(70, 0.002);
      return;
    }

    const healthFraction = Phaser.Math.Clamp(this.boss.health / BOSS_MAX_HEALTH, 0, 1);
    this.bossBarFill.setScale(healthFraction, 1);
    this.bossHealthText.setText(`${this.boss.health} / ${BOSS_MAX_HEALTH}`);
    if (!result.died) return;

    this.finishBossFight();
  }

  finishBossFight() {
    if (this.bossDefeated) return;

    this.score += 100;
    this.bossDefeated = true;
    this.bossHud.setVisible(false);
    this.arenaColumns.getChildren().forEach((column) => {
      column.setVisible(false);
      column.body.enable = false;
    });

    // La recompensa se activa antes de destruir sprites o grupos. Asi una
    // eventual animacion o callback de muerte nunca puede impedir que la
    // heladeria aparezca y pueda tocarse.
    this.goal.setVisible(true);
    this.goal.body.enable = true;
    this.tweens.add({ targets: this.goal, alpha: 1, duration: 650, ease: 'Sine.Out' });
    this.bossStorms.clear(true, true);
    this.cameras.main.flash(450, 184, 244, 255);
    this.updateHUD();

    this.tweens.killTweensOf(this.boss);
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scaleX: this.boss.scaleX * 0.72,
      scaleY: this.boss.scaleY * 0.72,
      duration: 480,
      ease: 'Back.In',
      onComplete: () => this.boss.destroy()
    });
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
      this.player.setVelocity(0, 0);
      this.player.play('begitxo-idle', true);
      this.physics.pause();
      this.showEndPopup('game-over');
    }
    return died;
  }

  onReachGoal() {
    if (this.isRestarting || this.hasWon || !this.bossDefeated) return;

    this.hasWon = true;
    this.player.setVelocity(0, 0);
    this.player.play('begitxo-idle', true);
    this.physics.pause();

    this.showEndPopup('congrats');
  }

  showEndPopup(type) {
    const isCongrats = type === 'congrats';
    const colors = {
      ink: 0x28172d,
      cream: 0xfff2ce,
      coral: 0xf05245,
      orange: 0xff9a48,
      yellow: 0xffd85a,
      blue: 0x24a8cf
    };

    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, colors.ink, 0.72)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(30)
      .setInteractive();

    const popup = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2)
      .setScrollFactor(0)
      .setDepth(31)
      .setScale(0.82)
      .setAlpha(0);

    const shadow = this.add.rectangle(8, 10, 570, 360, colors.ink, 0.78);
    const panel = this.add.rectangle(0, 0, 570, 360, colors.cream)
      .setStrokeStyle(6, isCongrats ? colors.yellow : colors.coral);
    const ribbon = this.add.rectangle(0, -126, 510, 74, isCongrats ? colors.blue : colors.coral)
      .setStrokeStyle(4, colors.ink);
    const eyebrow = this.add.text(0, -73, isCongrats ? 'META ALCANZADA' : 'FIN DE LA PARTIDA', {
      fontFamily: 'monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#28172d',
      letterSpacing: 2
    }).setOrigin(0.5);
    const title = this.add.text(0, -128, isCongrats ? 'ZORIONAK!' : 'GAME OVER', {
      fontFamily: 'sans-serif',
      fontSize: isCongrats ? '48px' : '50px',
      fontStyle: 'bold',
      color: '#fff2ce',
      stroke: '#28172d',
      strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 4, color: isCongrats ? '#f05245' : '#ff9a48', blur: 0, fill: true }
    }).setOrigin(0.5);
    const message = this.add.text(
      0,
      -27,
      isCongrats
        ? '¡Begitxo ha llegado a la heladería!\nEl verano ya sabe un poco mejor.'
        : 'El calor ha podido con Begitxo.\nToma aire y vuelve a intentarlo.',
      {
        fontFamily: 'monospace',
        fontSize: '19px',
        color: '#28172d',
        align: 'center',
        lineSpacing: 7
      }
    ).setOrigin(0.5);
    const score = this.add.text(0, 47, `PUNTOS  ${this.score}`, {
      fontFamily: 'sans-serif',
      fontSize: '21px',
      fontStyle: 'bold',
      color: isCongrats ? '#167f9e' : '#c64036'
    }).setOrigin(0.5);
    const retryText = this.add.text(0, 122, 'PULSA ENTER PARA REINTENTAR', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#28172d'
    }).setOrigin(0.5);

    popup.add([shadow, panel, ribbon, eyebrow, title, message, score, retryText]);
    this.tweens.add({
      targets: popup,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 260,
      ease: 'Back.Out'
    });
    this.tweens.add({
      targets: retryText,
      alpha: 0.38,
      duration: 720,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });

    this.input.keyboard.once('keydown-ENTER', () => this.scene.restart());
  }

  deactivateBullet(bullet) {
    if (!bullet?.active) return;

    bullet.setVelocity(0, 0);
    bullet.setActive(false).setVisible(false);
    bullet.body.enable = false;
  }
}
