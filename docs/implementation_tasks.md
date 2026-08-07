# Backlog de implementación UI/UX — Boquita (Sweet & Salty)

**Fuente:** `audit.md` (auditoría UI/UX, nivel general 6/10).
**Destinatario:** Claude Sonnet 5, con acceso completo al repositorio.
**Naturaleza del proyecto:** e-commerce/catálogo artesanal en Next.js con cierre de pedido por WhatsApp.
**Total de tareas:** 108 · **Fases:** 8 · **Trazabilidad:** anexo final (hallazgo → tarea).

---

## 0. Convenciones de ejecución (leer antes de empezar)

1. **No inventar rutas ni nombres de archivo.** Cada tarea describe *qué* buscar en el repo (selectores, clases, variables CSS reales observadas) y *qué comportamiento* conseguir. Localiza los archivos por búsqueda de esos selectores/clases.
2. **Un commit por tarea**, con el ID en el mensaje (`UI-007: tokens de radio`). Facilita revertir sin arrastrar otros cambios.
3. **No se salta de fase.** Las fases 1–3 son la base del Design System; ejecutar la fase 4 antes provoca retrabajo garantizado.
4. **Prohibido introducir valores mágicos** a partir de la fase 1: todo px de espaciado, radio, color, sombra o duración debe salir de un token.
5. **No añadir dependencias nuevas** (librerías de UI, CSS-in-JS, iconos, gráficos) sin que la tarea lo pida explícitamente.
6. **Adaptación del orden solicitado y justificación:** el guion pedido menciona *Sidebar, Dashboard, Tablas, KPIs, Gráficos, Login, Perfil, Gestión de usuarios*. Este producto **no tiene** sidebar, dashboard, área autenticada ni gráficos. Se mantiene el esqueleto de 8 fases, y esos bloques se sustituyen por sus equivalentes reales: **Sidebar → drawer del carrito + menú móvil**, **Dashboard → Home**, **Login/Perfil/Usuarios → Catálogo, Ficha de producto, Carrito, Sobre nosotros, Aviso legal, 404**, **Tablas/KPIs/Gráficos → base mínima documentada + decisión explícita de no introducir librería de charts**. Se añade además una tarea de inventario (UI-001) *antes* de los tokens, porque tocar variables sin conocer el mapa de hojas de estilo (441 reglas, con CSS muerto) es la principal fuente de regresiones.
7. **Baseline obligatoria antes de UI-002:** capturas de referencia de las 8 vistas (Home, Catálogo, Catálogo filtrado, Catálogo búsqueda vacía, Ficha, Carrito abierto, Sobre nosotros, Aviso legal, 404) a 390/768/1280/1440 px. Sin baseline no hay forma de detectar regresiones visuales en las fases 6–8.
8. **Restricción funcional:** no automatizar ni disparar el envío real del mensaje de WhatsApp durante las pruebas; validar construyendo y leyendo el `href` generado.

---

## 1. Resumen ejecutivo

**Total de tareas: 108.**

| Prioridad | Tareas |
|---|---|
| 🔴 Crítica | 18 |
| 🟠 Alta | 34 |
| 🟡 Media | 38 |
| 🟢 Baja | 18 |

| Fase | Bloque | Tareas |
|---|---|---|
| 1 | Fundamentos / Design System | 14 (UI-001 → UI-014) |
| 2 | Layout global | 13 (UI-015 → UI-027) |
| 3 | Componentes compartidos | 21 (UI-028 → UI-048) |
| 4 | Pantallas | 33 (UI-049 → UI-081) |
| 5 | UX (estados, feedback, flujos) | 7 (UI-082 → UI-088) |
| 6 | Microinteracciones | 6 (UI-089 → UI-094) |
| 7 | Accesibilidad | 8 (UI-095 → UI-102) |
| 8 | Revisión final | 6 (UI-103 → UI-108) |

| Complejidad | Tareas |
|---|---|
| XS | 14 |
| S | 33 |
| M | 41 |
| L | 17 |
| XL | 3 |

**Principales áreas de mejora (ordenadas por impacto):**

