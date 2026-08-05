import { sql } from "drizzle-orm";
import { boolean, check, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { CATEGORIAS, OCASIONES, type Categoria, type Ocasion } from "@/types/shop";

/**
 * Esquema de la tabla `products`.
 *
 * UNA tabla y DOS enums, y nada más. Para 14 filas que se filtran en memoria,
 * una tabla de unión `product_ocasiones` sería ceremonia sin beneficio: no hay
 * ninguna consulta que pida «todos los productos de una ocasión» a Postgres —
 * `/tienda` recibe el catálogo entero y filtra con `Array.filter`. Así el `SELECT`
 * es uno solo y la fila mapea 1:1 con `ShopProduct`.
 *
 * Los enums se derivan de `types/shop.ts`, que sigue siendo la fuente de verdad:
 * sus claves son las del nav y sus etiquetas se muestran en la UI. Añadir una
 * categoría es un cambio de tipos Y una migración, y eso es deseable — una
 * categoría nueva sin entrada en el dropdown sería un filtro invisible.
 */

/** `Object.keys` devuelve `string[]`; el cast conserva los literales para que la columna sea `Categoria` y no `string`. */
const categoriaValues = Object.keys(CATEGORIAS) as [Categoria, ...Categoria[]];
const ocasionValues = Object.keys(OCASIONES) as [Ocasion, ...Ocasion[]];

export const categoriaEnum = pgEnum("categoria", categoriaValues);
export const ocasionEnum = pgEnum("ocasion", ocasionValues);

export const products = pgTable(
  "products",
  {
    slug: text("slug").primaryKey(),
    name: text("name").notNull(),

    /**
     * Colones ENTEROS. `integer`, nunca `numeric`: el driver devuelve `numeric`
     * como `string` para no perder precisión, y `formatCRCShort` recibiría
     * `"14000"` en vez de `14000`. Todo el proyecto asume `Colones = number`.
     */
    price: integer("price").notNull(),
    priceFrom: boolean("price_from").notNull().default(false),
    priceOnRequest: boolean("price_on_request").notNull().default(false),
    priceTodo: boolean("price_todo").notNull().default(false),

    unit: text("unit").notNull(),
    summary: text("summary").notNull(),
    description: text("description").array().notNull(),

    categoria: categoriaEnum("categoria").notNull(),
    ocasiones: ocasionEnum("ocasiones").array().notNull(),
    allergens: text("allergens").array().notNull().default(sql`'{}'`),

    leadTimeHours: integer("lead_time_hours").notNull(),

    /**
     * Sólo las alturas de los derivados y el alt. El `srcSet` completo se
     * reconstruye con `lib/productImage.ts`, que es también lo que usa el
     * catálogo estático: guardar las rutas aquí las dejaría desincronizarse de
     * lo que hay de verdad en `public/img/`.
     */
    imageHeights: integer("image_heights").array().notNull(),
    imageAlt: text("image_alt").notNull(),
    photoTodo: boolean("photo_todo").notNull().default(false),

    /** Orden del catálogo. Sin él, `SELECT` sin `ORDER BY` no garantiza nada. */
    sortOrder: integer("sort_order").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    /**
     * Los mismos invariantes que `content/shopSchema.ts` valida con Zod, pero en
     * la base. No es redundancia: Zod protege el borde de LECTURA (una fila mala
     * cae al fallback en vez de romper la tienda), y estos CHECK protegen el
     * borde de ESCRITURA. Cuando exista el panel de la fase 3, un formulario con
     * un bug no podrá dejar el catálogo en un estado que la tienda no sepa
     * renderizar.
     */
    check("products_slug_kebab", sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("products_price_positive", sql`${table.price} > 0`),

    // Se hornea por encargo: no hay stock. Menos de 24h es imposible, y más de
    // dos semanas no es un pedido, es una conversación.
    check(
      "products_lead_time_range",
      sql`${table.leadTimeHours} BETWEEN 24 AND 336`,
    ),

    // La tarjeta del catálogo tiene sitio para ~2 líneas.
    check("products_summary_length", sql`char_length(${table.summary}) BETWEEN 20 AND 110`),
    check(
      "products_description_size",
      sql`array_length(${table.description}, 1) BETWEEN 1 AND 4`,
    ),
    check("products_ocasiones_not_empty", sql`array_length(${table.ocasiones}, 1) >= 1`),

    // 2 escalones (400/800) o 3 (400/800/1200). Ver toImageHeights().
    check(
      "products_image_heights_size",
      sql`array_length(${table.imageHeights}, 1) BETWEEN 2 AND 3`,
    ),

    /**
     * Un precio a convenir DEBE mostrarse como «desde», o el importe engaña: el
     * queque personalizado sale a 22.000 y termina costando más. Es la misma
     * regla del `.refine()` de `shopProductSchema`, y la única de todas éstas que
     * no es un rango sino una implicación.
     */
    check(
      "products_on_request_is_from",
      sql`NOT (${table.priceOnRequest} AND NOT ${table.priceFrom})`,
    ),
  ],
);

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
