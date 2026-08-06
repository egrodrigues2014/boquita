# FRONTEND_SPEC.md — Réplica de layout "Restaurant/Shop Home 2"

> **Instrucción para la IA que lee este fichero:**
> Replica EXACTAMENTE la disposición, proporciones, jerarquía visual, espaciados,
> breakpoints y animaciones descritas aquí. El **contenido** (marca, textos, precios,
> imágenes) se sustituye por el de la tienda del proyecto, pero la **estructura y el
> esquema visual no se modifican**. Cada sección incluye medidas exactas: úsalas.
> Si un valor no está especificado, no lo inventes: usa el token global más cercano.

---

## 1. Objetivo y stack

- Landing/Home de una tienda con estética editorial-gastronómica: serif display + sans neutra, acento terracota, mucho aire, imágenes que se solapan entre secciones.
- Stack recomendado: **HTML semántico + CSS puro (o Tailwind con `@theme`) + JS mínimo**. No usar frameworks de UI (Bootstrap/MUI): el diseño es custom.
- Si el proyecto es React/Next: un componente por sección, todos dentro de `app/page.tsx` en el orden del §6.
- Mobile-first NO: el diseño original es **desktop-first con overrides `max-width`**. Replica ese modelo para que coincidan los saltos.

---

## 2. Design tokens

### 2.1 Colores (definir como variables CSS en `:root`)

```css
:root{
  --text-dark:    #1a1a1a;   /* titulares y texto principal */
  --primary:      #cb6037;   /* terracota: acento, h2, h4, precios, botones */
  --primary-light:#f5f0ec;   /* crema: fondos de sección y tarjetas */
  --white:        #ffffff;
  --light-gray:   #f9f9fa;
  --gray:         #e9e9e9;
  --dark-gray:    #afafaf;
  --white-50:     rgba(255,255,255,.5);
  --dark-gray-50: rgba(175,175,175,.5);
  --body-text:    #707070;   /* color de <p> */
}
```

Uso de color por elemento:
- `h1, h3, h5, h6` → `--text-dark`
- `h2, h4` → `--primary`
- `p` → `#707070`
- `a` → `#000`, hover `--primary` (transición `color .3s`)
- Fondo por defecto → `--white`

### 2.2 Tipografías (Google Fonts)

```
Cormorant Infant : 300, 400, 500, 600, 700   → TODOS los titulares (h1–h6)
Libre Franklin   : 300, 400, 500, 600        → body, párrafos, nav, botones, labels
Lato             : 400, 700, 900             → solo blockquote
```

### 2.3 Escala tipográfica

| Elemento | ≥1920 | ≥1440 | ≥1280 | base (992–1279) | ≤991 | ≤767 |
|---|---|---|---|---|---|---|
| `h1` | 70 | 70 | 70 | **70** | 52 | 46 |
| `h1.hero` (clase `h1-hero`) | 86 | 72 | 70 | 70 | 52 | 46 |
| `h2` | 50 | 50 | 50 | **50** | 42 | 34 |
| `h3` | 36 | 36 | 34 | **32** | 32 | 30 |
| `h4` | 30 | 30 | 30 | **30** | 30 | 26 |
| `h5` | 22 | 22 | 22 | **22** | 22 | 22 |
| `h6` | 20 | 20 | 20 | **20** | 18 | 18 |
| `p` | 18 | 18 | 18 | **18** | 18 | 18 |
| `p.lead` | 20 | 20 | 20 | **20** | 20 | 20 |
| `a` | 20 | 20 | 20 | **20** | 20 | 20 |

Reglas base obligatorias:

```css
body{ color:var(--text-dark); font-family:"Libre Franklin",sans-serif; font-size:16px; line-height:1em; }
h1{ font-family:"Cormorant Infant",serif; font-weight:700; font-size:70px; line-height:1em;
    text-transform:uppercase; color:var(--text-dark); margin:10px 0; }
h2{ font-family:"Cormorant Infant",serif; font-weight:400; font-size:50px; line-height:1em;
    text-transform:uppercase; color:var(--primary); margin:10px 0; }
h3{ font-family:"Cormorant Infant",serif; font-weight:400; font-size:32px; line-height:1.2em;
    text-transform:uppercase; color:var(--text-dark); margin-top:10px; }
h4{ font-family:"Cormorant Infant",serif; font-weight:700; font-size:30px; line-height:1em;
    text-transform:uppercase; color:var(--primary); margin:10px 0; }
h5{ font-family:"Cormorant Infant",serif; font-weight:500; font-size:22px; line-height:1.1em;
    text-transform:uppercase; color:var(--text-dark); margin:10px 0; }
h6{ font-family:"Cormorant Infant",serif; font-weight:500; font-size:20px; line-height:1.2em;
    letter-spacing:.1em; text-transform:uppercase; color:var(--text-dark); margin:10px 0; }
p { font-family:"Libre Franklin",sans-serif; font-weight:400; font-size:18px; line-height:1.5em;
    color:#707070; margin:10px 0; }
a { color:#000; font-size:20px; font-weight:500; line-height:1.5em; text-decoration:none;
    display:inline-block; padding:2px 0; transition:color .3s; }
a:hover{ color:var(--primary); }
label{ font-family:"Libre Franklin",sans-serif; font-weight:400; margin-bottom:10px; display:block; }
blockquote{ font-family:Lato,sans-serif; font-size:36px; font-weight:700; line-height:1.2;
    text-align:center; padding:30px 20px 10px; margin:25px 0;
    background:url(quote-icon.svg) 50% 0 no-repeat; }  /* ≤767: 18px */
ul{ display:flex; flex-direction:column; gap:15px; margin:25px 0; color:#707070; font-weight:600; }
li{ display:flex; align-items:center; padding-left:22px; font-size:16px; font-weight:500;
    line-height:1.4em; color:var(--primary);
    background:url(list-bullet.svg) 0 7px no-repeat; }
```

**IMPORTANTE:** el eyebrow (`h6`) del sitio usa la clase `.h6-sans` que **cambia la fuente a Libre Franklin** (manteniendo `letter-spacing:.1em`, uppercase, 20px/500). Variante `.h6-sans.primary` → `color:var(--primary)`.

