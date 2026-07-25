import Phaser from 'phaser';
import { BOSS_STORM_HEALTH } from '../config.js';

export default class FireStorm extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, targetX, groundY) {
    super(scene, x, y, 'heatwave');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.groundY = groundY;
    this.landed = false;
    this.direction = targetX < x ? -1 : 1;
    this.patrolSpeed = 105;
    this.health = BOSS_STORM_HEALTH;

    this.setScale(1.18, 1.55);
    this.setDepth(3);
    this.play('heatwave-spin');
    // El estirado no uniforme (1.18x1.55) rompe un body circular: Arcade
    // solo usa halfWidth como radio efectivo en la comprobacion circulo-vs-
    // rectangulo, así que ignora el estiramiento vertical y los disparos que
    // tocan la parte alta/baja del tornado no se detectan. Un rectangulo usa
    // ambos ejes correctamente.
    this.body.setSize(40, 40, false);
    this.body.setOffset(12, 10);
    const launchVelocityX = Phaser.Math.Clamp(targetX - x, -420, -120);
    this.setVelocity(launchVelocityX, -300);
  }

  land() {
    if (this.landed || !this.active) return;

    this.landed = true;
    this.y = this.groundY;
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setVelocity(this.direction * this.patrolSpeed, 0);
    this.patrolMinX = Phaser.Math.Clamp(this.x - 90, 6040, 6900);
    this.patrolMaxX = Phaser.Math.Clamp(this.x + 90, 6040, 6900);
  }

  update() {
    if (!this.active || !this.body) return;

    if (!this.landed) return;

    if (this.x <= this.patrolMinX) this.direction = 1;
    if (this.x >= this.patrolMaxX) this.direction = -1;
    this.x = Phaser.Math.Clamp(this.x, this.patrolMinX, this.patrolMaxX);
    this.y = this.groundY;
    this.setVelocity(this.direction * this.patrolSpeed, 0);
  }

  takeDamage(amount) {
    if (!this.active) return false;

    this.health = Math.max(0, this.health - amount);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (this.active) this.clearTint();
    });

    if (this.health > 0) return false;
    this.destroy();
    return true;
  }
}
