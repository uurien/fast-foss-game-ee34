# Begitxo izozki bila

Juego HTML5 para la competición **Fast FOSS Game de Euskal Encounter 34**. En
plena ola de calor, Begitxo cruza la ciudad, combate a Eguzkitzarra con su
pistola de agua y trata de llegar a la heladería.

El juego funciona completamente en local: no descarga código, fuentes ni
recursos durante la ejecución.

## Ejecutar en GNU/Linux

Paquetes necesarios de la distribución:

- `nodejs` 22 o posterior y `npm`, solo para instalar y generar la build.
- `chromium`, en su versión más reciente disponible, para jugar y probar.

Instala ambos con el gestor de paquetes de tu distribución y comprueba la
versión de Node antes de continuar:

```bash
node --version
```

Con las dependencias instaladas:

```bash
npm ci
npm run check:compliance
npm run build
npm run test:chromium
npm run dev -- --host 127.0.0.1
```

Abre `http://127.0.0.1:5173` en Chromium. No abras `index.html` directamente
con `file://`, porque los módulos de JavaScript deben servirse por HTTP.

Para producir la entrega estática reproducible:

```bash
npm install
npm run check:compliance
npm run build
npm run test:chromium
npm run preview -- --host 127.0.0.1
```

La entrega queda en `dist/` y puede alojarse en cualquier servidor web
estático. `npm ci` respeta exactamente las versiones de `package-lock.json`.

## Controles

- Mover: flechas izquierda/derecha o `A`/`D`.
- Saltar: flecha arriba o `W`.
- Disparar: `Espacio`, `X` o clic/botón principal.
- Empezar o reintentar: `Enter`.

## Dependencias y licencias

Todas las dependencias directas y transitivas fijadas por el lockfile son
software libre. No se usan CDN, telemetría, servicios web ni fuentes externas.

| Uso | Dependencia fijada | Licencia |
| --- | --- | --- |
| Juego | Phaser 3.90.0 | MIT |
| Transitiva de Phaser | eventemitter3 5.0.4 | MIT |
| Build/desarrollo | Vite 5.4.21 | MIT |
| Transitiva de Vite | esbuild y binarios opcionales `@esbuild/*` 0.21.5 | MIT |
| Transitiva de Vite | Rollup y binarios opcionales `@rollup/*` 4.62.2 | MIT |
| Transitiva de Rollup | `@types/estree` 1.0.9 | MIT |
| Opcional de Rollup en macOS | fsevents 2.3.3 | MIT |
| Transitiva de Vite | postcss 8.5.22 | MIT |
| Transitiva de postcss | nanoid 3.3.16 | MIT |
| Transitiva de postcss | picocolors 1.1.1 | ISC |
| Transitiva de postcss | source-map-js 1.2.1 | BSD-3-Clause |

Dependencias del entorno que no se incluyen en la entrega:

| Uso | Herramienta | Licencia |
| --- | --- | --- |
| Build | Node.js 18+ | MIT |
| Instalación | npm CLI | Artistic-2.0 |
| Ejecución/pruebas | Chromium | BSD-3-Clause y licencias libres compatibles |
| Edición opcional de fuentes gráficas | PowerShell y .NET/System.Drawing | MIT |

Los scripts PowerShell son herramientas auxiliares históricas para procesar
PNG; no intervienen en `npm ci`, en la build ni en la ejecución del juego. Las
acciones opcionales de despliegue (`actions/checkout@v4`,
`actions/setup-node@v4`, `actions/upload-pages-artifact@v3` y
`actions/deploy-pages@v4`) también están publicadas bajo MIT.

Los avisos que deben acompañar a la build están en
[`public/THIRD_PARTY_NOTICES.txt`](public/THIRD_PARTY_NOTICES.txt). El lockfile
es el inventario exhaustivo y verificable de paquetes.

## Licencia y recursos

El código y los recursos originales del proyecto se ofrecen bajo la licencia
OSI **MIT** del fichero [`LICENSE`](LICENSE). La procedencia, inventario y
tratamiento de los recursos generados con IA se documentan en
[`ASSET_LICENSES.md`](ASSET_LICENSES.md). Las texturas sencillas de enemigos,
proyectiles y suelo se generan con código MIT durante la carga.

Begitxo es un personaje de Euskal Encounter. La licencia MIT del participante
cubre su código, animación y arte original, pero no puede sustituir una
autorización de la organización sobre el personaje preexistente. Para una
entrega íntegramente relicenciable, se debe conservar junto a la entrega la
autorización o cláusula de las bases que permita este uso y su redistribución.

## Comprobación de las normas Fast FOSS Game

| Norma | Evidencia en el proyecto |
| --- | --- |
| Utilizable en GNU/Linux | HTML5 sin binarios propios; build CI en `ubuntu-latest`; instrucciones anteriores con paquetes de distribución. |
| Solo software libre | Inventario completo de dependencias y licencias en este README; auditoría automática del lockfile. |
| Resultado bajo licencia OSI | Código y arte original bajo MIT; avisos MIT/ISC/BSD compatibles incluidos. Queda sujeta a la autorización de Begitxo indicada arriba. |
| Dependencias documentadas | Tablas anteriores y `package-lock.json`; versiones directas fijadas sin rangos. |
| HTML5 en Chromium | Phaser Canvas/WebGL, recursos locales y prueba indicada con el Chromium de la distribución. |
| Generación con LLM licenciable | Procedencia declarada y resultados originales publicados bajo MIT en `ASSET_LICENSES.md`. |

`npm run check:compliance` falla si aparece una licencia npm no aprobada, falta
un asset cargado, se introduce una URL remota o se vuelve a depender de las
fuentes propietarias que se eliminaron de la interfaz. `npm run test:chromium`
arranca `dist/` en el Chromium instalado por la distribución y comprueba que el
juego llega a crear su canvas sin errores de carga o JavaScript. La CI repite la
prueba dentro de Arch Linux con `nodejs`, `npm` y `chromium` de su repositorio
oficial antes de permitir el despliegue.

## Estructura

```text
src/                 Código del juego y escenas Phaser
public/assets/       Recursos que se copian a la build
assets/              Fuentes e intermedios gráficos editables
scripts/             Herramientas de procesado y auditoría
dist/                Build generada (no versionada)
```
