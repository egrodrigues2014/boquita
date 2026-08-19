# Contenido pendiente de Ale

Nada de esta lista bloquea el desarrollo: el sitio se construye con placeholders realistas en
español latinoamericano neutro, todos marcados `TODO` en el código. Pero **sí bloquea el lanzamiento**: no se
puede publicar un sitio con testimonios inventados ni con precios que no son los reales.

Ordenado por urgencia real, no por sección.

---

## 🔴 Bloquea el lanzamiento

### 1. Archivos del logo

- ✅ **Cerrado para v1.** `scripts/build-images.mjs` genera PNG transparente y variante clara desde
  `assets/logo-boquita.jpg`: `public/img/brand/logo-transparent-*` y `logo-light-*`.
- Sigue siendo mejor recibir un SVG original de marca cuando exista, pero ya no bloquea publicar.
- Medidas de uso: 43px de alto en la cabecera (≈99px de ancho), 36px en el pie.

### 2. Los precios reales — ✅ **CERRADO**

Ale entregó el catálogo completo en `data/boquita_products_catalog.xlsx`: **26 productos con 63
presentaciones**, cada una con su precio en colones. Está cargado en `content/products.ts` y sembrado
en Postgres, y **ya no queda ningún `priceTodo`** en el repo — hay un test que falla si vuelve a
aparecer uno (`tests/unit/shop.test.ts`).

El Excel queda como referencia de fondo. Lo único que se cambió al traerlo: tildes y erratas
(«limon», «lacteos», «Coffe Cake», «chocolatre», «Polvorones Espanoles»), los nombres reordenados a
español natural, y las etiquetas de presentación de los cupcakes —el Excel les da a las tres el mismo
`sale_unit` («molde cupcake») y sólo se distinguen por `package_quantity`—.

**Cómo se corrige un precio a partir de ahora:** hay dos caminos y conviene el segundo. Un `UPDATE`
en el SQL Editor de Neon aparece solo en ≤1 h, pero deja el fallback de `content/products.ts`
diciendo otra cosa. Editar `content/products.ts` y ejecutar `npm run db:seed` deja las dos fuentes de
acuerdo — y `db:seed` **pisa** la tabla, así que si se usó el primer camino antes, ese cambio se
revierte.

### 3. Los testimonios: faltan 3 de 6

**Hay tres reales**, entregadas por Ale y publicadas sin marca: `t1` (María Elena M., Escazú), `t2`
(Mirella S., Santa Ana) y `t3` (Vanessa Manco, Piedades de Santa Ana, 19 ago). Su texto original sin
editar, lo que se cambió al publicarlo y el estado de su permiso están en
`docs/TESTIMONIOS_FUENTES.md`.

**Faltan tres**, con **nombre, rol y texto** de cada persona más su **consentimiento escrito**.
`t4`…`t6` de `content/home.ts` siguen siendo de andamio.

✅ **El consentimiento de las tres publicadas está concedido** (Ale confirmó las dos primeras el 16
ago 2026 y la de Vanessa el 19 ago 2026). Queda anotado en `docs/TESTIMONIOS_FUENTES.md`; para las
tres que falten hace falta el mismo permiso.

⚠ **La de Vanessa es la primera que se publica resumida.** Su original medía ~980 caracteres contra
un tope de 320, así que lo publicado son 280 que conservan sus cinco argumentos; el detalle de qué se
comprimió y qué se atenuó está en su ficha del registro. Si llegan más reseñas largas, el mismo
criterio: se resume en el registro y se justifica ahí, nunca en silencio.

No hacen falta fotos: la tarjeta **ya no lleva retrato** (desvío D-34). El `rol` es la **ocasión del
pedido** («Cumpleaños en Santa Ana», «Pedido de oficina, Escazú»), no un cargo — eso es lo que da
credibilidad en una repostería. Ninguna de las tres dio ocasión, sólo la zona: «Clienta frecuente»
sale de lo que cuentan María Elena y Mirella, no de un dato suyo. El «Clienta de 4 años» de Vanessa sí
es dato suyo, y gasta los 40 caracteres exactos que admite el esquema. Si Ale sabe la ocasión real,
mejor.

