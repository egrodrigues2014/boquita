# ESPECIFICACIÓN TÉCNICA DE REPLICACIÓN — REFERENCIA: italy-128.webflow.io (/home-2 y /menu-2)
## Documento de traspaso para Claude Opus 5 — Proyecto: Tienda online de DULCES y PRODUCTOS SALADOS

> **Naturaleza del documento:** especificación de análisis. NO contiene código. NO contiene tareas de desarrollo.
> **Destinatario:** modelo de IA (Claude Opus 5) con acceso al repositorio del proyecto.
> **Alcance analizado:** EXCLUSIVAMENTE https://italy-128.webflow.io/home-2 y https://italy-128.webflow.io/menu-2
> **Fecha de captura:** 2026-08-10
> **Versión:** 1.0

---

## 0. METODOLOGÍA, FUENTES Y SISTEMA DE ETIQUETADO

### 0.1 Fuentes de evidencia utilizadas

| # | Fuente | Qué aporta | Fiabilidad |
|---|---|---|---|
| F1 | DOM renderizado de /home-2 y /menu-2 (árbol de accesibilidad + recorrido de nodos por profundidad) | Estructura real, orden de secciones, textos literales, destinos de enlaces, atributos de componentes | Alta — hecho verificable |
| F2 | Hoja de estilos publicada del sitio (fichero CSS de Webflow, 205.513 caracteres, 2.013 reglas parseadas) | Valores EXACTOS de color, tipografía, spacing, radios, sombras, transiciones y TODOS los media queries | Alta — hecho verificable |
| F3 | Bundle JavaScript de Webflow (webflow.js, 1.754.211 caracteres) con las definiciones IX2 | Configuración exacta de animaciones: triggers, duración, easing, delays, propiedades animadas | Alta — hecho verificable |
| F4 | Capturas de pantalla del renderizado a distintos scrolls y estados (modal de carrito abierto, drawer móvil abierto, pestaña de categoría cambiada) | Comprobación visual del resultado, jerarquía visual, proporciones | Alta para lo visible |
| F5 | Interacción directa (clic en pestañas de categoría, apertura/cierre de carrito, apertura de menú móvil) | Comportamiento funcional real | Alta para lo probado |

### 0.2 LIMITACIÓN CRÍTICA DE CAPTURA (leer antes de usar el documento)

El viewport disponible durante la captura fue de **964 × 783 px CSS** (devicePixelRatio 1.25, ventana externa 1536 px). Los intentos de redimensionar la ventana a 1512×950 y 1600×1000 **fallaron silenciosamente**: la API reportó éxito pero window.innerWidth permaneció en 964 px.

**Consecuencia:** el renderizado observado visualmente corresponde al **breakpoint tablet (≤991 px)**, NO al desktop.

**Mitigación aplicada:** todos los valores de desktop (≥992 px, ≥1280 px y ≥1440 px) se extrajeron **directamente de la hoja de estilos publicada**, leyendo las reglas base y sus media queries. Por tanto siguen siendo OBSERVED, pero con la marca **(CSS)** en lugar de **(rendered)**.

**Regla para Opus 5:** cuando una afirmación esté marcada OBSERVED (CSS) y no OBSERVED (rendered), la fuente de verdad es el valor CSS; si al implementar hay discrepancia visual, prevalece el valor CSS documentado.

### 0.3 Sistema de etiquetado (OBLIGATORIO en todo el documento)

| Etiqueta | Significado | Cómo debe tratarlo Opus 5 |
|---|---|---|
| **OBSERVED** | Hecho comprobado directamente. Se especifica el subtipo entre paréntesis: (CSS) = leído de la hoja de estilos publicada; (DOM) = leído del árbol de nodos real; (rendered) = visto en captura de pantalla; (IX2) = leído de la configuración de animaciones de Webflow; (tested) = comprobado interactuando | Convertir en requisito firme. Implementar tal cual. |
| **INFERRED** | Deducción razonable a partir de evidencia parcial. No comprobado al 100 %. | Convertir en requisito, pero marcar en el plan como "requiere validación de diseño". |
| **RECOMMENDED** | Propuesta de mejora del analista. NO existe en la referencia. | NO es requisito. Convertir en backlog opcional. Requiere aprobación explícita del usuario antes de planificar. |
| **NOT VERIFIED** | No es comprobable desde /home-2 y /menu-2. | **PROHIBIDO inventar la implementación.** Crear una tarea de investigación/decisión, no una tarea de desarrollo. |

### 0.4 Convención de identificadores usada en este documento

| Prefijo | Significado | Ejemplo |
|---|---|---|
| H-nn | Sección de la página Home, en orden vertical descendente | H-04 |
| M-nn | Sección de la página Menu, en orden vertical descendente | M-03 |
| C-nn | Componente reutilizable | C-07 |
| FR-HOME-nnn / FR-MENU-nnn / FR-GLOBAL-nnn | Requisito funcional | FR-MENU-001 |
| NFR-nnn | Requisito no funcional | NFR-005 |
| E-nn | Entidad del modelo de datos | E-01 |

### 0.5 Breakpoints reales de la referencia

| Breakpoint | Rango CSS | Nombre Webflow | Origen |
|---|---|---|---|
| XL Desktop | ≥ 1440 px | Desktop grande | OBSERVED (CSS) — existen media queries min-width 1440px |
| L Desktop | ≥ 1280 px | Desktop medio | OBSERVED (CSS) — existen media queries min-width 1280px |
| Desktop base | 992 – 1279 px | Base (sin media query) | OBSERVED (CSS) — reglas base |
| Tablet | ≤ 991 px | Tablet | OBSERVED (CSS) + OBSERVED (rendered a 964 px) |
| Mobile landscape | ≤ 767 px | Móvil horizontal | OBSERVED (CSS) |
| Mobile portrait | ≤ 479 px | Móvil vertical | OBSERVED (CSS) |

**Nota crítica para Opus 5:** Webflow usa media queries **max-width** en cascada descendente para tablet/móvil y **min-width** para los desktop grandes. La base del CSS es el rango 992–1279 px. Si el proyecto destino usa metodología mobile-first, esta cascada debe **invertirse conscientemente**, no copiarse literalmente. INFERRED sobre la estrategia de implementación; los valores por breakpoint son OBSERVED.

---

## 1. HOME — ANÁLISIS COMPLETO (/home-2)

### 1.0 Mapa vertical de la página (orden real del DOM, de arriba abajo) — OBSERVED (DOM)

| ID | Nodo raíz (clase real Webflow) | Nombre funcional | Contiene |
|---|---|---|---|
| H-00 | div.navbar.w-nav | Barra de navegación fija | Logo, menú con 4 dropdowns + 1 link simple, teléfono, carrito, CTA, botón hamburguesa |
| H-01 | div.section-banner-home-2 | Hero / banner principal | Imagen de fondo, eyebrow, H1 en 2 líneas, párrafo, 2 botones |
| H-02 | div.section.without-bottom-spacing | Banda declarativa (statement) | Único H2 en mayúsculas, centrado, sin imágenes |
| H-03 | div.section | Bloque "proceso" con vídeo | Grid 2 columnas: vídeo con lightbox + H2 y párrafo |
| H-04 | div (sin clase) > div.background-light | Nuestra carta (lista de precios) | Imagen superior a ancho de contenedor + eyebrow/H2/párrafo + lista dinámica de 8 platos |
| H-05 | div.section.padding-home-2 | Servicio / cifras | Grid: imagen + eyebrow/H2/párrafo + grid de 2 estadísticas |
| H-06 | div.section.without-bottom-spacing | Galería marquee | H2 "GALLERY" + 2 pistas horizontales con 14 imágenes en movimiento continuo |
| H-07 | div.section | Testimonios (slider) | H2 + slider Webflow de 6 diapositivas con flechas y paginación |
| H-08 | div.footer-2 > div.delivery-wrapper | Delivery / pickup | Grid: texto + CTA e imagen |
| H-09 | div.footer-2 > div.black-background-footer > div.subscribe | Newsletter | H4 + formulario de email |
| H-10 | div.footer-2 > div.black-background-footer > div.footer-wrapper + div.footer-rights-wrapper | Pie de página | Logo, descripción, 4 iconos sociales, 5 enlaces, dirección, 2 teléfonos, copyright |
| — | div.promotion-labels-wrapper | Etiquetas promocionales de plantilla Webflow | **NO REPLICAR.** Artefacto comercial del marketplace de Webflow, ajeno al diseño |

**Nota estructural clave OBSERVED (DOM):** H-08, H-09 y H-10 **no son secciones independientes**: los tres viven dentro del mismo nodo div.footer-2. Esto significa que en la referencia el "pie de página" es un macro-componente compuesto por tres bloques apilados. Es reutilizado íntegramente en /menu-2. INFERRED: debe implementarse como un único componente de layout compartido, no como tres secciones sueltas repetidas.

---

### H-00 · BARRA DE NAVEGACIÓN

| Campo | Valor |
|---|---|
| Orden | 0 (primer nodo del body) |
| Objetivo | Navegación global persistente + acceso al carrito + CTA de contacto |
| Nodo | div.navbar.w-nav > div.nav-container.w-container |

**Estructura OBSERVED (DOM)**
~~~
div.navbar.w-nav
  div.nav-container.w-container
    a.brand-3.w-nav-brand > img.logo
    div.nav-menu-wrapper
      nav.nav-menu.w-nav-menu
        div.nav-menu-shadow-overlay
          div.close-button-wrap        (solo visible en drawer móvil)
            a.logo-mobile.w-nav-brand
            div.close-menu-button.w-nav-button
          div.nav-dropdown.w-dropdown   -> "Demos"
          div.nav-dropdown.w-dropdown   -> "Our Menu"
          a.nav-link.w-nav-link         -> "Delivery & Reservation"
          div.nav-dropdown.w-dropdown   -> "Blog"
          div.nav-dropdown.w-dropdown   -> "All Pages"  (nav-dropdown-list.megamenu)
    div.navbar-button
      a.hidden-tabley            -> "(480) 555-0103"
      div.w-commerce-commercecartwrapper
        a.cart-button.w-inline-block           (icono carrito)
        div.w-commerce-commercecartcontainerwrapper   (modal de carrito)
      a.primary-button.hidden-mob -> "Get In Touch"
    div.menu-button.w-nav-button > img         (hamburguesa)
  div.w-nav-overlay
~~~

**Ítems de navegación OBSERVED (DOM)**

| # | Etiqueta | Tipo | Notas |
|---|---|---|---|
| 1 | Demos | Dropdown | Lista de variantes de home de la plantilla. En el proyecto destino **se elimina**. |
| 2 | Our Menu | Dropdown | Enlaza a las variantes de menú. Aquí vive el enlace a /menu-2 |
| 3 | Delivery & Reservation | Enlace simple (a.nav-link) | Único ítem sin submenú |
| 4 | Blog | Dropdown | |
| 5 | All Pages | Dropdown con clase adicional .megamenu | Layout de mega-menú multicolumna |
| 6 | (480) 555-0103 | Enlace de teléfono con clase .hidden-tabley | **Se oculta en tablet y por debajo** |
| 7 | Icono de carrito | Botón que abre modal | Ver H-00.4 |
| 8 | Get In Touch | a.primary-button.hidden-mob | **Se oculta en móvil** |

**Tipografía y color OBSERVED (CSS)**

| Elemento | Familia | Tamaño | Peso | Color | Transform |
|---|---|---|---|---|---|
| .nav-link | Libre Franklin | 20 px | 500 | #000 | — |
| .nav-dropdown-link | Libre Franklin | 18 px | 500 | — | capitalize |
| a (base global) | — | 20 px | 500 | #000 | — |

**Comportamiento OBSERVED (tested / CSS)**

| Aspecto | Comportamiento |
|---|---|
| Posición | Fija en la parte superior, superpuesta sobre el hero (el hero compensa con padding-top 180 px) |
| Apertura de dropdown | Al hacer clic en el toggle (comportamiento estándar w-dropdown de Webflow). En desktop también responde a hover — INFERRED: configuración por defecto de Webflow |
| Drawer móvil | Clic en div.menu-button abre nav.nav-menu como panel deslizante a pantalla completa con overlay (div.w-nav-overlay). Dentro aparece el logo móvil y un botón de cierre propio (div.close-menu-button). Verificado abriendo el drawer — OBSERVED (tested) |
| Cierre del drawer | Clic en .close-menu-button o en el overlay |
| Breakpoint de colapso | ≤ 991 px (breakpoint por defecto de Webflow para w-nav) — OBSERVED (rendered a 964 px) |
| Scroll | **No se detectó cambio de estado del navbar al hacer scroll** (ni encogido, ni cambio de fondo, ni ocultación). OBSERVED (rendered, capturas a scroll 0/900/1800/2700/3600/4500/5400) |

**Carrito (H-00.4) OBSERVED (tested)**

| Aspecto | Comportamiento |
|---|---|
| Trigger | Clic en a.cart-button |
| Resultado | Se abre un modal/overlay de carrito de Webflow Ecommerce (div.w-commerce-commercecartcontainerwrapper) |
| Contenido observado | Cabecera del carrito, estado vacío, botón de cierre |
| Cierre | Botón de cierre dentro del modal |
| Contador de artículos | Existe el nodo de contador propio de Webflow. **NOT VERIFIED**: no se pudo comprobar el incremento porque desde /home-2 y /menu-2 no hay ningún botón que añada al carrito (ver sección 7) |
| Checkout | **NOT VERIFIED** desde el alcance analizado |

**Responsive**

| Breakpoint | Comportamiento | Etiqueta |
|---|---|---|
| ≥ 992 px | Menú horizontal completo, teléfono visible, CTA visible | OBSERVED (CSS) |
| ≤ 991 px | Colapsa a hamburguesa; teléfono oculto (.hidden-tabley) | OBSERVED (rendered) |
| ≤ 767 px | CTA "Get In Touch" oculto (.hidden-mob); quedan logo + carrito + hamburguesa | OBSERVED (CSS) |

**Ausencias relevantes (importante para no inventar)**
- No hay buscador en la barra de navegación. OBSERVED (DOM)
- No hay selector de idioma ni de divisa. OBSERVED (DOM)
- No hay enlace a "cuenta / login". OBSERVED (DOM)
- No hay breadcrumb en ninguna de las dos páginas. OBSERVED (DOM)

---

### H-01 · HERO / BANNER PRINCIPAL

| Campo | Valor |
|---|---|
| Orden | 1 |
| Objetivo | Impacto de marca + propuesta de valor + doble llamada a la acción |
| Nodo | div.section-banner-home-2 |

**Estructura OBSERVED (DOM)**
~~~
div.section-banner-home-2
  img.banner-img-home-2                       (imagen decorativa posicionada)
  div.base-container.align-start.w-container
    div.banner-content-home-2
      h6.h6-libre-franklin.primary  "ITALIAN RESTAURANT"
      h1.h1-banner-home-2           "original" <br> <span.primary-color-text>"italian FOOD"</span>
      p.paragraph-large.mt-20       (texto de apoyo, ~2 líneas)
      div.button-wrapper
        a.primary-button        "Get in Touch"
        a.primary-button-white  "Book a Table"
~~~

**Propiedades exactas OBSERVED (CSS)**

| Propiedad | Base (992–1279) | ≥1280 | ≥1440 | ≤991 | ≤767 |
|---|---|---|---|---|---|
| padding-top (.section-banner) | 180 px | 200 px | 200 px | 140 px | 140 px |
| padding-bottom | 80 px | 80 px | 80 px | 80 px | 60 px |
| H1 tamaño | 70 px | 70 px | 72 px (.h1-banner-home-2) | 52 px | 46 px |
| Párrafo (.paragraph-large) | 20 px / 1.5em | = | = | = | = |
| Contenedor | max-width 1200 px, padding lateral 15 px, alineado a la izquierda (.align-start) | = | = | = | = |

**Tipografía y color OBSERVED (CSS)**

| Elemento | Familia | Tamaño | Peso | LH | Color | Transform |
|---|---|---|---|---|---|---|
| h6.h6-libre-franklin.primary | Libre Franklin | 20 px (18 px ≤991) | 500 | 1.2em | **#cb6037** | uppercase, letter-spacing .1em |
| h1 (línea 1 "original") | Cormorant Infant | 70/72 px | 700 | 1em | #1a1a1a | uppercase |
| h1 span.primary-color-text (línea 2) | Cormorant Infant | idem | 700 | 1em | **#cb6037** | uppercase |
| p.paragraph-large | Libre Franklin | 20 px | 400 | 1.5em | #707070 | — |

**Patrón tipográfico crítico INFERRED (evidencia fuerte):** el H1 se parte deliberadamente en dos líneas mediante un br explícito y la segunda línea se colorea con el acento. Es el recurso de identidad visual principal de la página y debe replicarse como una **prop del componente Hero** (por ejemplo: línea 1 y línea 2 como campos separados), nunca como texto libre.

**Botones OBSERVED (CSS)**

| Botón | Clase | Fondo | Texto | Borde | Radio | Padding | Hover |
|---|---|---|---|---|---|---|---|
| Get in Touch | .primary-button | #cb6037 | #fff | 1 px sólido #cb6037 | 5 px | 14px 30px | fondo → #fff, texto → #cb6037 (transition background-color .3s, color .3s) |
| Book a Table | .primary-button-white | #fff | #cb6037 | 1 px sólido #cb6037 | 5 px | 14px 30px | **No declarado en CSS** — OBSERVED (CSS). INFERRED: debería reflejar el inverso (fondo #cb6037, texto #fff) por coherencia; marcar como decisión de diseño |

Ambos con letter-spacing .5 px y text-transform: none (única familia de texto de la página que NO va en mayúsculas).

**Imagen**
- img.banner-img-home-2: imagen decorativa del plato, posicionada a la derecha, superponiéndose parcialmente al contenedor. OBSERVED (DOM + rendered).
- **NOT VERIFIED**: si la imagen tiene srcset/sizes responsive. INFERRED: Webflow genera automáticamente variantes; en el proyecto destino debe implementarse explícitamente.

**Animaciones OBSERVED (IX2)**
- El hero utiliza animaciones de entrada al cargar la página (page load) sobre los elementos de texto y botones, con desplazamiento vertical y fundido. Ver sección 6.9 para el catálogo completo de interacciones IX2.

**Responsive**

| Breakpoint | Comportamiento | Etiqueta |
|---|---|---|
| ≥ 992 px | Texto alineado a la izquierda en ~50 % del ancho; imagen a la derecha | OBSERVED (CSS) |
| ≤ 991 px | H1 baja a 52 px; el bloque de texto se ensancha; imagen reubicada/reducida | OBSERVED (rendered) |
| ≤ 767 px | H1 46 px; padding vertical de sección 60 px; botones INFERRED: pasan a apilarse a ancho completo | OBSERVED (CSS) + INFERRED |

---

### H-02 · BANDA DECLARATIVA (STATEMENT)

| Campo | Valor |
|---|---|
| Orden | 2 |
| Objetivo | Transición narrativa entre hero y contenido; refuerzo de tono de marca |
| Nodo | div.section.without-bottom-spacing |

**Estructura OBSERVED (DOM):** un único H2 dentro de base-container. **0 imágenes, 0 botones, 0 enlaces.**

