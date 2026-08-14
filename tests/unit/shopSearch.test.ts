import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import {
  filterShopProducts,
  getShopSearchSuggestions,
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
    const labels = getShopSearchSuggestions(toShopSearchSources(products), "Queq").map(
      (suggestion) => suggestion.label,
    );

    expect(labels).toContain("Queques");
    expect(labels).toContain("Queque de zanahoria");
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
});
