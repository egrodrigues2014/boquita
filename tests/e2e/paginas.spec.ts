import { expect, test } from "@playwright/test";

/**
 * Páginas de texto y salud de la navegación.
 *
 * Existen porque el nav y el pie prometían contenido que no estaba: el dropdown
 * ofrecía «Entregas y zonas» y «Preguntas frecuentes» apuntando a la sección de
 * servicio de la portada, y el aviso legal era un `href="#"`.
 */

test.describe("sobre nosotros", () => {
  test("responde y tiene todas las secciones con su ancla", async ({ page }) => {
    const response = await page.goto("/sobre-nosotros");
    expect(response?.status()).toBe(200);

    for (const id of [
      "sobre-boquita",
      "historia",
      "como-horneamos",
      "catalogo",
      "presentaciones",
      "ocasiones",
      "entregas",
      "preguntas-frecuentes",
      "escribeme",
    ]) {
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

  test("el carrusel muestra todas las fotos del catálogo sin enlaces", async ({ page }) => {
    await page.goto("/sobre-nosotros");

    // 27 = los 26 productos del catálogo + la segunda foto del personalizado.
    // A diferencia de la galería de la PORTADA —que va por la lista curada
    // `GALLERY_SLUGS` y está clavada en 24 por la rejilla 6×4—, esta rueda es
    // decorativa y sí crece con el catálogo: calcula su radio con el número real
    // de imágenes. Si añades un producto, este número sube.
    const wheel = page.locator(".product-wheel");
    await expect(wheel).toHaveAttribute("data-carousel-count", "27");
    await expect(wheel.locator("a")).toHaveCount(0);

    const originals = wheel.locator(
      ".product-wheel__set:not(.product-wheel__set--copy) .product-wheel__card",
    );
    await expect(originals).toHaveCount(27);
    await expect(wheel.locator(".product-wheel__set--copy .product-wheel__card")).toHaveCount(27);
    await expect(wheel.locator(".product-wheel__set--copy")).toHaveAttribute("aria-hidden", "true");

    const sources = await originals.evaluateAll((cards) =>
      cards.map((card) => card.getAttribute("data-carousel-image")),
    );
    const copySources = await wheel
      .locator(".product-wheel__set--copy .product-wheel__card")
      .evaluateAll((cards) => cards.map((card) => card.getAttribute("data-carousel-image")));
    expect(new Set(sources).size).toBe(27);
    expect(copySources, "la copia móvil no repite la secuencia exacta").toEqual(sources);
  });

  test("los temas del catálogo van en negrita ámbar y en su propia línea", async ({ page }) => {
    await page.goto("/sobre-nosotros");

    const primera = page.locator(".prose-lead-in").first();
    await expect(primera).toBeVisible();
    await expect(primera).toHaveText("Queques:");

    // #8A5A06 es `--gold-ink`, el ámbar de TEXTO. `--gold` (#E8A81B) daría
    // 2.09:1 sobre blanco, y nada más que esto lo distingue: axe mide el
    // contraste, pero un ámbar por otro que también pase no lo ve nadie.
    await expect(primera).toHaveCSS("color", "rgb(138, 90, 6)");
    await expect(primera).toHaveCSS("font-weight", "600");

    // Acotado al bloque del catálogo: `.prose-lead-in` sin ancestro recoge también
    // los seis rótulos de #entregas, que se afirman en su propio test. `toEqual` y
    // no `arrayContaining` para que un tema nuevo —o uno perdido— salte aquí.
    const catalogo = page.locator(".prose-block", { has: page.locator("#catalogo") });
    expect(await catalogo.locator(".prose-lead-in").allTextContents()).toEqual([
      "Queques:",
      "Galletas:",
      "Postres:",
      "Salados:",
      "Queques personalizados:",
    ]);

    // Y va en SU LÍNEA: se mide, no se supone. El `<strong>` es una caja de
    // bloque, así que arranca en el canto izquierdo del párrafo, ocupa el carril
    // entero y deja el texto debajo.
    const caja = await primera.evaluate((el) => {
      const rotulo = el.getBoundingClientRect();
      const parrafo = el.parentElement!.getBoundingClientRect();
      return {
        display: getComputedStyle(el).display,
        pegadaAlCanto: Math.abs(rotulo.left - parrafo.left) < 1,
        ocupaElCarril: rotulo.width > parrafo.width * 0.9,
        elTextoBajo: parrafo.height > rotulo.height * 1.5,
      };
    });
    expect(caja.display, "la entradilla volvió a la misma línea que el texto").toBe("block");
    expect(caja.pegadaAlCanto).toBe(true);
    expect(caja.ocupaElCarril).toBe(true);
    expect(caja.elTextoBajo, "el texto no bajó a la línea siguiente").toBe(true);
  });

  test("«Pedidos y entregas» va por rótulos al canto, con los plazos en viñeta", async ({
    page,
  }) => {
    await page.goto("/sobre-nosotros");

    const bloque = page.locator(".prose-block", { has: page.locator("#entregas") });
    const lista = bloque.locator("ul.prose-list");

    // Seis rótulos y una sola lista, la de los dos plazos. Las negritas del bloque
    // son exactamente esos seis rótulos: si aparece un `<strong>` suelto, o si
    // alguien devuelve la sección a seis viñetas, cae aquí.
    expect(await bloque.locator(".prose-lead-in").allTextContents()).toEqual([
      "Cómo hacer tu pedido:",
      "Tiempo de anticipación:",
      "Retiro en punto de entrega:",
      "Entrega a domicilio:",
      "Formas de pago:",
      "Puntualidad:",
    ]);
    await expect(bloque.locator("strong, b")).toHaveCount(6);
    await expect(lista).toHaveCount(1);
    await expect(lista.locator("li")).toHaveCount(2);

    // Y el texto arranca en el MISMO canto que el de las demás secciones: era la
    // queja del cliente cuando la sección entera iba en viñetas, con los 30px de
    // sangría del carril. Los dos únicos elementos sangrados son los plazos.
    const cantos = await bloque.evaluate((el) => {
      const carril = el.getBoundingClientRect().left;
      const parrafos = [...el.querySelectorAll("p")].map((p) =>
        Math.round(p.getBoundingClientRect().left - carril),
      );
      const items = [...el.querySelectorAll("li")].map((li) =>
        Math.round(li.getBoundingClientRect().left - carril),
      );
      return { parrafos, items };
    });
    expect(cantos.parrafos.length).toBe(6);
    for (const canto of cantos.parrafos) {
      expect(canto, "un párrafo de #entregas quedó sangrado respecto al carril").toBe(0);
    }
    // El `<ul>` tampoco: la sangría la ponen los `<li>` con su `padding-left`.
    for (const canto of cantos.items) expect(canto).toBe(0);
    // `list-style: none` (02-reset.css) le quita a WebKit las semánticas de
    // lista: VoiceOver deja de anunciar «lista, 6 elementos». El `role` se las
    // devuelve. Chromium no lo necesita, y por eso hay que afirmarlo a mano — si
    // se cae, en esta suite no se nota.
    await expect(lista).toHaveAttribute("role", "list");

    const medidas = await page.evaluate(() => {
      const leer = (selector: string) => {
        const el = document.querySelector(selector);
        if (!el) throw new Error(`no existe ${selector}`);
        const cs = getComputedStyle(el);
        return {
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
          fontWeight: cs.fontWeight,
          fontFamily: cs.fontFamily,
          color: cs.color,
          display: cs.display,
          paddingLeft: cs.paddingLeft,
          backgroundImage: cs.backgroundImage,
          backgroundPosition: cs.backgroundPosition,
        };
      };
      return { vineta: leer("#entregas ~ ul.prose-list li"), parrafo: leer("#historia ~ p") };
    });

    // El `li` global de 03-base.css es 16px, peso 500 y `--gold-ink`: si vuelve,
    // las viñetas se leen como una lista de etiquetas y no como prosa, y encima
    // más pequeñas que el texto que las rodea. Se compara contra un `<p>` de otra
    // sección en vez de contra números literales, para que el día que cambie el
    // cuerpo de la página la lista tenga que cambiar CON él.
    for (const prop of ["fontSize", "lineHeight", "fontWeight", "fontFamily", "color"] as const) {
      expect(
        medidas.vineta[prop],
        `la viñeta no usa el cuerpo de la prosa (${prop}): volvió el li global`,
      ).toBe(medidas.parrafo[prop]);
    }

    // `block` y no `flex`: el `li` global es flex, y un ítem flex NO se blockifica
    // a `block`. Con flex, un enlace dentro de una viñeta saltaría de línea al
    // convertirse en ítem propio.
    expect(medidas.vineta.display).toBe("block");
    expect(medidas.vineta.paddingLeft, "vuelve el carril de 22px del li global").toBe("30px");
    expect(medidas.vineta.backgroundImage, "se cayó la viñeta").toContain("list-bullet.svg");

    // Y el punto se PINTA. El `background-image` computado no lo demuestra: con
    // el SVG mal formado —o con un 404— la URL sigue ahí y el fondo se queda en
    // blanco sin que nada falle. Así estuvieron los dos iconos del proyecto desde
    // el principio, y este test pasaba en verde con la lista sin viñetas.
    const punto = await page.evaluate(
      (url) =>
        new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(`${img.naturalWidth}x${img.naturalHeight}`);
          img.onerror = () => resolve("no decodifica");
          img.src = url;
        }),
      "/icons/list-bullet.svg",
    );
    expect(punto, "el SVG del punto no llega a decodificarse: el fondo queda en blanco").toBe(
      "8x8",
    );

    // El punto mide 8px y se centra A MANO en la PRIMERA línea: con `0 0` se
    // pegaría al canto superior de un ítem de tres líneas. El valor esperado se
    // recalcula desde el `line-height` real, así que vale a los ocho anchos y no
    // hay dos literales que actualizar cuando cambie la escala.
    const alturaLinea = Number.parseFloat(medidas.parrafo.lineHeight);
    const esperado = Math.round((alturaLinea - 8) / 2);
    const posicionY = Number.parseFloat(medidas.vineta.backgroundPosition.split(" ")[1]!);
    expect(
      posicionY,
      `el punto no está centrado en la primera línea (${alturaLinea}px): esperado ${esperado}px`,
    ).toBeCloseTo(esperado, 0);
  });

  test("ningún destino del desplegable queda tapado por el navbar", async ({ page }) => {
    for (const id of [
      "sobre-boquita",
      "historia",
      "como-horneamos",
      "catalogo",
      "presentaciones",
      "ocasiones",
      "entregas",
      "preguntas-frecuentes",
      "escribeme",
    ]) {
      await page.goto(`/sobre-nosotros#${id}`);
      const [destino, navbar] = await Promise.all([
        page.locator(`#${id}`).boundingBox(),
        page.locator(".navbar").boundingBox(),
      ]);
      expect(destino!.y, `#${id} queda tapado por el navbar`).toBeGreaterThan(
        navbar!.y + navbar!.height - 10,
      );
    }
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
    await expect(body).not.toContainText("Los datos fiscales y de inscripción");
    await expect(body.getByRole("heading", { name: "Servicios de terceros" })).toHaveCount(0);
    await expect(body.locator(".prose-block")).toHaveCount(6);
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

  test("el sitemap lista la portada, la tienda, las 26 fichas y sobre-nosotros", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/tienda</loc>");
    expect(xml).toContain("/sobre-nosotros</loc>");
    expect(xml).toContain("/tienda/queque-de-zanahoria</loc>");
    // El aviso legal es noindex: anunciarlo en el sitemap sería contradictorio.
    expect(xml).not.toContain("/aviso-legal");

    const urls = xml.match(/<loc>/g) ?? [];
    // portada + tienda + sobre-nosotros + 26 fichas
    expect(urls).toHaveLength(29);
  });
});