### 2.4 Breakpoints (exactos, no cambiar)

```
≥1920px  (xl desktop)
≥1440px  (desktop grande)
≥1280px  (desktop)
992–1279 (base / desktop pequeño)
≤991px   (tablet)
≤767px   (móvil landscape)
≤479px   (móvil)
```

### 2.5 Contenedores y ritmo vertical

```css
.container{ max-width:1200px; margin-inline:auto; padding-inline:15px;
            display:flex; flex-direction:column; align-items:center; }
.container--start  { flex:1; align-items:flex-start; }   /* variante hero */
.container--stretch{ align-items:stretch; }              /* variante slider */

.section{ position:relative; padding-block:80px; }
@media (min-width:1280px){ .section{ padding-block:120px; } }
@media (max-width:767px) { .section{ padding-block:60px; } }

.section--no-bottom{ padding-bottom:0; }
```

Ancho de contenido real = 1200 − 30 = **1170px**.

Utilidades usadas: `.mt-20{margin-top:20px}`, `.mt-40{margin-top:30px}`, `.mb--40{margin-bottom:-40px}`, `.text-center{text-align:center}`, `.hidden{display:none}`.

---

## 3. Componentes

### 3.1 Botón primario

```css
.btn{ display:inline-block; padding:14px 30px; border-radius:5px;
      border:1px solid var(--primary); background:var(--primary); color:var(--white);
      text-align:center; letter-spacing:.5px; text-transform:none;
      font-size:20px; font-weight:500; line-height:1.5em;
      transition:background-color .3s, color .3s; }
.btn:hover{ background:var(--white); color:var(--primary); }
.btn--ghost{ background:var(--white); color:var(--primary); }   /* borde primary igual */
.btn--ghost:hover{ background:var(--primary); color:var(--white); }
.btn.mt-40{ margin-top:30px; }
```
Altura resultante ≈ **60px**.

### 3.2 Grupo de botones

```css
.btn-group{ display:flex; gap:30px; margin-top:40px; }
@media (min-width:1280px){ .btn-group{ margin-top:50px; } }
@media (max-width:479px){ .btn-group{ flex-direction:column; gap:25px; } }
```

### 3.3 Input de texto (usado en newsletter, sobre fondo oscuro)

```css
.input{ height:60px; border:1px solid var(--white); border-radius:5px;
        background:transparent; color:var(--white);
        font-size:14px; line-height:1.5em; letter-spacing:2px; margin-bottom:0; }
.input::placeholder{ color:var(--white); text-transform:uppercase; font-size:14px; }
.input:focus{ border-color:var(--primary); }
```

### 3.4 Play button (overlay sobre imagen/vídeo)

Tres capas concéntricas centradas:
```css
.play-wrap{ position:relative; display:flex; justify-content:center; height:100%;
            margin-top:35px; margin-bottom:50px; }
.play-ring   { position:absolute; width:80px;  height:80px; border:1px solid #fff; border-radius:50%; z-index:5; }
.play-ring--h{ position:absolute; width:94px;  height:94px; border:1px solid #fff; border-radius:50%;
               z-index:10; transform:scale(.85); transition:all .3s; }
.play-wrap:hover .play-ring--h{ transform:scale(1); }
.play-icon   { position:relative; z-index:7; color:#fff; font-size:20px; margin-left:4px; } /* ▶ icono */
```

---

## 4. Interacciones y animaciones

1. **Reveal on scroll (`slideInBottom`)** — aplicado a: imagen del hero, eyebrow, h1, párrafo lead, grupo de botones, h2 declarativo, bloque de vídeo, texto del vídeo, imagen ancha, columna izquierda del menú, **cada item del menú (stagger)**, imagen de pasta, bloque de servicio, h2 de galería, h2 de testimonios, slider.
   Implementación: `opacity:0; transform:translate3d(0,100px,0)` → `opacity:1; transform:none`, `duration ~600ms`, `easing ease-out`, `delay` escalonado 0/100/200ms en listas. Usar `IntersectionObserver` (threshold ~0.15, `once:true`).
2. **Parallax horizontal de la galería (scroll-progress)** — dos filas que se desplazan en direcciones opuestas mientras la sección recorre el viewport. Interpolación lineal por progreso de scroll (0→1):

   | progreso | fila 1 `translateX` | fila 2 `translateX` |
   |---|---|---|
   | 0.00 | +25% | −25% |
   | 0.25 | −14% | +14% |
   | 0.50 | −28% | +28% |
   | 1.00 | −32% | +32% |

   Además cada fila tiene un offset estático: fila 1 `left:-15%`, fila 2 `left:-30%`.
3. **Hover del play button** — escala de la anilla exterior `.85 → 1`.
4. **Dropdowns del nav** — apertura/cierre con fade + slide corto (`.3s`).
5. **Hover de enlaces** — `color` a `--primary` en `.3s`.
6. **Hover de enlaces de dropdown** — el texto se desplaza `margin-left:-20px → 0` en `.3s`.
7. Lightbox en la imagen de vídeo y en las 14 fotos de la galería.

---

## 5. Header / Navbar

```
<header class="navbar">
  <div class="nav-container">
    <a class="brand"><img class="logo"></a>
    <div class="nav-menu-wrapper">
      <nav class="nav-menu">
        <div class="nav-overlay-mobile">      <!-- solo visible ≤991 -->
          <div class="close-button-wrap">     <!-- logo mobile + botón cerrar -->
          <div class="nav-dropdown">…</div>   <!-- Dropdown 1 -->
          <div class="nav-dropdown">…</div>   <!-- Dropdown 2 -->
          <a class="nav-link">Enlace simple</a>
          <div class="nav-dropdown">…</div>   <!-- Dropdown 3 -->
        </div>
      </nav>
    </div>
    <div class="navbar-actions">
      <form class="nav-search" action="/tienda" method="get">…</form>
      <button class="cart-button"><img class="cart-icon"></button>
      <a class="btn btn--nav">CTA</a>          <!-- oculto ≤991 -->
    </div>
    <button class="menu-button"><img burger></button>  <!-- visible ≤991 -->
  </div>
</header>
```

