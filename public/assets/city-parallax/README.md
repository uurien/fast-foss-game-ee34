# City parallax set

Estado provisional mientras se revisa el arte panel a panel.

## Capas activas

| Capa | Archivo | Scroll factor |
| --- | --- | --- |
| Cielo | `layer-01-sky-sun.png` | `0.00` |
| Lejana A/B | `layer-02-distant-buildings-*-blend.png` | `0.15` |
| Media A/B | `layer-03-mid-buildings-*-blend.png` | `0.40` |
| Primer plano | `layer-04-foreground-full-7200-v3.png` | `1.00` |

El primer plano es una única textura de `7200 x 941` que cubre todo el nivel.
No se repite ni se compone mediante paneles durante la ejecución.

La versión anterior `layer-04-foreground-full-7200.png` se conserva como
respaldo. La versión `v2` elimina el fundido defectuoso del último tramo.
La versión `v3` corrige además la puerta rota y la chimenea duplicada de
esa unión. Las versiones anteriores siguen conservadas.

Las fuentes originales con fondo croma están en
`assets/city-parallax/sources/`.
