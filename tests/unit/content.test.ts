/**
 * Blinda el contenido contra los requisitos del layout.
 *
 * El spec §8 exige conservar el NÚMERO de elementos de cada bloque para que el
 * diseño cuadre. Un array corto no lanza ningún error en runtime: simplemente
 * deja un hueco en la rejilla o una tarjeta de menos en el slider. Este test
 * convierte eso en un fallo de build.
 *
 * Además comprueba que cada archivo referenciado en `content/home.ts` existe de
 * verdad en `public/img/` — un `src` mal escrito daría un 404 silencioso que
 * sólo se vería mirando la página.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { home } from "@/content/home";
import { products } from "@/content/products";
import { homeSchema } from "@/content/schema";
import type { ImageRef } from "@/types/content";

describe("content/home.ts cumple el esquema del layout", () => {
  it("valida contra homeSchema", () => {
    const result = homeSchema.safeParse(home);
    if (!result.success) {
      // Mensaje legible en el fallo, en vez de un volcado de Zod.
      const issues = result.error.issues
        .map((i) => `  · ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`El contenido no cumple el esquema:\n${issues}`);
    }
    expect(result.success).toBe(true);
  });
});

describe("cantidades que el spec exige (§8)", () => {
  it("8 productos → rejilla de 2 columnas × 4 filas (§6.4)", () => {
    expect(home.menu.products).toHaveLength(8);
  });

  it("2 métricas → `.stats` es una rejilla de 2 columnas (§6.5)", () => {
    expect(home.service.metrics).toHaveLength(2);
  });

  it("testimonios: 0 mientras están bloqueados, 6 cuando sean reales (§6.7)", () => {
    expect([0, 6]).toContain(home.testimonials.items.length);
  });

  it("4 + 4 fotos de galería, todas únicas (§6.6)", () => {
    const [row1, row2] = home.gallery.rows;
    expect(row1).toHaveLength(4);
    expect(row2).toHaveLength(4);
    const srcs = [...row1, ...row2].map((i) => i.src);
    expect(new Set(srcs).size).toBe(8);
  });

  it("exactamente 2 recortes inline en el flujo del h2 (§6.2)", () => {
    expect(home.statement.inline).toHaveLength(2);
  });

  it("exactamente 2 botones en el hero (§8)", () => {
    expect(home.hero.ctas).toHaveLength(2);
  });

  it("3 dropdowns + 1 enlace simple en el navbar (§5)", () => {
    expect(home.nav.dropdowns).toHaveLength(3);
    expect(home.nav.link.href).toBeTruthy();
  });

  it("Catálogo es enlace real a la tienda y no hay duplicado de Todo el catálogo", () => {
    const [catalogo] = home.nav.dropdowns;
    expect(catalogo.label).toBe("Catálogo");
    expect(catalogo.href).toBe("/tienda");
    expect(JSON.stringify(home.nav)).not.toContain("Todo el catálogo");
  });

  it("redes reales, 5 enlaces y 2 teléfonos en el pie (§6.8)", () => {
    expect(home.footer.social.length).toBeGreaterThanOrEqual(2);
    expect(home.footer.social.length).toBeLessThanOrEqual(4);
    expect(home.footer.links).toHaveLength(5);
    expect(home.footer.phones).toHaveLength(2);
  });
});

describe("las imágenes referenciadas existen en public/", () => {
  const PUBLIC = path.join(process.cwd(), "public");

  function collect(value: unknown, found: ImageRef[] = []): ImageRef[] {
    if (!value || typeof value !== "object") return found;
    if (Array.isArray(value)) {
      for (const item of value) collect(item, found);
      return found;
    }
    const record = value as Record<string, unknown>;
    if (typeof record.src === "string" && typeof record.width === "number") {
      found.push(record as unknown as ImageRef);
      return found;
    }
    for (const nested of Object.values(record)) collect(nested, found);
    return found;
  }

  const images = collect(home);

  it("encuentra las 15 imágenes del layout", () => {
    // hero, wide, service, media, cta, 2 inline, 8 de galería
    expect(images).toHaveLength(15);
  });

  it.each(images.map((img) => [img.src, img] as const))("existe %s", (_src, img) => {
    const all = [img.src, ...(img.srcSet ?? []).map((s) => s.src), ...(img.avif ?? []).map((s) => s.src)];
    for (const src of all) {
      expect(existsSync(path.join(PUBLIC, src)), `falta public${src}`).toBe(true);
    }
  });
});

describe("los TODO están marcados, no escondidos", () => {
  it("los 8 precios siguen marcados como placeholder", () => {
    // Cuando Ale confirme los precios reales, este test falla y hay que quitar
    // los flags. Es intencionado: obliga a cerrar el TODO explícitamente.
    expect(home.menu.products.every((p) => p.priceTodo)).toBe(true);
  });

  it("no publica testimonios inventados", () => {
    expect(home.testimonials.items).toHaveLength(0);
  });

  it("las redes públicas no usan placeholders", () => {
    expect(home.footer.social.every((s) => !s.todo)).toBe(true);
    expect(JSON.stringify(home.footer.social)).not.toMatch(/ticaboquita|facebook/i);
  });

  it("la métrica sin verificar está marcada y la verificable no", () => {
    const [inventada, verificable] = home.service.metrics;
    expect(inventada.todo).toBe(true);
    expect(verificable.todo).toBeUndefined();
    // "14 recetas" es comprobable contra el catálogo fuente.
    expect(products).toHaveLength(Number(verificable.value));
  });
});

describe("enlaces", () => {
  it("ningún enlace queda vacío o apuntando a undefined", () => {
    const hrefs = [
      home.nav.cta.href,
      home.nav.link.href,
      ...home.nav.dropdowns.flatMap((d) => d.items.map((i) => i.href)),
      ...home.hero.ctas.map((c) => c.href),
      ...home.footer.links.map((l) => l.href),
      ...home.footer.social.map((s) => s.href),
      ...home.footer.phones.map((p) => p.href),
      home.footer.cta.button.href,
    ];
    for (const href of hrefs) {
      expect(href).toBeTruthy();
      expect(href).not.toContain("undefined");
    }
  });

  it("el número de WhatsApp es el correcto en todos los enlaces wa.me", () => {
    const json = JSON.stringify(home);
    const waLinks = json.match(/wa\.me\/\d+/g) ?? [];
    expect(waLinks.length).toBeGreaterThan(0);
    expect(new Set(waLinks)).toEqual(new Set(["wa.me/50671322355"]));
  });

  it("las anclas de la portada apuntan a secciones que existen", () => {
    const anchors = new Set(
      JSON.stringify(home)
        .match(/"#[a-z-]+"/g)
        ?.map((a) => a.replaceAll('"', "")) ?? [],
    );
    // Los `id` que renderiza app/page.tsx.
    const rendered = new Set(["#catalogo", "#galeria", "#sobre", "#video", "#contenido"]);
    for (const anchor of anchors) {
      expect(rendered.has(anchor), `ancla sin destino: ${anchor}`).toBe(true);
    }
  });

  it("el nav y el pie no usan anclas puras: se renderizan en TODAS las páginas", () => {
    // Un `#galeria` a secas sólo funciona en la portada; desde /tienda no hace
    // nada. Tienen que ser rutas absolutas con ancla (`/#galeria`).
    const shared = [
      home.nav.link.href,
      home.nav.cta.href,
      ...home.nav.dropdowns.flatMap((d) => d.items.map((i) => i.href)),
      ...home.footer.links.map((l) => l.href),
      home.footer.legal.href,
      home.footer.cta.button.href,
    ];

    for (const href of shared) {
      expect(href.startsWith("#"), `ancla pura en un enlace compartido: ${href}`).toBe(false);
    }
  });

  it("ningún enlace compartido apunta a «#»", () => {
    // Un href="#" es un enlace muerto que además salta al principio de la página.
    const all = [
      home.footer.legal.href,
      ...home.footer.links.map((l) => l.href),
      ...home.nav.dropdowns.flatMap((d) => d.items.map((i) => i.href)),
    ];
    for (const href of all) {
      expect(href).not.toBe("#");
    }
  });
});