1. **Inexistencia de un sistema de diseño real.** Hay variables CSS pero no una escala: 5 tamaños de H1 (46/52/70/72/86 px), 3 de H2, 4 radios distintos (0/4/5/50 px), paddings de sección derivados de `em` que producen decimales (103.536 px, 92.032 px, 138.048 px) y 7 variantes de botón sin API común. Es la causa raíz de la mayoría de los hallazgos y por eso concentra la fase 1.
2. **El flujo de compra está roto por diseño.** La home lista 8 de 14 productos como texto sin enlace al catálogo; las tarjetas del catálogo no permiten añadir al carrito; la ficha no confirma la adición; el carrito no valida ni desglosa. El usuario que quiere comprar necesita más pasos de los necesarios en cada punto.
3. **Cabecera y navegación.** Navbar `position:absolute` (desaparece al hacer scroll en páginas de 6.000+ px), altura de 101/110 px que recorta el contenido superior de todas las páginas internas, buscador y CTA de contacto ocultos por debajo de 991 px, y un menú móvil de 20 enlaces planos.
4. **Accesibilidad.** Contrastes por debajo de AA en cuatro pares de color en uso, anillo de foco con 2.84:1 sobre dorado, `outline:0` en el buscador, `aria-disabled` en lugar de `disabled`, orden de encabezados incorrecto (el H2 del carrito precede al H1 en todas las páginas) y nombres de producto como `<span>` en el catálogo.
5. **Ausencia de capa de feedback.** Cero reglas `:active` en 441, un solo `:disabled`, ningún estado de carga, ningún sistema de notificaciones, ningún skeleton. La interfaz nunca acusa recibo de las acciones.
6. **Detalles de acabado que degradan la percepción de producto.** Favicon y apple-touch-icon devuelven 404, el logo se deforma un 4% con `object-fit:fill`, los `sizes` de la ficha declaran 30vw (345 px) para una imagen que se renderiza a 523 px, la variable `--ff-quote` resuelve a cadena vacía y hay CSS muerto (`.slider`, `.slider-arrow`, `.slider-line`, `.review-card`, `blockquote`).

---

## 2. Roadmap de implementación

**Hito 1 — Fundamentos (fase 1).** Bloqueante absoluto. Al terminar, existe una única fuente de verdad para color, tipografía, espaciado, radio, sombra, movimiento, iconos y breakpoints, y una página interna donde verlos. Ninguna tarea posterior debe introducir valores fuera de esos tokens. Criterio de salida: la baseline visual no cambia de forma no intencionada y el 100% de las nuevas declaraciones usa tokens.

**Hito 2 — Layout global (fase 2).** Depende de la fase 1 (necesita espaciado, breakpoints y contenedores). Resuelve los tres problemas 🔴 estructurales (sticky, solape de cabecera, cabecera móvil) que afectan a todas las páginas. Debe cerrarse antes de la fase 4: tocar pantallas con la cabecera aún solapando obliga a recalcular paddings dos veces.

**Hito 3 — Componentes compartidos (fase 3).** Depende de las fases 1 y 2. Crea las piezas (Button, Field, Card, Dialog, Drawer, Toast, EmptyState, Skeleton, Chip, Badge, QtyStepper, Disclosure) que la fase 4 va a consumir. Regla: **ninguna pantalla se rediseña antes de que exista el componente que necesita.** Criterio de salida: cada componente tiene todos sus estados definidos y está usado al menos una vez.

**Hito 4 — Pantallas (fase 4).** El bloque más grande (33 tareas). Orden interno recomendado: Home → Catálogo → Ficha → Carrito → páginas de contenido → 404. Es el orden del embudo de compra, de modo que cada pantalla ya encuentra resuelta la anterior. Home y Catálogo pueden solaparse en el tiempo; Carrito debe ir después de Ficha porque comparte el QtyStepper y el patrón de feedback.

**Hito 5 — UX (fase 5).** Depende de las fases 3 y 4: los estados vacíos, skeletons y toasts solo pueden aplicarse cuando existen las pantallas y los componentes. Cierra el ciclo de feedback del producto.

**Hito 6 — Microinteracciones (fase 6).** Deliberadamente al final del trabajo visual: animar componentes que aún van a cambiar de estructura es retrabajo puro. Depende de los tokens de movimiento (UI-009) y de que las pantallas estén estables.

**Hito 7 — Accesibilidad (fase 7).** Verificación y corrección transversal. No es "añadir accesibilidad al final": las tareas de fases 1–6 ya incorporan requisitos de contraste, foco y semántica. Esta fase audita el resultado completo, que es lo único que se puede auditar de verdad.

**Hito 8 — Revisión final (fase 8).** Borrado del CSS muerto ya aislado, barrido de consistencia contra tokens, metadatos, rendimiento, QA de regresión y documentación. El borrado de CSS va aquí y no en la fase 1 a propósito: eliminar reglas antes de haber reescrito los componentes que podrían depender de ellas es la vía rápida a una regresión silenciosa.

