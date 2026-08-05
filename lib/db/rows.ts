import { imageHeightsOf } from "@/lib/productImage";
import type { ShopProduct } from "@/types/shop";
import type { NewProductRow } from "./schema";

/**
 * `ShopProduct` → fila de `products`.
 *
 * Vive aquí y no dentro de `scripts/seed-catalog.ts` para que se pueda testear:
 * la propiedad que importa es que sembrar y leer no pierda nada, y eso se afirma
 * componiendo esta función con `rowToProduct` de `lib/db/catalog.ts`. Si el
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
    unit: product.unit,
    summary: product.summary,
    description: product.description,
    categoria: product.categoria,
    ocasiones: product.ocasiones,
    allergens: product.allergens,
    leadTimeHours: product.leadTimeHours,
    imageHeights: imageHeightsOf(product.image),
    imageAlt: product.image.alt,
    photoTodo: product.photoTodo ?? false,
    sortOrder,
  };
}
