import { products } from "@/content/products";
import type { HomeContent, ImageRef, Link, Product } from "@/types/content";
import { CATEGORIAS } from "@/types/shop";

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

/**
 * Los productos de la portada se DERIVAN del catálogo, no se copian.
 *
 * Estaban duplicados y derivaron: al acortar «Galletas de chocolate y Nutella» a
 * «Galletas con Nutella» quedó el slug viejo en la portada, así que ese enlace
 * apuntaba a una ficha inexistente. Un test de coherencia lo detectó, pero la
 * solución no es parchear el string: es que haya UNA fuente de verdad.
 *
 * `content/products.ts` es esa fuente. Aquí sólo se elige QUÉ 8 productos van en
 * la rejilla del spec §6.4 y en qué orden.
 */
const FEATURED_SLUGS = [
  "queque-de-zanahoria",
  "queque-personalizado",
  "galletas-de-granola",
  "galletas-con-nutella",
  "polvorones-de-almendra",
  "brigadeiros",
  "biscotti-de-almendra",
  "cachitos-de-jamon",
] as const;

function featuredProducts(): Product[] {
  return FEATURED_SLUGS.map((slug) => {
    const product = products.find((p) => p.slug === slug);
    if (!product) {
      // Falla en build, no en runtime: un destacado inexistente dejaría un hueco
      // en la rejilla de 2×4 y rompería el punto 5 del checklist.
      throw new Error(`Destacado inexistente en el catálogo: ${slug}`);
    }
    return {
      slug: product.slug,
      name: product.name,
      price: product.price,
      priceFrom: product.priceFrom,
      category: `${CATEGORIAS[product.categoria]} · ${product.unit}`,
      priceTodo: product.priceTodo,
    };
  });
}

/** El megamenú lista el catálogo completo, también derivado. */
function catalogLinks(): Link[] {
  return products.map((product) => ({
    label: product.name,
    href: `/tienda/${product.slug}`,
  }));
}

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
        items: [
          { label: "Queques", href: "/tienda?categoria=queques" },
          { label: "Galletas y biscotti", href: "/tienda?categoria=galletas" },
          { label: "Bocaditos dulces", href: "/tienda?categoria=bocaditos" },
          { label: "Salado", href: "/tienda?categoria=salado" },
          { label: "Sin gluten y keto", href: "/tienda?categoria=sin-gluten-keto" },
        ],
      },
      {
        label: "Ocasiones",
        items: [
          { label: "Cumpleaños", href: "/tienda?ocasion=cumpleanos" },
          { label: "Bodas y bautizos", href: "/tienda?ocasion=bodas-bautizos" },
          { label: "Baby shower", href: "/tienda?ocasion=baby-shower" },
          { label: "Oficinas y cafeterías", href: "/tienda?ocasion=oficinas" },
          { label: "Regalos corporativos", href: "/tienda?ocasion=regalos" },
          { label: "Navidad", href: "/tienda?ocasion=navidad" },
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
        // productos los que justifican esa medida del spec. Derivado del catálogo.
        mega: true,
        items: catalogLinks(),
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
    // Derivados del catálogo: los precios y nombres no pueden desincronizarse.
    // ⚠ Los precios siguen siendo placeholders (docs/CONTENT_TODO.md §2).
    products: featuredProducts(),
    more: { label: "Ver los 14 productos", href: "/tienda" },
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
