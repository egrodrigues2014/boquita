import type { HomeContent, ImageRef } from "@/types/content";

/**
 * Todo el copy de la portada, en un solo sitio.
 *
 * En la Fase 2 este objeto pasa a ser el FALLBACK: cuando la base de datos
 * devuelva menos filas de las que el layout exige, se rellena desde aquí con
 * `padTo()`, para que la portada no se pueda romper por mucho que Ale borre.
 *
 * Convenciones:
 *  · Los titulares van en capitalización normal — el CSS los pone en mayúsculas.
 *  · Registro: voseo suave («escribinos», «pedí»), el de @boquitacostarica.
 *    ⚠ TODO: confirmar con Ale, o cambiar a usted.
 *  · Todo lo marcado ⚠ TODO está listado en docs/CONTENT_TODO.md y BLOQUEA el
 *    lanzamiento, aunque no el desarrollo.
 *
 * Las rutas /tienda, /blog y /sobre-nosotros NO existen todavía (Fases 4 y 6),
 * así que en esta fase el nav y el footer apuntan a anclas reales de la portada
 * en vez de a enlaces muertos. El spec §8 sólo exige conservar el NÚMERO de
 * elementos (4 dropdowns + 1 enlace, 5 enlaces de pie), no las etiquetas.
 */

const WA = "https://wa.me/50662762196";
const WA_CONSULTA = `${WA}?text=${encodeURIComponent("¡Hola Boquita! Quiero hacer una consulta.")}`;
const WA_PEDIDO = `${WA}?text=${encodeURIComponent("¡Hola Boquita! Quiero hacer un pedido.")}`;

/** Escaleras de srcset. Los tamaños los genera scripts/build-images.mjs. */

const hero: ImageRef = {
  src: "/img/hero/1050x1400.webp",
  srcSet: [
    { src: "/img/hero/500x667.webp", width: 500 },
    { src: "/img/hero/800x1067.webp", width: 800 },
    { src: "/img/hero/1050x1400.webp", width: 1050 },
    { src: "/img/hero/1350x1800.webp", width: 1350 },
  ],
  avif: [
    { src: "/img/hero/500x667.avif", width: 500 },
    { src: "/img/hero/800x1067.avif", width: 800 },
    { src: "/img/hero/1050x1400.avif", width: 1050 },
    { src: "/img/hero/1350x1800.avif", width: 1350 },
  ],
  // Anchos de render del spec §6.1: 43.5% base · 46% ≥1280 · 38% ≥1440 · 39% ≥1920.
  // A ≤991 la imagen pasa a estática, 100vw × 420px de alto.
  sizes:
    "(min-width: 1920px) 39vw, (min-width: 1440px) 38vw, (min-width: 1280px) 46vw, (min-width: 992px) 43.5vw, 100vw",
  width: 1050,
  height: 1400,
  alt: "Queque de manzana recién horneado, espolvoreado con azúcar glas, sobre un plato blanco en la terraza",
};

const wideImage: ImageRef = {
  src: "/img/wide/1170x403.webp",
  srcSet: [
    { src: "/img/wide/1170x403.webp", width: 1170 },
    { src: "/img/wide/1440x497.webp", width: 1440 },
  ],
  sizes: "(min-width: 1200px) 1170px, calc(100vw - 30px)",
  width: 1170,
  height: 403,
  alt: "Biscotti de almendra en un plato alargado, con fresas laminadas y una taza de café, sobre una mesa de madera",
};

const serviceImage: ImageRef = {
  src: "/img/service/540x624.webp",
  srcSet: [
    { src: "/img/service/540x624.webp", width: 540 },
    { src: "/img/service/1080x1248.webp", width: 1080 },
  ],
  // §6.5: 540px a ≥992 · 65% a ≤991 · 100% a ≤479.
  sizes: "(min-width: 992px) 540px, (max-width: 479px) calc(100vw - 30px), 65vw",
  width: 540,
  height: 624,
  alt: "Bandeja de horno con polvorones de almendra recién hechos, cubiertos de azúcar glas, en la cocina",
};

