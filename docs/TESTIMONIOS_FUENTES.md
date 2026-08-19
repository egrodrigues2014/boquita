# Reseñas reales: original, autoría y permiso

Lo que se publica en `content/home.ts` lleva **edición ligera** —tildes, puntuación y poco más—. Aquí
queda el texto tal como lo escribió cada persona, para poder comprobar después que la edición fue
fiel. Si alguna vez hay duda sobre una cita publicada, este fichero manda.

Lo que `docs/CONTENT_TODO.md` §3 pide para cerrar el bloque: comentario, nombre y permiso de las seis.
**Hay tres de seis.**

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

**Consentimiento:** ✅ **concedido.** Ale confirmó el 16 de agosto de 2026 que las dos personas
dieron el visto bueno a publicar su reseña con nombre.

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

**Consentimiento:** ✅ **concedido.** Ale confirmó el 16 de agosto de 2026 que las dos personas
dieron el visto bueno a publicar su reseña con nombre.

---

## t3 — Vanessa Manco, Piedades de Santa Ana

**Original, sin tocar:**

> Tengo cuatro años comprando los deliciosos productos de Boquitas, de Ale, y la calidad siempre ha
> sido excepcional.
>
> Mi favorito indiscutible es su espectacular queque de zanahoria: para mí, ¡el más rico que he
> probado! Es increíblemente esponjoso, fresco y con un sabor natural, de esos que realmente se
> sienten hechos en casa y con muchísimo cuidado.
>
> También me encantan sus polvorones españoles, absolutamente deliciosos.
>
> Algo que valoro muchísimo de Boquita es que sus productos se elaboran con ingredientes naturales,
> sin aditivos químicos y cuidando el nivel de azúcar, logrando postres deliciosos y con una
> propuesta más saludable, sin sacrificar el sabor.
>
> Después de tantos años comprándoles, los sigo recomendando con muchísimo gusto. Boquitas es
> sinónimo de sabor casero, calidad y productos hechos con dedicación. ❤️
> Vanessa Manco
> Piedades de Santa Ana

**Segunda versión, también suya (19 ago).** Ale reenvió los dos últimos párrafos con dos correcciones
de ella misma —«**cinco** años» donde antes decía «tantos años», y «**Boquita**» sin la `s`—, y es de
esta versión de donde sale lo publicado:

> Algo que valoro muchísimo de Boquita es que sus productos se elaboran con ingredientes naturales,
> sin aditivos químicos y cuidando el nivel de azúcar, logrando postres deliciosos y con una
> propuesta más saludable, sin sacrificar el sabor.
>
> Después de cinco años comprándoles, los sigo recomendando con muchísimo gusto. Boquita es sinónimo
> de sabor casero, calidad y productos hechos con dedicación. ❤️

**Qué se cambió al publicar: nada del texto.** Es **cita literal** de esos dos párrafos, con su ❤️,
unidos en un solo párrafo porque la tarjeta rinde un único `<p>`. Son 400 caracteres.

Hubo una versión intermedia, resumida a 280, que estuvo publicada unas horas del 19 ago: se descartó
porque el cliente prefirió sus palabras exactas. **Para poder publicarla entera se subió el tope de
`quote` de 320 a 400** en `content/schema.ts`, con el coste medido sobre el build: la fila de
tarjetas pasa a **579px a 992 y 525px a 390** —+108px sobre la versión resumida— y las de andamio
quedan con 199-226px de crema debajo, porque las seis igualan altura. Ninguna desborda: la tarjeta no
recorta ni trunca, así que una cita larga estira la fila y no rompe nada.

Lo que **no** se publica de su original son los dos primeros párrafos (los cuatro años, el queque de
zanahoria y los polvorones), que se quedaron fuera al elegir este fragmento. Están arriba, íntegros,
por si algún día se rota la cita.

⚠ **«queque» era palabra suya** en los párrafos que no se publican. En el fragmento publicado no
aparece ningún nombre de producto, así que no hay nada que «corregir» al vocabulario del sitio.

⚠ **«sin aditivos químicos» se publica tal cual, y es una afirmación sobre el producto**, no sólo una
opinión de sabor. Va en boca de ella y con su permiso, pero el sitio no lo afirma en ningún otro
sitio: si algún día hay que sostenerlo, éste es el único lugar donde aparece.

⚠ **Es la única tarjeta con emoji.** El `❤️` es suyo y se respeta.

**No dio estrellas**, así que la tarjeta no contradice ninguna puntuación (a diferencia de `t1`).
Las cinco son el elemento fijo de diseño de siempre (desvío D-41).

**Consentimiento:** ✅ **concedido.** Ale confirmó el 19 de agosto de 2026 el visto bueno a publicar
la reseña con nombre completo.

---

## Notas de forma

- **«torta» se respeta.** El sitio dice «queque» por decisión comercial, pero una cita no se reescribe
  para que encaje con el vocabulario de la marca. El buscador de la tienda ya entiende «torta» como
  sinónimo de la categoría, así que nadie se pierde.
- El campo `role` de la tarjeta es la **ocasión del pedido**, y ninguna de las tres la dio: sólo
  dijeron la zona. «Clienta frecuente» sale de lo que cuentan María Elena y Mirella —que han probado
  varias recetas—, no de un dato que hayan aportado. El de Vanessa sí es dato suyo: «Clienta + de 4
  años» es la fórmula que pidió el cliente. Dice «Piedades» y no «Piedades de Santa Ana» **por
  composición**: con el distrito completo pasaba de los 40 del esquema y salía en dos líneas a 992,
  bajando su párrafo 27px respecto a las vecinas. Hasta ~29 caracteres cabe en una línea.
- Restricciones que valida `content/schema.ts`: `name` y `role` de 2 a 40 caracteres, `quote` de 40 a
  **400** (era 320 hasta el 19 ago), y **exactamente 6 reseñas o ninguna**. Por eso las tres de
  andamio siguen en su sitio. `t3` gasta los 400 exactos: añadirle un carácter rompe el test a
  propósito, para que subir el tope vuelva a ser una decisión y no un arrastre.

## Faltan (t4 a t6)

Tres reseñas reales con nombre, ocasión, texto y permiso. Mientras tanto, `t4`…`t6` de
`content/home.ts` van marcadas `todo: true` y `tests/unit/content.test.ts` las nombra una a una
—`["t4","t5","t6"]`—: en cuanto una se sustituya sin quitar su marca —o se quite una marca sin
sustituir el texto— el test rompe.