CSS:
```css
.navbar{ position:absolute; top:0; width:100%; padding-block:20px; background:transparent; z-index:100; }
.nav-container{ display:flex; justify-content:space-between; align-items:center;
                min-width:100%; padding-inline:15px; }
@media (min-width:1280px){ .nav-container{ padding-inline:50px; } }
@media (min-width:1920px){ .nav-container{ padding-inline:80px; } }

.logo{ height:43px; }
.nav-menu-wrapper{ flex:1; display:flex; justify-content:center; align-items:center; }
@media (min-width:1280px){ .nav-menu-wrapper{ justify-content:space-around; } }
@media (min-width:1920px){ .nav-menu-wrapper{ justify-content:flex-start; padding-left:170px; } }

.nav-link,.nav-dropdown-toggle{ font-family:"Libre Franklin",sans-serif; font-size:20px;
                                font-weight:500; padding-inline:13px; }
@media (min-width:1280px){ .nav-link,.nav-dropdown-toggle{ padding-inline:12px; } }
@media (min-width:1440px){ .nav-link,.nav-dropdown-toggle{ padding-inline:20px; } }

.nav-dropdown-list{ width:200px; padding:15px 20px; background:#fff; border:1px solid rgba(0,0,0,.18); }
.nav-dropdown-link{ display:flex; width:100%; padding:8px 8px 8px 0; margin-left:-20px;
                    font-size:18px; font-weight:500; text-transform:capitalize; transition:all .3s; }
.nav-dropdown-link:hover{ margin-left:0; color:var(--primary); }
.nav-dropdown-link-line{ display:inline-block; width:16px; height:2px; margin-right:15px;
                         background:var(--primary); }   /* guion decorativo, oculto ≤991 */

.navbar-actions{ display:flex; align-items:center; gap:15px; }
@media (min-width:1280px){ .navbar-actions{ gap:20px; } }
@media (min-width:1440px){ .navbar-actions{ gap:40px; } }
@media (min-width:1920px){ .navbar-actions{ gap:50px; } }
.cart-icon{ width:34px; height:34px; transition:filter .3s; }
.cart-button:hover .cart-icon{ opacity:.5; }
.nav-search{ display:flex; min-width:220px; height:46px; }
@media (max-width:991px){ .nav-search{ display:none; } }

/* ≤991: menú lateral fijo desde la izquierda */
@media (max-width:991px){
  .nav-menu{ position:fixed; inset:0 auto 0 0; width:320px; background:#fff;
             display:flex; flex-direction:column; }
  .nav-overlay-mobile{ background:#fff; display:flex; flex-direction:column;
                       padding:13px 15px 0; }
  .nav-link{ display:flex; width:100%; padding:10px 0; }
  .nav-dropdown-list{ position:static; width:320px; border:0; padding:0 40px 0 20px;
                      display:flex; flex-direction:column; }
  .nav-dropdown-list--mega{ width:100%; height:270px; overflow:scroll; }
  .close-button-wrap{ display:flex; justify-content:space-between; align-items:center;
                      height:60px; margin-bottom:10px; }
  .btn--nav{ display:none; }
  .navbar-actions{ justify-content:flex-end; margin-right:20px; }
  .cart-icon{ width:32px; height:32px; }
}
@media (max-width:767px){ .cart-icon{ width:30px; height:30px; } }
@media (max-width:479px){ .navbar-actions{ margin-right:15px; } }
```

---

## 6. Secciones: orden y especificación

Orden exacto en el `<body>`:

```
1  header.navbar                (absoluto, sobre el hero)
2  section.hero                 100vh, split imagen derecha
3  section.statement            frase grande centrada con imágenes inline
4  section.media-text           vídeo/imagen + texto (2 col)
5  wrapper                      { imagen ancha } + { bloque crema: MENÚ }
6  section.service              imagen que sobresale + texto + métricas
7  section.gallery              título + 2 filas de fotos con parallax
8  section.testimonials         título + slider 3 tarjetas
9  footer                       tarjeta CTA solapada + bloque negro
```

---

### 6.1 HERO — split 50/50 con imagen a sangre derecha

```html
<section class="hero">
  <img class="hero-img" src="…" alt="">
  <div class="container container--start">
    <div class="hero-content">
      <h6 class="h6-sans primary">EYEBROW / CATEGORÍA</h6>
      <h1 class="h1-hero">PRIMERA LÍNEA<br><span class="text-primary">SEGUNDA LÍNEA</span></h1>
      <p class="lead mt-20">Párrafo de 2–3 líneas…</p>
      <div class="btn-group">
        <a class="btn">CTA principal</a>
        <a class="btn btn--ghost">CTA secundaria</a>
      </div>
    </div>
  </div>
</section>
```

```css
.hero{ position:relative; display:flex; flex-direction:row;
       justify-content:flex-start; align-items:center; height:100vh; }
.hero-img{ position:absolute; inset:0 0 0 auto; width:43.5%; height:100%; object-fit:cover; }
.hero-content{ width:53%; display:block; }

@media (min-width:1280px){ .hero-img{ width:46%; }   .hero-content{ width:50%; } }
@media (min-width:1440px){ .hero-img{ width:38%; }   .hero-content{ width:57%; } }
@media (min-width:1920px){ .hero-img{ width:39%; }   .hero-content{ width:64%; } }

@media (max-width:991px){
  .hero{ flex-direction:column; justify-content:space-between; align-items:flex-start; height:auto; }
  .hero-img{ position:static; width:100%; height:420px; margin-bottom:60px; }
  .hero-content{ width:90%; margin-inline:auto; text-align:center;
                 display:flex; flex-direction:column; justify-content:center; align-items:center; }
}
@media (max-width:767px){ .hero-img{ height:360px; margin-bottom:40px; } .hero-content{ width:100%; } }
@media (max-width:479px){ .hero-img{ height:320px; } }
```

