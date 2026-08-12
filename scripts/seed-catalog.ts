import { getTableColumns, inArray, sql } from "drizzle-orm";
import { products as fallbackCatalog } from "@/content/products";
import { getDb } from "@/lib/db";
import { productToRow, productToVariantRows } from "@/lib/db/rows";
import { productVariants, products } from "@/lib/db/schema";

/**
 * Siembra `products` y `product_variants` desde `content/products.ts`.
 *
 * IDEMPOTENTE: `ON CONFLICT (slug) DO UPDATE`. Se puede ejecutar tantas veces
 * como se quiera y el resultado es el mismo, así que también sirve para
 * reimportar tras editar el catálogo estático.
 *
 * Es el puente hasta el panel de la fase 3. Mientras no exista, los precios
 * reales de Ale se corrigen de dos maneras:
 *
 *   · un `UPDATE` en el SQL Editor de Neon, si es un arreglo puntual;
 *   · editar `content/products.ts` y volver a ejecutar esto, si son varios —
 *     así el fallback y la tabla dicen lo mismo, que es lo que hay que querer.
 *
 * Ojo con el segundo: `DO UPDATE` PISA lo que haya en la tabla. Si Ale ya
 * corrigió un precio por SQL y el fallback sigue con el placeholder, volver a
 * sembrar lo revierte. De ahí el resumen que imprime al final.
 */

/**
 * `SET` del upsert, derivado de las columnas reales.
 *
 * Escrito a mano se olvidaría una columna el día que se añada una, y el síntoma
 * sería un campo que no se actualiza nunca — de los errores más difíciles de ver.
 * `slug` se excluye porque es la clave del conflicto, y `createdAt` porque debe
 * conservar cuándo entró la fila por primera vez.
 */
function updateSet() {
  const columns = getTableColumns(products);
  const entries = Object.entries(columns)
    .filter(([key]) => key !== "slug" && key !== "createdAt" && key !== "updatedAt")
    .map(([key, column]) => [key, sql.raw(`excluded."${column.name}"`)] as const);

  return {
    ...Object.fromEntries(entries),
    updatedAt: sql`now()`,
  };
}

/** El mismo `SET` para `product_variants`, cuya clave de conflicto es `(slug, unit)`. */
function variantUpdateSet() {
  const columns = getTableColumns(productVariants);
  const entries = Object.entries(columns)
    .filter(([key]) => key !== "slug" && key !== "unit")
    .map(([key, column]) => [key, sql.raw(`excluded."${column.name}"`)] as const);

  return Object.fromEntries(entries);
}

/**
 * Carga `.env.local` a mano.
 *
 * drizzle-kit y los scripts de Node no lo leen por su cuenta —eso lo hace Next—
 * y `--env-file` no se puede pasar por `NODE_OPTIONS`, que es lo único que un
 * script de npm tendría a mano. `process.loadEnvFile` es de Node, sin
 * dependencias. Mismo código en `drizzle.config.ts`.
 *
 * Se llama desde `main()` y no en el ámbito del módulo porque los `import` de ES
 * se hoistean: cualquier código escrito arriba correría DESPUÉS de que se hayan
 * evaluado los imports, y daría una falsa sensación de orden. Da igual porque
 * `getDb()` lee el entorno en la llamada, no al importarse.
 */
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(file);
    } catch {
      // No existe: main() lo detecta y explica qué falta.
    }
  }
}

async function main() {
  loadEnv();

  const db = getDb();
  if (!db) {
    console.error(
      "Falta DATABASE_URL.\n\n" +
        "Este script lee `.env.local` (o `.env`) de la raíz del repo. Copiá la plantilla y\n" +
        "pegá las dos cadenas del panel «Connect» de Neon:\n\n" +
        "    cp .env.example .env.local\n\n" +
        "DATABASE_URL es la POOLED (el host lleva `-pooler`) y DATABASE_URL_UNPOOLED la\n" +
        "directa, que es la que usan las migraciones.",
    );
    process.exit(1);
  }

  const before = await db.select({ slug: products.slug }).from(products);
  // El orden del array ES el orden del catálogo: se guarda como `sort_order`.
  const rows = fallbackCatalog.map(productToRow);
  const variantRows = fallbackCatalog.flatMap(productToVariantRows);

  await db.insert(products).values(rows).onConflictDoUpdate({
    target: products.slug,
    set: updateSet(),
  });

  /**
   * Las presentaciones se BORRAN y se reinsertan, no sólo se upsertan.
   *
   * Un upsert deja vivas las variantes que el catálogo ya no tiene: si un tamaño
   * se retira, la ficha seguiría ofreciéndolo con su precio viejo. Borrar por
   * producto y reinsertar es lo único que hace que la tabla sea un espejo del
   * catálogo. El `onConflictDoUpdate` se queda igualmente para el caso de que dos
   * ejecuciones se pisen.
   */
  await db.delete(productVariants).where(
    inArray(
      productVariants.slug,
      rows.map((row) => row.slug),
    ),
  );
  await db.insert(productVariants).values(variantRows).onConflictDoUpdate({
    target: [productVariants.slug, productVariants.unit],
    set: variantUpdateSet(),
  });

  const after = await db.select({ slug: products.slug, price: products.price }).from(products);

  const seeded = new Set(rows.map((row) => row.slug));
  const inserted = rows.filter((row) => !before.some((r) => r.slug === row.slug)).length;
  // Filas que están en la tabla y NO en content/products.ts: las dejamos en paz,
  // pero hay que decirlo. Podrían ser productos creados desde el panel.
  const huerfanas = after.filter((row) => !seeded.has(row.slug)).map((row) => row.slug);

  console.log(
    `Semilla lista: ${rows.length} productos y ${variantRows.length} presentaciones procesadas ` +
      `(${inserted} productos nuevos, ${rows.length - inserted} actualizados). ` +
      `La tabla tiene ahora ${after.length} filas.`,
  );

  if (huerfanas.length > 0) {
    console.warn(
      `⚠ ${huerfanas.length} filas de la tabla no están en content/products.ts y NO se han ` +
        `tocado: ${huerfanas.join(", ")}. Si son productos nuevos, conviene copiarlos al ` +
        `fallback para que sobrevivan a una caída de la base.`,
    );
  }

  if (inserted === 0 && before.length > 0) {
    console.warn(
      "⚠ Todas las filas existían ya y se han SOBRESCRITO con los valores de " +
        "content/products.ts. Si alguien había corregido precios por SQL, esos cambios se " +
        "acaban de perder.",
    );
  }
}

main().catch((error: unknown) => {
  console.error("La semilla falló:", error);
  process.exit(1);
});
