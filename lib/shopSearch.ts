import {
  CATEGORIAS,
  OCASIONES,
  SINONIMOS_CATEGORIA,
  SINONIMOS_SUBCATEGORIA,
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

/**
 * Todo lo que puede escribir alguien para referirse a un término de la
 * taxonomía: su etiqueta más sus sinónimos, ya normalizados.
 *
 * Único sitio del que tiran el filtrado, las sugerencias y el destino de Enter.
 * Si se desincronizan, el desplegable ofrece un filtro que luego sale vacío.
 */
function searchTerms(label: string, sinonimos: string[]): string[] {
  return [label, ...sinonimos].map(normalizeSearch);
}

const CATEGORIA_ENTRIES = Object.entries(CATEGORIAS) as [Categoria, string][];
const SUBCATEGORIA_ENTRIES = Object.entries(SUBCATEGORIAS) as [Subcategoria, string][];

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
     *
     * Y en los SINÓNIMOS de la categoría, o `?q=torta` —el enlace que alguien
     * comparta por WhatsApp— daría cero resultados aunque el desplegable sí
     * sugiera «Queques».
     */
    const searchable = normalizeSearch(
      [
        product.name,
        ...product.description,
        ...product.variants.map((variant) => variant.unit),
        ...product.ingredients,
        CATEGORIAS[product.categoria],
        ...SINONIMOS_CATEGORIA[product.categoria],
        product.subcategoria ? SUBCATEGORIAS[product.subcategoria] : "",
        ...(product.subcategoria ? SINONIMOS_SUBCATEGORIA[product.subcategoria] : []),
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

  // Un `some` y un solo `push` por clave: «queque» casa a la vez con la etiqueta
  // y con el sinónimo, y dos pushes duplicarían la opción, su `key` de React y
  // su `id` de `aria-activedescendant`.
  for (const [key, label] of CATEGORIA_ENTRIES) {
    const terms = searchTerms(label, SINONIMOS_CATEGORIA[key]);
    if (!terms.some((term) => term.includes(normalizedQuery))) continue;
    suggestions.push({
      id: `categoria-${key}`,
      kind: "categoria",
      label,
      href: tiendaHref({ categoria: key }),
    });
  }

  for (const [key, label] of SUBCATEGORIA_ENTRIES) {
    const terms = searchTerms(label, SINONIMOS_SUBCATEGORIA[key]);
    if (!terms.some((term) => term.includes(normalizedQuery))) continue;
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

/**
 * A dónde lleva Enter en el buscador cuando no hay ninguna sugerencia marcada
 * con las flechas: al filtro si lo escrito ES un término de la taxonomía,
 * `undefined` si no —y entonces el formulario hace su submit de siempre a `?q=`.
 *
 * La coincidencia es EXACTA, no subcadena, y ahí está toda la gracia: «torta»
 * abre `?categoria=queques`, pero «tort» y «brigadeiros» siguen siendo búsqueda
 * de texto. Con subcadena, teclear una «c» secuestraría la búsqueda hacia
 * Cupcakes antes de terminar de escribir.
 *
 * No mira productos ni alérgenos: un producto ya resuelve a `?q=`, y nadie
 * escribe «huevo» esperando que le escondan lo que lleva huevo.
 */
export function resolveShopSearchTarget(query: string): string | undefined {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return undefined;

  // Categoría antes que subcategoría: el mismo orden de precedencia que emiten
  // las sugerencias, para que Enter coincida con lo que se ve arriba del todo.
  for (const [key, label] of CATEGORIA_ENTRIES) {
    if (searchTerms(label, SINONIMOS_CATEGORIA[key]).includes(normalizedQuery)) {
      return tiendaHref({ categoria: key });
    }
  }

  for (const [key, label] of SUBCATEGORIA_ENTRIES) {
    if (searchTerms(label, SINONIMOS_SUBCATEGORIA[key]).includes(normalizedQuery)) {
      return tiendaHref({ subcategoria: key });
    }
  }

  return undefined;
}
