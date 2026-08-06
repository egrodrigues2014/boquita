import { CATEGORIAS, OCASIONES, type Categoria, type Ocasion, type ShopProduct } from "@/types/shop";

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

    const searchable = normalizeSearch(
      [
        product.name,
        product.summary,
        product.unit,
        CATEGORIAS[product.categoria],
        ...product.ocasiones.map((key) => OCASIONES[key]),
      ].join(" "),
    );

    return searchable.includes(normalizedQuery);
  });
}
