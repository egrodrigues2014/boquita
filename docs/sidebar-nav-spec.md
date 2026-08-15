# Sidebar Navigation — Especificación de implementación (Light + Dark)

> **Para el agente que implementa:** este documento es la fuente de verdad. Todos los valores
> numéricos y hex fueron medidos directamente en el archivo Figma "Sidebar Navigation Starter Kit
> (Community)". No inventes valores. Donde diga `[APROX]` puedes ajustar; el resto es exacto.
> Entrega: un partial HTML + un CSS + un JS, sin frameworks obligatorios (ver §9–§11).

---

## 1. Resumen del objetivo

Replicar la estructura y el formato visual del sidebar del kit de Figma en dos temas
(**light** y **dark**), aplicándolo al menú real del sitio (pastelería "Boquita"), que tiene
**jerarquía de 2 niveles**: grupos colapsables + subítems.

El kit original es un menú plano de 1 nivel. Este documento define la **extensión a 2 niveles**
reutilizando exactamente los mismos tokens, para que el resultado se vea como si fuera parte del kit.

---

## 2. Fundaciones (design tokens)

### 2.1 Tipografía

| Rol | Familia | Uso |
|---|---|---|
| Headings | **Epilogue** | Títulos de página, no del sidebar |
| Body / UI | **Poppins** | Todo el sidebar |

Import:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Escala tipográfica del kit (ratio 1.2, base 16px):

| Estilo | Size | Line-height | Letter-spacing |
|---|---|---|---|
| Display | 68.8 | 88 | -2% |
| Heading 1 | 57.33 | 88 | 0 |
| Heading 2 | 47.78 | 72 | 2% |
| Heading 3 | 39.81 | 62 | 2% |
| Heading 4 | 33.18 | 48 | 2% |
| Heading 5 | 27.65 | 42 | 2% |
| Heading 6 | 23.04 | 32 | 2% |
| Body L | 19.2 | 32 | 2% |
| Body M | 16 | 24 | 2% |
| Body S | 13.33 | 20 | 2%–4% |
| Button | 13.33 | 24 | 2% |

**Estilo exacto de la etiqueta de un ítem de navegación (medido en Figma):**
`Poppins SemiBold (600) · 16px · line-height 24px · letter-spacing 1%`

### 2.2 Color — paleta completa del kit

**Primary**

| Token | Hex |
|---|---|
| Primary-900 | `#053358` |
| Primary-800 | `#074C83` |
| Primary-700 | `#0966AF` |
| **Primary-600** | **`#0C7FDA`** ← acento activo (light) |
| Primary-500 | `#2196F3` ← color del logo |
| Primary-400 | `#48A8F5` |
| Primary-300 | `#6EBBF7` |
| Primary-200 | `#95CDF9` |
| Primary-100 | `#BCDFFB` |
| Primary-50 | `#CFE8FC` |
| White-200 | `#EFF2F4` |

**Gray**

| Token | Hex |
|---|---|
| Gray-900 | `#1E252B` |
| Gray-800 | `#333F49` |
| Gray-700 | `#485967` |
| **Gray-600** | **`#5D7285`** ← texto/icono en reposo (light) |
| Gray-500 | `#768C9F` |
| Gray-400 | `#91A3B2` |
| Gray-300 | `#ACB9C5` |
| Gray-200 | `#C7D0D8` |
| Gray-100 | `#E2E7EB` |
| Gray-50 | `#EFF2F4` |
| White-100 | `#FFFFFF` |

**Colores fuera de la escala usados en el componente (exactos, no derivar):**

| Uso | Hex |
|---|---|
| Fondo ítem activo, tema light | `#E9F5FE` |
| Fondo del sidebar, tema dark | `#031C30` |
| Fondo ítem activo (dark) y botón Logout (ambos temas) | `#667A8A` |
| Fondo de página, tema light | `#EFF2F4` |
| Fondo de página, tema dark | `#2B4052` |

### 2.3 Geometría (medida en el componente base, no en la instancia escalada)

