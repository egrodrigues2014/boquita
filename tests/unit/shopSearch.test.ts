import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { CATEGORIAS } from "@/types/shop";
import {
  filterShopProducts,
  getShopSearchSuggestions,
  resolveShopSearchTarget,
  toShopSearchSources,
  type ShopSearchSource,
} from "@/lib/shopSearch";

describe("filterShopProducts", () => {
  it("filtra por nombre desde q", () => {
    // En plural sólo casa el producto: «brigadeiros» no es subcadena de «pie de
    // brigadeiro». En singular casan los dos.
    expect(filterShopProducts(products, { q: "brigadeiros" }).map((p) => p.slug)).toEqual([
      "brigadeiros",
    ]);
    // En singular casan además los dos Devil's Food, que llevan brigadeiro en la
    // descripción sin nombrarlo en el título: para eso se busca en el texto.
    expect(filterShopProducts(products, { q: "brigadeiro" }).map((p) => p.slug)).toEqual([
      "cupcakes-devils-food",
      "queque-devils-food",
      "brigadeiros",
      "pie-de-brigadeiro",
    ]);
  });

  it("filtra sin depender de acentos o mayúsculas", () => {
    expect(filterShopProducts(products, { q: "PolVOrones espanoles" }).map((p) => p.slug)).toEqual([
      "polvorones-espanoles",
    ]);
  });

  it("busca también por presentación", () => {
    // «24 unidades» sólo existe en la etiqueta de una variante: si la búsqueda no
    // las mirara, esto no devolvería nada.
    const slugs = filterShopProducts(products, { q: "24 unidades" }).map((p) => p.slug);
    expect(slugs).toContain("brigadeiros");
    expect(slugs).toContain("cupcakes-de-zanahoria");
  });

  it("busca por ingrediente, que no está en el nombre de nadie", () => {
    expect(filterShopProducts(products, { q: "monk fruit" }).map((p) => p.slug)).toEqual([
      "mousse-de-chocolate",
    ]);
    expect(filterShopProducts(products, { q: "dátiles" }).map((p) => p.slug)).toEqual([
      "barra-de-datiles",
    ]);
  });

  it("busca por subcategoría", () => {
    const slugs = filterShopProducts(products, { q: "cupcakes" }).map((p) => p.slug);
    expect(slugs).toContain("cupcakes-de-limon");
    expect(slugs).toContain("cupcakes-de-vainilla");
  });

  it("busca por el sinónimo de una categoría", () => {
    // Nadie escribe la palabra del catálogo si en su casa se dice torta, y ninguna ficha lleva
    // esa palabra: sin sinónimos esto devolvía cero sobre trece productos.
    const slugs = filterShopProducts(products, { q: "torta" }).map((p) => p.slug);
    const queques = products.filter((p) => p.categoria === "queques").map((p) => p.slug);

    expect(slugs).toEqual(queques);
    expect(slugs).toHaveLength(13);
  });

  it("el sinónimo funciona a medio escribir, que es cuando se busca", () => {
    // El desplegable ya sugiere la categoría con «tort»; si el filtro del servidor
    // no casara lo mismo, Enter llevaría a una página vacía.
    expect(filterShopProducts(products, { q: "tort" }).map((p) => p.slug)).toEqual(
      products.filter((p) => p.categoria === "queques").map((p) => p.slug),
    );
  });

  it("combina q con categoría y ocasión", () => {
    const result = filterShopProducts(products, {
      categoria: "dulces",
      ocasion: "regalos",
      q: "trufas",
    });

    expect(result.map((p) => p.slug)).toEqual(["brigadeiros"]);
  });

  it("filtra por subcategoria", () => {
    const result = filterShopProducts(products, { subcategoria: "cupcake" });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => product.subcategoria === "cupcake")).toBe(true);
  });

  it("filtra productos que no llevan un alergeno", () => {
    const result = filterShopProducts(products, { sinAlergeno: "huevo" });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => !product.allergens.includes("huevo"))).toBe(true);
  });

  it("combina q con filtros nuevos", () => {
    const result = filterShopProducts(products, {
      categoria: "dulces",
      sinAlergeno: "huevo",
      q: "brigadeiros",
    });

    expect(result.map((p) => p.slug)).toEqual(["brigadeiros"]);
  });

  it("una categoría que ya no existe no devuelve nada en vez de romper", () => {
    // Un enlace viejo con `?categoria=bocaditos` sigue llegando: la página ignora
    // el valor inválido antes de llamar aquí, pero el filtro tampoco debe inventar.
    const result = filterShopProducts(products, {
      categoria: "bocaditos" as never,
    });
    expect(result).toEqual([]);
  });
});

