# Boquita — Sweet & Salty

Sitio web de **Boquita**, repostería artesanal casera en Santa Ana, San José, Costa Rica.
Queques de zanahoria, limón y chocolate, cupcakes, polvorones españoles, galletas de granola,
brigadeiros, pies y quesillo. Horneado por encargo, en tandas pequeñas.

Instagram [@boquita_cr](https://instagram.com/boquita_cr) · WhatsApp +506 7132 2355

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · CSS global escrito a mano · Neon Postgres +
Drizzle · preparado para despliegue, todavía sin producción.

Un solo proyecto: las API Routes **son** el backend Node. Sin pasarela de pago — el checkout arma un
mensaje de WhatsApp pre-rellenado, que es el canal que la tienda ya usa.

## Empezar

```bash
npm install
cp .env.example .env.local     # sin ninguna variable el sitio funciona igual
npm run dev                   # http://localhost:3000
```

**No hace falta base de datos para desarrollar.** Sin `DATABASE_URL`, el catálogo sale de
`content/products.ts` y todo funciona: dev, build, los tests unitarios y los e2e. Es el modo en que
corre CI. Ver [El catálogo y su fallback](#el-catálogo-y-su-fallback).

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | servidor de desarrollo |
| `npm run build` | build de producción |
| `npm test` | tests unitarios (moneda, contraste, catálogo, fallback de la base) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | `eslint .` |
| `npm run images:extract` | extrae las 37 fotos del PDF de Instagram a `assets/raw/` |
| `npm run images:build` | genera los derivados WebP/AVIF en `public/img/` (`--check` valida los recortes sin escribir) |
| `npm run e2e` | Playwright: geometría, interacciones, lightbox, SEO y presupuestos, a 8 anchos |
| `npm run db:generate` | genera el SQL de la migración en `drizzle/`. No conecta a nada |
| `npm run db:migrate` | aplica las migraciones (usa `DATABASE_URL_UNPOOLED`) |
| `npm run db:seed` | siembra `products` desde `content/products.ts`. Idempotente |
| `npm run db:studio` | inspector de Drizzle sobre la base |

Página útil en desarrollo: **`/dev/tokens`** — especímenes de la escala tipográfica, los tokens con
su ratio de contraste recalculado, y los componentes base. Es la referencia para verificar los 8
breakpoints del checklist.

## Cómo está organizado

```text
app/            rutas (App Router). layout.tsx hace el ÚNICO import de CSS
components/     sections/ (una por sección del spec) · layout/ · ui/ · cart/ · shop/
lib/            format.ts (moneda) · color.ts (contraste) · tokens.ts (lee el CSS)
lib/db/         TODO el acceso a Postgres: schema.ts · catalog.ts (lectura + fallback)
styles/         index.css encadena los parciales numerados. Ver más abajo
content/        contenido tipado; también el fallback cuando la BD está vacía
drizzle/        migraciones SQL versionadas. Generadas, se revisan a mano
scripts/        extracción de imágenes del PDF, build de derivados, semilla
docs/           el spec normativo y las decisiones que se apartan de él
assets/         originales (gitignored): el PDF, el logo, los 37 JPEG extraídos
tests/          unit/ (vitest) · e2e/ y a11y/ (Playwright, fase 6)
```

## Las tres reglas que no se rompen

Este proyecto replica `docs/frontend_spec.md`, una especificación de layout de 953 líneas, al
milímetro. Tres cosas fallan **en silencio** si se tocan:

### 1. Un solo import de CSS

`app/layout.tsx` importa exclusivamente `styles/index.css`, que encadena los parciales con `@import`.
No importar los parciales por separado: el orden de importación de CSS global en Next no está
garantizado entre varios imports, y aquí toda la cascada depende de él.

### 2. El orden de las media queries

El spec es **desktop-first**: la base vive en 992–1279px y se sobrescribe hacia arriba y hacia abajo.
En cada archivo de `styles/`, el orden obligatorio es:

```text
reglas base → min-width ascendente (1280, 1440, 1920) → max-width descendente (991, 767, 479)
```

`max-width:991` y `max-width:767` se solapan. Si 991 se escribe después de 767, gana silenciosamente
a 500px de ancho. Es el punto de mayor riesgo del proyecto.

### 3. Nada de Tailwind, ni CSS Modules

El spec estiliza elementos desnudos (`h1`–`h6`, `p`, `a`, `ul`, `li`), sus valores no están en
ninguna escala (`margin-top:-198px`, `right:218px`, `width:43.5%`), y sus **nombres de clase son el
contrato** de la checklist de aceptación. No hay ni un `*.module.css` en el repo: los componentes que
tampoco están en el spec van igualmente por `styles/` (`30-cart.css`, `22-lightbox.css`).

## Color: el ámbar tiene tres roles

El logo es marrón oscuro sobre amarillo dorado, pero un dorado **no pasa AA como texto sobre
blanco** (`#E8A81B` sobre blanco = 2.09:1). Así que `--primary` del spec se divide:

| Token | Uso | Ratio |
| --- | --- | --- |
| `--gold` `#E8A81B` | **sólo relleno** sobre fondo claro. Y texto dentro de `.footer-dark` | 6.58 sobre marrón |
| `--gold-display` `#B07208` | texto ámbar **≥24px**: `h2`, `h4`, `.text-primary`, `.stat-num` — incluido el titular revelado del statement, que hasta «Titular alineado» iba en `--gold-ink` y era el único `h2` fuera de este carril | 4.00 blanco / 3.68 crema |
| `--gold-ink` `#8A5A06` | texto ámbar **<24px** e interactivo: precios, enlaces, iconos | 5.92 blanco / 5.45 crema |
| `--gold-line` `#B07208` | trazos y bordes (umbral no-texto de 3:1) | 4.00 |
| `--gold-bright` `#F2C014` | el amarillo del logo, decorativo **sólo sobre oscuro** | 8.08 sobre marrón |

`--gold` nunca es texto sobre fondo claro. Por eso los botones son **relleno dorado con etiqueta
marrón**, no blanca como pedía el spec (desvío D-0).

`.footer-dark` re-declara los tokens de tinta, así que toda regla que use `var(--gold-ink)` se
invierte sola y sigue cumpliendo AA. **Cuidado con lo que se anida dentro:** todo lo que caiga bajo
`.footer-dark` hereda los tokens invertidos, y sobre un fondo claro dejaría de cumplir AA.

`tests/unit/contrast.test.ts` lee `styles/01-tokens.css` y recalcula los ~25 pares en cada `npm test`.
Si alguien cambia un color y rompe un ratio, el build falla ahí.

## Moneda

Precios **siempre enteros en colones**, y formateados con `lib/format.ts`, nunca con `Intl`:
`Intl.NumberFormat("es-CR")` devuelve `12 000` con espacio duro fino y sus separadores varían entre
builds de ICU, lo que provoca un mismatch de hidratación en un precio.

```ts
formatCRC(14000)      // "₡ 14.000 CRC"  → catálogo y páginas de producto
formatCRCShort(6500)  // "₡ 6.500"       → carrito y mensaje de WhatsApp
formatFrom(22000)     // "desde ₡ 22.000 CRC"
```

## El catálogo y su fallback

Son **23 productos con 60 presentaciones**, cargados del catálogo que entregó Ale
(`data/boquita_products_catalog.xlsx`). Viven en dos tablas de Neon: `products` y
`product_variants` —una fila por presentación, que es una fila del Excel—, con `content/products.ts`
como **fallback**. No es contenido muerto: es lo que se sirve en las situaciones de abajo.

**Un producto tiene varias presentaciones y cada una su precio.** El queque de zanahoria va a ₡2.500
pequeño, ₡12.000 mediano y ₡24.000 grande. De ahí tres cosas que conviene saber antes de tocar el
catálogo:

- **`price` es el precio de ENTRADA**, el de la presentación más barata, y es un espejo de
  `variants`: la tarjeta, el JSON-LD y la búsqueda necesitan un número sin recorrer la lista. Hay dos
  `.refine()` en `content/shopSchema.ts` que comprueban que sigue siendo el mínimo y que con varias
  presentaciones el precio se muestra «desde». Sin ellos, la tarjeta podría anunciar un importe que el
  selector de la ficha no ofrece — y eso no se ve hasta que alguien reclama.
- **La ficha lleva un selector de presentación** (`components/cart/ProductPurchase.tsx`), y el precio
  se recalcula con la selección. Desvíos D-30 y D-31.
- **Una línea del carrito se identifica por `(slug, unit)`**, no por el slug: dos tamaños del mismo
  queque son dos líneas con dos precios. Con la identidad en el slug se habrían fundido en una, con el
  precio del primero que se añadió.

| Situación | Qué se sirve |
| --- | --- |
| No hay `DATABASE_URL` | el fallback completo, sin ruido. Es el modo de CI y de un clon nuevo |
| La tabla está vacía | el fallback completo. Migración aplicada, semilla no ejecutada |
| La consulta falla | el fallback completo. Cómputo caído, credencial rotada |
| Una fila no cumple `shopSchema` | esa fila se sustituye por su versión del fallback; el resto viene de la base |
| Una fila mala que no está en el fallback | se omite y se avisa por consola. No se inventa nada |

La regla que gobierna las cinco: **la tienda nunca se sirve vacía.** Un catálogo en blanco por un
fallo de infraestructura le cuesta pedidos a Ale.

Un producto **sin presentaciones** también cae al fallback: no habría nada que añadir al carrito, así
que una ficha con un botón que no sabe qué hacer es peor que la versión de `content/products.ts`.

La validación de lectura reutiliza el MISMO Zod que valida el catálogo estático
(`content/shopSchema.ts`). Los mismos invariantes están además como `CHECK` en las dos tablas, para
proteger el borde de escritura cuando exista el panel: una descripción de 400 caracteres desmaqueta la
tarjeta, y un precio a convenir sin «desde» engaña con el importe.

**La portada se deriva del catálogo, no lo copia.** `lib/homeContent.ts` recalcula las dos cosas
que dependen de él —la rejilla de 8 y la métrica de «recetas»— sobre el copy de `content/home.ts`.
Los nombres y precios estuvieron duplicados una vez y derivaron: un slug viejo dejó un enlace
apuntando a una ficha inexistente. Si un destacado no está en el catálogo servido, se rellena con
otro producto **del propio catálogo**, nunca con uno del fallback que daría 404.

**Imágenes: la base guarda alturas, no rutas.** `image_heights` + `image_alt`, y el `srcSet` se
reconstruye con `lib/productImage.ts` —el mismo código que usa el catálogo estático—. Guardar las
rutas en Postgres sería garantizar que algún día no coincidan con lo que hay en `public/img/`.

Las fuentes van nombradas por SKU en `assets/products/` y la escalera es `[400, 800, 1200]`, con
proporción natural. **Dos fotos son miniaturas de ~400px y sólo emiten el primer escalón**: el script
no hace upscale nunca, así que el `srcSet` admite un solo elemento y los dos productos van marcados
`photoTodo`. Ver `docs/CONTENT_TODO.md §4b`.

**ISR de una hora, declarado en `app/layout.tsx`.** Va en el layout y no en cada página porque el
nav y varias páginas comparten contenido derivado del catálogo, así que hasta `/aviso-legal` y la 404
dependen de la tabla. Las páginas siguen saliendo del CDN y no de una función que espera a Postgres, y el cómputo de Neon
—que se autosuspende a los 5 minutos en el plan Free— tiene su arranque en frío en una regeneración
en segundo plano, nunca en una visita real.

### Corregir un precio, hoy

Sin panel de administración (fase 3) hay dos caminos:

```bash
# a) un arreglo puntual: UPDATE en el SQL Editor de Neon. Aparece solo en ≤1 h.
# b) varios precios: editar content/products.ts y volver a sembrar.
npm run db:seed
```

`db:seed` hace `ON CONFLICT (slug) DO UPDATE`, así que **pisa** lo que haya en la tabla: si alguien
corrigió un precio por SQL y el fallback sigue con el valor viejo, sembrar lo revierte. El script lo
avisa al terminar.

Las **presentaciones** no se upsertan: se borran por producto y se reinsertan. Un upsert dejaría vivas
las que el catálogo ya no tiene, y la ficha seguiría ofreciendo un tamaño retirado con su precio
viejo. Los precios ya son los reales de Ale y **no queda ningún `priceTodo`**; hay un test que falla
si vuelve a aparecer uno.

## Documentación

| Archivo | Contenido |
| --- | --- |
| `docs/ESTADO.md` | **qué está hecho y qué falta.** La única fuente de estado del proyecto |
| `docs/frontend_spec.md` | la especificación normativa de layout |
| `docs/DEVIATIONS.md` | **todo** lo que se aparta del spec, con su motivo. Si no está ahí, es un bug |
| `docs/CONTENT_TODO.md` | lo que falta de Ale antes de poder lanzar |
| `docs/implementation_tasks.md` | backlog UI/UX, con el estado verificado de cada tarea |
| `docs/HOME_CINEMATIC.md` | los cambios vigentes del bloque de portada cinemática |
| `docs/IMAGE_MAP.md` | qué foto va en cada slot, y por qué |

## Estado

**El estado vivo está en [`docs/ESTADO.md`](docs/ESTADO.md)**: qué está hecho, qué falta, qué bloquea
el lanzamiento y qué ha quedado sin cobertura de tests. Es la única lista que se mantiene al día —
esta sección no la duplica a propósito, porque dos listas de estado divergen siempre.

**No hay blog, y es deliberado.** Nada lo enlaza, el contenido lo escribiría quien programa y no
Ale, y un blog con dos entradas que nunca crece señala abandono más que actividad.

### El flujo de pedido

No hay pago online, a propósito: se pide por WhatsApp, que es el canal que la tienda ya usa.

1. El cliente elige una **presentación** en la ficha y la añade. El carrito vive en `localStorage`
   con clave versionada (`boquita.cart.v2`; subió a v2 porque al cargar el catálogo real cambiaron
   todos los slugs y un carrito de fantasmas es un pedido mal enviado).
2. El drawer del carrito recoge nombre, fecha, zona y notas. El correo promocional es opcional y
   sólo se acepta junto con su casilla de consentimiento. La fecha mínima se calcula desde el
   **lead time más largo del carrito**: si hay un queque personalizado, no se ofrece pasado mañana.
3. «Finalizar por WhatsApp» es un `<a href>` real a `api.whatsapp.com/send` con el pedido ya escrito
   — sobrevive al bloqueo de popups de iOS y funciona con WhatsApp Web. El correo nunca entra en ese
   mensaje.
4. El clic inicia en paralelo un `POST /api/orders`. Neon guarda un intento con estado
   `whatsapp_opened`; no afirma que el mensaje se enviara ni que exista una venta confirmada.
5. **El carrito no se vacía al pulsar.** WhatsApp puede no abrirse o el cliente puede cerrarlo sin
   enviar; vaciarlo ahí perdería el pedido sin que nadie lo haya recibido. Se vacía con un botón
   explícito después de guardar, o con «Vaciar de todos modos» si Neon falla.

Los productos con precio a convenir (el queque personalizado) **no entran al carrito**: su CTA va
directo a WhatsApp. Sumar un «desde» daría un total que no es el que se va a pagar.

Cada línea guarda su presentación, su precio **y su anticipación** en el momento de añadirse, no una
referencia al catálogo: el carrito vive en `localStorage` y el catálogo ya no vive en el cliente. Las
líneas de carritos anteriores al campo de anticipación se resuelven contra `content/products.ts`.

### Clientes, pedidos y privacidad

La migración `drizzle/0002_nervous_sprite.sql` añade `customers`, `orders`, `order_items` y
`form_rate_limits`; `0003_curvy_cerise.sql` añade los índices de retención y búsqueda por cliente.
El UUID nace en el navegador y se reutiliza al reintentar; una única sentencia con CTEs hace
atómicos cliente, pedido e ítems y evita duplicados. Los pedidos sin correo quedan con cliente nulo.
Con correo consentido se actualiza el cliente existente y se conserva cada pedido.

- Los intentos de pedido se eliminan a los **24 meses** en la limpieza oportunista de nuevas altas.
- El límite diario usa un HMAC de la IP con `IP_SALT`; la IP original no se almacena y los contadores
  vencidos se eliminan a los dos días. En producción, `IP_SALT` es obligatorio.
- `npm run customer:privacy -- optout correo@ejemplo.com` revoca promociones. El borrado completo
  exige confirmación explícita: `npm run customer:privacy -- delete correo@ejemplo.com --confirm`.
- Neon es por ahora la fuente de suscriptores. **Esta entrega no envía campañas** ni comparte la
  lista con una plataforma externa.

### El mensaje que recibe Ale

`lib/whatsapp.ts` lo arma con emoji y bloques titulados, y la presentación elegida viaja en su propia
línea porque es lo que hay que hornear:

```text
Hola, Ale 👋

🛍️ *Nuevo pedido desde boquitacostarica.com*

📋 *Detalle del pedido*
• 1 × Queque de limón
└ Pequeño (2 personas) — ₡ 2.250
• 1 × Brigadeiros
└ 12 unidades — ₡ 5.000

💰 *Total:* ₡ 7.250

👤 *Cliente:* Elton Rodrigues
📅 *Fecha deseada:* 28/08/2026

📌 *Solicitud:* Confirmar disponibilidad y detalles del pedido.

🌐 Generado desde boquitacostarica.com
```

**Las etiquetas son un contrato.** Hoy contesta Ale, pero el mensaje está pensado para que más adelante
lo parsee un chatbot: un dato por línea, rótulo fijo delante y `└` para la presentación. Añadir un campo
es seguro; **renombrar `*Cliente:*` rompe al consumidor.** Viven agrupadas en la constante `LABEL` del
módulo, con ese aviso escrito al lado.

Tres detalles que no son de gusto:

- **La negrita es de un asterisco**, que es lo que entiende WhatsApp. Con dos —sintaxis de Markdown— se
  ven literales en el chat, y hay un test que lo impide.
- **El enlace apunta a `api.whatsapp.com/send`, no a `wa.me`.** El atajo redirige a ese mismo endpoint,
  y en el salto WhatsApp recodifica la query con un codificador que no maneja pares surrogados: **cada
  emoji llegaba al chat como `�`**. Sobrevivía todo lo de 1-3 bytes y se perdía todo lo de 4, que son
  exactamente los emoji. Está explicado con las URLs medidas en `lib/contact.ts`, y hay tests que
  impiden volver a `wa.me` sin darse cuenta.
- **La fecha se convierte a `DD/MM/YYYY` partiendo la cadena, sin `Intl`**, por el mismo motivo que la
  moneda. `earliestDate` sigue devolviendo ISO: alimenta el `min` del `<input type="date">`.
- **El techo de 1600 caracteres codificados está medido**, no estimado: cada producto cuesta ~110 y la
  cabecera ~585, así que con el 1400 anterior un pedido de 8 productos caía al mensaje compacto y
  perdía el detalle. Lo fija un test con un carrito de 8.

### Medido, no estimado

Tests unitarios (vitest) y e2e a los 8 anchos del checklist; el recuento vigente y el resultado de la
última corrida están en [`docs/ESTADO.md`](docs/ESTADO.md). En el build de producción:

| | 1440px | 390px |
| --- | --- | --- |
| LCP | 140 ms | 148 ms |
| CLS | 0.0004 | 0.0000 |
| Primera carga | 805 KB | 465 KB |

Presupuestos: LCP < 2.5 s · CLS < 0.05 · < 1.2 MB. El CSS son 32 KB minificados; el JavaScript
propio, ~8 KB sobre los 103 KB del framework de Next.

Las 14 celdas de la galería generan **8 descargas**, no 14: las repetidas comparten `src` y `sizes`,
así que el navegador reutiliza la misma petición. Hay un test que lo afirma.

## Dos cosas que conviene saber

**Vercel Hobby es para uso no comercial.** Una tienda que vende productos es comercial y Vercel
puede pedir el paso a Pro. Por eso todo el acceso a base de datos está detrás de `lib/db` —`index.ts`
construye el único cliente y los módulos de catálogo y pedidos concentran las consultas— y las
subidas de archivos irán detrás de una interfaz `StorageDriver`: migrar a Cloudflare Pages (que sí
permite uso comercial en su plan gratis) es cuestión de días, no de semanas. La cuenta de Neon es
propia y no del marketplace de Vercel, precisamente para no atar la base al host.

**El plan Free de Neon da 100 CU-horas al mes y el cómputo se autosuspende a los 5 minutos.** Por eso
la lectura del catálogo está en `unstable_cache` con una hora de vida: sin ella, `/tienda` —que es
dinámica porque lee `searchParams`— iría a Postgres en cada visita y un goteo de tráfico mantendría
el cómputo despierto casi todo el día, que no cabe en esa cifra.

**El repositorio vive en una carpeta sincronizada por OneDrive.** `npm install` funciona sin
problemas, pero si aparecen errores `EPERM` de bloqueo de archivos durante `next dev`, mover el
proyecto a una ruta no sincronizada (`C:\dev\boquita`) o excluir `node_modules` y `.next` de la
sincronización.
