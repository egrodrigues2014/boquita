# Estado del proyecto

**Este fichero es la única fuente de «qué está hecho y qué falta».** Se lee antes de empezar a
trabajar y se actualiza al cerrar cualquier bloque de trabajo. Si algo de aquí no coincide con el
código, el fichero está mal y se corrige: no hay una segunda lista que consultar.

Lo que **no** hace: no copia el detalle de otros documentos, los referencia.

| Para saber… | Ir a |
| --- | --- |
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

*Última revisión: 5 de agosto de 2026.*

| | |
| --- | --- |
| Rama | `main`, **sin remoto configurado** — no hay copia fuera de este disco |
| Último commit | Ver `git log -1 --oneline`; no se duplica aquí porque el hash queda obsoleto al commitear este fichero |
| Sin commitear | Al cerrar este bloque debe quedar **limpio**. Verificar con `git status --short` |
| Tests unitarios | **170 en verde**, 8 ficheros (`npm test`, verificado el 5 ago tras migrar/sembrar Neon) |
| Tests e2e | **647 en verde + 41 skipped** de 688 casos configurados (`npm run e2e -- --reporter=dot`, verificado el 5 ago tras migrar/sembrar Neon) |
| Desplegado | **no.** Nunca se ha desplegado. No hay proyecto de Vercel creado |
| Base de datos | Neon Postgres configurada, migrada y sembrada: `npm run db:seed` dejó **14 filas** en `products` |
| Lanzable | **no**, y no por código: faltan los precios reales y los testimonios. Ver [🔴](#-bloquea-el-lanzamiento) |

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

Verificado por `tests/unit/contrast.test.ts` (31) y `tests/unit/format.test.ts` (8).

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
- Nav con patrón *disclosure* (no `role="menu"`), 4 dropdowns + 1 enlace, panel de 320px a ≤991 con
  focus trap y scroll lock.
- Lightbox con `<dialog>` nativo, por **delegación** de eventos sobre los `data-lightbox` que
  renderiza el servidor.
- SEO local: JSON-LD `Bakery` + `WebSite` (`lib/seo.ts`), `opengraph-image.tsx` generada en runtime,
  `robots.ts` y `sitemap.ts`.

Verificado por `tests/e2e/geometry.spec.ts` (11), `interactions.spec.ts` (17), `lightbox.spec.ts` (4)
y `seo-perf.spec.ts` (10), a los 8 anchos.

### Tienda, fichas y carrito

- `/tienda` con filtros de categoría y ocasión **combinables** por `searchParams`, valores inválidos
  ignorados y estado vacío propio.
- `/tienda/[slug]` — las 14 fichas con `generateStaticParams`, `generateMetadata` async con OG, y
  JSON-LD `Product` con `availability: PreOrder`.
- Carrito en `localStorage` con clave versionada `boquita.cart.v1` (`lib/cart.ts`, Zustand +
  `persist`, `skipHydration`). El badge no se pinta antes de rehidratar, para no romper la hidratación.
- Checkout por WhatsApp (`lib/whatsapp.ts`): el botón final es un `<a href>` real a `wa.me` con el
  pedido escrito, con fallback a mensaje compacto si pasa de 1400 caracteres codificados. La fecha
  mínima sale del lead time más largo del carrito.
- **El carrito no se vacía al pulsar** — se vacía con un botón explícito de «ya hice mi pedido».
- Los productos a convenir (queque personalizado) no entran al carrito: su CTA va directo a WhatsApp.

Verificado por `tests/unit/whatsapp.test.ts` (17), `tests/unit/shop.test.ts` (29) y
`tests/e2e/tienda.spec.ts` (22).

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

Verificado por `tests/e2e/a11y.spec.ts` (9).

### El catálogo en Postgres

**El camino de lectura está completo y la Neon configurada ya tiene la tabla `products`.**

- Neon Postgres en AWS `us-east-1` (misma región que `iad1` de Vercel; no se puede cambiar después),
  driver HTTP `@neondatabase/serverless` + `drizzle-orm/neon-http`.
- `lib/db/schema.ts` — 1 tabla `products`, 2 `pgEnum` derivados de `types/shop.ts`, **8 `CHECK`**.
  `price` es `integer`, nunca `numeric` (el driver lo devolvería como `string`). La base guarda
  `image_heights` + `image_alt`, **no rutas**: el `srcSet` se reconstruye con `lib/productImage.ts`.
- `lib/db/catalog.ts` es la **única** lectura, y revalida cada fila con el mismo Zod que valida el
  catálogo estático (`content/shopSchema.ts`).
- **La tienda nunca se sirve vacía.** Sin `DATABASE_URL`, con la tabla vacía o con la consulta caída
  se sirve `content/products.ts` completo; una fila que no pasa Zod se sustituye por su versión del
  fallback; una fila mala que no está en el fallback se omite con aviso, no se inventa.
- `lib/homeContent.ts` **deriva** de la base las 3 cosas de la portada que dependen del catálogo —la
  rejilla de 8, el megamenú y la métrica de «recetas»— en vez de copiarlas. Si un destacado no está en
  el catálogo servido, se rellena con otro producto **del propio catálogo**, nunca del fallback (daría
  404).
- ISR de 1 h declarado en `app/layout.tsx` (el megamenú depende del catálogo, así que hasta la 404
  depende de la tabla) y **repetido** en `app/sitemap.ts`, porque las rutas de metadata no lo heredan.
- Migración generada y versionada: `drizzle/0000_grey_hex.sql`. Semilla idempotente
  (`ON CONFLICT (slug) DO UPDATE`) en `scripts/seed-catalog.ts`.
- Verificación real del 5 ago: antes de migrar, la Neon configurada respondía
  `relation "products" does not exist`; después de `npm run db:migrate` y `npm run db:seed`, el build
  y los e2e pasan sin caer al fallback por tabla inexistente.

Verificado por `tests/unit/catalog.test.ts` (16) y `tests/unit/homeContent.test.ts` (12).

### Rendimiento, medido

En el build de producción, no estimado:

| | 1440px | 390px |
| --- | --- | --- |
| LCP | 140 ms | 148 ms |
| CLS | 0.0004 | 0.0000 |
| Primera carga | 805 KB | 465 KB |

Presupuestos: LCP < 2.5 s · CLS < 0.05 · < 1.2 MB. Las 14 celdas de la galería generan **8**
descargas, no 14. Todo ello afirmado por `tests/e2e/seo-perf.spec.ts`.

---

## Pendiente

### 🔴 Bloquea el lanzamiento

Nada de esto es código. Detalle completo en `docs/CONTENT_TODO.md`.

| | Qué falta | Dónde |
| --- | --- | --- |
| 1 | **Logo en SVG/PNG transparente** y variante clara. El actual es un JPEG con fondo blanco horneado: sobre el pie marrón sería una caja blanca | `CONTENT_TODO.md §1` |
| 2 | **Los 14 precios reales.** Todos son placeholders marcados `priceTodo`; el menú de Instagram es una imagen y su texto no se puede extraer | `CONTENT_TODO.md §2` |
| 3 | **Los 6 testimonios**, con nombre, rol, texto y consentimiento escrito. Los que hay son inventados y no pueden publicarse | `CONTENT_TODO.md §3` |
| 4 | **La métrica nº 1** («2.400+ pedidos desde 2019») necesita un número real y defendible | `CONTENT_TODO.md §4` |

Hay tests que **fallan** si se desmarcan los `priceTodo` o los testimonios sin sustituirlos de
verdad (`tests/unit/shop.test.ts`, `tests/unit/content.test.ts`). Quitar la marca es un acto
explícito, no un descuido posible.

🟠 Aparte, la **panorámica del mostrador a resolución original** (mín. 2340px de ancho) bloquea la
verificación del layout: las 37 fotos del PDF están capadas a 1440px y dan ~1.23× donde hacen falta
2×. `CONTENT_TODO.md §5`.

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
| **Despliegue** | Nunca se ha desplegado y no hay remoto de git. Aviso: **Vercel Hobby es de uso no comercial** y una tienda que vende es comercial; puede exigir el paso a Pro. Por eso todo el acceso a base de datos está detrás de `lib/db` y la cuenta de Neon es propia, no del marketplace: migrar a Cloudflare Pages es cuestión de días |
| **Fotos de producto en Blob** | `next.config.ts:13` deja pendiente `remotePatterns`. `next/image` está reservado para estas fotos (es la única excepción a D-9) y `eslint.config.mjs:46` lo documenta |
| **D-11 · `100svh`** | Condicional: sólo si el salto de la barra de direcciones de Safari en iOS se juzga inaceptable en un pase con dispositivo real. En escritorio son idénticos |

### Notas de alcance

Cosas que hoy están bien pero conviene saber antes de tocarlas:

- **Sólo `products` está migrado.** Todo el resto del contenido sigue siendo estático: el copy de la
  portada y los 6 testimonios en `content/home.ts`, `about` y `legal` en `content/pages.ts`. No hay
  tablas para nada de eso, y probablemente no deba haberlas hasta que alguien las necesite editar.
- **`components/cart/CartDrawer.tsx` importa `findProduct` del catálogo estático.** Es inevitable —es
  Client Component y el catálogo ya no vive en el cliente— y es el respaldo para líneas de carrito
  antiguas sin `leadTimeHours`. Pero significa que un lead time cambiado en la base **no** se refleja
  en ese cálculo de fecha mínima.
- **`lib/seo.ts` y `app/layout.tsx` leen el `home` estático** para el JSON-LD del negocio y el preload
  del hero. Correcto hoy; no son datos de la base.

---

## El árbol de trabajo ahora mismo

El bloque de base de datos ya está listo para quedar commiteado: migración, seed, lectura con fallback,
derivación de la portada y tests unitarios/e2e se verificaron juntos el 5 ago.

Antes de seguir desarrollando, este comando debe salir vacío:

```
git status --short
```

Sigue siendo un riesgo que la rama `main` no tenga remoto configurado: aunque el trabajo quede en
commits locales, todavía no hay copia fuera de este disco.

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
| `docs/IMAGE_MAP.md:195` | «## Fichas de producto — Fase 4» | las 14 fichas existen |
| `lib/hooks/useScrollLock.ts:9` | «(en la Fase 4) el carrito» | el carrito usa el hook ya |
| `components/sections/OverlapMenu.tsx:20` | «ésas son de la Fase 4, en las fichas» | las fichas existen |
| `app/layout.tsx:77`, `lib/db/catalog.ts:76` | «el panel de la fase 3» | el panel sigue pendiente, pero el número ya no ubica nada |

---

## Verificación

| Comando | Qué protege |
| --- | --- |
| `npm test` | 170 unitarios: moneda, contraste recalculado desde el CSS, catálogo y su fallback, derivación de la portada, parallax, WhatsApp |
| `npm run typecheck` | `tsc --noEmit`, con `noUncheckedIndexedAccess` |
| `npm run lint` | `eslint .` |
| `npm run build && npm run e2e` | 688 e2e a 8 anchos: geometría, interacciones, lightbox, tienda, páginas, SEO, presupuestos y axe. Arranca su propio servidor en el puerto 3100 contra el **build de producción** |
| `npm run images:build -- --check` | valida los recortes sin escribir nada |

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
