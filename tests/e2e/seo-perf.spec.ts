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

  /* Los tres devolvían 404 hasta UI-012. Un favicon roto no rompe ninguna
     página, así que sobrevive indefinidamente si nadie lo afirma. */
  test("sirve el icono de pestaña y el de iOS", async ({ request }) => {
    for (const path of ["/icon.png", "/apple-icon.png"]) {
      const response = await request.get(path);
      expect(response.status(), `${path} no responde 200`).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/png");
    }
  });

  test("sirve el manifest con sus iconos y el theme-color de la marca", async ({ page, request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);

    const manifest = JSON.parse(await response.text());
    expect(manifest.name).toContain("Boquita");
    expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(["192x192", "512x512"]);

    // Los iconos que declara tienen que existir de verdad.
    for (const icon of manifest.icons) {
      expect((await request.get(icon.src)).status(), `${icon.src} no existe`).toBe(200);
    }

    // El theme-color del manifest y el del <meta> no pueden divergir: si lo
    // hacen, Android y el navegador pintan la barra de distinto color.
    const meta = await page.locator('meta[name="theme-color"]').getAttribute("content");
    expect(manifest.theme_color).toBe(meta);
  });

  test("el HTML enlaza icono, apple-touch-icon y manifest", async ({ page }) => {
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", /icon\.png/);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      "href",
      /apple-icon\.png/,
    );
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      "/manifest.webmanifest",
    );
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

  /**
   * El LCP cae en el hero, y la foto del hero va precargada. Son dos cosas
   * distintas, y conviene no confundirlas otra vez.
   *
   * Este test afirmaba `expect(lcpElement).toContain("hero-img")`, y dejó de ser
   * cierto cuando el rediseño convirtió el hero en full-bleed. **La foto ya no
   * puede ser el elemento LCP, y no es un fallo:** Chrome excluye de LCP las
   * imágenes cuyo rectángulo cubre el viewport entero, porque a esa escala casi
   * siempre son fondo decorativo. Aquí acierta — la foto va desenfocada 2px,
   * atenuada al 74% y bajo dos gradientes; el contenido es el titular encima.
   *
   * Comprobado dándole `height: 85%` en vez de `100%`: con eso vuelve a ser
   * candidata al instante, con 1.001.798 px². No es entropía (todos los
   * derivados están muy por encima de 0.05 bpp), ni el `z-index: -2`, ni el
   * `filter: blur` — se descartaron los tres por medición.
   *
   * Así que lo que se afirma es lo que de verdad importa y sigue siendo cierto:
   * que el LCP caiga DENTRO del hero (es decir, sobre el pliegue) y que la foto
   * se precargue bien. Medido: ~1.1s, contra un presupuesto de 2.5s.
   *
   * ⚠ No hacer la imagen un poco más pequeña que el viewport para que "vuelva a
   * contar". Eso no mejora nada para el usuario: sólo engaña a la métrica.
   */
  test("el LCP cae dentro del hero, y la foto del hero va precargada", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    // Hay que esperar a que el LCP SE ESTABILICE, no leer el primer callback.
    // El LCP se revisa al alza según pintan elementos más grandes: a los 192ms el
    // candidato es el logo, y el texto del hero no llega hasta ~1.1s (los
    // `.reveal` lo retrasan). Resolver en el primer callback devolvía «logo» y
    // hacía fallar el test por un motivo que no tiene nada que ver con el hero.
    //
    // Se considera estable cuando pasan 800ms sin candidatos nuevos.
    const lcp = await page.evaluate(
      () =>
        new Promise<{ cls: string; ms: number; dentroDelHero: boolean }>((resolve) => {
          let ultimo: (PerformanceEntry & { element?: Element }) | undefined;
          let quieto: ReturnType<typeof setTimeout>;

          const entregar = () => {
            clearTimeout(quieto);
            resolve({
              cls: ultimo?.element?.className ?? "",
              ms: Math.round(ultimo?.startTime ?? 0),
              dentroDelHero: !!ultimo?.element?.closest?.(".hero"),
            });
          };

          new PerformanceObserver((list) => {
            ultimo = list.getEntries().at(-1) as typeof ultimo;
            clearTimeout(quieto);
            quieto = setTimeout(entregar, 800);
          }).observe({ type: "largest-contentful-paint", buffered: true });

          // Tope duro, por si no llegara ningún candidato.
          setTimeout(entregar, 5000);
        }),
    );

    expect(
      lcp.dentroDelHero,
      `el LCP se fue fuera del hero: ${lcp.cls || "sin elemento"} a los ${lcp.ms}ms. ` +
        "La primera pintura grande ya no está sobre el pliegue.",
    ).toBe(true);

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
      if (request.resourceType() === "image" && request.url().includes("/img/producto/")) {
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