describe("getShopSearchSuggestions", () => {
  it("sugiere categoria y productos por nombre", () => {
    // La palabra se saca de una ficha real y la etiqueta del diccionario: así el
    // test afirma el comportamiento y no cómo se llame hoy la categoría.
    const primero = products.find((product) => product.categoria === "queques")!;
    const labels = getShopSearchSuggestions(
      toShopSearchSources(products),
      primero.name.split(" ")[0]!,
    ).map((suggestion) => suggestion.label);

    expect(labels).toContain(CATEGORIAS.queques);
    expect(labels).toContain(primero.name);
  });

  it("sugiere subcategoria y productos por nombre", () => {
    const labels = getShopSearchSuggestions(toShopSearchSources(products), "cupcake").map(
      (suggestion) => suggestion.label,
    );

    expect(labels).toContain("Cupcakes");
    expect(labels).toContain("Cupcakes de zanahoria");
  });

  it("sugiere filtro sin alergeno y conserva productos que coincidan por nombre", () => {
    const extraProduct: ShopSearchSource = {
      slug: "pan-con-huevo",
      name: "Pan con huevo",
      categoria: "dulces",
      ocasiones: ["regalos"],
      allergens: [],
    };
    const labels = getShopSearchSuggestions(
      [...toShopSearchSources(products), extraProduct],
      "huevo",
    ).map((suggestion) => suggestion.label);

    expect(labels).toContain("Sin huevo");
    expect(labels).toContain("Pan con huevo");
  });

  it("sugiere sin depender de acentos o mayusculas", () => {
    const labels = getShopSearchSuggestions(toShopSearchSources(products), "cumpleanos").map(
      (suggestion) => suggestion.label,
    );

    expect(labels).toContain("Cumpleaños");
  });

  it("sugiere la categoría por su sinónimo", () => {
    const suggestions = getShopSearchSuggestions(toShopSearchSources(products), "torta");

    expect(suggestions).toContainEqual({
      id: "categoria-queques",
      kind: "categoria",
      label: CATEGORIAS.queques,
      href: "/tienda?categoria=queques",
    });
  });

  it("no duplica la opción cuando casan a la vez la etiqueta y el sinónimo", () => {
    // «queque» puede casar a la vez con la etiqueta y con el sinónimo. Dos
    // pushes darían dos opciones con la misma `key` de React y el mismo `id` de
    // `aria-activedescendant`, y las flechas se saltarían una.
    const queques = getShopSearchSuggestions(toShopSearchSources(products), "queque").filter(
      (suggestion) => suggestion.kind === "categoria",
    );

    expect(queques).toHaveLength(1);
  });
});

describe("resolveShopSearchTarget", () => {
  it("un término exacto de la taxonomía lleva a su filtro", () => {
    expect(resolveShopSearchTarget("torta")).toBe("/tienda?categoria=queques");
    expect(resolveShopSearchTarget("tortas")).toBe("/tienda?categoria=queques");
    expect(resolveShopSearchTarget("queques")).toBe("/tienda?categoria=queques");
    expect(resolveShopSearchTarget(CATEGORIAS.queques)).toBe("/tienda?categoria=queques");
    expect(resolveShopSearchTarget("magdalena")).toBe("/tienda?subcategoria=cupcake");
  });

  it("no depende de acentos, mayúsculas ni espacios de sobra", () => {
    expect(resolveShopSearchTarget("  TORTA ")).toBe("/tienda?categoria=queques");
    expect(resolveShopSearchTarget("Reposteria")).toBe("/tienda?categoria=dulces");
  });

  it("lo que no es un término exacto se queda en búsqueda de texto", () => {
    // La coincidencia es exacta a propósito: con subcadena, la «c» de un nombre a
    // medio escribir se llevaría a quien busca hacia Cupcakes.
    expect(resolveShopSearchTarget("c")).toBeUndefined();
    expect(resolveShopSearchTarget("tort")).toBeUndefined();
    expect(resolveShopSearchTarget("brigadeiros")).toBeUndefined();
    expect(resolveShopSearchTarget("")).toBeUndefined();
    expect(resolveShopSearchTarget("   ")).toBeUndefined();
  });

  it("un alérgeno no se lleva el Enter", () => {
    // Nadie escribe «huevo» esperando que le escondan lo que lleva huevo: eso se
    // elige a propósito en el desplegable, no por accidente al pulsar Enter.
    expect(resolveShopSearchTarget("huevo")).toBeUndefined();
  });
});