Notas de diseño:
- El `h1` va en **dos líneas**: la primera en `--text-dark`, la segunda en `--primary` (`.text-primary{color:var(--primary)}`). Uppercase por herencia.
- El navbar flota sobre la mitad izquierda (fondo claro), por eso los links son oscuros.
- Imagen recomendada: vertical/retrato, ratio ≈ 3:4 o mayor, `object-fit:cover`.

---

### 6.2 STATEMENT — frase grande con imágenes incrustadas en el texto

Sección `.section.section--no-bottom`. Un único `h2` centrado a todo el ancho del contenedor, con **dos `<span>` inline que muestran una foto pequeña dentro del flujo del texto**.

```html
<section class="section section--no-bottom">
  <div class="container">
    <h2 class="text-center">
      Primera parte de la frase <span class="inline-img inline-img--1"></span>
      segunda parte de la frase <span class="inline-img inline-img--2"></span>
      cierre de la frase.
    </h2>
  </div>
</section>
```

```css
.inline-img{ display:inline-block; width:100px; height:1em;      /* ocupa una "palabra" */
             background-position:50%; background-repeat:no-repeat; background-size:auto;
             -webkit-text-fill-color:inherit; }
.inline-img--1{ background-image:url(inline-1.webp); }
.inline-img--2{ background-image:url(inline-2.webp); }
```

Notas: las imágenes son recortes pequeños (≈100px de ancho, altura de línea) de producto sobre fondo blanco. La frase es un `h2` (50px, terracota, uppercase, `line-height:1em`) y suele ocupar **3 líneas** en desktop.

---

### 6.3 MEDIA + TEXTO — grid 2 columnas asimétrico

```html
<section class="section">
  <div class="container">
    <div class="media-text">
      <div class="media">                <!-- background-image, altura fija -->
        <a class="play-wrap" data-lightbox>
          <div class="play-ring"></div>
          <div class="play-ring--h"></div>
          <div class="play-icon">▶</div>
        </a>
      </div>
      <div class="media-copy">
        <h2>Titular en dos líneas</h2>
        <p class="mt-20 w-90-desktop">Párrafo corto.</p>
      </div>
    </div>
  </div>
</section>
```

```css
.media-text{ display:grid; grid-template-columns:.9fr 1fr; column-gap:60px;
             grid-template-rows:auto; width:100%; align-items:center; }
.media{ height:300px; display:flex; justify-content:center; align-items:center;
        background:url(media.webp) 50%/cover no-repeat; }

@media (min-width:1440px){ .media-text{ grid-template-columns:.8fr 1fr; }
                           .w-90-desktop{ width:90%; } }
@media (max-width:991px){  .media-text{ column-gap:40px; } }
@media (max-width:767px){  .media-text{ display:flex; flex-direction:column; row-gap:40px; }
                           .media-copy{ text-align:center; } }
```

Medidas de referencia a 1440px: columna izquierda ≈ 493×300px, columna derecha ≈ 617px.

---

### 6.4 IMAGEN ANCHA + BLOQUE CREMA (MENÚ / CATÁLOGO) — solape vertical

Estructura clave: un **wrapper sin padding** con dos hijos; el segundo (fondo crema) sube con `margin-top` negativo, de forma que la imagen ancha **queda flotando sobre el fondo crema**.

```html
<div class="overlap-wrapper">
  <div class="wide-img-block">
    <div class="container"><img class="wide-img" src="…" alt=""></div>
  </div>

  <div class="cream-block">
    <div class="container">
      <div class="menu-layout">
        <div class="menu-intro">
          <h6 class="h6-sans">EYEBROW</h6>
          <h2>TÍTULO DE SECCIÓN</h2>
          <p class="mt-20">Descripción corta.</p>
        </div>
        <div class="menu-list-wrap">
          <ul class="menu-grid">
            <li class="menu-item">
              <div class="menu-item-head">
                <a class="menu-item-name">NOMBRE PRODUCTO</a>
                <div class="menu-item-price">$ 00.00 USD</div>
              </div>
              <div class="menu-item-tag">Categoría</div>
            </li>
            <!-- 8 items -->
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
```

```css
.wide-img{ width:100%; height:auto; display:block;
           position:relative; z-index:1; }   /* z-index obligatorio: va por encima del crema */

.cream-block{ background:var(--primary-light);
              margin-top:-200px; padding-top:250px; padding-bottom:130px; }
@media (min-width:1280px){ .cream-block{ padding-bottom:170px; } }
@media (max-width:991px) { .cream-block{ margin-top:-150px; padding-top:190px; } }
@media (max-width:767px) { .cream-block{ margin-top:-100px; padding-top:140px; } }

.menu-layout{ display:flex; gap:40px; width:100%; }
.menu-intro   { width:36%; }
.menu-list-wrap{ width:60%; margin-top:10px; }
@media (min-width:1280px){ .menu-layout{ gap:80px; } .menu-intro{ width:32%; } }
@media (max-width:991px) { .menu-layout{ flex-direction:column; }
                           .menu-intro{ width:80%; }
                           .menu-list-wrap{ width:100%; margin-top:40px; } }

.menu-grid{ display:grid; grid-template-columns:1.2fr 1fr;
            column-gap:80px; row-gap:30px; margin:0; }
@media (min-width:1280px){ .menu-grid{ column-gap:70px; } }
@media (min-width:1440px){ .menu-grid{ column-gap:60px; } }
@media (max-width:767px) { .menu-grid{ display:flex; flex-direction:column; } }

.menu-item{ background:none; padding:0; display:block; }   /* resetear estilos de li globales */
.menu-item-head { display:flex; justify-content:flex-start; align-items:flex-start; gap:10px; }
.menu-item-name { font-size:18px; text-transform:uppercase; color:#000; }
.menu-item-name:hover{ color:var(--primary); }
.menu-item-price{ font-size:18px; font-weight:500; line-height:1.5em; color:var(--primary);
                  padding-block:2px; }
.menu-item-tag  { margin-top:5px; line-height:1.5em; color:var(--text-dark); }
@media (min-width:1280px){ .menu-item-name,.menu-item-price{ font-size:20px; }
                           .menu-item-tag{ font-size:18px; } }
@media (max-width:767px) { .menu-item-head{ justify-content:space-between; } }
```