| Propiedad | Valor |
|---|---|
| Ancho sidebar expandido | **325 px** |
| Ancho sidebar colapsado (Type = Minimize) | **112 px** |
| Padding del sidebar | **32 px** vertical · **24 px** horizontal |
| Layout del sidebar | flex column, `justify-content: space-between` |
| Gap marca → lista de nav | **48 px** |
| Gap entre ítems de la lista | **16 px** |
| Alto del ítem de nav | **48 px** |
| Padding horizontal del ítem | **8 px** (vertical 0) |
| Radio de esquina del ítem | **4 px** |
| Slot del icono principal | **48 × 48 px** (padding 8) |
| Icono principal | **32 × 32 px** |
| Padding del wrapper de la etiqueta | **8 px** |
| Offset del texto respecto al borde del ítem | 8 + 48 + 8 = **64 px** |
| Bloque inferior (toggle + logout) | alto 120 px, **gap 24 px** |
| Radio del panel | 0 |
| Sombra del sidebar (solo light) | `0 4px 40px rgba(0,0,0,.08)` |

### 2.4 Extensión definida por este documento (nivel 2)

No existe en el kit; se deriva para mantener coherencia:

| Propiedad | Valor |
|---|---|
| Alto del subítem | **40 px** |
| Sangría del subítem | `padding-left: 40px` + slot de icono 24 px → el texto cae en **64 px**, alineado con el texto del padre |
| Icono del subítem (opcional) | **20 × 20 px** dentro de slot 24 px |
| Tipografía del subítem | `Poppins Medium (500) · 13.33px / 20px · letter-spacing 2%` |
| Gap entre subítems | **4 px** |
| Gap encabezado → primer subítem | **4 px** |
| Radio del subítem | **4 px** |

---

## 3. Anatomía del sidebar (orden vertical exacto)

```
SIDEBAR (325px, padding 32/24, column, space-between)
├── BLOQUE SUPERIOR (column, gap 48)
│   ├── NAV BRAND        → marca 38×37 (logo) + wordmark opcional, gap 16
│   └── NAV LIST         → column, gap 16
│       ├── NAV GROUP    (nivel 1, 48px, colapsable)
│       │   └── SUBLIST  (column, gap 4)
│       │       └── NAV SUBITEM (nivel 2, 40px)
│       └── NAV LINK     (nivel 1 sin hijos, ej. "Galería")
└── BLOQUE INFERIOR (column, gap 24)
    ├── THEME TOGGLE ROW → icono luna/sol (32) + label + switch, 48px
    └── LOGOUT BUTTON    → 48px, fondo #667A8A, texto blanco (en AMBOS temas)
```

---

## 4. Componente `Nav Item` (nivel 1) — estados exactos

Estructura interna del ítem: `[ slot icono 48 ] [ etiqueta ] ......... [ badge? ] [ chevron? ]`
con `justify-content: space-between`.

### 4.1 Tema LIGHT

| Estado | Fondo | Texto | Icono |
|---|---|---|---|
| Default | transparente | `#5D7285` | `#5D7285` |
| Hover `[APROX]` | `#EFF2F4` | `#333F49` | `#333F49` |
| Active | `#E9F5FE` | `#0C7FDA` | `#0C7FDA` |
| Focus-visible `[APROX]` | igual al estado base | — | outline `2px solid #0C7FDA`, offset 2 |

### 4.2 Tema DARK

| Estado | Fondo | Texto | Icono |
|---|---|---|---|
| Default | transparente | `#EFF2F4` | `#FFFFFF` |
| Hover `[APROX]` | `rgba(255,255,255,.06)` | `#FFFFFF` | `#FFFFFF` |
| Active | `#667A8A` | `#FFFFFF` | `#FFFFFF` |
| Focus-visible `[APROX]` | igual al estado base | — | outline `2px solid #95CDF9`, offset 2 |

> El kit solo define `State = Default | Active`. Hover y focus son adiciones obligatorias
> para web y están marcadas como `[APROX]`.

