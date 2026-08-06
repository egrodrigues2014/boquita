import { expect, test } from "@playwright/test";

/**
 * SEO local y presupuestos de rendimiento.
 *
 * Los presupuestos se miden con las APIs de rendimiento del navegador en vez de
 * añadir Lighthouse como dependencia: los números que interesan (LCP, CLS, peso
 * transferido) salen igual y el test corre en segundos.
 */

test.describe("SEO local", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("declara el negocio como panadería con teléfono y zona de servicio", async ({ page }) => {
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")));

    const bakery = blocks.find((b) => b["@type"] === "Bakery");
    expect(bakery, "falta el nodo Bakery").toBeTruthy();
    expect(bakery.telephone).toBe("+50671322355");
    expect(bakery.address.streetAddress).toContain("Calle Obelisco");
    expect(bakery.address.addressLocality).toContain("Santa Ana");
    expect(bakery.address.addressCountry).toBe("CR");
    expect(bakery.areaServed.map((a: { name: string }) => a.name)).toContain("Santa Ana");
    expect(bakery.currenciesAccepted).toBe("CRC");
  });

  test("el menú del JSON-LD lleva los 8 productos con precio en colones", async ({ page }) => {
    const bakery = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .evaluate((el) => JSON.parse(el.textContent ?? "{}"));

    const items = bakery.hasMenu.hasMenuSection.hasMenuItem;
    expect(items).toHaveLength(8);
    for (const item of items) {
      expect(item.offers.priceCurrency).toBe("CRC");
      expect(item.offers.price).toBeGreaterThan(0);
      // Horneado por encargo: no es stock disponible, es pre-pedido.
      expect(item.offers.availability).toContain("PreOrder");
    }
  });

  test("no declara horario de tienda, porque no lo hay", async ({ page }) => {
    // Se hornea por encargo con 48h de anticipación. Declarar un horario sería
    // falso y Google lo mostraría como si se pudiera pasar a comprar.
    const bakery = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .evaluate((el) => JSON.parse(el.textContent ?? "{}"));
    expect(bakery.openingHoursSpecification).toBeUndefined();
  });

  test("tiene los metadatos que WhatsApp necesita para la tarjeta del enlace", async ({ page }) => {
    // WhatsApp no ejecuta JavaScript: esto tiene que venir en el HTML servido.
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Boquita/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "es_CR");
    await expect(page.locator("html")).toHaveAttribute("lang", "es-CR");
  });

  test("sirve robots.txt y sitemap.xml", async ({ request }) => {
    expect((await request.get("/robots.txt")).status()).toBe(200);
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("<urlset");
  });

  test("la tarjeta de Open Graph se genera de verdad", async ({ request }) => {
    const response = await request.get("/opengraph-image");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
});

test.describe("presupuestos de rendimiento", () => {
  test("LCP < 2.5s y CLS < 0.05", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    const metrics = await page.evaluate(
      () =>
        new Promise<{ lcp: number; cls: number }>((resolve) => {
          let lcp = 0;
          let cls = 0;

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) lcp = entry.startTime;
          }).observe({ type: "largest-contentful-paint", buffered: true });

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
              if (!shift.hadRecentInput) cls += shift.value;
            }
          }).observe({ type: "layout-shift", buffered: true });

          // Margen para que se resuelva el swap de fuentes, que es el sospechoso
          // habitual de los saltos de layout.
          setTimeout(() => resolve({ lcp, cls }), 1500);
        }),
    );

    expect(metrics.lcp, `LCP ${Math.round(metrics.lcp)}ms`).toBeLessThan(2500);
    expect(metrics.cls, `CLS ${metrics.cls.toFixed(4)}`).toBeLessThan(0.05);
  });

  test("la primera carga pesa menos de 1.2 MB", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready.then(() => true));

    // Se usa `transferSize` del Resource Timing y NO la cabecera content-length:
    // las respuestas chunked (el HTML, los chunks de JS y el CSS) no la traen, y
    // sumarlas daba ~0 para el script — un presupuesto que no cuenta el
    // JavaScript es un falso consuelo.
    const bytes = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      const res = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const total = [...nav, ...res].reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
      const byType = res.reduce<Record<string, number>>((acc, entry) => {
        const kind = entry.initiatorType || "otro";
        acc[kind] = (acc[kind] ?? 0) + (entry.transferSize || 0);
        return acc;
      }, {});
      return { total, byType };
    });

    const kb = Math.round(bytes.total / 1024);
    // Ojo al leer el desglose: `initiatorType` dice QUIÉN pidió el recurso, no
    // qué es. Los woff2 aparecen como "css" porque los solicita el @font-face, y
    // la propia hoja de estilos aparece como "link". No es una medida de tipos
    // de archivo.
    const breakdown = Object.entries(bytes.byType)
      .sort((a, b) => b[1] - a[1])
      .map(([kind, size]) => `pedido-por-${kind} ${Math.round(size / 1024)}KB`)
      .join(", ");

    expect(kb, `${kb} KB en la primera vista (${breakdown})`).toBeLessThan(1200);
  });

  test("el elemento LCP es la foto del hero, y va precargada", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    const lcpElement = await page.evaluate(
      () =>
        new Promise<string>((resolve) => {
          new PerformanceObserver((list) => {
            const last = list.getEntries().at(-1) as (PerformanceEntry & { element?: Element }) | undefined;
            resolve(last?.element?.className ?? "");
          }).observe({ type: "largest-contentful-paint", buffered: true });
          setTimeout(() => resolve(""), 1200);
        }),
    );
    expect(lcpElement).toContain("hero-img");

    // El preload del hero debe declarar el MISMO `sizes` que el <img>, o el
    // navegador elegiría un candidato distinto y descargaría dos archivos.
    //
    // No se afirma que haya un solo preload de imagen: React 19 emite los suyos
    // para las imágenes eager (el logo, por ejemplo), y eso es correcto.
    const heroPreload = page.locator('link[rel="preload"][as="image"][imagesrcset*="/img/hero/"]');
    await expect(heroPreload).toHaveCount(1);

    const [preloadSizes, imgSizes, preloadHref, preloadType] = await Promise.all([
      heroPreload.getAttribute("imagesizes"),
      page.locator("img.hero-img").getAttribute("sizes"),
      heroPreload.getAttribute("href"),
      heroPreload.getAttribute("type"),
    ]);
    expect(preloadSizes).toBe(imgSizes);

    // El href de reserva debe coincidir con el tipo anunciado.
    if (preloadType === "image/avif") expect(preloadHref).toMatch(/\.avif$/);
  });

  test("las 14 celdas de galería sólo generan 8 descargas", async ({ page }) => {
    const requested = new Set<string>();
    page.on("request", (request) => {
      if (request.resourceType() === "image" && request.url().includes("/img/gallery/")) {
        requested.add(request.url());
      }
    });

    await page.goto("/");
    await page.locator(".gallery").scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLImageElement>(".gallery-img")].every((i) => i.complete),
    );

    // 14 celdas en el DOM...
    await expect(page.locator(".gallery-img")).toHaveCount(14);
    // ...pero sólo 8 descargas: las repetidas comparten `src` y `sizes`, así que
    // el navegador reutiliza la misma petición.
    expect(requested.size).toBe(8);
  });
});
