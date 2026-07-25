# Licencia y procedencia de recursos

## Alcance

Salvo indicación expresa en este fichero, todos los PNG versionados dentro de
`assets/` y `public/assets/` fueron creados o generados específicamente para
este juego por el participante, con postprocesado manual o programático propio.
No se han incorporado imágenes de bancos de recursos, fotografías, audio,
tipografías ni logos descargados de terceros.

Copyright (c) 2026 Ugaitz Urien. Estos recursos se ofrecen bajo los términos de
la licencia MIT incluida en [`LICENSE`](LICENSE), en la medida en que exista un
derecho de autor aplicable al resultado.

## Uso de generación por IA

Las ilustraciones y sus variantes se obtuvieron con herramientas de generación
de imágenes asistidas por IA. Después se recortaron, compusieron, escalaron,
animaron o limpiaron para su uso en el juego. Los ficheros de `assets/` conservan
fuentes e intermedios relevantes; los de `public/assets/` son las versiones que
se distribuyen y cargan en tiempo de ejecución.

La herramienta de generación no se ejecuta al instalar, compilar ni jugar y no
es una dependencia del resultado. El participante publica bajo MIT toda
aportación propia y cualquier derecho que pueda ostentar sobre esos resultados.

## Inventario distribuido

| Recurso | Fichero |
| --- | --- |
| Protagonista, seis poses | `public/assets/begitxo-poses-6-green.png` |
| Jefe Eguzkitzarra, animación | `public/assets/eguzkitzarra-boss-6x512.png` |
| Columnas y tornado de fuego | `public/assets/boss-fire-columns-6x341.png`, `public/assets/fire-tornado-spin-6x64.png` |
| Salida de aire caliente | `public/assets/hazards/hot-air-vent-wide-6x192.png` |
| Indicadores de salud | `public/assets/health-bar-clean.png`, `public/assets/health-bar-burned.png` |
| Pistola de agua | `public/assets/weapons/water-gun-02.png` |
| Meta/heladería | `public/assets/heladeria-begitxo.png` |
| Obstáculos | `public/assets/obstacles/crate-03.png`, `public/assets/obstacles/container-04-large.png` |
| Ciudad en parallax | todos los PNG de `public/assets/city-parallax/` |

Las texturas de enemigo básico, proyectil y suelo se dibujan en
`src/scenes/PreloadScene.js` y forman parte del código MIT.

## Fuentes e intermedios no cargados por el juego

Los PNG de `assets/begitxo-*`, `assets/city-parallax/sources/`,
`assets/goals/`, `assets/hazards/` y `assets/weapons/` documentan el proceso y tienen la misma
autoría y licencia que sus versiones distribuidas. No son dependencias de la
build.

## Derechos sobre Begitxo

Begitxo es un personaje preexistente de Euskal Encounter y constituye el tema
del juego. La licencia anterior cubre únicamente la expresión original aportada
por el participante; no pretende apropiarse del nombre, marca o diseño base del
personaje.

Para afirmar que **todo** el resultado puede redistribuirse bajo MIT, la entrega
debe incluir o poder acreditar el permiso de Euskal Encounter que autorice el
uso y la redistribución del personaje en esta competición. Si ese permiso no
incluye relicenciamiento compatible con una licencia OSI, debe sustituirse el
personaje y su nombre por una creación completamente original.
