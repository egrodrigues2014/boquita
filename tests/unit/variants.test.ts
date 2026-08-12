import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { entryVariant, findVariant, variantsLabel } from "@/lib/variants";
import type { ProductVariant, ShopProduct } from "@/types/shop";

const variants = (...pairs: [string, number][]): ProductVariant[] =>
  pairs.map(([unit, price]) => ({ unit, price }));

describe("variantsLabel", () => {
  it("quita el paréntesis explicativo y une con «o»", () => {
    expect(
      variantsLabel(
        variants(
          ["pequeño (2 personas)", 2500],
          ["mediano (8-10 personas)", 12000],
          ["grande (20 personas)", 24000],
        ),
      ),
    ).toBe("pequeño, mediano o grande");
  });

  it("factoriza el sustantivo repetido de los cupcakes", () => {
    expect(variantsLabel(variants(["6 unidades", 8400], ["12 unidades", 15500], ["24 unidades", 27600]))).toBe(
      "6, 12 o 24 unidades",
    );
  });

  it("factoriza también con dos presentaciones", () => {
    expect(variantsLabel(variants(["120 g", 2500], ["250 g", 4500]))).toBe("120 o 250 g");
  });

  it("no factoriza cuando la última palabra difiere", () => {
    expect(
      variantsLabel(
        variants(
          ["mediano (8 personas)", 6500],
          ["grande (18 personas)", 12000],
          ["grande sin azúcar (18 personas)", 14000],
        ),
      ),
    ).toBe("mediano, grande o grande sin azúcar");
  });

  it("no factoriza etiquetas de una sola palabra", () => {
    expect(variantsLabel(variants(["mediana", 12000], ["grande", 22000]))).toBe("mediana o grande");
  });

  it("con una sola presentación devuelve su etiqueta pelada", () => {
    expect(variantsLabel(variants(["grande (15 personas)", 17350]))).toBe("grande");
  });

  it("deduplica: dos precios bajo la misma etiqueta corta no la repiten", () => {
    expect(variantsLabel(variants(["individual", 2400], ["individual (caja)", 4400]))).toBe(
      "individual",
    );
  });

  it("sin presentaciones devuelve cadena vacía en vez de romper la tarjeta", () => {
    expect(variantsLabel([])).toBe("");
  });
});

describe("entryVariant", () => {
  const product = { variants: variants(["mediano", 12000], ["pequeño", 2500], ["grande", 24000]) };

  it("devuelve la más barata, no la primera de la lista", () => {
    expect(entryVariant(product as ShopProduct)?.unit).toBe("pequeño");
  });

  it("sin presentaciones devuelve undefined", () => {
    expect(entryVariant({ variants: [] } as unknown as ShopProduct)).toBeUndefined();
  });
});

describe("el catálogo servido", () => {
  it("declara price como el mínimo de sus presentaciones", () => {
    for (const product of products) {
      if (product.priceOnRequest) continue;
      expect(product.price, product.slug).toBe(entryVariant(product)?.price);
    }
  });

  it("no repite etiqueta de presentación dentro de un producto", () => {
    for (const product of products) {
      const units = product.variants.map((variant) => variant.unit);
      expect(new Set(units).size, product.slug).toBe(units.length);
    }
  });

  it("findVariant encuentra cada presentación por su etiqueta", () => {
    for (const product of products) {
      for (const variant of product.variants) {
        expect(findVariant(product, variant.unit), `${product.slug} · ${variant.unit}`).toEqual(
          variant,
        );
      }
    }
  });
});