### 4.3 Badge (opcional, no usado en este menú)

Pastilla al final del ítem: alto 24, padding 0 8, radio 4, `Poppins SemiBold 13.33/20`.
Light: fondo `#FFFFFF`, texto `#0C7FDA`, borde `1px #BCDFFB`. Dark: fondo `#FFFFFF`, texto `#1E252B`. `[APROX]`

### 4.4 Botón Logout

Es un `Nav Item` con `State=Active, Mode=Dark` en **los dos temas**: fondo `#667A8A`,
icono y texto `#FFFFFF`, alto 48, radio 4. No cambia con el tema.

---

## 5. Iconografía

El kit original usa **Iconly (peso Bold)**: iconos macizos de 32×32.
Set recomendado para web con el mismo aspecto: **Material Symbols Rounded con `FILL 1`**.

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0&display=swap" rel="stylesheet">
```

```css
.ms { font-family:'Material Symbols Rounded'; font-weight:400; font-style:normal;
      line-height:1; letter-spacing:normal; text-transform:none; white-space:nowrap;
      direction:ltr; -webkit-font-smoothing:antialiased;
      font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
```

Reglas: nivel 1 → `font-size: 32px`. Nivel 2 → `font-size: 20px`. El color del icono **hereda**
`currentColor` del ítem (nunca lo fijes aparte).

### 5.1 Mapeo icono ↔ ítem del menú

**Nivel 1**

| Ítem | Material Symbols | Iconly Bold (equivalente en el kit) |
|---|---|---|
| Catálogo | `menu_book` | Document |
| Ocasiones | `event` | Calendar |
| Galería | `photo_library` | Image |
| Sobre nosotros | `storefront` | Bag |

**Nivel 2 — Catálogo**

| Ítem | Material Symbols |
|---|---|
| Queques | `cake` |
| Galletas | `cookie` |
| Dulces | `icecream` |

**Nivel 2 — Ocasiones**

| Ítem | Material Symbols |
|---|---|
| Cumpleaños | `celebration` |
| Bodas y bautizos | `favorite` |
| Baby shower | `child_friendly` |
| Oficinas y cafeterías | `local_cafe` |
| Regalos corporativos | `card_giftcard` |
| Navidad | `park` |

**Nivel 2 — Sobre nosotros**

| Ítem | Material Symbols |
|---|---|
| Sobre Boquita | `info` |
| Quién está detrás | `person` |
| Cómo horneamos | `local_fire_department` |
| Qué hay en el catálogo | `list_alt` |
| Presentaciones | `view_carousel` |
| Para qué ocasiones | `event_available` |
| Pedidos y entregas | `local_shipping` |
| Preguntas frecuentes | `help` |
| Escríbeme | `mail` |

**Iconos de sistema**

| Función | Material Symbols |
|---|---|
| Cerrar drawer | `close` |
| Abrir drawer (hamburguesa) | `menu` |
| Carrito | `shopping_bag` |
| Buscar | `search` |
| Tema oscuro / claro | `dark_mode` / `light_mode` |
| Chevron de grupo colapsable | `expand_more` (rota 180° al abrir) |
| Trailing icon opcional del kit | `chevron_right` |

---

## 6. Estructura de contenido a construir

```
Catálogo            (grupo, colapsable)
  Queques
  Galletas
  Dulces
Ocasiones           (grupo, colapsable)
  Cumpleaños
  Bodas y bautizos
  Baby shower
  Oficinas y cafeterías
  Regalos corporativos
  Navidad
Galería             (enlace simple, SIN chevron, SIN sublista)
Sobre nosotros      (grupo, colapsable)
  Sobre Boquita
  Quién está detrás
  Cómo horneamos
  Qué hay en el catálogo
  Presentaciones
  Para qué ocasiones
  Pedidos y entregas
  Preguntas frecuentes
  Escríbeme
```

Reglas de comportamiento:
1. Los grupos son acordeones independientes (varios pueden estar abiertos a la vez).
2. Al cargar, se abre automáticamente el grupo que contiene la página actual.
3. `Galería` se renderiza con el mismo componente de nivel 1 pero como `<a>`, sin chevron.
4. El ítem de la página actual recibe `aria-current="page"` y el estado **Active**.
5. Cuando un subítem está activo, su grupo padre queda abierto y su etiqueta toma el color
   de acento (sin fondo), para señalar la rama activa.

---

## 7. Marcado HTML de referencia

Copiar tal cual y solo cambiar `href`. Sin `<div>` decorativos extra.

```html
<button class="sb-open" type="button" aria-controls="sidebar" aria-expanded="false" aria-label="Abrir menú">
  <span class="ms" aria-hidden="true">menu</span>
</button>

<div class="sb-scrim" data-sb-close hidden></div>

<aside id="sidebar" class="sb" aria-label="Navegación principal" data-state="closed">

  <!-- Barra superior del drawer (móvil / overlay) -->
  <div class="sb-topbar">
    <button class="sb-iconbtn" type="button" data-sb-close aria-label="Cerrar menú">
      <span class="ms" aria-hidden="true">close</span>
    </button>
    <div class="sb-topbar-actions">
      <a class="sb-iconbtn" href="/carrito" aria-label="Carrito">
        <span class="ms" aria-hidden="true">shopping_bag</span>
      </a>
      <button class="sb-iconbtn" type="button" data-sb-search aria-label="Buscar">
        <span class="ms" aria-hidden="true">search</span>
      </button>
    </div>
  </div>

  <!-- BLOQUE SUPERIOR -->
  <div class="sb-top">

    <a class="sb-brand" href="/" aria-label="Boquita — inicio">
      <span class="sb-brand-mark" aria-hidden="true">
        <!-- reemplazar por el SVG del logo, 38x38 -->
        <img src="/logo.svg" alt="" width="38" height="38">
      </span>
      <span class="sb-brand-name">Boquita</span>
    </a>

    <nav class="sb-nav">
      <ul class="sb-list">

        <!-- GRUPO 1 -->
        <li class="sb-group">
          <button class="sb-item sb-item--group" type="button"
                  aria-expanded="false" aria-controls="grp-catalogo">
            <span class="sb-item-icon ms" aria-hidden="true">menu_book</span>
            <span class="sb-item-label">Catálogo</span>
            <span class="sb-item-chevron ms" aria-hidden="true">expand_more</span>
          </button>
          <ul class="sb-sublist" id="grp-catalogo" hidden>
            <li><a class="sb-sub" href="/catalogo/queques"><span class="sb-sub-icon ms" aria-hidden="true">cake</span><span>Queques</span></a></li>
            <li><a class="sb-sub" href="/catalogo/galletas"><span class="sb-sub-icon ms" aria-hidden="true">cookie</span><span>Galletas</span></a></li>
            <li><a class="sb-sub" href="/catalogo/dulces"><span class="sb-sub-icon ms" aria-hidden="true">icecream</span><span>Dulces</span></a></li>
          </ul>
        </li>

        <!-- GRUPO 2 -->
        <li class="sb-group">
          <button class="sb-item sb-item--group" type="button"
                  aria-expanded="false" aria-controls="grp-ocasiones">
            <span class="sb-item-icon ms" aria-hidden="true">event</span>
            <span class="sb-item-label">Ocasiones</span>
            <span class="sb-item-chevron ms" aria-hidden="true">expand_more</span>
          </button>
          <ul class="sb-sublist" id="grp-ocasiones" hidden>
            <li><a class="sb-sub" href="/ocasiones/cumpleanos"><span class="sb-sub-icon ms" aria-hidden="true">celebration</span><span>Cumpleaños</span></a></li>
            <li><a class="sb-sub" href="/ocasiones/bodas-bautizos"><span class="sb-sub-icon ms" aria-hidden="true">favorite</span><span>Bodas y bautizos</span></a></li>
            <li><a class="sb-sub" href="/ocasiones/baby-shower"><span class="sb-sub-icon ms" aria-hidden="true">child_friendly</span><span>Baby shower</span></a></li>
            <li><a class="sb-sub" href="/ocasiones/oficinas-cafeterias"><span class="sb-sub-icon ms" aria-hidden="true">local_cafe</span><span>Oficinas y cafeterías</span></a></li>
            <li><a class="sb-sub" href="/ocasiones/regalos-corporativos"><span class="sb-sub-icon ms" aria-hidden="true">card_giftcard</span><span>Regalos corporativos</span></a></li>
            <li><a class="sb-sub" href="/ocasiones/navidad"><span class="sb-sub-icon ms" aria-hidden="true">park</span><span>Navidad</span></a></li>
          </ul>
        </li>

        <!-- ENLACE SIMPLE -->
        <li>
          <a class="sb-item" href="/galeria">
            <span class="sb-item-icon ms" aria-hidden="true">photo_library</span>
            <span class="sb-item-label">Galería</span>
          </a>
        </li>

        <!-- GRUPO 3 -->
        <li class="sb-group">
          <button class="sb-item sb-item--group" type="button"
                  aria-expanded="false" aria-controls="grp-nosotros">
            <span class="sb-item-icon ms" aria-hidden="true">storefront</span>
            <span class="sb-item-label">Sobre nosotros</span>
            <span class="sb-item-chevron ms" aria-hidden="true">expand_more</span>
          </button>
          <ul class="sb-sublist" id="grp-nosotros" hidden>
            <li><a class="sb-sub" href="/sobre-boquita"><span class="sb-sub-icon ms" aria-hidden="true">info</span><span>Sobre Boquita</span></a></li>
            <li><a class="sb-sub" href="/quien-esta-detras"><span class="sb-sub-icon ms" aria-hidden="true">person</span><span>Quién está detrás</span></a></li>
            <li><a class="sb-sub" href="/como-horneamos"><span class="sb-sub-icon ms" aria-hidden="true">local_fire_department</span><span>Cómo horneamos</span></a></li>
            <li><a class="sb-sub" href="/que-hay-en-el-catalogo"><span class="sb-sub-icon ms" aria-hidden="true">list_alt</span><span>Qué hay en el catálogo</span></a></li>
            <li><a class="sb-sub" href="/presentaciones"><span class="sb-sub-icon ms" aria-hidden="true">view_carousel</span><span>Presentaciones</span></a></li>
            <li><a class="sb-sub" href="/para-que-ocasiones"><span class="sb-sub-icon ms" aria-hidden="true">event_available</span><span>Para qué ocasiones</span></a></li>
            <li><a class="sb-sub" href="/pedidos-y-entregas"><span class="sb-sub-icon ms" aria-hidden="true">local_shipping</span><span>Pedidos y entregas</span></a></li>
            <li><a class="sb-sub" href="/preguntas-frecuentes"><span class="sb-sub-icon ms" aria-hidden="true">help</span><span>Preguntas frecuentes</span></a></li>
            <li><a class="sb-sub" href="/escribeme"><span class="sb-sub-icon ms" aria-hidden="true">mail</span><span>Escríbeme</span></a></li>
          </ul>
        </li>

      </ul>
    </nav>
  </div>

  <!-- BLOQUE INFERIOR -->
  <div class="sb-bottom">
    <button class="sb-item sb-item--toggle" type="button" id="themeToggle"
            role="switch" aria-checked="false">
      <span class="sb-item-icon ms" aria-hidden="true" data-theme-icon>dark_mode</span>
      <span class="sb-item-label" data-theme-label>Modo oscuro</span>
      <span class="sb-switch" aria-hidden="true"><span class="sb-switch-knob"></span></span>
    </button>

    <a class="sb-item sb-item--logout" href="/salir">
      <span class="sb-item-icon ms" aria-hidden="true">logout</span>
      <span class="sb-item-label">Salir</span>
    </a>
  </div>
</aside>
```

---

## 8. CSS completo

```css
/* ============================================================
   TOKENS
   ============================================================ */
:root{
  /* Primary */
  --p-900:#053358; --p-800:#074C83; --p-700:#0966AF; --p-600:#0C7FDA;
  --p-500:#2196F3; --p-400:#48A8F5; --p-300:#6EBBF7; --p-200:#95CDF9;
  --p-100:#BCDFFB; --p-50:#CFE8FC;
  /* Gray */
  --g-900:#1E252B; --g-800:#333F49; --g-700:#485967; --g-600:#5D7285;
  --g-500:#768C9F; --g-400:#91A3B2; --g-300:#ACB9C5; --g-200:#C7D0D8;
  --g-100:#E2E7EB; --g-50:#EFF2F4;
  --white-100:#FFFFFF; --white-200:#EFF2F4;
  /* Exactos del componente */
  --active-bg-light:#E9F5FE;
  --sidebar-dark:#031C30;
  --slate:#667A8A;

  /* Tipografía */
  --font-head:'Epilogue',system-ui,sans-serif;
  --font-body:'Poppins',system-ui,sans-serif;

  /* Geometría (Figma) */
  --sb-w:325px;
  --sb-w-mini:112px;
  --sb-pad-x:24px;
  --sb-pad-y:32px;
  --sb-gap-brand:48px;
  --nav-gap:16px;
  --nav-h:48px;
  --nav-pad-x:8px;
  --nav-radius:4px;
  --icon-slot:48px;
  --icon-size:32px;
  --label-pad:8px;
  --bottom-gap:24px;
  --sb-shadow:0 4px 40px rgba(0,0,0,.08);

  /* Nivel 2 (extensión) */
  --sub-h:40px;
  --sub-gap:4px;
  --sub-indent:40px;
  --sub-icon-slot:24px;
  --sub-icon-size:20px;

  --ease:cubic-bezier(.4,0,.2,1);
  --dur:200ms;
}

/* ============================================================
   TEMAS
   ============================================================ */
[data-theme="light"]{
  --page-bg:var(--white-200);
  --sb-bg:var(--white-100);
  --sb-shadow-on:var(--sb-shadow);

  --nav-fg:var(--g-600);
  --nav-fg-strong:var(--g-800);
  --nav-bg-hover:var(--g-50);
  --nav-fg-hover:var(--g-800);
  --nav-bg-active:var(--active-bg-light);
  --nav-fg-active:var(--p-600);

  --sub-fg:var(--g-500);
  --sub-fg-hover:var(--g-700);
  --sub-bg-hover:var(--g-50);
  --sub-fg-active:var(--p-600);

  --brand-fg:var(--g-900);
  --focus-ring:var(--p-600);
  --scrim:rgba(30,37,43,.45);
  --switch-off:var(--g-200);
  --switch-on:var(--p-500);
}

[data-theme="dark"]{
  --page-bg:#2B4052;
  --sb-bg:var(--sidebar-dark);
  --sb-shadow-on:none;

  --nav-fg:var(--white-200);
  --nav-fg-strong:var(--white-100);
  --nav-bg-hover:rgba(255,255,255,.06);
  --nav-fg-hover:var(--white-100);
  --nav-bg-active:var(--slate);
  --nav-fg-active:var(--white-100);

  --sub-fg:rgba(239,242,244,.72);
  --sub-fg-hover:var(--white-100);
  --sub-bg-hover:rgba(255,255,255,.06);
  --sub-fg-active:var(--white-100);

  --brand-fg:var(--white-100);
  --focus-ring:var(--p-200);
  --scrim:rgba(3,28,48,.6);
  --switch-off:rgba(255,255,255,.24);
  --switch-on:var(--p-500);
}

/* ============================================================
   ICONOS
   ============================================================ */
.ms{
  font-family:'Material Symbols Rounded';
  font-weight:400; font-style:normal; line-height:1;
  letter-spacing:normal; text-transform:none; white-space:nowrap;
  word-wrap:normal; direction:ltr; -webkit-font-smoothing:antialiased;
  font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24;
  display:inline-flex