# Recursos distribuidos

Esta carpeta contiene exclusivamente los PNG que Vite copia a `dist/assets/` y
que el juego carga en Chromium. No se descargan recursos durante la ejecución.

La autoría, procedencia, inventario y licencia se documentan en
[`../ASSET_LICENSES.txt`](../ASSET_LICENSES.txt). Todos los recursos originales
del participante se ofrecen bajo MIT junto con el código.

Al añadir un recurso:

1. conserva su fuente o proceso en `assets/`;
2. registra su procedencia y licencia en `ASSET_LICENSES.md`;
3. usa solo formatos implementados por Chromium con software libre;
4. ejecuta `npm run check:compliance` para comprobar que toda ruta cargada
   existe y que no se ha introducido una dependencia remota.
