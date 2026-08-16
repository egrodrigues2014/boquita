# Reseñas reales: original, autoría y permiso

Lo que se publica en `content/home.ts` lleva **edición ligera** —tildes, puntuación y poco más—. Aquí
queda el texto tal como lo escribió cada persona, para poder comprobar después que la edición fue
fiel. Si alguna vez hay duda sobre una cita publicada, este fichero manda.

Lo que `docs/CONTENT_TODO.md` §3 pide para cerrar el bloque: comentario, nombre y permiso de las seis.
**Hay dos de seis.**

---

## t1 — María Elena M., Escazú

**Original, sin tocar:**

> Los postres de Ale son deliciosos ! Su torta de zanahoria es la mejor: textura, sabor, presentación
> . Es mi favorita . Los polvorones deliciosos y las galletas adictivas ! La verdad es que es
> inposible escoger entre todas sus recetas ! ⭐️⭐️⭐️. Maria Elena M., Escazú

**Qué se cambió al publicar:** `Maria` → `María`; `inposible` → `imposible`; los espacios sueltos antes
de `!` y `.`; las admiraciones pasan a punto. Ni una palabra sustituida.

⚠ **Escribió tres estrellas y la tarjeta muestra cinco.** Las cinco estrellas son un elemento fijo de
diseño aplicado a las seis tarjetas por decisión de negocio (desvío D-41), no la puntuación que dio
esta persona. Queda anotado aquí porque en el sitio no se distingue.

**Consentimiento:** ⏳ **pendiente de confirmar con Ale.** Está publicada con nombre.

---

## t2 — Mirella S., Santa Ana

**Original, sin tocar:**

> Los postres de Ale son deliciosos. Torta de zanahoria. Polvorones. Barra de dátiles. Queque de
> limón, pie de brigadeiros algunos de ellos que he probado todos espectaculares. Recomendadisimos.
> Mirella S, Santa Ana

**Qué se cambió al publicar:** la lista de productos, que iba en frases sueltas sin verbo, se une en
una sola («… pie de brigadeiros: de todos los que he probado, todos espectaculares»);
`Recomendadisimos` → `Recomendadísimos`; `Mirella S` → `Mirella S.`. No se añadió ningún producto que
no nombrara ella.

**Consentimiento:** ⏳ **pendiente de confirmar con Ale.** Está publicada con nombre.

---

## Notas de forma

- **«torta» se respeta.** El sitio dice «queque» por decisión comercial, pero una cita no se reescribe
  para que encaje con el vocabulario de la marca. El buscador de la tienda ya entiende «torta» como
  sinónimo de la categoría, así que nadie se pierde.
- El campo `role` de la tarjeta es la **ocasión del pedido**, y ninguna de las dos la dio: sólo
  dijeron la zona. «Clienta frecuente» sale de lo que ambas cuentan —que han probado varias recetas—,
  no de un dato que hayan aportado. Si Ale sabe la ocasión real, es mejor.
- Restricciones que valida `content/schema.ts`: `name` y `role` de 2 a 40 caracteres, `quote` de 40 a
  320, y **exactamente 6 reseñas o ninguna**. Por eso las cuatro de andamio siguen en su sitio.

## Faltan (t3 a t6)

Cuatro reseñas reales con nombre, ocasión, texto y permiso. Mientras tanto, `t3`…`t6` de
`content/home.ts` van marcadas `todo: true` y `tests/unit/content.test.ts` las nombra una a una: en
cuanto una se sustituya sin quitar su marca —o se quite una marca sin sustituir el texto— el test
rompe.
