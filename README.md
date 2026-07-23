# Begitxo - Run & Gun (Fast FOSS Game, Euskal Encounter 34)

Base de proyecto con [Phaser 3](https://phaser.io/) + [Vite](https://vitejs.dev/) para un
Run and Gun con plataformas, siguiendo la tematica de la Euskal Encounter 34: en plena ola
de calor, Begitxo sale de casa a buscar como refrescarse y tiene que defenderse de los
enemigos que se encuentra por el camino.

## Requisitos

- Node.js 18+

## Poner en marcha

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto http://localhost:5173).

Para generar una build estatica (por ejemplo para subir a itch.io):

```bash
npm run build
```

Los ficheros quedan en `dist/`.

## Controles

- Mover: flechas / `A` `D`
- Saltar: flecha arriba / `W` / `Espacio`
- Disparar: `X` / clic izquierdo

## Estado actual

Esta es la base jugable minima:

- Escenas: `Boot` -> `Preload` -> `Game`.
- Fisicas Arcade con gravedad, colisiones jugador/enemigos con plataformas.
- Jugador: correr, saltar y disparar balas en la direccion en la que mira.
- Enemigos con patrulla simple entre dos puntos, con vida y muerte al recibir impactos.
- Nivel de ejemplo con suelo y plataformas flotantes, camara que sigue al jugador.
- HUD basico de vida y puntuacion.
- Todas las texturas (jugador, enemigo, bala, plataforma) se generan por codigo
  en `PreloadScene` (rectangulos de color) para poder jugar sin arte definitivo.

## Estructura

```
src/
  main.js                 Configuracion de Phaser.Game y lista de escenas
  config.js               Constantes del juego (tamanos, velocidades, vida...)
  scenes/
    BootScene.js
    PreloadScene.js        Genera texturas placeholder / cargara assets reales
    GameScene.js           Logica principal del nivel
  entities/
    Player.js
    Enemy.js
    Platforms.js           Construccion del nivel y puntos de spawn de enemigos
public/
  assets/                  Arte y audio definitivos (ver assets/README.md)
```

## Siguientes pasos sugeridos

- Sustituir las texturas generadas por sprites/animaciones reales en `public/assets`
  (ver `public/assets/README.md`).
- Anadir animaciones (idle, correr, saltar, disparar, morir) con `this.anims.create`.
- Cargar el nivel desde un tilemap hecho con [Tiled](https://www.mapeditor.org/) en vez
  del nivel generado a mano en `Platforms.js`.
- Anadir sonido (disparos, impactos, musica).
- Anadir una pantalla de menu/game over y transicion entre niveles.
- Variedad de enemigos (a distancia, voladores, jefes) y power-ups (vida, munición especial).
