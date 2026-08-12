import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { products as fallbackCatalog } from "@/content/products";
import { productToRow, productToVariantRows } from "@/lib/db/rows";
import type { ProductRow, ProductVariantRow } from "@/lib/db/schema";
import { imageHeightsOf, toImageHeights } from "@/lib/productImage";

/**
 * El contrato del fallback de `lib/db/catalog.ts`.
 *
 * Estos tests son la razón de que el fallback exista, y no una formalidad: el
 * modo SIN base de datos es el que corre en CI, en un clon recién hecho y en
 * `npm run dev` antes de que exista `.env.local`. Si se rompiera, el síntoma
 * sería una tienda vacía en producción el día que Neon tenga un mal rato.
 *
 * `getDb` se sustituye por un doble en vez de hablar con Postgres de verdad: un
 * test que necesita credenciales no se ejecuta en CI, y entonces no protege nada.
 */

/** Filas de `products` que devolverá el doble en cada test. */
let rows: ProductRow[] = [];
/** Filas de `product_variants`. Sin ellas un producto no es comprable y se descarta. */
let variantRows: ProductVariantRow[] = [];
/** Si es true, la consulta lanza: simula el cómputo caído o la credencial rotada. */
let queryThrows = false;
/** Si es false, `getDb()` devuelve null: simula la ausencia de DATABASE_URL. */
let dbAvailable = true;

/**
 * `unstable_cache` necesita el store de Next y fuera de una petición lanza. Aquí
 * se hace pasar por transparente: lo que estos tests miden es el fallback, no la
 * caché, y cada caso necesita una lectura fresca.
 */
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}));

/**
 * El doble distingue las dos consultas por su FORMA, no por la tabla: la de
 * productos termina en `.orderBy(...)` y la de presentaciones se espera tal cual.
 * Comparar la tabla exigiría importarla dentro de la factoría —que se hoistea— y
 * escarbar en los internos de Drizzle.
 */
vi.mock("@/lib/db", () => ({
  getDb: () =>
    dbAvailable
      ? {
          select: () => ({
            from: () => {
              const variantes = Promise.resolve(variantRows) as Promise<ProductVariantRow[]> & {
                orderBy: () => Promise<ProductRow[]>;
              };
              variantes.orderBy = async () => {
                if (queryThrows) throw new Error("connection terminated unexpectedly");
                return rows;
              };
              return variantes;
            },
          }),
        }
      : null,
}));

const { getCatalog, getProduct, rowToProduct } = await import("@/lib/db/catalog");

/** Una fila completa y válida, construida con el MISMO mapeo que usa la semilla. */
function validRow(index = 0): ProductRow {
  const product = fallbackCatalog[index];
  if (!product) throw new Error(`el fallback no tiene un producto en la posición ${index}`);
  return {
    ...productToRow(product, index),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  } as ProductRow;
}

/** Las presentaciones de ese mismo producto, como las devolvería la tabla. */
function variantsOf(index = 0): ProductVariantRow[] {
  const product = fallbackCatalog[index];
  if (!product) throw new Error(`el fallback no tiene un producto en la posición ${index}`);
  return productToVariantRows(product) as ProductVariantRow[];
}

/** Siembra el doble con estos productos del fallback, con sus presentaciones. */
function seed(...indices: number[]) {
  rows = indices.map((index) => validRow(index));
  variantRows = indices.flatMap((index) => variantsOf(index));
}

beforeEach(() => {
  rows = [];
  variantRows = [];
  queryThrows = false;
  dbAvailable = true;
  // El fallback avisa por consola cuando actúa. Es deliberado, pero no hace
  // falta verlo 12 veces en la salida de los tests.
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sin base de datos", () => {
  it("sirve el catálogo de content/products.ts tal cual", async () => {
    dbAvailable = false;
    const catalog = await getCatalog();
    expect(catalog).toEqual(fallbackCatalog);
    expect(catalog).toHaveLength(23);
  });

  it("getProduct sigue funcionando y no explota con un slug inexistente", async () => {
    dbAvailable = false;
    expect((await getProduct("queque-de-zanahoria"))?.name).toBe("Queque de zanahoria");
    expect(await getProduct("no-existe")).toBeUndefined();
  });
});

