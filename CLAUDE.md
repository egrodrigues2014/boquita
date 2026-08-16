# CLAUDE.md

Sitio de **Boquita — Sweet & Salty**, repostería artesanal en Río Oro de Santa Ana, Costa Rica.
Next.js 15 (App Router) · React 19 · TypeScript · CSS global escrito a mano · Neon Postgres +
Drizzle. Sin pasarela de pago: el checkout arma un mensaje de WhatsApp.

## Antes de empezar: lee `docs/ESTADO.md`

Es la **única fuente** de «qué está hecho y qué falta». No reconstruyas el estado leyendo el repo
entero — para eso existe ese fichero.

## Al terminar: actualiza `docs/ESTADO.md`

Al cerrar cualquier bloque de trabajo, en el mismo commit:

1. Mover lo cerrado de **Pendiente** a **Hecho**, con su puntero a fichero.
2. Refrescar **De un vistazo**: tests, árbol de trabajo, lo que haya cambiado.
3. Anotar los pendientes **nuevos** aparecidos por el camino — incluido lo que se quede sin cobertura
   de tests, que es lo que más rápido se olvida.

Cada afirmación va con un fichero o un comando que la comprueba. **Sin cifras que no se hayan
medido:** si el fichero dice «179 en verde», es porque acabas de correr `npm test`.

## Comandos

| | |
| --- | --- |
| `npm run dev` | desarrollo en http://localhost:3000 |
| `npm test` | unitarios (vitest) |
| `npm run typecheck` | `tsc --noEmit`, con `noUncheckedIndexedAccess` |
| `npm run lint` | `eslint .` |
| `npm run build && npm run e2e` | Playwright a 8 anchos, contra el **build de producción**, puerto 3100 |
| `npm run db:generate` · `db:migrate` · `db:seed` · `db:studio` | Drizzle sobre Neon |
| `npm run images:build -- --check` | valida los recortes sin escribir nada |

**No hace falta base de datos para desarrollar.** Sin `DATABASE_URL` el catálogo sale de
`content/products.ts` y todo pasa: dev, build, unitarios y e2e.

**Windows + OneDrive:** `.next` se bloquea. Si el build falla por permisos, usar
`NEXT_DIST_DIR=.next-verify`. Y parar `next start` por PID **antes** de reconstruir, o el build dice
«éxito» y deja servido el HTML viejo.

## Rompen en silencio

Diez cosas que fallan **sin dar error**. Si tocas algo cerca, verifícalas a mano.

1. **Un solo import de CSS.** `app/layout.tsx` importa exclusivamente `styles/index.css`, que encadena
   los parciales con `@import`. Next no garantiza el orden entre varios imports globales, y aquí toda
   la cascada depende de él.
2. **Orden de media queries**, dentro de cada fichero de `styles/`: base → `min-width` ascendente →
   `max-width` descendente. `991` y `767` se solapan: si 991 se escribe después, gana a 500px de
   ancho. Es el punto de mayor riesgo del proyecto.
3. **Moneda con `lib/format.ts`, nunca `Intl`.** `Intl.NumberFormat("es-CR")` devuelve un espacio duro
   fino (U+202F) y sus separadores varían entre builds de ICU → mismatch de hidratación en un precio.
4. **`--gold` nunca es texto sobre fondo claro** (2.09:1). El ámbar se divide en tres roles según el
   tamaño del texto; ver «Color» en el README. `tests/unit/contrast.test.ts` recalcula los pares
   leyendo `styles/01-tokens.css` en cada `npm test`.
5. **Un `var()` a una variable no declarada no degrada: tumba la propiedad entera.** Sin fallback, sin
   aviso. Por eso existe `tests/unit/css-vars.test.ts`.
6. **La tienda nunca se sirve vacía.** `lib/db/catalog.ts` cae al fallback de `content/products.ts`
   cuando no hay base, está vacía o la consulta falla, y sustituye fila a fila lo que no pase Zod. No
   «simplificar» ese camino: un catálogo en blanco por un fallo de infraestructura cuesta pedidos.
7. **`ShopProduct.price` es un espejo del mínimo de `variants`, no un dato suelto.** Si se cambia un
   precio de presentación y no el de entrada, la tarjeta del catálogo anuncia un importe que el
   selector de la ficha no ofrece. No se ve hasta que un cliente reclama: lo atajan dos `.refine()` de
   `content/shopSchema.ts`, y una fila incoherente cae al fallback. Lo mismo con `priceFrom`, que es
   obligatorio en cuanto hay más de una presentación.
8. **Una línea del carrito se identifica por `(slug, unit)`.** Dos tamaños del mismo queque son dos
   líneas con dos precios. Cualquier `find`/`filter` del carrito que compare sólo `slug` las funde en
   una y manda el pedido con el precio del primero que se añadió. Está en `lib/cart.ts:sameLine`.
9. **Los enlaces de chat van a `api.whatsapp.com/send`, nunca a `wa.me`.** La redirección del atajo
   recodifica la query con un codificador que no maneja pares surrogados y **convierte cada emoji del
   mensaje en `�`**. Se pierde todo carácter de 4 bytes en UTF-8 y sobrevive todo lo de 1-3, así que el
   síntoma es un mensaje casi correcto con los iconos roídos. El motivo está medido en `lib/contact.ts`.
10. **El atributo `hidden` pierde contra cualquier `display` de la hoja del proyecto.** La regla
    que lo oculta, `[hidden] { display: none }`, es del **navegador**, y una declaración de autor gana
    por origen aunque su selector sea menos específico. `styles/10-navbar.css` daba `display: flex` a
    `.nav-dropdown-list` a ≤991 y el panel de «Ocasiones» salía siempre desplegado en el drawer,
    mientras su chevron y su `aria-expanded` decían lo contrario. Si ocultas algo por atributo y su
    clase declara `display`, escribe además la regla `[hidden]`.

## Dónde mirar

| | |
| --- | --- |
| `docs/ESTADO.md` | qué está hecho y qué falta — **empieza aquí** |
| `docs/frontend_spec.md` | la especificación de layout, **normativa** |
| `docs/DEVIATIONS.md` | todo lo que se aparta del spec, con su motivo. **Si un desvío no está ahí, es un bug** |
| `docs/CONTENT_TODO.md` | lo que falta de Ale antes de poder lanzar |
| `docs/implementation_tasks.md` | backlog UI/UX y su estado de verificación |
| `docs/IMAGE_MAP.md` | qué foto va en cada slot, y por qué |
| `README.md` | cómo funciona el proyecto |

## Cuidado con los números de fase

Hay **dos numeraciones distintas y ninguna es de fiar**: las «Fase N» históricas del proyecto (que se
ejecutaron fuera de orden — la tienda, prevista como «Fase 4», se hizo antes que el panel «fase 3»), y
las `FASE 1…8` del backlog de `docs/implementation_tasks.md`, que son otra cosa. Un comentario que
diga «pendiente de la Fase 4» probablemente describa algo ya hecho.

**No te guíes por ellos.** El estado real está en `docs/ESTADO.md`, organizado por bloques; los
marcadores obsoletos conocidos están listados en su sección «Deuda de etiquetado».

## Idioma

Copy, documentación, comentarios y mensajes de commit **en español**. El contenido visible usa
español latinoamericano neutro, natural y profesional, siempre con **tuteo**. Se evitan tanto el
voseo («podés», «escribinos») como los giros propios de España y los localismos costarricenses que no
sean datos reales del negocio.

Por decisión comercial, el contenido visible usa «queque»/«queques». También se conservan los slugs
`queque-*` y la clave interna `queques`.