Notas §6.4:
- **8 items** en 2 columnas × 4 filas. Cada item = nombre (uppercase, enlace a la ficha de
  producto) + precio en terracota en la misma línea con `gap:10px`, y debajo una etiqueta de
  categoría en `--text-dark`.
- En ≤767px la rejilla pasa a **lista vertical** y el nombre y el precio se separan a los
  extremos (`justify-content:space-between`).
- La imagen ancha debe tener ratio panorámico (≈ **2.9 : 1**, p. ej. 1170×400) y ancho completo
  del contenedor (1170px). No lleva `border-radius`.
- El `z-index:1` de `.wide-img` es obligatorio: sin él el fondo crema se pinta encima.

---

### 6.5 SERVICIO / SOBRE NOSOTROS — imagen que sobresale + métricas

La imagen izquierda **sube 130/170px** invadiendo el bloque crema anterior, y la sección
compensa con `margin-bottom` negativo.

```html
<section class="section section--overlap-up">
  <div class="container">
    <div class="service-grid">
      <img class="service-img" src="…" alt="">
      <div class="service-copy">
        <h6 class="h6-sans">EYEBROW</h6>
        <h2>TÍTULO EN DOS LÍNEAS</h2>
        <p class="mt-20">Párrafo breve.</p>
        <div class="stats">
          <div><div class="stat-num">20k+</div><p>Etiqueta 1</p></div>
          <div><div class="stat-num">4k+</div><p>Etiqueta 2</p></div>
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.section--overlap-up{ padding-bottom:0; margin-bottom:-130px; }
@media (min-width:1280px){ .section--overlap-up{ margin-bottom:-170px; } }
@media (max-width:991px) { .section--overlap-up{ margin-bottom:0; } }

.service-grid{ display:grid; grid-template-columns:1fr 1fr; grid-template-rows:auto;
               column-gap:50px; width:100%; }
@media (min-width:1280px){ .service-grid{ column-gap:90px; } }
@media (max-width:991px) { .service-grid{ display:flex; flex-direction:column; align-items:flex-start; } }

.service-img{ position:relative; top:-130px; width:100%; height:auto; object-fit:cover; }
@media (min-width:1280px){ .service-img{ top:-170px; } }
@media (max-width:991px) { .service-img{ width:65%; margin-inline:auto; } }
@media (max-width:479px) { .service-img{ width:100%; } }

.service-copy{ display:flex; flex-direction:column; justify-content:center; }
@media (max-width:991px){ .service-copy{ width:80%; align-self:center; text-align:center;
                                         margin-top:-80px; } }
@media (max-width:767px){ .service-copy{ width:100%; align-items:center; text-align:center;
                                         margin-top:-100px; } }

.stats{ display:grid; grid-template-columns:1fr 1fr; grid-template-rows:auto;
        column-gap:0; margin-top:30px; }
@media (min-width:1280px){ .stats{ width:90%; } }
@media (max-width:991px) { .stats{ width:90%; margin-inline:auto; } }
@media (max-width:767px) { .stats{ margin-top:20px; } }
@media (max-width:479px) { .stats{ width:100%; column-gap:20px; } }

.stat-num{ color:var(--primary); font-size:42px; font-weight:500; line-height:1em; }
@media (min-width:1280px){ .stat-num{ font-size:50px; } }
@media (max-width:991px) { .stat-num{ font-size:38px; } }
@media (max-width:479px) { .stat-num{ font-size:36px; } }
```

Medidas de referencia a 1440px: imagen **540×624** (ratio ≈ 0.87, retrato suave); columna de
texto 540px. Las dos métricas van lado a lado, número en terracota + `<p>` descriptivo debajo.

---

### 6.6 GALERÍA — dos filas desbordadas con parallax horizontal

```html
<section class="section section--no-bottom">
  <div class="container"><h2>GALERÍA</h2></div>

  <div class="gallery" data-parallax>
    <div class="gallery-row gallery-row--1">
      <div class="scroller">
        <div class="track track--1">
          <a class="gallery-item" data-lightbox><img class="gallery-img" src="…" alt=""></a>
          <!-- 7 items -->
        </div>
      </div>
    </div>
    <div class="gallery-row gallery-row--2">
      <div class="scroller">
        <div class="track track--2">
          <!-- 7 items -->
        </div>
      </div>
    </div>
  </div>
</section>
```

```css
.gallery-row--1{ margin-top:40px; }
.gallery-row--2{ margin-top:25px; }
@media (min-width:1280px){ .gallery-row--2{ margin-top:33px; } }
@media (min-width:1440px){ .gallery-row--2{ margin-top:38px; } }
@media (min-width:1920px){ .gallery-row--2{ margin-top:56px; } }
@media (max-width:991px) { .gallery-row--2{ margin-top:20px; margin-left:0; } }
@media (max-width:767px) { .gallery-row--2{ margin-top:30px; } }
@media (max-width:479px) { .gallery-row--2{ margin-top:23px; } }

.scroller{ position:relative; overflow:hidden; }

.track{ display:flex; gap:25px; margin-inline:15px; position:relative;
        will-change:transform; }
.track--1{ left:-15%; }
.track--2{ left:-30%; }
@media (min-width:1280px){ .track{ gap:33px; } }
@media (min-width:1440px){ .track{ gap:38px; } }
@media (min-width:1920px){ .track{ gap:56px; margin-inline:50px; } }
@media (max-width:991px) { .track{ gap:20px; } }
@media (max-width:767px) { .track{ gap:30px; } }
@media (max-width:479px) { .track{ gap:23px; } }

.gallery-item{ flex:none; max-width:23%; max-height:200px; overflow:hidden; padding-block:0; }
@media (min-width:1280px){ .gallery-item{ max-height:240px; } }
@media (min-width:1440px){ .gallery-item{ max-height:260px; } }
@media (min-width:1920px){ .gallery-item{ max-width:25%; max-height:290px; } }
@media (max-width:767px) { .gallery-item{ max-width:47%; } }

.gallery-img{ width:100%; height:100%; object-fit:cover; }
```

