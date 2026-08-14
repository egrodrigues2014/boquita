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

*Última revisión: 14 de agosto de 2026.*

| | |
| --- | --- |
| Rama | `main`, en sincronía con `origin` (`https://github.com/egrodrigues2014/boquita.git`). `ui/quick-wins` ya está fusionada y se puede borrar |
| Último commit | Ver `git log -1 --oneline`; no se duplica aquí porque el hash queda obsoleto al commitear este fichero |
| Sin commitear | **Ocho bloques a la vez, no commitear el árbol entero.** (0) **Los testimonios encendidos** (este bloque): `content/home.ts` (sólo la clave `testimonials`), `components/sections/Testimonials.tsx`, `styles/17-testimonials.css`, `app/page.tsx` (docstring), `components/ui/Avatar.tsx` (**borrado**), `tests/unit/content.test.ts`, `tests/e2e/geometry.spec.ts`, `tests/e2e/interactions.spec.ts` y los docs. (0b) **La galería de 2 a 6 filas**, en vuelo por otra vía: `types/content.ts`, `content/schema.ts`, `content/home.ts` (claves `gallery`/`GALLERY_*`) y el bucle de filas de `geometry.spec.ts`. Los dos comparten tres ficheros —`content/home.ts`, `geometry.spec.ts` y `content.test.ts`— tocando claves y bloques distintos en cada uno. (1) **El statement, cerrado** (este bloque): `components/sections/Statement.tsx`, `components/ui/ScrollColorText.tsx`, `styles/12-statement.css`, `app/page.tsx` (docstring), `tests/e2e/geometry.spec.ts`, `tests/e2e/interactions.spec.ts` y los docs (`ESTADO`, `DEVIATIONS` con D-35, `HOME_CINEMATIC`). `styles/14-overlap-menu.css` **ya no está tocado**: entró en el commit anterior, y esta fila se había quedado atrás. Comparte `app/page.tsx`, `geometry.spec.ts` e `interactions.spec.ts` con el bloque (0), tocando bloques distintos de cada uno. (2) El drawer móvil: `components/layout/Navbar.tsx`, `styles/10-navbar.css`, `styles/99-a11y.css`. (3) **El catálogo real de Ale**, que es el bloque grande: `types/shop.ts`, `content/products.ts`, `content/home.ts`, `content/shopSchema.ts`, `content/pages.ts`, `lib/variants.ts`, `lib/cart.ts`, `lib/shopSearch.ts`, `lib/productImage.ts`, `lib/db/*`, `components/cart/ProductPurchase.tsx` (nuevo, sustituye a `AddToCartButton.tsx`), `components/cart/CartDrawer.tsx`, `components/shop/ProductCard.tsx` (nuevo, la tarjeta del catálogo rediseñada — D-33), `app/tienda/**`, `app/layout.tsx`, `app/not-found.tsx`, `app/opengraph-image.tsx`, `styles/05-components.css` (`.btn--sm`), `styles/30-cart.css`, `scripts/build-images.mjs`, `scripts/seed-catalog.ts`, `drizzle/0001_*`, `assets/products/` (24 fotos), `data/`, `public/img/producto/` y los tests. (4) **Los derivados del logo, rehechos**: `scripts/build-images.mjs`, `components/layout/Footer.tsx` (una línea de `srcSet`), `tests/unit/logo.test.ts` (nuevo), los 8 PNG de `public/img/brand/` regenerados, `public/img/brand/logo-light-216x216.png` (nuevo) y `app/icon.png`. No comparte fichero con ningún otro bloque salvo `scripts/build-images.mjs`, que el bloque (3) toca en los *jobs* de producto y este sólo en las funciones del logo. (5) **«Sobre Nosotros»: enlace del nav, texto real de Ale, medida completa, ritmo único de 64px y la raya del titular a todo el carril** (este bloque): `content/home.ts` (sólo las claves `nav` y `footer.links`, y el `mediaText`/`metrics` de la fecha), `content/pages.ts` (la clave `about` entera), `lib/contact.ts` (`email`), `app/sobre-nosotros/page.tsx`, `styles/40-prose.css`, `tests/unit/pages.test.ts` (nuevo), `tests/unit/icons.test.ts` (nuevo), `tests/unit/content.test.ts`, `tests/e2e/geometry.spec.ts`, `tests/e2e/interactions.spec.ts`, `tests/e2e/paginas.spec.ts`, `public/icons/list-bullet.svg` y `public/icons/quote-icon.svg` (los dos, mal formados desde siempre), `CLAUDE.md` (§Idioma, la excepción del tuteo) y los docs. Comparte `content/pages.ts`, `app/sobre-nosotros/page.tsx`, `styles/40-prose.css` y los tres specs con el bloque del carrusel, que entró en la misma página mientras este estaba en vuelo: el carrusel sustituyó la foto del obrador y `geometry.spec.ts` pasó a medir el texto contra el contenedor. Comparte `content/home.ts` con (0) y (0b), y los tres ficheros de tests con (0) y (1), tocando claves y bloques distintos en cada uno. (6) **El titular del statement alineado con los demás `h2`** (este bloque): `styles/12-statement.css` (sólo la regla del `__fill` del titular y su comentario), `styles/01-tokens.css` (sólo el comentario de `--text-ghost`), `tests/unit/contrast.test.ts` y los docs (`ESTADO`, `DEVIATIONS` con D-26 reescrito, `README`). Comparte `styles/12-statement.css` con el bloque (1), tocando reglas distintas: (1) es geometría y entrada, este es sólo color. No comparte ningún otro fichero. Verificar con `git status --short` |
| Bloque Aviso Legal | `app/aviso-legal/page.tsx`, la clase compartida añadida a `app/sobre-nosotros/page.tsx`, `styles/40-prose.css`, el test nuevo al final de `tests/e2e/geometry.spec.ts` y D-37. Comparte tres ficheros con el bloque de “Sobre Nosotros”; el copy de privacidad sí se amplió al activar pedidos y consentimiento en Neon (`content/pages.ts`). |
| Bloque clientes y pedidos | `app/api/orders/route.ts`, `components/cart/CartDrawer.tsx`, `lib/orderSubmission.ts`, `lib/db/orderSubmissions.ts`, las cuatro tablas de `lib/db/schema.ts`, migraciones `0002_nervous_sprite.sql` y `0003_curvy_cerise.sql`, `scripts/customer-privacy.ts`, `styles/30-cart.css` y pruebas. Las migraciones aditivas se aplicaron a Neon el 14 ago. Escritura, limpieza e idempotencia reales verificadas: `write-ok`, `cleanup-ok`, `rate-cleanup-ok`, `idempotency-ok` e `idempotency-cleanup-ok`. |
| Tests unitarios | **319 en verde**, 16 ficheros (`npm test`, medido el 14 ago). `npm run lint` y `npm run typecheck` limpios; el build aislado `.next-order-capture` compila e incluye `/api/orders`. |
| Tests e2e (14 ago, titular del statement) | Contra `NEXT_DIST_DIR=.next-verify` y build nuevo, la **suite entera** en dos tandas: **1.098 en verde + 88 skipped + 14 en rojo** (8,5 min + 9,5 min). **Ninguno de los 14 es del statement**, y los cuatro están diagnosticados. (1) `a11y.spec.ts:156` ×4 (w1920/1440/1280/1100), **determinista**: violación de modo estricto — `.nav-search-input` resuelve a **2 elementos** porque `Navbar.tsx` monta `ProductSearchAutocomplete` dos veces, en `:280` (barra de escritorio) y `:304` (drawer). Es del bloque (2) sin commitear; el test necesita desambiguar el localizador, o el navbar no debería montar los dos a la vez. (2) `paginas.spec.ts:284` ×8, **determinista**: `/aviso-legal` renderiza **7** `.prose-block` y el test espera **6** — del bloque «Aviso Legal». (3) `seo-perf.spec.ts:182` ×1 (w1920): **2398 KB** en la primera vista contra un presupuesto de 2000, y **1909 KB son imágenes** (link 240, script 138, css 89) — del bloque del catálogo, no del CSS. (4) `lightbox.spec.ts:36` ×1 (w1920): **flake bajo carga**, pasa **3/3** aislado con `--repeat-each=3`. Comprobado además en navegador a w1440: el titular del statement y el del catálogo computan **idénticos** en color (`rgb(176, 114, 8)`), familia (Cormorant Infant), peso (400) y tamaño (50px) |
| Tests e2e (14 ago, clientes y pedidos) | Contra `.next-order-capture`: **48 escenarios** del checkout a 8 anchos; 40 pasaron en la primera corrida y los 8 del consentimiento pasaron tras acotar un selector de test que también encontraba el anunciador de rutas de Next. Auditoría axe del carrito: **8 en verde** y pasada final móvil: **7 en verde**. Persistencia real incluida idempotencia, sin restos temporales, detallada en la fila del bloque. |
| Tests e2e (14 ago, ritmo vertical de Home) | Contra build nuevo en `.next-home-spacing`: el test nuevo compara las **6 transiciones reales** entre contenidos y pasa a los **8 anchos**; `geometry.spec.ts` completo da **200 en verde + 8 skipped, cero rojos** en 4,2 min. Tras mover el último hueco al fondo blanco, el test específico volvió a pasar **8 de 8** y se regeneraron/revisaron las capturas finales a 1920 y 390px. |
| Tests e2e (14 ago, Aviso Legal) | Contra build nuevo en `.next-legal-verify`: **56 en verde** para geometría editorial, contenido legal y axe en los 8 anchos; la comprobación aislada de que la cabecera no tapa el contenido suma **8 en verde**. Tras retirar la frase fiscal y «Servicios de terceros», la repetición de contenido + geometría da **24 en verde** y las **8 capturas** se regeneraron y revisaron a ojo. El primer intento sobre `.next-verify` perdió `middleware-manifest.json` por el bloqueo de OneDrive; el directorio exclusivo compiló completo. |
| Tests e2e (14 ago, al cerrar «Pedidos y entregas» por rótulos) | Contra `NEXT_DIST_DIR=.next-verify` y build nuevo: `paginas.spec.ts` **120 en verde + 8 skipped, cero rojos** (2,5 min) —incluido el intermitente del ancla `#entregas`, que esta vez pasó a los 8 anchos— y `geometry + a11y` **256 en verde + 20 skipped + 4 en rojo** (6,7 min), los 4 el conocido `a11y.spec.ts:156` del buscador de cabecera. El test de la sección afirma ahora los **seis rótulos en orden**, que las negritas del bloque son exactamente esos seis, que la lista tiene **dos** ítems y que **ningún párrafo queda sangrado** respecto al carril, que era la queja del cliente. Unitarios: **305 en verde**, 14 ficheros |
| Tests e2e (14 ago, `paginas geometry a11y`, al cerrar el formato del catálogo, los tópicos y el tuteo) | Contra `NEXT_DIST_DIR=.next-verify` y build nuevo: **376 en verde + 28 skipped + 4 en rojo** de 408 a los 8 anchos (9,2 min). Los 4 rojos son otra vez `a11y.spec.ts:156` (buscador de cabecera, del bloque del autocompletado), y **el ancla `#entregas` pasó a los 8** — ver la fila de intermitentes, donde queda medido que cae en conjuntos de anchos distintos en cada pasada. Los **3 tests nuevos** —los temas del catálogo en su línea, la lista de «Pedidos y entregas» con su viñeta, y el cierre en tuteo— pasan a los 8 anchos. Capturas de `sobre-nosotros-{1920,390}.png` revisadas a ojo, a 1:1: la etiqueta se lee como rótulo, el punto de la viñeta cae a la altura de la primera línea también en los ítems de dos y tres líneas |
| Tests e2e (13 ago, `geometry paginas a11y`, al cerrar el ritmo de «Sobre Nosotros») | Contra `NEXT_DIST_DIR=.next-verify` y build nuevo: **360 en verde + 28 skipped + 4 en rojo** de 392 a los 8 anchos (7,7 min). Los **2 tests nuevos** —«todos los huecos verticales miden lo mismo» y «la raya del titular cubre el carril»— pasan **a los 8 anchos** (re-medidos aparte tras añadir la aserción del borde de la FAQ: **24 en verde**, 1,4 min). Los 4 rojos son otra vez `a11y.spec.ts:156` (buscador de cabecera) a los cuatro anchos ≥1100, del bloque del autocompletado; el intermitente de `#entregas` pasó esta vez. Capturas de `sobre-nosotros-{1920,1100,991,390}.png` regeneradas y revisadas a ojo: los cinco huecos se ven iguales y a 991 —donde `--header-h` sube a 155px— la primera pantalla no queda apretada |
| Tests e2e (13 ago, **suite entera**, al cerrar «Sobre Nosotros») | Contra `NEXT_DIST_DIR=.next-verify` y build nuevo: **1.074 en verde + 88 skipped + 6 en rojo** de 1.168 a los 8 anchos (20,9 min). De los 6 rojos, **2 son los intermitentes conocidos** (`paginas.spec.ts` `#entregas` a w1920 y `tienda.spec.ts` aria-disabled a w767) y los **4 restantes son `a11y.spec.ts:156`** —el anillo de foco del buscador de cabecera, `.nav-search`— a los cuatro anchos ≥1100 donde ese buscador se renderiza. **No son de este bloque:** fallan a 4 de 4, o sea de forma determinista, y este trabajo no toca `components/shop/ProductSearchAutocomplete.tsx` ni `styles/10-navbar.css`; son del bloque del autocompletado, que sigue sin commitear. Es el primer sitio donde mirar al cerrar ese bloque |
| Tests e2e (13 ago, **suite entera**) | **Medida al cerrar el statement**, contra `NEXT_DIST_DIR=.next-verify` y build nuevo: **1.042 en verde + 68 skipped + 2 en rojo** de 1.112 a los 8 anchos (19,4 min). Los **2 rojos son los dos intermitentes de la fila de abajo, ninguno del statement** — ver ahí el A/B que lo mide. Los **2 rojos que había del statement** (`interactions.spec.ts`, «la frase editorial revela color al hacer scroll», a 1920 y 1280, última palabra en `--reveal: 97%`) **están cerrados**: el recorrido ahora acaba en `--header-h` + 80px, así que el progreso satura a 1 en vez de quedarse en 0,995. Re-medido sólo `geometry` + `interactions` sobre el build definitivo: **340 en verde + 28 skipped + 0 en rojo** (6,4 min). Las 72 capturas de `tests/e2e/__screenshots__/` se regeneraron en esa pasada (9 vistas × 8 anchos) |
| Tests e2e (13 ago, `a11y paginas geometry`) | Tras formatear el texto de «Sobre Nosotros»: **344 en verde + 28 skipped + 4 en rojo** (9,1 min). **El audit de axe sobre `/sobre-nosotros` pasa**, que es lo que valida el reparto del ámbar en el DOM real. Los 4 rojos son otra vez `a11y.spec.ts:156` (buscador de cabecera) y esta pasada da la **causa exacta, que no es de accesibilidad**: `.nav-search-input` resuelve a **dos elementos** —el del escritorio y el del `.nav-mobile-search`— y Playwright falla por modo estricto antes de medir nada. Se arregla en el bloque del autocompletado acotando el localizador; ver la fila de intermitentes |
| Tests e2e (13 ago, `geometry paginas interactions`) | Repasada tras ensanchar el texto de «Sobre Nosotros», sobre build nuevo: **455 en verde + 40 skipped + 1 en rojo** (9,9 min). El test nuevo, «en sobre nosotros el texto mide lo mismo que la foto», pasa **a los 8 anchos**. El único rojo es `geometry.spec.ts:341` a w390 (`.footer-social` esperaba 0 y encontró 1) y **es del bloque del pie, que se estaba editando en paralelo en este mismo árbol**: el fichero de tests ya exige el pie nuevo —sin `social`, con `contacts`— mientras el build servido traía el viejo. Falló sólo en w390 porque ese worker cargó la versión nueva del spec a mitad de pasada. Se vuelve a medir al cerrar el bloque del pie |
| Tests e2e (12 ago, previo) | **Suite completa medida el 12 ago tras el rediseño de la tarjeta**, contra `NEXT_DIST_DIR=.next-verify` y build nuevo: **1.003 en verde + 64 skipped + 5 en rojo** de 1.072 casos (15,1 min). Los 5 rojos son de **otros dos bloques en vuelo, ninguno de la tarjeta**: (1) cuatro son `geometry.spec.ts:36` (statement) a 991, 767, 479 y 390 — el titular queda por encima del fondo de la foto, no por debajo; (2) el quinto es `seo-perf.spec.ts:151` a 1920, «la primera carga pesa menos de 1.2 MB»: mide **1.294 KB, de los que 831 KB son imágenes de la portada**. La causa es que la galería de la portada pasó a servir fotos de `/img/producto/` (ver el diff de `tests/e2e/seo-perf.spec.ts` y `components/sections/Gallery.tsx`). **No es atribuible a la tarjeta**: la portada no renderiza `ProductCard`, y el bundle de CSS entero mide 45 KB en disco contra los 94 KB de exceso. Los tests de la tarjeta se volvieron a correr aislados: **57 en verde + 7 skipped** (los skips son los ≤479 con `hasTouch` y los de una columna). Verificar con `NEXT_DIST_DIR=.next-verify npm run e2e -- --reporter=line`; ojo con encauzar la salida a `tail` o a `Select-Object -Last`, que se traga el principio del resumen |
| ⚠ Intermitentes | Dos, **anteriores a este bloque**, y son los 2 rojos de la fila de arriba. (1) `paginas.spec.ts:51` (el ancla `#entregas` de sobre-nosotros no queda tapada por el navbar). Medido con una sonda: cuando falla, `scroll-margin-top: 131px` **no se aplica** y el titular queda a 12px del borde en vez de a 131px, con `scrollY` 1861 de un máximo de 3481 — así que no es que la página se quede corta para desplazarse. Es una carrera entre el desplazamiento al fragmento y el que hace el router; es un bug real de navegación, no del test. **Corrección del 13 ago sobre lo que decía esta fila:** no falla «~6 de 24 a anchos distintos», falla **mucho más suelto que en la suite** — dentro de la suite entera cayó 1 de 8 (w1280), y aislado 7 de 8. Encaja con la carrera: sin contención, el desplazamiento del router gana más veces. **Medición del 14 ago, con sonda propia:** cayó en **conjuntos de anchos distintos en dos pasadas seguidas** —{1280, 1100, 767} en la suite de tres ficheros y {1920, 1440, 1280, 1100} aislado—, o sea que **no es determinista**, que es lo que descarta que lo cause un cambio de contenido (ese día «Pedidos y entregas» cambió de forma dos veces y la longitud de la página con ella). Y sobra recorrido: a 1920, `scrollY` 3.479 de un máximo de 5.771 con el titular en el offset 3.510. Cuando falla, el titular queda a **31px** del canto con `scroll-margin-top: 131px` computado — el mismo síntoma de siempre, con el número de hoy. **A/B medido, no deducido**, para descartar que lo cause el statement: se guardaron en `stash` los cuatro ficheros del bloque (`Statement.tsx`, `ScrollColorText.tsx`, `12-statement.css`, `app/page.tsx`), se reconstruyó y el test **sigue cayendo 5 de 8** — misma banda de ruido, y `/sobre-nosotros` no renderiza el statement. (2) `tienda.spec.ts:532` (el control `aria-disabled` conserva el foco) falla suelto bajo carga y pasa **4 de 4** al repetirlo aislado. **Pista nueva del 13 ago:** el test hermano de los testimonios daba exactamente el mismo síntoma, y la causa medida era el `click({ force: true })` — `force` desactiva la comprobación de blanco, así que bajo un desplazamiento de layout el clic aterriza en otro elemento y navega fuera de la página. Cambiarlo por `dispatchEvent("click")` lo dejó en 40 de 40 tres veces seguidas. `tienda.spec.ts:670` usa el mismo `force`; **no se ha tocado**, pero es el primer sitio donde mirar |
| ⚠ Sin cobertura | Seis cosas. (0b) **Las capturas de `screenshots.spec.ts` pueden salir con media página en blanco.** `page.screenshot({fullPage:true})` no dispara el `IntersectionObserver` de los `Reveal` que están fuera del viewport, así que lo que se ve depende de si la captura llega después del failsafe de 2.500ms que añade `.reveal-all` (`app/layout.tsx`). Medido el 14 ago: en `sobre-nosotros-1920.png` salió todo y en `sobre-nosotros-390.png` **el contenido se corta en y=5.384** de 11.097 — la mitad inferior en blanco. No es un fallo del sitio (con scroll real, y a los 2,5s pase lo que pase, el contenido se revela), pero **invalida la revisión visual de las capturas altas**: para mirar una sección de la mitad de abajo hay que capturarla con `scrollIntoViewIfNeeded` + esperar `is-in`. Se arregla en el propio spec forzando `.reveal-all` antes de disparar. (0) **El color de los dos iconos SVG.** `list-bullet.svg` y `quote-icon.svg` llevan `#b07208` **quemado dentro del fichero**: no siguen a `--gold-line`/`--gold-display`, así que donde el token se invierta (`.footer-dark`) el icono seguiría siendo el oscuro. El acoplamiento existía desde siempre y daba igual porque **ninguno de los dos se pintaba** (ver el bloque de `/sobre-nosotros`); desde el 14 ago el bullet sí se ve, así que ahora importa. `tests/unit/icons.test.ts` ya lee esos ficheros y `contrast.test.ts` ya parsea `01-tokens.css`: comparar el `fill` con el token son seis líneas. (1) El statement bajo `prefers-reduced-motion`: el test existe y **pasa** (`interactions.spec.ts`, «la frase editorial queda revelada sin animación»), pero sólo mira la **primera** palabra a `--reveal: 100%`, no las 36, y no comprueba el camino **sin JS** (donde `--reveal` vale 100% por defecto y es `.js` quien lo baja a 0%). Comprobado a mano el 7 ago; el hueco que queda es el de las 35 palabras restantes y el de no-JS. Tampoco vigila nadie que el recorte óptico decaiga bien si la webfont no llega y entra el fallback de `adjustFontFallback`. **Y con el relleno del párrafo (punto 4) hay dos huecos nuevos:** el camino **sin JS** —comprobado a mano el 13 ago a 1440 (26px, 4 líneas, línea base a ras, hueco de 66px), pero ningún test lo corre con JavaScript desactivado— y el comportamiento **cuando saltan los topes** de interlineado (1,15-2,8em): hoy el test sólo afirma que `data-fit` **no** existe con el copy actual, así que nadie comprueba que el tope haga lo correcto si Ale escribe 40 o 280 caracteres. La forma barata de cubrirlo sería un test que reemplace el copy por los dos extremos y afirme el `data-fit`. (2) El **aspecto** del realce del drawer: el test mide caja, sangrías, alto y navegación, pero nadie comprueba el color del fondo, la barra de 3px ni el `transform` del `.nav-label`, ni que decaigan bajo `prefers-reduced-motion`. (3) El **aspecto** del selector de presentación: los e2e comprueban que cambia el precio, que hay 3 opciones y que con una sola no se dibuja, pero nadie mira el realce de `:has(input:checked)` ni los 44px de alto de la fila. (4) **El anillo de foco del buscador se ha quedado sin comprobar.** `a11y.spec.ts:156` es el único test que lo afirma —axe no lo detecta: un `outline:0` deja el elemento perfectamente accesible en el árbol, sólo invisible con teclado— y desde el bloque del drawer **no llega a ejecutarse**: `.nav-search-input` resuelve a 2 elementos (`Navbar.tsx:280` y `:304` montan `ProductSearchAutocomplete` dos veces) y Playwright aborta por modo estricto antes de mirar el anillo. O sea que `.nav-search:has(:focus-visible)` (`10-navbar.css:201`) lleva sin vigilancia desde entonces. Al cerrar el bloque del drawer: desambiguar el localizador y comprobar que el segundo buscador no duplica un combobox en el árbol de accesibilidad |
| Desplegado | **no.** Nunca se ha desplegado. No hay proyecto de Vercel creado |
| Base de datos | Neon Postgres migrada y sembrada con el catálogo real: **23 filas en `products` y 60 en `product_variants`**. El 14 ago se aplicaron `0002_nervous_sprite.sql` (cuatro tablas del checkout) y `0003_curvy_cerise.sql` (índices); escrituras y limpiezas reales verificadas con UUID temporales |
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
- **Los derivados del logo se recortan a 816 y se reducen después** (13 ago). Antes era al revés:
  se reducía primero y el recorte del papel blanco caía sobre un bitmap de 72px donde casi todo píxel
  de un trazo es mezcla de tinta y papel, así que no pasaba ni por fondo ni por tinta y se quedaba
  sucio — el «Sweet & Salty» del pie era ruido. Con el orden cambiado y `lanczos3` sale legible.
  El recorte lleva ahora una **valla circular** (`LOGO_DISC` en `scripts/build-images.mjs`, medida
  sobre el original: centro 375/398, radio 235 de 816): el anillo exterior del dibujo es
  discontinuo, y por sus huecos el relleno se colaba dentro del disco y borraba la crema blanca de
  arriba. **No es un riesgo futuro: ya estaba ocurriendo** — los `logo-light-144x144.png` y
  `logo-transparent-192x192.png` que había commiteados no tenían crema; sólo se libraban los tamaños pequeños, donde
  la reducción emborrona el anillo y le cierra los huecos al relleno por casualidad. Lo vigila
  `tests/unit/logo.test.ts` (32 casos: tamaño, crema, disco y esquina de cada variante).
  El pie gana un escalón `logo-light-216x216.png` para el 3x de los móviles densos.
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
  `--i`. **Encendido** — ver el bloque propio más abajo.