El PDF de Instagram sólo trae fotos y permalinks; no trae comentarios ni captions extraíbles
(`assets/raw/manifest.json` lo documenta). Desde este entorno tampoco se pueden leer comentarios de
Instagram sin acceso interactivo/login. Para cerrar este bloque, anotar en `docs/TESTIMONIOS_FUENTES.md` el texto
de las tres que faltan, con su nombre y su permiso. Las capturas, si las hay, se quedan fuera del
repo como todos los originales (`/assets/*` está en `.gitignore`): lo que se versiona es el registro.

**Lo que impide publicar el andamio por descuido:** `tests/unit/content.test.ts` ya no cuenta las
marcas —eso prohibía el estado mixto y obligaba a esconder las reales— sino que **nombra** las que
faltan: `["t4","t5","t6"]`. Sustituir un texto sin quitar su marca, o quitar una marca sin sustituir
el texto, rompe el test. Cuando llegue la última, la lista queda vacía y el bloqueante se cierra.

**Las estrellas no son un dato de la reseña.** Las seis tarjetas muestran cinco estrellas por
decisión de negocio (desvío D-41), incluidas las tres inventadas, y María Elena escribió tres —
Vanessa no dio puntuación—. No hay campo `rating` y no debe haberlo mientras el copy sea andamio. Al cerrar este bloque conviene
decidir si las estrellas siguen siendo diseño o pasan a ser la puntuación de cada persona.

Restricciones de forma, ya validadas por `content/schema.ts`: exactamente **6 items** (o 0 para
apagar el bloque), `name` y `role` de 2 a 40 caracteres, y `quote` de 40 a **320** — el tope está
medido contra el `min-height` de `.review-card`, pasarlo desborda la tarjeta más corta.

### 4. La métrica nº 1

✅ **Cerrado el 16 ago 2026.** Ale dio la cifra: la portada dice **«+100 pedidos horneados desde
2022»**, y el «+» es deliberado — es un suelo que puede defender, no una estimación. El `⚠ TODO`
salió de `content/home.ts` y `tests/unit/content.test.ts` fija ahora las dos métricas para que
mover cualquiera de ellas sea una decisión y no un descuido de edición.

El bloque de servicio muestra dos métricas. La segunda («26 recetas en el catálogo») es verificable:
la calcula `lib/homeContent.ts` contando el catálogo servido. El **año ya era el bueno** (13 ago):
Ale sitúa el primer pedido
vendido en **abril de 2022**, y ese es el dato que cuenta `content/pages.ts`. La portada decía 2019 y
se corrigió para que las dos páginas no se desmintieran.

Ojo con el número de recetas: Ale cuenta **veinte recetas base** (7 queques, 3 galletas, 8 postres,
2 salados) y la métrica cuenta **26 productos** del catálogo, porque los cupcakes son la misma receta
en otro molde. Por eso «Sobre nosotros» dice «recetas base» y no «recetas» a secas.

### 4b. Dos fotos de producto en resolución original

De las 26 fotos que mandó Ale, **dos son miniaturas** y sólo dan el escalón de 400px de la escalera,
así que en la ficha —que renderiza a ~540px— se ven blandas. El pipeline no hace upscale nunca, y
falsear el segundo escalón sería peor que la foto blanda. Los dos productos van marcados `photoTodo`:

| SKU | Producto | Tamaño de la fuente |
| --- | --- | --- |
| `QUE-03` | Cupcakes de limón | 403 × 268 |
| `QUE-010` | Queque de vainilla | 407 × 320 |

Con originales de ≥1200px de ancho basta con reemplazar el fichero en `assets/products/`, correr
`npm run images:build` y quitar el `photoTodo` con sus alturas nuevas.

Aparte: la foto de los **cupcakes de banano** (`QUE-011.jpg`) venía de un blog de repostería ajeno con
su marca de agua. La marca ya está recortada, pero conviene una foto propia de Ale.

---

## 🟠 Bloquea la verificación del layout

### 5. Fotografía

Los ratios los fija el spec §7 y no son negociables: si la foto no tiene la proporción, el recorte
decapita el producto.

