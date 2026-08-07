# Desvíos respecto a `frontend_spec.md`

El spec es normativo: la estructura, medidas, proporciones, breakpoints y animaciones se replican
al milímetro. Este documento registra **todo** lo que se aparta de él, con su motivo, para que la
revisión de aceptación pueda comprobar cada caso en vez de descubrirlo.

Regla general: si un desvío no está aquí, es un bug.

| #    | Desvío | Motivo | Estado |
| ---- | ------ | ------ | ------ |
| D-0  | Tokens de color re-tematizados a la marca. `--primary` se divide en `--gold` (relleno), `--gold-display` (texto ≥24px), `--gold-ink` (texto <24px), `--gold-line` (trazos) y `--gold-bright` (decorativo sobre oscuro). La etiqueta de `.btn` pasa de blanca a `--text-dark`. `--body-text` de `#707070` a `#6B5B4D`. Crema de `#f5f0ec` a `#FAF5EC`. | Decisión de marca + AA. Blanco sobre `#E8A81B` da **2.09:1**, así que `.btn{background:primary; color:white}` es literalmente inviable. La solución la dicta el propio logo: marrón sobre amarillo. Blindado en `tests/unit/contrast.test.ts`. | ✅ Fase 0 |
| D-1  | No se cargan los pesos 300 y 600 de Cormorant Infant ni el 300 de Libre Franklin. Lato no se carga en la portada. | Ninguna regla del spec los referencia. Lato lo usa un único selector (`blockquote`) y no hay blockquote en la portada. Ahorra ~5 archivos woff2. | ✅ Fase 0 |
| D-12 | Las tres `font-family` literales del spec pasan a variables CSS (`--ff-display`, `--ff-sans`, `--ff-quote`). | `next/font` no permite fijar el nombre de familia. A cambio se autohospedan las fuentes: sin petición a Google, sin render-block de terceros, sin FOUT de red. | ✅ Fase 0 |
| D-6  | El eyebrow `h6.h6-sans` se renderiza como `<p class="h6-sans">`. | Un `h6` antes de un `h2` rompe el orden de encabezados y axe lo marca como violación. Pixel-idéntico: `.h6-sans` ya redefine fuente, tamaño, peso, letter-spacing y transform. | ✅ Fase 0 |
| D-7  | El `h4` de la newsletter se renderiza como `<h2 class="as-h4">`. | El último encabezado del documento es un `h2`; pasar a `h4` salta un nivel. Pixel-idéntico. | ✅ Fase 0 |
| D-8  | El input de la newsletter recibe un `<label>` visualmente oculto. | Un placeholder no es una etiqueta accesible. El markup del spec sólo tiene placeholder. | ✅ Fase 0 |
| D-2  | Se añade un botón «Añadir +» en la fila de `.menu-item-tag`, que pasa a `justify-content:space-between`. | Requisito del carrito. Deja `.menu-item-head` (nombre + precio, `gap:10px`) **byte-idéntico** al spec, que es lo que inspecciona el punto 5 del checklist. | ⏳ Fase 4 |
| D-3  | `will-change:transform` se mueve de `.track` a `.track.is-animating`. | El spec lo pone permanente. Con 14 imágenes serían dos capas compositadas grandes siempre activas, caro en móvil. Invisible y estrictamente mejor. | ⏳ Fase 1 |
| D-4  | Se añade un scrim `.nav-scrim` a ≤991px. | Un panel de 320px sobre contenido vivo no tiene afordancia de cierre ni separación visual. No está en el spec. | ⏳ Fase 1 |
| D-5  | A ≤991px, `.navbar` recibe `background:rgba(255,255,255,.92)` + `backdrop-filter:blur(6px)`. | El navbar es `position:absolute; background:transparent`, y a ≤991 `.hero-img` pasa a ser una foto estática justo debajo: el logo, la hamburguesa y el carrito quedarían sobre la fotografía con contraste desconocido. Necesario para los puntos 13 y 14 del checklist. | ⏳ Fase 1 |
| D-9  | ~~`<div class="hero-img">` envolviendo un `<Image fill>`~~ | **Descartado.** Las 15 imágenes del layout son assets de marca fijos, con recortes ya pre-generados por `scripts/build-images.mjs`. Servirlas con `<img srcset>` plano evita el optimizador de Next por completo (cero cuota de transformaciones, CDN inmutable, comportamiento idéntico en preview y producción) y **el hero conserva el `<img>` del spec sin wrapper**. El `preload` con `fetchpriority="high"` se declara a mano en el `<head>`, y el AVIF se negocia con `<picture>`. `next/image` se reserva para las fotos de producto alojadas en Blob (Fase 4), donde sí hace falta un ladder dinámico. | ❌ innecesario |
| D-10 | `.media` deja de ser `background-image` y pasa a un `<img srcset>` dentro de un `.media` con `position:relative; overflow:hidden`. | Un background CSS no admite `srcset` ni lazy loading, y es una foto de 493×300 que se enviaría a tamaño completo a un móvil de 390px. Se conservan `height:300px` y el centrado flex. | ⏳ Fase 1 |
| D-11 | `.hero{height:100vh}` → `100svh` con fallback `100vh`. | **Condicional**: sólo si el salto de la barra de direcciones de Safari en iOS se juzga inaceptable en el pase de dispositivo real. En escritorio son idénticos. | ⏳ Fase 6 |