Notas clave:
- **7 items por fila**. Como cada uno mide 23% del ancho, la fila **desborda a propósito**
  (≈161%) y `.scroller{overflow:hidden}` la recorta: se ven ~4 fotos completas y 2 cortadas
  por los bordes. Ese recorte es parte del diseño, no un bug.
- Usa **4 imágenes únicas por fila** y repítelas hasta 7 para conseguir el efecto de tira.
- Ratio de foto: **4:3 horizontal** (a 1440px cada item mide 321×239).
- La sección **no tiene padding inferior**; el bloque de galería sangra fuera del contenedor
  (ocupa el 100% del viewport, no los 1170px).
- Parallax: aplica la tabla de `translateX` del §4.2 según el progreso de scroll de la sección.
  Fila 1 se mueve de derecha a izquierda, fila 2 al contrario.
- Cada foto abre lightbox al hacer clic.

---

### 6.7 TESTIMONIOS — slider de 3 tarjetas con flechas + línea

```html
<section class="section">
  <div class="container container--stretch">
    <h2 class="mb--40 w-50-tablet">LO QUE DICEN NUESTROS CLIENTES</h2>

    <div class="slider">
      <div class="slider-mask">
        <div class="slide">
          <article class="review-card">
            <div class="review-head">
              <img class="review-avatar" src="…" alt="">
              <div>
                <div class="review-name">Nombre</div>
                <div class="review-role">Cargo</div>
              </div>
            </div>
            <p>Texto de la reseña…</p>
          </article>
        </div>
        <!-- 6 slides -->
      </div>
      <button class="slider-arrow slider-arrow--left">‹</button>
      <button class="slider-arrow slider-arrow--right">›</button>
      <div class="slider-line"></div>
    </div>
  </div>
</section>
```

```css
.slider{ position:relative; width:100%; height:100%; padding-top:95px;
         background:transparent; justify-content:space-between; overflow:hidden; }
@media (max-width:479px){ .slider{ margin-top:30px; padding-top:75px; } }

.slider-mask{ display:flex; width:100%; height:100%; }
.slide{ flex:none; width:32%; margin-right:20px; }
@media (min-width:1280px){ .slide{ margin-right:30px; } }
@media (max-width:991px) { .slide{ width:49%; } }
@media (max-width:767px) { .slide{ width:100%; } }

.review-card{ width:100%; min-height:420px; padding:25px 22px;
              background:var(--primary-light); }
@media (min-width:1280px){ .review-card{ min-height:398px; padding:30px 30px 25px; } }
@media (max-width:991px) { .review-card{ min-height:393px; padding-inline:25px; } }
@media (max-width:767px) { .review-card{ min-height:312px; } }
@media (max-width:479px) { .review-card{ min-height:420px; } }

.review-head{ display:flex; align-items:flex-start; margin-bottom:20px; }
.review-avatar{ width:70px; height:70px; margin-right:20px; border-radius:0; object-fit:cover; }
.review-name{ font-size:20px; font-weight:600; line-height:1.5em; }
@media (min-width:1280px){ .review-name{ font-size:22px; font-weight:500; } }
.review-role{ margin-top:5px; font-size:18px; line-height:1.5em; }

/* Flechas: círculos outline en la esquina superior derecha, dentro del padding-top de 95px */
.slider-arrow{ position:absolute; top:0; width:34px; height:34px; border-radius:50px;
               border:1px solid var(--primary); color:var(--primary); font-size:20px;
               background:transparent; display:flex; align-items:center; justify-content:center; }
.slider-arrow--left { right:218px; }
.slider-arrow--right{ right:0; }
@media (min-width:1280px){ .slider-arrow:hover{ border-color:var(--text-dark); color:var(--text-dark); } }
@media (max-width:479px) { .slider-arrow--left{ right:auto; left:0; } }

/* Línea horizontal fina que conecta las dos flechas */
.slider-line{ position:absolute; top:17px; right:48px; width:160px; height:1px;
              background:var(--primary); }
@media (max-width:991px){ .slider-line{ top:57px; } }
@media (max-width:479px){ .slider-line{ width:260px; right:51px; margin-inline:auto; } }
```

Notas:
- **6 slides**, se ven **3 a la vez** en desktop (32% + 30px de gap), **2** en tablet (49%),
  **1** en móvil. Deslizamiento por slide, sin autoplay, sin bullets visibles
  (los puntos existen pero están ocultos con `display:none`).
- El `h2` lleva `margin-bottom:-40px`; combinado con `padding-top:95px` del slider deja las
  flechas alineadas verticalmente con el titular, en el extremo derecho.
- Las tarjetas **no tienen** `border-radius` ni sombra: solo fondo crema.
- Los textos de reseña tienen longitud variable; `min-height` fija la altura de la tarjeta.

---

### 6.8 FOOTER — tarjeta CTA solapada sobre bloque negro

