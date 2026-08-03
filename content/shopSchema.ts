import { z } from "zod";
import { CATEGORIAS, OCASIONES } from "@/types/shop";

/**
 * Valida el catálogo. A diferencia del esquema de la portada, aquí NO se fijan
 * cantidades: el catálogo puede crecer. Lo que sí se blinda es la coherencia de
 * cada ficha, porque un producto a medio rellenar se ve roto en la tienda.
 */

const categoria = z.enum(Object.keys(CATEGORIAS) as [string, ...string[]]);
const ocasion = z.enum(Object.keys(OCASIONES) as [string, ...string[]]);

export const shopProductSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case sin acentos"),
    name: z.string().min(3).max(40),
    price: z.number().int().positive(),
    priceFrom: z.boolean().optional(),
    priceOnRequest: z.boolean().optional(),
    priceTodo: z.boolean().optional(),
    unit: z.string().min(3).max(60),
    // La tarjeta del catálogo tiene sitio para ~2 líneas.
    summary: z.string().min(20).max(110),
    description: z.array(z.string().min(40).max(400)).min(1).max(4),
    categoria,
    ocasiones: z.array(ocasion).min(1),
    allergens: z.array(z.string().min(3).max(20)),
    // Nada por debajo de 24h: se hornea por encargo, no hay stock.
    leadTimeHours: z.number().int().min(24).max(336),
    image: z.object({
      src: z.string().startsWith("/img/producto/"),
      srcSet: z
        .array(z.object({ src: z.string().startsWith("/img/producto/"), width: z.number().int() }))
        .min(2),
      sizes: z.string().min(10),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      alt: z.string().min(25),
    }),
    photoTodo: z.boolean().optional(),
  })
  .refine((product) => !(product.priceOnRequest && !product.priceFrom), {
    message: "un precio a convenir debe mostrarse como «desde», o el importe engaña",
    path: ["priceFrom"],
  });

export const catalogSchema = z
  .array(shopProductSchema)
  .min(1)
  .refine((list) => new Set(list.map((p) => p.slug)).size === list.length, {
    message: "hay slugs duplicados: romperían las rutas de /tienda/[slug]",
  });

export type ShopProductSchema = z.infer<typeof shopProductSchema>;