describe("sembrar y leer no pierde nada", () => {
  it("una fila válida vuelve a ser EXACTAMENTE el producto del que salió", () => {
    // Es la propiedad que hace que el fallback y la tabla sean intercambiables.
    // Si esto falla, la tienda se ve distinta según de dónde venga el catálogo.
    for (const [index, product] of fallbackCatalog.entries()) {
      const row = { ...productToRow(product, index) } as ProductRow;
      expect(rowToProduct(row, variantsOf(index)), `${product.slug} no sobrevive el viaje`).toEqual(
        product,
      );
    }
  });

  it("las 60 presentaciones vuelven con su etiqueta y su precio", () => {
    for (const [index, product] of fallbackCatalog.entries()) {
      const row = { ...productToRow(product, index) } as ProductRow;
      expect(rowToProduct(row, variantsOf(index))?.variants).toEqual(product.variants);
    }
  });

  it("el catálogo entero desde la base es igual al fallback", async () => {
    seed(...fallbackCatalog.map((_, index) => index));
    expect(await getCatalog()).toEqual(fallbackCatalog);
  });

  it("respeta el orden de sort_order y no el de llegada", async () => {
    seed(2, 0, 1);
    // El doble no ordena —eso lo hace Postgres—, así que aquí sólo se afirma que
    // getCatalog no reordena por su cuenta: el ORDER BY es la única fuente.
    const catalog = await getCatalog();
    expect(catalog.map((product) => product.slug)).toEqual([
      fallbackCatalog[2]?.slug,
      fallbackCatalog[0]?.slug,
      fallbackCatalog[1]?.slug,
    ]);
  });

  it("las presentaciones se ordenan por sort_order aunque lleguen revueltas", () => {
    const row = validRow(0);
    const revueltas = [...variantsOf(0)].reverse();
    expect(rowToProduct(row, revueltas)?.variants).toEqual(fallbackCatalog[0]?.variants);
  });
});

describe("la tienda nunca se sirve vacía", () => {
  it("tabla vacía → catálogo completo del fallback", async () => {
    rows = [];
    expect(await getCatalog()).toEqual(fallbackCatalog);
  });

  it("la consulta falla → catálogo completo del fallback", async () => {
    queryThrows = true;
    expect(await getCatalog()).toEqual(fallbackCatalog);
    expect(console.error).toHaveBeenCalled();
  });

  it("ninguna fila utilizable → catálogo completo del fallback", async () => {
    // Slugs que no están en el fallback Y sin presentaciones: no hay nada que
    // rescatar.
    rows = [
      { ...validRow(0), slug: "fantasma-uno" } as ProductRow,
      { ...validRow(1), slug: "fantasma-dos" } as ProductRow,
    ];
    variantRows = [];
    expect(await getCatalog()).toEqual(fallbackCatalog);
  });
});