**Paralelización posible (si hay más de un ejecutor):**
- Fase 1: UI-010 (iconografía) y UI-012 (assets de marca) son independientes del resto de tokens.
- Fase 3: los componentes de formulario (UI-032/033), los de superficie (UI-036/037/038) y los de feedback (UI-040/041/042/043) son tres carriles independientes.
- Fase 4: Home, Catálogo+Ficha y páginas de contenido (Sobre nosotros, Aviso legal, 404) son tres carriles independientes.

---

## 3. Matriz de dependencias

| Bloque | Bloqueado por | Bloquea a |
|---|---|---|
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

**Rutas críticas:** `UI-001 → UI-002 → UI-028 → UI-062/063 → UI-086 → UI-104` (sistema de botones y feedback) y `UI-001 → UI-006 → UI-016 → toda la fase 4` (altura de cabecera y espaciados).

---

## 4. Quick Wins (alto impacto, baja complejidad — hacer en los primeros días)

| Orden | ID | Tarea | Prio | Compl. |
|---|---|---|---|---|
| 1 | UI-012 | Favicon, apple-touch-icon, manifest y theme-color (hoy 404) | 🔴 | XS |
| 2 | UI-015 | Navbar sticky con estado scrolled | 🔴 | S |
| 3 | UI-016 | `--header-h` y fin del recorte de contenido en páginas internas | 🔴 | S |
| 4 | UI-005 | Arreglar `--ff-quote` vacío | 🟡 | XS |
| 5 | UI-025 | Logo en SVG sin deformación del 4% | 🟠 | XS |
| 6 | UI-096 | Quitar `outline:0` del buscador y anillo de foco con contraste | 🔴 | S |
| 7 | UI-054 | CTA "Ver todo el catálogo" en la home (hoy no existe) | 🔴 | XS |
| 8 | UI-027 | Orden de encabezados (H2 del carrito antes del H1) | 🟠 | S |
| 9 | UI-003 | Contraste de los cuatro pares de color infractores | 🔴 | S |
| 10 | UI-024 | Alineación de los datos de contacto del footer | 🟢 | XS |
| 11 | UI-067 | Títulos y metadatos distintos por vista de catálogo | 🟡 | S |
| 12 | UI-092 | Reveal on scroll: 100 px → 16–24 px de desplazamiento | 🟡 | XS |
| 13 | UI-060 | Contraste y partición de palabras del texto scroll-color | 🟡 | S |
| 14 | UI-031 | `aria-disabled` → `disabled` real en el QtyStepper | 🟠 | S |

Los 14 quick wins cubren 3 de los 7 problemas principales del resumen ejecutivo y no requieren que el Design System esté terminado, salvo UI-003 (necesita UI-002).

---

## 5. Riesgos generales del proyecto

1. **Regresión visual masiva al tocar variables globales.** Los tokens actuales están usados en 441 reglas; renombrar o reescalar sin baseline rompe páginas que nadie está mirando. *Mitigación:* baseline obligatoria (convención 7), un token por commit, y comparación visual de las 9 vistas tras cada tarea de fase 1.
2. **Paddings derivados de `em` acoplados al `font-size`.** Al cambiar la escala tipográfica (UI-004) todos los espaciados de sección se mueven solos. *Mitigación:* ejecutar UI-006 inmediatamente después de UI-004 y en el mismo hito, convirtiendo esos paddings a tokens absolutos antes de dar por buena ninguna captura.
3. **Doble sistema de espaciado durante la transición.** Mientras coexistan valores mágicos y tokens habrá secciones con ritmo distinto. *Mitigación:* la fase 8 (UI-104) incluye un barrido explícito; hasta entonces, prohibido crear nuevos valores mágicos.
4. **CSS muerto que en realidad no lo está.** `.review-card{min-height:420px}` o `blockquote` podrían usarse en rutas no visitadas. *Mitigación:* UI-013 solo aísla y marca; el borrado real (UI-103) exige verificación de uso en todo el repo, no solo en las páginas auditadas.
5. **El carrito vive en `localStorage` (`boquita.cart.v1`).** Cualquier cambio en la forma del estado invalida carritos existentes de usuarios reales. *Mitigación:* si UI-073/UI-076 cambian el esquema, versionar la clave y migrar en lectura; nunca borrar el estado antiguo sin migración.
6. **El cierre por WhatsApp es un handoff fuera de la app.** Cambios en la construcción del mensaje pueden romper pedidos sin error visible. *Mitigación:* validar por inspección del `href` generado, no enviando; cubrir el caso de carrito con muchas líneas y de textos con caracteres especiales.
7. **Entorno de desarrollo confundido con diseño.** El badge "N" del overlay de Next.js aparece abajo a la izquierda en todas las capturas y **no** forma parte de la interfaz. *Mitigación:* verificar siempre en build de producción antes de dar por buena una captura.
8. **Viewport no fiable en la herramienta de auditoría.** Los `resize` no siempre se aplican (se observaron viewports de 1150 y 504 px sin control). El responsive de la auditoría se derivó de las media queries (479/767/991/992/1280/1440/1920). *Mitigación:* UI-102 exige verificación manual real en 320/390/768/1024/1280/1440/1920, no confiar en el análisis estático.
9. **Alcance creciente en la fase 4.** Introducir galería de producto, relacionados y sistema de reseñas puede convertirse en un proyecto de producto, no de UI. *Mitigación:* cada tarea define su límite; lo que exceda se documenta como propuesta, no se implementa.
10. **Accesibilidad tratada como fase final.** Existe el riesgo de que la fase 7 acumule deuda de las seis anteriores. *Mitigación:* los criterios de aceptación de las fases 2–6 ya incluyen requisitos de foco, contraste y semántica; la fase 7 es verificación, no construcción.
11. **Contenido legal y de alérgenos.** Reorganizar `/aviso-legal` o los alérgenos de la ficha puede alterar información con implicaciones legales/sanitarias. *Mitigación:* prohibido reescribir o resumir ese copy; solo estructura, jerarquía y legibilidad.

