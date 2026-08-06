import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { filterShopProducts } from "@/lib/shopSearch";

describe("filterShopProducts", () => {
  it("filtra por nombre desde q", () => {
    expect(filterShopProducts(products, { q: "brigadeiros" }).map((p) => p.slug)).toEqual([
      "brigadeiros",
    ]);
  });

  it("filtra sin depender de acentos o mayúsculas", () => {
    expect(filterShopProducts(products, { q: "BISCOtTi" }).map((p) => p.slug)).toContain(
      "biscotti-de-almendra",
    );
  });

  it("busca también por categoría y unidad", () => {
    expect(filterShopProducts(products, { q: "media docena" }).map((p) => p.slug)).toContain(
      "cachitos-de-jamon",
    );
  });

  it("combina q con categoría y ocasión", () => {
    const result = filterShopProducts(products, {
      categoria: "bocaditos",
      ocasion: "regalos",
      q: "chocolate",
    });

    expect(result.map((p) => p.slug)).toEqual(["brigadeiros"]);
  });
});
