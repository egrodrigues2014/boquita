import {
  CATEGORIAS,
  OCASIONES,
  SUBCATEGORIAS,
  type Categoria,
  type Ocasion,
  type Subcategoria,
  type ShopProduct,
} from "@/types/shop";

export interface ShopSearchFilters {
  categoria?: Categoria;
  ocasion?: Ocasion;
  subcategoria?: Subcategoria;
  sinAlergeno?: string;
  q?: string;
}

export type ShopSearchSource = Pick<
  ShopProduct,
  "slug" | "name" | "categoria" | "subcategoria" | "ocasiones" | "allergens"
>;

export type ShopSearchSuggestionKind = "product" | "categoria" | "subcategoria" | "ocasion" | "allergen";

export interface ShopSearchSuggestion {
  id: string;
  kind: ShopSearchSuggestionKind;
  label: string;
  href: string;
}

export function toShopSearchSources(products: ShopProduct[]): ShopSearchSource[] {
  return products.map(({ slug, name, categoria, subcategoria, ocasiones, allergens }) => ({
    slug,
    name,
    categoria,
    ...(subcategoria ? { subcategoria } : {}),
    ocasiones,
    allergens,
  }));
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
  { categoria, ocasion, subcategoria, sinAlergeno, q = "" }: ShopSearchFilters,
): ShopProduct[] {
  const normalizedQuery = normalizeSearch(q);
  const normalizedAlergeno = sinAlergeno ? normalizeSearch(sinAlergeno) : "";

  return products.filter((product) => {
    const matchesFilters =
      (!categoria || product.categoria === categoria) &&
      (!ocasion || product.ocasiones.includes(ocasion)) &&
      (!subcategoria || product.subcategoria === subcategoria) &&
      (!normalizedAlergeno ||
        !product.allergens.some((allergen) => normalizeSearch(allergen) === normalizedAlergeno));

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

function tiendaHref(params: Record<string, string>): string {
  const search = new URLSearchParams(params);
  return `/tienda?${search.toString()}`;
}

function uniqueAllergens(products: ShopSearchSource[]): string[] {
  const seen = new Set<string>();
  const allergens: string[] = [];

  for (const product of products) {
    for (const allergen of product.allergens) {
      const key = normalizeSearch(allergen);
      if (seen.has(key)) continue;
      seen.add(key);
      allergens.push(allergen);
    }
  }

  return allergens;
}

export function findShopAllergen(
  products: ShopSearchSource[],
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  const normalizedValue = normalizeSearch(value);
  return uniqueAllergens(products).find((allergen) => normalizeSearch(allergen) === normalizedValue);
}

export function getShopSearchSuggestions(
  products: ShopSearchSource[],
  query: string,
): ShopSearchSuggestion[] {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return [];

  const suggestions: ShopSearchSuggestion[] = [];

  for (const [key, label] of Object.entries(CATEGORIAS)) {
    if (!normalizeSearch(label).includes(normalizedQuery)) continue;
    suggestions.push({
      id: `categoria-${key}`,
      kind: "categoria",
      label,
      href: tiendaHref({ categoria: key }),
    });
  }

  for (const [key, label] of Object.entries(SUBCATEGORIAS)) {
    if (!normalizeSearch(label).includes(normalizedQuery)) continue;
    suggestions.push({
      id: `subcategoria-${key}`,
      kind: "subcategoria",
      label,
      href: tiendaHref({ subcategoria: key }),
    });
  }

  for (const [key, label] of Object.entries(OCASIONES)) {
    if (!normalizeSearch(label).includes(normalizedQuery)) continue;
    suggestions.push({
      id: `ocasion-${key}`,
      kind: "ocasion",
      label,
      href: tiendaHref({ ocasion: key }),
    });
  }

  for (const allergen of uniqueAllergens(products)) {
    if (!normalizeSearch(allergen).includes(normalizedQuery)) continue;
    suggestions.push({
      id: `allergen-${normalizeSearch(allergen)}`,
      kind: "allergen",
      label: `Sin ${allergen}`,
      href: tiendaHref({ sinAlergeno: allergen }),
    });
  }

  for (const product of products) {
    if (!normalizeSearch(product.name).includes(normalizedQuery)) continue;
    suggestions.push({
      id: `product-${product.slug}`,
      kind: "product",
      label: product.name,
      href: tiendaHref({ q: product.name }),
    });
  }

  return suggestions;
}
