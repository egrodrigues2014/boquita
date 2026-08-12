import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import {
  CATEGORIAS,
  OCASIONES,
  SUBCATEGORIAS,
  type Categoria,
  type Ocasion,
  type Subcategoria,
} from "@/types/shop";

/**
 * Esquema de `products` y `product_variants`.
 *
 * DOS tablas, no una. Las ocasiones siguen siendo un `array` de enum y no una
 * tabla de unión —nadie pregunta a Postgres «dame los de una ocasión»: `/tienda`
 * recibe el catálogo entero y filtra con `Array.filter`—, pero las
 * PRESENTACIONES sí son filas: son 60 para 23 productos, cada una con su precio,
 * y son exactamente las filas del Excel de Ale. Metidas en un `jsonb` perderían
 * el `CHECK (price > 0)`, que es la mitad de la razón por la que esta tabla tiene
 * CHECK: proteger el borde de ESCRITURA cuando exista el panel de administración.
 *
 * Los enums se derivan de `types/shop.ts`, que sigue siendo la fuente de verdad:
 * sus claves son las del nav y sus etiquetas se muestran en la UI. Añadir una
 * categoría es un cambio de tipos Y una migración, y eso es deseable — una
 * categoría nueva sin entrada en el dropdown sería un filtro invisible.
 */

/** `Object.keys` devuelve `string[]`; el cast conserva los literales para que la columna sea `Categoria` y no `string`. */
const categoriaValues = Object.keys(CATEGORIAS) as [Categoria, ...Categoria[]];
const subcategoriaValues = Object.keys(SUBCATEGORIAS) as [Subcategoria, ...Subcategoria[]];
const ocasionValues = Object.keys(OCASIONES) as [Ocasion, ...Ocasion[]];

export const categoriaEnum = pgEnum("categoria", categoriaValues);
export const subcategoriaEnum = pgEnum("subcategoria", subcategoriaValues);
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
     *
     * Es el precio de ENTRADA: el de la presentación más barata de
     * `product_variants`. Se guarda porque la tarjeta, el JSON-LD y la búsqueda
     * necesitan un número sin recorrer las variantes, y `content/shopSchema.ts`
     * comprueba al leer que sigue siendo el mínimo.
     */
    price: integer("price").notNull(),
    priceFrom: boolean("price_from").notNull().default(false),
    priceOnRequest: boolean("price_on_request").notNull().default(false),
    priceTodo: boolean("price_todo").notNull().default(false),

    description: text("description").array().notNull(),

    categoria: categoriaEnum("categoria").notNull(),
    subcategoria: subcategoriaEnum("subcategoria"),
    ocasiones: ocasionEnum("ocasiones").array().notNull(),
    ingredients: text("ingredients").array().notNull().default(sql`'{}'`),
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
    /** Segunda foto, hoy sólo el queque personalizado. `NULL` = no tiene. */
    imageBHeights: integer("image_b_heights").array(),
    imageBAlt: text("image_b_alt"),
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

    check(
      "products_description_size",
      sql`array_length(${table.description}, 1) BETWEEN 1 AND 4`,
    ),
    check("products_ocasiones_not_empty", sql`array_length(${table.ocasiones}, 1) >= 1`),
    check("products_ingredients_not_empty", sql`array_length(${table.ingredients}, 1) >= 1`),

    /**
     * De 1 a 3 escalones (400/800/1200), no de 2 a 3.
     *
     * Dos fotos del catálogo de Ale son miniaturas de ~400px y el pipeline no hace
     * upscale, así que sólo emiten el primer escalón. Exigir dos obligaría a
     * inventar el segundo. Ver `toImageHeights()` y `content/shopSchema.ts`.
     */
    check(
      "products_image_heights_size",
      sql`array_length(${table.imageHeights}, 1) BETWEEN 1 AND 3`,
    ),

    // La segunda foto es opcional, pero a medias no sirve: o alturas y alt, o nada.
    check(
      "products_image_b_complete",
      sql`(${table.imageBHeights} IS NULL) = (${table.imageBAlt} IS NULL)`,
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

/**
 * Las presentaciones de cada producto: una fila por opción del selector de la
 * ficha, que es una fila del Excel de Ale.
 *
 * La clave primaria es `(slug, unit)` y no un `id` autoincremental, a propósito:
 * es la MISMA identidad que usa una línea del carrito, así que dos presentaciones
 * con la misma etiqueta son imposibles aquí y no sólo improbables. Y hace la
 * semilla idempotente sin tener que buscar ids: `ON CONFLICT (slug, unit)`.
 */
export const productVariants = pgTable(
  "product_variants",
  {
    slug: text("slug")
      .notNull()
      // Si un producto desaparece, sus presentaciones se van con él: una variante
      // huérfana no la muestra nadie y falsearía cualquier recuento.
      .references(() => products.slug, { onDelete: "cascade", onUpdate: "cascade" }),
    /** Etiqueta visible y clave: «mediano (8-10 personas)», «12 unidades». */
    unit: text("unit").notNull(),
    price: integer("price").notNull(),
    /** Orden en el selector: de la más barata a la más cara. */
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.slug, table.unit] }),
    check("product_variants_price_positive", sql`${table.price} > 0`),
    check("product_variants_unit_length", sql`char_length(${table.unit}) BETWEEN 3 AND 60`),
  ],
);

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type ProductVariantRow = typeof productVariants.$inferSelect;
export type NewProductVariantRow = typeof productVariants.$inferInsert;
