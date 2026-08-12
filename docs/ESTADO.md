# Estado del proyecto

**Este fichero es la única fuente de «qué está hecho y qué falta».** Se lee antes de empezar a
trabajar y se actualiza al cerrar cualquier bloque de trabajo. Si algo de aquí no coincide con el
código, el fichero está mal y se corrige: no hay una segunda lista que consultar.

Lo que **no** hace: no copia el detalle de otros documentos, los referencia.

| Para saber… | Ir a |
| --- | --- |
| las reglas que rompen en silencio, y este protocolo | `CLAUDE.md` |
| qué falta de Ale antes de lanzar | `docs/CONTENT_TODO.md` |
| qué se aparta del spec y por qué | `docs/DEVIATIONS.md` |
| cómo debe verse cada sección | `docs/frontend_spec.md` (normativo) |
| qué foto va en cada slot | `docs/IMAGE_MAP.md` |
| cómo funciona el proyecto | `README.md` |

**Cómo actualizarlo:** mover lo cerrado de *Pendiente* a *Hecho* con su puntero a fichero, refrescar
*De un vistazo*, y anotar los pendientes nuevos que hayan aparecido por el camino. Cada afirmación
lleva un fichero o un comando que la comprueba — sin cifras que no se hayan medido.

---

## De un vistazo

*Última revisión: 12 de agosto de 2026.*

