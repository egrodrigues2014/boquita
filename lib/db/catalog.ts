import { asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { products as fallbackCatalog } from "@/content/products";
import { shopProductSchema } from "@/content/shopSchema";
import { productImage, toImageHeights } from "@/lib/productImage";
import type { ShopProduct } from "@/types/shop";
import { getDb } from "./index";
import {
  productVariants as variantsTable,
  products as productsTable,
  type ProductRow,
  type ProductVariantRow,
} from "./schema";

/**
 * Lectura del catálogo, con `content/products.ts` como fallback.
 *
 * El fallback NO es paranoia decorativa; cubre tres casos que van a pasar de
 * verdad:
 *
 *   1. No hay `DATABASE_URL`. Es el modo de CI, de una máquina recién clonada y
 *      de `npm run dev` antes de que exista `.env.local`. Los 138 tests
 *      unitarios y los 495 e2e corren así.
 *   2. La tabla está vacía. Migración aplicada pero semilla no ejecutada.
 *   3. Una fila no cumple el esquema. Cuando exista el panel de la fase 3, Ale
 *      va a poder guardar un `summary` de 400 caracteres; eso desmaquetaría la
 *      tarjeta del catálogo. La fila mala se sustituye por su versión buena en
 *      vez de tumbar la tienda entera.
 *
 * La regla que gobierna las tres: **la tienda nunca se sirve vacía.** Un
 * catálogo en blanco por un fallo de infraestructura le cuesta pedidos a Ale.
 */

/**
 * Fila → `ShopProduct`, validado.
 *
 * Los flags se omiten cuando son `false` en vez de escribirse explícitamente,
 * para que un producto que viene de la base sea IDÉNTICO al mismo producto del
 * fallback. Así el test que compara las dos fuentes compara de verdad, y no
 * pasa por un `{priceFrom: false}` contra un `{}`.
 */
export function rowToProduct(
  row: ProductRow,
  variantRows: readonly ProductVariantRow[] = [],
): ShopProduct | undefined {
  const heights = toImageHeights(row.imageHeights);
  if (!heights) return undefined;

  // Sin presentaciones no hay nada que comprar: el producto se descarta y cae al
  // fallback, en vez de renderizar una ficha con un botón que no sabe qué añadir.
  if (variantRows.length === 0) return undefined;

  const bHeights = row.imageBHeights ? toImageHeights(row.imageBHeights) : undefined;

  const product: ShopProduct = {
    slug: row.slug,
    name: row.name,
    price: row.price,
    ...(row.priceFrom ? { priceFrom: true } : {}),
    ...(row.priceOnRequest ? { priceOnRequest: true } : {}),
    ...(row.priceTodo ? { priceTodo: true } : {}),
    variants: [...variantRows]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((variant) => ({ unit: variant.unit, price: variant.price })),
    description: row.description,
    categoria: row.categoria,
    ...(row.subcategoria ? { subcategoria: row.subcategoria } : {}),
    ocasiones: row.ocasiones,
    ingredients: row.ingredients,
    allergens: row.allergens,
    leadTimeHours: row.leadTimeHours,
    image: productImage(row.slug, heights, row.imageAlt),
    ...(bHeights && row.imageBAlt
      ? { imageB: productImage(`${row.slug}-b`, bHeights, row.imageBAlt) }
      : {}),
    ...(row.photoTodo ? { photoTodo: true } : {}),
  };

  // Se reutiliza el MISMO Zod que valida el catálogo estático en los tests. Un
  // segundo esquema «para la base» acabaría divergiendo del primero.
  return shopProductSchema.safeParse(product).success ? product : undefined;
}

/** Sustituye una fila inválida por su equivalente del fallback, si existe. */
function repair(row: ProductRow): ShopProduct | undefined {
  const rescued = fallbackCatalog.find((product) => product.slug === row.slug);
  console.warn(
    rescued
      ? `[catalog] la fila "${row.slug}" no cumple el esquema; se sirve la versión de content/products.ts`
      : `[catalog] la fila "${row.slug}" no cumple el esquema y no está en el fallback; se omite`,
  );
  return rescued;
}

/** Etiqueta de caché. El panel de la fase 3 la invalidará con `revalidateTag`. */
export const CATALOG_CACHE_TAG = "catalog";

/**
 * La consulta de verdad. Lanza si Postgres no contesta — a propósito: así
 * `unstable_cache` no guarda el fallo, y en cuanto la base vuelve se sirve la
 * base sin esperar a que expire nada.
 */
async function loadFromDb(): Promise<ShopProduct[]> {
  const db = getDb();
  if (!db) return fallbackCatalog;

  /**
   * Dos consultas, no un JOIN: el JOIN devolvería el producto repetido una vez
   * por presentación —60 filas con la descripción entera en cada una— y habría
   * que deshacerlo en memoria igual. Dos `SELECT` completos y un `Map` es menos
   * tráfico y menos código. Van en paralelo, y la caché de una hora las cubre
   * las dos.
   */
  const [rows, variantRows] = await Promise.all([
    db.select().from(productsTable).orderBy(asc(productsTable.sortOrder)),
    db.select().from(variantsTable),
  ]);

  if (rows.length === 0) {
    console.warn("[catalog] la tabla products está vacía; se sirve content/products.ts");
    return fallbackCatalog;
  }

  const variantsBySlug = new Map<string, ProductVariantRow[]>();
  for (const variant of variantRows) {
    const list = variantsBySlug.get(variant.slug);
    if (list) list.push(variant);
    else variantsBySlug.set(variant.slug, [variant]);
  }

  const catalog = rows
    .map((row) => rowToProduct(row, variantsBySlug.get(row.slug) ?? []) ?? repair(row))
    .filter((product): product is ShopProduct => product !== undefined);

  // Todas las filas eran irrecuperables. Con la base contestando, esto sólo pasa
  // si el esquema del código y el de la tabla se han separado.
  if (catalog.length === 0) {
    console.error("[catalog] ninguna fila de products es utilizable; se sirve content/products.ts");
    return fallbackCatalog;
  }

  return catalog;
}

/**
 * Caché ENTRE peticiones, no sólo dentro de una.
 *
 * Sin esto, `/tienda` iría a Postgres en cada visita: lee `searchParams` para los
 * filtros, así que Next la renderiza dinámicamente y el `revalidate` del layout
 * no la cubre. Y eso no es sólo latencia — el cómputo de Neon se autosuspende a
 * los 5 minutos de inactividad, de modo que un goteo de visitas lo mantendría
 * despierto casi todo el día. El plan Free da 100 CU-horas al mes; despierto 12
 * horas diarias no cabe en esa cifra.
 *
 * Con la caché, Postgres se toca una vez por hora y el cómputo pasa suspendido
 * casi todo el tiempo. Es también lo que conserva los presupuestos medidos.
 */
const loadCached = unstable_cache(loadFromDb, ["catalog"], {
  revalidate: 3600,
  tags: [CATALOG_CACHE_TAG],
});

/**
 * El catálogo completo, ordenado.
 *
 * Doble caché, y las dos hacen falta: `unstable_cache` evita ir a Postgres entre
 * peticiones, y `cache()` de React deduplica DENTRO de una —la ficha de producto
 * lo pide dos veces, en `generateMetadata` y en el componente—. Fuera de un
 * render de React (los tests), `cache()` degrada a llamar la función tal cual.
 */
export const getCatalog = cache(async (): Promise<ShopProduct[]> => {
  if (!getDb()) return fallbackCatalog;

  try {
    return await loadCached();
  } catch (error) {
    // Aquí caen el cómputo que no despierta, la credencial rotada y la migración
    // a medio aplicar. Ninguno debe dejar la tienda en blanco.
    console.error("[catalog] la consulta a Postgres falló; se sirve content/products.ts", error);
    return fallbackCatalog;
  }
});

/** Búsqueda por slug, para `/tienda/[slug]`. Reaprovecha el catálogo cacheado. */
export async function getProduct(slug: string): Promise<ShopProduct | undefined> {
  return (await getCatalog()).find((product) => product.slug === slug);
}
