import Enemy from './Enemy.js';

// Enemigo tematico: una bola de aire abrasador. La logica de patrulla y de
// recibir dano se hereda de Enemy.
// Su textura es la bola de aire abrasador cargada como 'heatwave'.
export default class HeatWave extends Enemy {
  constructor(scene, x, y, patrolMinX, patrolMaxX, speed) {
    super(scene, x, y, patrolMinX, patrolMaxX, speed);
    this.setTexture('heatwave');

    // El cuerpo heredado ocupaba los 64 px del lienzo, incluidos el halo y
    // las ondas laterales transparentes. El dano solo debe corresponder al
    // nucleo visible de la bola.
    this.body.setCircle(20, 12, 12);
  }
}