---

# 6. Backlog

---

## FASE 1 — Fundamentos (Design System)

### UI-001 · Inventario y mapa del sistema de estilos
**Contexto.** El proyecto tiene ~441 reglas CSS, variables en `:root`, utilidades (`mt-20`, `h6-sans`, `prose`, `container--start`), clases de componente y reglas muertas. Nadie sabe hoy qué archivo define qué.
**Objetivo.** Producir un mapa navegable del sistema de estilos actual que sirva de base a todas las tareas siguientes.
**Implementación.** Recorre todas las hojas de estilo y estilos locales del repo. Inventaria: variables CSS declaradas y cuáles se usan realmente; variables referenciadas pero no declaradas (`--font-quote` es una, y provoca que `--ff-quote` resuelva a cadena vacía); clases de utilidad y cuántas veces se usan; clases de componente; reglas sin ninguna coincidencia en el marcado. Registra los valores repetidos que deberán convertirse en tokens (tamaños de fuente, paddings de sección, radios, colores). Documenta el orden de carga y la especificidad, señalando dónde hay riesgo de cascada frágil. Sin cambios de comportamiento en esta tarea.
**Áreas.** Sistema de estilos · Design System.
**Dependencias.** Bloqueada por: — · Bloquea: toda la fase 1 · Paralelo: UI-010, UI-012.
**Riesgos.** Ninguno funcional; el riesgo es un inventario incompleto que deje valores mágicos sin detectar.
**Aceptación.**
- [ ] Existe un inventario de variables (declaradas/usadas/huérfanas/referenciadas-inexistentes).
- [ ] Existe la lista de valores repetidos candidatos a token, con su recuento.
- [ ] Existe la lista de reglas sin uso detectado, marcada como *pendiente de verificación*.
- [ ] Cero cambios visuales respecto a la baseline.
**Prioridad.** 🟠 Alta — no aporta valor visible pero sin ella toda la fase 1 se hace a ciegas.
**Complejidad.** M — volumen alto de lectura, cero riesgo de implementación.