## Descubiertos al verificar la Fase 1

Todos éstos salieron de ejecutar la verificación de geometría a los 8 anchos y de
mirar capturas reales. Ninguno se habría visto leyendo el CSS.

| #    | Desvío | Motivo | Estado |
| ---- | ------ | ------ | ------ |
| D-14 | `picture { display: contents }` en el reset | **Imprescindible, no cosmético.** El CSS del spec asume que `.hero-img` es hijo directo de `.hero`, y usamos `<picture>` para ofrecer AVIF. Con el `<picture>` generando caja, el `width:100%` de la imagen a ≤991px se resolvía contra ella —que se dimensiona por contenido— y la foto del hero salía a **315px en vez de 991px**. | ✅ Fase 1 |
| D-15 | `.menu-grid` usa `minmax(0, 1.2fr) minmax(0, 1fr)` en vez de `1.2fr 1fr` | `1fr` es en realidad `minmax(auto, 1fr)`: si el min-content de una columna supera su parte, se la queda. Con los nombres en español las columnas salían **270/380px, o sea 0.71:1**, invirtiendo la jerarquía que exige el punto 5 del checklist. `minmax(0, …)` devuelve el mando a las fracciones. | ✅ Fase 1 |
| D-16 | `.menu-item-head { flex-wrap: wrap }` y el precio con `flex:none` | El diseño de referencia usaba nombres cortos («MARGHERITA»); en español hay algunos de 30 caracteres. Sin esto, el precio se partía por dentro («₡ 14.000 / CRC»), que se lee como un error. Ahora baja entero a la línea siguiente. | ✅ Fase 1 |
| D-17 | El precio del catálogo se muestra sin el sufijo «CRC» | El spec §8 pide **adaptar** el formato a la moneda del proyecto. Con «CRC» el precio no cabía junto al nombre en ninguna columna, y esa misma línea es la firma visual de la rejilla. En un sitio costarricense el símbolo ₡ no deja lugar a dudas. `formatCRC` (con sufijo) se conserva para contextos donde la moneda sí deba ser explícita. | ✅ Fase 1 |
| D-18 | `.media .play-wrap { margin: 0 }` + sombra en los anillos del play | Dos problemas juntos. (1) El spec le da `height:100%` con `margin-top:35px`, lo que dentro del `.media` de 300px con el `overflow:hidden` que introduce D-10 desplazaba el botón 35px bajo el centro y lo recortaba. (2) Los anillos son blancos y el spec asume una foto oscura; la foto disponible es clara y el botón desaparecía. Una sombra los hace visibles sobre cualquier imagen sin cambiar el diseño. | ✅ Fase 1 |
| D-20 | La imagen del hero **no** lleva reveal, aunque el spec §4.1 la incluya en la lista | Dos razones que se refuerzan. (1) Es el elemento LCP: cualquier `opacity:0` inicial lo aplazaría hasta la hidratación. (2) Envolverla en un div reintroduce el bug de D-14 — a ≤991 la imagen es `width:100%` y se resolvería contra el envoltorio en vez de contra `.hero`, saliendo a 315px. Animar la portada no vale ninguna de las dos cosas. | ✅ Fase 1 |
| D-21 | Las flechas del slider usan `aria-disabled`, no `disabled` | Al deshabilitar un elemento que **tiene el foco**, el navegador lo manda al `<body>`. Con `disabled`, un usuario de teclado que llegara al último slide con `End` perdía el foco y las teclas siguientes ya no alcanzaban al carrusel. Con `aria-disabled` el botón sigue enfocable, el lector de pantalla anuncia que no está disponible, y el handler no hace nada. | ✅ Fase 1 |
| D-22 | Con hover activo, el clic en un dropdown del nav **abre** en lugar de alternar | Todo clic de ratón va precedido de un `mouseenter`. Si el clic alternara, el `mouseenter` abriría el panel y el clic lo cerraría acto seguido: el usuario ve el menú colapsarse justo al pulsar la etiqueta. Con hover, cerrar es tarea de `mouseleave`, Escape o un clic fuera; en táctil (sin hover) el clic sí alterna. | ✅ Fase 1 |
| D-19 | `.newsletter-form .input { flex: none }` a ≤479px | **Corrige un conflicto latente del propio spec.** `.input{flex:1}` está pensado para la fila; al pasar a `flex-direction:column` el eje principal es el vertical y `flex-basis:0` gana sobre `height:60px`, así que el input **colapsaba a 21px**. El punto 10 del checklist exige 60px. | ✅ Fase 1 |
| D-23 | La rejilla del catálogo de la portada puede renderizar **menos de 8** productos, contra el punto 5 del checklist | Sólo ocurre si la tabla `products` tiene entre 1 y 7 filas: con la base ausente, vacía o caída se sirve el fallback de 14 y son 8 exactos. La alternativa era rellenar con productos del fallback que no estén en el catálogo servido, y sus tarjetas llevarían a un 404 porque `/tienda/[slug]` resuelve contra el mismo `getCatalog()`. Una rejilla de 6 celdas es un defecto de maquetación; una tarjeta que lleva a un 404 le cuesta un pedido. Se avisa por consola y hay tests que fijan las dos ramas. | ✅ Fase 2 |
| D-24 | El nav ya no usa megamenú de productos; `Catálogo` es enlace a `/tienda` con dropdown de categorías | El flujo real de compra vive en `/tienda`, con filtros y búsqueda. Duplicar los 14 productos en el header hacía ruido y competía con el destino principal. El dropdown queda como ayuda contextual: categorías, sin guiones decorativos y con hover/focus visible. | ✅ Header v1 |
| D-25 | El footer visible cambia de CTA/newsletter solapada a cierre editorial de 4 columnas | La newsletter todavía no tiene backend ni contrato legal final; mostrar un formulario `action="#"` era ruido. El cierre actual prioriza marca, navegación, dirección y contacto real. | ✅ Home v2 |
| D-26 | En el statement, el texto **aún no revelado** (`--text-ghost`) baja a 1.52:1 sobre el crema, por debajo del 3:1 que le tocaría como texto grande | Es el estado transitorio de una animación, y subirlo la mataba. Detalle abajo. | ✅ Home v2 |

