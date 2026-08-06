/**
 * Formas del contenido de la portada.
 *
 * Las longitudes de array NO son decorativas: el layout del spec depende de
 * ellas. 8 productos hacen la rejilla 2×4, 2 métricas hacen las 2 columnas de
 * `.stats`, 6 testimonios alimentan un slider de 3/2/1 visibles, 4+4 fotos
 * llenan las dos filas de galería. Un array corto rompe el diseño en silencio,
 * así que en `content/schema.ts` hay un Zod que lo afirma con `.length()`.
 *
 * Excepción deliberada: las redes del footer ya no se fuerzan a 4. Es peor
 * publicar enlaces falsos que mostrar sólo los canales reales.
 *
 * En la Fase 2 estas mismas formas serán el contrato de la API, y
 * `content/home.ts` pasará a ser el fallback cuando la base de datos esté vacía.
 */

/** Precios siempre en colones enteros. Formatear con lib/format.ts, nunca con Intl. */
export type Colones = number;

/**
 * Un derivado de `public/img/`, con su escalera de tamaños ya generada por
 * `scripts/build-images.mjs`. `width`/`height` son los del tamaño base y son
 * obligatorios: sin ellos hay CLS, y el checklist §9 no lo permite.
 */
export interface ImageRef {
  /** Ruta del tamaño base, p. ej. "/img/wide/1170x403.webp" */
  src: string;
  /** Entradas adicionales del srcset, de menor a mayor */
  srcSet?: { src: string; width: number }[];
  /** Fuentes AVIF para un <picture>, mismo orden que srcSet */
  avif?: { src: string; width: number }[];
  /** Atributo `sizes`. Debe reflejar los anchos reales de render del spec. */
  sizes?: string;
  width: number;
  height: number;
  /** Descriptivo y en español. Cadena vacía sólo si es decorativa. */
  alt: string;
}

export interface Link {
  label: string;
  href: string;
  /** true para wa.me, Instagram, etc. */
  external?: boolean;
}

export interface NavDropdown {
  label: string;
  items: Link[];
  /** El cuarto dropdown es el megamenú: a ≤991px es 270px con scroll. */
  mega?: boolean;
}

export interface Product {
  slug: string;
  /** Capitalización normal: el CSS lo pone en mayúsculas. */
  name: string;
  price: Colones;
  /** true → "desde ₡ 22.000 CRC" (queques personalizados) */
  priceFrom?: boolean;
  /** Categoría y unidad de venta, en `.menu-item-tag` */
  category: string;
  /** ⚠ El precio es un placeholder pendiente de confirmar con Ale. */
  priceTodo?: boolean;
}

export interface Metric {
  /** Máx. 8 caracteres: `.stat-num` va a 50px y desbordaría. */
  value: string;
  label: string;
  todo?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  /** Sin foto: el avatar se genera como SVG con iniciales. */
  todo?: boolean;
}

export interface Social {
  label: string;
  href: string;
  /** Clave del icono en components/ui/SocialIcon */
  icon: "instagram" | "whatsapp" | "facebook" | "mail";
  todo?: boolean;
}

export interface HomeContent {
  nav: {
    dropdowns: [NavDropdown, NavDropdown, NavDropdown, NavDropdown];
    /** El enlace simple entre el 2º y el 3er dropdown */
    link: Link;
    phone: { display: string; href: string };
    cta: Link;
  };

  hero: {
    eyebrow: string;
    /** El h1 son EXACTAMENTE 2 líneas, con <br> duro. Máx ~24 caracteres cada una. */
    titleTop: string;
    titleBottom: string;
    lead: string;
    /** El spec exige exactamente 2 botones. */
    ctas: [Link, Link];
    image: ImageRef;
  };

  /** Una frase con exactamente 2 huecos de imagen dentro del flujo del h2. */
  statement: {
    partA: string;
    partB: string;
    partC: string;
    inline: [ImageRef, ImageRef];
  };

  mediaText: {
    titleTop: string;
    titleBottom: string;
    body: string;
    poster: ImageRef;
    /** URL del lightbox: hoy el embed del reel real. TODO: MP4 autohospedado. */
    videoUrl: string;
    videoLabel: string;
  };

  wideImage: ImageRef;

  menu: {
    eyebrow: string;
    title: string;
    body: string;
    /** Exactamente 8: la rejilla es 2 columnas × 4 filas. */
    products: Product[];
    /** Enlace opcional al catálogo completo, debajo de la rejilla. */
    more?: Link;
  };

  service: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    body: string;
    image: ImageRef;
    /** Exactamente 2. */
    metrics: [Metric, Metric];
  };

  gallery: {
    title: string;
    /** 4 únicas por fila; el render las repite hasta 7. */
    rows: [ImageRef[], ImageRef[]];
  };

  testimonials: {
    title: string;
    /** Exactamente 6. */
    items: Testimonial[];
  };

  footer: {
    cta: {
      titleTop: string;
      titleBottom: string;
      body: string;
      button: Link;
      image: ImageRef;
    };
    newsletter: { title: string; placeholder: string; label: string; button: string };
    brandText: string;
    /** Sólo canales reales: no se rellenan huecos con placeholders. */
    social: Social[];
    /** Exactamente 5. */
    links: Link[];
    address: string;
    addressTodo?: boolean;
    /** Exactamente 2. */
    phones: { display: string; href: string; todo?: boolean }[];
    copyright: string;
    legal: Link;
  };
}
