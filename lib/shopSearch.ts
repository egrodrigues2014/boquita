import {
  CATEGORIAS,
  OCASIONES,
  SUBCATEGORIAS,
  type Categoria,
  type Ocasion,
  type ShopProduct,
} from "@/types/shop";

export interface ShopSearchFilters {
  categoria?: Categoria;
  ocasion?: Ocasion;
  q?: string;
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function filterShopProducts(
  products: ShopProduct[],
  { categoria, ocasion, q = "" }: ShopSearchFilters,
): ShopProduct[] {
  const normalizedQuery = normalizeSearch(q);

  return products.filter((product) => {
    const matchesFilters =
      (!categoria || product.categoria === categoria) &&
      (!ocasion || product.ocasiones.includes(ocasion));

    if (!matchesFilters) return false;
    if (!normalizedQuery) return true;

    /**
     * Se busca también en los INGREDIENTES y en las presentaciones: «monk fruit»,
     * «dátiles» o «24 unidades» son búsquedas que alguien va a escribir, y el
     * nombre del producto no las contiene.
     */
    const searchable = normalizeSearch(
      [
        product.name,
        ...product.description,
        ...product.variants.map((variant) => variant.unit),
        ...product.ingredients,
        CATEGORIAS[product.categoria],
        product.subcategoria ? SUBCATEGORIAS[product.subcategoria] : "",
        ...product.ocasiones.map((key) => OCASIONES[key]),
      ].join(" "),
    );

    return searchable.includes(normalizedQuery);
  });
}
