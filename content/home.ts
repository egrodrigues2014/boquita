import { products } from "@/content/products";
import { CONTACT, telHref, whatsappUrl } from "@/lib/contact";
import { variantsLabel } from "@/lib/variants";
import type { GalleryItem, HomeContent, ImageRef, Product } from "@/types/content";
import { CATEGORIAS, type ShopProduct } from "@/types/shop";

/**
 * Todo el copy de la portada, en un solo sitio.
 *
 * Este objeto es el FALLBACK de la portada. Todo su copy es estático; lo único
 * que depende del catálogo —la rejilla de 8 y la métrica de
 * «recetas»— lo recalcula `lib/homeContent.ts` a partir de lo que devuelva
 * `getCatalog()`. Sin `DATABASE_URL` ese cálculo produce exactamente lo que hay
 * escrito aquí abajo, así que este archivo sigue siendo la verdad en local.
 *
 * Convenciones:
 *  · Los titulares van en capitalización normal — el CSS los pone en mayúsculas.
 *  · Registro: profesional e informal, con voseo suave («escribinos», «pedí»).
 *  · Todo lo marcado ⚠ TODO está listado en docs/CONTENT_TODO.md y BLOQUEA el
 *    lanzamiento, aunque no el desarrollo.
 *
 * El header publica sólo destinos reales: catálogo, ocasiones, galería y sobre
 * nosotros. La búsqueda del header complementa el catálogo sin duplicar menús.
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
/**
 * Qué 8 productos van en la rejilla y en qué orden. Exportado porque
 * `lib/homeContent.ts` reconstruye la rejilla desde el catálogo de la base
 * usando esta misma lista: la selección editorial vive aquí, los datos no.
 */
export const FEATURED_SLUGS = [
  "queque-de-zanahoria",
  "queque-personalizado",
  "queque-devils-food",
  "cupcakes-de-zanahoria",
  "galletas-de-granola",
  "polvorones-espanoles",
  "brigadeiros",
  "cheesecake",
] as const;

export const GALLERY_SLUGS = [
  "queque-de-zanahoria",
  "queque-personalizado",
  "queque-devils-food",
  "coffee-cake",
  "queque-chocolate-chip-cookie",
  "galletas-de-granola",
  "brigadeiros",
  "cheesecake",
] as const;

/** Ficha de catálogo → tarjeta de la rejilla de la portada (una forma más estrecha). */
export function toFeatured(product: ShopProduct): Product {
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    priceFrom: product.priceFrom,
    category: `${CATEGORIAS[product.categoria]} · ${variantsLabel(product.variants)}`,
    priceTodo: product.priceTodo,
  };
}

/** Ficha de catálogo → foto enlazada de la galería de la portada. */
export function toGalleryItem(product: ShopProduct): GalleryItem {
  return {
    label: product.name,
    href: `/tienda/${product.slug}`,
    image: { ...product.image, sizes: GALLERY_SIZES },
  };
}

function featuredProducts(): Product[] {
  return FEATURED_SLUGS.map((slug) => {
    const product = products.find((p) => p.slug === slug);
    if (!product) {
      // Falla en build, no en runtime: un destacado inexistente dejaría un hueco
      // en la rejilla de 2×4 y rompería el punto 5 del checklist.
      throw new Error(`Destacado inexistente en el catálogo: ${slug}`);
    }
    return toFeatured(product);
  });
}

function galleryProducts(): [GalleryItem[], GalleryItem[]] {
  const items = GALLERY_SLUGS.map((slug) => {
    const product = products.find((p) => p.slug === slug);
    if (!product) {
      throw new Error(`Producto de galería inexistente en el catálogo: ${slug}`);
    }
    return toGalleryItem(product);
  });

  return [items.slice(0, 4), items.slice(4, 8)];
}

const WA_CONSULTA = whatsappUrl("¡Hola Boquita! Quiero hacer una consulta.");
const WA_PEDIDO = whatsappUrl("¡Hola Boquita! Quiero hacer un pedido.");

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
  // El hero es full-bleed: el preload debe pedir el mismo candidato que el <img>.
  sizes: "100vw",
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

/** §6.6: 4 únicas por fila, el render las repite hasta 7. */
const GALLERY_SIZES = "(min-width: 1920px) 25vw, (min-width: 768px) 23vw, 47vw";

