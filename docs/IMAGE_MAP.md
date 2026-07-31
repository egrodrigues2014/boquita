# Mapa de imágenes

Qué foto del archivo de Instagram va en cada slot del layout, con su recorte y su procedencia.

La fuente de verdad **ejecutable** es `scripts/build-images.mjs`, que declara los mismos recortes como
datos. Este documento es el razonamiento: por qué esa foto y no otra.

- **Originales:** `assets/raw/ig-NN-objNN.jpg` (gitignored) + `assets/raw/manifest.json`
- **Derivados:** `public/img/<slot>/` en WebP, versionados en el repo
- **Ratios objetivo:** inventario de assets del spec, §7

## Procedencia

Cada foto está trazada a su publicación de Instagram por emparejamiento **posicional por página**
(ver el docstring de `scripts/extract-pdf-images.py`). Validado contra la identificación visual de las
37: **37/37 exactas**. `npm run images:extract -- --verify` lo reimprime.

Eso resolvió dos identificaciones que la revisión visual había dejado abiertas:

- **`ig-27` es «mini queque de manzana»** (`Cxfik5gu8He`), no un queque de zanahoria. Importa para el
  `alt` del hero.
- **`ig-30` es «Diet Biscotti» keto** (`Cs1CUqsgb37`). La revisión visual concluyó que los biscotti
  keto no tenían foto; sí la tienen.

---

## Slots de layout — Fase 1

15 derivados. El grid del catálogo del spec §6.4 es sólo texto (nombre, precio, categoría), así que
las fichas de producto **no** entran en esta fase.

| Slot | Fuente | Publicación | Recorte del original | Salida 1× / 2× |
| --- | --- | --- | --- | --- |
| `hero` | `ig-27` 1440×1800 | `Cxfik5gu8He` | x 45–1395 → 1350×1800 (0.750) | 1050×1400 / 1350×1800 |
| `wide` | `ig-33` 1440×890 | `Csjg5jrJ-p5` | y 385–882 → 1440×497 (2.898) | 1170×403 / 1440×497 |
| `service` | `ig-09` 1440×1800 | `DCIE1G7yTKz` | y 100–1755 → 1440×1655 (0.870) | 540×624 / 1080×1248 |
| `media` | `ig-24` 1440×1012 | `C04dGLAOBcK` | y 96–960 → 1440×864 (1.667) | 493×300 / 986×600 |
| `cta` | `ig-31` 1440×1440 | `CsytGc5AyUI` | y 290–1250 → 1440×960 (1.500) | 585×384 / 1170×768 |
| `inline-1` | `ig-05` 1252×1566 | `DF-4CbAOH0p` | (198,530)–(578,910) → 380² | 100×100 / 200×200 |
| `inline-2` | `ig-04` 1252×1566 | `DF-5iLLuttF` | (190,110)–(530,450) → 340² | 100×100 / 200×200 |

### Por qué cada una

**`hero` — ig-27, bundt con azúcar glas.** La mejor fotografía del archivo: luz natural suave y
direccional, plato blanco limpio, poca profundidad de campo, cero texto, cero manos. El queque ocupa
el 60% inferior del encuadre y el recorte sólo quita laterales, así que la composición aguanta. Con
`cover` a 43.5%×100vh el recorte adicional es lateral y el queque sobrevive.

Que sea un queque de manzana y no el de zanahoria estrella no molesta: el hero no nombra ningún
producto (el titular es «Dulce y salado / hecho en casa»). El `alt` sí dice lo que es.

**`wide` — ig-33, biscotti con café.** Es la **única** foto del archivo que puede llenar una banda
2.9:1. El plato largo y la taza de espresso viven entre y≈460–845, así que la banda y 385–882 no
pierde nada; sólo se descarta la franja de jardín superior. En todas las demás fotos el sujeto mide
690–720px de alto contra los 497 que permite la banda, y queda partido por la mitad.

**`service` — ig-09, bandeja de polvorones.** Sensación de obrador real, luz de ventana cálida, sin
caras y sin texto: no necesita consentimiento y no bloquea el despliegue. La alternativa mejor en
contenido es `ig-18` (Ale decorando), pero sale su cara y requiere su OK.

