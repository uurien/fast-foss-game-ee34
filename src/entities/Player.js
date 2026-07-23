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
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setBounce(0.05);
    this.body.setSize(this.width - 6, this.height - 2);

    this.bullets = bulletGroup;
    this.health = PLAYER_MAX_HEALTH;
    this.facing = 1;
    this.invulnerableUntil = 0;
    this.nextShotAt = 0;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys('W,A,S,D,SPACE,X');
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
  }

  shoot() {
    if (!this.bullets) return;

    const offsetX = this.facing === 1 ? this.width * 0.6 : -this.width * 0.6;
    const bullet = this.bullets.get(this.x + offsetX, this.y - this.height * 0.15, 'bullet');
    if (!bullet) return;

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