| Slot | Ratio / medida | Prioridad |
| --- | --- | --- |
| **Panorámica del mostrador o la mesa** | 2.9:1, **a resolución original** (mín. 2340px de ancho) | 🔥 la más urgente |
| Retrato del hero | ~3:4, mín. 1000px de alto (ideal 1500×2000) | alta |
| 8 fotos de galería | 4:3 horizontal (321×239 renderizado, 642×478 a 2×) | alta |
| Retrato de servicio | ratio ≈0.87 (540×624, ideal 1080×1248) | media |
| Still del vídeo + el vídeo | ~5:3 (493×300) | media |
| Foto del CTA del pie | 1.5:1 (585×384) | media |
| 2 recortes de ~100px | producto centrado sobre **fondo blanco** | baja |

**Por qué urge la panorámica:** las 37 fotos que se extrajeron del PDF de Instagram están capadas a
**1440px de ancho** y ya vienen recomprimidas. Para el slot panorámico eso da ~1.23× de densidad
donde harían falta 2×. No se va a fabricar un upscale: sería desenfoque a triple peso.

---

## 🟡 Necesario, pero no bloqueante

### 6. Datos de contacto

- ✅ Dirección pública: Calle Obelisco, condominio Condado del Río, Santa Ana.
- ✅ WhatsApp/pedidos: +506 7132 2355.
- ✅ Instagram publicado: @boquita_cr.
- ✅ Voz: profesional y cercana, en español latinoamericano neutro y con tuteo. En `/sobre-nosotros` es **primera persona del
  singular** —ahí habla Ale—, mientras el resto del sitio va en plural.
- ✅ Correo público: `ticaboquita@gmail.com`, en `CONTACT.email` (`lib/contact.ts`). Se muestra en el
  cierre de «Sobre Nosotros» y, desde que el pie pasó de `social` a `contacts`, también en su columna
  de contacto.
- Pendiente: URL real de Facebook. Mientras no exista, no se muestra un enlace falso.

### 9. Política de entrega — ✅ **CERRADA** (13 ago)

Contestada por Ale en `docs/boquita-sobre-nosotros.md` y publicada en `/sobre-nosotros#entregas`:

- **Retiro** en Calle Obelisco, condominio Condado del Río, Santa Ana.
- **Entrega en todo el Gran Área Metropolitana**: en los sectores cercanos la lleva Ale en su propio
  vehículo, y para el resto se coordina con mensajería. Sin costo modelado en el sitio: la zona y la
  hora se acuerdan al confirmar el pedido.
- **Pago en efectivo o por SINPE**, al confirmar. Esto cierra también el `todo` que llevaba la
  pregunta «¿Cómo se paga?» de la FAQ.
- **Abono del 50% o pago total para confirmar el pedido** (añadido por Ale el 17 ago): si se
  abona, el 50% restante se paga al retirar. Publicado en los tres sitios que hablan de pago —
  «Cómo hacer tu pedido:», «Formas de pago:» y la FAQ «¿Cómo se paga?»—, todos en
  `content/pages.ts`.
- **48 horas** de anticipación para casi todo y **una semana** para los queques personalizados
  (también los de dos pisos).

### 10. Precio de los queques personalizados

Van **sin precio fijo** (`price_on_request`) y en el mensaje de WhatsApp aparecen como «precio a
convenir». El Excel da `price_min` = ₡22.000, que es el «desde» que se publica. Si hay una tarifa por
piso o por porción, mejor ponerla.

### 11. Dos ocasiones con un solo producto

En la columna `occasions` del Excel, **`navidad` sólo la tienen los polvorones** y **`baby-shower`
sólo el queque personalizado**. Los dos filtros del menú «Ocasiones» funcionan, pero muestran una sola
tarjeta. No es un bug —es lo que dicen los datos— pero conviene revisar con Ale si hay más productos
que encajan.

---

## Revisión de derechos de imagen

Las 37 fotos salen de la cuenta de la tienda, así que presumiblemente son de Ale. Antes de publicar
hay que descartar cualquiera que contenga:

- una persona identificable que no haya dado permiso,
- la casa o el evento privado de un cliente,
- contenido reposteado de otra cuenta.

El script de extracción guarda el permalink de Instagram de cada foto
(`assets/raw/manifest.json`), así que la auditoría es rápida: cada imagen se puede rastrear a su
publicación original.