```html
<footer class="footer">
  <!-- 1) Tarjeta CTA: 2 columnas 50/50, fondo crema, dentro del contenedor -->
  <div class="cta-wrapper">
    <div class="container">
      <div class="cta-card">
        <div class="cta-copy">
          <h2>TITULAR CTA<br>EN DOS LÍNEAS</h2>
          <p class="mt-20">Frase de apoyo.</p>
          <a class="btn mt-40">Botón CTA</a>
        </div>
        <img class="cta-img" src="…" alt="">
      </div>
    </div>
  </div>

  <!-- 2) Bloque negro: sube y pasa por detrás de la tarjeta -->
  <div class="footer-dark">
    <div class="container">
      <div class="newsletter">
        <h4>SUSCRÍBETE A LA NEWSLETTER</h4>
        <div class="newsletter-form-wrap">
          <form class="newsletter-form">
            <input class="input" type="email" placeholder="Email" required>
            <button class="btn btn--footer" type="submit">Enviar</button>
          </form>
        </div>
      </div>

      <div class="footer-cols">
        <div class="footer-brand-col">
          <a class="footer-brand"><img class="footer-logo" src="…" alt=""></a>
          <p class="footer-brand-text">Descripción breve de la marca.</p>
          <div class="footer-social">
            <a class="social-icon">IG</a><a class="social-icon">FB</a>
            <a class="social-icon">MAIL</a><a class="social-icon social-icon--last">X</a>
          </div>
        </div>

        <div class="footer-right-col">
          <nav class="footer-links">
            <a class="footer-link">Home</a><a class="footer-link">Sobre nosotros</a>
            <a class="footer-link">Catálogo</a><a class="footer-link">Tienda</a>
            <a class="footer-link">Blog</a>
          </nav>
          <div class="footer-contact">
            <div class="footer-address">Dirección postal completa</div>
            <div>
              <a class="footer-phone">Teléfono 1</a>
              <a class="footer-phone footer-phone--last">Teléfono 2</a>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-rights">
        <div class="footer-copy">© Marca. Todos los derechos reservados. <a>Licencia</a></div>
      </div>
    </div>
  </div>
</footer>
```

```css
.footer{ background:var(--white); text-align:center; }
.cta-wrapper{ padding:0; }

.cta-card{ display:grid; grid-template-columns:1fr 1fr; grid-template-rows:auto;
           gap:0; width:100%; background:var(--primary-light);
           position:relative; z-index:1; }
.cta-copy{ display:flex; flex-direction:column; align-items:flex-start; text-align:left;
           padding:40px 40px 50px; }
@media (min-width:1280px){ .cta-copy{ padding-left:50px; padding-right:55px; } }
@media (max-width:767px) { .cta-copy{ text-align:center; align-items:center;
                                      justify-content:center; } }
@media (max-width:479px) { .cta-copy{ padding:30px 30px 40px; } }
.cta-img{ width:100%; height:100%; object-fit:cover; }

.footer-dark{ background:var(--text-dark); margin-top:-198px;
              padding-top:275px; padding-bottom:60px; }
@media (min-width:1280px){ .footer-dark{ padding-top:315px; } }
@media (max-width:767px) { .footer-dark{ margin-top:-258px; padding-top:315px; } }

/* Newsletter: centrada */
.newsletter{ width:100%; }
.newsletter-form-wrap{ margin-top:40px; margin-bottom:80px; }
@media (min-width:1280px){ .newsletter-form-wrap{ margin-bottom:100px; } }
.newsletter-form{ display:flex; align-items:center; gap:30px; width:560px; margin-inline:auto; }
.newsletter-form .input{ flex:1; }
@media (max-width:767px){ .newsletter-form{ width:100%; } }
@media (max-width:479px){ .newsletter-form{ flex-direction:column; row-gap:30px; } }
.btn--footer{ font-size:20px; font-weight:500; line-height:1.5em; }

/* Columnas */
.footer-cols{ display:flex; justify-content:flex-start; gap:60px; width:100%; margin-bottom:50px; }
@media (min-width:1280px){ .footer-cols{ gap:100px; } }
@media (min-width:1440px){ .footer-cols{ gap:140px; } }
@media (min-width:1920px){ .footer-cols{ justify-content:space-around; } }
@media (max-width:991px) { .footer-cols{ flex-wrap:wrap; } }
@media (max-width:479px) { .footer-cols{ margin-bottom:10px; } }

.footer-brand-col{ display:flex; flex-direction:column; align-items:flex-start; width:37%; }
@media (min-width:1280px){ .footer-brand-col{ width:34%; } }
@media (max-width:991px) { .footer-brand-col{ width:80%; margin:0 auto 50px; text-align:center;
                                              align-items:center; justify-content:center; } }
@media (max-width:767px) { .footer-brand-col{ width:100%; flex-wrap:wrap; margin-bottom:40px; } }
.footer-brand{ margin-bottom:20px; color:#fff; }
.footer-logo{ height:36px; }
.footer-brand-text{ color:var(--white); font-size:18px; text-align:left; }
@media (max-width:991px){ .footer-brand-text{ text-align:center; } }

.footer-social{ display:flex; justify-content:center; align-items:center; margin-top:40px; }
@media (max-width:991px){ .footer-social{ margin-top:10px; } }
@media (max-width:767px){ .footer-social{ width:100%; margin-top:30px; } }
.social-icon{ color:var(--primary); font-size:20px; margin-right:30px; transition:all .3s; }
.social-icon:hover{ color:var(--white); }
.social-icon--last{ margin-right:0; }

.footer-right-col{ width:57%; }
@media (max-width:991px){ .footer-right-col{ width:100%; } }

.footer-links{ display:flex; align-items:flex-start; gap:40px; margin-bottom:60px; }
@media (min-width:1280px){ .footer-links{ gap:50px; } }
@media (max-width:991px) { .footer-links{ justify-content:center; gap:50px; } }
@media (max-width:479px) { .footer-links{ flex-direction:column; align-items:center;
                                          gap:10px; margin-bottom:30px; } }
.footer-link{ color:var(--white); padding-block:10px; transition:all .3s; }
.footer-link:hover{ color:var(--primary); }

.footer-contact{ display:flex; justify-content:space-between; }
@media (max-width:991px){ .footer-contact{ width:80%; margin-inline:auto; } }
@media (max-width:767px){ .footer-contact{ width:100%; } }
@media (max-width:479px){ .footer-contact{ flex-direction:column; align-items:center;
                                           row-gap:25px; text-align:center; } }
.footer-address{ color:var(--primary); font-size:18px; font-weight:500; line-height:1.5em;
                 text-align:left; }
@media (min-width:1440px){ .footer-address{ font-size:20px; } }
@media (max-width:479px) { .footer-address{ text-align:center; } }
.footer-phone{ display:block; color:var(--primary); font-size:18px; padding-block:0; }
.footer-phone:hover{ color:var(--white); }
.footer-phone--last{ margin-top:10px; }

.footer-rights{ display:flex; flex-wrap:wrap; justify-content:center; align-items:center;
                width:100%; }
@media (min-width:1280px){ .footer-rights{ margin-top:30px; } }
@media (max-width:479px) { .footer-rights{ margin-top:40px; } }
.footer-copy{ color:var(--white); font-size:18px; line-height:1.5em; width:100%;
              margin-bottom:10px; }
@media (min-width:1440px){ .footer-copy{ font-size:20px; } }
.footer-copy a{ color:#fff; font-size:18px; letter-spacing:.2px; margin-right:5px;
                display:inline; transition:all .2s; }
.footer-copy a:hover{ color:var(--primary); }
```

