import { imageHeightsOf } from "@/lib/productImage";
import type { ShopProduct } from "@/types/shop";
import type { NewProductRow, NewProductVariantRow } from "./schema";

/**
 * `ShopProduct` → filas de `products` y `product_variants`.
 *
 * Vive aquí y no dentro de `scripts/seed-catalog.ts` para que se pueda testear:
 * la propiedad que importa es que sembrar y leer no pierda nada, y eso se afirma
 * componiendo estas funciones con `rowToProduct` de `lib/db/catalog.ts`. Si el
 * mapeo viviera dentro del script, el test tendría que reimplementarlo y
 * entonces no probaría el código que se ejecuta de verdad.
 *
 * Los flags opcionales se aplanan a `false`: en la tabla son `NOT NULL`, y un
 * `undefined` insertado como NULL rompería la lectura.
 */
export function productToRow(product: ShopProduct, sortOrder: number): NewProductRow {
  return {
    slug: product.slug,
    name: product.name,
    price: product.price,
    priceFrom: product.priceFrom ?? false,
    priceOnRequest: product.priceOnRequest ?? false,
    priceTodo: product.priceTodo ?? false,
    description: product.description,
    categoria: product.categoria,
    // `null` y no `undefined`: la columna es nullable y Drizzle necesita el valor
    // explícito para no omitir la columna en el UPDATE de la semilla.
    subcategoria: product.subcategoria ?? null,
    ocasiones: product.ocasiones,
    ingredients: product.ingredients,
    allergens: product.allergens,
    leadTimeHours: product.leadTimeHours,
    imageHeights: imageHeightsOf(product.image),
    imageAlt: product.image.alt,
    imageBHeights: product.imageB ? imageHeightsOf(product.imageB) : null,
    imageBAlt: product.imageB?.alt ?? null,
    photoTodo: product.photoTodo ?? false,
    sortOrder,
  };
}

/**
 * Una fila por presentación. El `sortOrder` es la posición en el array, que el
 * catálogo mantiene de la más barata a la más cara: así el selector de la ficha
 * sale ordenado sin que nadie tenga que ordenarlo al leer.
 */
export function productToVariantRows(product: ShopProduct): NewProductVariantRow[] {
  return product.variants.map((variant, index) => ({
    slug: product.slug,
    unit: variant.unit,
    price: variant.price,
    sortOrder: index,
  }));
}