| Propiedad | Valor | Etiqueta |
|---|---|---|
| Texto | Frase larga en mayúsculas, centrada, ocupando 3–4 líneas | OBSERVED (DOM) |
| Tipografía | Cormorant Infant, 50 px (42 px ≤991, 34 px ≤767), peso 400, line-height 1em, uppercase | OBSERVED (CSS) |
| Color | **#cb6037** (color por defecto de h2 en todo el sitio) | OBSERVED (CSS) |
| Padding de sección | 80 px arriba / 0 abajo (clase .without-bottom-spacing) · 120 px arriba ≥1280 · 60 px ≤767 | OBSERVED (CSS) |
| Alineación | Centrada | OBSERVED (rendered) |
| Interacción | Ninguna | OBSERVED (DOM) |
| Animación | Fundido/desplazamiento al entrar en viewport | OBSERVED (IX2) |

**Valor para el proyecto destino:** es un componente de bajo coste y alto impacto visual. Debe conservarse como componente reutilizable de "banda de mensaje" (ver C-09).

---

### H-03 · BLOQUE PROCESO CON VÍDEO

| Campo | Valor |
|---|---|
| Orden | 3 |
| Objetivo | Storytelling de producto/artesanía mediante vídeo |
| Nodo | div.section > div.base-container > div.w-layout-grid.video-content |

**Estructura OBSERVED (DOM)**
~~~
div.section
  div.base-container.w-container
    div.w-layout-grid.video-content
      div.video
        a.lightbox-link.w-inline-block.w-lightbox   (miniatura + icono de play)
      div.content-video
        h2                     "The process of making an original pizza"
        p.mt-20._w-90-desctop  (párrafo de apoyo)
~~~

| Propiedad | Valor | Etiqueta |
|---|---|---|
| Layout | CSS Grid de 2 columnas (vídeo izquierda, texto derecha) | OBSERVED (DOM + rendered) |
| H2 | Cormorant Infant 50 px / 400 / uppercase / **#cb6037** | OBSERVED (CSS) |
| Párrafo | Libre Franklin 18 px / #707070 / line-height 1.5em; ancho limitado al 90 % en pantallas ≥1440 (clase ._w-90-desctop) | OBSERVED (CSS) |
| Separación título-párrafo | 20 px (.mt-20) | OBSERVED (CSS) |
| Icono de play | Glifo de Font Awesome (familia "Fa solid 900" cargada en el sitio) superpuesto sobre la miniatura | OBSERVED (CSS) |
| Interacción | Clic en a.lightbox-link abre el **lightbox nativo de Webflow** en overlay a pantalla completa con el vídeo. Cierre con la X o con Escape | OBSERVED (DOM) + INFERRED (comportamiento estándar w-lightbox) |
| Fuente del vídeo | **NOT VERIFIED**: no se pudo determinar si el vídeo es autoalojado o embebido de un proveedor externo. No inventar la implementación |
| Responsive ≤991 | INFERRED: el grid pasa a 1 columna, vídeo arriba y texto debajo |

---

### H-04 · NUESTRA CARTA — LISTA DE PRECIOS DINÁMICA

| Campo | Valor |
|---|---|
| Orden | 4 |
| Objetivo | Escaparate de producto en formato "carta de restaurante" (lista de precios, no rejilla de fichas) |
| Nodo | div (sin clase) que contiene div.background-light |

**Estructura OBSERVED (DOM)**
~~~
div
  div
    div.base-container.w-container
      img                                  (imagen ancha superior)
  div.background-light                     (bloque con fondo claro)
    div.base-container.w-container
      div.our-menu
        div.left-menu-content
          h6.h6-libre-franklin  "SPECIAL TASTE"
          h2                    "OUR MENU"
          p.mt-20               (párrafo introductorio)
        div.price-menu
          div.w-dyn-list
            div.collection-list-menu-pizza.home-2.w-dyn-items
              div.w-dyn-item  x8
                div.name-price-wrapper
                  a.menu-price   (nombre del plato)
                  div.price      (precio)
                div.type         (categoría)
~~~

**Contenido real OBSERVED (DOM)** — 8 ítems, con nombre / precio / categoría:

| # | Nombre | Precio | Categoría |
|---|---|---|---|
| 1 | MARGHERITA | $ 11.99 USD | Vegeterian |
| 2 | СALZONE | $ 13.99 USD | Meat |
| 3 | PEPPERONI | $ 12.99 USD | Meat |
| 4 | HAWAIIAN | $ 12.99 USD | Meat |
| 5 | TRIPLE MUSHROOM | $ 12.99 USD | Vegeterian |
| 6 | MEAT FEAST | $ 12.99 USD | Meat |
| 7 | QUATTRO FORMAGGI | $ 12.99 USD | Vegeterian |
| 8 | TONNO | $ 12.99 USD | Fish |

**Hallazgo estructural crítico OBSERVED (DOM):** la lista está construida sobre un **CMS Collection List de Webflow** (w-dyn-list / w-dyn-items / w-dyn-item). No es contenido estático. Esto confirma que en el proyecto destino los productos deben venir de una **fuente de datos**, no estar hardcodeados. Además el mismo tipo de colección alimenta la página /menu-2, lo que implica **una única entidad Producto compartida entre ambas páginas**.

**Diferencia clave frente a /menu-2 (muy importante) OBSERVED (DOM):**

| Aspecto | Home (H-04) | Menu (M-03) |
|---|---|---|
| Imagen por ítem | **NO** | **SÍ** (img.image-13) |
| Categoría visible por ítem | **SÍ** (div.type) | **NO** (la categoría es la pestaña) |
| Botón de acción por ítem | **NO** | **SÍ** ("Order", a.link-2) |
| Filtro/pestañas | **NO** | **SÍ** (3 pestañas) |
| Nº de ítems | 8 (una sola lista) | 8 / 8 / 7 (una lista por pestaña) |
| Formato visual | Lista de dos columnas tipo carta | Rejilla de fichas con foto |

Es decir: **el mismo dato se renderiza con dos variantes de componente distintas**. Esto es la justificación directa del componente C-05 con variantes (ver sección 4).

**Tipografía y color OBSERVED (CSS)**

| Elemento | Familia | Tamaño | Peso | Color | Transform |
|---|---|---|---|---|---|
| h6.h6-libre-franklin ("SPECIAL TASTE") | Libre Franklin | 20 px (18 px ≤991) | 500 | #1a1a1a | uppercase, ls .1em |
| h2 ("OUR MENU") | Cormorant Infant | 50 / 42 / 34 px | 400 | **#cb6037** | uppercase |
| p.mt-20 | Libre Franklin | 18 px | 400 | #707070 | — |
| a.menu-price (nombre) | Libre Franklin | 18 px | — | **#000** | uppercase |
| div.price (precio) | Libre Franklin | 18 px | 500 | **#cb6037** | — |
| div.type (categoría) | Libre Franklin | INFERRED 14–16 px | — | INFERRED gris secundario | — |

**Fondos y espaciado OBSERVED (CSS)**
- El bloque de la carta se apoya sobre .background-light, que usa el token --primary-light **#f5f0ec** (INFERRED por el nombre del token y el aspecto renderizado; el token existe con certeza — OBSERVED (CSS)).
- El nodo .our-menu es un layout de 2 columnas: bloque de título a la izquierda, lista a la derecha. OBSERVED (rendered).
- La imagen superior desborda visualmente sobre el bloque claro. OBSERVED (rendered).

**Interacciones OBSERVED (DOM) / NOT VERIFIED**
- El nombre del plato es un enlace (a.menu-price). **NOT VERIFIED**: destino real del enlace (¿ficha de producto?). No inventar la página de detalle; documentarla como dependencia.
- **No existe botón de añadir al carrito en Home.** OBSERVED (DOM). Consecuencia directa: desde /home-2 es imposible ejercitar el flujo de compra.
- Hover sobre el ítem: **no se declara ningún estado hover específico para .menu-price ni para .w-dyn-item en el CSS**. OBSERVED (CSS). RECOMMENDED: añadir un hover discreto (subrayado o cambio a color acento) por affordance.

**Responsive**

| Breakpoint | Comportamiento | Etiqueta |
|---|---|---|
| ≥ 992 px | 2 columnas: título / lista. La lista a su vez muestra los ítems en 2 columnas | OBSERVED (rendered) |
| ≤ 991 px | INFERRED: título arriba a ancho completo, lista debajo | INFERRED |
| ≤ 767 px | INFERRED: lista a 1 columna, nombre y precio en la misma fila con línea de puntos o espacio flexible | INFERRED |

---

### H-05 · SERVICIO Y CIFRAS

| Campo | Valor |
|---|---|
| Orden | 5 |
| Objetivo | Prueba social cuantitativa + refuerzo de propuesta de servicio |
| Nodo | div.section.padding-home-2 |

**Estructura OBSERVED (DOM)**
~~~
div.section.padding-home-2
  div.base-container.w-container
    div.w-layout-grid.service-wrapper
      img.pasta-img
      div.about-service
        h6.h6-libre-franklin  "about service"
        h2                    "OUR EXCELLENT SERVICE"
        p.mt-20               (párrafo)
        div.w-layout-grid.grid-2-columns
          div   -> "20k+"  /  "Satisfied Customers"
          div   -> "4k+"   /  "Successful orders"
~~~

| Propiedad | Valor | Etiqueta |
|---|---|---|
| Layout | Grid de 2 columnas: imagen a la izquierda, contenido a la derecha | OBSERVED (DOM + rendered) |
| Cifra (.number) | Libre Franklin, **38 px**, peso 500, color **#cb6037** | OBSERVED (CSS) |
| Etiqueta de la cifra | Libre Franklin 18 px, #707070 | OBSERVED (CSS) |
| Nº de estadísticas | **Exactamente 2** | OBSERVED (DOM) |
| Padding de sección | Clase específica .padding-home-2 (sobrescribe el padding estándar de .section) | OBSERVED (CSS) |
| Animación de conteo | **NOT VERIFIED**: no se detectó un contador animado en IX2. Las cifras parecen texto estático | OBSERVED (IX2, ausencia) |
| Interacción | Ninguna | OBSERVED (DOM) |
| Responsive ≤991 | INFERRED: grid a 1 columna, imagen arriba; las 2 estadísticas se mantienen lado a lado |

---

### H-06 · GALERÍA MARQUEE (CINTA INFINITA)

| Campo | Valor |
|---|---|
| Orden | 6 |
| Objetivo | Mostrar producto/ambiente de forma continua y dinámica sin exigir interacción |
| Nodo | div.section.without-bottom-spacing |

**Estructura OBSERVED (DOM)**
~~~
div.section.without-bottom-spacing
  div.base-container.w-container
    h2   "GALLERY"
  div
    div.main-wrapper-1
      div.scroller
        div.track-horizontal-1      (fila 1 de imágenes)
    div.main-wrapper-2
      div.scroller
        div.track-horizontal-2      (fila 2 de imágenes)
~~~

| Propiedad | Valor | Etiqueta |
|---|---|---|
| Nº total de imágenes en la sección | **14** | OBSERVED (DOM) |
| Nº de pistas | **2** (track-horizontal-1 y track-horizontal-2) | OBSERVED (DOM) |
| Movimiento | Desplazamiento horizontal continuo tipo marquee, ejecutado por interacción de Webflow sobre las pistas | OBSERVED (IX2) |
| Dirección | INFERRED: pistas en direcciones opuestas (patrón habitual de este layout de dos filas) — **requiere validación visual en desktop real** |
| Bucle | Continuo e infinito; las imágenes se duplican dentro de la pista para lograr el bucle sin salto | INFERRED (patrón estándar) |
| Título | H2 "GALLERY": Cormorant Infant 50 px, peso 400, uppercase, color **#cb6037** | OBSERVED (CSS) |
| Padding | 80 px arriba, **0 abajo** (.without-bottom-spacing), lo que hace que la galería quede pegada a la sección siguiente | OBSERVED (CSS) |
| Desbordamiento | El contenedor .scroller recorta horizontalmente (overflow oculto); las pistas exceden el ancho del viewport a propósito | OBSERVED (rendered) |
| Interacción del usuario | **Ninguna**: no hay flechas, ni arrastre, ni pausa al pasar el ratón declarada en CSS | OBSERVED (DOM + CSS) |
| Accesibilidad | **Problema conocido**: animación infinita sin control de pausa. RECOMMENDED: respetar prefers-reduced-motion y ofrecer pausa al enfocar/hover (ver NFR-006) |
| Responsive | OBSERVED (rendered ≤991): la cinta se mantiene; las imágenes reducen su altura. INFERRED: en móvil conviene reducir a una sola pista para aligerar peso |

---

### H-07 · TESTIMONIOS (SLIDER)

| Campo | Valor |
|---|---|
| Orden | 7 |
| Objetivo | Prueba social cualitativa con rostro, nombre y cargo |
| Nodo | div.section > div.base-container.strech > div.slider-reviews.w-slider |

**Estructura OBSERVED (DOM)**
~~~
div.section
  div.base-container.strech.w-container
    h2.mb--40._w-50-tablet   "WHAT OUR CLIENTS SAY"
    div.slider-reviews.w-slider
      div.mask-home-2.w-slider-mask
        div.slide-reviews.w-slide            x6   (la 3ª lleva además .last-item)
          div.block-clients
            div.about-client
              img.client-img                 (retrato circular)
              div
                div.name-clients             (nombre)
                div.position-client          (cargo)
            p                                (texto del testimonio)
      div.w-slider-arrow-left    x1
      div.w-slider-arrow-right   x1
      div.w-slider-nav           x1
~~~

**Configuración EXACTA del slider OBSERVED (DOM, atributos data del componente Webflow)**

| Parámetro | Valor | Significado |
|---|---|---|
| animation | slide | Transición por deslizamiento horizontal |
| duration | 500 | 500 ms de transición |
| delay | 4000 | 4000 ms entre diapositivas **si hubiera autoplay** |
| autoplay | **false** | **NO avanza solo.** Avance exclusivamente manual |
| infinite | **true** | Bucle infinito en ambas direcciones |
| disable-swipe | **false** | **Swipe táctil habilitado** |
| hide-arrows | false | Flechas siempre visibles |
| nav-spacing | 3 | Separación de los puntos de paginación |
| autoplay-limit | 0 | Sin límite (irrelevante al estar autoplay desactivado) |

**Nº de diapositivas OBSERVED (DOM): 6.** Personas: Floyd Miles (Сook), Leslie Alexander (Manager), Jane Cooper (Tester), Jenk Rocks (Designer), Karl Gork (Manager), Katia Tank (Tester). Los textos de los testimonios tienen **longitud desigual** (entre 3 y 5 líneas), lo que en la referencia produce tarjetas de altura variable — punto a resolver explícitamente en la implementación (INFERRED: igualar alturas con align-items stretch).

**Tipografía y color OBSERVED (CSS)**

| Elemento | Familia | Tamaño | Peso | LH | Color |
|---|---|---|---|---|---|
| h2 "WHAT OUR CLIENTS SAY" | Cormorant Infant | 50 / 42 / 34 px | 400 | 1em | #cb6037 |
| .name-clients | Libre Franklin | INFERRED 20–22 px | 500 | — | #1a1a1a |
| .position-client | Libre Franklin | 18 px | 500 | 1.5em | INFERRED gris/acento |
| p del testimonio | Libre Franklin | 18 px | 400 | 1.5em | #707070 |

**Detalles de layout OBSERVED (CSS)**
- El H2 lleva margen inferior **negativo** de −40 px (clase .mb--40) para solapar el título con la primera diapositiva. Es un recurso de composición deliberado.
- Clase ._w-50-tablet: el título ocupa el 50 % del ancho en ≤991 px y el 80 % centrado en ≤479 px.
- El contenedor usa .strech: flex en columna con align-items: stretch (permite que el slider ocupe todo el ancho disponible).
- img.client-img: retrato pequeño circular. INFERRED: border-radius 50 %.

**Interacciones**

| Trigger | Resultado | Etiqueta |
|---|---|---|
| Clic en flecha izquierda/derecha | Avanza/retrocede una diapositiva con transición slide de 500 ms | OBSERVED (DOM config) |
| Clic en punto de paginación | Salta a esa diapositiva | OBSERVED (DOM) |
| Swipe táctil | Habilitado | OBSERVED (DOM config) |
| Autoplay | **Desactivado** — no confundir con el delay de 4000 ms | OBSERVED (DOM config) |
| Teclado | **NOT VERIFIED** — el componente nativo de Webflow gestiona focus, pero no se comprobó. RECOMMENDED: garantizar navegación con flechas del teclado y foco visible |

**Responsive**

| Breakpoint | Diapositivas visibles | Etiqueta |
|---|---|---|
| ≥ 992 px | INFERRED 2–3 simultáneas (el slide no ocupa el 100 % del mask) | INFERRED |
| ≤ 991 px | OBSERVED (rendered): menos diapositivas por vista, título al 50 % de ancho | OBSERVED |
| ≤ 479 px | INFERRED 1 diapositiva a ancho completo; título al 80 % centrado | OBSERVED (CSS) para el título / INFERRED para el slide |

---

### H-08 · DELIVERY & PICKUP

| Campo | Valor |
|---|---|
| Orden | 8 |
| Objetivo | Conversión secundaria hacia el servicio de entrega/recogida |
| Nodo | div.footer-2 > div.delivery-wrapper |

**Estructura OBSERVED (DOM)**
~~~
div.delivery-wrapper
  div.base-container.w-container
    div.w-layout-grid.footer-delivery
      div.content-footer
        h2                       "FASTEST DELIVERY & EASY PICKUP"
        p.mt-20                  (párrafo de apoyo)
        a.primary-button.mt-40   "Explore Our Delivery"
      img.delivery-img
~~~