**`media` — ig-24, queque de zanahoria en pie de cristal.** Interina. El slot es el still de un botón
de play, y lo ideal sería un fotograma de «Ale decorando»; el único que hay (`ig-18`) es vertical, de
900px y con texto incrustado, así que cualquier recorte 5:3 le corta la cabeza o corta el queque.
`ig-24` es horizontal nativa (1.42) y funciona bien detrás de un botón de play. El TODO pide un
fotograma real del reel.

**`cta` — ig-31, biscotti con dip de chocolate.** Blanco sobre blanco, lectura clara del producto,
acogedora. Sólo se recorta el borde exterior del plato.

**`inline-1 / inline-2`.** Son ~100px de ancho dentro del flujo de un `h2`, a `height:1em`: sólo
sobreviven siluetas simples y de alto contraste. Un brigadeiro (esfera oscura con textura de granillo
sobre cápsula kraft clara) y una galleta con forma de corazón sobre plato blanco son las dos únicas
formas del archivo que se leen a ese tamaño.

El recuadro tiene que encuadrar la pieza **completa** con algo de aire. Un primer intento más
apretado (290² sobre el brigadeiro) cayó *dentro* de la pieza y el derivado salió como un macro de
granillo: a 100px se leía como una mancha marrón, no como un dulce. Verificado mirando el derivado
generado, no sólo calculando el recuadro.

Ambos recortes están **rescatados de exportaciones de Canva con texto incrustado**: los recuadros
elegidos quedan por debajo del logo (`ig-05`, y>180) y del titular (`ig-04`, y>70). Es frágil. El TODO
pide dos primeros planos limpios sobre fondo blanco.

---

## Galería — 8 únicas, 4 por fila

El spec repite cada fila hasta 7 elementos, así que se ven ~4 completas y 2 cortadas por fila. Ese
recorte es parte del diseño.

| Fila | # | Fuente | Publicación | Recorte a 4:3 |
| --- | --- | --- | --- | --- |
| 1 | 1 | `ig-29` cookie cake con ganache | `CxGnjppOfP7` | y 470–1550 · clipa ~20–70px del borde del disco |
| 1 | 2 | `ig-35` queque rectangular grande | `Csje6Ygpt20` | y 0–1080 de 1440×1085 · casi nativo |
| 1 | 3 | `ig-28` coffee cake | `CxImgy-uMis` | y 500–1580 · el bizcocho es horizontal, aguanta |
| 1 | 4 | `ig-36` queque de zanahoria cenital | `Cqae9yQgpG0` | y 400–1480 · cenital, recorta limpio |
| 2 | 1 | `ig-13` galletas con Nutella | `DBJmb2jPO0a` | y 720–1800 · las seis cazuelitas dentro |
| 2 | 2 | `ig-34` galletas de granola con café | `CsjgyZCJC1T` | y 640–1720 · plato, café y fresa dentro |
| 2 | 3 | `ig-30` biscotti keto | `Cs1CUqsgb37` | y 550–1630 |
| 2 | 4 | `ig-37` tarta de brigadeiro | `CqMHdv3pl5A` | 1440×1080 nativo · **subir exposición** |

**Sin colisiones con los slots de arriba.** Es deliberado: la primera propuesta de curación reutilizaba
el hero, la panorámica, la de servicio y la del CTA dentro de la galería. Con 13 candidatos válidos
para 8 huecos no hace falta repetir, y ver la foto de portada otra vez más abajo se lee como amateur.

**`ig-10` descartada de la galería** (verificado visualmente): el queque de dos pisos llena el
encuadre de y≈40, con las puntas de las velas, a y≈1750. Un 4:3 pierde 720px y lo decapita. Se
reserva como foto de «queque personalizado» en la Fase 4, donde el retrato no estorba.

Suplentes si alguna no convence al ver el derivado: `ig-26` (cenital sobre blonda dorada — ojo, sangra
por los cuatro bordes), `ig-32` (key lime pie, apagada), `ig-21` (asado negro), `ig-22` (bolsas
navideñas — estacional, mala idea para un sitio de todo el año).

