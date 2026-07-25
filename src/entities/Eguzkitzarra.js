import Phaser from 'phaser';
import {
  BOSS_MAX_HEALTH,
  BOSS_TELEGRAPH_MS,
  BOSS_VULNERABLE_MS,
  BOSS_ATTACK_COOLDOWN_MS
} from '../config.js';

export default class Eguzkitzarra extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'eguzkitzarra');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = BOSS_MAX_HEALTH;
    this.awake = false;
    this.state = 'sleeping';
    this.stateUntil = 0;
    this.attackNumber = 0;
    this.baseX = x;
    this.baseY = y;

    this.setDepth(8);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    // El circulo se define en coordenadas de cada frame y despues
    // se escala con setDisplaySize: si el orden se invierte, Arcade Physics
    // puede no recalcular el tamano del cuerpo porque no detecta un cambio
    // de escala, dejando un hitbox varias veces mayor que el sprite visible.
    // Radio y offset ajustados para inscribir la bola de placas (sin las
    // puntas de llama ni el engranaje, que sobresalen del cuerpo solido).
    this.body.setCircle(148, 87, 87);
    // El personaje ocupa aproximadamente el 75% de cada celda; este tamano
    // compensa el padding del spritesheet y conserva su escala visual previa.
    this.setDisplaySize(300, 295);
    this.play('eguzkitzarra-idle');
  }

  awaken(time) {
    if (this.awake) return;
    this.awake = true;
    this.setActive(true).setVisible(true).setAlpha(1);
    this.setPosition(this.baseX, this.baseY);
    this.state = 'cooldown';
    this.stateUntil = time + 700;
  }

  update(time) {
    if (!this.active || !this.awake || this.state === 'defeated') return;

    // Se desplaza lateralmente, manteniendo siempre la punta del tornado
    // apoyada en el suelo en vez de flotar por encima de Begitxo.
    this.setPosition(
      this.baseX + Math.sin(time / 820) * 38,
      this.baseY
    );

    if (time < this.stateUntil) return;

    if (this.state === 'cooldown') {
      this.state = 'telegraph';
      this.stateUntil = time + BOSS_TELEGRAPH_MS;
      this.setTintFill(0xffd45a);
      const telegraphScaleX = this.scaleX;
      const telegraphScaleY = this.scaleY;
      this.scene.tweens.add({
        targets: this,
        scaleX: telegraphScaleX * 1.06,
        scaleY: telegraphScaleY * 1.06,
        duration: 180,
        yoyo: true,
        repeat: 1
      });
      return;
    }

    if (this.state === 'telegraph') {
      this.clearTint();
      this.attackNumber += 1;
      const isEnraged = this.health <= BOSS_MAX_HEALTH * 0.4;
      this.scene.launchBossStorms(isEnraged ? 3 : 2);
      this.state = 'vulnerable';
      this.stateUntil = time + BOSS_VULNERABLE_MS;
      this.setTint(0xb8f4ff);
      return;
    }

    if (this.state === 'vulnerable') {
      this.clearTint();
      this.state = 'cooldown';
      this.stateUntil = time + BOSS_ATTACK_COOLDOWN_MS;
    }
  }

  takeDamage(amount) {
    if (!this.active || !this.awake || this.state === 'sleeping' || this.state === 'defeated') {
      return { hit: false, died: false };
    }

    const effectiveDamage = this.state === 'vulnerable' ? amount * 2 : amount;
    this.health = Math.max(0, this.health - effectiveDamage);

    if (this.health > 0) {
      // Un impacto que no lo derrota nunca debe dejarlo invisible: solo el
      // flash blanco cambia, la escala y el alpha de combate se reafirman
      // por si algun tween (p.ej. el de telegraph) quedo a medio aplicar.
      this.setVisible(true).setAlpha(1);
      this.setTintFill(0xffffff);
      this.scene.time.delayedCall(80, () => {
        if (!this.active || this.state === 'defeated') return;
        this.clearTint();
        if (this.state === 'vulnerable') this.setTint(0xb8f4ff);
      });
      return { hit: true, died: false };
    }

    this.state = 'defeated';
    this.body.enable = false;
    this.clearTint();
    return { hit: true, died: true };
  }
}
