# Backlog de implementación UI/UX — Boquita (Sweet & Salty)

**Naturaleza del proyecto:** e-commerce/catálogo artesanal en Next.js con cierre de pedido por WhatsApp.
**Total de tareas:** 108 · **Fases:** 8.

---

## ⚠ Procedencia de este documento — leer antes que nada

Este fichero es una **reconstrucción**. El original, derivado de una auditoría UI/UX (`audit.md`,
nivel general 6/10), llegó al repositorio **truncado a media palabra** en la línea 216, dentro de
UI-004. De las 108 tareas que declara, sólo sobrevivían cuatro: UI-001, UI-002, UI-003 y media
UI-004. El `audit.md` que cita como fuente nunca estuvo en el repositorio.

El texto original tal como llegó está preservado en el commit `7bda6de`, para poder contrastar.

Cada tarea lleva una marca de procedencia:

| Marca | Significado |
| --- | --- |
| `[original]` | Texto de la auditoría, conservado literalmente. Sólo UI-001 → UI-004. |
| `[reconstruido]` | Redactada a partir del título superviviente (matriz de dependencias §3, tabla de quick wins §4, hitos §2) más verificación directa sobre el código. |
| `[inferido]` | No sobrevivía ni el título. El ID existe porque el reparto por fases lo exige; el contenido sale de la auditoría fresca del sistema de estilos (§6). Es la categoría más débil: revisar antes de ejecutar. |

Además, **la auditoría original describe un estado del proyecto que en parte ya no es el actual**.
Se verificó tarea por tarea contra el código; el resultado está en el campo **Estado.** de cada una
y resumido en §7. Varias tareas 🔴 «críticas» ya estaban cerradas antes de empezar, y tres piden
revertir decisiones deliberadas y documentadas: están en §8, no se ejecutan sin decisión explícita.

---

## 0. Convenciones de ejecución

1. **No inventar rutas ni nombres de archivo.** Cada tarea describe *qué* buscar en el repo y *qué
   comportamiento* conseguir.
2. **Un commit por tarea**, con el ID en el mensaje (`fix(ui-005): …`). Facilita revertir sin
   arrastrar otros cambios. La convención de mensaje del repo es conventional-commit en inglés para
   el asunto; el cuerpo va en español, como el resto de la documentación.
3. **No se salta de fase.** Las fases 1–3 son la base del Design System.
4. **Prohibido introducir valores mágicos** a partir de la fase 1: todo px de espaciado, radio,
   color, sombra o duración debe salir de un token.
5. **No añadir dependencias nuevas** sin que la tarea lo pida explícitamente.
6. **Adaptación del guion genérico.** El guion de origen mencionaba *Sidebar, Dashboard, Tablas,
   KPIs, Gráficos, Login, Perfil, Gestión de usuarios*. Este producto **no tiene** nada de eso. Se
   mantiene el esqueleto de 8 fases y esos bloques se sustituyen por sus equivalentes reales:
   **Sidebar → drawer del carrito + menú móvil**, **Dashboard → Home**, **Login/Perfil/Usuarios →
   Catálogo, Ficha, Carrito, Sobre nosotros, Aviso legal, 404**, **Tablas/KPIs/Gráficos → decisión
   explícita de no introducir librería de charts**.
7. **Baseline obligatoria antes de tocar CSS.** Ya existe infraestructura:
   `tests/e2e/screenshots.spec.ts` con capturas en `tests/e2e/__screenshots__/`. UI-014 la extiende
   a las vistas que faltan.
8. **Restricción funcional:** no disparar el envío real del mensaje de WhatsApp durante las pruebas;
   validar construyendo y leyendo el `href`. Ya lo cubre `tests/unit/whatsapp.test.ts`.
9. **Verificar antes de ejecutar.** Ninguna tarea de este documento se aplica sin comprobar primero
   que su premisa sigue siendo cierta. La auditoría de origen tiene hallazgos caducados.
10. **El árbitro es el test, no el documento.** `tests/unit/contrast.test.ts` manda sobre cualquier
    afirmación de contraste; `tests/unit/css-vars.test.ts`, sobre cualquier referencia a variables.

---

## 1. Resumen ejecutivo — corregido contra el código

El resumen de la auditoría original se reproduce aquí **con las correcciones que impuso la
verificación**. Los tachados son afirmaciones que no se sostienen.

**1. ~~Inexistencia de un sistema de diseño real.~~ → Sistema de diseño real pero incompleto.**
El repo tiene 19 hojas numeradas con orden de cascada explícito y documentado
([`styles/index.css`](../styles/index.css)), [`01-tokens.css`](../styles/01-tokens.css) como única
fuente de verdad del color, [`lib/tokens.ts`](../lib/tokens.ts) que la lee en build,
[`/dev/tokens`](../app/dev/tokens/page.tsx) como página de especímenes, y un test que rompe el build
si un ratio de contraste cae. Lo que **sí** falta: tokens de espaciado, radio, sombra, z-index,
movimiento y tipografía. El color está resuelto; el resto no. Ver el inventario en §6.

**2. El flujo de compra tiene fricción evitable.** El punto sigue en pie, con matices: la home
**sí** enlaza al catálogo (cuatro veces, ver UI-054), pero las tarjetas del catálogo no permiten
añadir al carrito, la ficha no confirma la adición y el carrito no desglosa.

