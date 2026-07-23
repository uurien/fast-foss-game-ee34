import Phaser from 'phaser';
import {
  PLAYER_SPEED,
  JUMP_VELOCITY,
  PLAYER_MAX_HEALTH,
  PLAYER_INVULNERABLE_MS,
  BULLET_SPEED,
  FIRE_COOLDOWN_MS
} from '../config.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, bulletGroup) {
    super(scene, x, y, 'player', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.22);
    this.setCollideWorldBounds(true);
    this.setBounce(0.05);
    this.body.setSize(190, 390);
    this.body.setOffset(161, 88);

    this.bullets = bulletGroup;
    this.health = PLAYER_MAX_HEALTH;
    this.facing = 1;
    this.invulnerableUntil = 0;
    this.nextShotAt = 0;

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
          { key: 'player', frame: 1 },
          { key: 'player', frame: 3 },
          { key: 'player', frame: 1 }
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
    const jump = this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown;
    const shoot = this.keys.X.isDown || this.scene.input.activePointer.isDown;

    if (left) {
      this.setVelocityX(-PLAYER_SPEED);
      this.facing = -1;
      this.setFlipX(true);
    } else if (right) {
      this.setVelocityX(PLAYER_SPEED);
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

    const offsetX = this.facing === 1 ? this.displayWidth * 0.35 : -this.displayWidth * 0.35;
    const spawnX = this.x + offsetX;
    const spawnY = this.y - this.displayHeight * 0.1;
    const bullet = this.bullets.get(spawnX, spawnY, 'bullet');
    if (!bullet) return;

    // Al reutilizar una bala del pool hay que sincronizar tambien su cuerpo
    // fisico; setActive/setVisible no eliminan su posicion anterior.
    bullet.body.reset(spawnX, spawnY);
    bullet.setActive(true).setVisible(true);
    bullet.body.enable = true;
    bullet.body.allowGravity = false;
    bullet.setVelocity(this.facing * BULLET_SPEED, 0);
    bullet.setFlipX(this.facing === -1);
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
