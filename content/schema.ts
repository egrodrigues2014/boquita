import { z } from "zod";

/**
 * Valida que el contenido cumpla las cantidades y longitudes que el layout del
 * spec necesita. No es validación defensiva por gusto: cada `.length()` de aquí
 * corresponde a una medida del spec que se rompería en silencio.
 *
 *   8 productos   → la rejilla es 2 columnas × 4 filas (§6.4, checklist 5)
 *   2 métricas    → `.stats` es una rejilla de 2 columnas (§6.5)
 *   6 testimonios → slider de 3/2/1 visibles, sin loop (§6.7, checklist 8)
 *   4 + 4 galería → dos filas que el render repite hasta 7 (§6.6, checklist 7)
 *   2 inline      → exactamente 2 huecos en el flujo del h2 (§6.2, checklist 3)
 *   2 botones     → `.btn-group` del hero (§8)
 *   3 dropdowns + 1 enlace → el navbar (§5, §8)
 *   2-4 redes reales · 5 enlaces · 2 teléfonos → el pie (§6.8, §8)
 *
 * Los `.max()` de las cadenas son igual de intencionados: `titleTop` limitado a
 * 28 caracteres es LA RAZÓN de que el h1 del hero nunca pase de 2 líneas a 86px.
 * En la Fase 3 estos mismos límites se muestran como texto de ayuda en el panel
 * de administración, para que Ale entienda por qué existen.
 *
 * Se ejecuta en el test, no en cada render: el contenido es estático en esta
 * fase, y en la Fase 2 se validará en el límite de la API.
 */

const link = z.object({
  label: z.string().min(1).max(40),
  href: z.string().min(1),
  external: z.boolean().optional(),
});

const imageRef = z.object({
  src: z.string().startsWith("/img/"),
  srcSet: z.array(z.object({ src: z.string().startsWith("/img/"), width: z.number().int() })).optional(),
  avif: z.array(z.object({ src: z.string().startsWith("/img/"), width: z.number().int() })).optional(),
  sizes: z.string().optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(),
});

/** Toda imagen de contenido necesita alt. Cadena vacía sólo si es decorativa. */
const contentImage = imageRef.refine((img) => img.alt.trim().length >= 10, {
  message: "alt descriptivo obligatorio (checklist §9 punto 14)",
});

const navDropdown = z.object({
  label: z.string().min(1).max(30),
  href: z.string().min(1).optional(),
  items: z.array(link).min(3).max(24),
});

const product = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug en kebab-case, sin acentos"),
  name: z.string().min(2).max(40),
  price: z.number().int().positive(),
  priceFrom: z.boolean().optional(),
  category: z.string().min(2).max(60),
  priceTodo: z.boolean().optional(),
});

const metric = z.object({
  // 8 caracteres: `.stat-num` se renderiza a 50px y más desbordaría la columna.
  value: z.string().min(1).max(8),
  label: z.string().min(3).max(40),
  todo: z.boolean().optional(),
});

const testimonial = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(40),
  role: z.string().min(2).max(40),
  // `.review-card` tiene min-height 420/398/393/312/420: pasado ~320 caracteres
  // la tarjeta más corta desborda.
  quote: z.string().min(40).max(320),
  todo: z.boolean().optional(),
});

const social = z.object({
  label: z.string().min(3).max(40),
  href: z.string().min(1),
  icon: z.enum(["instagram", "whatsapp", "facebook", "mail"]),
  todo: z.boolean().optional(),
});

export const homeSchema = z.object({
  nav: z.object({
    dropdowns: z.tuple([navDropdown, navDropdown, navDropdown]),
    link,
    cta: link,
  }),

  hero: z.object({
    eyebrow: z.string().min(3).max(40),
    // 28 caracteres por línea: a 86px en 1920px de viewport, más ya envuelve.
    titleTop: z.string().min(2).max(28),
    titleBottom: z.string().min(2).max(28),
    // "2-3 líneas" del spec §8.
    lead: z.string().min(60).max(260),
    ctas: z.tuple([link, link]),
    image: contentImage,
  }),

  statement: z.object({
    // La frase entera debe caber en ~3 líneas a 50px. Cada tramo, acotado.
    partA: z.string().min(10).max(90),
    partB: z.string().min(5).max(90),
    partC: z.string().min(5).max(90),
    // Exactamente 2 huecos: es lo que inspecciona el punto 3 del checklist.
    inline: z.tuple([imageRef, imageRef]),
  }),

  mediaText: z.object({
    titleTop: z.string().min(2).max(30),
    titleBottom: z.string().min(2).max(30),
    body: z.string().min(40).max(280),
    poster: contentImage,
    videoUrl: z.string().url(),
    videoLabel: z.string().min(5).max(60),
  }),

  wideImage: contentImage,

  menu: z.object({
    eyebrow: z.string().min(3).max(40),
    title: z.string().min(3).max(40),
    body: z.string().min(40).max(260),
    // 2 columnas × 4 filas. Ni 7 ni 9.
    products: z.array(product).length(8),
    more: link.optional(),
  }),

  service: z.object({
    eyebrow: z.string().min(3).max(40),
    titleTop: z.string().min(2).max(30),
    titleBottom: z.string().min(2).max(30),
    body: z.string().min(40).max(280),
    image: contentImage,
    metrics: z.tuple([metric, metric]),
  }),

  gallery: z.object({
    title: z.string().min(3).max(40),
    // 4 únicas por fila; el render las repite hasta 7.
    rows: z.tuple([z.array(contentImage).length(4), z.array(contentImage).length(4)]),
  }),

  testimonials: z.object({
    title: z.string().min(3).max(50),
    items: z.array(testimonial).refine((items) => items.length === 0 || items.length === 6, {
      message: "publicar testimonios requiere 6 reseñas reales, o ninguna mientras esté bloqueado",
    }),
  }),

  footer: z.object({
    cta: z.object({
      titleTop: z.string().min(2).max(30),
      titleBottom: z.string().min(2).max(30),
      body: z.string().min(20).max(200),
      button: link,
      image: contentImage,
    }),
    newsletter: z.object({
      title: z.string().min(5).max(40),
      placeholder: z.string().min(2).max(30),
      label: z.string().min(5).max(60),
      button: z.string().min(2).max(20),
    }),
    brandText: z.string().min(40).max(300),
    // No se rellenan huecos con Facebook/email falsos: sólo canales reales.
    social: z.array(social).min(2).max(4),
    links: z.array(link).length(5),
    address: z.string().min(10).max(160),
    addressTodo: z.boolean().optional(),
    phones: z
      .array(
        z.object({
          display: z.string().min(6).max(40),
          href: z.string().min(1),
          todo: z.boolean().optional(),
        }),
      )
      .length(2),
    copyright: z.string().min(10).max(120),
    legal: link,
  }),
});

export type HomeSchema = z.infer<typeof homeSchema>;
