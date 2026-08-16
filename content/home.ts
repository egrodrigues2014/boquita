import { products } from "@/content/products";
import { CONTACT } from "@/lib/contact";
import { buildDirectWhatsAppUrl } from "@/lib/whatsapp";
import { variantsLabel } from "@/lib/variants";
import type { GalleryItem, GalleryRows, HomeContent, ImageRef, Product } from "@/types/content";
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
 *  · Registro: profesional, cercano y en tuteo, con español latinoamericano neutro.
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

export const GALLERY_ITEMS_PER_ROW = 4;
export const GALLERY_ROW_COUNT = 6;

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

/** Ficha de catalogo -> una o mas fotos enlazadas de la galeria. */
export function toGalleryItems(product: ShopProduct): GalleryItem[] {
  const main = toGalleryItem(product);
  if (!product.imageB) return [main];

  return [
    main,
    {
      label: `${product.name} (segunda foto)`,
      href: `/tienda/${product.slug}`,
      image: { ...product.imageB, sizes: GALLERY_SIZES },
    },
  ];
}

export function chunkGalleryRows(items: GalleryItem[]): GalleryRows {
  return Array.from({ length: GALLERY_ROW_COUNT }, (_, row) =>
    items.slice(row * GALLERY_ITEMS_PER_ROW, (row + 1) * GALLERY_ITEMS_PER_ROW),
  ) as GalleryRows;
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

function galleryProducts(): GalleryRows {
  const items = products.flatMap(toGalleryItems);

  if (items.length !== GALLERY_ROW_COUNT * GALLERY_ITEMS_PER_ROW) {
    throw new Error(`La galeria necesita 24 fotos y tiene ${items.length}`);
  }

  return chunkGalleryRows(items);
}

const WA_CONSULTA = buildDirectWhatsAppUrl("consultation");
const WA_PEDIDO = buildDirectWhatsAppUrl("order");

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
  alt: "Queque de manzana recién horneado, espolvoreado con azúcar en polvo, sobre un plato blanco en la terraza",
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
  alt: "Biscotti de almendra en un plato alargado, con fresas en láminas y una taza de café, sobre una mesa de madera",
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
  alt: "Bandeja de horno con polvorones de almendra recién hechos, cubiertos de azúcar en polvo, en la cocina",
};