- **Un solo ritmo entre todas las secciones de Home** (`--home-section-gap` en
  `styles/04-layout.css`): 120px en escritorio ancho, fluido entre 76 y 104px en el tramo medio y
  60px en móvil. El corte catálogo→servicio reparte el valor entre el fondo crema y el blanco; los
  demás cortes lo reservan una sola vez. El último queda como una banda blanca entre las tarjetas
  y la superficie marrón del footer, cuyo padding oscuro sigue siendo interno. Antes el primer corte
  sumaba **170 + 112 = 282px**. Lo fija
  `geometry.spec.ts` midiendo seis pares de cajas reales a los ocho anchos. Desvío D-38.
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
- **El statement reparte el texto en la altura de la foto, y las dos columnas suben juntas**
  (`components/sections/Statement.tsx`, `components/ui/ScrollColorText.tsx`,
  `styles/12-statement.css`). Tres cosas, las tres pedidas por el cliente sobre capturas:
  1. **Una sola entrada para las dos celdas.** Antes la foto subía con `<Reveal delay={100}>`, el
     párrafo subía por su cuenta con un `observeOnce` a mano y un timing propio (0,95s/120ms) y el
     titular **no subía en absoluto**. Ahora el `<h2>` y el `<p>` van dentro de un único
     `<Reveal className="statement-story" delay={100}>` y `ScrollColorText` ya no toca el observer:
     sólo tiñe. Lo que sincroniza el disparo es la geometría — a ≥992 las dos celdas tienen el mismo
     borde superior y la misma altura, así que cruzan el umbral del observer compartido en el mismo
     tick. Lo fija `interactions.spec.ts` comparando los dos gestos **entre sí**, no contra literales.
  2. **El teñido acaba 80px antes de la cabecera**, no en `y=0`. La cabecera es `position: fixed` y
     tapa 101-115px: con el recorrido mapeado a una altura de viewport entera, el texto se metía
     debajo con el color a medias. `update()` lee `--header-h` (releído en el `resize`, que cambia en
     1280) y descuenta `HEADER_LEAD = 80`. **Efecto colateral medido:** esto cierra los 2 rojos de
     `interactions.spec.ts` («la frase editorial revela color al hacer scroll») a 1920 y 1280, donde
     la última palabra se quedaba en `--reveal: 97%` — con el denominador acortado el progreso satura
     a 1 en vez de quedarse en 0,995.
  3. **Titular arriba y párrafo abajo, a ras de los bordes de la foto** a ≥992: `align-items: stretch`
     en la rejilla, `align-self: start` en la foto (si no, `stretch` se comería su `aspect-ratio`) y
     `justify-content: space-between` en la columna. El ras es **óptico**: `space-between` alinea cajas
     de línea y el ojo alinea trazos, así que se recorta el medio-espacio con `margin-top: -0.18em` en
     el `h2` y `margin-bottom: -0.539em` en el `p`. Los dos números están **medidos** con canvas
     TextMetrics sobre las webfonts cargadas —Cormorant Infant a `lh 1em` dejaba el titular 9px por
     debajo; Libre Franklin a 1.8em dejaba la última línea 9,7px corta— y verificados a **0,00px** de
     desvío a 1920, 1440, 1280, 1100, 1024 y 992. Se recorta a cap-height y línea base, no al trazo
     real, porque son constantes de la fuente y no bailan con los glifos de la línea. El bloque vive
     bajo `@media (min-width: 992px)`: apilado no hay bordes contra los que alinear, y el valor del
     `p` depende del `line-height`, que a ≤991 baja a 1.7em.
  4. **El párrafo LLENA esa banda**, que es el precio del punto 3: con el titular arriba y el texto
     abajo, `space-between` metía toda la holgura en un agujero central de hasta **133px** (3 líneas de
     18px = 97px contra una banda de 158-215px). El cuerpo pasa a `clamp(22px, 1.8vw, 26px)` y el
     interlineado lo calcula `fitBody()` en `ScrollColorText`. **El tamaño es fluido porque 26px fijos
     no caben:** medido, a 992-1024 la banda son 158-168px y 26px pide 6 líneas → interlineado de
     0,91-0,97em, por debajo de `ascent+descent`, o sea líneas solapadas. **22px es el único tamaño con
     4 líneas en todo el rango** de dos columnas. Y el interlineado no puede ser un número fijo: el
     error iría de −55px a +50px según el ancho, y `content/schema.ts` admite un `body` de 40 a 280
     caracteres, así que caducaría al cambiar el copy. **Medido a 1920/1600/1440/1280/1100/1024/992:**
     4 líneas en todos, hueco titular↔párrafo de **28px exactos** (el `margin-top`), línea base a
     **0px** del pie de la foto, interlineado entre 1,71em y 2,33em y ningún tope activado. Sin JS
     queda el fallback de 1.6em: la línea base sigue a ras y el hueco sube a 66px (medido a 1440).
  Es el desvío **D-35**, que además registra por fin que esta sección nunca fue la del spec §6.2.
  `geometry.spec.ts` mide el **trazo** y no la caja — una aserción sobre cajas pasaría igual con el
  recorte mal puesto — y espera `is-in` + `transform: none` en `.statement-story` antes de medir,
  porque la celda ahora se desplaza 100px durante la entrada.