### UI-002 · Tokens de color primitivos y semánticos
**Contexto.** La paleta se usa hoy de forma directa (`#e8a81b`, `#b07208`, `#b5a99b`, `#e7e0d6`, `#3a2a1a`, `#f2c014`, `#8a5a06`, crema de fondo) sin una capa que diga *para qué sirve* cada color. El mismo dorado se usa como fondo, como texto y como borde, con resultados de contraste muy distintos.
**Objetivo.** Establecer dos niveles de token —primitivos (rampa cromática) y semánticos (intención de uso)— y migrar los usos.
**Implementación.** Define primitivos por familia y paso (marrón/tierra, dorado, crema, neutros) partiendo de los colores existentes: la identidad no cambia. Encima, define semánticos: texto principal/secundario/inverso/de acento, superficie base/elevada/inversa, borde sutil/funcional/fuerte, y estados de acento/éxito/aviso/error/info (hoy no existen estados). Migra las reglas para que consuman semánticos y no primitivos. Deja documentado qué pares fondo/texto están permitidos, porque el problema real no es la paleta sino su combinación. No introduzcas dark mode (hay 0 reglas hoy); reserva el espacio en la nomenclatura pero no lo implementes.
**Áreas.** Design System · Sistema de estilos · todos los componentes.
**Dependencias.** Bloqueada por: UI-001 · Bloquea: UI-003 y todas las fases 2–4 · Paralelo: UI-004, UI-006.
**Riesgos.** Cambios de color no intencionados en zonas no auditadas; pérdida de matices de marca si se "normaliza" la rampa demasiado.
**Aceptación.**
- [ ] Existen capas primitiva y semántica, y ningún componente referencia un primitivo directamente.
- [ ] Existen tokens de estado (éxito/aviso/error/info) aunque aún no se usen.
- [ ] Documentados los pares fondo/texto permitidos.
- [ ] La baseline visual no cambia salvo donde UI-003 lo exija.
**Prioridad.** 🔴 Crítica — es la raíz de los hallazgos de contraste y de la inconsistencia cromática.
**Complejidad.** L — afecta a todo el CSS y exige criterio de diseño.

### UI-003 · Corregir el contraste de los tokens de texto y borde
**Contexto.** Medidos en la auditoría: `#b07208` sobre crema 3.68:1; `#e8a81b` sobre blanco 2.09:1; `#b5a99b` sobre blanco 2.30:1; borde `--gray:#e7e0d6` 1.31:1. Ya cumplen `#8a5a06` sobre crema (5.45:1), `#3a2a1a` sobre dorado (6.58:1) y `#f2c014` sobre oscuro (8.08:1).
**Objetivo.** Que ningún token de texto baje de 4.5:1 (3:1 si es ≥24 px o ≥19 px bold) y que ningún borde funcional baje de 3:1.
**Implementación.** Ajusta la luminosidad de los tokens semánticos infractores manteniendo el tono de marca; usa como guía los tres pares que ya cumplen. `#e8a81b` deja de ser color de texto sobre claro y pasa a ser exclusivamente color de superficie/acento decorativo; para texto dorado sobre claro usa la versión oscura. `#b5a99b` solo puede sobrevivir como texto en tamaños grandes; para texto secundario pequeño oscurécelo. Distingue dos tokens de borde: *sutil* (decorativo, sin requisito) y *funcional* (inputs, separadores de tabla, contornos de card, ≥3:1). Recalcula y registra cada ratio.
**Áreas.** Design System · Accesibilidad · todos los componentes.
**Dependencias.** Bloqueada por: UI-002 · Bloquea: UI-095, UI-096 · Paralelo: UI-004.
**Riesgos.** Oscurecer el dorado puede endurecer la estética artesanal; los bordes más visibles pueden dar sensación "de formulario" en zonas editoriales, de ahí la separación sutil/funcional.
**Aceptación.**
- [ ] Ningún par texto/fondo en uso por debajo del umbral AA aplicable.
- [ ] Bordes de inputs, separadores y contornos de card ≥3:1.
- [ ] `#e8a81b` no se usa como color de texto sobre fondos claros en ningún lugar.
- [ ] Tabla de ratios documentada.
**Prioridad.** 🔴 Crítica — accesibilidad legal y legibilidad real.
**Complejidad.** S — pocos valores, decisión rápida, verificación mecánica.

### UI-004 · Escala tipográfica fluida
**Contexto.** Coexisten cinco tamaños de H1 (46, 52, 70, 72, 86 px), tres de H2 (34, 42, 50) y tres de H3 (30, 34, 36), más un `blockquote` a 36/700 que ya no se usa. La navegación salta de 18 a 19 px en el breakpoint de 1280.
**Objetivo.** Una escala tipográfica única, con tokens de tamaño, interlineado y tracking, fluida entre breakpoints.
**Implementación.** Define una escala de pasos (display, h1…h6, body-lg, body, body-sm, caption, overline) con progresión coherente e interlineado ligado a cada paso (los títulos grandes necesitan interlineado más cerrado que el body). Usa interpolación fluida por viewport para que no haya saltos bruscos como el de 18→19 px. Mapea cada uno de los tamaños actuales al paso más cercano y documenta el mapeo antes de aplicarlo, señalando qué títulos van a cambiar de tamaño y en qué páginas. Incluye tokens de tracking para las mayúsculas (los *eyebrow* y botones van en caja alta y necesitan tracking positivo). Elimina de la escala el estilo de `blockquote` huérf