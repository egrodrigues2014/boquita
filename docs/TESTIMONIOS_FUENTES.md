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

**Qué se cambió al publicar.** Ésta es la única de las tres que se **resume**, y por eso hace falta
detallarlo: el original mide ~980 caracteres y el tope de `quote` son 320, así que no cabía entera.
Lo publicado (280 car.) conserva sus cinco argumentos en su orden —cuatro años de clienta, el queque
de zanahoria como favorito, la textura y el sabor casero, los polvorones españoles, y los
ingredientes naturales con el azúcar cuidada— y **no le atribuye ningún producto que ella no
nombrara**. Los cambios, uno a uno:

- **Se comprime, no se reescribe.** Cinco párrafos pasan a cuatro frases; el vocabulario es suyo.
- **Cae el `❤️`** del cierre: ninguna tarjeta lleva emoji.
- **Cae la marca escrita.** Ella dice «Boquitas» (y una vez «Boquita»); la cita publicada habla de
  «Ale», como las otras dos, en vez de citar el nombre comercial con una `s` de más.
- **«sin aditivos químicos» se atenúa** a «con ingredientes naturales y cuidando el azúcar». Es su
  opinión, pero en la portada una frase así funciona como reclamo del producto, y el sitio no afirma
  eso en ningún otro sitio. Igual se cae «propuesta más saludable».
- **Cae el superlativo del cierre** («sinónimo de sabor casero…»), que era resumen de lo anterior.

⚠ **«queque» aquí es palabra suya.** A diferencia de `t1` y `t2`, que dicen «torta», esta reseña ya
usa el vocabulario del sitio: no se corrigió nada.

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
  varias recetas—, no de un dato que hayan aportado. El de Vanessa sí es dato suyo: «Clienta de 4
  años» son los cuatro años que ella misma cuenta, y gasta los **40 caracteres exactos** que permite
  el esquema, así que retocarlo obliga a acortarlo. Si Ale sabe la ocasión real, es mejor.
- Restricciones que valida `content/schema.ts`: `name` y `role` de 2 a 40 caracteres, `quote` de 40 a
  320, y **exactamente 6 reseñas o ninguna**. Por eso las tres de andamio siguen en su sitio.

## Faltan (t4 a t6)

Tres reseñas reales con nombre, ocasión, texto y permiso. Mientras tanto, `t4`…`t6` de
`content/home.ts` van marcadas `todo: true` y `tests/unit/content.test.ts` las nombra una a una
—`["t4","t5","t6"]`—: en cuanto una se sustituya sin quitar su marca —o se quite una marca sin
sustituir el texto— el test rompe.
