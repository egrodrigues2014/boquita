import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { catalogSchema } from "@/content/shopSchema";
import { findProduct, products } from "@/content/products";
import { home } from "@/content/home";
import { CATEGORIAS, OCASIONES } from "@/types/shop";

describe("el catálogo cumple su esquema", () => {
  it("valida las 14 fichas", () => {
    const result = catalogSchema.safeParse(products);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  · ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`El catálogo no cumple el esquema:\n${issues}`);
    }
    expect(products).toHaveLength(14);
  });

  it("todos los slugs son únicos", () => {
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it("findProduct encuentra por slug y no explota con uno inexistente", () => {
    expect(findProduct("queque-de-zanahoria")?.name).toBe("Queque de zanahoria");
    expect(findProduct("no-existe")).toBeUndefined();
  });
});

describe("coherencia con la portada", () => {
  it("los 8 productos destacados existen en el catálogo", () => {
    // Si un destacado no estuviera en el catálogo, su enlace desde la portada
    // daría un 404.
    for (const featured of home.menu.products) {
      expect(
        products.some((p) => p.slug === featured.slug),
        `el destacado ${featured.slug} no está en el catálogo`,
      ).toBe(true);
    }
  });

  it("los precios de los destacados coinciden con el catálogo", () => {
    // Dos fuentes con el mismo precio distinto es la forma más rápida de perder
    // la confianza de un cliente.
    for (const featured of home.menu.products) {
      const product = findProduct(featured.slug)!;
      expect(product.price, `${featured.slug}: precio distinto en portada y catálogo`).toBe(
        featured.price,
      );
      expect(product.priceFrom ?? false).toBe(featured.priceFrom ?? false);
    }
  });

  it("el dropdown de catálogo lista categorías existentes", () => {
    const [catalogo] = home.nav.dropdowns;
    expect(catalogo.href).toBe("/tienda");
    expect(catalogo.items.map((item) => item.href).sort()).toEqual(
      Object.keys(CATEGORIAS)
        .map((key) => `/tienda?categoria=${key}`)
        .sort(),
    );
  });

  it('la métrica "14 recetas" de la portada coincide con el catálogo', () => {
    const metric = home.service.metrics.find((m) => !m.todo)!;
    expect(Number(metric.value)).toBe(products.length);
  });
});

describe("taxonomía", () => {
  it("cada categoría del nav tiene al menos un producto", () => {
    // Una categoría vacía en el dropdown lleva a una tienda sin resultados.
    for (const key of Object.keys(CATEGORIAS)) {
      expect(
        products.some((p) => p.categoria === key),
        `la categoría "${key}" no tiene productos`,
      ).toBe(true);
    }
  });

  it("cada ocasión del nav tiene al menos un producto", () => {
    for (const key of Object.keys(OCASIONES)) {
      expect(
        products.some((p) => p.ocasiones.includes(key as keyof typeof OCASIONES)),
        `la ocasión "${key}" no tiene productos`,
      ).toBe(true);
    }
  });
});

describe("las imágenes del catálogo existen en public/", () => {
  const PUBLIC = path.join(process.cwd(), "public");

  it.each(products.map((p) => [p.slug, p] as const))("%s", (_slug, product) => {
    const all = [product.image.src, ...(product.image.srcSet ?? []).map((s) => s.src)];
    for (const src of all) {
      expect(existsSync(path.join(PUBLIC, src)), `falta public${src}`).toBe(true);
    }
  });

  it("el srcSet incluye un escalón de 400 para la tarjeta en pantalla 1x", () => {
    // La tarjeta mide 370px de render, así que 400 es el candidato correcto.
    // Un primer intento usó 300 y nunca se elegía: el navegador bajaba el de 600.
    for (const product of products) {
      expect(
        product.image.srcSet?.some((s) => s.width === 400),
        `${product.slug} no tiene el escalón de 400`,
      ).toBe(true);
    }
  });
});

describe("los TODO siguen marcados, no escondidos", () => {
  it("los 14 precios son placeholders", () => {
    // Cuando Ale confirme los precios reales este test falla y hay que quitar
    // los flags: cerrar el TODO debe ser un acto explícito.
    const sinMarcar = products.filter((p) => !p.priceTodo).map((p) => p.slug);
    expect(sinMarcar, "estos precios ya no están marcados como placeholder").toEqual([]);
  });

  it("las 4 fotos flojas están marcadas para rehacer", () => {
    const marcadas = products.filter((p) => p.photoTodo).map((p) => p.slug).sort();
    expect(marcadas).toEqual([
      "asado-negro",
      "barras-de-datil",
      "cachitos-de-jamon",
      "key-lime-pie",
    ]);
  });
});

describe("reglas de negocio", () => {
  it("ningún producto se sirve con menos de 48h, salvo los que necesitan más", () => {
    for (const product of products) {
      expect(product.leadTimeHours).toBeGreaterThanOrEqual(48);
    }
  });

  it("el queque personalizado pide una semana y se cotiza aparte", () => {
    const custom = findProduct("queque-personalizado")!;
    expect(custom.priceOnRequest).toBe(true);
    expect(custom.priceFrom).toBe(true);
    expect(custom.leadTimeHours).toBe(168);
  });

  it("los productos sin gluten no declaran gluten entre sus alérgenos", () => {
    // Una contradicción aquí es un problema de salud, no de maquetación.
    for (const product of products.filter((p) => p.categoria === "sin-gluten-keto")) {
      expect(product.allergens, `${product.slug} dice sin gluten pero lo declara`).not.toContain(
        "gluten",
      );
    }
  });
});
