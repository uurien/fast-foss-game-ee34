import Phaser from 'phaser';
import { ENEMY_MAX_HEALTH } from '../config.js';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, patrolMinX, patrolMaxX, speed = 60) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.patrolMinX = patrolMinX;
    this.patrolMaxX = patrolMaxX;
    this.speed = speed;
    this.direction = 1;
    this.health = ENEMY_MAX_HEALTH;

    this.setVelocityX(this.speed * this.direction);
  }

  update() {
    if (this.x <= this.patrolMinX) {
      this.direction = 1;
    } else if (this.x >= this.patrolMaxX) {
      this.direction = -1;
    }

    this.setVelocityX(this.speed * this.direction);
    this.setFlipX(this.direction < 0);
  }

  // Devuelve true si el enemigo ha muerto tras recibir el dano.
  takeDamage(amount) {
    this.health -= amount;

    if (this.health <= 0) {
      this.destroy();
      return true;
    }

    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });
    return false;
  }
}
