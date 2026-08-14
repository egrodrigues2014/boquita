import { beforeEach, describe, expect, it, vi } from "vitest";
import { FEATURED_SLUGS, home } from "@/content/home";
import { products as fallbackCatalog } from "@/content/products";
import { buildHomeContent } from "@/lib/homeContent";
import { homeSchema } from "@/content/schema";

/**
 * `lib/homeContent.ts` proyecta el catálogo servido sobre el copy de la portada.
 *
 * Lo que se protege aquí es la propiedad que el proyecto ya perdió una vez: los
 * nombres y precios de la portada estuvieron duplicados y derivaron, y un slug
 * viejo dejó un enlace apuntando a una ficha inexistente. Con el catálogo en
 * Postgres hay dos fuentes otra vez, y estos tests son lo que impide que se
 * separen.
 */

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("con el catálogo completo, la portada no cambia", () => {
  const content = buildHomeContent(fallbackCatalog);

  it("sigue cumpliendo el esquema del layout", () => {
    // Las cantidades del spec: 8 productos, 2 métricas, 6 testimonios, 4+4 fotos.
    const result = homeSchema.safeParse(content);
    if (!result.success) {
      throw new Error(
        `la portada derivada no cumple el esquema:\n` +
          result.error.issues.map((i) => `  · ${i.path.join(".")}: ${i.message}`).join("\n"),
      );
    }
  });

  it("produce la misma rejilla de 8 que el objeto estático", () => {
    expect(content.menu.products).toEqual(home.menu.products);
  });

  it("no toca el copy que no depende del catálogo", () => {
    expect(content.nav).toEqual(home.nav);
    expect(content.hero).toEqual(home.hero);
    expect(content.testimonials).toEqual(home.testimonials);
    expect(content.footer).toEqual(home.footer);
    expect(content.gallery).toEqual(home.gallery);
  });
});

describe("los números de la portada son el catálogo, no texto escrito a mano", () => {
  it("la métrica de recetas cuenta los productos servidos", () => {
    const recortado = fallbackCatalog.slice(0, 9);
    const content = buildHomeContent(recortado);

    const metric = content.service.metrics.find((m) => m.label === "Recetas en el catálogo");
    expect(Number(metric?.value)).toBe(9);
  });

  it("el enlace «ver los N productos» cuenta los productos servidos", () => {
    const content = buildHomeContent(fallbackCatalog.slice(0, 9));
    expect(content.menu.more?.label).toBe("Ver los 9 productos");
  });

  it("con el catálogo completo coincide con el objeto estático", () => {
    // Sin cifra escrita a mano: la propiedad que importa es que derivar del
    // catálogo completo produzca EXACTAMENTE lo que dice `content/home.ts`, que es
    // lo que se sirve sin `DATABASE_URL`.
    const content = buildHomeContent(fallbackCatalog);
    expect(Number(content.service.metrics.find((m) => m.label === "Recetas en el catálogo")?.value)).toBe(
      fallbackCatalog.length,
    );
    expect(content.service.metrics).toEqual(home.service.metrics);
    expect(content.menu.more?.label).toBe(home.menu.more?.label);
  });
});

describe("ninguna tarjeta de la portada lleva a un 404", () => {
  it("todos los destacados están en el catálogo servido", () => {
    const content = buildHomeContent(fallbackCatalog);
    for (const featured of content.menu.products) {
      expect(
        fallbackCatalog.some((p) => p.slug === featured.slug),
        `${featured.slug} no está en el catálogo servido`,
      ).toBe(true);
    }
  });

  it("si falta un destacado, se rellena con otro producto SERVIDO", () => {
    // Se quita un destacado del catálogo: la rejilla debe seguir teniendo 8, y
    // ninguno de los 8 puede ser el que falta.
    const ausente = FEATURED_SLUGS[0];
    const recortado = fallbackCatalog.filter((p) => p.slug !== ausente);

    const content = buildHomeContent(recortado);
    expect(content.menu.products).toHaveLength(8);
    expect(content.menu.products.map((p) => p.slug)).not.toContain(ausente);

    for (const featured of content.menu.products) {
      expect(
        recortado.some((p) => p.slug === featured.slug),
        `${featured.slug} no está en el catálogo servido: su enlace daría 404`,
      ).toBe(true);
    }
  });

  it("con menos de 8 productos la rejilla se queda corta en vez de inventar enlaces", () => {
    // Se prefiere una rejilla incompleta a una tarjeta que lleva a un 404: lo
    // primero es un defecto de maquetación, lo segundo le cuesta un pedido a Ale.
    const content = buildHomeContent(fallbackCatalog.slice(0, 5));
    expect(content.menu.products).toHaveLength(5);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("se queda en 5"));
  });

});

describe("ninguna foto de la galería lleva a un 404", () => {
  it("todas las fotos del catálogo servido se publican en la galería", () => {
    const content = buildHomeContent(fallbackCatalog);
    const hrefs = content.gallery.rows.flat().map((item) => item.href);
    const expected = fallbackCatalog.flatMap((product) =>
      product.imageB
        ? [`/tienda/${product.slug}`, `/tienda/${product.slug}`]
        : [`/tienda/${product.slug}`],
    );

    expect(hrefs).toEqual(expected);
  });

  it("si falta un producto, la galería sólo usa fotos del catálogo SERVIDO", () => {
    const ausente = fallbackCatalog[0]!.slug;
    const recortado = fallbackCatalog.filter((product) => product.slug !== ausente);

    const content = buildHomeContent(recortado);
    const hrefs = content.gallery.rows.flat().map((item) => item.href);
    expect(hrefs).toHaveLength(23);
    expect(hrefs).not.toContain(`/tienda/${ausente}`);

    for (const href of hrefs) {
      const slug = href.replace("/tienda/", "");
      expect(
        recortado.some((product) => product.slug === slug),
        `${href} no está en el catálogo servido: su enlace daría 404`,
      ).toBe(true);
    }
  });
});

describe("coherencia de precios entre portada y catálogo", () => {
  it("el precio de cada destacado es el del producto servido, no una copia vieja", () => {
    // Se cambia un precio en el catálogo «servido» y se comprueba que la portada
    // lo refleja: es lo que va a pasar cuando Ale corrija un precio en Neon.
    const conPrecioNuevo = fallbackCatalog.map((product) =>
      product.slug === FEATURED_SLUGS[0] ? { ...product, price: 99000 } : product,
    );

    const content = buildHomeContent(conPrecioNuevo);
    const destacado = content.menu.products.find((p) => p.slug === FEATURED_SLUGS[0]);
    expect(destacado?.price).toBe(99000);
  });
});
