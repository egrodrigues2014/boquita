import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { products as fallbackCatalog } from "@/content/products";
import { productToRow } from "@/lib/db/rows";
import type { ProductRow } from "@/lib/db/schema";
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

/** Filas que devolverá el doble en cada test. */
let rows: ProductRow[] = [];
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

vi.mock("@/lib/db", () => ({
  getDb: () =>
    dbAvailable
      ? {
          select: () => ({
            from: () => ({
              orderBy: async () => {
                if (queryThrows) throw new Error("connection terminated unexpectedly");
                return rows;
              },
            }),
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

beforeEach(() => {
  rows = [];
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
    expect(catalog).toHaveLength(14);
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
      expect(rowToProduct(row), `${product.slug} no sobrevive el viaje`).toEqual(product);
    }
  });

  it("el catálogo entero desde la base es igual al fallback", async () => {
    rows = fallbackCatalog.map((product, index) => validRow(index));
    expect(await getCatalog()).toEqual(fallbackCatalog);
  });

  it("respeta el orden de sort_order y no el de llegada", async () => {
    rows = [validRow(2), validRow(0), validRow(1)];
    // El doble no ordena —eso lo hace Postgres—, así que aquí sólo se afirma que
    // getCatalog no reordena por su cuenta: el ORDER BY es la única fuente.
    const catalog = await getCatalog();
    expect(catalog.map((product) => product.slug)).toEqual([
      fallbackCatalog[2]?.slug,
      fallbackCatalog[0]?.slug,
      fallbackCatalog[1]?.slug,
    ]);
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
    // Slugs que no están en el fallback Y con el summary desmaquetado: no hay
    // nada que rescatar.
    rows = [
      { ...validRow(0), slug: "fantasma-uno", summary: "x" } as ProductRow,
      { ...validRow(1), slug: "fantasma-dos", summary: "y" } as ProductRow,
    ];
    expect(await getCatalog()).toEqual(fallbackCatalog);
  });
});

describe("una fila mala no tumba el catálogo", () => {
  it("un summary demasiado largo se sustituye por la versión del fallback", async () => {
    // 400 caracteres desmaquetarían la tarjeta: el esquema permite 110. Es
    // exactamente lo que el panel de la fase 3 va a poder guardar sin querer.
    const roto = { ...validRow(0), summary: "a".repeat(400) } as ProductRow;
    rows = [roto, validRow(1)];

    const catalog = await getCatalog();
    expect(catalog).toHaveLength(2);
    expect(catalog[0]).toEqual(fallbackCatalog[0]);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(fallbackCatalog[0]!.slug));
  });

  it("un precio a convenir sin «desde» se rescata: engañaría con el importe", async () => {
    const roto = { ...validRow(0), priceOnRequest: true, priceFrom: false } as ProductRow;
    rows = [roto];
    expect(await getCatalog()).toEqual([fallbackCatalog[0]]);
  });

  it("una fila con image_heights de un solo escalón se rescata", async () => {
    // Un srcSet de un elemento haría que un móvil se descargue la foto grande.
    const roto = { ...validRow(0), imageHeights: [562] } as ProductRow;
    rows = [roto];
    expect(await getCatalog()).toEqual([fallbackCatalog[0]]);
  });

  it("una fila inválida que NO está en el fallback se omite, no se inventa", async () => {
    const fantasma = { ...validRow(0), slug: "producto-fantasma", summary: "x" } as ProductRow;
    rows = [fantasma, validRow(1)];

    const catalog = await getCatalog();
    expect(catalog).toEqual([fallbackCatalog[1]]);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("se omite"));
  });
});

describe("las alturas de imagen van y vuelven", () => {
  it("imageHeightsOf recupera las alturas de los 14 productos", () => {
    for (const product of fallbackCatalog) {
      const heights = imageHeightsOf(product.image);
      expect(heights.length, product.slug).toBeGreaterThanOrEqual(2);
      // El escalón de 800 es el `src` base, así que su altura es `image.height`.
      expect(heights[1], product.slug).toBe(product.image.height);
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
    expect(toImageHeights([400])).toBeUndefined();
    expect(toImageHeights([])).toBeUndefined();
    expect(toImageHeights([400, 800, 1200, 1600])).toBeUndefined();
    expect(toImageHeights([400, 0])).toBeUndefined();
  });
});

describe("filas nuevas que no están en el fallback", () => {
  it("un producto que sólo existe en la base se sirve igual", async () => {
    // El caso de un producto creado desde el panel de la fase 3: la base es la
    // fuente, el fallback sólo cubre lo que falta.
    const nuevo = {
      ...validRow(0),
      slug: "torta-de-limon",
      name: "Torta de limón",
    } as ProductRow;
    rows = [nuevo];

    const catalog = await getCatalog();
    expect(catalog).toHaveLength(1);
    expect(catalog[0]?.slug).toBe("torta-de-limon");
    // La imagen se reconstruye con el slug NUEVO, no con el del producto base.
    expect(catalog[0]?.image.src).toContain("torta-de-limon");
  });
});