const mediaPoster: ImageRef = {
  src: "/img/media/493x300.webp",
  srcSet: [
    { src: "/img/media/493x300.webp", width: 493 },
    { src: "/img/media/986x600.webp", width: 986 },
  ],
  sizes: "(min-width: 1440px) 493px, (min-width: 768px) 45vw, calc(100vw - 30px)",
  width: 493,
  height: 300,
  alt: "Queque de zanahoria entero con frosting de queso crema y pecanas, sobre un pie de cristal en el jardín",
};

const ctaImage: ImageRef = {
  src: "/img/cta/585x384.webp",
  srcSet: [
    { src: "/img/cta/585x384.webp", width: 585 },
    { src: "/img/cta/1170x768.webp", width: 1170 },
  ],
  sizes: "(min-width: 768px) 585px, calc(100vw - 30px)",
  width: 585,
  height: 384,
  alt: "Biscotti de almendra dispuestos alrededor de un cuenco de chocolate para mojar",
};

/**
 * Los dos recortes inline. Siguen siendo `background-image` con `image-set()`,
 * no `<img>`: tienen que vivir dentro del flujo del h2 a `height:1em`, y ningún
 * `<img>` hace eso sin romper la caja de línea.
 * `alt` vacío porque son decorativos — la frase se lee de corrido.
 */
const inlineBrigadeiro: ImageRef = {
  src: "/img/inline/brigadeiro-100x100.webp",
  srcSet: [{ src: "/img/inline/brigadeiro-200x200.webp", width: 200 }],
  width: 100,
  height: 100,
  alt: "",
};

const inlineGalleta: ImageRef = {
  src: "/img/inline/galleta-corazon-100x100.webp",
  srcSet: [{ src: "/img/inline/galleta-corazon-200x200.webp", width: 200 }],
  width: 100,
  height: 100,
  alt: "",
};

/** §6.6: 4 únicas por fila, el render las repite hasta 7. */
const GALLERY_SIZES = "(min-width: 1920px) 25vw, (min-width: 768px) 23vw, 47vw";

function galleryImage(name: string, alt: string): ImageRef {
  return {
    src: `/img/gallery/${name}-321x239.webp`,
    srcSet: [
      { src: `/img/gallery/${name}-321x239.webp`, width: 321 },
      { src: `/img/gallery/${name}-642x478.webp`, width: 642 },
    ],
    sizes: GALLERY_SIZES,
    width: 321,
    height: 239,
    alt,
  };
}

