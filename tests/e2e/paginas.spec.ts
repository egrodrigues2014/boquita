import { expect, test } from "@playwright/test";

/**
 * Páginas de texto y salud de la navegación.
 *
 * Existen porque el nav y el pie prometían contenido que no estaba: el dropdown
 * ofrecía «Entregas y zonas» y «Preguntas frecuentes» apuntando a la sección de
 * servicio de la portada, y el aviso legal era un `href="#"`.
 */

test.describe("sobre nosotros", () => {
  test("responde y tiene las cuatro secciones con su ancla", async ({ page }) => {
    const response = await page.goto("/sobre-nosotros");
    expect(response?.status()).toBe(200);

    for (const id of ["historia", "como-horneamos", "entregas", "preguntas-frecuentes"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test("declara FAQPage para que Google pueda desplegar las preguntas", async ({ page }) => {
    await page.goto("/sobre-nosotros");

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((el) => JSON.parse(el.textContent ?? "{}")));

    const faq = blocks.find((b) => b["@type"] === "FAQPage");
    expect(faq, "falta el nodo FAQPage").toBeTruthy();
    expect(faq.mainEntity.length).toBeGreaterThanOrEqual(6);

    // Cada pregunta con su respuesta, y las que la gente busca de verdad.
    for (const item of faq.mainEntity) {
      expect(item["@type"]).toBe("Question");
      expect(item.acceptedAnswer.text.length).toBeGreaterThan(40);
    }
    const questions = faq.mainEntity.map((q: { name: string }) => q.name).join(" ");
    expect(questions).toContain("anticipación");
    expect(questions).toContain("entregas");
  });

  test("las preguntas usan una lista de definiciones de verdad", async ({ page }) => {
    await page.goto("/sobre-nosotros");
    // La relación pregunta-respuesta es lo que un lector de pantalla necesita oír.
    const pairs = await page.locator(".faq-item").count();
    expect(pairs).toBeGreaterThanOrEqual(6);
    await expect(page.locator(".faq dt").first()).toBeVisible();
    await expect(page.locator(".faq dd").first()).toBeVisible();
  });

  test("el titular no queda tapado por el navbar al llegar por un ancla", async ({ page }) => {
    await page.goto("/sobre-nosotros#entregas");
    const [heading, navbar] = await Promise.all([
      page.locator("#entregas").boundingBox(),
      page.locator(".navbar").boundingBox(),
    ]);
    // El navbar es `position:absolute`; sin `scroll-margin-top` lo taparía.
    expect(heading!.y).toBeGreaterThan(navbar!.y + navbar!.height - 10);
  });
});

test.describe("aviso legal", () => {
  test("responde y dice lo que hace el sitio con los datos", async ({ page }) => {
    const response = await page.goto("/aviso-legal");
    expect(response?.status()).toBe(200);

    const body = page.locator("main");
    // Lo que este sitio hace de verdad: el carrito es local y no se envía a nadie.
    await expect(body).toContainText("almacenamiento local");
    await expect(body).toContainText("No usamos cookies");
    // Y lo que NO es: el resumen del carrito no es una factura.
    await expect(body).toContainText("NO es una factura ni un documento fiscal");
    await expect(body).toContainText("trazas");
  });

  test("va con noindex: no aporta en búsqueda", async ({ page }) => {
    await page.goto("/aviso-legal");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("404", () => {
  test("una URL inexistente da 404 con salidas útiles", async ({ page }) => {
    const response = await page.goto("/esta-no-existe");
    expect(response?.status()).toBe(404);

    // Los enlaces viejos de Instagram van a aterrizar aquí: tiene que haber
    // por dónde seguir, no un callejón sin salida.
    await expect(page.locator(".h6-sans")).toContainText("Error 404");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver el catálogo" })).toBeVisible();
    await expect(page.locator(".shop-card")).toHaveCount(3);

    // Y el nav y el pie siguen ahí, con la marca.
    await expect(page.locator(".navbar")).toBeVisible();
    await expect(page.locator(".footer-dark")).toHaveCSS("background-color", "rgb(58, 42, 26)");
  });

  test("las tarjetas de la 404 no llevan etiquetas pero sí el botón Pedir", async ({ page }) => {
    await page.goto("/esta-no-existe");
    // `showTag={false}`: aquí la tarjeta es una salida de emergencia, no una ficha
    // que se compare con las de al lado. Es lo único que protege esa prop.
    await expect(page.locator(".shop-card-tag")).toHaveCount(0);
    await expect(page.locator(".shop-card .shop-card-cta")).toHaveCount(3);
  });

  test("la 404 va con noindex", async ({ page }) => {
    await page.goto("/esta-no-existe");

    // Puede haber DOS metas de robots: en local `VERCEL_ENV` no está definido, así
    // que el layout raíz marca noindex para todo lo que no sea producción, y la
    // propia 404 añade el suyo. Con directivas en conflicto los buscadores
    // aplican la más restrictiva, así que basta con que ninguna permita indexar.
    const contents = await page
      .locator('meta[name="robots"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("content") ?? ""));

    expect(contents.length).toBeGreaterThan(0);
    expect(contents.some((c) => c.includes("noindex"))).toBe(true);
    expect(contents.every((c) => !/(^|,)\s*index/.test(c))).toBe(true);
  });

  test("un slug de producto inexistente cae en la misma 404", async ({ page }) => {
    const response = await page.goto("/tienda/inventado");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Ver el catálogo" })).toBeVisible();
  });
});

test.describe("salud de la navegación", () => {
  test("ningún enlace del nav o del pie está muerto", async ({ page, request, viewport }) => {
    test.skip(viewport!.width <= 991, "A ≤991 el nav vive dentro del drawer");
    await page.goto("/");

    const hrefs = await page.evaluate(() => {
      const nodes = [
        ...document.querySelectorAll<HTMLAnchorElement>(".navbar a[href], .footer a[href]"),
      ];
      return [...new Set(nodes.map((a) => a.getAttribute("href") ?? ""))];
    });

    const internos = hrefs.filter((h) => h.startsWith("/"));
    expect(internos.length).toBeGreaterThan(4);

    for (const href of internos) {
      // Un `#` a secas o una ruta inexistente son enlaces que defraudan.
      expect(href).not.toBe("#");
      const response = await request.get(href.split("#")[0]! || "/");
      expect(response.status(), `${href} devolvió ${response.status()}`).toBeLessThan(400);
    }
  });

  test("los enlaces compartidos no usan anclas puras", async ({ page, viewport }) => {
    test.skip(viewport!.width <= 991, "A ≤991 el nav vive dentro del drawer");
    // Desde /tienda, un `#galeria` a secas no llevaría a ninguna parte.
    await page.goto("/tienda");
    const anchors = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>(".navbar a[href], .footer a[href]")]
        .map((a) => a.getAttribute("href") ?? "")
        .filter((h) => h.startsWith("#")),
    );
    expect(anchors).toEqual([]);
  });

  test("el sitemap lista la portada, la tienda, las 23 fichas y sobre-nosotros", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/tienda</loc>");
    expect(xml).toContain("/sobre-nosotros</loc>");
    expect(xml).toContain("/tienda/queque-de-zanahoria</loc>");
    // El aviso legal es noindex: anunciarlo en el sitemap sería contradictorio.
    expect(xml).not.toContain("/aviso-legal");

    const urls = xml.match(/<loc>/g) ?? [];
    // portada + tienda + sobre-nosotros + 23 fichas
    expect(urls).toHaveLength(26);
  });
});