**La galería es toda dulce.** La marca es «Sweet & Salty» y no hay ninguna foto salada aprovechable:
el único cachito (`ig-03`) tiene texto incrustado a y≈740–830 y la zona limpia inferior sólo da 570px
de alto, insuficiente para un 4:3. Anotado en `CONTENT_TODO.md`.

---

## Banderas de derechos

Ninguna de estas se usa en la Fase 1.

| Foto | Bandera | Qué aparece |
| --- | --- | --- |
| `ig-06` | `PERSONA` | Manos y brazos con uñas largas, henna y pulseras, sosteniendo la torta cerebro |
| `ig-07` | `PERSONA` | Mano sosteniendo la bolsa de regalo |
| `ig-08` | `PERSONA` | Mano sosteniendo los polvorones; un zapato en el borde inferior |
| `ig-14` | `PERSONA` | Pulgar con esmalte lila |
| `ig-17` | `PERSONA` | Pulgar con esmalte lila |
| `ig-18` | `PERSONA` | Ale de cuerpo y cara. Es la dueña, así que su OK debería ser trivial — pero hay que pedirlo |

Además, `ig-01`, `ig-02`, `ig-19`, `ig-20` llevan **precios y datos de contacto incrustados** en la
imagen. Nunca deben publicarse como imagen de layout: los precios que muestran son de 2024.

---

## Las 37, con veredicto

| # | obj | Publicación | Contenido | Veredicto |
| --- | --- | --- | --- | --- |
| 01 | 8 | `C2xMXvRudFn` | Tarjeta MENÚ con precios | ✗ texto incrustado |
| 02 | 9 | `DF8vMZzuSiO` | Collage Canva San Valentín | ✗ collage con logo |
| 03 | 10 | `DHEhNiFS0kN` | Cachitos de jamón | ⚠ sólo con recorte (texto) |
| 04 | 11 | `DF-5iLLuttF` | Galletas de granola corazón | ⚠ recorte → `inline-2` |
| 05 | 18 | `DF-4CbAOH0p` | Brigadeiros en caja | ⚠ recorte → `inline-1` |
| 06 | 19 | `DCuJzAUu6w1` | Torta cerebro | ⚠ `PERSONA` + gore, fuera de marca |
| 07 | 20 | `DCpJLVgS6gC` | Bolsa de regalo navideña | ✗ producto oculto |
| 08 | 21 | `DCpHswxSn_z` | Polvorones en celofán | ✗ producto oculto |
| 09 | 28 | `DCIE1G7yTKz` | Bandeja de polvorones | ✓ → `service` |
| 10 | 29 | `DBoh1zbOsZ2` | Queque 2 pisos con velas | ✓ retrato · producto Fase 4 |
| 11 | 30 | `DBoezJwuTSV` | Queque 2 pisos, plano lejano | ✗ desvaída, sujeto pequeño |
| 12 | 31 | `DBLZOUJukwb` | Caja cupcakes Halloween | ✗ flash nocturno |
| 13 | 38 | `DBJmb2jPO0a` | Galletas chocolate + Nutella | ✓ → galería 2·1 |
| 14 | 39 | `DBJl5QDvWkJ` | Bandeja de brigadeiros | ⚠ `PERSONA` |
| 15 | 40 | `C8QHe5gulVh` | Barra de dátiles | ⚠ tapa de plástico con reflejos |
| 16 | 41 | `C8QHSbxu0Ua` | Mini queques en domos | ✗ luz partida naranja/azul |
| 17 | 48 | `C30r2cbux4_` | Tina de galletas de granola | ⚠ `PERSONA` + envase barato |
| 18 | 49 | `C3V_oBtOBHT` | Ale decorando (reel) | ⚠ `PERSONA` + texto · mejor `service` si hay OK |
| 19 | 50 | `C3BNXSbOqiH` | Promo Canva día del amor | ✗ gráfico |
| 20 | 51 | `C20KuWHOi-t` | Tarjeta menú Valentine | ✗ texto incrustado |
| 21 | 58 | `C0__h6oOAai` | Asado negro | ⚠ sol duro, corteza casi negra |
| 22 | 59 | `C0__VFVuXLu` | Galletas granola, bolsa navideña | ⚠ estacional |
| 23 | 60 | `C0_v-JRu77I` | Galletas navideñas, bolsa roja | ⚠ estacional · **casi idéntica a la 22, pero es otra publicación** |
| 24 | 61 | `C04dGLAOBcK` | Queque de zanahoria, pie de cristal | ✓ → `media` |
| 25 | 68 | `C0y81DZOL-S` | Bolsas navideñas de polvorones | ✗ contenido invisible |
| 26 | 69 | `C0g26hGO6K8` | Queque zanahoria cenital, blonda | ✓ suplente (sangra 4 bordes) |
| 27 | 70 | `Cxfik5gu8He` | **Mini queque de manzana** | ✓✓ → `hero` · la mejor del archivo |
| 28 | 71 | `CxImgy-uMis` | Coffee cake vegano | ✓ → galería 1·3 |
| 29 | 78 | `CxGnjppOfP7` | Cookie cake con ganache | ✓ → galería 1·1 |
| 30 | 79 | `Cs1CUqsgb37` | **Diet Biscotti (keto)** | ✓ → galería 2·3 |
| 31 | 80 | `CsytGc5AyUI` | Biscotti con dip de chocolate | ✓ → `cta` |
| 32 | 81 | `CstTO0NA7GF` | Key lime pie | ⚠ luz plana · única del producto |
| 33 | 88 | `Csjg5jrJ-p5` | Biscotti con café, plato largo | ✓✓ → `wide` · única panorámica posible |
| 34 | 89 | `CsjgyZCJC1T` | Galletas granola con café | ✓ → galería 2·2 |
| 35 | 90 | `Csje6Ygpt20` | Queque rectangular (70 pers.) | ✓ → galería 1·2 |
| 36 | 91 | `Cqae9yQgpG0` | Queque zanahoria cenital redondo | ✓ → galería 1·4 |
| 37 | 98 | `CqMHdv3pl5A` | Tarta de brigadeiro y salt flakes | ✓ → galería 2·4 (subexpuesta) |

