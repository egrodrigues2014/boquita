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

  it("6 testimonios → el slider muestra 3 y recorta el resto (§6.7)", () => {
    // El esquema admite 0 (bloque apagado) o 6. Aquí está encendido.
    expect(home.testimonials.items).toHaveLength(6);
  });

  it("6 filas de 4 fotos de galería, todas únicas (§6.6)", () => {
    expect(home.gallery.rows).toHaveLength(6);
    for (const row of home.gallery.rows) {
      expect(row).toHaveLength(4);
    }
    expect(home.gallery.title).toBe("GALERÍA");

    const items = home.gallery.rows.flat();
    const srcs = items.map((i) => i.image.src);
    expect(srcs).toHaveLength(24);
    expect(new Set(srcs).size).toBe(24);

    const catalogSlugs = new Set(products.map((product) => product.slug));
    const hrefs = items.map((item) => item.href);
    for (const href of hrefs) {
      const slug = href.replace("/tienda/", "");
      expect(catalogSlugs.has(slug), `${href} no apunta a una ficha del catálogo`).toBe(true);
    }

    expect(hrefs.filter((href) => href === "/tienda/queque-personalizado")).toHaveLength(2);
  });

  it("statement usa el copy de Ale sin conservar la frase editorial anterior", () => {
    expect(home.statement).toEqual({});
    expect(home.mediaText.titleTop).toBe("Del horno de Ale");
    expect(home.mediaText.titleBottom).toBe("a tu mesa");
    expect(home.mediaText.body).toContain("Ale Budowski hornea en su casa de Santa Ana desde 2022");
    expect(JSON.stringify(home)).not.toContain("cada receta nace con ingredientes honestos");
    expect(JSON.stringify(home.statement)).not.toContain("inline");
  });

  it("exactamente 2 botones en el hero (§8)", () => {
    expect(home.hero.ctas).toHaveLength(2);
    expect(home.hero.ctas[0].href).toBe("/tienda");
  });

  it("3 dropdowns + 1 enlace simple en el navbar (§5)", () => {
    expect(home.nav.dropdowns).toHaveLength(3);
    expect(home.nav.link.href).toBeTruthy();
  });

  it("Catálogo es enlace real a la tienda y no se duplica como ítem del menú", () => {
    const [catalogo] = home.nav.dropdowns;
    expect(catalogo.label).toBe("Catálogo");
    expect(catalogo.href).toBe("/tienda");
    // El nav tuvo una vez un ítem que repetía el destino de la etiqueta. Se
    // vigilan los dos nombres que ha tenido esa página, el viejo y el de ahora.
    const nav = JSON.stringify(home.nav);
    expect(nav).not.toContain("Todo el catálogo");
    expect(nav).not.toContain("Catálogo de productos");
  });

  it("3 contactos reales y 4 enlaces en el pie (§6.8)", () => {
    expect(home.footer.contacts).toHaveLength(3);
    expect(home.footer.links).toHaveLength(4);
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

  it("encuentra las 13 imágenes del layout", () => {
    // hero, wide, service, media, cta, 24 de galería
    expect(images).toHaveLength(29);
  });

  it.each(images.map((img) => [img.src, img] as const))("existe %s", (_src, img) => {
    const all = [img.src, ...(img.srcSet ?? []).map((s) => s.src), ...(img.avif ?? []).map((s) => s.src)];
    for (const src of all) {
      expect(existsSync(path.join(PUBLIC, src)), `falta public${src}`).toBe(true);
    }
  });
});

describe("los TODO están marcados, no escondidos", () => {
  it("ningún precio de la rejilla queda marcado como placeholder", () => {
    /**
     * Este test decía lo contrario: exigía que los 8 precios inventados siguieran
     * marcados para que quitar la marca fuese explícito. Ya se hizo —los precios
     * salen del catálogo real de Ale— así que ahora vigila que no vuelva a
     * aparecer un `priceTodo` sin que nadie lo note.
     */
    expect(home.menu.products.filter((p) => p.priceTodo).map((p) => p.slug)).toEqual([]);
  });

  it("las reseñas de andamio van marcadas, todas o ninguna", () => {
    // Una mezcla de reales y de andamio es el estado que nadie sabría leer: ni
    // se puede lanzar ni se puede decir que falta contenido.
    const marcadas = home.testimonials.items.filter((t) => t.todo).length;
    expect([0, home.testimonials.items.length]).toContain(marcadas);
  });

  it("hoy las 6 reseñas siguen siendo de andamio", () => {
    /**
     * Este test sustituye al que exigía `items.length === 0`. La sección ya se
     * publica —el layout es definitivo— pero el copy no es real: Ale todavía no
     * entregó los textos (`CONTENT_TODO §3`).
     *
     * Cuando lleguen, se sustituyen las citas y se quitan las 6 marcas de
     * golpe, y este test rompe. Ese es el propósito: el guardarraíl no
     * desaparece al encender la sección, cambia de lado. Publicar el andamio
     * como si fuera real sigue exigiendo un acto deliberado.
     */
    expect(home.testimonials.items.filter((t) => t.todo)).toHaveLength(6);
  });

  it("las redes públicas no usan placeholders", () => {
    expect(home.footer.contacts.every((contact) => !contact.todo)).toBe(true);
    expect(home.footer.contacts.map((contact) => contact.icon)).toEqual([
      "whatsapp",
      "instagram",
      "mail",
    ]);
    expect(home.footer.contacts.map((contact) => contact.display)).toEqual([
      "+506 7132 2355",
      "@boquitacostarica",
      "ticaboquita@gmail.com",
    ]);
  });

  it("la métrica sin verificar está marcada y la verificable no", () => {
    const [pedidos, verificable] = home.service.metrics;
    expect(pedidos.value).toBe("+500");
    // 2022, no 2019: es la fecha del primer pedido vendido, la que cuenta Ale en
    // «Sobre nosotros». Las dos páginas tienen que decir lo mismo.
    expect(pedidos.label).toBe("Pedidos horneados desde 2022");
    expect(pedidos.todo).toBeUndefined();
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
      ...home.gallery.rows.flat().map((item) => item.href),
      ...home.footer.links.map((l) => l.href),
      ...home.footer.contacts.map((contact) => contact.href),
      home.footer.cta.button.href,
    ];
    for (const href of hrefs) {
      expect(href).toBeTruthy();
      expect(href).not.toContain("undefined");
    }
  });

  it("el número de WhatsApp es el correcto en todos los enlaces de chat", () => {
    // Los enlaces van a `api.whatsapp.com/send` y no a `wa.me`: la redirección
    // del atajo se come los emoji del mensaje. Ver `lib/contact.ts`.
    const json = JSON.stringify(home);
    const waLinks = json.match(/api\.whatsapp\.com\/send\?phone=\d+/g) ?? [];
    expect(waLinks.length).toBeGreaterThan(0);
    expect(new Set(waLinks)).toEqual(
      new Set(["api.whatsapp.com/send?phone=50671322355"]),
    );
    expect(json).not.toContain("wa.me");
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