| Propiedad | Valor | Etiqueta |
|---|---|---|
| Layout | Grid de 2 columnas: texto izquierda / imagen derecha | OBSERVED (DOM + rendered) |
| H2 | Cormorant Infant 50 / 42 / 34 px, peso 400, uppercase, **#cb6037** | OBSERVED (CSS) |
| Párrafo | Libre Franklin 18 px, #707070, LH 1.5em, margen superior 20 px | OBSERVED (CSS) |
| CTA | .primary-button con .mt-40, que en este contexto resuelve a **margin-top: 30 px** (no 40) | OBSERVED (CSS) — detalle fácil de implementar mal |
| Destino del CTA | Página de delivery/reserva (fuera de alcance) | OBSERVED (DOM) — documentado solo como **dependencia** |
| Pertenencia | Vive dentro de div.footer-2, no es una sección independiente | OBSERVED (DOM) |
| Reutilización | **Idéntico en /home-2 y /menu-2** | OBSERVED (DOM en ambas páginas) |
| Interacción | Solo el hover del botón (fondo → blanco, texto → #cb6037) | OBSERVED (CSS) |
| Responsive ≤991 | INFERRED: 1 columna, imagen debajo del texto |

---

### H-09 · NEWSLETTER

| Campo | Valor |
|---|---|
| Orden | 9 |
| Objetivo | Captación de correo electrónico |
| Nodo | div.footer-2 > div.black-background-footer > div.subscribe |

**Estructura OBSERVED (DOM)**
~~~
div.subscribe
  h4                          "SUBSCRIBE TO NEWSLETTER"
  div.form-block-footer.w-form
    form.form-footer
      input.text-field.w-input          (email)
      input.primary-button.footer-button.w-button   (submit)
    div.w-form-done  -> mensaje de éxito
    div.w-form-fail  -> mensaje de error
~~~

**Especificación exacta del campo OBSERVED (DOM)**

| Atributo | Valor |
|---|---|
| type | email |
| name | Email-2 |
| placeholder | Email |
| required | **true** |
| maxlength | 256 |
| Valor del botón submit | **Submit** |

| Propiedad de estilo | Valor | Etiqueta |
|---|---|---|
| H4 del bloque | Cormorant Infant 30 px (26 px ≤767), peso **700**, uppercase, **#cb6037** | OBSERVED (CSS) |
| .text-field | Libre Franklin 14 px, peso 400, color de texto **#fff** | OBSERVED (CSS) |
| Fondo del bloque | Fondo negro/oscuro del pie (.black-background-footer) | OBSERVED (rendered) |
| Botón | .primary-button + .footer-button (variante de tamaño/posición dentro del formulario) | OBSERVED (DOM) |
| Layout del formulario | Campo y botón en línea (input + submit adyacentes) | OBSERVED (rendered) |

**Estados del formulario OBSERVED (DOM)**

| Estado | Comportamiento |
|---|---|
| Éxito | Se muestra div.w-form-done con mensaje de agradecimiento y **se oculta el formulario** |
| Error | Se muestra div.w-form-fail con mensaje de error |
| Validación | Nativa del navegador (required + type=email). **No hay validación en vivo ni mensajes de campo personalizados** — OBSERVED (DOM) |
| Estado de carga | **NOT VERIFIED**. RECOMMENDED: añadir estado "enviando" con botón deshabilitado |
| Backend | **NOT VERIFIED**: el envío lo gestiona la infraestructura de formularios de Webflow. En el proyecto destino requiere decisión de integración (ver sección 7.11) |
| Doble opt-in / consentimiento RGPD | **No existe casilla de consentimiento** — OBSERVED (DOM). RECOMMENDED **obligatorio** en el proyecto destino por cumplimiento legal en la UE |

---

### H-10 · PIE DE PÁGINA

| Campo | Valor |
|---|---|
| Orden | 10 |
| Objetivo | Navegación secundaria, datos de contacto, marca y legal |
| Nodo | div.footer-2 > div.black-background-footer > (div.footer-wrapper + div.footer-rights-wrapper) |

**Estructura OBSERVED (DOM)**
~~~
div.footer-wrapper
  div.footer-brand-wrapper
    a.footer-brand.w-nav-brand > img.footer-logo
    p.footer-brand-description        (descripción corta de marca)
    div.footer-social-icons-wrapper
      a.footer-social-icon   x3  (el 3º con clase .fa-solid)
      a.footer-social-icon.last-child
  div.div-block-4
    div.footer-links-wrapper
      a.footer-link  "Home" | "About Us" | "Our Menu" | "Shop" | "Blog"
    div.div-block-3
      div.address        "8502 Preston Rd. Inglewood, Maine 98380"
      div.div-block-5
        a.phone-number             "(406) 555-0120"
        a.phone-number.lasr-child  "(270) 555-0117"
div.footer-rights-wrapper
  -> "© Italy 128. All Rights Reserved." + enlace "Licensing"
  -> "Webflow Templates by 128.digital."
~~~

| Propiedad | Valor | Etiqueta |
|---|---|---|
| Fondo | Negro/oscuro | OBSERVED (rendered) |
| Color de texto | **#fff**, 18 px, line-height 1.5em | OBSERVED (CSS) |
| Iconos sociales | **4**, implementados con Font Awesome (familia "Fa solid 900" cargada) | OBSERVED (DOM + CSS) |
| Enlaces de navegación | **5**: Home, About Us, Our Menu, Shop, Blog | OBSERVED (DOM) |
| Teléfonos | 2, como enlaces (a.phone-number) | OBSERVED (DOM) |
| Dirección | Texto plano, no enlazada a mapa | OBSERVED (DOM) |
| Franja de derechos | Copyright + enlace "Licensing" + crédito de la plantilla | OBSERVED (DOM) |
| Créditos de plantilla | "Webflow Templates by 128.digital", "Powered by Webflow" y div.promotion-labels-wrapper — **NO REPLICAR**, son artefactos comerciales de Webflow | OBSERVED (DOM) |
| Hover de enlaces | **No declarado explícitamente en CSS** para .footer-link | OBSERVED (CSS). RECOMMENDED: añadir hover a color acento |
| Reutilización | **Idéntico en /home-2 y /menu-2** | OBSERVED (DOM) |
| Responsive ≤991 | INFERRED: las dos columnas se apilan; los enlaces pasan a lista vertical |

---

### 1.11 AUSENCIAS RELEVANTES EN HOME (no inventar)

| Elemento | Estado | Etiqueta |
|---|---|---|
| Botón "añadir al carrito" en cualquier producto de Home | **No existe** | OBSERVED (DOM) |
| Precios con descuento / precio tachado | **No existe** | OBSERVED (DOM) |
| Badges de producto (nuevo, oferta, agotado) | **No existe** | OBSERVED (DOM) |
| Indicador de stock o disponibilidad | **No existe** | OBSERVED (DOM) |
| Buscador | **No existe** | OBSERVED (DOM) |
| Filtros en Home | **No existe** | OBSERVED (DOM) |
| Banner de cookies | **No aparece** | OBSERVED (rendered) |
| Botón "volver arriba" | **No existe** | OBSERVED (DOM) |
| Mapa incrustado | **No existe** | OBSERVED (DOM) |
| Selector de cantidad | **No existe** | OBSERVED (DOM) |

---

## 2. MENU — ANÁLISIS COMPLETO (/menu-2)

### 2.0 Mapa vertical de la página — OBSERVED (DOM)

| ID | Nodo raíz | Nombre funcional |
|---|---|---|
| M-00 | div.navbar.w-nav | **Idéntico a H-00** (mismo componente compartido) |
| M-01 | div.section-banner.about-us | Hero de página interior |
| M-02 | div (sin clase) > img.banner-img-about-us | Banda de imagen a ancho completo |
| M-03 | div.section | **Núcleo de la página:** título + pestañas de categoría + rejilla de productos |
| M-04 | div.section.without-top-spacing | Testimonio destacado (pull quote), formato distinto al de Home |
| M-05 | div.footer-2 > div.delivery-wrapper | **Idéntico a H-08** |
| M-06 | div.footer-2 > div.subscribe | **Idéntico a H-09** |
| M-07 | div.footer-2 > footer-wrapper + rights | **Idéntico a H-10** |

**Conclusión estructural OBSERVED (DOM):** /menu-2 solo aporta **cuatro** bloques propios (M-01 a M-04). Todo lo demás es reutilización literal de componentes de Home. La página es notablemente más corta: 8 bloques de Home frente a 4 propios de Menu.

---

### M-01 · HERO DE PÁGINA INTERIOR

**Estructura OBSERVED (DOM)**
~~~
div.section-banner.about-us
  div.base-container.w-container
    div.left-title-banner-wrapper.menu-banner
      h6.h6-libre-franklin.primary  "MENU"
      h1                            "OUR FOOD"
      p.mt-20._w-55                 (párrafo introductorio)
~~~

| Propiedad | Valor | Etiqueta |
|---|---|---|
| padding-top | 180 px base · **200 px ≥1280** · 140 px ≤991 | OBSERVED (CSS) |
| padding-bottom | 80 px | OBSERVED (CSS) |
| Eyebrow "MENU" | Libre Franklin 20 px (18 px ≤991), peso 500, uppercase, ls .1em, **#cb6037** | OBSERVED (CSS) |
| H1 "OUR FOOD" | Cormorant Infant **70 px** (52 px ≤991, 46 px ≤767), peso 700, LH 1em, uppercase, #1a1a1a | OBSERVED (CSS) |
| Párrafo | Libre Franklin 18 px, #707070; ancho **55 %** base → 45 % ≥1280 → 72 % ≤991 → 100 % ≤767 (clase ._w-55) | OBSERVED (CSS) |
| Alineación | Izquierda (.left-title-banner-wrapper) | OBSERVED (DOM + rendered) |
| Diferencia con el hero de Home | Aquí el H1 es de **una sola línea y un solo color**; no hay span de acento, no hay botones, no hay imagen dentro de la sección | OBSERVED (DOM) |

**Patrón reutilizable INFERRED:** existe un componente "hero de página interior" (eyebrow + H1 + párrafo, sin CTA) distinto del hero de portada. Es el que debe usarse para cualquier página de catálogo del proyecto destino.

---

### M-02 · BANDA DE IMAGEN A ANCHO COMPLETO

| Propiedad | Valor | Etiqueta |
|---|---|---|
| Nodo | div sin clase que contiene únicamente img.banner-img-about-us | OBSERVED (DOM) |
| Contenido | Una sola imagen, sin texto, sin overlay, sin CTA | OBSERVED (DOM) |
| Función | Separador visual entre el hero y la carta | INFERRED |
| Interacción | Ninguna | OBSERVED (DOM) |
| Animación | Efecto de entrada al hacer scroll | OBSERVED (IX2) |
| Responsive | INFERRED: mantiene ancho completo con recorte de altura en móvil |

---

### M-03 · CARTA CON PESTAÑAS DE CATEGORÍA (NÚCLEO FUNCIONAL DE LA PÁGINA)

Esta es la sección más importante de todo el análisis para el proyecto destino.

**Estructura OBSERVED (DOM)**
~~~
div.section
  div.base-container.w-container
    div.title-wrapper
      h2                  <span.dark-text>"WHAT'S"</span> <br> "ON THE MENU"
      p.mt-20._w-65       (párrafo introductorio largo)
    div.tabs-3.w-tabs
      div.tabs-menu-3.w-tab-menu
        a.tab-menu.w-inline-block.w-tab-link.w--current > div "Pizza"
        a.tab-menu.w-inline-block.w-tab-link            > div "Steak"
        a.tab-menu.w-inline-block.w-tab-link            > div "Pasta"
      div.tabs-content-3.w-tab-content
        div.tab-pane-pizza.w-tab-pane.w--tab-active
          div.w-dyn-list > div.collection-list-3.w-dyn-items   (8 ítems)
        div.w-tab-pane
          div.w-dyn-list > div.collection-list-3.w-dyn-items   (8 ítems)
        div.w-tab-pane
          div.w-dyn-list > div.collection-list-3.w-dyn-items   (7 ítems)
~~~

**Título con doble color OBSERVED (DOM + CSS):** el H2 combina un span con clase .dark-text ("WHAT'S", en oscuro) y el resto en el color por defecto de h2 (**#cb6037**), separados por un br. Es el mismo recurso del hero de Home pero invertido: aquí la primera línea es oscura y la segunda es de acento.

| Elemento | Familia | Tamaño | Peso | Color | Etiqueta |
|---|---|---|---|---|---|
| span.dark-text ("WHAT'S") | Cormorant Infant | 50 / 42 / 34 px | 400 | #1a1a1a | OBSERVED (CSS) |
| h2 resto ("ON THE MENU") | Cormorant Infant | 50 / 42 / 34 px | 400 | **#cb6037** | OBSERVED (CSS) |
| p.mt-20._w-65 | Libre Franklin | 18 px | 400 | #707070 | ancho **65 %** base → 90 % ≤991 → 100 % ≤767 — OBSERVED (CSS) |

#### M-03.1 Pestañas de categoría — comportamiento EXACTO

| Aspecto | Comportamiento | Etiqueta |
|---|---|---|
| Nº de categorías | **Exactamente 3**: Pizza, Steak, Pasta | OBSERVED (DOM) |
| Categoría inicial | **Pizza** (lleva la clase w--current y su panel lleva w--tab-active) | OBSERVED (DOM) |
| Trigger | Clic en la pestaña | OBSERVED (tested) |
| Resultado | Se cambia la clase w--current a la pestaña pulsada y w--tab-active al panel correspondiente; el contenido del panel se sustituye | OBSERVED (tested — se hizo clic en "Steak" y el contenido cambió) |
| **Cambio de URL** | **NO.** La URL permanece en /menu-2 sin hash ni query. **No hay estado enlazable ni compartible** | OBSERVED (tested) — hallazgo crítico |
| Recarga de datos | **No hay petición de red**: los tres paneles ya están renderizados en el DOM desde la carga inicial y solo se alternan por CSS/clase | OBSERVED (DOM) |
| Transición | Transición nativa del componente w-tabs de Webflow (fundido cruzado) | INFERRED |
| Color del texto inactivo | **#222** | OBSERVED (CSS) |
| Color/estilo del activo | INFERRED: color acento **#cb6037** y/o subrayado. El selector w--current existe con certeza | INFERRED |
| Navegación por teclado | Componente nativo de Webflow (los tabs implementan roles ARIA). **NOT VERIFIED** en esta captura | NOT VERIFIED |
| Contador de productos por categoría | **No se muestra** | OBSERVED (DOM) |
| Opción "Todos" | **No existe** | OBSERVED (DOM) |
| Filtros adicionales (precio, alérgenos, orden) | **No existen** | OBSERVED (DOM) |
| Paginación / "cargar más" | **No existe**: se muestran todos los ítems de la categoría de golpe | OBSERVED (DOM) |

**Distribución real de ítems OBSERVED (DOM): Pizza = 8, Steak = 8, Pasta = 7.** Es decir, el número de ítems por categoría **es variable**; la rejilla debe tolerar filas incompletas.

#### M-03.2 Ficha de producto (variante rejilla)

**Estructura OBSERVED (DOM)**
~~~
div.w-dyn-item
  div.div-block-46
    a.link-block-3.w-inline-block
      img.image-13                       (foto del producto)
    div.name-price-wrapper.menu-2
      div.div-block-45
        a.menu-price   "Margherita"      (nombre, enlace)
        div.price      "$ 11.99 USD"     (precio)
      a.link-2         "Order"           (CTA)
~~~

| Elemento | Especificación | Etiqueta |
|---|---|---|
| Imagen | img.image-13 dentro de un enlace envolvente | OBSERVED (DOM) |
| Nombre | a.menu-price · Libre Franklin 18 px · color **#000** · **uppercase** · es un enlace | OBSERVED (CSS + DOM) |
| Precio | div.price · Libre Franklin 18 px · peso 500 · **#cb6037** · formato literal "$ 11.99 USD" (símbolo, espacio, importe, espacio, código de divisa) | OBSERVED (CSS + DOM) |
| CTA | a.link-2 con texto **"Order"** · fondo **#cb6037** · texto #fff · borde 1 px sólido #cb6037 · border-radius | OBSERVED (CSS) |
| Categoría visible en la ficha | **NO** (a diferencia de Home) | OBSERVED (DOM) |
| Descripción del producto | **NO se muestra** | OBSERVED (DOM) |
| Badges / etiquetas | **NO existen** | OBSERVED (DOM) |
| Selector de cantidad | **NO existe** | OBSERVED (DOM) |
| Indicador de stock | **NO existe** | OBSERVED (DOM) |
| Variantes (tamaño, sabor) | **NO existen** | OBSERVED (DOM) |
| Valoraciones / estrellas | **NO existen** | OBSERVED (DOM) |
| Hover de la ficha | **No hay regla hover declarada para .div-block-46 ni para .image-13** en el CSS | OBSERVED (CSS). RECOMMENDED: elevación sutil y/o zoom de imagen |
| Destino de "Order" | **NOT VERIFIED**: no se pudo determinar si añade al carrito, abre un modal o navega a una página de producto. **PROHIBIDO inventarlo** — ver sección 7 |
| Destino del nombre | **NOT VERIFIED** (probable ficha de producto, fuera de alcance) | NOT VERIFIED |

**Rejilla OBSERVED (rendered a 964 px) / INFERRED**

| Breakpoint | Columnas | Etiqueta |
|---|---|---|
| ≥ 1280 px | INFERRED 4 | INFERRED |
| 992–1279 px | INFERRED 3–4 | INFERRED |
| ≤ 991 px | OBSERVED 2 (verificado visualmente a 964 px) | OBSERVED (rendered) |
| ≤ 767 px | INFERRED 2 | INFERRED |
| ≤ 479 px | INFERRED 1 | INFERRED |

**Advertencia para Opus 5:** el número de columnas en desktop es la única propiedad importante de esta sección que **no** pudo verificarse por la limitación de viewport. Debe tratarse como decisión a validar, no como hecho.

---

### M-04 · TESTIMONIO DESTACADO (PULL QUOTE)

**Estructura OBSERVED (DOM)**
~~~
div.section.without-top-spacing
  div.base-container.w-container
    h6.h6-libre-franklin        "what our clients say"
    div.review
      div.reviews
        img.image-8                       (comilla decorativa izquierda)
        h2.text-align-center              (texto del testimonio, en mayúsculas)
        img.image-9                       (comilla decorativa derecha)
      div.name-position
        h6.h6-libre-franklin.primary      "Darrell Steward"
        div.position-testimonial          "Food Critic"
~~~

| Propiedad | Valor | Etiqueta |
|---|---|---|
| Formato | **Un único testimonio estático destacado**, NO un slider | OBSERVED (DOM) |
| Diferencia con H-07 | Home usa slider de 6 con retrato circular; Menu usa cita única grande centrada con comillas decorativas | OBSERVED (DOM) |
| Texto de la cita | Marcado como **h2** (no como blockquote ni p): Cormorant Infant 50 / 42 / 34 px, peso 400, uppercase, **#cb6037**, centrado | OBSERVED (CSS + DOM) |
| Comillas | Dos imágenes decorativas (img.image-8, img.image-9) flanqueando la cita | OBSERVED (DOM) |
| Autor | h6.h6-libre-franklin.primary → Libre Franklin 20 px (18 px ≤991), peso 500, uppercase, ls .1em, **#cb6037** | OBSERVED (CSS) |
| Cargo | div.position-testimonial → 18 px, peso 500, LH 1.5em | OBSERVED (CSS) |
| Espaciado | .without-top-spacing → padding-top 0 (se pega a la sección anterior); padding-bottom 80 px (120 px ≥1280, 60 px ≤767) | OBSERVED (CSS) |
| Interacción | **Ninguna** | OBSERVED (DOM) |
| Animación | Entrada al hacer scroll | OBSERVED (IX2) |
| Semántica | **Problema de accesibilidad**: se usa h2 para una cita, lo que introduce un encabezado espurio en el esquema del documento. RECOMMENDED: usar blockquote + figcaption con estilo equivalente | RECOMMENDED |

---

### 2.5 · M-05 / M-06 / M-07 — BLOQUES REUTILIZADOS

Los tres son **exactamente los mismos nodos** que H-08, H-09 y H-10, con la misma estructura, textos, estilos y comportamiento. OBSERVED (DOM en ambas páginas).

**Implicación directa para el plan de desarrollo:** delivery, newsletter y footer deben construirse **una sola vez** como un macro-componente de pie compartido, y ambas páginas lo consumen sin variantes.

### 2.6 AUSENCIAS RELEVANTES EN MENU (no inventar)

| Elemento | Estado | Etiqueta |
|---|---|---|
| Buscador de productos | No existe | OBSERVED (DOM) |
| Ordenación (precio, nombre, popularidad) | No existe | OBSERVED (DOM) |
| Filtros por alérgenos / dieta | No existe | OBSERVED (DOM) |
| Paginación o scroll infinito | No existe | OBSERVED (DOM) |
| Estado "sin resultados" | No existe (todas las pestañas tienen ítems) | OBSERVED (DOM) |
| Estado de carga / skeleton | No existe (contenido preinsertado) | OBSERVED (DOM) |
| Vista lista/rejilla conmutable | No existe | OBSERVED (DOM) |
| Comparador o favoritos | No existe | OBSERVED (DOM) |
| Descripción del producto en la ficha | No existe | OBSERVED (DOM) |
| Migas de pan | No existe | OBSERVED (DOM) |

---

## 3. DESIGN SYSTEM

Todos los valores de esta sección proceden de la hoja de estilos publicada del sitio. Salvo indicación expresa, son **OBSERVED (CSS)** — valores exactos, no estimaciones.

### 3.1 Tokens de color (variables CSS reales declaradas en :root)

| Token | Valor exacto | Uso observado |
|---|---|---|
| --text-dark | **#1a1a1a** | Color base del body, H1, H3, H5, H6 |
| --primary | **#cb6037** | **Color de acento del sistema.** H2, H4, precios, eyebrows destacados, fondo de botón primario, cifras |
| --primary-light | **#f5f0ec** | Fondo cálido claro (bloque de la carta en Home) |
| --white | white | Textos sobre fondo oscuro, fondo de botón secundario |
| --light-gray | **#f9f9fa** | Fondos alternos neutros |
| --dark-gray | **#afafaf** | Elementos deshabilitados / apoyo |
| --white-50 | **#ffffff80** | Blanco al 50 % de opacidad (overlays) |
| --gray | **#e9e9e9** | Bordes y separadores |
| --dark-gray-50 | **#afafaf80** | Gris al 50 % |

**Colores adicionales usados fuera de variables (OBSERVED, CSS):**

| Color | Uso |
|---|---|
| **#707070** | Color de TODO el texto de párrafo (p). Es el gris de lectura del sistema |
| **#000** | Enlaces base, .nav-link, nombre de producto (.menu-price) |
| **#222** | Texto de pestaña inactiva |
| **#fff** | Todo el texto del pie de página |

**Observaciones críticas sobre el sistema de color:**
1. La paleta es **monocromática de acento**: un solo color de marca (#cb6037, terracota) sobre neutros cálidos. No hay colores secundarios ni terciarios. INFERRED: es un sistema deliberadamente austero, fácil de reteñir para otra marca.
2. **No existen colores semánticos** (éxito, error, aviso, información) declarados en el sistema. OBSERVED (CSS, ausencia). RECOMMENDED: el proyecto destino debe añadirlos, ya que un e-commerce real los necesita (stock, errores de formulario, confirmaciones).
3. **No existe modo oscuro.** OBSERVED (CSS, ausencia).
4. Los tokens de opacidad usan notación hexadecimal de 8 dígitos (#ffffff80).

### 3.2 Tipografía

**Familias cargadas OBSERVED (CSS):**

| Familia | Pesos cargados | Rol |
|---|---|---|
| **Cormorant Infant** | 300, 400, 500, 600, 700 | **Display / titulares.** Serif de alto contraste. Todos los H1–H6 |
| **Libre Franklin** | 300, 400, 500, 600 | **Texto.** Sans-serif. Body, párrafos, enlaces, botones, precios, formularios |
| Lato | — | Cargada pero sin uso detectado en estas dos páginas |
| "Fa solid 900" | 900 | Font Awesome sólido: icono de play del vídeo e iconos sociales del pie |

**Escala tipográfica completa OBSERVED (CSS):**

| Elemento | Familia | Base (992–1279) | ≥1280 | ≥1440 | ≤991 | ≤767 | Peso | LH | LS | Color | Transform |
|---|---|---|---|---|---|---|---|---|---|---|---|
| body | Libre Franklin | 16 px | = | = | = | = | 400 | 1em | — | #1a1a1a | — |
| h1 | Cormorant Infant | 70 px | 70 px | 72 px* | 52 px | 46 px | 700 | 1em | normal | #1a1a1a | uppercase |
| h2 | Cormorant Infant | 50 px | = | = | 42 px | 34 px | 400 | 1em | normal | **#cb6037** | uppercase |
| h3 | Cormorant Infant | 32 px | 34 px | 36 px | = | 30 px | 400 | 1.2em | — | #1a1a1a | uppercase |
| h4 | Cormorant Infant | 30 px | = | = | = | 26 px | 700 | 1em | — | **#cb6037** | uppercase |
| h5 | Cormorant Infant | 22 px | = | = | = | = | 500 | 1.1em | — | #1a1a1a | uppercase |
| h6 | Cormorant Infant | 20 px | = | = | 18 px** | = | 500 | 1.2em | .1em | #1a1a1a | uppercase |
| p | Libre Franklin | 18 px | = | = | = | = | 400 | 1.5em | — | **#707070** | — |
| a | — | 20 px | = | = | = | = | 500 | 1.5em | — | #000 | — |
| .paragraph-large | Libre Franklin | 20 px | = | = | = | = | 400 | 1.5em | — | #707070 | — |
| .price | Libre Franklin | 18 px | = | = | = | = | 500 | 1.5em | — | **#cb6037** | — |
| .menu-price | Libre Franklin | 18 px | = | = | = | = | — | — | — | #000 | uppercase |
| .number (cifras) | Libre Franklin | 38 px | = | = | = | = | 500 | — | — | **#cb6037** | — |
| .nav-link | Libre Franklin | 20 px | = | = | = | = | 500 | — | — | #000 | — |
| .nav-dropdown-link | Libre Franklin | 18 px | = | = | = | = | 500 | — | — | — | capitalize |
| .position-testimonial | Libre Franklin | 18 px | = | = | = | = | 500 | 1.5em | — | — | — |
| .text-field (input) | Libre Franklin | 14 px | = | = | = | = | 400 | — | — | #fff | — |
| Textos del pie | — | 18 px | = | = | = | = | — | 1.5em | — | #fff | — |

\* mediante la clase .h1-banner-home-2 en pantallas ≥1440 px.
\*\* mediante la clase .h6-libre-franklin, que además **sustituye la familia por Libre Franklin**.

**Reglas tipográficas del sistema (todas OBSERVED, CSS):**
1. **Todos los encabezados van en MAYÚSCULAS** sin excepción.
2. Los encabezados usan line-height **1em** (H1, H2, H4) o 1.2em (H3, H6) — muy ceñido, característico del diseño.
3. **El color por defecto de h2 y h4 es el acento**, no el color de texto. Esto es contraintuitivo y es la causa de que casi todos los titulares de sección aparezcan en terracota. Debe replicarse a nivel de estilos base, no ítem a ítem.
4. Los párrafos siempre 1.5em de interlineado y siempre #707070.
5. La clase modificadora **.h6-libre-franklin** convierte un H6 (serif) en etiqueta sans-serif con tracking amplio: es el "eyebrow" del sistema. Con .primary se tiñe de acento.
6. Los botones son el **único** texto que no va en mayúsculas (text-transform: none explícito).

### 3.3 Sistema de espaciado

| Clase / concepto | Base | ≥1280 | ≤767 | Nota |
|---|---|---|---|---|
| .section (padding vertical) | **80 px** | **120 px** | **60 px** | Ritmo vertical maestro. position: relative |
| .without-top-spacing | padding-top: 0 | = | = | Fusiona con la sección anterior |
| .without-bottom-spacing | padding-bottom: 0 | = | = | Fusiona con la sección siguiente |
| .section-banner (padding-top) | 180 px | 200 px | 140 px (≤991) | Compensa el navbar fijo |
| .section-banner (padding-bottom) | 80 px | 80 px | 60 px | |
| .base-container | max-width **1200 px**, margin 0 auto, padding lateral **15 px**, flex column, align-items center | = | = | Contenedor maestro |
| .base-container.align-start | flex: 1 + align-items: flex-start | = | = | Variante alineada a la izquierda |
| .base-container.strech | flex column + align-items: stretch | = | = | Variante para sliders |
| .mt-20 | margin-top: 20 px | = | = | Separación título→párrafo estándar |
| .mt-40 (sobre .primary-button) | margin-top: **30 px** | = | = | **Ojo: el nombre miente** |
| .mt-40 (sobre .text-align-center) | margin-top: 40 px | **60 px** | = | Mismo nombre, valor distinto según contexto |
| .mb--40 | margin-bottom: **−40 px** | = | = | Solapamiento deliberado (título de testimonios) |

**Escala de ancho por porcentaje (patrón propio de la referencia) OBSERVED (CSS):**

| Clase | Base | ≥1280 | ≥1440 | ≤991 | ≤767 | ≤479 |
|---|---|---|---|---|---|---|
| ._w-55 | 55 % | 45 % | — | 72 % | 100 % | — |
| ._w-65 | 65 % | — | — | 90 % | 100 % | — |
| ._w-90-desctop | — | — | 90 % | — | — | — |
| ._w-50-tablet | — | — | — | 50 % | — | 80 % centrado |

**Lectura del sistema INFERRED:** el ancho de los bloques de texto se controla con clases utilitarias de porcentaje por breakpoint, y la tendencia es **reducir** el ancho en pantallas grandes (55 % → 45 %) para mantener una medida de línea legible. Es una decisión tipográfica correcta que debe conservarse.

### 3.4 Botones

| Variante | Fondo | Texto | Borde | Radio | Padding | LS | Transform | Hover |
|---|---|---|---|---|---|---|---|---|
| .primary-button | **#cb6037** | #fff | 1 px sólido #cb6037 | **5 px** | **14px 30px** | .5 px | none | fondo #fff / texto #cb6037 · transition background-color .3s, color .3s |
| .primary-button-white | #fff | #cb6037 | 1 px sólido #cb6037 | 5 px | 14px 30px | .5 px | none | **no declarado** |
| .secondary-button | transparente | #fff | 1 px sólido #fff | 5 px | 14px 30px | — | none | fondo #fff / texto #cb6037 · **NO se usa en estas dos páginas** |
| .link-2 ("Order") | #cb6037 | #fff | 1 px sólido #cb6037 | sí | (menor que el botón principal) | — | — | INFERRED: mismo patrón de inversión |
| .footer-button | modificador de .primary-button dentro del formulario del pie | | | | | | | |

**Conclusiones OBSERVED (CSS):** un único radio de esquina (5 px), un único padding (14×30 px), una única transición (.3s sobre color y fondo), un único patrón de hover (inversión de fondo y texto). El sistema de botones es **muy pequeño y muy consistente**: 2 variantes reales en uso + 1 mini variante para fichas.

### 3.5 Bordes, radios y sombras

| Concepto | Valor | Etiqueta |
|---|---|---|
| Radio de botones | 5 px | OBSERVED (CSS) |
| Radio de fichas / imágenes | **No se detectó radio en las fichas de producto** | OBSERVED (CSS) |
| Radio del retrato de testimonio | INFERRED 50 % (circular) | INFERRED |
| Grosor de borde estándar | 1 px | OBSERVED (CSS) |
| Color de borde/separador | #e9e9e9 (--gray) | OBSERVED (CSS) |
| **Sombras** | **No se detectó ninguna box-shadow relevante en los componentes de estas dos páginas** | OBSERVED (CSS) |

**Conclusión de estilo INFERRED (evidencia fuerte):** el diseño es **plano, sin sombras y con esquinas casi rectas**. La jerarquía se construye con tipografía, color y espacio en blanco, no con profundidad. Cualquier propuesta de implementación que añada sombras o radios grandes **se desviaría de la referencia**.

### 3.6 Formularios

| Propiedad | Valor | Etiqueta |
|---|---|---|
| .text-field | Libre Franklin 14 px, peso 400, color de texto #fff (sobre el fondo oscuro del pie) | OBSERVED (CSS) |
| Estados focus/error/disabled | **No declarados de forma personalizada** | OBSERVED (CSS, ausencia). RECOMMENDED: definirlos (imprescindible para accesibilidad) |
| Etiquetas (label) | **No existen**; solo placeholder | OBSERVED (DOM). RECOMMENDED: añadir label accesible |
| Mensajes | Bloques de éxito y error a nivel de formulario (w-form-done / w-form-fail) | OBSERVED (DOM) |

### 3.7 Inventario de "primitivas" del sistema

| Primitiva | Existe en la referencia | Etiqueta |
|---|---|---|
| Botón (2 variantes) | Sí | OBSERVED |
| Enlace de navegación | Sí | OBSERVED |
| Dropdown de navegación (+ megamenú) | Sí | OBSERVED |
| Campo de texto | Sí (uno solo: email) | OBSERVED |
| Pestañas | Sí (3 pestañas) | OBSERVED |
| Slider | Sí (uno) | OBSERVED |
| Marquee | Sí (dos pistas) | OBSERVED |
| Lightbox | Sí (vídeo) | OBSERVED |
| Modal (carrito) | Sí | OBSERVED |
| Ficha de producto (2 variantes) | Sí | OBSERVED |
| Badge / etiqueta de estado | **No** | OBSERVED (ausencia) |
| Tooltip | **No** | OBSERVED (ausencia) |
| Acordeón | **No** | OBSERVED (ausencia) |
| Breadcrumb | **No** | OBSERVED (ausencia) |
| Paginación | **No** | OBSERVED (ausencia) |
| Notificación / toast | **No** | OBSERVED (ausencia) |
| Selector de cantidad | **No** | OBSERVED (ausencia) |
| Skeleton / spinner | **No** | OBSERVED (ausencia) |

---

## 4. COMPONENTES REUTILIZABLES

Catálogo derivado del análisis estructural de ambas páginas. Cada componente indica sus datos de entrada, variantes, estados, interacciones y dónde se usa. **Los nombres de componente son propuestas del analista (INFERRED); las estructuras y propiedades son OBSERVED.**

### C-01 · Navbar
| Campo | Detalle |
|---|---|
| Propósito | Navegación global persistente |
| Datos | Logo (imagen), lista de ítems (etiqueta, destino, submenú opcional), teléfono, texto y destino del CTA, estado del carrito |
| Variantes | Ninguna (idéntico en ambas páginas) — OBSERVED |
| Estados | Cerrado / dropdown abierto / drawer móvil abierto / modal de carrito abierto |
| Interacciones | Clic en toggle de dropdown; hover en desktop (INFERRED); apertura y cierre del drawer; apertura del carrito |
| Responsive | ≥992 horizontal · ≤991 hamburguesa + drawer · ≤767 se oculta el CTA |
| Usado en | Home, Menu |

### C-02 · HeroPortada (hero de home)
| Campo | Detalle |
|---|---|
| Propósito | Presentación principal con doble CTA |
| Datos | eyebrow, tituloLinea1, tituloLinea2 (coloreada con acento), parrafo, ctaPrimario {texto, destino}, ctaSecundario {texto, destino}, imagen |
| Variantes | Una sola en la referencia |
| Estados | Animación de entrada al cargar |
| Interacciones | Hover de botones |
| Usado en | Home (H-01) |

### C-03 · HeroInterior (hero de página secundaria)
| Campo | Detalle |
|---|---|
| Propósito | Cabecera de página de contenido |
| Datos | eyebrow, titulo, parrafo, anchoParrafo (clase de porcentaje) |
| Variantes | Sin CTA (la única observada) |
| Interacciones | Ninguna |
| Usado en | Menu (M-01) |

### C-04 · BandaMensaje / Statement
| Campo | Detalle |
|---|---|
| Propósito | Frase destacada a ancho de contenedor |
| Datos | texto, alineacion, colorPrimeraParte / colorSegundaParte (opcional) |
| Variantes | Centrada (H-02) · Con span de color y salto de línea (M-03 título) |
| Interacciones | Ninguna |
| Usado en | Home (H-02), Menu (M-03 cabecera) |

### C-05 · FichaProducto — **componente clave, 2 variantes**
| Campo | Detalle |
|---|---|
| Propósito | Representar un producto del catálogo |
| Datos | nombre, precio, categoria, imagen, destino, textoCta |
| **Variante A — Lista/Carta** | Usada en Home (H-04). Muestra: nombre + precio + categoría. **Sin imagen. Sin CTA.** Estructura: name-price-wrapper + type |
| **Variante B — Rejilla/Ficha** | Usada en Menu (M-03). Muestra: imagen + nombre + precio + botón "Order". **Sin categoría visible.** Estructura: div-block-46 > enlace con imagen + name-price-wrapper.menu-2 |
| Estados | Solo por defecto. **No hay hover, ni agotado, ni oferta, ni cargando** — OBSERVED (CSS/DOM, ausencia) |
| Interacciones | Clic en el nombre (destino NOT VERIFIED) · Clic en "Order" (comportamiento NOT VERIFIED) |
| Responsive | Variante A: 2 columnas → 1 columna. Variante B: rejilla de 4→3→2→1 (INFERRED salvo el nivel de 2 columnas, OBSERVED a 964 px) |
| Usado en | Home, Menu |

### C-06 · ListaProductos (colección)
| Campo | Detalle |
|---|---|
| Propósito | Renderizar una colección de productos |
| Datos | items[], variante ("carta" o "rejilla"), limite |
| Variantes | Carta (Home, 8 ítems) · Rejilla por categoría (Menu, 8/8/7 ítems) |
| Estados | **No hay estado vacío, ni de carga, ni de error** en la referencia — OBSERVED (ausencia). RECOMMENDED: definirlos |
| Usado en | Home (H-04), Menu (M-03) |

### C-07 · PestañasCategoria
| Campo | Detalle |
|---|---|
| Propósito | Filtrar el catálogo por categoría |
| Datos | categorias[] {etiqueta, id}, categoriaInicial |
| Variantes | Una sola (3 pestañas horizontales) |
| Estados | activo (w--current) / inactivo (#222) |
| Interacciones | Clic → cambia el panel visible. **Sin cambio de URL, sin petición de red, todos los paneles preexistentes en el DOM** — OBSERVED (tested) |
| Responsive | ≤991: OBSERVED las 3 pestañas siguen en línea. INFERRED: en móvil muy estrecho conviene scroll horizontal |
| Usado en | Menu (M-03) |

### C-08 · SliderTestimonios
| Campo | Detalle |
|---|---|
| Propósito | Prueba social rotatoria |
| Datos | testimonios[] {foto, nombre, cargo, texto} |
| Configuración exacta | animation slide · duration 500 · delay 4000 · **autoplay false** · infinite true · swipe habilitado · flechas visibles · nav-spacing 3 |
| Estados | Diapositiva activa / inactiva |
| Interacciones | Flechas, puntos de paginación, swipe táctil |
| Usado en | Home (H-07) |

### C-09 · CitaDestacada (pull quote)
| Campo | Detalle |
|---|---|
| Propósito | Testimonio único con gran presencia visual |
| Datos | eyebrow, cita, autor, cargo, imagenComillaIzq, imagenComillaDcha |
| Interacciones | Ninguna |
| Usado en | Menu (M-04) |

### C-10 · GaleriaMarquee
| Campo | Detalle |
|---|---|
| Propósito | Cinta de imágenes en movimiento continuo |
| Datos | titulo, imagenesPista1[], imagenesPista2[] (14 imágenes en total en la referencia) |
| Interacciones | Ninguna |
| Accesibilidad | RECOMMENDED: soportar prefers-reduced-motion |
| Usado en | Home (H-06) |

### C-11 · BloqueMedioTexto (media + texto)
| Campo | Detalle |
|---|---|
| Propósito | Patrón genérico de 2 columnas: medio a un lado, contenido al otro |
| Datos | media {tipo imagen o vídeo}, posicionMedia (izq/dcha), eyebrow, titulo, parrafo, cta opcional, extras opcionales |
| Instancias reales | H-03 (vídeo izq + texto dcha) · H-05 (imagen izq + texto dcha + cifras) · H-08 (texto izq + imagen dcha) |
| Responsive | INFERRED: colapsa a 1 columna en ≤991 |
| Usado en | Home (H-03, H-05, H-08), Menu (M-05) |
| **Nota** | Este componente **no existe como tal en la referencia** (son tres bloques distintos con clases propias). Su unificación es INFERRED del analista y ahorra trabajo, pero debe validarse |

### C-12 · BloqueEstadisticas
| Campo | Detalle |
|---|---|
| Datos | estadisticas[] {cifra, etiqueta} — 2 en la referencia |
| Estilo | Cifra: Libre Franklin 38 px, peso 500, #cb6037 |
| Animación de conteo | **No existe** — OBSERVED (ausencia) |
| Usado en | Home (H-05) |

### C-13 · PieDePagina (macro-componente compuesto)
| Campo | Detalle |
|---|---|
| Composición | Bloque Delivery + Bloque Newsletter + Bloque de enlaces/contacto + Franja de derechos |
| Datos | Contenido de delivery, textos del newsletter, logo, descripción, redes[], enlaces[], dirección, teléfonos[], textoCopyright |
| Variantes | Ninguna: **idéntico en ambas páginas** — OBSERVED |
| Usado en | Home (H-08/09/10), Menu (M-05/06/07) |

### C-14 · FormularioNewsletter
| Campo | Detalle |
|---|---|
| Datos | placeholder ("Email"), textoBoton ("Submit"), mensajeExito, mensajeError |
| Validación | type=email, required, maxlength 256 — OBSERVED (DOM) |
| Estados | inicial / éxito (oculta el formulario) / error |
| Faltan | Estado de carga, label accesible, consentimiento RGPD — RECOMMENDED |

### C-15 · ModalCarrito
| Campo | Detalle |
|---|---|
| Trigger | Icono de carrito del navbar |
| Estados | Abierto / cerrado / vacío |
| Contenido | Cabecera, listado de líneas, subtotal, CTA de checkout |
| Etiqueta | Estructura OBSERVED (DOM); **el flujo completo es NOT VERIFIED** desde estas dos páginas |

### C-16 · LightboxVideo
| Campo | Detalle |
|---|---|
| Trigger | Clic en la miniatura con icono de play |
| Datos | miniatura, fuenteVideo (**NOT VERIFIED**) |
| Estados | Cerrado / abierto |
| Usado en | Home (H-03) |

---

## 5. RESPONSIVE DESIGN

> **Recordatorio de fiabilidad:** el renderizado se comprobó a 964 px (tablet). Los valores de desktop provienen del CSS. Ver 0.2.

### 5.1 Comportamiento global por breakpoint

| Aspecto | ≥1440 | ≥1280 | 992–1279 | ≤991 | ≤767 | ≤479 |
|---|---|---|---|---|---|---|
| Padding vertical de sección | 120 px | 120 px | 80 px | 80 px | 60 px | 60 px |
| Padding-top del banner | 200 px | 200 px | 180 px | 140 px | 140 px | 140 px |
| H1 | 72 px | 70 px | 70 px | 52 px | 46 px | 46 px |
| H2 | 50 px | 50 px | 50 px | 42 px | 34 px | 34 px |
| H3 | 36 px | 34 px | 32 px | 32 px | 30 px | 30 px |
| H4 | 30 px | 30 px | 30 px | 30 px | 26 px | 26 px |
| H6 (.h6-libre-franklin) | 20 px | 20 px | 20 px | 18 px | 18 px | 18 px |
| p | 18 px (constante en todos los breakpoints) | | | | | |
| Contenedor | 1200 px máx. + 15 px laterales (constante) | | | | | |
| Navegación | Horizontal | Horizontal | Horizontal | **Hamburguesa** | Hamburguesa | Hamburguesa |

Todos los valores anteriores: **OBSERVED (CSS)**.

**Observación importante:** el tamaño del texto de párrafo **no cambia nunca** (18 px en todos los breakpoints). Solo escalan los titulares. Es una decisión deliberada del sistema.

### 5.2 Comportamiento por sección

| Sección | ≥992 | ≤991 | ≤767 | Etiqueta |
|---|---|---|---|---|
| H-00 Navbar | Menú horizontal, teléfono y CTA visibles | Hamburguesa + drawer; teléfono oculto (.hidden-tabley) | CTA oculto (.hidden-mob) | OBSERVED |
| H-01 Hero | Texto ~50 % izquierda + imagen derecha | Texto ensanchado, imagen reubicada | Botones apilados | OBSERVED (CSS) + INFERRED en móvil |
| H-02 Statement | H2 centrado 50 px | 42 px | 34 px | OBSERVED (CSS) |
| H-03 Proceso | 2 columnas (vídeo / texto) | 1 columna | 1 columna | INFERRED |
| H-04 Carta | Título izq. + lista dcha. en 2 columnas | Título arriba, lista debajo | Lista a 1 columna | OBSERVED (rendered ≤991) + INFERRED |
| H-05 Servicio | 2 columnas + 2 estadísticas en fila | 1 columna, estadísticas en fila | Estadísticas INFERRED apiladas | INFERRED |
| H-06 Galería | 2 pistas en movimiento | Se mantiene, imágenes menores | RECOMMENDED reducir a 1 pista | OBSERVED + RECOMMENDED |
| H-07 Testimonios | 2–3 diapositivas visibles (INFERRED) | Menos por vista; título al 50 % | 1 por vista; título 80 % centrado (≤479) | OBSERVED (CSS) para anchos |
| H-08 Delivery | 2 columnas | 1 columna | 1 columna | INFERRED |
| H-09 Newsletter | Campo + botón en línea | INFERRED en línea | INFERRED apilados a ancho completo | INFERRED |
| H-10 Footer | 2 bloques en fila | Apilados | Apilados, enlaces en vertical | INFERRED |
| M-01 Hero interior | Párrafo al 55 % (45 % ≥1280) | 72 % | 100 % | OBSERVED (CSS) |
| M-03 Rejilla | 4 columnas (INFERRED) | **2 columnas (OBSERVED)** | 2 (INFERRED) | Mixto |
| M-03 Pestañas | 3 en línea | 3 en línea (OBSERVED) | INFERRED scroll horizontal si no caben | Mixto |
| M-04 Cita | Cita centrada 50 px con comillas | 42 px | 34 px | OBSERVED (CSS) |

### 5.3 Elementos que se ocultan por breakpoint (OBSERVED, CSS)

| Clase | Efecto |
|---|---|
| .hidden-tabley | Oculta el teléfono del navbar en tablet y por debajo |
| .hidden-mob | Oculta el CTA "Get In Touch" del navbar en móvil |

**No se detectó ningún otro elemento ocultado por breakpoint.** OBSERVED (CSS). En particular: **no se oculta contenido de producto en móvil**, lo cual es correcto desde el punto de vista de SEO y de paridad de contenido.

### 5.4 Riesgos responsive identificados

| Riesgo | Descripción | Prioridad |
|---|---|---|
| Nº de columnas en desktop | No verificado por la limitación de viewport | P1 — validar antes de implementar |
| Alturas desiguales en testimonios | Los textos tienen longitudes muy distintas | P2 |
| Marquee en móvil | 14 imágenes en movimiento penalizan el rendimiento en móviles modestos | P1 |
| Pestañas en móvil estrecho | 3 pestañas pueden no caber en 320 px | P2 |
| H1 de 70 px | Con nombres de producto/marca largos puede desbordar | P2 |

---

## 6. INTERACCIONES Y UX

Formato: Trigger → Acción → Resultado → Estado visual → Feedback → Móvil.

### 6.1 Navegación principal
- **Trigger:** clic en un ítem con submenú (Demos, Our Menu, Blog, All Pages).
- **Acción:** se despliega nav-dropdown-list. "All Pages" usa la variante .megamenu (multicolumna).
- **Resultado:** lista de enlaces visible; clic en un enlace navega.
- **Estado visual:** el toggle recibe la clase de abierto (w--open) — INFERRED (comportamiento nativo de Webflow).
- **Feedback:** cambio de estado del toggle; **no hay indicador de página activa observable**.
- **Móvil:** dentro del drawer, los dropdowns se despliegan en acordeón vertical — INFERRED.
- Etiqueta: OBSERVED (DOM) para la estructura, INFERRED para los estados.

### 6.2 Menú móvil (drawer)
- **Trigger:** clic en div.menu-button (hamburguesa).
- **Acción:** se abre nav.nav-menu a pantalla completa sobre un overlay (div.w-nav-overlay).
- **Resultado:** aparecen logo móvil, botón de cierre y la lista completa de enlaces.
- **Cierre:** botón .close-menu-button o clic en el overlay.
- **Etiqueta:** OBSERVED (tested) — se abrió y cerró el drawer.
- **NOT VERIFIED:** bloqueo del scroll del body y atrapamiento del foco. RECOMMENDED: implementar ambos.

### 6.3 Carrito
- **Trigger:** clic en a.cart-button.
- **Acción:** se muestra el contenedor modal del carrito de Webflow Ecommerce.
- **Resultado observado:** modal con carrito **vacío**.
- **Etiqueta:** OBSERVED (tested) para la apertura y el cierre; **NOT VERIFIED** para añadir línea, modificar cantidad, eliminar y checkout.

### 6.4 Pestañas de categoría (Menu)
- **Trigger:** clic en a.tab-menu.
- **Acción:** intercambio de clases w--current / w--tab-active.
- **Resultado:** se muestra el panel correspondiente con su colección (8, 8 o 7 ítems).
- **Estado visual:** texto inactivo #222; activo INFERRED en acento.
- **Feedback:** cambio inmediato, sin spinner (el contenido ya está en el DOM).
- **URL:** **no cambia** — el estado no es enlazable ni recuperable tras recargar. OBSERVED (tested).
- **Móvil:** mismo comportamiento.

### 6.5 Slider de testimonios
Ver la tabla de configuración exacta en H-07. Puntos clave: **autoplay desactivado**, bucle infinito, swipe habilitado, transición slide de 500 ms, flechas y puntos siempre visibles.

### 6.6 Galería marquee
- **Trigger:** ninguno (automática al cargar).
- **Acción:** desplazamiento horizontal continuo de dos pistas.
- **Interacción del usuario:** **ninguna disponible**. No hay pausa, ni arrastre, ni flechas. OBSERVED (DOM + CSS).

### 6.7 Vídeo (lightbox)
- **Trigger:** clic en a.lightbox-link (miniatura + icono de play de Font Awesome).
- **Acción:** overlay a pantalla completa con el reproductor.
- **Cierre:** botón de cierre o tecla Escape — INFERRED (comportamiento nativo de w-lightbox).

### 6.8 Formulario de newsletter
- **Trigger:** envío del formulario.
- **Validación:** nativa (type=email + required + maxlength 256).
- **Éxito:** se oculta el formulario y aparece w-form-done.
- **Error:** aparece w-form-fail.
- **Ausencias:** sin estado de carga, sin validación en vivo, sin label, sin consentimiento. OBSERVED (DOM/CSS).

### 6.9 Sistema de animaciones (Webflow IX2) — OBSERVED (IX2)

| Tipo de interacción | Dónde | Descripción |
|---|---|---|
| Page load | Hero de Home (H-01) | Entrada escalonada de eyebrow, H1, párrafo y botones con desplazamiento vertical y fundido |
| Scroll into view | Prácticamente todas las secciones de ambas páginas | Fundido de opacidad 0→1 combinado con desplazamiento vertical al entrar el elemento en el viewport |
| Bucle continuo (while page loads / infinite) | Pistas de la galería (H-06) | Traslación horizontal infinita de track-horizontal-1 y track-horizontal-2 |
| Hover | Botones | Gestionado por CSS (transition .3s), **no por IX2** |
| Mouse move / parallax | — | **No detectado** |
| Scroll-linked (progreso) | — | **No detectado** |

**Consecuencia para la implementación INFERRED:** el sistema de animación es simple y homogéneo: un único patrón "fade + slide up al entrar en viewport" aplicado de forma generalizada, más las animaciones de carga del hero y el bucle del marquee. Puede reproducirse con un único observador de intersección y una clase de animación compartida; **no requiere una librería de animación compleja**.

### 6.10 Estados de interacción NO existentes en la referencia (no inventar)

| Estado | Situación | Etiqueta |
|---|---|---|
| Hover en fichas de producto | No declarado | OBSERVED (CSS, ausencia) |
| Hover en enlaces del pie | No declarado | OBSERVED (CSS, ausencia) |
| Estado activo de página en el navbar | No observado | OBSERVED (ausencia) |
| Focus visible personalizado | No declarado (solo el del navegador) | OBSERVED (CSS, ausencia) |
| Estados de carga | No existen | OBSERVED (ausencia) |
| Notificaciones/toasts | No existen | OBSERVED (ausencia) |
| Scroll suave a anclas | No detectado | OBSERVED (ausencia) |
| Botón "volver arriba" | No existe | OBSERVED (ausencia) |

---

## 7. E-COMMERCE

**Advertencia previa:** /home-2 y /menu-2 exponen un catálogo y un carrito, pero **no permiten completar ninguna operación de compra**. Todo lo que sigue distingue con precisión lo comprobado de lo no comprobable.

| # | Capacidad | Estado en la referencia | Etiqueta |
|---|---|---|---|
| 7.1 | Listado de productos | Existe en ambas páginas, alimentado por colecciones CMS (w-dyn-list). Home: 1 lista de 8. Menu: 3 listas de 8/8/7 | **OBSERVED (DOM)** |
| 7.2 | Ficha de producto en listado | Dos variantes (C-05 A y B). Campos visibles: nombre, precio, categoría (solo Home), imagen (solo Menu) | **OBSERVED (DOM)** |
| 7.3 | Precio | Texto plano con formato "$ 11.99 USD". Sin precio tachado, sin descuentos, sin precio por unidad, sin impuestos indicados | **OBSERVED (DOM)** |
| 7.4 | Botón de acción por producto | Solo en Menu: "Order" (a.link-2). **En Home no hay ningún botón por producto** | **OBSERVED (DOM)** |
| 7.5 | ¿"Order" añade al carrito? | **NO SE PUDO DETERMINAR.** Es un enlace (elemento a), no un botón de formulario de Webflow Ecommerce (que sería un input.w-commerce-commerceaddtocartbutton). Eso sugiere que **navega** en lugar de añadir | **NOT VERIFIED** + INFERRED sobre la naturaleza del elemento |
| 7.6 | Carrito | El componente existe y se abre. Se observó **vacío** | **OBSERVED (tested)** parcialmente |
| 7.7 | Añadir línea al carrito | No ejercitable desde estas dos páginas | **NOT VERIFIED** |
| 7.8 | Selector de cantidad | No existe en ninguna de las dos páginas | **OBSERVED (ausencia)** |
| 7.9 | Modificar/eliminar líneas | No comprobable con el carrito vacío | **NOT VERIFIED** |
| 7.10 | Subtotal / totales | No comprobable | **NOT VERIFIED** |
| 7.11 | Checkout | Fuera del alcance. Solo documentable como dependencia | **NOT VERIFIED** |
| 7.12 | Disponibilidad / stock | No se muestra en ningún sitio | **OBSERVED (ausencia)** |
| 7.13 | Variantes de producto | No existen | **OBSERVED (ausencia)** |
| 7.14 | Estado "agotado" | No existe | **OBSERVED (ausencia)** |
| 7.15 | Carrito vacío | Observado al abrir el modal sin líneas | **OBSERVED (tested)** |
| 7.16 | Estados de error de compra | No comprobables | **NOT VERIFIED** |
| 7.17 | Cupones / descuentos | No existen | **OBSERVED (ausencia)** |
| 7.18 | Cuenta de usuario / login | No existe enlace alguno | **OBSERVED (ausencia)** |
| 7.19 | Lista de deseos / favoritos | No existe | **OBSERVED (ausencia)** |
| 7.20 | Envío / entrega | Solo un bloque promocional (H-08) que enlaza a otra página | **OBSERVED (DOM)** |
| 7.21 | Búsqueda de productos | No existe | **OBSERVED (ausencia)** |
| 7.22 | Ordenación | No existe | **OBSERVED (ausencia)** |
| 7.23 | Página de detalle de producto | Existen enlaces desde el nombre del producto, pero la página está **fuera de alcance** | Dependencia — **NOT VERIFIED** |

### 7.24 Conclusión de e-commerce (crítica para el plan de desarrollo)

La referencia es, funcionalmente, un **catálogo/carta de escaparate con un carrito preparado pero no ejercitado**. El grado de e-commerce real que se implemente en el proyecto de dulces y salados **es una decisión de producto, no una réplica**.

**Instrucción explícita para Opus 5:** no generar tareas de "implementar checkout", "implementar cálculo de impuestos" o "implementar gestión de stock" derivándolas de este análisis. Esas capacidades **no están verificadas** en la referencia. Deben nacer de una decisión de alcance del usuario, y por eso se recogen en la sección 15 como preguntas abiertas de bloqueo.

---

## 8. ADAPTACIÓN A TIENDA DE DULCES Y PRODUCTOS SALADOS

Esta sección traduce cada bloque de la referencia al contexto del proyecto destino. Leyenda de acciones: **MANTENER** (se replica sin cambios estructurales) · **MODIFICAR** (se replica cambiando contenido o comportamiento) · **ELIMINAR** (no se replica) · **AÑADIR** (no existe en la referencia y es necesario).

### 8.1 Traducción del concepto

| Concepto de la referencia | Equivalente en la tienda de dulces y salados |
|---|---|
| Restaurante italiano | Obrador / tienda de dulces y salados |
| Plato de carta | Producto (unidad, bandeja, pack) |
| Categorías Pizza / Steak / Pasta | **Dulces / Salados / Packs** (3 categorías, exactamente el mismo patrón de 3 pestañas) |
| Etiqueta de tipo (Vegeterian / Meat / Fish) | Subtipo o atributo del producto (p. ej. "Sin gluten", "Artesano", "Relleno") |
| "Book a Table" | "Hacer pedido" / "Encargar" |
| "Explore Our Delivery" | "Envíos y recogida en tienda" |
| Testimonios de clientes del restaurante | Reseñas de clientes de la tienda |
| Galería de platos | Galería de producto y obrador |
| "The process of making an original pizza" | "Cómo elaboramos nuestros dulces" (vídeo de obrador) |

### 8.2 HOME — sección por sección

| ID | Original | Adaptación propuesta | Acción |
|---|---|---|---|
| H-00 | Navbar con Demos / Our Menu / Delivery / Blog / All Pages + teléfono + carrito + CTA | Navbar con **Tienda (o Catálogo) / Dulces / Salados / Packs / Envíos / Contacto** + carrito + CTA. Eliminar el dropdown "Demos" (artefacto de plantilla). Conservar carrito y hamburguesa | **MODIFICAR** |
| H-01 | Hero: eyebrow + H1 a 2 líneas bicolor + párrafo + 2 CTA + imagen | Mismo patrón exacto. Ej.: eyebrow "OBRADOR ARTESANO", línea 1 oscura + línea 2 en acento, CTA primario "Ver catálogo" y secundario "Encargar por WhatsApp/teléfono". **Mantener el recurso del H1 bicolor: es la firma visual** | **MANTENER estructura / MODIFICAR contenido** |
| H-02 | Banda declarativa con frase larga en mayúsculas | Frase de marca sobre la elaboración artesanal o el origen de los ingredientes | **MANTENER / MODIFICAR contenido** |
| H-03 | Vídeo del proceso + texto | Vídeo del obrador. Alto valor de conversión en alimentación artesanal. Si no hay vídeo disponible al lanzar, sustituir por imagen y mantener el layout | **MANTENER** |
| H-04 | Carta de 8 platos con nombre/precio/categoría, sin imagen | **Destacados**: 8 productos (mezcla de dulces y salados). **Cambio recomendado importante:** en una tienda de alimentación la imagen vende; usar aquí la variante B (con foto) o una variante mixta, en lugar de la lista sin imagen | **MODIFICAR (variante visual)** |
| H-05 | Servicio + 2 cifras | Mismo patrón. Cifras creíbles y verificables: años de oficio, pedidos servidos, referencias en catálogo. **No inventar cifras** | **MANTENER / MODIFICAR contenido** |
| H-06 | Galería marquee de 14 imágenes en 2 pistas | Galería de producto y obrador. Ideal para alimentación. Reducir a 1 pista en móvil por rendimiento | **MANTENER** |
| H-07 | Slider de 6 testimonios con retrato | Reseñas reales de clientes. Si al lanzar hay menos de 3, no forzar el slider: usar la variante de cita única (C-09) | **MANTENER** |
| H-08 | Delivery & pickup | **Envíos y recogida en tienda.** Muy relevante: en alimentación hay que comunicar zonas de reparto, plazos y conservación en frío | **MANTENER / MODIFICAR contenido** |
| H-09 | Newsletter | Newsletter con novedades y temporada. **AÑADIR obligatoriamente casilla de consentimiento RGPD y enlace a política de privacidad** | **MANTENER + AÑADIR consentimiento** |
| H-10 | Pie con logo, redes, 5 enlaces, dirección, 2 teléfonos | Igual + **AÑADIR enlaces legales** (Aviso legal, Privacidad, Cookies, Condiciones de venta, Devoluciones) y horario de tienda | **MANTENER + AÑADIR** |
| — | Etiquetas promocionales de plantilla Webflow | — | **ELIMINAR** |

### 8.3 MENU (catálogo) — sección por sección

| ID | Original | Adaptación propuesta | Acción |
|---|---|---|---|
| M-01 | Hero interior: "MENU" / "OUR FOOD" + párrafo al 55 % | "CATÁLOGO" / "NUESTROS PRODUCTOS" + párrafo | **MANTENER / MODIFICAR contenido** |
| M-02 | Banda de imagen a ancho completo | Imagen de producto o de obrador | **MANTENER** |
| M-03 | Título bicolor + 3 pestañas + rejilla de fichas con foto, nombre, precio y "Order" | **Núcleo del proyecto.** 3 pestañas: **Dulces / Salados / Packs**. Fichas con foto, nombre, precio y CTA. **Cambios necesarios:** ver 8.4 | **MODIFICAR (ampliar)** |
| M-04 | Cita destacada única | Reseña destacada o frase de un cliente/crítico | **MANTENER** |
| M-05/06/07 | Delivery + Newsletter + Footer | Idénticos a Home (componente compartido) | **MANTENER** |

### 8.4 Cambios obligatorios en la ficha de producto para alimentación

La ficha de la referencia es demasiado pobre para una tienda de alimentación real. Estos son los añadidos y su justificación:

| Añadido | Justificación | Prioridad | Etiqueta |
|---|---|---|---|
| **Formato / peso / unidades** (ej. "bandeja 500 g", "12 uds.") | En alimentación el precio no es interpretable sin el formato | P0 | AÑADIR |
| **Alérgenos** | **Obligación legal** en la UE para alimentos (Reglamento 1169/2011) para venta a distancia | P0 | AÑADIR |
| **Disponibilidad / agotado** | Producción artesanal limitada; evita pedidos imposibles | P0 | AÑADIR |
| **Descripción corta** | La referencia no la muestra; en alimentación es determinante | P1 | AÑADIR |
| **Badges** (Novedad, Temporada, Sin gluten, Sin azúcar, Más vendido) | Merchandising básico; la referencia no tiene ninguno | P1 | AÑADIR |
| **Precio por unidad de medida** (€/kg) | Requisito habitual en comercio de alimentación | P1 | AÑADIR |
| **Selector de cantidad** | Se compran varias unidades habitualmente | P2 | AÑADIR |
| **Conservación / caducidad** | Información sanitaria relevante | P2 | AÑADIR |
| **Estado hover de la ficha** | No existe en la referencia; necesario como affordance | P2 | AÑADIR (RECOMMENDED) |

**Regla de fidelidad:** todos estos añadidos deben respetar el sistema visual documentado en la sección 3 (sin sombras, radio 5 px, acento #cb6037, titulares en Cormorant Infant en mayúsculas, cuerpo en Libre Franklin 18 px #707070).

### 8.5 Modelo de categorización propuesto

La referencia tiene **una sola dimensión de clasificación** (3 pestañas excluyentes). Una tienda de dulces y salados necesita más, pero **añadir dimensiones cambia el patrón de UX de la referencia**, así que se propone en capas:

| Capa | Contenido | Fidelidad a la referencia |
|---|---|---|
| **Capa 1 — Pestañas principales (P0)** | Dulces · Salados · Packs | **Idéntica a la referencia** (3 pestañas) |
| **Capa 2 — Subcategorías (P1)** | Dentro de Dulces: tartas, bollería, galletas, bombones. Dentro de Salados: empanadas, hojaldres, snacks, quesos | AÑADIR — no existe en la referencia |
| **Capa 3 — Colecciones transversales (P2)** | Por ocasión (cumpleaños, Navidad, regalo), ofertas, novedades, más vendidos | AÑADIR — no existe en la referencia |
| **Capa 4 — Filtros por atributo (P3)** | Sin gluten, sin azúcar, vegano, rango de precio | AÑADIR — RECOMMENDED |

**Aviso para Opus 5:** solo la Capa 1 está respaldada por la referencia. Las capas 2 a 4 son **RECOMMENDED** y deben confirmarse con el usuario antes de planificarse.

### 8.6 Adaptación de la paleta

| Decisión | Recomendación |
|---|---|
| Conservar el sistema | Sí. La paleta terracota + neutros cálidos (#cb6037 / #f5f0ec / #1a1a1a / #707070) funciona igual de bien para repostería y salados artesanos |
| Si se cambia el acento | Cambiar **únicamente** el token --primary. Todo el sistema deriva de él: H2, H4, precios, botones, cifras y eyebrows destacados |
| Añadir obligatoriamente | Colores semánticos (éxito, error, aviso, info) — no existen en la referencia y un e-commerce los necesita |
| Diferenciación dulce/salado | RECOMMENDED: **no** usar dos colores de acento distintos. Diferenciar por fotografía y por badge, para no romper la unidad del sistema |

### 8.7 Qué NO se debe replicar de la referencia

| Elemento | Motivo |
|---|---|
| Dropdown "Demos" y megamenú "All Pages" | Artefactos de plantilla comercial, no de una tienda real |
| Etiquetas promocionales de Webflow y "Powered by Webflow" | Publicidad del marketplace |
| Textos lorem ipsum | Contenido de relleno |
| Datos de contacto de la plantilla (dirección de Maine, teléfonos ficticios) | Datos falsos |
| Precios en USD con formato "$ 11.99 USD" | El proyecto destino requiere **EUR con formato español**: "11,99 €" (coma decimal, símbolo pospuesto con espacio fino) |
| Ausencia de textos legales | Insuficiente para operar en la UE |
| Uso de h2 para la cita destacada | Error semántico de accesibilidad |
| Marquee sin control de pausa | Problema de accesibilidad |

### 8.8 Qué se debe añadir sí o sí (no existe en la referencia)

| Añadido | Motivo | Prioridad |
|---|---|---|
| Banner de consentimiento de cookies | Obligación legal UE | P0 |
| Páginas legales (aviso legal, privacidad, cookies, condiciones de venta, devoluciones) | Obligación legal | P0 |
| Información de alérgenos | Obligación legal en alimentación | P0 |
| Estados vacío / carga / error en el catálogo | La referencia no los tiene y una tienda real los necesita | P0 |
| Consentimiento en el newsletter | RGPD | P0 |
| Formato de precio en EUR con locale es-ES | Mercado destino | P0 |
| Indicación de gastos de envío y zonas de reparto | Expectativa básica del cliente | P1 |
| Estado activo de página en la navegación | Usabilidad | P2 |
| Focus visible personalizado | Accesibilidad | P1 |

---

## 9. ARQUITECTURA DE LAS DOS PÁGINAS

### 9.1 Inventario de páginas del alcance

| Página | Ruta propuesta | Origen | Alcance |
|---|---|---|---|
| Inicio | / | /home-2 | **DENTRO** del alcance |
| Catálogo | /catalogo (equivalente a /menu-2) | /menu-2 | **DENTRO** del alcance |
| Detalle de producto | — | Enlace desde el nombre del producto | **DEPENDENCIA** — fuera de alcance, no diseñar |
| Carrito / checkout | — | Icono de carrito del navbar | **DEPENDENCIA** — fuera de alcance, no diseñar |
| Envíos y reservas | — | CTA "Explore Our Delivery" | **DEPENDENCIA** — fuera de alcance |
| Páginas legales | — | No existen en la referencia | **AÑADIR** por obligación legal (contenido, no diseño) |

### 9.2 Jerarquía de composición

~~~
Layout global
├── C-01 Navbar  (compartido)
│   └── C-15 ModalCarrito
├── [slot de contenido de página]
└── C-13 PieDePagina  (compartido)
    ├── Bloque Delivery
    ├── C-14 FormularioNewsletter
    ├── Bloque de enlaces y contacto
    └── Franja de derechos

Página Inicio
├── C-02 HeroPortada
├── C-04 BandaMensaje
├── C-11 BloqueMedioTexto (vídeo) + C-16 LightboxVideo
├── C-06 ListaProductos (variante carta) -> C-05 FichaProducto A x8
├── C-11 BloqueMedioTexto (imagen) + C-12 BloqueEstadisticas
├── C-10 GaleriaMarquee
└── C-08 SliderTestimonios

Página Catálogo
├── C-03 HeroInterior
├── Banda de imagen a ancho completo
├── C-04 BandaMensaje (título bicolor)
│   └── C-07 PestañasCategoria
│       └── C-06 ListaProductos (variante rejilla) -> C-05 FichaProducto B xN
└── C-09 CitaDestacada
~~~

### 9.3 Relaciones entre páginas OBSERVED (DOM)

| Origen | Destino | Elemento |
|---|---|---|
| Navbar (dropdown "Our Menu") | Catálogo | Enlace de menú |
| Pie de página ("Our Menu") | Catálogo | a.footer-link |
| Pie de página ("Home") | Inicio | a.footer-link |
| Ficha de producto (nombre) | Detalle de producto | a.menu-price — destino NOT VERIFIED |
| Ficha de producto ("Order") | NOT VERIFIED | a.link-2 |
| Bloque Delivery | Página de envíos | a.primary-button |
| Navbar (carrito) | Modal de carrito (misma página) | a.cart-button |

**Observación relevante OBSERVED (DOM):** en Home **no hay ningún CTA que lleve al catálogo desde el cuerpo de la página**. La sección de la carta (H-04) no tiene un botón "ver toda la carta". RECOMMENDED: añadir un CTA "Ver todo el catálogo" al final de la sección de destacados; es una mejora de conversión evidente y de bajo coste.

### 9.4 Datos necesarios por página

| Página | Datos requeridos |
|---|---|
| Inicio | Contenido del hero, texto de la banda, datos del vídeo, **8 productos destacados**, contenido de servicio + 2 estadísticas, 14 imágenes de galería, 6 testimonios, contenido de delivery, textos del pie |
| Catálogo | Contenido del hero, imagen de banda, texto introductorio, **3 categorías**, **todos los productos por categoría**, 1 testimonio destacado, contenido de delivery, textos del pie |
| Compartido | Configuración del sitio: logo, navegación, redes sociales, dirección, teléfonos, textos legales |

---

## 10. MODELO DE DATOS NECESARIO

Modelo mínimo derivado **exclusivamente** de lo observado en las dos páginas, más los campos marcados como necesarios para el contexto de alimentación (sección 8.4). No se incluyen campos que no tengan un consumidor identificado.

### E-01 · Producto

| Campo | Tipo | Origen | Consumido por | Etiqueta |
|---|---|---|---|---|
| id | identificador | Necesario para la colección | C-05, C-06 | INFERRED |
| nombre | texto | "MARGHERITA" | C-05 A y B (a.menu-price) | OBSERVED |
| precio | decimal | "$ 11.99 USD" | C-05 A y B (div.price) | OBSERVED |
| divisa | texto | "USD" en la referencia → EUR en destino | C-05 | OBSERVED |
| categoria | referencia a E-02 | "Vegeterian/Meat/Fish" en Home; pestañas en Menu | C-05 A (div.type), C-07 | OBSERVED |
| imagen | media | img.image-13 | C-05 B | OBSERVED (solo en Menu) |
| destinoDetalle | enlace | a.menu-price es un enlace | C-05 A y B | OBSERVED (existencia) / NOT VERIFIED (destino) |
| textoCta | texto | "Order" | C-05 B (a.link-2) | OBSERVED |
| destacadoEnHome | booleano | Home muestra un subconjunto de 8 | C-06 variante carta | INFERRED |
| orden | entero | Para controlar la secuencia | C-06 | INFERRED |
| **formato** | texto (peso/uds.) | — | C-05 | **AÑADIR (alimentación)** |
| **alergenos** | lista | — | C-05, detalle | **AÑADIR (obligación legal)** |
| **disponible** | booleano | — | C-05 | **AÑADIR** |
| **descripcionCorta** | texto | — | C-05 | **AÑADIR** |
| **badges** | lista | — | C-05 | **AÑADIR (RECOMMENDED)** |
| **precioPorUnidadMedida** | decimal | — | C-05 | **AÑADIR** |

**Nota crítica OBSERVED (DOM):** el mismo registro de producto alimenta las dos páginas con presentaciones distintas. La entidad es **una sola**; lo que cambia es la proyección de campos por variante de ficha.

### E-02 · Categoría

| Campo | Tipo | Origen | Consumido por | Etiqueta |
|---|---|---|---|---|
| id | identificador | — | C-07 | INFERRED |
| nombre | texto | "Pizza", "Steak", "Pasta" | C-07 (pestañas) | OBSERVED |
| orden | entero | Orden de las pestañas | C-07 | OBSERVED (existe un orden fijo) |
| esInicial | booleano | Pizza lleva w--current | C-07 | OBSERVED |
| slug | texto | — | Necesario si se quiere estado enlazable (no existe en la referencia) | RECOMMENDED |

**Cardinalidad OBSERVED:** 3 categorías; 8 / 8 / 7 productos. Relación 1:N.

**Ambigüedad detectada OBSERVED (DOM):** en Home la etiqueta del producto es "Vegeterian / Meat / Fish", mientras que en Menu las pestañas son "Pizza / Steak / Pasta". Son **dos taxonomías distintas** aplicadas a los mismos productos: una de **tipo de plato** (pestañas) y otra de **atributo dietético** (etiqueta). El proyecto destino debe decidir explícitamente si mantiene dos taxonomías (categoría + atributo) o solo una. **Esta es una pregunta abierta de la sección 15.**

### E-03 · Testimonio

| Campo | Tipo | Origen | Consumido por | Etiqueta |
|---|---|---|---|---|
| id | identificador | — | C-08, C-09 | INFERRED |
| nombre | texto | "Floyd Miles", "Darrell Steward" | C-08 (.name-clients), C-09 | OBSERVED |
| cargo | texto | "Сook", "Food Critic" | C-08 (.position-client), C-09 (.position-testimonial) | OBSERVED |
| texto | texto largo | Cuerpo del testimonio | C-08, C-09 | OBSERVED |
| foto | media | img.client-img | C-08 **únicamente** (C-09 no muestra foto) | OBSERVED |
| destacado | booleano | Menu muestra uno solo | C-09 | INFERRED |

### E-04 · ImagenGaleria

| Campo | Tipo | Origen | Etiqueta |
|---|---|---|---|
| id, imagen, alt, pista (1 o 2), orden | — | 14 imágenes repartidas en 2 pistas | OBSERVED (cantidad) / INFERRED (campos) |

### E-05 · Estadistica

| Campo | Tipo | Origen | Etiqueta |
|---|---|---|---|
| cifra | texto | "20k+", "4k+" | OBSERVED |
| etiqueta | texto | "Satisfied Customers", "Successful orders" | OBSERVED |

**Nota:** la cifra es **texto**, no número (incluye sufijos "k+"). No modelarla como entero.

### E-06 · ConfiguracionSitio (contenido compartido)

| Campo | Origen | Etiqueta |
|---|---|---|
| logo, logoMovil, logoPie | img.logo / .logo-mobile / .footer-logo | OBSERVED |
| navegacion[] {etiqueta, destino, subitems[]} | 5 ítems de navbar | OBSERVED |
| telefonoNavbar | "(480) 555-0103" | OBSERVED |
| ctaNavbar {texto, destino} | "Get In Touch" | OBSERVED |
| descripcionMarca | p.footer-brand-description | OBSERVED |
| redesSociales[] | 4 iconos | OBSERVED |
| enlacesPie[] | 5 enlaces | OBSERVED |
| direccion | Texto de dirección | OBSERVED |
| telefonos[] | 2 teléfonos | OBSERVED |
| textoCopyright | Franja de derechos | OBSERVED |

### E-07 · SuscriptorNewsletter

| Campo | Tipo | Origen | Etiqueta |
|---|---|---|---|
| email | email, requerido, máx. 256 | input name="Email-2" | OBSERVED |
| fechaAlta | fecha | — | INFERRED |
| **consentimiento** | booleano + fecha | — | **AÑADIR (RGPD)** |

### E-08 · Promocion / Colección transversal

**NOT VERIFIED / RECOMMENDED.** No existe en la referencia ninguna entidad de promoción, oferta o descuento. Se documenta únicamente porque el usuario mencionó "ofertas" y "productos por ocasión" en el encargo. **Su modelado requiere decisión previa del usuario**; no debe derivarse de este análisis.

### 10.9 Diagrama de relaciones

~~~
E-02 Categoria 1 ──── N E-01 Producto
E-01 Producto  N ──── N E-08 Promocion        (RECOMMENDED, no verificado)
E-01 Producto        └─ destacadoEnHome ──> sección H-04
E-03 Testimonio      ─ usado por C-08 (Home, 6) y C-09 (Menu, 1 destacado)
E-04 ImagenGaleria   ─ usado por C-10 (Home, 14 en 2 pistas)
E-05 Estadistica     ─ usado por C-12 (Home, 2)
E-06 ConfiguracionSitio ─ usado por C-01 y C-13 (ambas páginas)
E-07 Suscriptor      ─ producido por C-14 (ambas páginas)
~~~

---

## 11. REQUISITOS FUNCIONALES

Formato: ID · Nombre · Página · Descripción · Prioridad · Dependencias · Comportamiento esperado · Criterios de aceptación.

### 11.1 Requisitos globales (compartidos por ambas páginas)

**FR-GLOBAL-001 · Sistema de diseño tokenizado**
- Página: ambas · Prioridad: **P0** · Dependencias: ninguna · Etiqueta: OBSERVED (CSS)
- Descripción: implementar como tokens los colores, familias, escala tipográfica y espaciado documentados en la sección 3.
- Criterios de aceptación: (1) los 9 tokens de color de :root existen con sus valores exactos; (2) los tamaños de H1–H6 y p coinciden con la tabla 3.2 en los seis breakpoints; (3) cambiar el token de acento reteñe H2, H4, precios, botones y cifras sin tocar ningún componente; (4) no hay valores de color ni de tamaño escritos a mano fuera de los tokens.

**FR-GLOBAL-002 · Contenedor y ritmo vertical**
- Prioridad: **P0** · Dependencias: FR-GLOBAL-001 · Etiqueta: OBSERVED (CSS)
- Criterios: (1) el contenedor mide 1200 px de ancho máximo con 15 px de padding lateral; (2) el padding vertical de sección es 80 px, 120 px a partir de 1280 px y 60 px por debajo de 768 px; (3) existen los modificadores "sin espacio superior" y "sin espacio inferior".

**FR-GLOBAL-003 · Barra de navegación**
- Prioridad: **P0** · Dependencias: FR-GLOBAL-001 · Etiqueta: OBSERVED (DOM/tested)
- Comportamiento: fija en la parte superior, superpuesta al hero; ítems con y sin submenú; colapsa a hamburguesa en ≤991 px.
- Criterios: (1) es idéntica en ambas páginas; (2) en ≤991 px aparece la hamburguesa y se abre un drawer a pantalla completa con logo y botón de cierre; (3) el drawer se cierra con el botón y con el overlay; (4) el teléfono se oculta en ≤991 px y el CTA en ≤767 px; (5) la barra **no cambia de aspecto al hacer scroll**; (6) el drawer bloquea el scroll de fondo y atrapa el foco (RECOMMENDED, no observado).

**FR-GLOBAL-004 · Acceso al carrito**
- Prioridad: **P1** · Dependencias: FR-GLOBAL-003 · Etiqueta: OBSERVED parcialmente + NOT VERIFIED
- Criterios: (1) el icono de carrito abre un panel/modal; (2) el panel muestra un estado vacío cuando no hay líneas; (3) se cierra con el botón de cierre y con Escape; (4) **el flujo de compra completo NO forma parte de este requisito** y requiere decisión previa del usuario.

**FR-GLOBAL-005 · Pie de página compuesto**
- Prioridad: **P0** · Dependencias: FR-GLOBAL-001 · Etiqueta: OBSERVED (DOM)
- Criterios: (1) un único componente contiene delivery + newsletter + enlaces + derechos; (2) se usa sin variantes en ambas páginas; (3) contiene 4 iconos sociales, 5 enlaces, dirección y 2 teléfonos enlazados; (4) los textos legales del proyecto destino están presentes.

**FR-GLOBAL-006 · Formulario de newsletter**
- Prioridad: **P1** · Dependencias: FR-GLOBAL-005 · Etiqueta: OBSERVED (DOM)
- Criterios: (1) campo de email requerido con máximo de 256 caracteres y placeholder "Email"; (2) al enviar con éxito se oculta el formulario y se muestra el mensaje de agradecimiento; (3) en error se muestra el mensaje de fallo; (4) existe estado de envío en curso (RECOMMENDED); (5) existe casilla de consentimiento con enlace a privacidad (AÑADIDO obligatorio); (6) el campo tiene etiqueta accesible.

**FR-GLOBAL-007 · Animaciones de entrada**
- Prioridad: **P2** · Dependencias: FR-GLOBAL-001 · Etiqueta: OBSERVED (IX2)
- Criterios: (1) los bloques hacen fundido con desplazamiento vertical al entrar en el viewport; (2) el hero anima al cargar la página de forma escalonada; (3) las animaciones se desactivan con prefers-reduced-motion (RECOMMENDED); (4) la animación se ejecuta una sola vez por elemento.

**FR-GLOBAL-008 · Formato de precio localizado**
- Prioridad: **P0** · Dependencias: E-01 · Etiqueta: MODIFICACIÓN respecto de la referencia
- Criterios: (1) los precios se muestran en euros con coma decimal y símbolo pospuesto; (2) el formato se aplica en un único punto reutilizable; (3) el color del precio es el acento y el peso es 500.

### 11.2 Requisitos de la página de Inicio

**FR-HOME-001 · Hero principal**
- Prioridad: **P0** · Etiqueta: OBSERVED
- Criterios: (1) muestra eyebrow, título en dos líneas con la segunda en color de acento, párrafo e imagen; (2) muestra dos botones con las variantes primaria y primaria-blanca; (3) el título mide 70 px (72 px a partir de 1440 px), 52 px en ≤991 y 46 px en ≤767; (4) el padding superior compensa la barra fija.

**FR-HOME-002 · Banda de mensaje**
- Prioridad: **P2** · Criterios: (1) H2 centrado en mayúsculas y color de acento; (2) sin padding inferior; (3) sin elementos interactivos.

**FR-HOME-003 · Bloque de vídeo del proceso**
- Prioridad: **P2** · Etiqueta: OBSERVED (DOM) + NOT VERIFIED (fuente del vídeo)
- Criterios: (1) dos columnas con miniatura e icono de reproducción a un lado y título+texto al otro; (2) al pulsar se abre el vídeo en un overlay; (3) el overlay se cierra con la X y con Escape; (4) en ≤991 px pasa a una columna.

**FR-HOME-004 · Productos destacados**
- Prioridad: **P0** · Dependencias: E-01, FR-GLOBAL-008 · Etiqueta: OBSERVED
- Criterios: (1) se muestran 8 productos procedentes de la fuente de datos, nunca hardcodeados; (2) cada uno muestra nombre y precio; (3) el nombre enlaza al detalle; (4) el bloque se apoya sobre el fondo cálido claro; (5) **si se adopta la variante con imagen (ver 8.2), cada producto muestra también su foto**; (6) existe un CTA hacia el catálogo (RECOMMENDED, no presente en la referencia).

**FR-HOME-005 · Bloque de servicio y cifras**
- Prioridad: **P2** · Criterios: (1) dos columnas con imagen y contenido; (2) exactamente dos estadísticas con cifra en 38 px color acento y etiqueta debajo; (3) las cifras son contenido editable, no código.

**FR-HOME-006 · Galería en movimiento continuo**
- Prioridad: **P2** · Etiqueta: OBSERVED (IX2)
- Criterios: (1) dos pistas horizontales con desplazamiento continuo e infinito sin saltos visibles; (2) el contenedor recorta el desbordamiento; (3) se respeta prefers-reduced-motion (RECOMMENDED); (4) en móvil se reduce el número de imágenes o de pistas por rendimiento.

**FR-HOME-007 · Slider de testimonios**
- Prioridad: **P1** · Dependencias: E-03 · Etiqueta: OBSERVED (config exacta)
- Criterios: (1) transición de deslizamiento de 500 ms; (2) **sin reproducción automática**; (3) bucle infinito; (4) swipe táctil habilitado; (5) flechas y puntos de paginación visibles; (6) cada diapositiva muestra retrato, nombre, cargo y texto; (7) las diapositivas mantienen la misma altura aunque los textos difieran; (8) navegable por teclado con foco visible (RECOMMENDED).

**FR-HOME-008 · Bloque de envíos y recogida**
- Prioridad: **P1** · Criterios: (1) dos columnas con texto+CTA e imagen; (2) el CTA usa el botón primario con 30 px de margen superior; (3) el bloque forma parte del componente de pie compartido.

### 11.3 Requisitos de la página de Catálogo

**FR-MENU-001 · Listado de productos por categoría**
- Prioridad: **P0** · Dependencias: E-01, E-02, FR-GLOBAL-008 · Etiqueta: OBSERVED
- Descripción: la página de catálogo debe mostrar los productos agrupados por categoría, seleccionables mediante pestañas.
- Comportamiento esperado: al cargar se muestra la primera categoría; al pulsar otra pestaña se sustituye el listado sin recargar la página.
- Criterios de aceptación: (1) los productos se muestran en una rejilla responsive; (2) cada producto muestra imagen, nombre y precio; (3) el usuario puede navegar entre categorías; (4) el layout se adapta a móvil; (5) el número de productos por categoría es variable y la rejilla tolera filas incompletas; (6) los datos proceden de la fuente de datos.

**FR-MENU-002 · Pestañas de categoría**
- Prioridad: **P0** · Dependencias: E-02 · Etiqueta: OBSERVED (tested)
- Criterios: (1) hay 3 categorías; (2) la primera está activa al cargar; (3) la pestaña activa se distingue visualmente de las inactivas (#222); (4) el cambio es inmediato y sin petición de red; (5) las pestañas son accesibles por teclado con roles ARIA correctos; (6) **decisión pendiente**: en la referencia la URL NO cambia; se recomienda añadir estado enlazable, pero requiere aprobación (ver 15.3).

**FR-MENU-003 · Ficha de producto en rejilla**
- Prioridad: **P0** · Dependencias: E-01 · Etiqueta: OBSERVED + AÑADIDOS
- Criterios: (1) muestra imagen, nombre en mayúsculas color negro, precio en color de acento y botón de acción; (2) la imagen y el nombre enlazan al detalle; (3) el botón usa fondo de acento, texto blanco y borde de 1 px; (4) existe estado hover (AÑADIDO, no presente en la referencia); (5) muestra formato, alérgenos y disponibilidad (AÑADIDO obligatorio para alimentación); (6) muestra estado "agotado" cuando corresponda (AÑADIDO).

**FR-MENU-004 · Hero de página interior**
- Prioridad: **P1** · Criterios: (1) muestra eyebrow en acento, H1 de una línea y párrafo; (2) el párrafo ocupa el 55 % del ancho (45 % a partir de 1280 px, 72 % en ≤991, 100 % en ≤767); (3) no tiene botones.

**FR-MENU-005 · Banda de imagen a ancho completo**
- Prioridad: **P3** · Criterios: (1) imagen a ancho completo sin texto ni interacción; (2) animación de entrada al hacer scroll.

**FR-MENU-006 · Testimonio destacado**
- Prioridad: **P2** · Dependencias: E-03 · Criterios: (1) muestra eyebrow, cita centrada en mayúsculas y color de acento, comillas decorativas, nombre y cargo; (2) sin padding superior; (3) se marca semánticamente como cita, no como encabezado (mejora respecto de la referencia).

**FR-MENU-007 · Estados del listado**
- Prioridad: **P0** · Etiqueta: **AÑADIDO** (no existe en la referencia)
- Criterios: (1) estado de carga; (2) estado sin resultados con mensaje claro; (3) estado de error con posibilidad de reintentar.

### 11.4 Resumen de requisitos

| Prioridad | Requisitos |
|---|---|
| **P0** | FR-GLOBAL-001, 002, 003, 005, 008 · FR-HOME-001, 004 · FR-MENU-001, 002, 003, 007 |
| **P1** | FR-GLOBAL-004, 006 · FR-HOME-007, 008 · FR-MENU-004 |
| **P2** | FR-GLOBAL-007 · FR-HOME-002, 003, 005, 006 · FR-MENU-006 |
| **P3** | FR-MENU-005 |

---

## 12. REQUISITOS NO FUNCIONALES

Solo los pertinentes para estas dos páginas.

| ID | Requisito | Detalle | Prioridad | Etiqueta |
|---|---|---|---|---|
| NFR-001 | Responsive | Soporte de los seis breakpoints documentados (≥1440, ≥1280, 992–1279, ≤991, ≤767, ≤479) con los valores exactos de la sección 5. Sin scroll horizontal en ningún breakpoint. Área táctil mínima de 44 px | P0 | OBSERVED (CSS) |
| NFR-002 | Optimización de imágenes | La referencia carga muchas imágenes: 14 en la galería, más las de producto (hasta 23 fichas en el catálogo), hero, banda y retratos. Requisitos: formatos modernos, dimensiones responsive, carga diferida por debajo del pliegue, dimensiones explícitas para evitar saltos de layout | P0 | INFERRED de la carga observada |
| NFR-003 | Rendimiento | Objetivo: LCP < 2,5 s, CLS < 0,1, INP < 200 ms. Puntos de riesgo identificados: la galería marquee de 14 imágenes animadas de forma continua, las dos familias tipográficas con 9 pesos en total, y el renderizado simultáneo de los 3 paneles de categoría | P1 | INFERRED |
| NFR-004 | Carga de fuentes | Dos familias (Cormorant Infant y Libre Franklin) con múltiples pesos. Cargar solo los pesos realmente usados (300/400/500/600/700 y 300/400/500/600), con estrategia de intercambio y precarga de las de la parte superior | P1 | OBSERVED (CSS) |
| NFR-005 | Accesibilidad — contraste | Verificar el acento #cb6037 sobre blanco: **es el mayor riesgo del sistema**, ya que se usa en texto pequeño (precios de 18 px) y en texto de botón blanco sobre acento. Debe alcanzarse AA (4,5:1 en texto normal) | P0 | OBSERVED (CSS) + INFERRED del riesgo |
| NFR-006 | Accesibilidad — movimiento | La galería es una animación infinita sin control de pausa. Debe respetarse prefers-reduced-motion y ofrecerse pausa | P1 | OBSERVED (ausencia) |
| NFR-007 | Accesibilidad — semántica | Corregir los defectos de la referencia: cita marcada como h2, ausencia de labels en el formulario, ausencia de focus visible personalizado, imágenes decorativas sin marcar como tales | P1 | OBSERVED |
| NFR-008 | Accesibilidad — navegación | Pestañas y slider operables por teclado con roles ARIA; drawer móvil con atrapamiento de foco y cierre con Escape; salto al contenido principal | P1 | RECOMMENDED |
| NFR-009 | SEO — semántica | Un único H1 por página (la referencia lo cumple); jerarquía correcta de encabezados; **corregir el h2 usado como cita**, que introduce un encabezado espurio | P1 | OBSERVED |
| NFR-010 | SEO — contenido | Títulos y meta descripciones por página, URLs legibles, textos alternativos en todas las imágenes de producto, datos estructurados de producto y de negocio local | P1 | RECOMMENDED |
| NFR-011 | SEO — contenido de pestañas | Los tres paneles de categoría están en el DOM desde la carga, por lo que **todo el catálogo es indexable**. Si en la implementación se opta por carga bajo demanda, se pierde esa ventaja: decisión consciente | P1 | OBSERVED (DOM) |
| NFR-012 | Mantenibilidad | Ningún valor de diseño fuera de los tokens; componentes con una única responsabilidad; el pie compartido definido una sola vez; el contenido separado de la presentación | P0 | INFERRED |
| NFR-013 | Reutilización | La ficha de producto debe ser un componente con variantes, no dos componentes duplicados. El pie debe ser un macro-componente único | P0 | OBSERVED (patrón de la referencia) |
| NFR-014 | Consistencia | Un único radio (5 px), un único padding de botón (14×30), una única transición (.3s), sin sombras, todos los encabezados en mayúsculas. Cualquier desviación debe justificarse | P0 | OBSERVED (CSS) |
| NFR-015 | Internacionalización de formato | Precios en euros con formato español; textos de interfaz centralizados | P1 | MODIFICACIÓN |
| NFR-016 | Cumplimiento legal | Consentimiento de cookies, textos legales, información de alérgenos, consentimiento del newsletter | P0 | AÑADIDO |
| NFR-017 | Navegadores | Compatibilidad con las dos últimas versiones de los navegadores principales, incluido Safari de iOS (el marquee y el slider son los puntos sensibles) | P1 | INFERRED |

---

## 13. OBSERVADO VS INFERIDO — REGISTRO CONSOLIDADO

Esta sección es la **salvaguarda contra la conversión de suposiciones en requisitos**. Opus 5 debe consultarla antes de generar cualquier tarea.

### 13.1 OBSERVED — hechos verificados (implementar tal cual)

| Ámbito | Hecho | Subfuente |
|---|---|---|
| Color | Los 9 tokens de :root y sus valores exactos | CSS |
| Color | El color por defecto de h2 y h4 es el acento #cb6037 | CSS |
| Color | Todos los párrafos son #707070 | CSS |
| Tipografía | Cormorant Infant para todos los encabezados; Libre Franklin para el texto | CSS |
| Tipografía | Todos los encabezados en mayúsculas; los botones son la única excepción | CSS |
| Tipografía | Escala completa por breakpoint (tabla 3.2) | CSS |
| Espaciado | Sección 80/120/60 px; contenedor 1200 px + 15 px | CSS |
| Espaciado | .mt-40 sobre botón vale 30 px | CSS |
| Espaciado | .mb--40 aplica margen negativo de −40 px | CSS |
| Botones | Radio 5 px, padding 14×30, transición .3s, hover por inversión | CSS |
| Estilo | **No hay sombras** en los componentes de estas dos páginas | CSS |
| Estructura | Orden completo de secciones de ambas páginas | DOM |
| Estructura | Delivery, newsletter y pie viven dentro del mismo nodo de pie | DOM |
| Estructura | Ambas páginas comparten navbar y pie idénticos | DOM |
| Catálogo | Los productos provienen de colecciones CMS en ambas páginas | DOM |
| Catálogo | Home muestra 8 productos sin imagen y con categoría; Menu muestra fichas con imagen y CTA sin categoría | DOM |
| Catálogo | 3 categorías con 8 / 8 / 7 productos | DOM |
| Catálogo | Formato de precio "$ 11.99 USD" | DOM |
| Pestañas | El cambio de pestaña **no altera la URL** y no dispara peticiones | tested |
| Pestañas | Los tres paneles están en el DOM desde la carga | DOM |
| Slider | autoplay=false, duration=500, delay=4000, infinite=true, swipe habilitado, 6 diapositivas | DOM |
| Formulario | Campo email requerido, máx. 256, placeholder "Email", botón "Submit", bloques de éxito y error | DOM |
| Navegación | 5 ítems (4 con submenú), colapso en ≤991, teléfono oculto en tablet, CTA oculto en móvil | DOM/CSS |
| Navegación | El drawer móvil abre y cierra correctamente | tested |
| Carrito | El modal abre y cierra; se observó vacío | tested |
| Galería | 14 imágenes en 2 pistas con bucle infinito | DOM/IX2 |
| Animación | Patrón único de fundido + desplazamiento al entrar en viewport, más carga del hero y bucle del marquee | IX2 |
| Ausencias | Sin badges, sin stock, sin cantidad, sin buscador, sin ordenación, sin paginación, sin breadcrumb, sin favoritos, sin login | DOM |

### 13.2 INFERRED — deducciones razonables (requieren validación de diseño)

| Deducción | Base de la deducción | Riesgo si es errónea |
|---|---|---|
| La rejilla del catálogo tiene 4 columnas en desktop | Ancho de contenedor y tamaño de ficha observado a 964 px | Medio — ajuste visual |
| Los bloques de dos columnas colapsan a una en ≤991 px | Comportamiento estándar y coherencia del sistema | Bajo |
| Las pistas del marquee se mueven en direcciones opuestas | Patrón habitual en este layout de dos filas | Bajo |
| El retrato del testimonio es circular | Aspecto renderizado | Muy bajo |
| El fondo cálido del bloque de la carta es #f5f0ec | Nombre del token --primary-light y aspecto renderizado | Bajo |
| La pestaña activa se distingue con el color de acento | Existe la clase w--current; el inactivo es #222 | Medio |
| Los dropdowns responden a hover en desktop | Configuración por defecto de Webflow | Bajo |
| El slider muestra 2–3 diapositivas simultáneas en desktop | La diapositiva no ocupa el 100 % del área visible | Medio |
| El botón blanco debería invertirse al hacer hover | Coherencia con el botón primario; **no está declarado** | Bajo |
| Los tres bloques de dos columnas pueden unificarse en un componente | Estructura análoga, clases distintas | Medio — decisión de arquitectura |
| El campo destacadoEnHome existe en el modelo | Home muestra un subconjunto de 8 productos | Bajo |

### 13.3 NOT VERIFIED — prohibido inventar la implementación

| Elemento | Por qué no se pudo verificar | Qué debe hacer Opus 5 |
|---|---|---|
| Qué hace exactamente el botón "Order" | No se ejercitó y su marcado es de enlace, no de botón de carrito | Crear una **tarea de decisión**, no de desarrollo |
| Destino del enlace del nombre del producto | La página de detalle está fuera de alcance | Documentar como dependencia |
| Flujo completo de carrito y checkout | No hay forma de añadir productos desde estas dos páginas | Requiere decisión de alcance del usuario |
| Fuente del vídeo del bloque de proceso | No se abrió el reproductor | Tarea de decisión |
| Backend de los formularios | Gestionado por la infraestructura de Webflow | Tarea de decisión de integración |
| Navegación por teclado de pestañas y slider | No se probó | Tarea de verificación |
| Número exacto de columnas en desktop | Limitación de viewport (máx. 964 px) | Validar contra la referencia antes de fijar |
| Existencia de srcset en las imágenes | No se inspeccionó a nivel de atributos | Implementar explícitamente en el destino |
| Estados de error del carrito y del pago | No ejercitables | No planificar sin decisión previa |

### 13.4 RECOMMENDED — mejoras propuestas por el analista (NO son requisitos)

| Mejora | Motivo | Requiere aprobación |
|---|---|---|
| Estado hover en fichas de producto y enlaces del pie | Affordance ausente en la referencia | Sí |
| Estado enlazable de la categoría seleccionada | Permite compartir y recuperar el filtro | Sí |
| CTA desde los destacados de Home hacia el catálogo | Conversión; no existe ese camino en Home | Sí |
| Pausa del marquee y soporte de prefers-reduced-motion | Accesibilidad | Sí |
| Cita marcada semánticamente como cita, no como h2 | Accesibilidad y SEO | Sí |
| Colores semánticos en el sistema | Un e-commerce los necesita | Sí |
| Estado activo de página en la navegación | Orientación del usuario | Sí |
| Focus visible personalizado | Accesibilidad | Sí |
| Estados de carga, vacío y error en el catálogo | Robustez | Sí (aunque marcados P0 por criticidad) |
| Igualar alturas de las diapositivas de testimonios | Los textos son de longitud desigual | Sí |

**Regla operativa para Opus 5:** ninguna fila de 13.3 ni de 13.4 puede convertirse en una tarea de desarrollo sin confirmación explícita del usuario. Solo 13.1 y 13.2 alimentan directamente el plan, y 13.2 con la marca "validar diseño".

---

## 14. PRIORIDADES

### 14.1 Definición

| Nivel | Significado | Criterio de asignación |
|---|---|---|
| **P0 — Crítico** | Necesario para que la página funcione | Sin esto no hay página utilizable ni conforme a la ley |
| **P1 — Alto** | Necesario para reproducir correctamente la experiencia | Sin esto la página funciona pero no es fiel a la referencia |
| **P2 — Medio** | Importante pero no bloqueante | Aporta calidad y matiz |
| **P3 — Bajo** | Mejora o refinamiento | Puede posponerse indefinidamente |

### 14.2 Asignación consolidada

**P0 — Crítico**
- Sistema de tokens de diseño (colores, tipografía, espaciado) — FR-GLOBAL-001
- Contenedor y ritmo vertical — FR-GLOBAL-002
- Barra de navegación con drawer móvil — FR-GLOBAL-003
- Pie de página compuesto y compartido — FR-GLOBAL-005
- Formato de precio en euros — FR-GLOBAL-008
- Hero de la página de inicio — FR-HOME-001
- Productos destacados en inicio — FR-HOME-004
- Listado de productos por categoría — FR-MENU-001
- Pestañas de categoría — FR-MENU-002
- Ficha de producto en rejilla — FR-MENU-003
- Estados de carga, vacío y error del listado — FR-MENU-007
- Modelo de datos de Producto y Categoría — E-01, E-02
- Responsive en los seis breakpoints — NFR-001
- Optimización de imágenes — NFR-002
- Contraste accesible del color de acento — NFR-005
- Mantenibilidad, reutilización y consistencia — NFR-012, 013, 014
- Cumplimiento legal (cookies, legales, alérgenos, consentimiento) — NFR-016

**P1 — Alto**
- Acceso al carrito (solo apertura y estado vacío) — FR-GLOBAL-004
- Formulario de newsletter — FR-GLOBAL-006
- Slider de testimonios con su configuración exacta — FR-HOME-007
- Bloque de envíos y recogida — FR-HOME-008
- Hero de página interior — FR-MENU-004
- Rendimiento, carga de fuentes, accesibilidad de movimiento, semántica y navegación — NFR-003, 004, 006, 007, 008
- SEO semántico, de contenido y de indexabilidad de pestañas — NFR-009, 010, 011
- Formato localizado y compatibilidad de navegadores — NFR-015, 017

**P2 — Medio**
- Animaciones de entrada — FR-GLOBAL-007
- Banda de mensaje — FR-HOME-002
- Bloque de vídeo del proceso — FR-HOME-003
- Bloque de servicio y cifras — FR-HOME-005
- Galería marquee — FR-HOME-006
- Testimonio destacado del catálogo — FR-MENU-006
- Subcategorías (capa 2 de 8.5)

**P3 — Bajo**
- Banda de imagen a ancho completo — FR-MENU-005
- Colecciones transversales y filtros por atributo (capas 3 y 4 de 8.5)
- Refinamientos de microinteracción

### 14.3 Orden de construcción sugerido (por dependencias, no por prioridad aislada)

| Fase | Contenido | Motivo |
|---|---|---|
| 1 | Tokens, tipografía, contenedor, ritmo vertical, botones | Todo lo demás depende de esto |
| 2 | Modelo de datos de Producto y Categoría | Bloquea ambas páginas |
| 3 | Navbar + Pie compartidos | Bloquea ambas páginas |
| 4 | Ficha de producto (dos variantes) + listado | Núcleo de valor |
| 5 | Página de catálogo (hero, pestañas, rejilla, estados) | Página con mayor peso funcional |
| 6 | Página de inicio (hero, destacados, resto de bloques) | Depende de la ficha ya construida |
| 7 | Testimonios, galería, vídeo, banda | Bloques decorativos |
| 8 | Animaciones, accesibilidad, rendimiento, SEO | Capa transversal final |
| 9 | Cumplimiento legal y contenido real | Previo al lanzamiento |

---

## Handoff to Claude Opus 5

### 15.1 Qué es este documento y qué no es

Este documento es una **especificación de análisis** de dos páginas de referencia (/home-2 y /menu-2 de italy-128.webflow.io), traducida al contexto de una tienda de dulces y productos salados.

**Lo que es:** un inventario exhaustivo de estructura, diseño, comportamiento y datos, con cada afirmación etiquetada según su grado de certeza.

**Lo que NO es:** ni un plan de desarrollo, ni una arquitectura técnica, ni código, ni una elección de tecnología. No contiene ninguna decisión de implementación.

### 15.2 Tu tarea

Transformar este documento en un **plan de desarrollo ejecutable** con la siguiente estructura jerárquica:

~~~
Epic
 └── Feature
      └── User Story
           └── Development Task
                └── Subtask
                     ├── Acceptance Criteria
                     └── Dependencies
~~~

**Épicas propuestas** (derivadas de la sección 14.3, puedes reorganizarlas si lo justificas):

| Épica | Alcance |
|---|---|
| E1 — Fundamentos del sistema de diseño | Tokens, tipografía, contenedor, ritmo vertical, botones, formularios |
| E2 — Modelo de datos y contenido | Producto, Categoría, Testimonio, Galería, Estadística, Configuración del sitio |
| E3 — Componentes de layout compartidos | Navbar con drawer, macro-componente de pie con delivery y newsletter |
| E4 — Catálogo de producto | Ficha con dos variantes, listado, pestañas de categoría, estados |
| E5 — Página de catálogo | Hero interior, banda de imagen, núcleo de catálogo, cita destacada |
| E6 — Página de inicio | Hero, banda, vídeo, destacados, servicio y cifras, galería, testimonios |
| E7 — Movimiento e interacción | Animaciones de entrada, marquee, slider, lightbox |
| E8 — Calidad transversal | Responsive, accesibilidad, rendimiento, SEO, imágenes |
| E9 — Adaptación a alimentación y cumplimiento legal | Alérgenos, formatos, disponibilidad, badges, textos legales, cookies |

### 15.3 Reglas obligatorias que debes respetar

1. **Respeta el etiquetado.** Solo las filas OBSERVED (sección 13.1) e INFERRED (13.2) generan tareas de desarrollo. Las INFERRED deben llevar la anotación "requiere validación de diseño".
2. **Nada de NOT VERIFIED (13.3) puede convertirse en una tarea de desarrollo.** Genera para cada una una *tarea de decisión* dirigida al usuario. **Está prohibido inventar la implementación.**
3. **Nada de RECOMMENDED (13.4) puede planificarse sin aprobación explícita del usuario.** Preséntalas como backlog opcional claramente separado.
4. **No amplíes el alcance.** Solo dos páginas: inicio y catálogo. La página de detalle de producto, el carrito completo, el checkout y la página de envíos son **dependencias documentadas**, no trabajo planificable.
5. **Los valores exactos son requisitos.** Los números de las secciones 3 y 5 (tamaños, paddings, colores, breakpoints, duraciones) proceden de la hoja de estilos real. Trasládalos literalmente a los criterios de aceptación; no los redondees ni los "mejores".
6. **Ten presente la limitación de la sección 0.2.** El número de columnas en desktop no está verificado. Trátalo como tarea de validación, no como hecho.
7. **Cada tarea debe tener criterios de aceptación verificables.** Nada de "se ve bien": usa valores medibles.
8. **Ordena por dependencias**, tomando como base la secuencia de 14.3.
9. **Antes de planificar, plantea al usuario las preguntas abiertas de 15.4.** Varias son bloqueantes.
10. **No conviertas el contenido de relleno de la referencia en requisitos**: los lorem ipsum, los datos de contacto ficticios, los precios en dólares y los artefactos de plantilla de Webflow no forman parte del proyecto.

### 15.4 Preguntas abiertas que debes plantear ANTES de planificar

| # | Pregunta | Bloquea |
|---|---|---|
| 1 | ¿El alcance incluye compra real (carrito, checkout, pago) o es un catálogo de escaparate con pedido por otro canal? | **E4, E9 y todo el modelo de datos** |
| 2 | ¿Qué hace el botón de acción de la ficha: añadir al carrito, abrir el detalle o iniciar un pedido por WhatsApp/teléfono? | **FR-MENU-003** |
| 3 | ¿Se confirman las tres categorías Dulces / Salados / Packs, o son otras? | **FR-MENU-002, E-02** |
| 4 | ¿Se necesitan subcategorías desde el inicio (capa 2 de 8.5) o basta con las 3 pestañas de la referencia? | **E4, E5** |
| 5 | ¿Se mantienen dos taxonomías (categoría de pestaña + atributo tipo "sin gluten") como en la referencia, o solo una? | **E-01, E-02** |
| 6 | ¿La gestión de stock es real (unidades) o binaria (disponible / agotado)? | **E-01, FR-MENU-003** |
| 7 | ¿Existe ya identidad de marca (logo, color) o se conserva la paleta terracota documentada? | **E1** |
| 8 | ¿Hay fotografía de producto disponible? La ficha del catálogo depende por completo de la imagen | **E4, E6** |
| 9 | ¿Habrá vídeo de obrador para el bloque de proceso, o se sustituye por imagen? | **FR-HOME-003** |
| 10 | ¿De dónde salen los testimonios: reseñas reales importadas o contenido editorial? | **E-03, FR-HOME-007** |
| 11 | ¿Qué stack tecnológico y qué fuente de datos se usarán? Este documento es deliberadamente agnóstico | **Todo el plan** |
| 12 | ¿Se quiere estado enlazable para la categoría seleccionada, mejorando la referencia? | **FR-MENU-002** |
| 13 | ¿Hay requisitos de idioma múltiple? La referencia es monolingüe | **NFR-015** |
| 14 | ¿Se venderá a distancia dentro de la UE? Determina el nivel de exigencia legal | **E9** |

### 15.5 Formato de salida que se espera de ti

Para cada tarea de desarrollo:

~~~
[ID]  Título de la tarea
Épica:            E4
Requisito origen: FR-MENU-003
Prioridad:        P0
Etiqueta origen:  OBSERVED (CSS) | INFERRED | ...
Depende de:       [IDs de tareas previas]
Descripción:      ...
Subtareas:        1) ... 2) ... 3) ...
Criterios de aceptación:
  - Verificable y medible
  - Verificable y medible
Riesgos / notas:  ...
~~~

Y al final, un cuadro resumen con: número total de tareas por épica y prioridad, ruta crítica, y la lista separada de tareas de decisión (procedentes de 13.3) y de backlog opcional (procedente de 13.4).

### 15.6 Criterio de éxito del plan

El plan será correcto si un equipo de desarrollo puede ejecutarlo sin volver a consultar la web de referencia, sin tomar decisiones de producto por su cuenta, y obteniendo un resultado que reproduzca fielmente la experiencia visual y funcional de /home-2 y /menu-2, adaptada a una tienda de dulces y productos salados.

---

## ANEXO A — RESUMEN EJECUTIVO EN UNA PÁGINA

| Aspecto | Síntesis |
|---|---|
| Referencia | Plantilla Webflow de restaurante italiano; dos páginas analizadas |
| Estilo visual | Editorial, plano, sin sombras, radio de 5 px, mucho espacio en blanco |
| Paleta | Un solo acento terracota #cb6037 sobre neutros cálidos; sin colores semánticos |
| Tipografía | Cormorant Infant (serif, titulares en mayúsculas) + Libre Franklin (sans, texto 18 px #707070) |
| Ritmo vertical | 80 px de sección, 120 px en pantallas grandes, 60 px en móvil; contenedor de 1200 px |
| Estructura de Inicio | 11 bloques: navbar, hero, banda, vídeo, carta, servicio+cifras, galería, testimonios, delivery, newsletter, pie |
| Estructura de Catálogo | 4 bloques propios + pie compartido: hero, banda de imagen, pestañas+rejilla, cita destacada |
| Núcleo funcional | Pestañas de 3 categorías con rejilla de productos; sin cambio de URL, sin peticiones, todo preinsertado en el DOM |
| Ficha de producto | Dos variantes de un mismo dato: lista sin imagen (Inicio) y rejilla con imagen y CTA (Catálogo) |
| E-commerce real | **Muy limitado**: catálogo + carrito que abre vacío; no se puede añadir ni comprar desde estas páginas |
| Movimiento | Un único patrón de fundido con desplazamiento al entrar en viewport, más carga del hero y marquee infinito |
| Mayor riesgo técnico | Rendimiento del marquee de 14 imágenes y contraste del acento en texto pequeño |
| Mayor laguna respecto al proyecto | Ausencia total de datos de alimentación (alérgenos, formato, conservación), de estados de sistema y de cumplimiento legal |
| Decisión más bloqueante | Si el proyecto incluye compra real o es catálogo de escaparate |

---

## ANEXO B — TABLA DE VALORES EXACTOS (referencia rápida para implementación)

| Concepto | Valor |
|---|---|
| Acento | #cb6037 |
| Texto oscuro | #1a1a1a |
| Texto de párrafo | #707070 |
| Fondo cálido claro | #f5f0ec |
| Gris claro | #f9f9fa |
| Gris | #e9e9e9 |
| Gris oscuro | #afafaf |
| Blanco 50 % | #ffffff80 |
| Gris oscuro 50 % | #afafaf80 |
| Texto de pestaña inactiva | #222 |
| Enlaces y nombre de producto | #000 |
| Familia de titulares | Cormorant Infant |
| Familia de texto | Libre Franklin |
| H1 | 70 px · 72 px ≥1440 · 52 px ≤991 · 46 px ≤767 · peso 700 · LH 1em |
| H2 | 50 px · 42 px ≤991 · 34 px ≤767 · peso 400 · LH 1em · acento |
| H3 | 32 px · 34 px ≥1280 · 36 px ≥1440 · 30 px ≤767 · peso 400 · LH 1.2em |
| H4 | 30 px · 26 px ≤767 · peso 700 · LH 1em · acento |
| H5 | 22 px · peso 500 · LH 1.1em |
| H6 | 20 px · 18 px ≤991 · peso 500 · LH 1.2em · LS .1em |
| Párrafo | 18 px · peso 400 · LH 1.5em · #707070 |
| Párrafo grande | 20 px · LH 1.5em |
| Precio | 18 px · peso 500 · acento |
| Cifra de estadística | 38 px · peso 500 · acento |
| Enlace de navegación | 20 px · peso 500 · #000 |
| Enlace de submenú | 18 px · peso 500 · capitalize |
| Campo de formulario | 14 px · peso 400 |
| Padding de sección | 80 px · 120 px ≥1280 · 60 px ≤767 |
| Padding superior de banner | 180 px · 200 px ≥1280 · 140 px ≤991 |
| Contenedor | máx. 1200 px · padding lateral 15 px |
| Separación título→párrafo | 20 px |
| Margen superior de CTA | 30 px |
| Radio de botón | 5 px |
| Padding de botón | 14 px 30 px |
| Letter-spacing de botón | .5 px |
| Transición de botón | .3s sobre background-color y color |
| Sombras | ninguna |
| Slider: transición | 500 ms |
| Slider: delay | 4000 ms (irrelevante, autoplay desactivado) |
| Slider: autoplay | false |
| Slider: bucle | infinito |
| Slider: diapositivas | 6 |
| Pestañas | 3 · inicial la primera · 8 / 8 / 7 productos |
| Galería | 14 imágenes · 2 pistas · bucle infinito |
| Campo de email | requerido · máx. 256 caracteres · placeholder "Email" · botón "Submit" |
| Breakpoints | ≥1440 · ≥1280 · 992–1279 · ≤991 · ≤767 · ≤479 |

---

**FIN DEL DOCUMENTO**

*Generado a partir del análisis directo de https://italy-128.webflow.io/home-2 y https://italy-128.webflow.io/menu-2. Ninguna otra página del sitio de referencia fue analizada. Este documento no contiene código ni tareas de programación.*