## D-26: el estado sin revelar del statement

El `ScrollColorText` de la portada pinta cada palabra dos veces —el fantasma debajo y el color
revelado encima, recortado por el scroll—. En Fase 1 el fantasma estaba en 1.36:1 y la tarea UI-060
lo subió a 3.31:1 para cumplir AA-large. Cumplía el umbral y **mataba el efecto**: al acercarlo tanto
al color final, el salto quedó en 1.65× en el titular y 1.80× en el cuerpo. En pantalla se lee como
que no pasa nada, que fue exactamente el reporte del cliente.

El umbral estaba mirando la mitad equivocada del problema: medía fantasma contra fondo, cuando lo que
decide si el efecto existe es fantasma contra revelado. Se vuelve a `rgba(58,42,26,.22)` (`#cfc8be`),
con lo que los saltos quedan en **3.58×** (titular) y **3.93×** (cuerpo).

Lo que sostiene el desvío:

- **El estado final sí cumple, y con margen**: `--gold-ink` da 5.45:1 y `--body-text` 5.99:1 sobre
  crema. Ambos son AA *normal*, no AA-large, aunque por tamaño les bastaría lo segundo.
- **Con `prefers-reduced-motion: reduce` no existe el estado intermedio**: todo nace revelado, tanto
  por CSS (`12-statement.css`) como por la rama de JS del componente.
- **Sin JavaScript tampoco existe**: `--reveal` vale `100%` por defecto y es la clase `.js` quien lo
  baja a `0%`.
- **Es transitorio por construcción**: el revelado se completa dentro de un scroll de una altura de
  viewport, y el texto queda en su color final mientras se lee.

Lo vigila `tests/unit/contrast.test.ts`, que ya **no** comprueba el umbral absoluto del fantasma sino
el salto entre los dos estados (mínimo 3.5×) más el cumplimiento AA del estado final. Si alguien
vuelve a oscurecer el fantasma «para cumplir mejor», el build cae ahí — que es lo que no ocurrió la
primera vez.

## No son desvíos

Cosas que parecen apartarse del spec pero no lo hacen:

- **`.mt-40` vale 30px, no 40px.** Es una rareza del original y se copia literal
  (`styles/04-layout.css`). Cambiarla desplazaría los botones del hero.
- **`.inline-img` sigue siendo `background-image`**, no `next/image`. Tiene que vivir dentro del
  flujo del `h2` a `height:1em`; ningún `<img>` hace eso sin romper la caja de línea.
- **Los `%` del transform de `.track` se resuelven contra la caja propia** (100% de `.scroller`),
  no contra la tira de contenido que desborda a ~161%. Eso es lo que hacía el original: no se
  «arregla» a px.
- **El `218px` de `.slider-arrow--left` se copia, no se recalcula.** Es `160 + 34 + 24`.
- **Los avatares de reseñas son SVG con iniciales**, no fotografías. No hay caras de clientes
  reales disponibles e inventar personas con fotos de stock sería deshonesto para un negocio real.
  Se respeta el `70×70` cuadrado sin redondear que pide el spec §7.

## Umbral de contraste: WCAG, no el del spec

El checklist §9 punto 13 dice «`#cb6037` sobre blanco sólo en textos ≥18px o bold». WCAG 2.x es más
estricto: «large» es **≥24px, o ≥18.66px en negrita**. Se aplica el umbral real de WCAG.

Consecuencia práctica: `h2` (50/42/34px), `h4` (30/26px), `.text-primary` (86…46px) y `.stat-num`
(50/42/38/36px) sí entran en el carril de 3:1 y usan `--gold-display`. Los precios (18/20px),
nav/search/cart (18px), `a:hover` (20px), `li` (16px), `.h6-sans.primary` (20px), los iconos
sociales y el glifo de las flechas del slider **no**, y usan `--gold-ink` (4.5:1).
