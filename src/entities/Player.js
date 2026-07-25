import Phaser from 'phaser';
import {
  PLAYER_SPEED,
  JUMP_VELOCITY,
  PLAYER_MAX_HEALTH,
  PLAYER_INVULNERABLE_MS,
  WATER_GUN_SPEED_X,
  WATER_GUN_LAUNCH_VY,
  FIRE_COOLDOWN_MS
} from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, bulletGroup) {
    super(scene, x, y, 'player', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.28);
    this.setCollideWorldBounds(true);
    this.setBounce(0.05);
    this.body.setSize(190, 390);
    // La base del cuerpo fisico coincide con la linea de pies (y = 433) de
    // los frames terrestres de la hoja 512x512.
    this.body.setOffset(161, 43);

    this.bullets = bulletGroup;
    this.health = PLAYER_MAX_HEALTH;
    this.facing = 1;
    this.invulnerableUntil = 0;
    this.nextShotAt = 0;
    this.waterGun = scene.add
      .image(x, y, 'water-gun')
      .setDisplaySize(32, 25)
      .setDepth(3)
      .setVisible(false);
    this.waterGunHideTimer = null;
    // Multiplicador de velocidad; las zonas de calor lo bajan mientras se
    // pisan (ver GameScene.updateHeatZones). Se recalcula cada frame, no hace
    // falta restaurarlo aqui salvo el valor inicial.
    this.speedMultiplier = 1;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys('W,A,S,D,SPACE,X');

    this.createAnimations();
  }

  createAnimations() {
    if (!this.scene.anims.exists('begitxo-idle')) {
      this.scene.anims.create({
        key: 'begitxo-idle',
        frames: [{ key: 'player', frame: 0 }],
        frameRate: 1,
        repeat: -1
      });
      this.scene.anims.create({
        key: 'begitxo-run',
        frames: [
          { key: 'player', frame: 2 },
          { key: 'player', frame: 5 },
          { key: 'player', frame: 3 },
          { key: 'player', frame: 5 }
        ],
        frameRate: 10,
        repeat: -1
      });
      this.scene.anims.create({
        key: 'begitxo-jump',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 1
      });
    }

    this.play('begitxo-idle');
  }

  update(time) {
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const jump = this.cursors.up.isDown || this.keys.W.isDown;
    const shoot = this.keys.X.isDown || this.keys.SPACE.isDown || this.scene.input.activePointer.isDown;

    const speed = PLAYER_SPEED * this.speedMultiplier;

    if (left) {
      this.setVelocityX(-speed);
      this.facing = -1;
      this.setFlipX(true);
    } else if (right) {
      this.setVelocityX(speed);
      this.facing = 1;
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    if (jump && this.body.blocked.down) {
      this.setVelocityY(JUMP_VELOCITY);
    }

    if (shoot && time > this.nextShotAt) {
      this.shoot();
      this.nextShotAt = time + FIRE_COOLDOWN_MS;
    }

    if (this.waterGun.visible) this.updateWaterGunTransform();

    if (!this.body.blocked.down) {
      this.play('begitxo-jump', true);
    } else if (left || right) {
      this.play('begitxo-run', true);
    } else {
      this.play('begitxo-idle', true);
    }
  }

  shoot() {
    if (!this.bullets) return;

    this.showWaterGun();
    const spawnX = this.waterGun.x + this.facing * (this.waterGun.displayWidth * 0.48);
    const spawnY = this.waterGun.y - this.waterGun.displayHeight * 0.05;
    const bullet = this.bullets.get(spawnX, spawnY, 'bullet');
    if (!bullet) return;

    // Al reutilizar una bala del pool hay que sincronizar tambien su cuerpo
    // fisico; setActive/setVisible no eliminan su posicion anterior.
    bullet.body.reset(spawnX, spawnY);
    bullet.setActive(true).setVisible(true);
    bullet.body.enable = true;
    // El chorro de agua cae en parabola: se deja que la gravedad del mundo
    // actue sobre el en vez de volar en linea recta como las balas.
    bullet.body.allowGravity = true;
    bullet.setVelocity(this.facing * WATER_GUN_SPEED_X, WATER_GUN_LAUNCH_VY);
    bullet.setFlipX(this.facing === -1);
    // El chorro de la pistola de agua tiene alcance limitado; se recuerda el
    // origen para poder desactivarla al superar ese alcance (ver GameScene).
    bullet.spawnX = spawnX;
  }

  showWaterGun() {
    this.updateWaterGunTransform();
    this.waterGun.setVisible(true);

    this.waterGunHideTimer?.remove(false);
    this.waterGunHideTimer = this.scene.time.delayedCall(155, () => {
      if (this.waterGun?.scene) this.waterGun.setVisible(false);
    });
  }

  updateWaterGunTransform() {
    this.waterGun
      .setPosition(this.x + this.facing * 50, this.y - 5)
      .setFlipX(this.facing === -1);
  }

  takeDamage(amount, time) {
    if (time < this.invulnerableUntil) return false;

    this.health = Math.max(0, this.health - amount);
    this.invulnerableUntil = time + PLAYER_INVULNERABLE_MS;

    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(100, () => this.clearTint());

    return this.health <= 0;
  }
}