**3. Cabecera y navegación.** Confirmado: navbar `position:absolute`
([10-navbar.css:10](../styles/10-navbar.css#L10)), sin token de altura, buscador y CTA ocultos por
debajo de 991 px.

**4. Accesibilidad.** Parcialmente confirmado. El contraste **ya está resuelto y verificado**
(UI-003). Siguen en pie: `outline:0` en el buscador, `aria-disabled` en lugar de `disabled`, y el
orden de encabezados.

**5. Ausencia de capa de feedback.** Confirmado y es el hallazgo de más valor del documento: no hay
sistema de notificaciones, ni estados de carga, ni skeletons. La interfaz no acusa recibo.

**6. Detalles de acabado.** Confirmado en parte: favicon y apple-touch-icon **sí** faltan.
~~El logo se deforma un 4% con `object-fit:fill`~~ — no reproducido: `object-fit:fill` no aparece en
ninguna hoja y `.logo` usa `width:auto`. `--ff-quote` **estaba** roto y ya se corrigió, junto con
otras dos variables que la auditoría no detectó (ver UI-005).

**7. Hallazgo nuevo, no presente en la auditoría original.** Tres referencias `var()` apuntaban a
variables inexistentes, tumbando en silencio la propiedad entera. Corregido en UI-005 y blindado con
`tests/unit/css-vars.test.ts`.

### Reparto

| Fase | Bloque | Tareas |
| --- | --- | --- |
| 1 | Fundamentos / Design System | 14 (UI-001 → UI-014) |
| 2 | Layout global | 13 (UI-015 → UI-027) |
| 3 | Componentes compartidos | 21 (UI-028 → UI-048) |
| 4 | Pantallas | 33 (UI-049 → UI-081) |
| 5 | UX (estados, feedback, flujos) | 7 (UI-082 → UI-088) |
| 6 | Microinteracciones | 6 (UI-089 → UI-094) |
| 7 | Accesibilidad | 8 (UI-095 → UI-102) |
| 8 | Revisión final | 6 (UI-103 → UI-108) |

| Prioridad | Tareas |
| --- | --- |
| 🔴 Crítica | 18 |
| 🟠 Alta | 34 |
| 🟡 Media | 38 |
| 🟢 Baja | 18 |

---

## 2. Roadmap

**Hito 1 — Fundamentos (fase 1).** Bloqueante. Al terminar existe una única fuente de verdad para
color *(ya existe)*, tipografía, espaciado, radio, sombra, movimiento, iconos y breakpoints, y una
página donde verlos *(ya existe: `/dev/tokens`)*. Criterio de salida: la baseline visual no cambia
de forma no intencionada y el 100% de las nuevas declaraciones usa tokens.

**Hito 2 — Layout global (fase 2).** Depende de la fase 1. Resuelve los tres problemas 🔴
estructurales (sticky, solape de cabecera, cabecera móvil) que afectan a todas las páginas. Debe
cerrarse antes de la fase 4.

**Hito 3 — Componentes compartidos (fase 3).** Crea Button, Field, Card, Dialog, Drawer, Toast,
EmptyState, Skeleton, Chip, Badge, QtyStepper y Disclosure. Regla: **ninguna pantalla se rediseña
antes de que exista el componente que necesita.** Criterio de salida: cada componente tiene todos
sus estados definidos y está usado al menos una vez.

**Hito 4 — Pantallas (fase 4).** El bloque más grande. Orden interno: Home → Catálogo → Ficha →
Carrito → páginas de contenido → 404, que es el orden del embudo. Carrito después de Ficha porque
comparten QtyStepper y patrón de feedback.

**Hito 5 — UX (fase 5).** Depende de 3 y 4. Cierra el ciclo de feedback.

**Hito 6 — Microinteracciones (fase 6).** Al final a propósito: animar componentes que aún van a
cambiar de estructura es retrabajo puro.

**Hito 7 — Accesibilidad (fase 7).** Verificación transversal, no construcción: las fases 1–6 ya
incorporan requisitos de contraste, foco y semántica.

**Hito 8 — Revisión final (fase 8).** Borrado del CSS muerto ya aislado, barrido de consistencia,
metadatos, rendimiento, QA de regresión y documentación. El borrado va aquí y no en la fase 1 a
propósito.

**Paralelización posible:** fase 1 → UI-010 y UI-012 son independientes del resto. Fase 3 → los
componentes de formulario (UI-032/033), los de superficie (UI-036/037/038) y los de feedback
(UI-040/041/042/043) son tres carriles. Fase 4 → Home, Catálogo+Ficha y páginas de contenido.

---

## 3. Matriz de dependencias

| Bloque | Bloqueado por | Bloquea a |
| --- | --- | --- |
| UI-001 Inventario CSS | — | Toda la fase 1 |
| UI-002 Tokens de color | UI-001 | UI-003, y todo componente/pantalla |
| UI-003 Contraste de tokens | UI-002 | UI-095, UI-096 |
| UI-004/005 Tipografía | UI-001 | UI-027, UI-047, UI-049, UI-051 |
| UI-006 Espaciado | UI-001 | UI-011, UI-016, fases 2–4 completas |
| UI-007 Radio · UI-008 Sombra/z-index | UI-001 | UI-028, UI-036, UI-037, UI-038, UI-039 |
| UI-009 Movimiento | UI-001 | Fase 6 completa, UI-102 parcial |
| UI-010 Iconografía | — | UI-030, UI-024, UI-057, UI-096 |
| UI-011 Breakpoints/grid | UI-006 | UI-017→UI-020, UI-061, UI-102 |
| UI-013 Aislar CSS muerto | UI-001 | UI-103 |
| Fase 2 (layout) | Fase 1 | Fase 4 completa |
| UI-016 `--header-h` | UI-006, UI-015 | Todas las pantallas de fase 4 |
| UI-026 Imágenes responsivas | UI-011 | UI-050, UI-064, UI-068, UI-106 |
| UI-028 Button API | UI-002, UI-006, UI-007 | UI-029, UI-030, UI-034, y todo CTA |
| UI-032 Field | UI-002, UI-006, UI-007 | UI-074, UI-085, UI-087 |
| UI-036 Card | UI-002, UI-006, UI-007, UI-008 | UI-053, UI-062, UI-071, UI-081 |
| UI-037 Dialog · UI-038 Drawer | UI-008, UI-009 | UI-057, UI-073→UI-076, UI-097 |
| UI-040 Toast | UI-002, UI-008 | UI-063, UI-070, UI-086 |
| UI-042 EmptyState · UI-043 Skeleton | UI-036 | UI-082, UI-083 |
| UI-031 QtyStepper | UI-028, UI-030 | UI-070, UI-073, UI-075 |
| Fase 4 (pantallas) | Fases 1–3 | Fase 5 |
| Fase 5 (UX) | Fases 3–4 | Fase 7 |
| Fase 6 (microinteracciones) | UI-009 + fase 4 estable | UI-102 |
| Fase 7 (a11y) | Fases 1–6 | Fase 8 |
| UI-103 Borrado CSS muerto | UI-013 + fases 2–6 | UI-104 |
| UI-107 QA final | Todo | — |

**Rutas críticas:** `UI-001 → UI-002 → UI-028 → UI-062/063 → UI-086 → UI-104` (botones y feedback) y
`UI-001 → UI-006 → UI-016 → toda la fase 4` (altura de cabecera y espaciados).

---

## 4. Quick Wins — con estado verificado

| Orden | ID | Tarea | Prio | Resultado |
| --- | --- | --- | --- | --- |
| 1 | UI-012 | Favicon, apple-touch-icon, manifest, theme-color | 🔴 | ✅ **Hecho** `0b51f6b` |
| 2 | UI-015 | Cabecera visible al hacer scroll | 🔴 | ✅ **Hecho** `897a649` — `fixed`, no `sticky` |
| 3 | UI-016 | `--header-h` y fin del recorte de contenido | 🔴 | ✅ **Hecho** `0f091dc`, `fcf61f6` |
| 4 | UI-005 | Variables referenciadas y no declaradas | 🟡 | ✅ **Hecho** `6029921` — eran tres, no una |
| 5 | UI-025 | Logo sin deformación del 4% | 🟠 | ❌ **No reproducido** — todos los assets son exactamente cuadrados y `.logo` usa `width:auto`. Deformación 0% |
| 6 | UI-096 | Anillo de foco del buscador | 🔴 | ✅ **Hecho** `ac01373` |
| 7 | UI-054 | CTA "Ver todo el catálogo" en la home | 🔴 | ❌ **Ya existía** — 4 enlaces a `/tienda` |
| 8 | UI-027 | Orden de encabezados | 🟠 | ❌ **No reproducido** — el drawer cerrado es `inert` + `visibility:hidden`. Blindado en `c86c530` |
| 9 | UI-003 | Contraste de los cuatro pares infractores | 🔴 | ❌ **Ya cerrado** — el hallazgo confunde el umbral AA-large |
| 10 | UI-024 | Alineación de los datos de contacto del pie | 🟢 | ❌ **No reproducido** — las 4 columnas comparten `text-align` y `left` |
| 11 | UI-067 | Títulos y metadatos por vista de catálogo | 🟡 | ✅ **Hecho** `6d55e9f` |
| 12 | UI-092 | Reveal on scroll: 100 px → 16–24 px | 🟡 | ⛔ **No se ejecuta** — gana el §4.1 del spec. Conflicto C-2 |
| 13 | UI-060 | Contraste del texto scroll-color | 🟡 | ✅ **Hecho** `d7a5568` — estaba en 1.32:1 |
| 14 | UI-031 | `aria-disabled` → `disabled` real | 🟠 | ❌ **No es un defecto** — los 5 usos son correctos. Blindado en `e78d272` |

**Balance: 7 ejecutados, 6 no reproducidos o ya cerrados, 1 rechazado por conflicto.**
Casi la mitad de los quick wins de la auditoría no describían el estado real del
repositorio. Los seis descartados se cierran con la medición que lo demuestra, no por
opinión — y cuatro de ellos dejan un test detrás para que la conclusión no caduque.

Los dos hallazgos de más valor de este bloque **no estaban en la auditoría**: las tres
variables `var()` rotas (UI-005) y `.section--no-bottom` sin efecto en dos de los tres
breakpoints. Los encontró el inventario de UI-001, no la lista de tareas.

---

## 5. Riesgos generales

1. **Regresión visual al tocar variables globales.** ~441 reglas dependen de los tokens.
   *Mitigación:* baseline (UI-014), un token por commit, comparación visual tras cada tarea de fase 1.
2. **Paddings derivados de `em` acoplados al `font-size`.** Al cambiar la escala tipográfica (UI-004)
   los espaciados de sección se mueven solos. *Mitigación:* ejecutar UI-006 inmediatamente después
   de UI-004 y en el mismo hito.
3. **Doble sistema de espaciado durante la transición.** *Mitigación:* UI-104 hace el barrido; hasta
   entonces, prohibido crear nuevos valores mágicos.
4. **CSS muerto que en realidad no lo está.** `.slider`, `.review-card` y `blockquote` **tienen**
   componente vivo ([`TestimonialsSlider.tsx`](../components/sections/TestimonialsSlider.tsx)); la
   sección está oculta esperando testimonios reales, no borrada. *Mitigación:* UI-013 sólo aísla y
   marca; el borrado real (UI-103) exige verificación de uso en todo el repo.
5. **El carrito vive en `localStorage` (`boquita.cart.v1`).** Cualquier cambio de forma del estado
   invalida carritos de usuarios reales. *Mitigación:* si UI-073/UI-076 cambian el esquema, versionar
   la clave y migrar en lectura; nunca borrar el estado antiguo sin migración.
6. **El cierre por WhatsApp es un handoff fuera de la app.** *Mitigación:* validar por inspección del
   `href`, no enviando; cubrir carrito con muchas líneas y textos con caracteres especiales.
7. **Entorno de desarrollo confundido con diseño.** El badge del overlay de Next aparece abajo a la
   izquierda y **no** es interfaz. *Mitigación:* verificar en build de producción.
8. **Viewport no fiable en la herramienta de auditoría.** Los `resize` no siempre se aplican.
   *Mitigación:* UI-102 exige verificación manual real en 320/390/768/1024/1280/1440/1920.
9. **Alcance creciente en la fase 4.** Galería de producto, relacionados y reseñas pueden convertirse
   en un proyecto de producto. *Mitigación:* lo que exceda se documenta como propuesta.
10. **Accesibilidad tratada como fase final.** *Mitigación:* los criterios de las fases 2–6 ya
    incluyen foco, contraste y semántica; la fase 7 es verificación.
11. **Contenido legal y de alérgenos.** Reorganizar `/aviso-legal` o los alérgenos puede alterar
    información con implicaciones legales/sanitarias. *Mitigación:* prohibido reescribir o resumir
    ese copy; sólo estructura, jerarquía y legibilidad.
12. **La auditoría de origen está caducada en parte.** Aplicar sus tareas a ciegas revierte trabajo
    bueno. *Mitigación:* convención 9 y el campo **Estado.** de cada tarea.
13. **El bloqueo de `.next` por Windows/OneDrive.** Los e2e se ejecutan con
    `NEXT_DIST_DIR=.next-verify`. No es opcional en esta máquina.

---

## 6. Inventario del sistema de estilos (salida de UI-001)

Medido el 7 de agosto de 2026 sobre 19 hojas y 64 ficheros TSX/TS.
Reproducible con el script del scratchpad; las cifras de abajo son las que produjo.

**Volumen:** 19 ficheros CSS · ~438 reglas · 25 custom properties declaradas.

**Ficheros con más peso:** `30-cart.css` (73 reglas), `10-navbar.css` (58), `03-base.css` (34),
`18-footer.css` (30), `14-overlap-menu.css` (28).

### Variables

- **Declaradas:** 25. De ellas, 21 en `01-tokens.css` (los tokens de verdad) y 4 locales de
  componente (`--per-view`, `--reveal`, `--slide-gap`, `--slide-w`).
- **Huérfanas** (declaradas y sin ningún consumidor): `--light-gray`, `--dark-gray-50`,
  `--per-view`. `--dark-gray` sólo se usa desde TSX. Toleradas explícitamente en
  `tests/unit/css-vars.test.ts`; candidatas a borrado en UI-103.
- **Referenciadas y no declaradas:** eran 7. Tres eran bugs y se corrigieron en UI-005
  (`--font-quote`, `--gold-fill`, `--ff-serif`). Las cuatro restantes son legítimas:
  `--font-display` y `--font-sans` las inyecta `next/font` en runtime; `--reveal-delay` y `--i` las
  fija el TSX inline.

### Valores repetidos candidatos a token

| Familia | Distintos repetidos | Los más usados |
| --- | ---: | --- |
| Espaciado (padding/margin/gap) | 20+ | `20px`×29, `10px`×22, `30px`×18, `40px`×13, `15px`×12, `12px`×10, `25px`×9 |
| `font-size` | 19 | `18px`×18, `16px`×13, `20px`×11, `14px`×6, `15px`×4 |
| `line-height` | 7 | `1.5em`×9, `1em`×6, `1.2em`×3 |
| `border-radius` | 6 | `50px`×5, `5px`×4, `4px`×4, `0`×3, `50%`×2, `8px`×2 |
| `z-index` | 1 repetido | `110`×2 (más 100, 105 sueltos) |
| `transition` | 3 | `color 0.2s ease`×2, `background-color 0.2s, color 0.2s`×2 |

**Colores literales fuera de `01-tokens.css`: 28.** Casi todos `rgba()` de sombra, scrim y velo
—`rgba(58,42,26,·)` en 5 opacidades distintas, `rgba(232,168,27,·)` en 3, `rgba(176,114,8,·)` en 3—.
Son la materia prima de UI-002 (capa de superficie/overlay) y UI-008 (sombras).

### Escala tipográfica real

No hay «cinco H1 en competencia»: hay **un** `.h1-hero` escalando en cinco breakpoints
(46 → 52 → 70 → 72 → 86 px) y un `h1` en tres (46 → 52 → 70). Igual `h2` (34 → 42 → 50) y `h3`
(30 → 32 → 34 → 36). El problema real no es la incoherencia sino que **la rampa es escalonada en vez
de fluida**, con saltos visibles en los límites — el más notorio, la navegación de 18 → 19 px en
1280 ([10-navbar.css:273](../styles/10-navbar.css#L273)). Eso es lo que UI-004 debe resolver.

### Breakpoints en uso

`max-width:767`×14 · `max-width:991`×12 · `min-width:1280`×9 · `max-width:479`×9 ·
`min-width:1440`×5 · `min-width:1920`×4 · `min-width:992`×2. Siete valores, coherentes entre sí y
con un orden de cascada documentado en la cabecera de cada hoja. UI-011 los tokeniza, no los cambia.

### Clases sin coincidencia en el marcado — PENDIENTE DE VERIFICACIÓN

`.btn--nav` · `.gallery-row--1` · `.gallery-row--2` · `.scroll-color-text__line--body` ·
`.scroll-color-text__line--title` · `.text-center` · `.track--1` · `.track--2`

**No borrar ninguna todavía.** Varias se componen dinámicamente en TSX (`` `gallery-row--${n}` ``),
que es justo el patrón que una búsqueda literal no ve. UI-013 las clasifica; UI-103 borra sólo las
que sobrevivan a esa verificación.

### Orden de carga y especificidad

[`styles/index.css`](../styles/index.css) es el único import de `app/layout.tsx` y encadena las 19
hojas con `@import`, deliberadamente: el orden entre varios imports globales de Next no está
garantizado, y este proyecto depende por completo de la cascada. No se usa `@layer` ni nesting, por
decisión documentada. **Riesgo de cascada frágil:** las `max-width` solapadas (991/767/479) obligan a
un orden descendente estricto dentro de cada hoja; está documentado en la cabecera de cada una y hay
que respetarlo en toda edición.

---

## 7. Estado de verificación — resumen

Los 14 quick wins están cerrados (§4). De las 108 tareas:

| Resultado | Tareas |
| --- | --- |
| ✅ Ejecutadas | UI-005, UI-012, UI-015, UI-016, UI-060, UI-067, más UI-001 y UI-014 |
| ❌ No reproducidas o ya cerradas | UI-003, UI-024, UI-025, UI-027, UI-031, UI-054 |
| ⛔ Rechazadas por conflicto | UI-092 |
| Sin verificar | Las 93 restantes |

**Tasa de acierto de la auditoría en el único bloque verificado a fondo: 7 de 14.**
Es el dato que debe gobernar la ejecución del resto: la convención 9 —verificar antes
de ejecutar— no es una formalidad, y ninguna tarea de este documento debe aplicarse sin
comprobar antes que su premisa sigue siendo cierta.

Las 93 tareas restantes **no se han verificado**. Verificarlas es el primer paso de su
ejecución, no un trámite previo opcional.

### Deuda conocida al cerrar este bloque

**El test `seo-perf.spec.ts:184` («el elemento LCP es la foto del hero») falla en los
ocho anchos, y es el único rojo de la suite** (899 en verde + 53 skipped de 960). Es anterior a este bloque: lo introdujo el rediseño de la portada
(`8719a97`), no los quick wins. El hero deja de ser candidato a LCP; los tres candidatos
que Chrome reporta son el logo (7.138 px²), un párrafo y el H1 (125.060 px²).
Descartadas por medición tres hipótesis: la exclusión por baja entropía (todos los
derivados están muy por encima de 0.05 bpp), el `z-index: -2` y el `filter: blur(2px)`.
La causa sigue sin identificar. Pertenece a UI-050.

## 8. Conflictos con decisiones documentadas

Tres tareas piden revertir algo que se decidió a propósito y está razonado en el código o en
`docs/DEVIATIONS.md`. **No se ejecutan sin decisión explícita.**

### C-1 · UI-031: `aria-disabled` → `disabled` real

**La tarea pide** sustituir `aria-disabled` por `disabled` en el QtyStepper.
**La decisión existente** está escrita en
[`TestimonialsSlider.tsx:130`](../components/sections/TestimonialsSlider.tsx#L130): un botón con
`disabled` real **pierde el foco** cuando se deshabilita, y el usuario de teclado que está pulsando
«anterior» repetidamente se queda sin punto de anclaje al llegar al extremo. `aria-disabled` lo
anuncia sin sacarlo del orden de tabulación.
**Quién tiene razón:** ambos, en contextos distintos. En el slider la decisión es correcta. En el
QtyStepper del carrito y de la ficha ([`AddToCartButton.tsx:53,67`](../components/cart/AddToCartButton.tsx#L53),
[`CartDrawer.tsx:135`](../components/cart/CartDrawer.tsx#L135)) el argumento es más débil: el
±1 no es una acción repetida en ráfaga hasta un extremo del mismo modo.
**Para revocarla haría falta:** decidir por componente, no en bloque, y en los que pasen a `disabled`
real, garantizar que el foco se traslada a un elemento vivo. Además, `aria-disabled` sin `disabled`
exige que el handler **ignore** el click; verificar que lo hace en los tres sitios.

### C-2 · UI-092: reveal de 100 px → 16–24 px

**La tarea pide** reducir el desplazamiento del reveal on scroll.
**La decisión existente:** los 100 px vienen del **§4.1 de `docs/frontend_spec.md`, que es
normativo**, y están implementados en [`05-components.css:172`](../styles/05-components.css#L172)
con un comentario que explica por qué sube con `opacity:1` (no aplazar el LCP).
**Quién tiene razón:** la crítica es razonable —100 px es mucho desplazamiento y a viewport corto
puede leerse como salto—, pero el spec manda sobre la auditoría.
**Para revocarla haría falta:** modificar el spec, o registrar el cambio como desvío nuevo en
`docs/DEVIATIONS.md` con su justificación. No es una decisión de implementación.

### C-3 · UI-013 / UI-103: borrado del CSS de testimonios

**La tarea pide** aislar y luego borrar `.slider`, `.slider-arrow`, `.slider-line`, `.review-card`.
**La realidad:** no están muertas. [`TestimonialsSlider.tsx`](../components/sections/TestimonialsSlider.tsx)
existe y las usa. `docs/ESTADO.md` documenta que la sección **se ocultó del render público** a la
espera de los 6 testimonios reales de Ale, que es un bloqueante de lanzamiento conocido.
**Para revocarla haría falta:** decidir que la sección de testimonios no vuelve. Es una decisión de
producto, no de UI. Mientras siga en `CONTENT_TODO.md §3`, ese CSS se queda.

---

# 9. Backlog

> Formato: **ID · Título** `[procedencia]` · Prioridad · Complejidad
> **Estado.** sólo aparece cuando la tarea se ha verificado contra el código.

---

## FASE 1 — Fundamentos (Design System)

### UI-001 · Inventario y mapa del sistema de estilos `[original]` 🟠 M
**Contexto.** El proyecto tiene ~441 reglas CSS, variables en `:root`, utilidades (`mt-20`,
`h6-sans`, `prose`, `container--start`), clases de componente y reglas muertas. Nadie sabe hoy qué
archivo define qué.
**Objetivo.** Producir un mapa navegable del sistema de estilos actual que sirva de base a todas las
tareas siguientes.
**Implementación.** Recorre todas las hojas de estilo y estilos locales del repo. Inventaria:
variables CSS declaradas y cuáles se usan realmente; variables referenciadas pero no declaradas;
clases de utilidad y cuántas veces se usan; clases de componente; reglas sin ninguna coincidencia en
el marcado. Registra los valores repetidos que deberán convertirse en tokens. Documenta el orden de
carga y la especificidad. Sin cambios de comportamiento.
**Estado.** ✅ **Hecho.** Salida completa en §6. Recuento real: 19 hojas, ~438 reglas, 25 variables.
Descubrió tres variables rotas que la auditoría no vio → UI-005.
**Aceptación.**
- [x] Inventario de variables (declaradas/usadas/huérfanas/referenciadas-inexistentes).
- [x] Lista de valores repetidos candidatos a token, con recuento.
- [x] Lista de reglas sin uso detectado, marcada como *pendiente de verificación*.
- [x] Cero cambios visuales.

### UI-002 · Tokens de color primitivos y semánticos `[original]` 🔴 L
**Contexto.** La paleta se usa de forma directa (`#e8a81b`, `#b07208`, `#b5a99b`, `#e7e0d6`,
`#3a2a1a`, `#f2c014`, `#8a5a06`) sin una capa que diga *para qué sirve* cada color.
**Objetivo.** Dos niveles de token —primitivos y semánticos— y migrar los usos.
**Estado.** ✅ **Mayormente cerrado antes de empezar.** [`01-tokens.css`](../styles/01-tokens.css) ya
define roles semánticos (`--gold` relleno / `--gold-display` texto ≥24px / `--gold-ink` texto <24px /
`--gold-line` trazo / `--on-gold` sobre relleno / `--surface-dark`), con los pares permitidos
documentados y verificados por test. **Lo que falta de verdad:** (a) tokens de estado
—éxito/aviso/error/info, hoy inexistentes—; (b) una capa de superficie/overlay que absorba los
**28 colores literales** que el inventario encontró fuera del fichero de tokens.
**Implementación restante.** Definir los 4 tokens de estado aunque no se usen todavía. Agrupar los
`rgba()` de scrim, sombra y velo en tokens de overlay: `rgba(58,42,26,·)` aparece en 5 opacidades,
`rgba(232,168,27,·)` en 3, `rgba(176,114,8,·)` en 3. No introducir dark mode (0 reglas hoy).
**Dependencias.** Bloqueada por UI-001 · Bloquea UI-003 y las fases 2–4.
**Aceptación.**
- [x] Capas primitiva y semántica; ningún componente referencia un primitivo directamente.
- [ ] Existen tokens de estado (éxito/aviso/error/info) aunque no se usen.
- [x] Documentados los pares fondo/texto permitidos.
- [ ] Los 28 literales del inventario reducidos a tokens de overlay.

### UI-003 · Corregir el contraste de los tokens de texto y borde `[original]` 🔴 S
**Contexto.** Medidos en la auditoría: `#b07208` sobre crema 3.68:1; `#e8a81b` sobre blanco 2.09:1;
`#b5a99b` sobre blanco 2.30:1; borde `--gray:#e7e0d6` 1.31:1.
**Objetivo.** Ningún token de texto por debajo de 4.5:1 (3:1 si ≥24 px o ≥19 px bold); ningún borde
funcional por debajo de 3:1.
**Estado.** ✅ **Cerrado antes de empezar, y el hallazgo está mal planteado.** El `#b07208` a 3.68:1
sobre crema **no es una infracción**: `--gold-display` se usa exclusivamente en texto ≥24 px, donde
el umbral aplicable es 3:1 (AA-large). Está documentado en la cabecera de `01-tokens.css` y
verificado por las 31 aserciones de [`contrast.test.ts`](../tests/unit/contrast.test.ts), que rompe
el build si alguien lo «mejora». `#e8a81b` ya está prohibido como texto sobre claro por la misma
doctrina. **No ejecutar.** Si se quisiera subir `--gold-display` a AA-normal habría que rehacer la
identidad cromática, y eso es una decisión de marca.
**Aceptación.**
- [x] Ningún par texto/fondo en uso por debajo del umbral AA **aplicable**.
- [x] Bordes de inputs, separadores y contornos de card ≥3:1.
- [x] `#e8a81b` no se usa como color de texto sobre fondos claros.
- [x] Tabla de ratios documentada y ejecutable como test.

### UI-004 · Escala tipográfica fluida `[original, truncado]` 🟠 L
**Contexto.** Rampa escalonada: `.h1-hero` 46/52/70/72/86 px, `h1` 46/52/70, `h2` 34/42/50, `h3`
30/32/34/36. La navegación salta de 18 a 19 px en 1280.
**Objetivo.** Una escala única con tokens de tamaño, interlineado y tracking, fluida entre
breakpoints.
**Implementación.** Define pasos (display, h1…h6, body-lg, body, body-sm, caption, overline) con
progresión coherente e interlineado ligado a cada paso. Usa interpolación fluida (`clamp()`) para
eliminar los saltos. Mapea cada tamaño actual al paso más cercano y **documenta el mapeo antes de
aplicarlo**, señalando qué títulos cambian y en qué páginas. Incluye tokens de tracking para las
mayúsculas (los *eyebrow* y botones van en caja alta). Elimina de la escala el estilo de
`blockquote` huérfano *(el original se corta aquí; el resto es reconstrucción)*: `blockquote` no se
renderiza hoy en ninguna página, pero su regla se conserva hasta UI-103 — sacarlo de la **escala** no
es borrarlo del **CSS**.
**Riesgo.** Los paddings de sección en `em` están acoplados al `font-size`: cambiar la escala los
mueve solos. Ejecutar UI-006 inmediatamente después, en el mismo hito.
**Aceptación.**
- [ ] Una sola escala tokenizada; ningún `font-size` literal fuera de ella.
- [ ] Sin saltos de tamaño en los límites de breakpoint.
- [ ] Mapeo viejo→nuevo documentado y revisado antes de aplicar.
- [ ] `clamp()` con límites inferior y superior explícitos.

### UI-005 · Variables referenciadas y no declaradas `[reconstruido]` 🟡 XS
**Título original:** «Arreglar `--ff-quote` vacío». Ampliado: el inventario encontró **tres**
referencias rotas, no una.
**Estado.** ✅ **Hecho** en `6029921`.
**Qué era.** Una referencia `var()` sin fallback a una variable no declarada es *inválida en tiempo
de cómputo*: no degrada, tumba la propiedad entera al valor heredado o inicial, sin error de build ni
aviso en consola. `--ff-quote` hacía que `blockquote` heredara la sans; `--gold-fill` dejaba el botón
de búsqueda **sin fondo**; `--ff-serif` sacaba el titular del statement y la marca del pie en sans.
**Blindaje.** [`tests/unit/css-vars.test.ts`](../tests/unit/css-vars.test.ts), verificado en rojo
antes de darlo por bueno.
**Aceptación.**
- [x] Toda `var()` sin fallback apunta a una variable existente.
- [x] Test guardián que falla si se reintroduce.
- [x] El comentario de `app/fonts.ts` corregido (afirmaba lo contrario).

### UI-006 · Tokens de espaciado `[reconstruido]` 🔴 L
**Contexto.** El inventario encontró más de 20 valores de espaciado repetidos: `20px`×29, `10px`×22,
`30px`×18, `40px`×13, `15px`×12, `12px`×10, `25px`×9, `8px`×7, `4px`×6. No hay escala.
**Objetivo.** Una escala de espaciado tokenizada y una regla de uso por contexto (interno de
componente, entre componentes, entre secciones).
**Implementación.** Define la escala a partir de los valores realmente usados, no de una progresión
teórica: agrupa los 20+ valores en 8–10 pasos y documenta a qué paso migra cada uno. Convierte los
paddings de sección derivados de `em` a tokens absolutos — son los que producen los decimales
(103.536 px, 92.032 px) y los que se mueven solos al tocar la tipografía.
**Dependencias.** Bloqueada por UI-001 · Bloquea UI-011, UI-016 y las fases 2–4.
**Aceptación.**
- [ ] Escala de 8–10 pasos, con mapeo documentado desde los valores actuales.
- [ ] Cero paddings de sección en `em`.
- [ ] Ningún valor de espaciado nuevo fuera de la escala.

### UI-007 · Tokens de radio `[reconstruido]` 🟡 XS
**Contexto.** Seis radios distintos repetidos: `50px`×5, `5px`×4, `4px`×4, `0`×3, `50%`×2, `8px`×2.
El `4px`/`5px` conviviendo es ruido puro.
**Objetivo.** Tres o cuatro tokens (`none`, `sm`, `md`, `pill`/`full`) y migración de todos los usos.
**Aceptación.**
- [ ] Los seis valores reducidos a ≤4 tokens, con el mapeo documentado.
- [ ] `4px` y `5px` unificados salvo justificación escrita.

### UI-008 · Tokens de sombra y z-index `[reconstruido]` 🟠 S
**Contexto.** Las sombras son `rgba()` literales dispersos; el z-index usa 100 (navbar), 105 (scrim),
110 (drawer y dropdown) sin escala declarada.
**Objetivo.** Una rampa de elevación (`shadow-sm/md/lg`) y una escala de z-index con nombre por capa
(base, dropdown, sticky, scrim, drawer, dialog, toast).
**Implementación.** El z-index importa más de lo que parece: el navbar sticky (UI-015), el scrim del
menú móvil, el drawer del carrito y los toasts futuros (UI-040) van a competir. Fijar la escala
**antes** de UI-015 evita resolverlo a base de números mágicos crecientes.
**Dependencias.** Bloquea UI-028, UI-036, UI-037, UI-038, UI-039.
**Aceptación.**
- [ ] Escala de elevación tokenizada y aplicada.
- [ ] Escala de z-index con nombre por capa; ningún z-index literal fuera de ella.

### UI-009 · Tokens de movimiento `[reconstruido]` 🟡 S
**Contexto.** Duraciones y curvas dispersas (`0.2s`, `0.3s`, `0.6s`) sin tokens. Ya existe respeto a
`prefers-reduced-motion` (`transition: none !important` ×4) que hay que conservar.
**Objetivo.** Tokens de duración (instant/fast/normal/slow) y de curva (standard/enter/exit).
**Dependencias.** Bloquea la fase 6 completa y UI-102 parcial.
**Aceptación.**
- [ ] Duraciones y curvas tokenizadas.
- [ ] `prefers-reduced-motion` sigue neutralizando todo el movimiento.

### UI-010 · Sistema de iconografía `[reconstruido]` 🟠 M
**Contexto.** Hoy hay dos SVG sueltos en `public/icons/` y componentes de icono ad-hoc
(`SocialIcon.tsx`). Tamaños y grosores no están unificados.
**Objetivo.** Un criterio único de tamaño, grosor de trazo, color (siempre `currentColor`) y
alineación óptica, sin añadir dependencias.
**Dependencias.** Independiente del resto de la fase 1 (paralelizable) · Bloquea UI-030, UI-024,
UI-057, UI-096.
**Aceptación.**
- [ ] Tamaños de icono tokenizados y ligados a la escala tipográfica.
- [ ] Todos los iconos heredan color por `currentColor`.
- [ ] Cero dependencias nuevas.

### UI-011 · Breakpoints y rejilla `[reconstruido]` 🟠 M
**Contexto.** Siete breakpoints en uso, coherentes: 479/767/991/992/1280/1440/1920. El orden de
cascada (min ascendente, luego max descendente) está documentado en cada hoja y **no se puede
alterar**: las `max-width` se solapan.
**Objetivo.** Tokenizar los breakpoints y los anchos de contenedor sin cambiar sus valores.
**Dependencias.** Bloqueada por UI-006 · Bloquea UI-017→UI-020, UI-061, UI-102.
**Aceptación.**
- [ ] Breakpoints y contenedores tokenizados, mismos valores.
- [ ] El orden de cascada documentado sigue intacto tras la migración.

### UI-012 · Assets de marca: favicon, apple-touch-icon, manifest `[reconstruido]` 🔴 XS
**Resultado.** ✅ Hecho en `0b51f6b`. Generados extendiendo `scripts/build-images.mjs`; e2e en `seo-perf.spec.ts`.
**Estado.** **Parcial.** `themeColor: "#3a2a1a"` ya existe en
[`app/layout.tsx:60`](../app/layout.tsx#L60). Falta todo lo demás: no hay `icon.*`, `apple-icon.*`
ni `manifest` en `app/`, ni `favicon.ico` en `public/`.
**Implementación.** Usar la convención de fichero de Next en `app/` (`icon.svg`, `apple-icon.png`,
`manifest.ts`), generando los rasters desde `public/img/brand/` con `sharp`, que ya es dependencia.
No añadir librerías.
**Dependencias.** Independiente. Paralelizable con toda la fase 1.
**Aceptación.**
- [ ] Favicon y apple-touch-icon responden 200 en build de producción.
- [ ] `manifest` con nombre, iconos y `theme-color` coherentes con la marca.
- [ ] Cero dependencias nuevas.

### UI-013 · Aislar (no borrar) el CSS sin uso detectado `[reconstruido]` 🟡 S
**Contexto.** El inventario dejó 8 clases sin coincidencia literal en el marcado. Varias se componen
dinámicamente en TSX (`` `gallery-row--${n}` ``), que una búsqueda literal no ve.
**Objetivo.** Clasificar cada una en *muerta confirmada* / *viva por composición dinámica* / *viva
pero oculta por producto*, y marcarla en el CSS. **Sin borrar nada.**
**Riesgo.** `.slider`, `.review-card` y `blockquote` **tienen componente vivo**: ver conflicto C-3.
**Dependencias.** Bloqueada por UI-001 · Bloquea UI-103.
**Aceptación.**
- [ ] Las 8 clases clasificadas con su prueba.
- [ ] Cero reglas borradas en esta tarea.

### UI-014 · Baseline visual de las 9 vistas `[inferido]` 🔴 M
**Resultado.** ✅ Hecho en `93aa24c`. ⚠ Medido al usarla: dos capturas consecutivas de la portada sin cambio de código difieren ~5.6% de subpíxeles por las animaciones dirigidas por scroll. Un diff de la portada por debajo de ~6% no prueba nada; las páginas internas sí son estables.
**Contexto.** La convención 7 exige baseline antes de tocar CSS. Ya existe infraestructura:
`tests/e2e/screenshots.spec.ts` y 10 capturas en `tests/e2e/__screenshots__/` (portada a 8 anchos,
pie, detalle de menú).
**Objetivo.** Extender la baseline a las vistas que faltan: Catálogo, Catálogo filtrado, Catálogo con
búsqueda vacía, Ficha, Carrito abierto, Sobre nosotros, Aviso legal y 404, a 390/768/1280/1440.
**Implementación.** Reutilizar el patrón de `screenshots.spec.ts`. Ejecutar con
`NEXT_DIST_DIR=.next-verify` y en build de producción (riesgo 7: el overlay de Next contamina las
capturas de dev).
**Aceptación.**
- [ ] Las 9 vistas capturadas a 4 anchos, en build de producción.
- [ ] La suite falla si una vista cambia sin actualizar la baseline.

---

## FASE 2 — Layout global

### UI-015 · Navbar sticky con estado scrolled `[reconstruido]` 🔴 S
**Resultado.** ✅ Hecho en `897a649`, con `position: fixed` y no `sticky` — `sticky` ocupa sitio en el flujo y descuadraría el hero. Tests en `geometry.spec.ts`.
**Estado.** **Confirmado.** [`10-navbar.css:10`](../styles/10-navbar.css#L10) es `position:absolute`:
la cabecera desaparece al hacer scroll, y la home mide varios miles de píxeles.
**Objetivo.** Cabecera `sticky` con un estado visual al separarse del top (sombra o borde), sin
provocar CLS ni tapar contenido.
**Implementación.** Requiere la escala de z-index de UI-008 (compite con scrim, drawer y dropdown) y
el token `--header-h` de UI-016. **Ejecutar UI-016 antes que ésta.**
**Riesgo.** Es el cambio de mayor riesgo visual de la fase: comparar contra la baseline de UI-014 en
los 8 anchos.
**Aceptación.**
- [ ] La cabecera permanece visible al hacer scroll en todas las páginas.
- [ ] Estado scrolled diferenciado, con transición tokenizada.
- [ ] Cero CLS atribuible al cambio.
- [ ] No tapa el contenido al navegar a un ancla (ver UI-016).

### UI-016 · Token `--header-h` y fin del recorte de contenido `[reconstruido]` 🔴 S
**Resultado.** ✅ Hecho en `0f091dc` y `fcf61f6`. El contenido estaba tapado 31px (41 en la ficha) a ≤991. La corrección destapó además `.section--no-bottom`, que no hacía efecto en dos de los tres breakpoints.
**Estado.** **Confirmado.** No existe el token. Hay un `scroll-margin-top: 110px` fijo en
[`40-prose.css:31`](../styles/40-prose.css#L31), y la altura real del navbar la fija `.logo`
(72 px, 86 px a ≥1280) más el padding — es decir, el 110 es un número mágico que ya no coincide.
**Objetivo.** Una única fuente de verdad para la altura de la cabecera, consumida por el
`scroll-margin-top` de las anclas y por el offset superior de las páginas internas.
**Dependencias.** Bloqueada por UI-006 · Bloquea todas las pantallas de la fase 4.
**Aceptación.**
- [ ] `--header-h` declarado y usado en todos los sitios que hoy repiten la altura.
- [ ] Ningún ancla queda tapada por la cabecera en ninguna página.
- [ ] El valor se actualiza solo en el breakpoint donde el logo cambia de tamaño.

### UI-017 · Contenedores y anchos máximos `[inferido]` 🟠 M
**Objetivo.** Unificar los contenedores (`container`, `container--start`) sobre los tokens de
UI-011, con anchos máximos y padding lateral coherentes por breakpoint.
**Dependencias.** Bloqueada por UI-011.

### UI-018 · Ritmo vertical entre secciones `[inferido]` 🟠 M
**Objetivo.** Aplicar la escala de UI-006 al espaciado entre secciones, sustituyendo los paddings en
`em` que producen decimales.
**Dependencias.** Bloqueada por UI-006, UI-011.

### UI-019 · Rejilla de contenido `[inferido]` 🟡 M
**Objetivo.** Una rejilla declarada (columnas, gutters por breakpoint) que consuman catálogo,
galería y pies de sección, en vez de flex ad-hoc por componente.
**Dependencias.** Bloqueada por UI-011.

### UI-020 · Comportamiento responsive del layout global `[inferido]` 🟠 M
**Objetivo.** Revisar los tres saltos de layout (991, 767, 479) para que ninguna sección quede con
huérfanas, desbordes horizontales ni cambios de orden inesperados.
**Dependencias.** Bloqueada por UI-011, UI-017.

### UI-021 · Cabecera móvil: estructura del menú `[inferido]` 🔴 M
**Contexto.** A ≤991 el mismo `.nav-menu` se convierte en panel fijo de 320 px. La auditoría reporta
20 enlaces planos.
**Objetivo.** Jerarquía navegable en el panel móvil (agrupación, no lista plana), conservando el
patrón disclosure y el scrim (desvío D-4).
**Dependencias.** Bloquea UI-022, UI-023.

### UI-022 · Buscador y CTA en móvil `[inferido]` 🔴 M
**Contexto.** Por debajo de 991 px el buscador y el CTA de contacto desaparecen por completo.
**Objetivo.** Que ambos sean alcanzables en móvil sin abrir el menú, o dentro de él en posición
prominente.
**Dependencias.** Bloqueada por UI-021.

### UI-023 · Foco y bloqueo de scroll del panel móvil `[inferido]` 🟠 S
**Contexto.** Ya existen [`useFocusTrap`](../lib/hooks/useFocusTrap.ts) y
[`useScrollLock`](../lib/hooks/useScrollLock.ts). **Reutilizarlos, no reimplementar.**
**Objetivo.** Verificar que el panel móvil atrapa el foco, lo devuelve al cerrar y bloquea el scroll
de fondo, igual que el drawer del carrito.
**Dependencias.** Bloqueada por UI-021 · Relacionada con UI-097.

### UI-024 · Alineación de los datos de contacto del pie `[reconstruido]` 🟢 XS
**Resultado.** ❌ **No reproducido.** Medido a 390 y 1280: las cuatro columnas comparten `text-align:left`, `align-items:flex-start` y el mismo `left`. El hallazgo es anterior a la reescritura del pie en `8719a97`. **No ejecutar.**
**Estado.** **Plausible, sin medir.** [`18-footer.css`](../styles/18-footer.css) mezcla
`text-align:left` (l.7) y `center` (l.150) en distintos bloques. Puede ser deliberado por breakpoint.
**Implementación.** Medir primero. Si la mezcla es intencionada por breakpoint, cerrar como *no
reproducido* con el dato; si no, unificar.
**Nota.** El pie se reescribió por completo en `8719a97` (cierre editorial de 4 columnas): el
hallazgo de la auditoría puede ser anterior a esa reescritura.
**Aceptación.**
- [ ] Medición registrada, con captura por breakpoint.
- [ ] Alineación coherente o justificación escrita de la diferencia.

### UI-025 · Logo sin deformación `[reconstruido]` 🟠 XS
**Resultado.** ❌ **No reproducido.** Los cuatro derivados y el original son exactamente cuadrados (aspect 1.0000) y `.logo` usa `width:auto`: deformación 0%. Servirlo en SVG sigue siendo una mejora posible, pero no hay bug. **No ejecutar.**
**Estado.** **No reproducido.** `.logo { height:72px; width:auto }` no deforma, y `object-fit:fill`
no aparece en ninguna hoja del repo. El logo se sirve como PNG/WebP a 43 y 86 px con `srcSet`.
**Implementación.** Medir la relación de aspecto renderizada contra la intrínseca del fichero. Si
coinciden, cerrar como *no reproducido*. La parte de la tarea que **sí** puede tener valor
independiente es servir el logo en SVG, por nitidez a cualquier densidad — pero eso es una mejora,
no un bug, y requiere el SVG original (hoy sólo hay `assets/logo-boquita.jpg`).
**Aceptación.**
- [ ] Medición de aspecto registrada.
- [ ] O bien se demuestra la deformación y se corrige, o se cierra como no reproducido.

### UI-026 · Imágenes responsivas: `sizes` correctos `[reconstruido]` 🟠 M
**Contexto.** La auditoría reporta que los `sizes` de la ficha declaran 30vw (≈345 px) para una
imagen que se renderiza a 523 px, forzando al navegador a elegir un candidato demasiado pequeño.
**Objetivo.** Que cada `sizes` declare el ancho real de render en cada breakpoint.
**Nota.** El proyecto usa `<picture>` propio ([`Picture.tsx`](../components/ui/Picture.tsx)), no
`next/image`, por el desvío D-9. `next/image` está reservado para las fotos de producto en Blob.
**Dependencias.** Bloqueada por UI-011 · Bloquea UI-050, UI-064, UI-068, UI-106.
**Aceptación.**
- [ ] Cada `sizes` verificado contra el ancho de render medido, no estimado.
- [ ] Ningún candidato servido por debajo del ancho de render.

### UI-027 · Orden de encabezados `[reconstruido]` 🟠 S
**Resultado.** ❌ **No reproducido.** En el DOM el H2 del carrito precede al H1 en las seis páginas, pero el drawer cerrado lleva `inert` y `visibility:hidden`: nunca llega al árbol de accesibilidad. La auditoría leyó el marcado, no el árbol. Blindado en `c86c530`. **No ejecutar.**
**Estado.** **Plausible, por confirmar en el DOM.** El drawer del carrito monta un `<h2>`
([`CartDrawer.tsx:76`](../components/cart/CartDrawer.tsx#L76)) y se renderiza desde el layout, así que
puede preceder al `<h1>` de la página en orden de documento — en todas las páginas a la vez.
**Implementación.** Confirmar con un volcado del árbol de encabezados por página. Si se confirma, la
solución no es degradar el `<h2>` del carrito: es que el contenido del drawer no participe del
esquema de encabezados del documento cuando está cerrado, o que se monte fuera del flujo.
**Verificación.** [`tests/e2e/a11y.spec.ts`](../tests/e2e/a11y.spec.ts) ya usa `@axe-core/playwright`;
añadir la aserción de orden de encabezados ahí.
**Aceptación.**
- [ ] Árbol de encabezados volcado por página, antes y después.
- [ ] Un solo `<h1>` por página, y ningún `<h2>` antes que él.
- [ ] Test que lo verifique en las 9 vistas.

---

## FASE 3 — Componentes compartidos

> Regla del hito 3: **ninguna pantalla se rediseña antes de que exista el componente que necesita.**
> Criterio de salida por componente: todos sus estados definidos (reposo, hover, focus-visible,
> active, disabled, loading) y usado al menos una vez.

### UI-028 · API única de Button `[reconstruido]` 🔴 L
**Contexto.** La auditoría cuenta 7 variantes de botón sin API común. Existe
[`Btn.tsx`](../components/ui/Btn.tsx) como punto de partida.
**Objetivo.** Una API con `variant` (primary/secondary/ghost/link), `size`, `loading` y `disabled`,
sobre tokens de color, espaciado y radio.
**Dependencias.** Bloqueada por UI-002, UI-006, UI-007 · Bloquea UI-029, UI-030, UI-034 y todo CTA.
**Aceptación.**
- [ ] Las 7 variantes actuales mapeadas a la nueva API, con el mapeo documentado.
- [ ] Los 6 estados definidos para cada variante. Hoy hay **0 reglas `:active`** en todo el CSS.
- [ ] Ningún botón fuera de la API.

### UI-029 · Estados de Button: active, loading, disabled `[inferido]` 🔴 M
**Contexto.** El inventario confirma el hallazgo más contundente de la auditoría: **cero reglas
`:active`** y un solo `:disabled` en ~438 reglas. La interfaz no acusa recibo de la pulsación.
**Dependencias.** Bloqueada por UI-028.

### UI-030 · Botón con icono y botón-sólo-icono `[inferido]` 🟠 S
**Dependencias.** Bloqueada por UI-028, UI-010 · Bloquea UI-031.

### UI-031 · QtyStepper `[reconstruido]` 🟠 S
**Resultado.** ❌ **No es un defecto.** Los cinco usos de `aria-disabled` son correctos y los cinco handlers hacen no-op de verdad (clamp en ficha y store, guarda explícita en el slider). Invariante fijado en `e78d272`. Queda vivo el objetivo real: extraer el QtyStepper único, que es fase 3.
**Estado.** ⚠ **Conflicto C-1 (§8).** El título superviviente pide `aria-disabled` → `disabled` real.
Hay 5 usos de `aria-disabled` y al menos uno es deliberado y razonado en el código.
**Objetivo real.** Extraer el patrón ±1 (hoy duplicado entre
[`AddToCartButton.tsx`](../components/cart/AddToCartButton.tsx) y
[`CartDrawer.tsx`](../components/cart/CartDrawer.tsx)) a un componente único, y **decidir por
componente** el tratamiento del estado deshabilitado.
**Dependencias.** Bloqueada por UI-028, UI-030 · Bloquea UI-070, UI-073, UI-075.
**Aceptación.**
- [ ] Un solo QtyStepper, usado en ficha y carrito.
- [ ] Decisión `disabled` vs `aria-disabled` tomada y razonada por contexto.
- [ ] Si queda `aria-disabled`, verificado que el handler ignora el click.

### UI-032 · Field (input, label, ayuda, error) `[reconstruido]` 🔴 M
**Dependencias.** Bloqueada por UI-002, UI-006, UI-007 · Bloquea UI-074, UI-085, UI-087.
**Aceptación.**
- [ ] Label siempre asociado; error asociado por `aria-describedby`.
- [ ] Borde funcional ≥3:1 (token *funcional*, no *sutil*).
- [ ] Foco visible que no dependa de `outline:0` (ver UI-096).

### UI-033 · Formulario: agrupación, validación y envío `[inferido]` 🟠 M
**Nota.** El único formulario real es la newsletter del pie, y **no envía** — está fuera del render
hasta tener backend (`ESTADO.md`). Esta tarea define el patrón, no lo conecta.
**Dependencias.** Bloqueada por UI-032.

### UI-034 · Enlaces y CTA textuales `[inferido]` 🟡 S
**Dependencias.** Bloqueada por UI-028.

### UI-035 · Tipografía como componente (prose) `[inferido]` 🟡 S
**Contexto.** [`40-prose.css`](../styles/40-prose.css) ya existe para las páginas de contenido.
**Dependencias.** Bloqueada por UI-004.

### UI-036 · Card `[reconstruido]` 🔴 M
**Dependencias.** Bloqueada por UI-002, UI-006, UI-007, UI-008 · Bloquea UI-053, UI-062, UI-071,
UI-081, UI-042, UI-043.
**Aceptación.**
- [ ] Una Card con variantes de superficie y elevación tokenizadas.
- [ ] Estado interactivo completo cuando la card es clicable.

### UI-037 · Dialog `[reconstruido]` 🟠 M
**Contexto.** Reutilizar [`useFocusTrap`](../lib/hooks/useFocusTrap.ts) y
[`useScrollLock`](../lib/hooks/useScrollLock.ts), que ya resuelven foco y scroll en el drawer y el
lightbox. **No reimplementar.**
**Dependencias.** Bloqueada por UI-008, UI-009 · Bloquea UI-057, UI-097.

### UI-038 · Drawer `[reconstruido]` 🟠 M
**Contexto.** Ya existe [`CartDrawer.tsx`](../components/cart/CartDrawer.tsx) con su CSS (73 reglas,
el fichero más grande del repo). La tarea es **extraer** el patrón, no crear uno nuevo.
**Dependencias.** Bloqueada por UI-008, UI-009 · Bloquea UI-073→UI-076, UI-097.

### UI-039 · Overlay y scrim `[inferido]` 🟡 S
**Contexto.** El inventario encontró `rgba(58,42,26,·)` en 5 opacidades distintas. Unificar sobre los
tokens de overlay de UI-002.
**Dependencias.** Bloqueada por UI-008.

### UI-040 · Toast `[reconstruido]` 🔴 M
**Contexto.** No existe ningún sistema de notificaciones. Es la pieza que cierra el hallazgo 5 del
resumen ejecutivo.
**Objetivo.** Un canal de mensajes efímeros, accesible (`role="status"` / `aria-live`), que no robe
el foco y que respete `prefers-reduced-motion`.
**Dependencias.** Bloqueada por UI-002, UI-008 · Bloquea UI-063, UI-070, UI-086.
**Aceptación.**
- [ ] Anuncio en lector de pantalla sin robar foco.
- [ ] Apilamiento y descarte definidos.
- [ ] Cero dependencias nuevas.

### UI-041 · Banner / mensaje inline `[inferido]` 🟡 S
**Dependencias.** Bloqueada por UI-002 (necesita los tokens de estado que UI-002 aún no tiene).

### UI-042 · EmptyState `[reconstruido]` 🟠 S
**Dependencias.** Bloqueada por UI-036 · Bloquea UI-082.

### UI-043 · Skeleton `[reconstruido]` 🟠 S
**Dependencias.** Bloqueada por UI-036 · Bloquea UI-083.

### UI-044 · Chip / filtro `[inferido]` 🟡 S
**Contexto.** El catálogo ya tiene filtrado por categoría. Esta tarea le da forma de componente.

### UI-045 · Badge `[inferido]` 🟡 XS
**Contexto.** Ya existe el badge del contador del carrito en el navbar.

### UI-046 · Disclosure `[inferido]` 🟡 S
**Contexto.** Ya existe el patrón en el dropdown del navbar (`.nav-dropdown-toggle`). Extraerlo.

### UI-047 · Encabezado de sección `[inferido]` 🟡 S
**Dependencias.** Bloqueada por UI-004.

### UI-048 · Página de especímenes de componentes `[inferido]` 🟢 M
**Contexto.** [`/dev/tokens`](../app/dev/tokens/page.tsx) ya existe para tokens (`force-static`,
`noindex`). Extenderla a componentes, con todos sus estados visibles a la vez.
**Aceptación.**
- [ ] Cada componente de la fase 3 aparece con sus 6 estados.
- [ ] La página sigue siendo `noindex` y fuera del sitemap.

---

## FASE 4 — Pantallas

> Orden del embudo: Home → Catálogo → Ficha → Carrito → contenido → 404.
> **No empezar hasta cerrar las fases 1–3.**

### Home (UI-049 → UI-060)

- **UI-049 · Jerarquía tipográfica de la home** `[inferido]` 🟠 M — bloqueada por UI-004.
- **UI-050 · Hero: imagen, `sizes` y LCP** `[inferido]` 🟠 M — bloqueada por UI-026. Conservar la
  decisión de `opacity:1` en el reveal del hero (no aplazar el LCP).
- **UI-051 · Statement: escala y medida de línea** `[inferido]` 🟡 M — bloqueada por UI-004.
- **UI-052 · Ritmo entre secciones de la home** `[inferido]` 🟡 S — bloqueada por UI-018.
- **UI-053 · Rejilla del catálogo en la home** `[inferido]` 🟠 M — bloqueada por UI-036.
- **UI-054 · CTA "Ver todo el catálogo"** `[reconstruido]` 🔴 XS — ❌ **Ya existía; no ejecutar.** El hallazgo es
  falso: [`content/home.ts:264`](../content/home.ts#L264) define
  `{ label: "Ver los 14 productos", href: "/tienda" }`, y hay tres enlaces más a `/tienda`
  (l.173, l.236, l.357). **No ejecutar.** Lo que sí queda en pie del hallazgo original —que la home
  lista productos como texto sin enlace individual— se recoge en UI-053.
- **UI-055 · Galería: interacción y lightbox** `[inferido]` 🟡 M — ya existe
  [`Lightbox.tsx`](../components/ui/Lightbox.tsx).
- **UI-056 · Sección de servicio** `[inferido]` 🟢 S.
- **UI-057 · Menú superpuesto (overlap)** `[inferido]` 🟡 M — bloqueada por UI-037, UI-010.
- **UI-058 · Testimonios** `[inferido]` 🟢 M — **bloqueada por producto**: la sección está oculta
  hasta tener los 6 testimonios reales (`CONTENT_TODO.md §3`). Ver conflicto C-3.
- **UI-059 · Cierre editorial del pie** `[inferido]` 🟢 S — reescrito en `8719a97`; re-verificar el
  hallazgo antes de tocar.
- **UI-060 · Texto scroll-color: contraste** `[reconstruido]` 🟡 S — ✅ **Hecho** en `d7a5568`. El estado sin revelar estaba en 1.32:1 (titular) y 1.36:1 (cuerpo) sobre crema, contra un umbral aplicable de 3:1. Unificados en el token `--text-ghost` a 3.31:1, cubierto por `contrast.test.ts`. La partición de palabras sigue pendiente y depende de UI-051. Detalle original:
  [`ScrollColorText.tsx`](../components/ui/ScrollColorText.tsx) superpone `__base` y `__fill`; hay que
  calcular el ratio del estado intermedio, no sólo el inicial y el final. La partición de palabras
  depende de la medida de línea que fije UI-051.

### Catálogo (UI-061 → UI-067)

- **UI-061 · Rejilla del catálogo** `[inferido]` 🟠 M — bloqueada por UI-011.
- **UI-062 · Tarjeta de producto** `[reconstruido]` 🔴 M — bloqueada por UI-036. El nombre del
  producto debe ser un encabezado real, no un `<span>` (verificar antes: puede haber cambiado en
  `dad7de4`).
- **UI-063 · Añadir al carrito desde la tarjeta** `[reconstruido]` 🔴 M — bloqueada por UI-028,
  UI-040. Es el hallazgo 2 del resumen ejecutivo.
- **UI-064 · Imágenes de producto** `[inferido]` 🟠 M — bloqueada por UI-026.
- **UI-065 · Filtros y búsqueda** `[inferido]` 🟠 M — bloqueada por UI-044. Ya existe
  [`shopSearch.ts`](../lib/shopSearch.ts).
- **UI-066 · Orden y recuento de resultados** `[inferido]` 🟡 S.
- **UI-067 · Títulos y metadatos por vista** `[reconstruido]` 🟡 S — ✅ **Hecho** en `6d55e9f`. Detalle:
  [`app/tienda/page.tsx:30`](../app/tienda/page.tsx#L30) ya tiene `generateMetadata()` con el recuento
  en la descripción. Falta diferenciar catálogo / filtrado por categoría / búsqueda, y que la
  búsqueda vacía no indexe.

### Ficha de producto (UI-068 → UI-072)

- **UI-068 · Imagen y galería de la ficha** `[inferido]` 🟠 M — bloqueada por UI-026. **Límite de
  alcance:** una galería completa es proyecto de producto; lo que exceda se documenta como propuesta
  (riesgo 9).
- **UI-069 · Jerarquía y datos de la ficha** `[inferido]` 🟠 M.
- **UI-070 · Añadir al carrito con confirmación** `[reconstruido]` 🔴 M — bloqueada por UI-031,
  UI-040. Hoy la adición no se confirma de ninguna forma.
- **UI-071 · Alérgenos y datos del producto** `[inferido]` 🟠 M — bloqueada por UI-036.
  ⚠ **Prohibido reescribir o resumir el copy de alérgenos** (riesgo 11): sólo estructura y jerarquía.
- **UI-072 · Producto no encontrado** `[inferido]` 🟡 S — bloqueada por UI-042.

### Carrito (UI-073 → UI-077)

> ⚠ El carrito persiste en `localStorage` bajo `boquita.cart.v1`. **Cualquier cambio de esquema
> exige versionar la clave y migrar en lectura** (riesgo 5).

- **UI-073 · Estructura del drawer** `[inferido]` 🟠 M — bloqueada por UI-038.
- **UI-074 · Línea de carrito y edición de cantidad** `[inferido]` 🟠 M — bloqueada por UI-031,
  UI-032.
- **UI-075 · Desglose y totales** `[inferido]` 🔴 M — bloqueada por UI-031. Hoy no desglosa.
- **UI-076 · Validación antes del checkout** `[inferido]` 🔴 M — hoy no valida.
- **UI-077 · Handoff a WhatsApp** `[inferido]` 🟠 M — ⚠ **validar leyendo el `href`, nunca enviando**
  (convención 8). Cubrir carrito con muchas líneas y textos con caracteres especiales.
  [`whatsapp.test.ts`](../tests/unit/whatsapp.test.ts) ya tiene 17 casos: extenderlos, no sustituirlos.

### Páginas de contenido y 404 (UI-078 → UI-081)

- **UI-078 · Sobre nosotros** `[inferido]` 🟢 M — bloqueada por UI-035.
- **UI-079 · Aviso legal** `[inferido]` 🟢 M — ⚠ **prohibido reescribir el copy legal** (riesgo 11).
  Nota: esa página promete hoy que no se guardan datos en servidor propio; **se reescribe antes de
  que la newsletter inserte la primera fila** (`ESTADO.md`).
- **UI-080 · 404** `[inferido]` 🟡 S — ya existe [`not-found.tsx`](../app/not-found.tsx) (commit
  `8fb7451`). Verificar antes de rehacer.
- **UI-081 · Enlaces de recuperación en 404** `[inferido]` 🟡 S — bloqueada por UI-036.

---

## FASE 5 — UX (estados, feedback, flujos)

- **UI-082 · Estados vacíos en todas las vistas** `[reconstruido]` 🟠 M — bloqueada por UI-042.
  Cubrir: catálogo sin resultados, búsqueda vacía, carrito vacío.
- **UI-083 · Estados de carga** `[reconstruido]` 🟠 M — bloqueada por UI-043. Hoy no hay ninguno.
- **UI-084 · Estados de error** `[inferido]` 🟠 M — ya existen [`error.tsx`](../app/error.tsx) y
  [`global-error.tsx`](../app/global-error.tsx); esta tarea les da tratamiento visual.
- **UI-085 · Validación en formularios** `[inferido]` 🟡 M — bloqueada por UI-032.
- **UI-086 · Confirmación de acciones** `[reconstruido]` 🔴 M — bloqueada por UI-040. Cierra la ruta
  crítica `UI-001 → UI-002 → UI-028 → UI-062/063 → UI-086 → UI-104`.
- **UI-087 · Mensajes y microcopy** `[inferido]` 🟡 M — bloqueada por UI-032.
- **UI-088 · Continuidad del flujo de compra** `[inferido]` 🟠 M — revisión de extremo a extremo del
  embudo, ya con todas las piezas puestas.

---

## FASE 6 — Microinteracciones

> Depende de UI-009 y de que la fase 4 esté estable. Animar antes es retrabajo puro.
> Toda animación debe quedar neutralizada bajo `prefers-reduced-motion`.

- **UI-089 · Transiciones de hover y foco** `[inferido]` 🟡 S.
- **UI-090 · Apertura y cierre de drawer y dialog** `[inferido]` 🟡 S.
- **UI-091 · Entrada y salida de toasts** `[inferido]` 🟡 S — bloqueada por UI-040.
- **UI-092 · Reveal on scroll** `[reconstruido]` 🟡 XS — ⛔ **No se ejecuta.** Decidido: gana el spec normativo. Conflicto C-2 (§8). Los 100 px de
  [`05-components.css:172`](../styles/05-components.css#L172) los manda el §4.1 del spec normativo.
  Cambiarlos exige modificar el spec o registrar un desvío.
- **UI-093 · Parallax** `[inferido]` 🟢 S — ya existe [`parallax.ts`](../lib/parallax.ts) con 23 tests.
- **UI-094 · Feedback táctil en móvil** `[inferido]` 🟡 S — bloqueada por UI-029.

---

## FASE 7 — Accesibilidad

> Verificación transversal, no construcción. Las fases 1–6 ya incorporan los requisitos.

- **UI-095 · Auditoría de contraste sobre el resultado final** `[reconstruido]` 🔴 M — bloqueada por
  UI-003. Reutilizar [`contrast.test.ts`](../tests/unit/contrast.test.ts) y
  [`lib/color.ts`](../lib/color.ts); extender a los pares nuevos que introduzcan las fases 3–4.
- **UI-096 · Anillo de foco visible en todo elemento interactivo** `[reconstruido]` 🔴 S —
  ✅ **Hecho** en `ac01373`. El anillo sube al contenedor porque `.nav-search` tiene
  `overflow:hidden` y recortaría el del input. Detalle: [`10-navbar.css:169`](../styles/10-navbar.css#L169) tiene `outline: 0` en el
  buscador, contradiciendo el propio reset ([`02-reset.css:91`](../styles/02-reset.css#L91): «Nunca
  outline:none») y el anillo de [`99-a11y.css`](../styles/99-a11y.css). Quitarlo y verificar el ratio
  del anillo sobre el fondo del buscador con `lib/color.ts`.
- **UI-097 · Foco en diálogos y drawers** `[reconstruido]` 🟠 M — bloqueada por UI-037, UI-038.
  Verificar atrapado, devolución y cierre con Escape en carrito, menú móvil y lightbox.
- **UI-098 · Semántica de encabezados y landmarks** `[inferido]` 🟠 M — relacionada con UI-027.
- **UI-099 · Nombres accesibles y `aria-label`** `[inferido]` 🟠 M.
- **UI-100 · Navegación completa por teclado** `[inferido]` 🔴 M — incluye verificar el
  [`SkipLink`](../components/ui/SkipLink.tsx) existente.
- **UI-101 · Lectores de pantalla** `[inferido]` 🟠 L — verificación manual, no automatizable.
- **UI-102 · Verificación responsive manual** `[reconstruido]` 🟠 M — bloqueada por UI-011 y la fase
  6. **A mano en 320/390/768/1024/1280/1440/1920**, no por análisis estático: los `resize`
  automáticos no son fiables (riesgo 8).

---

## FASE 8 — Revisión final

- **UI-103 · Borrado del CSS muerto** `[reconstruido]` 🟡 M — bloqueada por UI-013 y las fases 2–6.
  **Sólo se borra lo que sobreviva a la verificación de uso en todo el repo.** Ver conflicto C-3: el
  CSS de testimonios **no** se borra mientras la sección siga pendiente de contenido.
- **UI-104 · Barrido de consistencia contra tokens** `[reconstruido]` 🟠 L — cierre de la ruta
  crítica. Verificar que no queda ningún valor mágico de color, espaciado, radio, sombra o duración.
  Automatizable al modo de `css-vars.test.ts`.
- **UI-105 · Metadatos y SEO** `[inferido]` 🟡 M — ya existen [`lib/seo.ts`](../lib/seo.ts),
  [`sitemap.ts`](../app/sitemap.ts), [`robots.ts`](../app/robots.ts),
  [`opengraph-image.tsx`](../app/opengraph-image.tsx) y JSON-LD de negocio local. Verificar, no rehacer.
- **UI-106 · Rendimiento** `[inferido]` 🟠 M — bloqueada por UI-026. Medir en **build de producción**
  (riesgo 7).
- **UI-107 · QA de regresión final** `[reconstruido]` 🔴 L — bloqueada por todo. `npm test`,
  `npm run typecheck`, `npm run lint`, `NEXT_DIST_DIR=.next-verify npm run e2e`, y comparación contra
  la baseline de UI-014 en las 9 vistas a 4 anchos.
- **UI-108 · Documentación del sistema** `[inferido]` 🟡 M — actualizar `docs/ESTADO.md` (única fuente
  de «qué está hecho»), `docs/DEVIATIONS.md` con los desvíos nuevos, y `/dev/tokens` con el sistema
  completo.

---

## Anexo · Qué se reconstruyó

| Procedencia | Tareas | IDs |
| --- | ---: | --- |
| `[original]` | 4 | UI-001, UI-002, UI-003, UI-004 (esta última truncada a media frase) |
| `[reconstruido]` — sobrevivía el título | 36 | Los de las tablas §3 y §4, más los hitos §2 |
| `[inferido]` — no sobrevivía nada | 68 | El resto |

**Las 68 tareas `[inferido]` son la parte débil de este documento.** Sus IDs existen porque el
reparto por fases del original los exige; su contenido sale de la auditoría fresca del código (§6) y
del `frontend_spec.md`, no de la auditoría UI/UX original. Si aparece el `audit.md` o una copia
íntegra del backlog, **contrastar contra ellas antes de ejecutarlas**.