describe("una fila mala no tumba el catálogo", () => {
  it("una descripción desmaquetada se sustituye por la versión del fallback", async () => {
    // 400 caracteres desmaquetarían la tarjeta: el esquema permite 300. Es
    // exactamente lo que el panel de administración va a poder guardar sin querer.
    seed(0, 1);
    rows[0] = { ...validRow(0), description: ["a".repeat(400)] } as ProductRow;

    const catalog = await getCatalog();
    expect(catalog).toHaveLength(2);
    expect(catalog[0]).toEqual(fallbackCatalog[0]);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(fallbackCatalog[0]!.slug));
  });

  it("un precio a convenir sin «desde» se rescata: engañaría con el importe", async () => {
    seed(0);
    rows[0] = { ...validRow(0), priceOnRequest: true, priceFrom: false } as ProductRow;
    expect(await getCatalog()).toEqual([fallbackCatalog[0]]);
  });

  /**
   * El caso que de verdad importa del precio: si `price` deja de ser el de la
   * presentación más barata, la tarjeta del catálogo anuncia un importe que el
   * selector de la ficha no ofrece. No se ve hasta que alguien reclama, así que lo
   * ataja el borde de lectura.
   */
  it("un precio que no es el de la variante más barata se rescata", async () => {
    seed(0);
    rows[0] = { ...validRow(0), price: 999 } as ProductRow;
    expect(await getCatalog()).toEqual([fallbackCatalog[0]]);
  });

  it("varias presentaciones sin «desde» se rescatan", async () => {
    seed(0);
    rows[0] = { ...validRow(0), priceFrom: false } as ProductRow;
    expect(await getCatalog()).toEqual([fallbackCatalog[0]]);
  });

  it("un producto sin presentaciones se rescata: no habría nada que añadir", async () => {
    rows = [validRow(0)];
    variantRows = [];
    expect(await getCatalog()).toEqual([fallbackCatalog[0]]);
  });

  it("dos presentaciones con la misma etiqueta se rescatan", async () => {
    // Serían una sola línea en el carrito, con el precio de la que se añadió antes.
    seed(0);
    const [primera] = variantsOf(0);
    if (!primera) throw new Error("el primer producto del fallback no tiene presentaciones");
    variantRows = [primera, { ...primera, price: primera.price + 1000, sortOrder: 1 }];
    expect(await getCatalog()).toEqual([fallbackCatalog[0]]);
  });

  it("una fila con image_heights vacío se rescata", async () => {
    seed(0);
    rows[0] = { ...validRow(0), imageHeights: [] } as ProductRow;
    expect(await getCatalog()).toEqual([fallbackCatalog[0]]);
  });

  it("una fila inválida que NO está en el fallback se omite, no se inventa", async () => {
    seed(0, 1);
    rows[0] = { ...validRow(0), slug: "producto-fantasma" } as ProductRow;
    // Sin presentaciones para ese slug: la fila es inservible.

    const catalog = await getCatalog();
    expect(catalog).toEqual([fallbackCatalog[1]]);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("se omite"));
  });
});

describe("las alturas de imagen van y vuelven", () => {
  it("imageHeightsOf recupera las alturas de los 23 productos", () => {
    for (const product of fallbackCatalog) {
      const heights = imageHeightsOf(product.image);
      expect(heights.length, product.slug).toBeGreaterThanOrEqual(1);
      /**
       * El `src` base es el escalón de 800 cuando existe, y el de 400 en las dos
       * fotos que son miniaturas. En los dos casos su altura es `image.height`, que
       * es lo que fija el `height` del `<img>` y evita CLS.
       */
      expect(heights[1] ?? heights[0], product.slug).toBe(product.image.height);
    }
  });

  it("lanza si una ruta no sigue el patrón, en vez de sembrar alturas inventadas", () => {
    // Alturas mal sembradas descuadran el `height` del <img> respecto a la foto,
    // y eso es CLS: el presupuesto del proyecto es 0.05 y mide 0.0004.
    expect(() =>
      imageHeightsOf({
        src: "/img/producto/x.webp",
        srcSet: [{ src: "/img/producto/sin-medidas.webp", width: 400 }],
        width: 400,
        height: 300,
        alt: "x",
      }),
    ).toThrow(/ruta de derivado inesperada/);
  });

  it("toImageHeights rechaza lo que productImage no sabría usar", () => {
    expect(toImageHeights([400, 800])).toEqual([400, 800]);
    expect(toImageHeights([400, 800, 1200])).toEqual([400, 800, 1200]);
    // Un solo escalón es válido: las dos fotos en miniatura del catálogo de Ale no
    // dan más y el pipeline no hace upscale.
    expect(toImageHeights([400])).toEqual([400]);
    expect(toImageHeights([])).toBeUndefined();
    expect(toImageHeights([400, 800, 1200, 1600])).toBeUndefined();
    expect(toImageHeights([400, 0])).toBeUndefined();
  });
});

describe("filas nuevas que no están en el fallback", () => {
  it("un producto que sólo existe en la base se sirve igual", async () => {
    // El caso de un producto creado desde el panel de administración: la base es
    // la fuente, el fallback sólo cubre lo que falta.
    rows = [{ ...validRow(0), slug: "torta-de-limon", name: "Torta de limón" } as ProductRow];
    variantRows = variantsOf(0).map((variant) => ({ ...variant, slug: "torta-de-limon" }));

    const catalog = await getCatalog();
    expect(catalog).toHaveLength(1);
    expect(catalog[0]?.slug).toBe("torta-de-limon");
    // La imagen se reconstruye con el slug NUEVO, no con el del producto base.
    expect(catalog[0]?.image.src).toContain("torta-de-limon");
  });
});