Notas:
- El **solape de −198px** (móvil −258px) es la firma visual del footer: la tarjeta crema flota
  mitad sobre blanco, mitad sobre negro. Requiere `z-index:1` en `.cta-card`.
- Tarjeta CTA a 1440px: **585 + 585 px**, altura ≈ 384px (imagen ratio ≈ 1.52:1, `cover`).
- Todo el footer hereda `text-align:center` salvo los bloques que lo sobreescriben.
- Los iconos sociales son fuente de iconos en el original; usa SVG inline con
  `fill:currentColor` para respetar el hover.

---

## 7. Inventario de assets y ratios

| Asset | Uso | Medida / ratio |
|---|---|---|
| Logo header | `.logo` | altura **43px** (ancho libre, ≈99px) |
| Logo footer | `.footer-logo` | altura **36px** |
| Icono carrito | header | **34×34** (32 ≤991, 30 ≤767) |
| Icono burger | header ≤991 | **27×16** |
| Imagen hero | `.hero-img` | retrato, ratio ≈ **3:4** o más alto, `cover`, mín. 1000px de alto |
| 2 recortes inline | `.inline-img` | ~**100px** de ancho, fondo blanco, producto centrado |
| Imagen media/vídeo | `.media` (background) | horizontal ≈ **5:3**, se renderiza 493×300 |
| Imagen ancha | `.wide-img` | panorámica ≈ **2.9:1** (p. ej. 1170×400) |
| Imagen servicio | `.service-img` | ratio ≈ **0.87** (retrato suave), 540×624 |
| Galería fila 1 | 4 únicas ×7 | **4:3** horizontal, 321×239 |
| Galería fila 2 | 4 únicas ×7 | **4:3** horizontal |
| Avatares reseñas | `.review-avatar` | **70×70** cuadrado, sin redondear |
| Imagen CTA footer | `.cta-img` | ratio ≈ **1.5:1**, 585×384, `cover` |

Formato: **WebP** con fallback opcional; `loading="lazy"` en todo menos el hero;
`sizes`/`srcset` recomendado en hero, imagen ancha y galería.

---

## 8. Mapeo de contenido para la nueva tienda

Sustituye solo el contenido; **conserva el número de elementos** para que el layout cuadre.

| Bloque | Contenido a sustituir | Cantidad obligatoria |
|---|---|---|
| Nav | 4 dropdowns + 1 enlace simple + teléfono + carrito + CTA | mantener 5 entradas |
| Hero | eyebrow, titular en 2 líneas, párrafo 2–3 líneas, 2 botones | 2 botones |
| Statement | 1 frase larga con 2 huecos de imagen | exactamente 2 `.inline-img` |
| Media+texto | 1 imagen con play, titular, párrafo | 1 |
| Imagen ancha | 1 foto panorámica de ambiente/tienda | 1 |
| Catálogo | eyebrow, título, párrafo, 8 productos (nombre, precio, categoría) | **8 productos** |
| Servicio | eyebrow, título, párrafo, 2 métricas | **2 métricas** |
| Galería | 8 fotos únicas (4 por fila), repetidas hasta 7 por fila | 8 únicas |
| Testimonios | 6 reseñas (avatar, nombre, cargo, texto) | **6 reseñas** |
| CTA footer | titular 2 líneas, párrafo, botón, imagen | 1 |
| Newsletter | h4 + input email + botón | 1 |
| Footer | logo, descripción, 4 redes, 5 enlaces, dirección, 2 teléfonos, copyright | 5 enlaces / 2 teléfonos |

Textos: los titulares van **en mayúsculas** por CSS, escríbelos en capitalización normal.
Los precios usan el formato `$ 00.00 USD` (adáptalo a la moneda del proyecto, manteniendo el
espacio tras el símbolo).

---

## 9. Checklist de aceptación

- [ ] Hero ocupa `100vh` con imagen a sangre en el borde derecho y la foto empieza bajo el header en desktop.
- [ ] El `h1` del hero tiene 2 líneas con la segunda en terracota, y crece 70 → 72 → 86px.
- [ ] Los dos recortes de imagen aparecen **dentro** del flujo del `h2` de la sección statement.
- [ ] La imagen ancha se ve **por encima** del bloque crema (solape de 200px).
- [ ] La rejilla de catálogo es 2 columnas × 4 filas con `1.2fr 1fr` y column-gap 80/70/60px.
- [ ] La imagen de servicio sobresale 130/170px hacia arriba y la sección compensa con margen negativo.
- [ ] Las dos filas de galería desbordan el viewport, están recortadas, y se mueven en direcciones opuestas al hacer scroll.
- [ ] El slider muestra 3 tarjetas crema de `min-height` 398px con flechas circulares y línea a la derecha, alineadas con el titular.
- [ ] La tarjeta CTA del footer flota a caballo entre el fondo blanco y el bloque negro.
- [ ] Newsletter centrada, 560px, input transparente con borde blanco + botón terracota.
- [ ] Breakpoints verificados a 1920 / 1440 / 1280 / 1100 / 991 / 767 / 479 / 390px.
- [ ] Todas las animaciones de entrada respetan `prefers-reduced-motion: reduce` (desactivarlas).
- [ ] Contraste AA: `#cb6037` sobre blanco solo en textos ≥18px o bold; en el footer negro es correcto.
- [ ] Accesibilidad: `alt` en todas las imágenes, foco visible en enlaces/botones, `aria-label` en flechas del slider y en el carrito, navegación por teclado en dropdowns.