export const home: HomeContent = {
  nav: {
    dropdowns: [
      {
        label: "Catálogo",
        // ⚠ TODO Fase 4: recablear a /tienda?categoria=…
        items: [
          { label: "Queques", href: "#catalogo" },
          { label: "Galletas y biscotti", href: "#catalogo" },
          { label: "Bocaditos dulces", href: "#catalogo" },
          { label: "Salado", href: "#catalogo" },
          { label: "Sin gluten y keto", href: "#catalogo" },
        ],
      },
      {
        label: "Ocasiones",
        // ⚠ TODO Fase 4: recablear a /tienda?ocasion=…
        items: [
          { label: "Cumpleaños", href: "#catalogo" },
          { label: "Bodas y bautizos", href: "#catalogo" },
          { label: "Baby shower", href: "#catalogo" },
          { label: "Oficinas y cafeterías", href: "#catalogo" },
          { label: "Regalos corporativos", href: "#catalogo" },
          { label: "Navidad", href: "#catalogo" },
        ],
      },
      {
        label: "Sobre nosotros",
        items: [
          { label: "La historia de Ale", href: "#sobre" },
          { label: "Cómo horneamos", href: "#video" },
          { label: "Entregas y zonas", href: "#sobre" },
          { label: "Escribinos", href: WA_CONSULTA, external: true },
        ],
      },
      {
        label: "Todo el catálogo",
        // El megamenú: a ≤991px es un panel de 270px con scroll, y son estos 14
        // productos los que justifican esa medida del spec.
        // ⚠ TODO Fase 4: recablear a /tienda/[slug].
        mega: true,
        items: [
          { label: "Queque de zanahoria", href: "#catalogo" },
          { label: "Queque personalizado", href: "#catalogo" },
          { label: "Galletas de granola", href: "#catalogo" },
          { label: "Galletas de chocolate y Nutella", href: "#catalogo" },
          { label: "Polvorones de almendra", href: "#catalogo" },
          { label: "Brigadeiros", href: "#catalogo" },
          { label: "Biscotti de almendra", href: "#catalogo" },
          { label: "Biscotti keto", href: "#catalogo" },
          { label: "Cachitos de jamón", href: "#catalogo" },
          { label: "Key lime pie", href: "#catalogo" },
          { label: "Barras de dátil", href: "#catalogo" },
          { label: "Mini queques de manzana", href: "#catalogo" },
          { label: "Coffee cake vegano", href: "#catalogo" },
          { label: "Asado negro", href: "#catalogo" },
        ],
      },
    ],
    link: { label: "Galería", href: "#galeria" },
    phone: { display: "+506 6276 2196", href: "tel:+50662762196" },
    cta: { label: "Pedir por WhatsApp", href: WA_PEDIDO, external: true },
  },

  hero: {
    eyebrow: "Repostería artesanal en Río Oro",
    // El titular son 2 líneas cortas a propósito, no por gusto estético.
    //
    // Medido: «Dulce y salado» necesita 580px a 70px, pero `.hero-content` es el
    // 53% del contenedor en el rango 992–1279px — 567px a 1100px y sólo 510px a
    // 992px. Con esa frase el h1 se iba a 3 o 4 líneas y rompía el punto 2 del
    // checklist. El diseño de referencia usaba un titular igual de corto
    // («ORIGINAL / ITALIAN FOOD»), y el spec §8 dice que el contenido se
    // sustituye mientras la estructura se conserva: así que se acorta el texto,
    // no la escala tipográfica.
    //
    // «Dulce y salado» sigue siendo el eslogan real de la tienda («Sweet &
    // Salty»); aquí se parte en las dos líneas que el layout pide.
    titleTop: "Dulce",
    titleBottom: "y salado",
    lead:
      "Horneamos por encargo en Río Oro de Santa Ana con ingredientes de verdad: " +
      "mantequilla, zanahoria fresca, chocolate y almendra. Cada pedido sale del " +
      "horno el día que lo recibís.",
    ctas: [
      { label: "Ver el catálogo", href: "#catalogo" },
      { label: "Pedir por WhatsApp", href: WA_PEDIDO, external: true },
    ],
    image: hero,
  },

  statement: {
    partA: "Todo empieza con mantequilla de verdad, zanahoria rallada a mano",
    partB: "y un horno pequeño en Río Oro",
    partC: "donde cada receta se hornea de a poco, para vos.",
    inline: [inlineGalleta, inlineBrigadeiro],
  },

  mediaText: {
    titleTop: "Del horno de Ale",
    titleBottom: "a tu mesa",
    body:
      "Ale Budowski hornea en su casa de Río Oro desde 2019. Sin conservantes y sin " +
      "mezclas industriales: recetas propias, tandas pequeñas y el sabor de lo hecho a mano.",
    poster: mediaPoster,
    // El reel real de Ale decorando un queque. ⚠ TODO: sustituir por un MP4
    // autohospedado — más rápido y sin tracking de terceros.
    videoUrl: "https://www.instagram.com/p/C3V_oBtOBHT/embed",
    videoLabel: "Ver el video: cómo horneamos",
  },

  wideImage,

  menu: {
    eyebrow: "Nuestro catálogo",
    title: "Lo que sale del horno",
    body:
      "Pedidos con 48 horas de anticipación. Entregamos en Santa Ana, Escazú y " +
      "alrededores, y coordinamos todo por WhatsApp.",
    // ⚠ TODO: los 8 precios son placeholders. El menú fijado de Instagram tiene
    // los reales, pero es una imagen y su texto no se puede extraer.
    // Ver docs/CONTENT_TODO.md §2.
    products: [
      {
        slug: "queque-de-zanahoria",
        name: "Queque de zanahoria",
        price: 14000,
        category: "Queques · molde de 8 porciones",
        priceTodo: true,
      },
      {
        slug: "queque-personalizado",
        name: "Queque personalizado",
        price: 22000,
        priceFrom: true,
        category: "Queques · por encargo",
        priceTodo: true,
      },
      {
        slug: "galletas-de-granola",
        name: "Galletas de granola",
        price: 5500,
        category: "Galletas · sin gluten, bajas en azúcar · caja de 6",
        priceTodo: true,
      },
      {
        slug: "galletas-de-chocolate-y-nutella",
        // Acortado de «Galletas de chocolate y Nutella»: a 20px en mayúsculas
        // ocupaba 248px y dejaba la columna sin sitio para el precio.
        name: "Galletas con Nutella",
        price: 6000,
        category: "Chocolate chip · caja de 6",
        priceTodo: true,
      },
      {
        slug: "polvorones-de-almendra",
        name: "Polvorones de almendra",
        price: 5000,
        category: "Repostería española · caja de 8",
        priceTodo: true,
      },
      {
        slug: "brigadeiros",
        name: "Brigadeiros",
        price: 6500,
        category: "Bocaditos dulces · docena",
        priceTodo: true,
      },
      {
        slug: "biscotti-de-almendra",
        name: "Biscotti de almendra",
        price: 5800,
        category: "Biscotti · bolsa de 10",
        priceTodo: true,
      },
      {
        slug: "cachitos-de-jamon",
        name: "Cachitos de jamón",
        price: 7500,
        category: "Salado · media docena",
        priceTodo: true,
      },
    ],
    more: { label: "Pedir por WhatsApp", href: WA_PEDIDO, external: true },
  },

  service: {
    eyebrow: "Sobre Boquita",
    titleTop: "Hecho a mano,",
    titleBottom: "en tandas pequeñas",
    body:
      "Boquita nació en la cocina de casa de Ale Budowski, en Río Oro de Santa Ana. " +
      "Hoy horneamos por encargo para familias, oficinas y celebraciones de todo el " +
      "Valle Central.",
    image: serviceImage,
    metrics: [
      // ⚠ TODO: necesita un número real y defendible, o cambiar la métrica.
      { value: "2.400+", label: "Pedidos horneados desde 2019", todo: true },
      // Verificable: son los productos del catálogo.
      { value: "14", label: "Recetas en el catálogo" },
    ],
  },

  gallery: {
    title: "Recién salido del horno",
    rows: [
      [
        galleryImage(
          "fila1-1",
          "Cookie cake cubierto con espiral de ganache de chocolate, fresas y arándanos al centro",
        ),
        galleryImage(
          "fila1-2",
          "Queque de zanahoria rectangular decorado con rosetones de queso crema, pecanas y una orquídea",
        ),
        galleryImage(
          "fila1-3",
          "Coffee cake de dos capas con costra de canela, nueces y chispas de chocolate",
        ),
        galleryImage(
          "fila1-4",
          "Queque de zanahoria visto desde arriba, con espiral de queso crema, coco rallado y pecanas",
        ),
      ],
      [
        galleryImage(
          "fila2-1",
          "Galletas de chocolate chip rellenas con un centro de Nutella, sobre un plato blanco",
        ),
        galleryImage(
          "fila2-2",
          "Galletas de granola con una taza de café y fresas laminadas, en el jardín",
        ),
        galleryImage("fila2-3", "Biscotti de almendra sin azúcar sobre un plato blanco"),
        galleryImage(
          "fila2-4",
          "Tarta individual de brigadeiro con escamas de sal, fresas y arándanos",
        ),
      ],
    ],
  },

  testimonials: {
    title: "Lo que dicen nuestros clientes",
    // ⚠ TODO: las 6 son inventadas. NO pueden publicarse. Hacen falta reseñas
    // reales con nombre, rol y consentimiento escrito. Ver docs/CONTENT_TODO.md §3.
    // Los avatares son SVG con iniciales: nunca fotos de stock de personas ficticias.
    items: [
      {
        id: "t1",
        name: "Mariana Solís",
        role: "Vecina de Santa Ana",
        quote:
          "Pedí el queque de zanahoria para el cumpleaños de mi mamá y desapareció en " +
          "diez minutos. Es el mejor que he probado en el Valle Central.",
        todo: true,
      },
      {
        id: "t2",
        name: "Andrés Quirós",
        role: "Cliente en Escazú",
        quote:
          "Las galletas de granola son mi desayuno de todos los días. Sin gluten y con " +
          "poca azúcar, pero saben a galleta de verdad.",
        todo: true,
      },
      {
        id: "t3",
        name: "Laura Vargas",
        role: "Organizadora de eventos",
        quote:
          "Ale nos hizo el queque personalizado para la boda de mi hermana. Quedó igual " +
          "a la foto que le mandamos y llegó puntual.",
        todo: true,
      },
      {
        id: "t4",
        name: "Diego Montero",
        role: "Oficina en Rohrmoser",
        quote:
          "Pedimos cachitos de jamón para las reuniones de los lunes. Llegan calientes " +
          "y ya son parte de la rutina del equipo.",
        todo: true,
      },
      {
        id: "t5",
        name: "Sofía Jiménez",
        role: "Clienta desde 2020",
        quote:
          "Los brigadeiros y los polvorones son mi combo para regalar. Se nota que todo " +
          "está hecho a mano, en tandas pequeñas.",
        todo: true,
      },
      {
        id: "t6",
        name: "Carolina Rojas",
        role: "Nutricionista",
        quote:
          "Recomiendo los biscotti keto a mis pacientes: pocos ingredientes, nada raro " +
          "en la etiqueta y muy buen sabor.",
        todo: true,
      },
    ],
  },

  footer: {
    cta: {
      titleTop: "¿Listo para pedir",
      titleBottom: "tu próximo antojo?",
      body: "Escribinos por WhatsApp y coordinamos sabor, tamaño y fecha de entrega.",
      button: { label: "Pedir por WhatsApp", href: WA_PEDIDO, external: true },
      image: ctaImage,
    },
    newsletter: {
      title: "Suscribite a la newsletter",
      placeholder: "Email",
      label: "Tu correo electrónico",
      button: "Enviar",
    },
    brandText:
      "Boquita — Sweet & Salty. Repostería artesanal hecha en casa en Río Oro de " +
      "Santa Ana, San José, Costa Rica. Horneamos por encargo, en tandas pequeñas.",
    social: [
      {
        label: "Instagram de Boquita",
        href: "https://instagram.com/boquitacostarica",
        icon: "instagram",
      },
      { label: "WhatsApp de Boquita", href: WA_CONSULTA, icon: "whatsapp" },
      // ⚠ TODO: no hay Facebook confirmado. Placeholder al Instagram para no
      // dejar un enlace muerto; sustituir o quitar cuando Ale confirme.
      {
        label: "Facebook de Boquita",
        href: "https://instagram.com/boquitacostarica",
        icon: "facebook",
        todo: true,
      },
      // ⚠ TODO: ¿se publica ticaboquita@gmail.com o se quiere un correo del dominio?
      { label: "Escribinos un correo", href: "mailto:ticaboquita@gmail.com", icon: "mail", todo: true },
    ],
    links: [
      { label: "Inicio", href: "/" },
      { label: "Catálogo", href: "#catalogo" },
      { label: "Galería", href: "#galeria" },
      { label: "Sobre nosotros", href: "#sobre" },
      { label: "Escribinos", href: WA_CONSULTA, external: true },
    ],
    // ⚠ TODO: dirección exacta o punto de retiro.
    address: "Río Oro de Santa Ana, San José, Costa Rica",
    addressTodo: true,
    phones: [
      { display: "+506 6276 2196", href: "tel:+50662762196" },
      // ⚠ TODO: el spec pide 2 teléfonos y sólo hay uno. Este repite el mismo con
      // el enlace de WhatsApp para no inventar un número.
      { display: "WhatsApp: +506 6276 2196", href: WA_CONSULTA, todo: true },
    ],
    copyright: "© 2026 Boquita Sweet & Salty. Todos los derechos reservados.",
    legal: { label: "Aviso legal", href: "#" },
  },
};

export default home;
