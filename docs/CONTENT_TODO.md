# Contenido pendiente de Ale

Nada de esta lista bloquea el desarrollo: el sitio se construye con placeholders realistas en
español de Costa Rica, todos marcados `TODO` en el código. Pero **sí bloquea el lanzamiento**: no se
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

Ale entregó el catálogo completo en `data/boquita_products_catalog.xlsx`: **23 productos con 60
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

### 3. Los 6 testimonios

Con **nombre, rol, texto y consentimiento escrito** de cada persona. Los seis que hay en el código
son inventados y no pueden publicarse. Los avatares serán SVG con iniciales, así que no hacen falta
fotos de clientes.

El PDF de Instagram sólo trae fotos y permalinks; no trae comentarios ni captions extraíbles
(`assets/raw/manifest.json` lo documenta). Desde este entorno tampoco se pueden leer comentarios de
Instagram sin acceso interactivo/login. Para cerrar este bloque, dejar en `assets/testimonios/` seis
capturas o un `.txt/.md` con comentario, nombre y permiso.

**Estado v1:** la sección queda oculta en producción. No se publican reseñas inventadas ni siquiera
marcadas como `todo`.

### 4. La métrica nº 1

El bloque de servicio muestra dos métricas. La segunda («23 recetas en el catálogo») es verificable:
la calcula `lib/homeContent.ts` contando el catálogo servido. La primera es un placeholder:
**«2.400+ pedidos horneados desde 2019»** necesita un número real y defendible, o se cambia por otra
métrica que sí se pueda sostener.

### 4b. Dos fotos de producto en resolución original

De las 23 fotos que mandó Ale, **dos son miniaturas** y sólo dan el escalón de 400px de la escalera,
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
- ✅ Voz: profesional e informal, con voseo suave.
- Pendiente: URL real de Facebook y correo público. Mientras no existan, no se muestran enlaces
  falsos.

### 9. Política de entrega

Ahora mismo asumido: **retiro en Condado del Río, Santa Ana, y entrega coordinada por WhatsApp**, sin
costo modelado. Definir:

- ¿Hay entrega a domicilio? ¿Con costo fijo o por zona?
- ¿Qué zonas se cubren? (asumido: Santa Ana, Escazú y alrededores)
- ¿48 horas de anticipación es correcto para todo, o los queques personalizados necesitan más?

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
