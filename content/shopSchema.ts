import { z } from "zod";
import { CATEGORIAS, OCASIONES, SUBCATEGORIAS } from "@/types/shop";

/**
 * Valida el catálogo. A diferencia del esquema de la portada, aquí NO se fijan
 * cantidades: el catálogo puede crecer. Lo que sí se blinda es la coherencia de
 * cada ficha, porque un producto a medio rellenar se ve roto en la tienda.
 */

const categoria = z.enum(Object.keys(CATEGORIAS) as [string, ...string[]]);
const subcategoria = z.enum(Object.keys(SUBCATEGORIAS) as [string, ...string[]]);
const ocasion = z.enum(Object.keys(OCASIONES) as [string, ...string[]]);

const imagen = z.object({
  src: z.string().startsWith("/img/producto/"),
  /**
   * Mínimo UN escalón, no dos.
   *
   * Dos fotos del catálogo de Ale son miniaturas de ~400px de ancho
   * (`QUE-03.jpg`, `QUE-010.jpg`), y `scripts/build-images.mjs` aborta antes que
   * hacer upscale — con razón. Exigir dos escalones obligaría a inventar el
   * segundo, así que se admite uno y el producto va marcado `photoTodo`.
   */
  srcSet: z
    .array(z.object({ src: z.string().startsWith("/img/producto/"), width: z.number().int() }))
    .min(1),
  sizes: z.string().min(10),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().min(25),
});

export const productVariantSchema = z.object({
  unit: z.string().min(3).max(60),
  price: z.number().int().positive(),
});

export const shopProductSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case sin acentos"),
    name: z.string().min(3).max(40),
    price: z.number().int().positive(),
    priceFrom: z.boolean().optional(),
    priceOnRequest: z.boolean().optional(),
    priceTodo: z.boolean().optional(),
    variants: z.array(productVariantSchema).min(1).max(6),
    // La tarjeta del catálogo tiene sitio para ~4 líneas con el primer párrafo.
    description: z.array(z.string().min(20).max(300)).min(1).max(4),
    categoria,
    subcategoria: subcategoria.optional(),
    ocasiones: z.array(ocasion).min(1),
    ingredients: z.array(z.string().min(3).max(40)).min(1).max(15),
    allergens: z.array(z.string().min(3).max(20)),
    // Nada por debajo de 24h: se hornea por encargo, no hay stock.
    leadTimeHours: z.number().int().min(24).max(336),
    image: imagen,
    imageB: imagen.optional(),
    photoTodo: z.boolean().optional(),
  })
  .refine((product) => !(product.priceOnRequest && !product.priceFrom), {
    message: "un precio a convenir debe mostrarse como «desde», o el importe engaña",
    path: ["priceFrom"],
  })
  /**
   * `price` es un espejo del mínimo de `variants`, y estos dos `.refine()` son lo
   * que impide que se separen en silencio. Sin ellos, la tarjeta del catálogo
   * podría anunciar un precio que el selector de la ficha no ofrece — el peor
   * fallo posible en una tienda, porque no se ve hasta que alguien reclama.
   *
   * El personalizado queda fuera del primero: su `price` es el `price_min` del
   * Excel (22.000) y su única variante no lleva importe fijo.
   */
  .refine(
    (product) =>
      product.priceOnRequest ||
      product.price === Math.min(...product.variants.map((variant) => variant.price)),
    {
      message: "el precio debe ser el de la variante más barata",
      path: ["price"],
    },
  )
  .refine((product) => product.variants.length === 1 || product.priceFrom === true, {
    message: "con varias presentaciones el precio se muestra «desde», o engaña",
    path: ["priceFrom"],
  })
  .refine(
    (product) =>
      new Set(product.variants.map((variant) => variant.unit)).size === product.variants.length,
    {
      message: "dos presentaciones con la misma etiqueta: el carrito las sumaría en una línea",
      path: ["variants"],
    },
  );

export const catalogSchema = z
  .array(shopProductSchema)
  .min(1)
  .refine((list) => new Set(list.map((p) => p.slug)).size === list.length, {
    message: "hay slugs duplicados: romperían las rutas de /tienda/[slug]",
  });

export type ShopProductSchema = z.infer<typeof shopProductSchema>;