**11 inutilizables · 9 con reservas · 17 aprovechables.**

---

## Techo de resolución: 1440px

Todas las fuentes vienen ya recomprimidas por Instagram y ninguna supera 1440px de ancho.

- **La panorámica se queda en ~1.23×** donde harían falta 2×. No se fabrica un upscale: sería
  desenfoque a triple peso. Se sirve `1440×497` como entrada superior del `srcset`.
- El hero llega a ~1.8× a 1920px de viewport. Suficiente.
- El resto de slots alcanza 2× sin problemas.

Por eso `docs/CONTENT_TODO.md` abre pidiendo **una panorámica del mostrador a resolución original**.

## Fichas de producto — Fase 4

Con la procedencia arreglada, la asignación por producto ya es fiable:

| Producto | Foto | Nota |
| --- | --- | --- |
| Queque de zanahoria | `ig-24` | suplentes `ig-26`, `ig-36` |
| Queque personalizado | `ig-10` | dos pisos con velas = claramente por encargo |
| Galletas de granola | `ig-34` | `ig-04` recortada si se quiere el plato lleno |
| Galletas de chocolate y Nutella | `ig-13` | única y excelente |
| Polvorones de almendra | `ig-09` | única limpia |
| Brigadeiros | `ig-05` recortada | `ig-14` tiene más volumen pero sale una mano |
| Biscotti de almendra | `ig-31` o `ig-33` | |
| Biscotti keto | `ig-30` | confirmado por permalink |
| Key lime pie | `ig-32` | apagada · vale la pena refotografiar |
| Barras de dátil | `ig-15` | reflejos de la tapa · vale la pena refotografiar |
| Mini queques de manzana | `ig-27` | la misma del hero |
| Coffee cake vegano | `ig-28` | no se puede confirmar «vegano» visualmente |
| Cachitos de jamón | `ig-03` recortada | única, y con texto incrustado · **refotografiar** |
| Asado negro | `ig-21` | sol duro · **refotografiar** |