export const home: HomeContent = {
  nav: {
    dropdowns: [
      {
        label: "Catálogo",
        href: "/tienda",
        // Las tres categorías del catálogo de Ale, ni una más: un cuarto enlace
        // sería un filtro que no devuelve nada.
        items: [
          { label: "Queques", href: "/tienda?categoria=queques" },
          { label: "Galletas", href: "/tienda?categoria=galletas" },
          { label: "Dulces", href: "/tienda?categoria=dulces" },
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
        // Apuntaban a anclas de la portada, pero «Entregas y zonas» y
        // «Preguntas frecuentes» no existían en ninguna sección: el nav prometía
        // contenido que no estaba. Ahora van a la página real.
        items: [
          { label: "La historia de Ale", href: "/sobre-nosotros#historia" },
          { label: "Cómo horneamos", href: "/sobre-nosotros#como-horneamos" },
          { label: "Entregas y zonas", href: "/sobre-nosotros#entregas" },
          {
            label: "Preguntas frecuentes",
            href: "/sobre-nosotros#preguntas-frecuentes",
          },
        ],
      },
    ],
    // `/#galeria` y no `#galeria`: el nav se renderiza en TODAS las páginas, y un
    // ancla pura sólo funcionaría en la portada — desde /tienda no haría nada.
    link: { label: "Galería", href: "/#galeria" },
    cta: { label: "Pedir por WhatsApp", href: WA_PEDIDO, external: true },
  },

  hero: {
    eyebrow: "Repostería artesanal en Santa Ana",
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
      "Horneamos por encargo en Santa Ana con ingredientes de verdad: " +
      "mantequilla, zanahoria fresca, chocolate y almendra. Cada pedido sale del " +
      "horno el día que lo recibís.",
    ctas: [
      { label: "Ver el catálogo", href: "/tienda" },
      { label: "Pedir por WhatsApp", href: WA_PEDIDO, external: true },
    ],
    image: hero,
  },

  statement: {},

  mediaText: {
    titleTop: "Del horno de Ale",
    titleBottom: "a tu mesa",
    body:
      "Ale Budowski hornea en su casa de Santa Ana desde 2019. Sin conservantes y sin " +
      "mezclas industriales: recetas propias, tandas pequeñas y el sabor de lo hecho a mano.",
    poster: mediaPoster,
  },

  wideImage,

  menu: {
    eyebrow: "Nuestro catálogo",
    title: "Lo que sale del horno",
    body:
      "Pedidos con 48 horas de anticipación. Entregamos en Santa Ana, Escazú y " +
      "alrededores, y coordinamos todo por WhatsApp.",
    // Derivados del catálogo: los precios y nombres no pueden desincronizarse.
    products: featuredProducts(),
    more: { label: "Ver los 23 productos", href: "/tienda" },
  },

  service: {
    eyebrow: "Sobre Boquita",
    titleTop: "Hecho a mano,",
    titleBottom: "en tandas pequeñas",
    body:
      "Boquita nació en la cocina de casa de Ale Budowski, en Santa Ana. " +
      "Hoy horneamos por encargo para familias, oficinas y celebraciones de todo el " +
      "Valle Central.",
    image: serviceImage,
    metrics: [
      // ⚠ TODO: necesita un número real y defendible, o cambiar la métrica.
      { value: "+500", label: "Pedidos horneados desde 2019" },
      // Verificable: son los productos del catálogo.
      { value: "23", label: "Recetas en el catálogo" },
    ],
  },

  gallery: {
    title: "GALERÍA",
    rows: galleryProducts(),
  },

  testimonials: {
    title: "Lo que dicen nuestros clientes",
    // Bloqueante de lanzamiento: no hay comentarios reales extraíbles del PDF.
    // La sección no se renderiza hasta recibir capturas/textos verificables.
    items: [],
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
      "Boquita — Sweet & Salty. Repostería artesanal hecha en casa en Santa Ana, " +
      "Costa Rica. Horneamos por encargo, en tandas pequeñas.",
    social: [
      {
        label: "Instagram de Boquita",
        href: CONTACT.instagramUrl,
        icon: "instagram",
      },
      { label: "WhatsApp de Boquita", href: WA_CONSULTA, icon: "whatsapp" },
    ],
    links: [
      { label: "Inicio", href: "/" },
      { label: "Catálogo", href: "/tienda" },
      { label: "Galería", href: "/#galeria" },
      { label: "Sobre nosotros", href: "/sobre-nosotros" },
    ],
    address: CONTACT.address,
    phones: [
      { display: CONTACT.whatsappDisplay, href: telHref() },
      { display: `WhatsApp: ${CONTACT.whatsappDisplay}`, href: WA_CONSULTA },
    ],
    copyright: "© 2026 Boquita — Sweet & Salty.",
    legal: { label: "Aviso legal", href: "/aviso-legal" },
  },
};

export default home;