- **El titular del statement se alinea con los demás `h2` de la portada**
  (`styles/12-statement.css`, `styles/01-tokens.css`, `tests/unit/contrast.test.ts`). El cliente lo
  reportó sobre capturas como «otra tipografía» comparándolo con «Lo que sale del horno», y **no lo
  era**: `.scroll-color-text__heading` y el `h2` base ya declaraban lo mismo — `var(--ff-display)`,
  peso 400, 50/42/34px, `line-height: 1em`, versalitas, sin `letter-spacing`. Lo que desentonaba era
  el **color**: revelaba a `--gold-ink` (#8A5A06) cuando todos los demás `h2` van a `--gold-display`
  (#B07208). Era además el **único `h2` del sitio** pintado con el token de <24px, contra la regla de
  ámbar por tamaño. Pasa a `--gold-display`.
  - **Cuesta salto de revelado y se aceptó a sabiendas.** #B07208 es más claro, así que el par
    fantasma → revelado se acorta: **de 3,87× a 2,61×** (medido con `lib/color.ts` sobre el blanco de
    la sección), y el estado final baja de 5,92:1 a **3,99:1** — AA-*large*, que es el umbral que le
    toca a 50px, en vez del AA normal que cumplía de sobra. Se le preguntó al cliente con las cifras
    delante y eligió el cambio.
  - **El mínimo del titular en `contrast.test.ts` baja de 3,5× a 2,5×, y no es una relajación:** con
    #B07208 el techo absoluto son **3,99×** —el salto desde un fantasma blanco puro, o sea
    invisible—, así que 3,5× es inalcanzable por construcción. 2,5× sigue muy por encima del 1,65×
    con el que UI-060 mató el efecto. El cuerpo no cambia de token y conserva su 3,5×: la constante
    se parte en dos para no desprotegerlo de propina.
  - **Y de paso, un fallo de medida que llevaba ahí desde D-26:** el test aplanaba `--text-ghost`
    contra el **crema**, y la sección está sobre **blanco** (`12-statement.css:9`, afirmado por
    `geometry.spec.ts:113`). Como el token es translúcido, el fondo decide su color real —`#d4d0cd`
    sobre blanco, `#cfc8be` sobre crema—, así que se venían publicando saltos un ~8% cortos contra
    un color que no aparece en pantalla. Corregido: `STATEMENT_BG` y los dos estados finales pasan a
    medirse sobre blanco. Todas las aserciones ganan margen, porque ahora miden lo que se ve.
  - Se mantienen el efecto palabra a palabra, el centrado (D-35) y toda la geometría: el color no
    altera métricas. D-26 queda reescrito con las cifras nuevas.
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

### Los testimonios, en el aire bajo la galería

**La sección estaba construida entera desde la Fase 1 y llevaba oculta desde entonces**, porque
`content/home.ts` declaraba `items: []` y el componente devuelve `null` con la lista vacía. Se
encendió: es el bloque H-07 de la referencia, y va exactamente donde la referencia lo pone — justo
debajo de la galería (`docs/ANALISIS-REFERENCIA-ITALY128-HOME2-MENU2.md`, mapa vertical del DOM).
`app/page.tsx` ya lo tenía en ese orden; no hubo que mover nada.

- **Las 6 reseñas son de andamio, no reales**, y van marcadas `todo: true`. Ale sigue sin entregar
  textos (`CONTENT_TODO §3` sigue bloqueando el lanzamiento). El layout sí es definitivo.
- **El guardarraíl no desapareció al encender la sección, cambió de lado.** Antes un test exigía
  `items.length === 0`. Ahora `tests/unit/content.test.ts` exige que las **seis** lleven la marca, y
  un segundo test prohíbe el estado intermedio —o marcadas todas, o ninguna—. Quitar el andamio
  rompe el primero, que es justo cuando alguien tiene que mirar si el contenido es real.
- **La tarjeta no lleva retrato** (desvío D-34). Se borran la regla `.review-avatar` y
  `components/ui/Avatar.tsx`, que era su único consumidor.
- ⚠ **`.review-head` dejó de ser `flex` y eso es lo único que rompía en silencio.** Estaba en flex
  para poner el retrato al lado del par nombre + rol, que iba envuelto en su propio div. Sin retrato
  el envoltorio sobra y sus dos hijos pasan a ser hijos directos: en flex se habrían colocado **en
  fila**, con el rol a la derecha del nombre en vez de debajo.
- Los `min-height` de `.review-card` **no cambian**. El retrato y el par nombre + rol iban lado a
  lado con `align-items: flex-start`, así que quitarlo resta ~13px de contenido, no 70.
- El `role` de cada reseña es la **ocasión del pedido** («Cumpleaños en Santa Ana»), no un cargo: la
  referencia pone «Cook»/«Manager» porque es una plantilla genérica.

Verificado el 13 de agosto con build de producción en `.next-verify`: **394 en verde + 36 skipped**
de `geometry`, `interactions` y `a11y` a los 8 anchos, con 2 en rojo que **no son de este bloque**
(ver la fila de tests). Cubre: que las 6 tarjetas están bajo la galería sin solaparla, que no hay
ningún `.review-avatar`, que el fondo es `--primary-light`, que `--per-view` da 3/2/1 según el ancho
y que las tarjetas a la vista cuadran de altura; que las flechas miden 34×34 con borde de 1px,
comparten fila, arrancan en el borde del slider y **cuelgan del titular por el acople de `h2.mb--40`
con `padding-top: 95px`** —a ≤479 el `margin-top: 30px` se come 30 de esos 40 y el test lo dice—, con
los 184px entre círculos y la línea de 160×1, que a ≤479 pasa a 260 y deja de unirlas. Y del
comportamiento: que la derecha avanza, que la izquierda nace `aria-disabled` y al forzar el clic no
hace nada conservando el foco, que `End`/`Home` van a los extremos, que la región `aria-live` anuncia
el rango, y que con `prefers-reduced-motion` el slider **sigue navegando** pero sin deslizamiento.

Dos cosas que costaron una pasada en rojo cada una, y las dos son de método:

1. **Los tests esperan a la hidratación leyendo `--i` antes de tocar nada.** El servidor ya pinta las
   flechas con su `aria-disabled` correcto, así que un test que sólo mire el atributo pasa antes de
   que llegue el JavaScript, y el clic siguiente se pierde sin handler.
2. **`dispatchEvent("click")` y NO `click({ force: true })` para pulsar un control `aria-disabled`.**
   `force` desactiva la comprobación de blanco: el clic va a unas coordenadas, y si el layout se
   movió entremedias aterriza en lo que haya ahí. Aquí caía en un `.gallery-item` de la fila de
   encima y **navegaba a una ficha de producto** — el test fallaba 1 de 8 bajo carga con
   «element(s) not found», porque ya no estaba en la portada. Con `dispatchEvent` el evento va al
   elemento, sin coordenadas. Tres pasadas seguidas del grupo: **40 de 40 las tres veces**.

⚠ **Esto apunta al intermitente de `tienda.spec.ts:532`**, que usa `click({ force: true })` para lo
mismo con los steppers y está anotado como «falla suelto bajo carga». Mismo mecanismo, muy
probablemente misma causa. **No se ha tocado**: es de otro bloque y hay que medirlo antes.

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

- `/sobre-nosotros` — **el texto real de Ale** (13 ago), tomado de `docs/boquita-sobre-nosotros.md`:
  entradilla, **seis secciones** (`historia`, `como-horneamos`, `catalogo`, `presentaciones`,
  `ocasiones`, `entregas`), **11 FAQ** y el cierre, con JSON-LD `FAQPage` + `AboutPage`. Va en
  **primera persona del singular** —es la página donde habla Ale—, a diferencia del resto del sitio.
  El copy anterior era de andamio y ya mentía: prometía «cachitos de jamón» y «asado negro», que no
  existen en el catálogo real (`types/shop.ts`). La estructura y los efectos no cambiaron: cada
  bloque sigue siendo un `<Reveal as="article" className="prose-block">`.
  - **La etiqueta «Sobre nosotros» del navbar no navegaba.** No era JavaScript: `Dropdown`
    (`components/layout/Navbar.tsx:71`) sólo pinta un `<a href>` si el grupo trae `href`, y ese no lo
    tenía, así que salía como `<button>` y el clic se limitaba a abrir el panel — la página respondía
    200 y era **inalcanzable desde su propia etiqueta**. Arreglado con `href: "/sobre-nosotros"` en
    `content/home.ts`. Efecto lateral esperado, el mismo que ya tenía Catálogo: en el drawer móvil su
    lista sale desplegada de entrada. Lo vigila `tests/unit/pages.test.ts` (8 casos, nuevo) y un e2e
    de clic en `interactions.spec.ts`.
  - **La portada decía «desde 2019» y Ale sitúa el primer pedido en abril de 2022.** Corregidos
    `home.mediaText.body` y la métrica «Pedidos horneados desde 2022» con sus dos tests. El `+500`
    sigue sin ser un número medido (`CONTENT_TODO.md §4`).
  - `CONTACT.email` (`ticaboquita@gmail.com`) lo añadió este bloque para el cierre de la página. El
    bloque del pie, en vuelo en paralelo, lo publica además en su columna de contacto.
  - **La etiqueta se escribe «Sobre Nosotros»**, con N mayúscula, en sus tres apariciones visibles:
    el grupo del navbar, el enlace del pie (`content/home.ts`) y el `metadata.title` de la página.
  - **Las páginas de contenido llevan un carril tipográfico compartido** (`.editorial-page` en
    `styles/40-prose.css`), porque
    con la línea a 1170px el 18px/1,5 del resto del sitio no se lee cómodo: cuerpo a **19px/1,75**
    con `text-wrap: pretty`, entradilla a 22px en `--text-dark`, preguntas a 20px y respuestas a
    19px con más aire. En móvil vuelve al 18px, donde la línea ya es corta.
  - **Las entradillas del catálogo van en negrita ámbar, con dos puntos y en su propia línea**
    (14 ago): «Queques:», «Galletas:», «Postres:», «Queques personalizados:» — los cuatro temas del
    catálogo; los otros seis rótulos de la página son los de «Pedidos y entregas», que usa esta misma
    forma. Antes eran puntos y quedaban en la misma línea que su texto.
    Se expresan como **dato, no como marcado**: el párrafo admite la forma
    `{ lead, text }` (`type Paragraph` en `content/pages.ts`) y la página pinta
    `<strong class="prose-lead-in">`. No hay mini-markdown ni parser. El `lead` lleva su propia
    puntuación porque el render mete un solo espacio; `tests/unit/pages.test.ts` distingue las dos
    formas válidas —entradilla que cierra frase y frase suelta que sigue en minúscula—. La etiqueta
    salta de línea con `display: block` en el CSS, no con marcado: sigue siendo un `<strong>` dentro
    del `<p>`, o sea contenido de frase, así que el parser no lo saca del párrafo. El aire de 24px
    entre temas va con `.about-page p:has(.prose-lead-in) + p` **y** su simétrico, los dos: con uno
    solo, el primer párrafo del catálogo también lo cogería y la sección arrancaría 6px más abajo de
    su raya que sus siete hermanas.
  - **«Pedidos y entregas» va por rótulos, con los plazos como única lista** (14 ago, a petición del
    cliente y en dos pasos: primero pasó de párrafos con entradilla a **seis viñetas**, y ese mismo
    día a la forma actual). Son seis rótulos —cómo se pide, cuánto hay que esperar, dónde se recoge,
    dónde se lleva, cómo se paga y a qué hora llega— con su texto debajo, la misma forma que el
    catálogo: quien entra busca UNA cosa y la encuentra por el rótulo. La versión en viñetas se
    descartó porque sangraba el texto 30px y la sección se leía desalineada de sus hermanas, que es
    justo lo que reportó el cliente. **La única lista que queda son los dos plazos** (48 horas / 1
    semana), donde la viñeta sí gana: son dos valores del mismo eje y se comparan de un vistazo. El
    hueco de 24px entre rótulos lo pone el `:has()` de arriba, y el que va **tras** la sub-lista una
    regla propia (`.about-page .prose-list + p`): las dos del `:has()` sólo miran `+ p`, y sin ella el
    rótulo siguiente al `<ul>` se quedaba en 10px y la sección se descuadraba por la mitad. La
    dirección del retiro sale de `CONTACT.address`, nunca escrita a mano. `type Paragraph` mantiene la
    tercera forma, `{ items: string[] }`, que la página pinta como `<ul class="prose-list" role="list">`. Dos cosas
    que no son evidentes: el `<ul>` sale **hermano** de los `<p>` y no dentro de uno (el parser
    cierra el `<p>` al ver el `<ul>` → mismatch de hidratación, que no rompe ningún test y sólo avisa
    en consola), y el `role="list"` hace falta porque el `list-style: none` de `02-reset.css` le quita
    a WebKit las semánticas de lista. El CSS desmonta el `li` global del spec §2.3 —16px, peso 500 y
    ámbar— como ya hacen `.menu-item`, `.cart-line` y `.shop-card`; el punto se centra a mano en la
    primera línea (13px en escritorio, 11 en móvil = `(altura de línea − 8) / 2`).
    - **Las guardias `isLeadParagraph` / `isListParagraph`** (`content/pages.ts`) no son azúcar: en
      cuanto una sección **mezcla** las dos formas, TypeScript infiere el literal con
      `items?: undefined` en la otra rama, el `in` deja de discriminar y `items` sale
      `string[] | undefined`. Dentro de la guardia el parámetro es la unión declarada, donde el `in`
      sí estrecha. Lo caza `npm run typecheck`, no un test.
    - ⚠ **La dirección no cuadra entre el código y los docs.** `CONTACT.address` publica «Condominio
      Condado del Río, Santa Ana, Costa Rica» y `docs/boquita-sobre-nosotros.md:102` y
      `docs/CONTENT_TODO.md:125,139` dicen «**Calle Obelisco**, condominio Condado del Río…». Es
      anterior a este bloque y **no se ha resuelto inventando**: hay que preguntárselo a Ale. Lo que
      publica el sitio es lo que dice `lib/contact.ts`.
  - **Los dos SVG de `public/icons/` estaban mal formados y nunca se habían pintado** (14 ago).
    Salió al estrenar el bullet en la lista: el punto no aparecía. El servidor respondía **200 con
    `image/svg+xml`**, el `background-image` computado traía su URL y aun así el fondo salía en
    blanco — el navegador **no decodificaba la imagen**. La causa: un `--` dentro de un comentario
    XML (el nombre de un token, `--gold-line` en `list-bullet.svg` y `--gold-display` en
    `quote-icon.svg`), que XML prohíbe expresamente. Se arreglan los dos quitando la doble raya del
    comentario, y con eso el bullet del spec §2.3 se pinta por primera vez —también en `/dev/tokens`
    y en el `blockquote`—. **Nadie lo había visto** porque las cuatro listas de producción anulan el
    `li` global y el `blockquote` sólo vive en la página de especímenes. Lo cierra
    `tests/unit/icons.test.ts` (nuevo, 5 casos: dobles guiones en comentarios, tamaño intrínseco,
    fichero completo y etiquetas cuadradas) y una aserción nueva del e2e que **decodifica** el SVG en
    el navegador: el `background-image` computado no demuestra nada, con la URL rota vale igual, y por
    eso el test de la lista pasó en verde con las viñetas invisibles.
  - **El bloque de cierre va en tuteo** (14 ago, decisión del cliente): «Escríbeme», «Cuéntame qué
    necesitas», «También puedes escribirme a» y el botón «Escríbeme por WhatsApp». Es la **única
    excepción** al voseo del sitio y está registrada en `CLAUDE.md` §Idioma: el resto de la página, la
    FAQ incluida, sigue voseando —«Escribime por WhatsApp» sigue siendo la primera respuesta de la
    FAQ—. Lo afirma `tests/unit/pages.test.ts` con un regex de voseo, porque es justo lo que alguien
    «normaliza» de vuelta en una pasada de estilo.
  - **Un solo hueco vertical en toda la página: 64px, 48px en móvil** (`--editorial-rhythm` en
    `styles/40-prose.css`). Antes salían de tres sitios que no se hablaban entre sí —el
    `padding-block` de `.section`, el `margin-top` de `.prose-block` y los `margin: 10px 0` de la
    tipografía base— y daban **cinco huecos distintos**: 130 bajo la cabecera, 130 hasta la rueda,
    **184** de la rueda al primer titular, 64 entre bloques y 120 hasta el pie (a ≥1280). Los 184 no
    se leían como aire, se leían como un fallo de maquetación, y era el reporte del cliente. El 64 no
    está inventado: es el ritmo que la prosa ya tenía, así que todo lo demás **baja** hasta él y nada
    crece. **No sube a ≥1280**, donde `.section` sí pasa a 120, porque aquí no crece nada que lo
    justifique: el carril está topado en 1170px y la escala tipográfica está congelada por encima de
    992. Es un desvío del §2.5 del spec: **D-36** en `docs/DEVIATIONS.md`. Dos trampas quedan
    escritas en el CSS: se escribe `--section-pad` y **nunca** el atajo `padding-block` (desde
    `.editorial-page` le ganaría a `.section--no-bottom` por especificidad, no por orden), y esa misma
    especificidad tapa los dos overrides responsivos de `.section`, así que el valor de móvil vive en
    `40-prose.css` o no existe. Lo fija `geometry.spec.ts` («todos los huecos verticales miden lo
    mismo»), que afirma la aritmética **término a término** —los dos márgenes de los cantos y los del
    primer bloque y su h2— porque un residuo de 10px no se ve a ojo.
  - **El ámbar va por tamaño, no por gusto.** Negritas y enlaces en `--gold-ink` (#8A5A06, 5,92:1
    sobre blanco); la raya bajo cada titular en `--gold-line`, de 2px y a la **medida completa del
    carril** (con 56px era una marca junto al titular; a 1170 cierra su banda, que es lo que hace
    legible una jerarquía de ocho secciones a esta anchura). Consecuencia directa: la lista de
    preguntas frecuentes pierde su `border-top`, que con la raya completa era una segunda línea a
    todo lo ancho 18px más abajo en otro color y otro grosor. La firma del cierre en
    `--gold-display` a 26px, que **no baja de 24px ni en móvil** porque ahí dejaría de cumplir
    AA-large. Lo fija `paginas.spec.ts` («los temas del catálogo van en negrita y en el ámbar de
    texto», que afirma el `rgb(138, 90, 6)` exacto) y lo audita axe en `a11y.spec.ts`.
  - **Los enlaces dentro de la prosa heredan el tamaño del párrafo y van subrayados.** El `a` global
    es de 20px e `inline-block`: dentro de un párrafo de 19px desalineaba la línea base.
  - **El texto va a la medida completa del carril, no a la de lectura.** `.prose--wide`
    (`styles/40-prose.css`) quita el tope de 720px: tanto `/sobre-nosotros` como `/aviso-legal`
    ocupan los 1170px útiles del `.container` en desktop y el viewport menos 30px por debajo. El
    ancho no está escrito dos veces: sale del contenedor. `geometry.spec.ts` compara las cajas reales
    de ambas páginas en los ocho anchos y comprueba además que `.prose` no se encoja dentro de él.
- `/aviso-legal` — cabecera y cuerpo separados en dos secciones, carril y ritmo compartidos con
  `/sobre-nosotros`, raya de 2px bajo cada `h2` y `robots: noindex, follow`. Por petición expresa del
  cliente se retiraron la frase fiscal provisional y la sección «Servicios de terceros»; las seis
  secciones restantes conservan su orden y contenido. Ver D-37.
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
| 1 | **Los 6 testimonios reales**, con nombre/ocasión/texto. El consentimiento está aprobado, pero falta el texto fuente: Instagram no es legible desde el PDF ni desde este entorno sin login. **Ojo, cambió de forma:** la sección ya no está oculta — se publica con 6 textos de andamio marcados `todo: true`, y lo que impide colarlos como reales es un test que exige que las 6 marcas sigan puestas | `CONTENT_TODO.md §3` |
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
⚠ **Lo de las reseñas se revirtió el 13 ago, a propósito.** Se habían retirado del render y la
sección quedaba oculta; ahora se publica con las 6 de andamio marcadas `todo: true`. El motivo: una
portada que termina en la galería y salta al pie no tiene prueba social en ninguna parte, y el bloque
es normativo en el spec §6.7. Lo que sostiene la decisión es que la marca ya no es decorativa —hay un
test que exige que las 6 sigan puestas—, así que publicar el andamio como real requiere un acto
deliberado.

### 🟠 Bloquea operar el sitio

**Nada invalida la caché.** `CATALOG_CACHE_TAG` está definido en `lib/db/catalog.ts:77` y aplicado
como tag en la línea 127, pero **`revalidateTag` y `revalidatePath` no se llaman en ningún sitio del
repo** — sólo se mencionan en dos comentarios (`app/layout.tsx:77`, `lib/db/catalog.ts:76`).
Consecuencia real: un precio corregido tarda **hasta 1 hora** en verse.

**El catálogo sigue sin superficie de escritura.** Ya existe `POST /api/orders`, pero está limitado
a registrar intentos de pedido, clientes consentidos e ítems (`app/api/orders/route.ts`). No existe
ninguna Server Action ni `/admin`; los productos sólo cambian con `npm run db:seed` o SQL directo.
`db:seed` **pisa** las filas del catálogo, así que revierte cualquier corrección manual de precios.

### ⏳ Desarrollo por hacer

| Bloque | Qué implica |
| --- | --- |
| **Panel de administración** | La pieza que cierra las dos anteriores. Auth: `.env.example` reserva `AUTH_SECRET`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_TTL_HOURS`, `ADMIN_TOKEN_VERSION` — y **el script que genera el hash no existe todavía**. Los 8 `CHECK` de la tabla ya están puestos precisamente para proteger este borde de escritura |
| **Campañas de correo** | El carrito ya captura correo con consentimiento y lo relaciona con pedidos en Neon. Falta elegir una plataforma o exportación para enviar campañas; esta entrega no manda correos. La baja y el borrado se operan con `npm run customer:privacy` |
| **Despliegue** | Nunca se ha desplegado. El remoto git ya existe, pero falta elegir dominio/hosting. Aviso: **Vercel Hobby es de uso no comercial** y una tienda que vende es comercial; puede exigir el paso a Pro. Por eso todo el acceso a base de datos está detrás de `lib/db` y la cuenta de Neon es propia, no del marketplace: migrar a Cloudflare Pages es cuestión de días |
| **Fotos de producto en Blob** | `next.config.ts:13` deja pendiente `remotePatterns`. `next/image` está reservado para estas fotos (es la única excepción a D-9) y `eslint.config.mjs:46` lo documenta |
| **D-11 · `100svh`** | Condicional: sólo si el salto de la barra de direcciones de Safari en iOS se juzga inaceptable en un pase con dispositivo real. En escritorio son idénticos |

### Notas de alcance

Cosas que hoy están bien pero conviene saber antes de tocarlas:

- **Catálogo y pedidos están migrados.** `products` + `product_variants` sirven el catálogo;
  `customers` + `orders` + `order_items` + `form_rate_limits` reciben el checkout. El copy de la
  portada, los 6 testimonios, `about` y `legal` siguen siendo estáticos y no necesitan tablas.
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
- **La tarjeta de reseña no lleva retrato de ninguna clase.** No hay fotos de clientes reales, y
  usar caras de stock para un negocio que existe sería deshonesto. El SVG con iniciales que hacía de
  sustituto **también se retiró** (desvío D-34): ocupaba los 70px de una foto sin aportar nada de lo
  que una foto aporta.
- **No hay tests de componentes con jsdom.** La geometría se verifica en un navegador de verdad a los
  8 anchos, que es donde fallan las cosas que fallan aquí.