| | |
| --- | --- |
| Rama | `main`, en sincronía con `origin` (`https://github.com/egrodrigues2014/boquita.git`). `ui/quick-wins` ya está fusionada y se puede borrar |
| Último commit | Ver `git log -1 --oneline`; no se duplica aquí porque el hash queda obsoleto al commitear este fichero |
| Sin commitear | **Tres bloques a la vez, no commitear el árbol entero.** (1) El statement sigue en vuelo: `components/ui/ScrollColorText.tsx`, `styles/12-statement.css`, `styles/14-overlap-menu.css`. (2) El drawer móvil: `components/layout/Navbar.tsx`, `styles/10-navbar.css`, `styles/99-a11y.css`. (3) **El catálogo real de Ale**, que es el bloque grande: `types/shop.ts`, `content/products.ts`, `content/home.ts`, `content/shopSchema.ts`, `content/pages.ts`, `lib/variants.ts`, `lib/cart.ts`, `lib/shopSearch.ts`, `lib/productImage.ts`, `lib/db/*`, `components/cart/ProductPurchase.tsx` (nuevo, sustituye a `AddToCartButton.tsx`), `components/cart/CartDrawer.tsx`, `components/shop/ProductCard.tsx` (nuevo, la tarjeta del catálogo rediseñada — D-33), `app/tienda/**`, `app/layout.tsx`, `app/not-found.tsx`, `app/opengraph-image.tsx`, `styles/05-components.css` (`.btn--sm`), `styles/30-cart.css`, `scripts/build-images.mjs`, `scripts/seed-catalog.ts`, `drizzle/0001_*`, `assets/products/` (24 fotos), `data/`, `public/img/producto/` y los tests. Verificar con `git status --short` |
| Tests unitarios | **227 en verde**, 11 ficheros (`npm test`, medido el 12 ago tras el rediseño de la tarjeta). `npm run lint` y `npm run typecheck` limpios el mismo día |
| Tests e2e | **Suite completa medida el 12 ago tras el rediseño de la tarjeta**, contra `NEXT_DIST_DIR=.next-verify` y build nuevo: **1.003 en verde + 64 skipped + 5 en rojo** de 1.072 casos (15,1 min). Los 5 rojos son de **otros dos bloques en vuelo, ninguno de la tarjeta**: (1) cuatro son `geometry.spec.ts:36` (statement) a 991, 767, 479 y 390 — el titular queda por encima del fondo de la foto, no por debajo; (2) el quinto es `seo-perf.spec.ts:151` a 1920, «la primera carga pesa menos de 1.2 MB»: mide **1.294 KB, de los que 831 KB son imágenes de la portada**. La causa es que la galería de la portada pasó a servir fotos de `/img/producto/` (ver el diff de `tests/e2e/seo-perf.spec.ts` y `components/sections/Gallery.tsx`). **No es atribuible a la tarjeta**: la portada no renderiza `ProductCard`, y el bundle de CSS entero mide 45 KB en disco contra los 94 KB de exceso. Los tests de la tarjeta se volvieron a correr aislados: **57 en verde + 7 skipped** (los skips son los ≤479 con `hasTouch` y los de una columna). Verificar con `NEXT_DIST_DIR=.next-verify npm run e2e -- --reporter=line`; ojo con encauzar la salida a `tail` o a `Select-Object -Last`, que se traga el principio del resumen |
| ⚠ Intermitentes | Dos, medidos el 12 ago y **anteriores a este bloque**; en la última pasada de la suite pasaron los dos, así que no salen en la fila de arriba. (1) `paginas.spec.ts:51` (el ancla `#entregas` de sobre-nosotros no queda tapada por el navbar) falla ~6 de 24 repeticiones, a anchos distintos cada vez. Medido con una sonda: cuando falla, `scroll-margin-top: 131px` **no se aplica** y el titular queda a 12px del borde en vez de a 131px, con `scrollY` 1861 de un máximo de 3481 — así que no es que la página se quede corta para desplazarse. Es una carrera entre el desplazamiento al fragmento y el que hace el router; es un bug real de navegación, no del test. (2) `tienda.spec.ts:532` (el control `aria-disabled` conserva el foco) falla suelto bajo carga y pasa **4 de 4** al repetirlo aislado |
| ⚠ Sin cobertura | Tres cosas. (1) `interactions.spec.ts:171` era el único test de que el statement respeta `prefers-reduced-motion`. Comprobado a mano el 7 ago (36 palabras a `--reveal:100%`, con y sin JS), pero **hoy no lo vigila nadie**. (2) El **aspecto** del realce del drawer: el test mide caja, sangrías, alto y navegación, pero nadie comprueba el color del fondo, la barra de 3px ni el `transform` del `.nav-label`, ni que decaigan bajo `prefers-reduced-motion`. (3) El **aspecto** del selector de presentación: los e2e comprueban que cambia el precio, que hay 3 opciones y que con una sola no se dibuja, pero nadie mira el realce de `:has(input:checked)` ni los 44px de alto de la fila |
| Desplegado | **no.** Nunca se ha desplegado. No hay proyecto de Vercel creado |
| Base de datos | Neon Postgres migrada y sembrada con el catálogo real el 12 ago: **23 filas en `products` y 60 en `product_variants`** (`npm run db:migrate && npm run db:seed`). El build posterior no imprime ningún aviso de fallback, así que la lectura viene de Postgres |
| Lanzable | **no**: faltan testimonios reales, métrica defendible, panorámica original y dominio/hosting. Los precios ya **no** bloquean. Ver [🔴](#-bloquea-el-lanzamiento) |

---

## Hecho

### Cimientos

Tokens de color con los tres roles del ámbar, escala tipográfica, componentes base, formato de moneda
y el pipeline de imágenes.

- `styles/01-tokens.css` es la **única** fuente de verdad de los colores. `lib/tokens.ts` lo lee con
  `node:fs` en build y `lib/color.ts` recalcula los ~25 pares de contraste en cada `npm test`.
- `lib/format.ts` — `formatCRC`, `formatCRCShort`, `formatFrom`. Agrupación manual por regex,
  **nunca `Intl`**.
- `scripts/extract-pdf-images.py` extrae las 37 fotos del PDF de Instagram con sólo la stdlib, y las
  empareja con su permalink posicionalmente por página (validado 37/37).
  `scripts/build-images.mjs` genera los derivados con sharp; nunca hace upscale, aborta si un tamaño
  supera el recorte.
- `/dev/tokens` es la página de especímenes (`force-static`, `noindex`).
- `--header-h` (101px, 115px a ≥1280) es la altura de la cabecera. La navbar es `position: fixed` y
  no ocupa sitio en el flujo, así que todo lo que empiece por debajo de ella depende de este token.
  Si cambia el tamaño del logo en `10-navbar.css`, cambia aquí.
- `--text-ghost` es el estado «aún no revelado» del `ScrollColorText`.

Verificado por `tests/unit/contrast.test.ts` (33), `tests/unit/format.test.ts` (8) y
`tests/unit/css-vars.test.ts` (3), este último añadido porque tres `var()` apuntaban a variables
inexistentes sin que nada lo detectara: una referencia sin fallback a una variable no declarada no
degrada, tumba la propiedad entera en silencio.

### Bloque de quick wins UI/UX

Ejecutados los 14 quick wins de `docs/implementation_tasks.md` en la rama `ui/quick-wins`.
**7 se ejecutaron; 6 no se reproducían o ya estaban cerrados; 1 se rechazó por chocar con el spec.**
El desglose por tarea, con la medición de cada descarte, está en el §4 de ese documento.

Los dos hallazgos de más valor no estaban en la auditoría: las tres variables `var()` rotas y
`.section--no-bottom` sin efecto en dos de los tres breakpoints (el atajo `padding-block` de los
overrides responsivos lo pisaba por orden de aparición).

**Por qué la foto del hero no es el elemento LCP, y no hay que "arreglarlo".** Chrome excluye de LCP
las imágenes cuyo rectángulo cubre el viewport entero, porque a esa escala casi siempre son fondo
decorativo. Desde que el hero es full-bleed, la foto entra en esa categoría — y el heurístico acierta:
va desenfocada 2px, atenuada al 74% y bajo dos gradientes; el contenido es el titular de encima. El
LCP real es texto del hero, a ~1.1s contra un presupuesto de 2.5s. Comprobado dándole `height: 85%`:
con eso vuelve a ser candidata al instante. **No encoger la imagen para que "vuelva a contar"**: no
mejora nada para el usuario, sólo engaña a la métrica. Lo fija `seo-perf.spec.ts`, que ahora afirma
que el LCP cae DENTRO del hero, no que sea la foto.

### La portada

Las 9 secciones del spec §6 en orden fijo, en `app/page.tsx`.

- `components/sections/` — Hero, Statement, MediaText, OverlapMenu, Service, Gallery, Testimonials.
  7 son Server Components; sólo `ParallaxTrack` y `TestimonialsSlider` son de cliente.
- Reveal por un **único** IntersectionObserver compartido (`lib/revealObserver.ts`) para ~30 nodos.
- Parallax de galería con bucle rAF autosostenido, cerrado por IntersectionObserver y
  `visibilitychange` — no escucha `scroll`. La tabla del spec §4.2 vive en `lib/parallax.ts` con
  interpolación lineal por tramos.
- Slider de testimonios sin librería: la aritmética de breakpoints está en CSS, el JS sólo inyecta
  `--i`.
- Nav con patrón *disclosure* (no `role="menu"`), 3 dropdowns + 1 enlace, `Catálogo` como enlace real
  a `/tienda`, búsqueda GET a `/tienda?q=...`, carrito estable y CTA de WhatsApp. A ≤991 mantiene
  drawer de 320px con focus trap y scroll lock.
- **Las opciones del drawer son filas pulsables enteras, a sangre** (`styles/10-navbar.css`, bloque de
  ≤991). Fila de 320px con el texto a **16px** del canto en el primer nivel; fila de 304px sangrada con
  el texto a **34px** en el subítem; ≥44px de alto los dos, por `min-height` y no por la suma de línea y
  padding. La jerarquía la llevan la tipografía (18px/600 vs 16px/500) y la sangría de la propia barra,
  no el espacio en blanco. Hover y `:focus-visible` añaden fondo `--primary-light`, tinta `--gold-ink` y
  una barra de 3px `--gold-line`, con el texto desplazado por `transform` sobre un `.nav-label`. Desvíos
  D-27, D-28 y D-29. Medido a los 8 anchos por `interactions.spec.ts`. El ✕ de cerrar va en el mismo
  carril de 16px por el otro lado: las filas van a sangre y el `space-between` del `.close-button-wrap`
  lo empujaba hasta pegarlo al canto del panel.
- **Tres bugs del drawer corregidos por el camino**, los tres silenciosos:
  1. `.nav-menu` no anulaba el `align-items: center` de la base al girar a columna en ≤991, así que
     `.nav-overlay-mobile` se dimensionaba al contenido y **quedaba centrado** en el panel: las filas
     medían ~213px flotando dentro de los 320 y la sangría izquierda dependía de la etiqueta más larga.
     Es la causa real de que el menú se viera desalineado. Ahora `align-items: stretch`.
  2. `.nav-dropdown-list` medía `width: 320px` dentro de una caja más estrecha y sacaba scroll
     horizontal dentro del panel.
  3. `99-a11y.css` forzaba `transition: color 0.3s` sobre `.nav-dropdown-link` justificándolo por un
     `margin-left` que ya no existe: recortaba el fundido del fondo y dejaba el del texto.
  El ancho del panel **no** cambia: sigue en 320px, que es lo que afirma `interactions.spec.ts`.
- Lightbox con `<dialog>` nativo, por **delegación** de eventos sobre los `data-lightbox` que
  renderiza el servidor.
- SEO local: JSON-LD `Bakery` + `WebSite` (`lib/seo.ts`), `opengraph-image.tsx` generada en runtime,
  `robots.ts` y `sitemap.ts`.

Verificado por `tests/e2e/geometry.spec.ts` (11), `interactions.spec.ts` (17), `lightbox.spec.ts` (4)
y `seo-perf.spec.ts` (10), a los 8 anchos.

### El catálogo real de Ale: 23 productos con 60 presentaciones

**Se sustituyó el catálogo de andamio por el que entregó Ale** en
`data/boquita_products_catalog.xlsx` (23 productos, 60 filas) más 24 fotos nombradas por SKU. Es el
bloque que cierra `CONTENT_TODO §2`: **ya no queda ningún `priceTodo` en el repo**.

Lo que el modelo anterior no sabía representar, y ahora sí:

- **Un producto tiene varias presentaciones, cada una con su precio.** `ShopProduct.unit` (una cadena)
  pasa a `variants: ProductVariant[]`. En Postgres son **dos tablas**: `products` y
  `product_variants`, con PK `(slug, unit)` — la misma identidad que una línea del carrito, así que
  dos presentaciones con la misma etiqueta son imposibles y no sólo improbables.
- **`price` es el precio de ENTRADA**, espejo del mínimo de `variants`. Lo sostienen dos `.refine()`
  de `content/shopSchema.ts`: uno comprueba que sigue siendo el mínimo y otro que con más de una
  presentación el precio se muestra «desde». Sin ellos la tarjeta podría anunciar un importe que el
  selector de la ficha no ofrece, y eso no se ve hasta que un cliente reclama.
- **`summary` desaparece.** El Excel trae UNA descripción por producto; la tarjeta usa
  `description[0]`. Tener dos campos con el mismo texto es la duplicación que este proyecto ya se
  comió una vez con los precios de la portada.
- **Campos nuevos:** `ingredients` (se publica en la ficha), `subcategoria` (`Cupcakes`,
  `Personalizado`) e `imageB`, la segunda foto del personalizado.
- **Las categorías bajan de 5 a 3** — `Queques`, `Galletas`, `Dulces` —, que son las de la columna
  `category`. Desaparecen `bocaditos`, `salado` y `sin-gluten-keto` con sus 7 productos inventados.
  `OCASIONES` **no cambia**: los 6 slugs del Excel ya eran los 6 del dropdown.
- **La ficha lleva selector de presentación** (`components/cart/ProductPurchase.tsx`, sustituye a
  `AddToCartButton.tsx`): radios y no `<select>` porque los tres precios tienen que verse a la vez
  para poder compararlos. El precio vive en ese estado porque depende de él, y la descripción se le
  pasa como `children` para que siga siendo del servidor y no cambie de sitio. Desvíos D-30, D-31 y D-32.
- **La línea del carrito se identifica por `(slug, unit)`.** `CART_STORAGE_KEY` sube a
  `boquita.cart.v2`: la forma de `CartLine` no cambió, pero **todos los slugs sí**, y un carrito de
  productos que ya no existen es un pedido mal enviado.
- **El JSON-LD pasa a `AggregateOffer`** con `lowPrice`/`highPrice` cuando hay varias
  presentaciones. Publicar 2.500 a secas cuando el mismo queque llega a 24.000 sería anunciar un
  precio que no existe para el tamaño que la mayoría pide.
- **La búsqueda mira también ingredientes y presentaciones**: «monk fruit», «dátiles» o
  «24 unidades» son búsquedas reales que el nombre del producto no contiene.
- **Migración `drizzle/0001_catalogo_de_ale.sql`, escrita a mano sobre la generada.** Recrea la tabla
  en vez de alterarla: Postgres no sabe quitar valores de un enum y `categoria` pierde tres. Es seguro
  porque todo lo que había venía de la semilla — el propio SQL lo dice y advierte de cuándo deja de
  serlo.
- **Las presentaciones se borran y reinsertan al sembrar**, no se upsertan: un upsert dejaría vivas
  las que el catálogo ya no tiene y la ficha seguiría ofreciendo un tamaño retirado.
- **Fotos:** las fuentes salen de `assets/products/` nombradas por SKU, no del PDF de Instagram. Los
  23 `alt` se escribieron **mirando cada foto**. Dos fuentes son miniaturas de ~400px y sólo emiten un
  escalón: en vez de falsear el segundo por upscale, el esquema admite `srcSet` de 1 y los dos
  productos van `photoTodo` (`CONTENT_TODO §4b`).

- **La tarjeta del catálogo tiene superficie, alineación izquierda y CTA** (desvío D-33,
  `components/shop/ProductCard.tsx`): foto a sangre arriba, zona de texto sobre `--primary-light`, y
  al fondo una fila con «desde ₡ X» a la izquierda y un botón **«Pedir»** a la derecha que lleva a la
  ficha. Al pasar el ratón por cualquier parte de la tarjeta la foto escala a `1.06`, recortada por
  `.shop-card-media` (`overflow: hidden`); el realce va envuelto en `@media (hover: hover) and
  (pointer: fine)` con `:focus-visible` fuera, y **está enumerado en el kill-switch de
  `styles/99-a11y.css`** — ese bloque va selector por selector y su `*` final sólo apaga
  `animation-*`. El botón usa `.btn--sm` (nueva variante en `styles/05-components.css`, 46px).
- **Las filas siguen cuadradas** entre columnas: foto, arranque de la descripción, línea de etiquetas
  y fila de precio coinciden de altura aunque las descripciones midan 2 o 4 líneas. Lo sostienen
  `min-height: 2lh` en el nombre y `flex: 1` en la descripción, sin ningún alto escrito a mano; a una
  columna el reservado del nombre se anula. ⚠ Lo que el `min-height` cuadra ya **no** es el precio
  —que va anclado al fondo— sino el arranque de las descripciones.
- **La tarjeta es un componente compartido**, no dos copias: la 404 la pinta con `showTag={false}`.
  Antes eran dos bloques de JSX duplicados que ya habían divergido.
- El titular es **«Catálogo de productos»**, y con él el enlace de vuelta de la ficha.

Verificado por `tests/unit/variants.test.ts` (13), `shop.test.ts` (41), `catalog.test.ts` (22),
`shopSearch.test.ts` (7) y `whatsapp.test.ts` (29), más los e2e de `tienda.spec.ts` — que ahora
incluyen que el selector cambia el precio, que dos presentaciones del mismo producto son dos líneas
del carrito, que volver a añadir la misma suma en la que ya existe, que las tarjetas de una fila
alinean descripción, etiquetas y fila de precio, que la fila de precio es el suelo de las 23, que el
precio y el botón no se desbordan a ningún ancho, que la tarjeta no reintroduce el bullet del `li`
global, que el acercamiento se dispara desde la zona de texto y que decae bajo
`prefers-reduced-motion`.

### Tienda, fichas y carrito

- `/tienda` con filtros de categoría, ocasión y búsqueda `q` **combinables** por `searchParams`,
  valores inválidos ignorados y estado vacío propio.
- `/tienda/[slug]` — las 23 fichas con `generateStaticParams`, `generateMetadata` async con OG, y
  JSON-LD `Product` con `availability: PreOrder`.
- Carrito en `localStorage` con clave versionada `boquita.cart.v2` (`lib/cart.ts`, Zustand +
  `persist`, `skipHydration`). El badge no se pinta antes de rehidratar, para no romper la hidratación.
- Checkout por WhatsApp (`lib/whatsapp.ts`): el botón final es un `<a href>` real a `wa.me` con el
  pedido escrito, con fallback a mensaje compacto si pasa de **1600** caracteres codificados. La fecha
  mínima sale del lead time más largo del carrito.
- **El mensaje va estructurado con emoji y bloques titulados** («Hola, Ale 👋» · `🛍️ Nuevo pedido` ·
  `📋 Detalle del pedido` con dos líneas por producto —`• N × Nombre` y `└ Presentación — importe`— ·
  `💰 Total:` · el bloque del cliente · `📌 Solicitud:` · `🌐 Generado desde boquita.cr`). **Las
  etiquetas son un contrato, no decoración:** hoy lo lee Ale y más adelante lo va a parsear un chatbot,
  así que hay un dato por línea y un rótulo fijo delante. Añadir un campo es seguro; renombrar uno rompe
  al consumidor, y el `LABEL` de `lib/whatsapp.ts` lo dice donde se va a leer.
  - La negrita lleva **un** asterisco, que es lo que entiende WhatsApp; con dos se ven literales en el
    chat. Un test lo afirma (`no.toContain("**")`) porque es el error natural de quien escribe Markdown.
  - **El enlace va a `api.whatsapp.com/send?phone=…&text=…` y NO a `wa.me`, y esto es un hallazgo
    medido, no una preferencia.** Con `wa.me` los 8 emoji llegaban al chat como `�`: su redirección
    descodifica la query y la vuelve a codificar con un codificador que **no maneja pares surrogados**,
    así que se come todo carácter de 4 bytes en UTF-8. Lo que se envía y lo que quedaba tras el salto:

    ```text
    enviado:  …text=Hola%2C%20Ale%20%F0%9F%91%8B%0A%0A…
    tras wa.me: …text=Hola%2C+Ale+%EF%BF%BD%0A%0A…
    ```

    Los espacios pasaron de `%20` a `+` y el `*` de literal a `%2A`: la huella de la recodificación.
    Sobrevivía **todo** lo de 1-3 bytes (`•`, `×`, `└`, `—`, `₡`, la `ñ`) y se perdían **sólo** los emoji.
    Enlazando al endpoint final no hay salto que recodifique. Lo fijan dos tests que exigen que la URL
    no contenga `wa.me`, que lleve `%F0%9F%91%8B` y que no lleve `%EF%BF%BD`.
  - El importe conserva el espacio (`₡ 2.250`) y sigue saliendo de `formatCRCShort`: una sola forma de
    escribir un precio en todo el proyecto.
  - La fecha se muestra `DD/MM/YYYY` y se convierte partiendo la cadena, **sin `Intl`**, por el mismo
    motivo que la moneda. `earliestDate` sigue devolviendo ISO porque alimenta el `min` del
    `<input type="date">`, que sólo acepta ese formato; hay un test que fija las dos cosas.
  - **El techo de 1600 sale de medirlo, no de intuición.** Con el formato nuevo cada producto cuesta
    ~110 caracteres codificados y la cabecera fija ~585: 2 productos → 805, 4 → 1023, 6 → 1249, 8 →
    ~1470. Con el 1400 anterior **un pedido de 8 productos perdía el detalle**. Lo vigila un test que
    mide un carrito de 8 y exige que no se trunque.
- **El carrito no se vacía al pulsar** — se vacía con un botón explícito de «ya hice mi pedido».
- Los productos a convenir (queque personalizado) no entran al carrito: su CTA va directo a WhatsApp.

Verificado por `tests/unit/whatsapp.test.ts` (18), `tests/unit/shop.test.ts` (17) y
`tests/e2e/tienda.spec.ts` (37 casos por ancho).

### Páginas de texto y límites de error

- `/sobre-nosotros` — historia, zonas de entrega y 8 FAQ, con JSON-LD `FAQPage` + `AboutPage`.
- `/aviso-legal` — con `robots: noindex, follow`.
- `app/not-found.tsx` sugiere **3 productos del catálogo servido**, porque los enlaces viejos de
  Instagram van a aterrizar ahí.
- `app/error.tsx` y `app/global-error.tsx`. El global emite sus propios `<html>/<body>` con estilos
  inline: no puede contar con que el CSS ni las fuentes hayan cargado.

Verificado por `tests/e2e/paginas.spec.ts` (12).

### Accesibilidad

Cero violaciones de axe en **9 estados** (portada en reposo, con lightbox abierto, con dropdown
desplegado, con drawer abierto, carrito con productos, catálogo, ficha, sobre-nosotros, aviso-legal),
sobre `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` y `wcag22aa`.

Tres cosas que axe **no** ve y por eso se afirman a mano (todas de UI-096/027/031):

- El anillo de foco del buscador. Un `outline:0` deja el elemento perfectamente accesible en el
  árbol, sólo invisible para quien navega con teclado. Va en el contenedor y no en el input, porque
  `.nav-search` tiene `overflow:hidden` y recortaría el anillo por la mitad.
- El H2 del carrito precede al H1 en el DOM, pero el drawer cerrado lleva `inert` y
  `visibility:hidden`: no llega al árbol de accesibilidad. El test fija esa condición, porque si
  alguien la quita el problema pasa a ser real.
- `aria-disabled` en steppers y flechas es deliberado —un `disabled` real manda el foco al `<body>`
  al llegar al extremo—, pero no deshabilita nada por su cuenta: el no-op lo sostiene el handler, y
  hay test que lo comprueba.

Verificado por `tests/e2e/a11y.spec.ts` (9).

### El catálogo en Postgres

**El camino de lectura está completo y la Neon configurada tiene las dos tablas del catálogo.**

- Neon Postgres en AWS `us-east-1` (misma región que `iad1` de Vercel; no se puede cambiar después),
  driver HTTP `@neondatabase/serverless` + `drizzle-orm/neon-http`.
- `lib/db/schema.ts` — 2 tablas (`products` y `product_variants`), 3 `pgEnum` derivados de
  `types/shop.ts`, **9 `CHECK` en `products` y 2 en `product_variants`**. `price` es `integer`, nunca
  `numeric` (el driver lo devolvería como `string`). La base guarda `image_heights` + `image_alt`,
  **no rutas**: el `srcSet` se reconstruye con `lib/productImage.ts`.
- `lib/db/catalog.ts` es la **única** lectura, y revalida cada fila con el mismo Zod que valida el
  catálogo estático (`content/shopSchema.ts`). Son **dos `SELECT` en paralelo**, no un JOIN: el JOIN
  devolvería el producto repetido una vez por presentación —60 filas con la descripción entera en cada
  una— y habría que deshacerlo en memoria igual.
- **La tienda nunca se sirve vacía.** Sin `DATABASE_URL`, con la tabla vacía o con la consulta caída
  se sirve `content/products.ts` completo; una fila que no pasa Zod se sustituye por su versión del
  fallback; una fila mala que no está en el fallback se omite con aviso, no se inventa.
- `lib/homeContent.ts` **deriva** de la base las 2 cosas de la portada que dependen del catálogo —la
  rejilla de 8 y la métrica de «recetas»— en vez de copiarlas. Si un destacado no está en
  el catálogo servido, se rellena con otro producto **del propio catálogo**, nunca del fallback (daría
  404).
- ISR de 1 h declarado en `app/layout.tsx` (el nav y varias páginas comparten contenido global que
  puede depender de la tabla) y **repetido** en `app/sitemap.ts`, porque las rutas de metadata no lo heredan.
- Migraciones versionadas: `drizzle/0000_grey_hex.sql` y `drizzle/0001_catalogo_de_ale.sql`. La
  segunda está **escrita a mano sobre la generada** porque `drizzle-kit generate` no puede resolver sin
  preguntar si una columna se renombró o se cambió; recrea la tabla en vez de alterarla, y el propio SQL
  explica por qué es seguro hoy y cuándo deja de serlo. Semilla idempotente
  (`ON CONFLICT (slug) DO UPDATE`) en `scripts/seed-catalog.ts`, con las presentaciones borradas y
  reinsertadas por producto.
- Verificación real del 12 ago: con la tabla vieja, el build imprimía
  `column "subcategoria" does not exist` y `relation "product_variants" does not exist` y **servía el
  fallback completo** — el camino de degradación funcionando en un caso real, no simulado. Tras
  `npm run db:migrate` y `npm run db:seed` (23 productos, 60 presentaciones), el build no imprime
  ningún aviso.

Verificado por `tests/unit/catalog.test.ts` (22) y `tests/unit/homeContent.test.ts` (12).

### Rendimiento, medido

En el build de producción, no estimado:

| | 1440px | 390px |
| --- | --- | --- |
| LCP | 140 ms | 148 ms |
| CLS | 0.0004 | 0.0000 |
| Primera carga | 805 KB | 465 KB |

Presupuestos: LCP < 2.5 s · CLS < 0.05 · < 1.2 MB. Las 14 celdas de la galería generan **8**
descargas, no 14. Todo ello afirmado por `tests/e2e/seo-perf.spec.ts`.

### Documentación y protocolo de estado

Este fichero es el único sitio donde vive el estado, y `CLAUDE.md` obliga a leerlo antes de trabajar
y a actualizarlo al cerrar cada bloque.

- `CLAUDE.md` en la raíz — el protocolo, las seis cosas que **rompen en silencio**, los comandos, el
  mapa de documentos y el aviso de que los números de fase no son de fiar: hay dos numeraciones
  distintas y ninguna describe la realidad.
- La sección «Estado» del `README.md` se redujo a un enlace a este fichero, y sus recuentos de tests
  también: dos listas de estado divergen siempre. `docs/CONTENT_TODO.md` y `docs/DEVIATIONS.md`
  siguen siendo dueños de su detalle, y aquí sólo se referencian.
- De paso se corrigieron dos afirmaciones falsas del README: decía que se usaban CSS Modules en
  `CartDrawer`, `Lightbox` y `NavScrim` —no hay ni un `*.module.css` en el repo, y `NavScrim` nunca
  existió como componente—, y mantenía como invariante la «tarjeta CTA crema hermana de
  `.footer-dark`», que desapareció al rehacer el pie como cierre editorial.

---

## Pendiente

### 🔴 Bloquea el lanzamiento

Nada de esto es código. Detalle completo en `docs/CONTENT_TODO.md`.

| | Qué falta | Dónde |
| --- | --- | --- |
| 1 | **Los 6 testimonios reales**, con nombre/rol/texto. El consentimiento está aprobado, pero falta el texto fuente: Instagram no es legible desde el PDF ni desde este entorno sin login | `CONTENT_TODO.md §3` |
| 2 | **La métrica nº 1** («2.400+ pedidos desde 2019») necesita un número real y defendible | `CONTENT_TODO.md §4` |
| 3 | **La panorámica del mostrador a resolución original** (mín. 2340px de ancho). La del PDF se usa para v1, pero no verifica 2× | `CONTENT_TODO.md §5` |

✅ **Los precios ya no bloquean.** Ale entregó la lista completa y está cargada; no queda ningún
`priceTodo` y hay un test que falla si vuelve a aparecer uno. Sigue habiendo un test que impide
publicar testimonios inventados (`tests/unit/content.test.ts`).

Dos cosas de foto que **no** bloquean pero conviene cerrar: los originales de `QUE-03` y `QUE-010`,
que llegaron como miniaturas de ~400px, y una foto propia de los cupcakes de banano — la que hay venía
de un blog ajeno y se le recortó la marca de agua. Detalle en `CONTENT_TODO.md §4b`.

✅ Cerrado en P2: contacto público, WhatsApp `+506 7132 2355`, dirección de retiro, Instagram
`@boquita_cr`, logo transparente y variante clara generados desde `assets/logo-boquita.jpg`.
Las reseñas ficticias se retiraron del render público: la sección queda oculta hasta recibir textos
reales.

### 🟠 Bloquea operar el sitio

**Nada invalida la caché.** `CATALOG_CACHE_TAG` está definido en `lib/db/catalog.ts:77` y aplicado
como tag en la línea 127, pero **`revalidateTag` y `revalidatePath` no se llaman en ningún sitio del
repo** — sólo se mencionan en dos comentarios (`app/layout.tsx:77`, `lib/db/catalog.ts:76`).
Consecuencia real: un precio corregido tarda **hasta 1 hora** en verse.

**Cero superficie de escritura.** No existe ningún `route.ts`, ninguna Server Action (`"use server"`
no aparece en el repo) ni `/admin`, aunque `app/robots.ts` y `vercel.json` ya los reservan. Hoy la
única vía de escritura es `npm run db:seed` o un `UPDATE` en el SQL Editor de Neon — y `db:seed`
**pisa** la tabla, así que revierte cualquier corrección hecha por SQL.

### ⏳ Desarrollo por hacer

| Bloque | Qué implica |
| --- | --- |
| **Panel de administración** | La pieza que cierra las dos anteriores. Auth: `.env.example` reserva `AUTH_SECRET`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_TTL_HOURS`, `ADMIN_TOKEN_VERSION` — y **el script que genera el hash no existe todavía**. Los 8 `CHECK` de la tabla ya están puestos precisamente para proteger este borde de escritura |
| **Newsletter** | El formulario está maquetado y **no envía** (`components/layout/Footer.tsx`). Reserva `FORM_HMAC_SECRET`, `IP_SALT`, `RATE_LIMIT_NEWSLETTER_PER_DAY`. **Ojo: `/aviso-legal` promete hoy que no se guardan datos en servidor propio. Esa página se reescribe ANTES de insertar la primera fila** |
| **Despliegue** | Nunca se ha desplegado. El remoto git ya existe, pero falta elegir dominio/hosting. Aviso: **Vercel Hobby es de uso no comercial** y una tienda que vende es comercial; puede exigir el paso a Pro. Por eso todo el acceso a base de datos está detrás de `lib/db` y la cuenta de Neon es propia, no del marketplace: migrar a Cloudflare Pages es cuestión de días |
| **Fotos de producto en Blob** | `next.config.ts:13` deja pendiente `remotePatterns`. `next/image` está reservado para estas fotos (es la única excepción a D-9) y `eslint.config.mjs:46` lo documenta |
| **D-11 · `100svh`** | Condicional: sólo si el salto de la barra de direcciones de Safari en iOS se juzga inaceptable en un pase con dispositivo real. En escritorio son idénticos |

### Notas de alcance

Cosas que hoy están bien pero conviene saber antes de tocarlas:

- **Sólo el catálogo está migrado** (`products` + `product_variants`). Todo el resto del contenido
  sigue siendo estático: el copy de la portada y los 6 testimonios en `content/home.ts`, `about` y
  `legal` en `content/pages.ts`. No hay tablas para nada de eso, y probablemente no deba haberlas hasta
  que alguien las necesite editar.
- **El panel de administración, cuando exista, tiene que editar DOS tablas.** Un formulario que sólo
  toque `products` puede dejar el precio de entrada sin corresponder con ninguna presentación; Zod lo
  rechazará al leer y la fila caerá al fallback, que es el comportamiento correcto pero se vive como
  «guardé y no cambió nada». El `CHECK` de `product_variants` cubre el precio; la coherencia entre las
  dos tablas **no** se puede expresar como CHECK y hoy sólo la vigila el borde de lectura.
- **Aparecieron dos aristas del Excel que se resolvieron por decisión, no por código**, y conviene
  saberlo antes de volver a importarlo: `DUL-019` trae una tercera fila con otro nombre
  («Mousse de Chocolate S/Azucar») que se trató como una presentación más del mousse, y los cupcakes
  traen las tres filas con el mismo `sale_unit` y sólo se distinguen por `package_quantity`. Un
  reimport ciego del Excel volvería a plantear las dos.
- **`components/cart/CartDrawer.tsx` importa `findProduct` del catálogo estático.** Es inevitable —es
  Client Component y el catálogo ya no vive en el cliente— y es el respaldo para líneas de carrito
  antiguas sin `leadTimeHours`. Pero significa que un lead time cambiado en la base **no** se refleja
  en ese cálculo de fecha mínima.
- **`lib/seo.ts` y `app/layout.tsx` leen el `home` estático** para el JSON-LD del negocio y el preload
  del hero. Correcto hoy; no son datos de la base.

Aparecidos al rehacer las filas del drawer (11 ago), ninguno tocado:

- **`styles/18-footer.css:101` y `:132` piden `font-weight: 700` de Libre Franklin, que no se descarga.**
  `app/fonts.ts:33-43` carga 400/500/600. D-1 documenta los pesos omitidos pero **no menciona éste**, así
  que `.footer-col-title` y el `span` de `.footer-contact-link` no rinden el 700 que piden. En el drawer
  se usó el 600 justamente por esto.
- **El deslizamiento del drawer no está en el kill-switch de movimiento.** `styles/99-a11y.css` cubre
  `.reveal`, `.track`, `.slider-mask`, `.play-ring--h`, `.navbar` y los enlaces del nav, pero el
  `transform 0.3s` de `.nav-menu` no: con `prefers-reduced-motion` el panel de 320px **sigue
  deslizándose**. El `*` de ese bloque sólo neutraliza `animation-*`, así que el scrim queda cubierto
  y el panel no. Hueco real y previo a este cambio.
- **`aria-expanded` miente en el drawer.** `components/layout/Navbar.tsx:58` hace
  `const hidden = !isOpen && !(dropdown.href && !hoverEnabled)`: en móvil, `Catálogo` tiene `href`, así
  que su lista sale desplegada de entrada mientras el toggle sigue anunciando `aria-expanded="false"`.
  Desajuste aria↔visual. Axe no lo marca porque el atributo es válido; se ve a mano.
- **`.close-button` no tiene hover propio ni área de 44px.** El SVG mide 20×20 y sólo hereda el anillo
  de foco global. Es el único control del drawer que se quedó fuera de este pase, por no ser una opción
  del menú.

Aparecidos al rediseñar la tarjeta del catálogo (12 ago), ninguno tocado:

- **`CARD_SIZES` miente en la banda 640-767px, y ahora se nota más.** `.shop-grid` pasa a UNA columna
  en `max-width: 767`, pero `lib/productImage.ts` declara `(min-width: 640px) 45vw`: a 700px de
  ventana la foto se renderiza a ~670px y el navegador se baja el derivado de **400**. Es previo al
  rediseño, pero con la foto convertida en el elemento dominante de una tarjeta con superficie, esa
  foto blanda se ve. El arreglo es cambiar `640` por `768`, y mueve las descargas de todas las
  páginas: no se hizo aquí a propósito.
- **`.btn:hover` no está envuelto en `@media (hover: hover)`** (`styles/05-components.css`). En táctil
  el botón se queda blanco después de tocarlo y no vuelve. Con 2-3 botones por página pasaba
  desapercibido; ahora son **23 en la vista principal de compra**. Tocarlo es cambiar el botón global,
  así que es decisión aparte.
- **El nombre del producto sigue siendo un `<span>`** y no un encabezado real (UI-062, abierta). No se
  cambió en este pase porque afecta al árbol de encabezados que audita `a11y.spec.ts`.
- **Dos tab stops por tarjeta**, 46 en `/tienda`: la foto+nombre y el «Pedir» llevan al mismo sitio.
  No es violación de WCAG y axe no lo mira (`identical-links-same-purpose` es `wcag2aaa`), pero es
  verbosidad real para quien navega con teclado. Registrado en D-33.

**Corregidos al alinear las tarjetas del catálogo (12 ago).** Dos no-ops silenciosos, los dos de la
familia del bug del drawer:

- **`.shop-card` no anulaba el `align-items: center` del `li` global** (`styles/03-base.css:167`).
  Sobreescribía `display`, `padding`, `background`, `color`, `font-size` y `font-weight`, pero no ese.
  En un flex en columna eso encoge cada hijo al ancho de su texto, así que el precio y la línea de
  etiquetas **se veían centrados sin que nadie lo hubiera pedido** y el nombre y la descripción a la
  izquierda. Ahora la tarjeta declara `align-items: stretch` y `text-align: center` a propósito.
- **`.shop-card-name` es un `<span>` sin `display`, así que su `margin-top: 14px` no se aplicaba.**
  El aire entre la foto y el título era interlineado. Con `display: block` el margen empieza a valer —y
  con él el `min-height: 2lh` que reserva dos líneas para que la fila del precio cuadre entre columnas
  aunque un nombre se parta—.

Lo que de verdad protege esto es `tienda.spec.ts`: un test nuevo afirma que las tarjetas de la primera
fila tienen precio y etiquetas a la misma `y`, a los 5 anchos con más de una columna.

Aparecidos al cargar el catálogo de Ale (12 ago), ninguno tocado:

- **El ancla `#entregas` de `/sobre-nosotros` no siempre respeta su `scroll-margin-top`.** Es el
  intermitente de la tabla de arriba: ~6 de 24 cargas dejan el titular a 12px del borde en vez de a
  131px, tapado por el navbar fijo. Medido con sonda, y **no lo causa este bloque**: los cambios de
  `content/pages.ts` están todos en el FAQ, que se renderiza DESPUÉS del ancla, y la página tiene sitio
  de sobra para desplazarse (`scrollY` 1861 de 3481). Es una carrera con el desplazamiento del router.
- **`navidad` y `baby-shower` tienen un solo producto cada una.** Los polvorones y el queque
  personalizado. Los filtros funcionan pero muestran una tarjeta. Es lo que dicen los datos, no un bug;
  anotado en `CONTENT_TODO.md §11` para revisarlo con Ale.
- **`assets/logo-boquita-150.jpg` llegó con las fotos y no se usa.** Mide 150×150 y el logo del
  pipeline mide 816×816, de donde salen el icono de 512 del manifest y el `apple-icon` de 180.
  Sustituirlo sería perder resolución. Se conserva por si acaso, documentado en `IMAGE_MAP.md`.
- **`.gitignore` pasa de `/assets/` a `/assets/*` + `!/assets/products/`.** Las 24 fotos de Ale son la
  única excepción a «los originales van fuera del repo»: las 37 de Instagram se regeneran del PDF,
  estas no. El cambio de `/assets/` a `/assets/*` no es cosmético — excluir el directorio impide que
  git descienda en él y la negación no surte efecto.

---

## El árbol de trabajo ahora mismo

El bloque de base de datos ya está listo para quedar commiteado: migración, seed, lectura con fallback,
derivación de la portada y tests unitarios/e2e se verificaron juntos el 5 ago.

Antes de seguir desarrollando, este comando debe salir vacío:

```bash
git status --short
```

El remoto ya existe. El hábito operativo ahora es simple: cerrar cada bloque con commit y push.

---

## Deuda de etiquetado

**Los números de fase ya no significan nada.** El trabajo se hizo fuera del orden previsto —la tienda
y el carrito, que iban a ser «Fase 4», se construyeron antes que el panel «Fase 3»— así que hay
marcadores que dicen «pendiente de Fase 4» sobre cosas que están hechas desde el commit `35bcff9`.

Por eso este fichero se organiza por bloques y no por números. Marcadores obsoletos, para limpiar
cuando toque:

| Sitio | Dice | Realidad |
| --- | --- | --- |
| `docs/DEVIATIONS.md` D-2 | «⏳ Fase 4» | el botón «Añadir +» está implementado |
| `docs/DEVIATIONS.md` D-3, D-4, D-5, D-10 | «⏳ Fase 1» | la Fase 1 está cerrada; los cuatro están aplicados |
| ~~`docs/IMAGE_MAP.md:195`~~ | ~~«## Fichas de producto — Fase 4»~~ | ✅ corregido al cargar el catálogo de Ale: la sección ya describe las 23 fotos por SKU |
| `lib/hooks/useScrollLock.ts:9` | «(en la Fase 4) el carrito» | el carrito usa el hook ya |
| `components/sections/OverlapMenu.tsx:20` | «ésas son de la Fase 4, en las fichas» | las fichas existen |
| `app/layout.tsx:77`, `lib/db/catalog.ts:76` | «el panel de la fase 3» | el panel sigue pendiente, pero el número ya no ubica nada |

---

## Verificación

| Comando | Qué protege |
| --- | --- |
| `npm test` | 214 unitarios: moneda, contraste recalculado desde el CSS, catálogo y su fallback, presentaciones y su etiqueta compacta, derivación de la portada, búsqueda de tienda, parallax, WhatsApp |
| `npm run typecheck` | `tsc --noEmit`, con `noUncheckedIndexedAccess` |
| `npm run lint` | `eslint .` |
| `npm run build && npm run e2e` | 1.032 e2e a 8 anchos: geometría, interacciones, lightbox, tienda, páginas, SEO, presupuestos y axe. Arranca su propio servidor en el puerto 3100 contra el **build de producción** |
| `npm run images:build -- --check` | valida los recortes sin escribir nada |
| `npm run db:migrate && npm run db:seed` | aplica el esquema y siembra 23 productos + 60 presentaciones. Después, un `npm run build` **sin** avisos de `[catalog]` confirma que la lectura viene de Postgres y no del fallback |

Para desarrollar **no hace falta base de datos**: sin `DATABASE_URL` el catálogo sale de
`content/products.ts` y todo pasa. Es el modo en que correría CI.

---

## Lo que no se va a hacer

Decisiones deliberadas. Están aquí para que nadie las «arregle» por iniciativa propia:

- **No hay blog.** Nada lo enlaza, el contenido lo escribiría quien programa y no Ale, y un blog con
  dos entradas que nunca crece señala abandono más que actividad.
- **No hay pasarela de pago.** Se pide por WhatsApp, que es el canal que la tienda ya usa.
- **No se usa `next/image` para las 15 imágenes del layout** (desvío D-9, descartado por medición: son
  assets fijos con recortes pre-generados). Se reserva para las fotos de producto en Blob.
- **Los avatares de reseñas son SVG con iniciales**, no fotos de stock: inventar caras de clientes
  para un negocio real sería deshonesto.
- **No hay tests de componentes con jsdom.** La geometría se verifica en un navegador de verdad a los
  8 anchos, que es donde fallan las cosas que fallan aquí.