const mediaPoster: ImageRef = {
  src: "/img/producto/queque-de-zanahoria-800x600.webp",
  srcSet: [
    { src: "/img/producto/queque-de-zanahoria-400x300.webp", width: 400 },
    { src: "/img/producto/queque-de-zanahoria-800x600.webp", width: 800 },
    { src: "/img/producto/queque-de-zanahoria-1200x900.webp", width: 1200 },
  ],
  sizes: "(min-width: 992px) 500px, calc(100vw - 30px)",
  width: 800,
  height: 600,
  alt: "Queque de zanahoria entero con cobertura de queso crema y nueces pecanas, sobre una base de cristal en el jardín",
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
        // El `href` NO es decorativo: sin él, `Dropdown` renderiza la etiqueta
        // como <button> y el clic sólo abre el panel. La página existía y
        // respondía 200, pero era inalcanzable desde su propia etiqueta del nav.
        href: "/sobre-nosotros",
        // Apuntaban a anclas de la portada, pero «Entregas y zonas» y
        // «Preguntas frecuentes» no existían en ninguna sección: el nav prometía
        // contenido que no estaba. Ahora van a la página real.
        items: [
          { label: "Sobre Boquita", href: "/sobre-nosotros#sobre-boquita" },
          { label: "Quién está detrás", href: "/sobre-nosotros#historia" },
          { label: "Cómo horneamos", href: "/sobre-nosotros#como-horneamos" },
          { label: "Qué hay en el catálogo", href: "/sobre-nosotros#catalogo" },
          { label: "Presentaciones", href: "/sobre-nosotros#presentaciones" },
          { label: "Para qué ocasiones", href: "/sobre-nosotros#ocasiones" },
          { label: "Pedidos y entregas", href: "/sobre-nosotros#entregas" },
          {
            label: "Preguntas frecuentes",
            href: "/sobre-nosotros#preguntas-frecuentes",
          },
          { label: "Escríbeme", href: "/sobre-nosotros#escribeme" },
        ],
      },
    ],
    // `/#galeria` y no `#galeria`: el nav se renderiza en TODAS las páginas, y un
    // ancla pura sólo funcionaría en la portada — desde /tienda no haría nada.
    link: { label: "Galería", href: "/#galeria" },
    cta: { label: "Pedir por WhatsApp", href: WA_PEDIDO, external: true },
  },

  hero: {
    eyebrow: "Repostería artesanal · Santa Ana",
    brand: "Boquita",
    tagline: "Pequeños bocados. Grandes momentos.",
    lead:
      "Dulce o salado, preparamos cada encargo con ingredientes de verdad y lo " +
      "horneamos para que lo recibas recién hecho.",
    ctas: [
      { label: "Pedir por WhatsApp", href: WA_PEDIDO, external: true },
      { label: "Ver el catálogo", href: "/tienda" },
    ],
    image: hero,
  },

  statement: {},

  mediaText: {
    titleTop: "Del horno de Ale",
    titleBottom: "a tu mesa",
    body:
      "Ale hornea en su casa de Santa Ana desde 2022. Sin conservantes y sin " +
      "mezclas industriales: recetas propias, tandas pequeñas y el sabor de lo hecho a mano.",
    poster: mediaPoster,
  },

  wideImage,

  menu: {
    eyebrow: "Nuestro catálogo",
    title: "Lo que sale del horno",
    body:
      "Pedidos con 48 horas de anticipación. Entregamos en toda la Gran Área Metropolitana " +
      "y coordinamos todo por WhatsApp.",
    // Derivados del catálogo: los precios y nombres no pueden desincronizarse.
    products: featuredProducts(),
    more: { label: "Ver los 23 productos", href: "/tienda" },
  },

  service: {
    eyebrow: "Sobre Boquita",
    titleTop: "Hecho a mano,",
    titleBottom: "en tandas pequeñas",
    body:
      "Boquita nació en la cocina de casa de Ale, en Santa Ana. " +
      "Hoy horneamos por encargo para familias, oficinas y celebraciones de todo el " +
      "Valle Central.",
    image: serviceImage,
    metrics: [
      // ⚠ TODO: necesita un número real y defendible, o cambiar la métrica.
      { value: "+500", label: "Pedidos horneados desde 2022" },
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
    /**
     * MEDIO ANDAMIO. `t1` y `t2` son reseñas REALES, entregadas por Ale; `t3`
     * a `t6` siguen inventadas y van marcadas `todo` (`CONTENT_TODO §3`, sigue
     * siendo bloqueante de lanzamiento: faltan cuatro).
     *
     * El estado mixto es el normal a partir de ahora, porque las reales llegan
     * por tandas. Por eso `tests/unit/content.test.ts` ya no cuenta las marcas
     * sino que NOMBRA las que faltan: publicar una de andamio como real, o
     * añadir una nueva sin marcar, rompe el test igual que antes.
     *
     * ⚠ «torta de zanahoria» en `t1` y `t2` es CITA LITERAL y se queda así. La
     * regla de «queque» del CLAUDE.md gobierna el copy que escribimos nosotros,
     * no las palabras de un cliente; además el buscador ya trata «torta» como
     * sinónimo de la categoría (`lib/shopSearch.ts`). No «corregirlo».
     *
     * El original de cada reseña real, sin editar, y su consentimiento están en
     * `docs/TESTIMONIOS_FUENTES.md`. Lo publicado lleva sólo edición ligera:
     * tildes y puntuación.
     *
     * `role` es la OCASIÓN del pedido, no un cargo. La referencia pone
     * «Cook»/«Manager» porque es una plantilla genérica; en una repostería lo
     * que da credibilidad es dónde y para qué se encargó.
     *
     * Las citas miden a propósito entre ~110 y ~230 caracteres: la referencia
     * describe tarjetas de 3 a 5 líneas, y el `min-height` de `.review-card`
     * existe justo para que esa desigualdad no descuadre la fila. El tope duro
     * son 320 caracteres (`content/schema.ts`), medido contra ese mismo alto.
     */
    items: [
      {
        id: "t1",
        name: "María Elena M.",
        role: "Clienta frecuente, Escazú",
        quote:
          "Los postres de Ale son deliciosos. Su torta de zanahoria es la mejor: textura, " +
          "sabor, presentación. Es mi favorita. Los polvorones deliciosos y las galletas " +
          "adictivas. La verdad es que es imposible escoger entre todas sus recetas.",
      },
      {
        id: "t2",
        name: "Mirella S.",
        role: "Clienta frecuente, Santa Ana",
        quote:
          "Los postres de Ale son deliciosos. Torta de zanahoria, polvorones, barra de " +
          "dátiles, queque de limón, pie de brigadeiros: de todos los que he probado, todos " +
          "espectaculares. Recomendadísimos.",
      },
      {
        id: "t3",
        name: "Laura Céspedes Mora",
        role: "Baby shower en Ciudad Colón",
        quote:
          "Le envié una foto de lo que tenía en mente y me entregó algo aún mejor. " +
          "Coordinamos color, tamaño y fecha por WhatsApp en un solo día, y no tuve que " +
          "explicar nada dos veces.",
        todo: true,
      },
      {
        id: "t4",
        name: "Andrés Mora Jiménez",
        role: "Cliente frecuente",
        quote:
          "Compro galletas casi todas las semanas. Lo que me terminó de convencer es que " +
          "el sabor no cambia: la tanda de hoy sabe igual que la del año pasado, y en " +
          "repostería artesanal eso no es lo normal.",
        todo: true,
      },
      {
        id: "t5",
        name: "Gabriela Ureña Piedra",
        role: "Graduación en Pozos",
        quote:
          "Necesitaba algo sin azúcar para mi papá y sin gluten para mi hermana, en el " +
          "mismo pedido. Ale preparó las dos opciones con muy buena disposición y sin " +
          "cobrarme un recargo por el trabajo adicional.",
        todo: true,
      },
      {
        id: "t6",
        name: "Diego Alvarado Chaves",
        role: "Regalo corporativo",
        quote:
          "Encargamos cuarenta cajas para clientes en diciembre. Nos avisó con tiempo de " +
          "hasta cuándo podíamos pedir, entregó todo empacado y rotulado, y nos ahorró la " +
          "tarde que íbamos a pasar armando cajas.",
        todo: true,
      },
    ],
  },

  footer: {
    cta: {
      titleTop: "¿Listo para pedir",
      titleBottom: "tu próximo antojo?",
      body: "Escríbenos por WhatsApp y coordinamos el sabor, el tamaño y la fecha de entrega.",
      button: { label: "Pedir por WhatsApp", href: WA_PEDIDO, external: true },
      image: ctaImage,
    },
    newsletter: {
      title: "Suscríbete al boletín",
      placeholder: "Correo electrónico",
      label: "Tu correo electrónico",
      button: "Enviar",
    },
    brandText:
      "Boquita — Sweet & Salty. Repostería artesanal hecha en casa en Santa Ana, " +
      "Costa Rica. Horneamos por encargo, en tandas pequeñas.",
    contacts: [
      {
        label: "WhatsApp de Boquita",
        display: CONTACT.whatsappDisplay,
        href: WA_CONSULTA,
        icon: "whatsapp",
        external: true,
      },
      {
        label: "Instagram de Boquita",
        display: `@${CONTACT.instagramHandle}`,
        href: CONTACT.instagramUrl,
        icon: "instagram",
        external: true,
      },
      {
        label: "Correo de Boquita",
        display: CONTACT.email,
        href: `mailto:${CONTACT.email}`,
        icon: "mail",
      },
    ],
    links: [
      { label: "Inicio", href: "/" },
      { label: "Catálogo", href: "/tienda" },
      { label: "Galería", href: "/#galeria" },
      { label: "Sobre nosotros", href: "/sobre-nosotros" },
    ],
    address: CONTACT.address,
    copyright: "© 2026 Boquita — Sweet & Salty.",
    legal: { label: "Aviso legal", href: "/aviso-legal" },
  },
};

export default home;
