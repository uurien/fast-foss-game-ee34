import Phaser from 'phaser';
import Enemy from './Enemy.js';

// Enemigo tematico: un pequeno tornado de fuego. La logica de patrulla y de
// recibir dano se hereda de Enemy.
// Sus seis frames se cargan como 'heatwave' y forman un giro continuo.
export default class HeatWave extends Enemy {
  constructor(scene, x, y, patrolMinX, patrolMaxX, speed) {
    super(scene, x, y, patrolMinX, patrolMaxX, speed);
    this.setTexture('heatwave');
    this.setScale(1, 1.35);
    this.play('heatwave-spin');
    this.hoverY = y;
    this.body.setAllowGravity(false);
    this.setVelocityY(0);

    // El cuerpo sigue la zona central y termina junto a la punta visible.
    // Así el tornado descansa sobre la plataforma sin quedar incrustado.
    this.body.setCircle(20, 12, 10);

    // Solido: Begitxo no puede atravesarlo, tiene que rodearlo o saltarlo.
    // Al ser inamovible, el choque no afecta a la patrulla del tornado.
    this.body.setImmovable(true);
  }

  update() {
    super.update();
    if (!this.active || !this.body) return;

    // Mantiene el tornado en su carril aunque otra colision o paso de fisica
    // intente desplazarlo fuera de la plataforma.
    this.y = this.hoverY;
    this.x = Phaser.Math.Clamp(this.x, this.patrolMinX, this.patrolMaxX);
    this.setVelocityY(0);
  }
}
