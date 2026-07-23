import Phaser from 'phaser';

// Boot existe para separar el arranque mínimo de la carga real de assets.
// Cuando haya assets pesados (spritesheets, audio, tilemaps JSON), aquí se
// puede cargar primero una barra de carga u otros recursos imprescindibles.
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.scene.start('Preload');
  }
}
