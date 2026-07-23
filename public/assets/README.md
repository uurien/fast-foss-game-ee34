# Assets

Pon aqui el arte definitivo (sprites, tilesets, audio) cuando este listo.

Para usarlo, cargalo en `src/scenes/PreloadScene.js` dentro de `preload()`, por ejemplo:

```js
this.load.spritesheet('begitxo', 'assets/begitxo.png', { frameWidth: 32, frameHeight: 48 });
this.load.image('platform', 'assets/platform.png');
this.load.audio('shoot', 'assets/shoot.ogg');
```

Y sustituye las texturas generadas por codigo en `generatePlaceholderTextures()`
por las claves de estos assets reales.

Recuerda usar solo recursos FOSS / con licencia libre acorde al espiritu del jam.
