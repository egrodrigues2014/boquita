# Contenido pendiente de Ale

Nada de esta lista bloquea el desarrollo: el sitio se construye con placeholders realistas en
español de Costa Rica, todos marcados `TODO` en el código. Pero **sí bloquea el lanzamiento**: no se
puede publicar un sitio con testimonios inventados ni con precios que no son los reales.

Ordenado por urgencia real, no por sección.

---

## 🔴 Bloquea el lanzamiento

### 1. Archivos del logo

- **SVG o PNG con fondo transparente.** El archivo actual (`assets/logo-boquita.jpg`) es un JPEG con
  el fondo blanco horneado en los píxeles. Sobre el footer marrón se vería como **una caja blanca**.
- **Una variante clara o en negativo** para ese mismo footer marrón.
- Medidas de uso: 43px de alto en la cabecera (≈99px de ancho), 36px en el pie.

### 2. Los precios reales

El menú fijado en Instagram (post del 31 ene 2024) tiene la lista de precios, pero **es una imagen**:
su texto no se puede extraer. Hacen falta los precios y las unidades de venta de:

| Producto | Placeholder en uso | Unidad asumida |
| --- | --- | --- |
| Queque de zanahoria | ₡ 14.000 | molde de 8 porciones |
| Queque personalizado | desde ₡ 22.000 | por encargo |
| Galletas de granola | ₡ 5.500 | caja de 6 |
| Galletas de chocolate y Nutella | ₡ 6.000 | caja de 6 |
| Polvorones de almendra | ₡ 5.000 | caja de 8 |
| Brigadeiros | ₡ 6.500 | docena |
| Biscotti de almendra | ₡ 5.800 | bolsa de 10 |
| Cachitos de jamón | ₡ 7.500 | media docena |

Y los 6 que van en `/tienda`: biscotti keto, key lime pie, barras de dátil, mini queques de manzana,
coffee cake vegano, asado negro.

De Instagram sí se pudieron leer estos, pero son de 2024 y hay que confirmarlos:
galletas chocolate chip y Nutella 6 u = ₡2.800 · brigadeiros 6 u = ₡3.000 / 12 u = ₡5.500 ·
galletas de granola light = ₡3.000 · miel y limón = ₡2.500 · asado negro = ₡16.000/kg.

### 3. Los 6 testimonios

Con **nombre, rol, texto y consentimiento escrito** de cada persona. Los seis que hay en el código
son inventados y no pueden publicarse. Los avatares serán SVG con iniciales, así que no hacen falta
fotos de clientes.

### 4. La métrica nº 1

El bloque de servicio muestra dos métricas. La segunda («14 recetas en el catálogo») es verificable.
La primera es un placeholder: **«2.400+ pedidos horneados desde 2019»** necesita un número real y
defendible, o se cambia por otra métrica que sí se pueda sostener.

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

- **Dirección postal exacta o punto de retiro.** Ahora dice sólo «Río Oro de Santa Ana, San José».
  El footer del spec pide una dirección, y el JSON-LD de negocio local la aprovecha para SEO.
- **Segundo teléfono.** El spec pide dos; sólo hay uno (+506 6276 2196).
- **URL de Facebook.** El spec pide 4 iconos sociales; hay dos reales (Instagram y WhatsApp).
- **Correo de contacto público.** ¿Se usa `ticaboquita@gmail.com` o se quiere uno del dominio?

### 7. Aclarar el handle de Instagram

La cuenta es **@boquitacostarica**, pero el PDF lista **@boquita_cr** como Instagram de contacto.
¿Cuál va en el sitio?

### 8. Registro de la voz

El copy está escrito con **voseo suave** («escribinos», «pedí», «enterate»), que es el registro de
@boquitacostarica. Confirmar, o cambiar a usted.

### 9. Política de entrega

Ahora mismo asumido: **retiro en Río Oro, y la entrega se coordina por WhatsApp**, sin costo
modelado. Definir:

- ¿Hay entrega a domicilio? ¿Con costo fijo o por zona?
- ¿Qué zonas se cubren? (asumido: Santa Ana, Escazú y alrededores)
- ¿48 horas de anticipación es correcto para todo, o los queques personalizados necesitan más?

### 10. Precio de los queques personalizados

Asumido: van **sin precio fijo** (`price_on_request`), y en el mensaje de WhatsApp aparecen como
«precio a convenir». Si tienen una tarifa base, mejor ponerla.

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
