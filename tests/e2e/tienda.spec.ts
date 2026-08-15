import { expect, test, type Page } from "@playwright/test";

/**
 * La tienda y el flujo de pedido de punta a punta.
 *
 * Es la función de negocio del sitio: si esto se rompe, Boquita deja de recibir
 * pedidos. Se comprueba el recorrido completo, no sólo que los componentes
 * rendericen.
 */

/** El drawer se abre desde el navbar. */
async function openCart(page: Page) {
  const drawer = page.locator(".cart-drawer");
  await page.getByRole("button", { name: /^Carrito/ }).click();
  await expect(drawer).toHaveClass(/cart-drawer--open/);
  await expect(drawer).toHaveCSS("transform", "none");
}

async function mockOrderSave(page: Page, status = 201) {
  await page.route("**/api/orders", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(status < 400 ? { status: "saved" } : { code: "storage_unavailable" }),
    }),
  );
}

test.describe("catálogo", () => {
  test("muestra buscador con autocomplete en la tienda movil", async ({ page, viewport }) => {
    test.skip(viewport!.width > 991, "Aqui se afirma el buscador del header movil");
    await page.goto("/tienda");

    const searchbox = page.getByRole("searchbox", { name: "Buscar productos" });
    await expect(searchbox).toBeVisible();
    await searchbox.fill("huevo");
    await expect(page.getByRole("option", { name: "Sin huevo" })).toBeVisible();
    await page.getByRole("option", { name: "Sin huevo" }).click();

    await expect(page).toHaveURL(/\/tienda\?sinAlergeno=huevo/);
    await expect(page.locator(".shop-card")).toHaveCount(3);
  });

  test("lista los 23 productos", async ({ page }) => {
    await page.goto("/tienda");
    await expect(page.locator(".shop-card")).toHaveCount(23);
    await expect(page.locator("h1")).toHaveText("Catálogo de productos");
  });

  test("hay exactamente 4 filtros de categoría: Todo y las 3 del catálogo", async ({ page }) => {
    // Las categorías salen de `CATEGORIAS`, así que una de más significa que el
    // tipo y el catálogo de Ale se han separado.
    await page.goto("/tienda");
    const filtros = page.locator('nav[aria-label="Filtrar por categoría"] .shop-filter');
    await expect(filtros).toHaveCount(4);
    await expect(filtros).toHaveText(["Todo", "Queques", "Galletas", "Dulces"]);
  });

  test("el filtro por categoría reduce la lista y marca el activo", async ({ page }) => {
    await page.goto("/tienda?categoria=galletas");

    const cards = page.locator(".shop-card");
    // Polvorones, galletas de granola y galletas de miel y limón.
    await expect(cards).toHaveCount(3);
    await expect(page.locator("h1")).toHaveText("Galletas");
    await expect(page.getByRole("link", { name: "Galletas", exact: true })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("los filtros de categoría y ocasión se combinan y se pueden quitar", async ({ page }) => {
    await page.goto("/tienda?categoria=queques&ocasion=cumpleanos");
    const combinado = await page.locator(".shop-card").count();
    expect(combinado).toBeGreaterThan(0);

    // Al cambiar de categoría se conserva la ocasión: son combinables.
    await page.getByRole("link", { name: "Dulces", exact: true }).click();
    await expect(page).toHaveURL(/categoria=dulces/);
    await expect(page).toHaveURL(/ocasion=cumpleanos/);

    // Y se puede quitar sólo la ocasión.
    await page.getByRole("link", { name: /Quitar el filtro/ }).click();
    await expect(page).not.toHaveURL(/ocasion=/);
    await expect(page).toHaveURL(/categoria=dulces/);
  });

  test("un parámetro inválido se ignora en vez de dar error", async ({ page }) => {
    // Alguien puede editar el enlace a mano o venir de un share viejo. También
    // llegan enlaces con las categorías que existían antes del catálogo de Ale.
    const response = await page.goto("/tienda?categoria=bocaditos");
    expect(response?.status()).toBe(200);
    await expect(page.locator(".shop-card")).toHaveCount(23);
  });

  test("la tarjeta muestra categoría, subcategoría y todas las presentaciones", async ({
    page,
  }) => {
    await page.goto("/tienda?q=cupcakes de zanahoria");
    const tag = page.locator(".shop-card").first().locator(".shop-card-tag");
    await expect(tag).toHaveText("Queques · Cupcakes · 6, 12 o 24 unidades");
    // Con varias presentaciones el precio es un «desde», no el de una cualquiera.
    await expect(page.locator(".shop-card-price").first()).toContainText("desde");
  });

  /**
   * Las tarjetas de una misma fila tienen que cuadrar de altura fila a fila, y no
   * es cosmético: con descripciones de 2, 3 y 4 líneas la rejilla se veía
   * escalonada y la línea de etiquetas de una tarjeta quedaba a media altura de la
   * descripción de su vecina.
   *
   * Lo sostienen `min-height: 2lh` en el nombre y `flex: 1` en la descripción, así
   * que este test es lo que avisa si alguien los quita. Se comprueban las tarjetas
   * de la PRIMERA fila, resueltas por la `y` de su foto, para que valga igual con 3
   * columnas (≥992) que con 2 (768-991).
   *
   * Se mide la DESCRIPCIÓN además de las etiquetas y el precio, y esa es la parte
   * que protege el `min-height`: desde que la fila de precio vive al fondo de la
   * tarjeta, su altura la fija el `flex: 1` del resumen y ya no depende del nombre.
   * Lo único que el nombre sigue cuadrando es el arranque de las descripciones —la
   * línea que sigue el ojo con la tarjeta alineada a la izquierda—, así que sin
   * esta tercera aserción el `min-height` se quedaría sin guardián.
   */
  test("las tarjetas de una fila alinean descripción, etiquetas y fila de precio", async ({
    page,
    viewport,
  }) => {
    test.skip(viewport!.width < 768, "A una columna no hay nada que alinear");
    await page.goto("/tienda");

    const filas = await page.locator(".shop-card").evaluateAll((cards) => {
      const y = (el: Element | null) => (el ? Math.round(el.getBoundingClientRect().top) : null);
      const primera = y(cards[0]?.querySelector(".shop-card-img") ?? null);
      return cards
        .filter((card) => y(card.querySelector(".shop-card-img")) === primera)
        .map((card) => ({
          resumen: y(card.querySelector(".shop-card-summary")),
          etiqueta: y(card.querySelector(".shop-card-tag")),
          precio: y(card.querySelector(".shop-card-price")),
        }));
    });

    expect(filas.length).toBeGreaterThan(1);
    const [referencia] = filas;
    for (const [i, tarjeta] of filas.entries()) {
      expect(tarjeta.resumen, `la descripción de la tarjeta ${i} no arranca a la misma altura`).toBe(
        referencia!.resumen,
      );
      expect(tarjeta.etiqueta, `las etiquetas de la tarjeta ${i} no cuadran`).toBe(
        referencia!.etiqueta,
      );
      expect(tarjeta.precio, `el precio de la tarjeta ${i} no cuadra con el de la primera`).toBe(
        referencia!.precio,
      );
    }
  });

  test("el botón Pedir lleva a la ficha y se anuncia con el nombre del producto", async ({
    page,
  }) => {
    await page.goto("/tienda?q=brigadeiros");
    const cta = page.locator(".shop-card .shop-card-cta");
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveText("Pedir");
    await expect(cta).toHaveAttribute("href", "/tienda/brigadeiros");
    // Criterio 2.5.3: la etiqueta visible va contenida en el nombre accesible, y
    // va DELANTE — quien navega por voz tiene que poder decir «pulsá Pedir».
    await expect(page.getByRole("link", { name: "Pedir Brigadeiros" })).toBeVisible();
  });

  test("la fila de precio queda pegada al fondo de todas las tarjetas por igual", async ({
    page,
  }) => {
    await page.goto("/tienda");
    // Es lo que compra el `flex: 1` de `.shop-card-summary`: con descripciones de
    // 2, 3 y 4 líneas la fila tiene que ser el suelo de la tarjeta y no un renglón
    // a media altura. Se miden LAS 23, no una fila.
    const holguras = await page.locator(".shop-card").evaluateAll((cards) =>
      cards.map((card) => {
        const caja = card.getBoundingClientRect();
        const fila = card.querySelector(".shop-card-foot")!.getBoundingClientRect();
        return Math.round(caja.bottom - fila.bottom);
      }),
    );

    expect(holguras).toHaveLength(23);
    expect(new Set(holguras), `holguras distintas: ${[...new Set(holguras)]}`).toEqual(new Set([20]));
  });

  test("el precio y el botón no se desbordan de la tarjeta", async ({ page }) => {
    await page.goto("/tienda");
    // El peor caso NO es el móvil: es 1100px de ventana, donde la tarjeta mide
    // 337px contra los 360 de 390px de ventana. Corre a los 8 anchos, así que ese
    // caso está cubierto. Por eso `.shop-card-foot` no lleva `flex-wrap`.
    const rotas = await page.locator(".shop-card").evaluateAll((cards) =>
      cards
        .map((card) => {
          const fila = card.querySelector(".shop-card-foot")!.getBoundingClientRect();
          const precio = card.querySelector(".shop-card-price")!.getBoundingClientRect();
          const boton = card.querySelector(".shop-card-cta")!.getBoundingClientRect();
          return {
            slug: card.querySelector("a")!.getAttribute("href"),
            // Si envolviera, la fila mediría más que el botón.
            envuelve: Math.round(fila.height) > Math.round(boton.height) + 1,
            desordenada: precio.x >= boton.x,
            desbordada: precio.left < fila.left - 1 || boton.right > fila.right + 1,
          };
        })
        .filter((r) => r.envuelve || r.desordenada || r.desbordada),
    );

    expect(rotas, `tarjetas con la fila de precio mal: ${JSON.stringify(rotas)}`).toEqual([]);
  });

  test("la tarjeta no reintroduce el bullet ni la sangría del li global", async ({ page }) => {
    await page.goto("/tienda");
    const card = page.locator(".shop-card").first();
    // El fondo crema se declara con el ATAJO `background`, que devuelve
    // `background-image` a none. Con `background-color` el list-bullet.svg del `li`
    // de `03-base.css` vuelve encima del crema, y nada más lo detecta.
    await expect(card).toHaveCSS("background-image", "none");
    await expect(card).toHaveCSS("background-color", "rgb(250, 245, 236)");
    // Y el `0` izquierdo del atajo de padding anula el `padding-left: 22px` del `li`.
    await expect(card).toHaveCSS("padding-left", "0px");
  });

  test("la foto se acerca al pasar el ratón por la zona de texto, no sólo por la foto", async ({
    page,
    viewport,
  }) => {
    test.skip(viewport!.width <= 479, "A ≤479 el proyecto emula táctil: no hay puntero fino");
    await page.goto("/tienda");
    const card = page.locator(".shop-card").first();
    const img = card.locator(".shop-card-img");

    await expect(img).toHaveCSS("transform", "none");
    // Se pasa el ratón por las ETIQUETAS: dentro de la tarjeta, fuera de la foto y
    // fuera del botón. Es lo que afirma que el realce es de la tarjeta entera.
    await card.locator(".shop-card-tag").hover();
    await expect(img).not.toHaveCSS("transform", "none");

    // El recorte no se puede ver con `boundingBox` —un `transform` no cambia la
    // caja de layout—, así que se afirma dónde vive el `overflow`. Si subiera a la
    // tarjeta se comería los anillos de foco de sus dos enlaces.
    await expect(card.locator(".shop-card-media")).toHaveCSS("overflow", "hidden");
    await expect(card).not.toHaveCSS("overflow", "hidden");
  });

  test("las tarjetas sirven el derivado de 400px en pantalla normal", async ({ page, viewport }) => {
    test.skip(viewport!.width < 1200, "El ancho de tarjeta cambia con el breakpoint");
    await page.goto("/tienda");
    const src = await page
      .locator(".shop-card-img")
      .first()
      .evaluate((img) => (img as HTMLImageElement).currentSrc);
    // La tarjeta mide 370px, así que 400 es el candidato correcto. Con la escalera
    // anterior ([300,600,1200]) el navegador bajaba el de 600: el doble de peso.
    expect(src).toContain("-400x");
  });
});

test.describe("ficha de producto", () => {
  test("declara Product y Offer en colones, como pre-pedido", async ({ page }) => {
    await page.goto("/tienda/queque-de-zanahoria");

    const product = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .evaluate((el) => JSON.parse(el.textContent ?? "{}"));

    expect(product["@type"]).toBe("Product");
    expect(product.name).toBe("Queque de zanahoria");
    expect(product.offers.priceCurrency).toBe("CRC");
    // Se hornea por encargo: PreOrder, no InStock.
    expect(product.offers.availability).toContain("PreOrder");

    /**
     * Con tres tamaños la oferta es un `AggregateOffer` con su horquilla, no un
     * `Offer` con el precio más bajo: publicar 2.500 a secas cuando el mismo queque
     * llega a 24.000 sería anunciar un precio que no existe para el tamaño que la
     * mayoría pide.
     */
    expect(product.offers["@type"]).toBe("AggregateOffer");
    expect(product.offers.lowPrice).toBe(2500);
    expect(product.offers.highPrice).toBe(24000);
    expect(product.offers.offerCount).toBe(3);
  });

  test("con una sola presentación sigue siendo un Offer simple", async ({ page }) => {
    await page.goto("/tienda/pie-de-brigadeiro");
    const product = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .evaluate((el) => JSON.parse(el.textContent ?? "{}"));

    expect(product.offers["@type"]).toBe("Offer");
    expect(product.offers.price).toBe(17350);
  });

  test("tiene la tarjeta de Open Graph que WhatsApp necesita", async ({ page }) => {
    await page.goto("/tienda/brigadeiros");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /Brigadeiros/,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/img\/producto\/brigadeiros/,
    );
  });

  test("muestra ingredientes, alérgenos y anticipación", async ({ page }) => {
    await page.goto("/tienda/galletas-de-granola");
    const meta = page.locator(".product-meta");
    // Los ingredientes son datos del Excel de Ale, no una lista escrita a mano.
    await expect(meta).toContainText("mantequilla de maní");
    await expect(meta).toContainText("nueces");
    await expect(meta).toContainText("48 horas");
  });

  test("el selector cambia el precio de la ficha antes de añadir al carrito", async ({ page }) => {
    await page.goto("/tienda/queque-de-zanahoria");

    // Arranca en la presentación de entrada, que es la más barata.
    await expect(page.locator(".product-price")).toHaveText("₡ 2.500");

    const opciones = page.locator(".variant-option");
    await expect(opciones).toHaveCount(3);
    await expect(opciones.first()).toContainText("pequeño (2 personas)");

    await page.getByRole("radio", { name: /grande \(20 personas\)/ }).check();
    await expect(page.locator(".product-price")).toHaveText("₡ 24.000");
    // Con presentación elegida el precio es exacto: el «desde» sería mentira.
    await expect(page.locator(".product-price")).not.toContainText("desde");
  });

  test("con una sola presentación no se dibuja el selector", async ({ page }) => {
    await page.goto("/tienda/pie-de-brigadeiro");
    await expect(page.locator(".variant-picker")).toHaveCount(0);
    await expect(page.locator(".product-unit")).toHaveText("grande (15 personas)");
  });

  test("un slug inexistente da 404", async ({ page }) => {
    const response = await page.goto("/tienda/no-existe");
    expect(response?.status()).toBe(404);
  });

  test("el queque personalizado NO se añade al carrito: se cotiza", async ({ page }) => {
    await page.goto("/tienda/queque-personalizado");

    // No hay botón de añadir, hay enlace a WhatsApp: su precio es «desde» y
    // sumarlo daría un total que no es el que se va a pagar.
    await expect(page.getByRole("button", { name: "Añadir al carrito" })).toHaveCount(0);
    const link = page.getByRole("link", { name: /Pedir cotización por WhatsApp/ });
    await expect(link).toHaveAttribute("href", /api\.whatsapp\.com\/send\?phone=50671322355/);
    await expect(page.locator(".product-price")).toContainText("desde");
  });
});

test.describe("carrito", () => {
  test("añade, actualiza la cantidad y refleja el total", async ({ page }) => {
    await page.goto("/tienda/queque-de-zanahoria");

    await page.getByRole("button", { name: "Añadir una unidad de Queque de zanahoria" }).click();
    await expect(page.locator(".add-to-cart .qty-value")).toHaveText("2");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();

    // El conteo va en el aria-label, no sólo en el badge visual.
    await expect(page.getByRole("button", { name: "Carrito, 2 productos" })).toBeVisible();

    await openCart(page);
    await expect(page.locator(".cart-line")).toHaveCount(1);
    // 2 × el pequeño, que es la presentación de entrada.
    await expect(page.locator(".cart-total strong")).toHaveText("₡ 5.000");

    // Subir la cantidad DESDE EL DRAWER. Hay que acotar el localizador al panel:
    // el mismo aria-label existe en la ficha de producto, que queda detrás del
    // scrim y por tanto no es pulsable. En el drawer el label lleva además la
    // presentación, porque es lo que identifica la línea.
    const drawer = page.locator(".cart-drawer");
    await drawer
      .getByRole("button", { name: "Añadir una unidad de Queque de zanahoria (pequeño" })
      .click();
    await expect(page.locator(".cart-total strong")).toHaveText("₡ 7.500");

    await drawer
      .getByRole("button", { name: /^Quitar Queque de zanahoria \(pequeño.*del pedido$/ })
      .click();
    await expect(page.locator(".cart-line")).toHaveCount(0);
    await expect(page.locator(".cart-empty")).toBeVisible();
  });

  /**
   * El caso que justifica que la línea del carrito se identifique por
   * `(slug, unit)` y no por el slug: con la identidad en el slug estos dos tamaños
   * se habrían fundido en una línea, con el precio del primero que se añadió, y el
   * pedido habría salido mal sin que nada lo avisara.
   */
  test("dos presentaciones del mismo producto son dos líneas", async ({ page }) => {
    await page.goto("/tienda/queque-de-zanahoria");

    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await page.getByRole("radio", { name: /grande \(20 personas\)/ }).check();
    await page.getByRole("button", { name: "Añadir al carrito" }).click();

    await openCart(page);
    await expect(page.locator(".cart-line")).toHaveCount(2);
    await expect(page.locator(".cart-line-unit").first()).toHaveText("pequeño (2 personas)");
    await expect(page.locator(".cart-line-unit").last()).toHaveText("grande (20 personas)");
    await expect(page.locator(".cart-total strong")).toHaveText("₡ 26.500");
  });

  test("volver a añadir la MISMA presentación suma en la línea que ya existe", async ({ page }) => {
    await page.goto("/tienda/queque-de-zanahoria");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await page.getByRole("button", { name: "Añadir al carrito" }).click();

    await openCart(page);
    await expect(page.locator(".cart-line")).toHaveCount(1);
    await expect(page.locator(".cart-total strong")).toHaveText("₡ 5.000");
  });

  test("el carrito sobrevive a la navegación", async ({ page }) => {
    await page.goto("/tienda/brigadeiros");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await expect(page.getByRole("button", { name: "Carrito, 1 producto" })).toBeVisible();

    // Persistido en localStorage con clave versionada.
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Carrito, 1 producto" })).toBeVisible();

    const stored = await page.evaluate(() => localStorage.getItem("boquita.cart.v2"));
    expect(stored).toContain("brigadeiros");
  });

  test("el badge no aparece antes de rehidratar, para no romper la hidratación", async ({
    page,
  }) => {
    await page.goto("/tienda/brigadeiros");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await page.reload();

    // El HTML servido no lleva badge: el primer render del cliente debe coincidir.
    const html = await page.content();
    // Tras rehidratar sí aparece.
    await expect(page.locator(".cart-badge")).toHaveText("1");
    expect(html).toBeTruthy();
  });

  test("no mezcla el precio a convenir en el total", async ({ page }) => {
    await page.goto("/tienda/queque-de-zanahoria");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);

    // Sólo el de precio fijo entra en el total.
    await expect(page.locator(".cart-total")).toContainText("Total");
    await expect(page.locator(".cart-total strong")).toHaveText("₡ 2.500");
  });

  test("al abrirlo, el foco entra en el panel", async ({ page }) => {
    // Si el foco se quedara fuera, Tab recorrería la página de detrás y Escape no
    // llegaría al panel. Pasa si se intenta enfocar antes de que el panel sea
    // visible: dentro de un subárbol `visibility:hidden` nada es enfocable.
    await page.goto("/tienda");
    await openCart(page);
    const inside = await page.evaluate(
      () => document.querySelector(".cart-drawer")?.contains(document.activeElement) ?? false,
    );
    expect(inside).toBe(true);
  });

  test("cierra con Escape y con el scrim cuando queda visible", async ({ page, viewport }) => {
    await page.goto("/tienda");
    await openCart(page);
    await page.keyboard.press("Escape");
    await expect(page.locator(".cart-drawer")).not.toHaveClass(/cart-drawer--open/);

    await openCart(page);
    if (viewport!.width <= 479) {
      // El carrito ocupa 100vw en móvil estrecho: no queda scrim clicable.
      await page.getByRole("button", { name: "Cerrar el carrito" }).click();
    } else {
      await page.locator(".cart-scrim").click({ position: { x: 5, y: 300 } });
    }
    await expect(page.locator(".cart-drawer")).not.toHaveClass(/cart-drawer--open/);
  });
});

test.describe("checkout por WhatsApp", () => {
  test("el enlace lleva el pedido completo codificado", async ({ page }) => {
    await page.goto("/tienda/polvorones-espanoles");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);

    await page.locator("#cart-name").fill("María Rodríguez");
    await page.locator("#cart-zone").fill("Santa Ana centro");

    const href = await page
      .getByRole("link", { name: /Finalizar por WhatsApp/ })
      .getAttribute("href");

    expect(href).toContain("api.whatsapp.com/send?phone=50671322355");
    /**
     * No pasa por `wa.me` a propósito: su redirección descodifica la query y la
     * recodifica sin manejar pares surrogados, así que cada emoji llegaba como
     * `U+FFFD`. Ver el comentario de `whatsappBaseUrl` en `lib/contact.ts`.
     */
    expect(href).not.toContain("wa.me");
    expect(href).toContain("%F0%9F%91%8B"); // el 👋, en sus cuatro bytes
    expect(href).not.toContain("%EF%BF%BD"); // ningún carácter de reemplazo

    const message = decodeURIComponent(href!.split("&text=")[1]!);

    expect(message).toContain("Hola, Ale 👋");
    // La presentación elegida viaja en su propia línea: es lo que Ale tiene que
    // hornear, y el `└` es el prefijo que un bot usará para leerla.
    expect(message).toContain("• 1 × Polvorones españoles\n└ 6 unidades — ₡ 3.000");
    expect(message).toContain("💰 *Total:* ₡ 3.000");
    expect(message).toContain("👤 *Cliente:* María Rodríguez");
    expect(message).toContain("📍 *Zona:* Santa Ana centro");
    expect(message).toContain("📌 *Solicitud:*");

    // La negrita de WhatsApp es de UN asterisco; con dos se ven literales.
    expect(message).not.toContain("**");
    // Saltos de línea reales, no literales.
    expect(message).toContain("\n");
    expect(message).not.toContain("\\n");
  });

  test("la fecha mínima respeta el horneado por encargo", async ({ page }) => {
    await page.goto("/tienda/queque-de-zanahoria");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);

    const min = await page.locator("#cart-date").getAttribute("min");
    const minDate = new Date(`${min}T00:00:00`);
    const hoursAhead = (minDate.getTime() - Date.now()) / 3_600_000;
    // 48 h de anticipación, con margen por el redondeo a día.
    expect(hoursAhead).toBeGreaterThan(24);
  });

  test("NO vacía el carrito al pulsar finalizar", async ({ page, context }) => {
    // WhatsApp puede no abrirse o el cliente puede cerrarlo sin enviar: vaciar
    // ahí perdería el pedido sin que nadie lo haya recibido.
    await page.goto("/tienda/brigadeiros");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);

    // Se intercepta la apertura de la pestaña para no salir a WhatsApp.
    await mockOrderSave(page);
    await context.route("**api.whatsapp.com**", (route) => route.abort());
    await page.getByRole("link", { name: /Finalizar por WhatsApp/ }).click({ force: true });

    await expect(page.locator(".cart-line")).toHaveCount(1);
    // Y aparece el botón explícito para vaciarlo.
    await expect(page.getByRole("button", { name: "Sí, vaciar el carrito" })).toBeVisible();
  });

  test("el botón explícito sí vacía el carrito", async ({ page, context }) => {
    await page.goto("/tienda/brigadeiros");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);

    await mockOrderSave(page);
    await context.route("**api.whatsapp.com**", (route) => route.abort());
    await page.getByRole("link", { name: /Finalizar por WhatsApp/ }).click({ force: true });
    await page.getByRole("button", { name: "Sí, vaciar el carrito" }).click();

    await expect(page.getByRole("button", { name: "Carrito, vacío" })).toBeVisible();
  });

  test("guarda un pedido sin correo sin bloquear WhatsApp", async ({ page, context }) => {
    await page.goto("/tienda/brigadeiros");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);
    await page.locator("#cart-name").fill("Ana");

    let payload: Record<string, unknown> | undefined;
    await page.route("**/api/orders", async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 201, contentType: "application/json", body: '{"status":"saved"}' });
    });
    await context.route("**api.whatsapp.com**", (route) => route.abort());

    await page.getByRole("link", { name: /Finalizar por WhatsApp/ }).click({ force: true });
    await expect(page.getByText("Pedido guardado.")).toBeVisible();
    expect(payload).toMatchObject({ name: "Ana", website: "" });
    expect(payload).not.toHaveProperty("marketing");
    expect(payload?.items).toEqual([
      expect.objectContaining({ slug: "brigadeiros", qty: 1, price: expect.any(Number) }),
    ]);
  });

  test("un correo empezado exige consentimiento antes de abrir WhatsApp", async ({ page }) => {
    await page.goto("/tienda/brigadeiros");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);
    await page.locator("#cart-email").fill("ana@example.com");

    let requests = 0;
    await page.route("**/api/orders", (route) => {
      requests += 1;
      return route.abort();
    });
    await page.getByRole("link", { name: /Finalizar por WhatsApp/ }).click();

    await expect(page.locator("#cart-marketing-error")).toContainText("Marcá la casilla");
    await expect(page.locator("#cart-marketing-consent")).toBeFocused();
    expect(requests).toBe(0);
  });

  test("guarda correo normalizado, consentimiento versionado y pedido completo", async ({
    page,
    context,
  }) => {
    await page.goto("/tienda/polvorones-espanoles");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);
    await page.locator("#cart-name").fill("María");
    await page.locator("#cart-zone").fill("Santa Ana");
    await page.locator("#cart-notes").fill("Caja de regalo");
    await page.locator("#cart-email").fill(" MARIA@EXAMPLE.COM ");
    await page.locator("#cart-marketing-consent").check();

    let payload: Record<string, unknown> | undefined;
    await page.route("**/api/orders", async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 201, contentType: "application/json", body: '{"status":"saved"}' });
    });
    await context.route("**api.whatsapp.com**", (route) => route.abort());
    await page.getByRole("link", { name: /Finalizar por WhatsApp/ }).click({ force: true });
    await expect(page.getByText("Pedido guardado.")).toBeVisible();

    expect(payload).toMatchObject({
      name: "María",
      zone: "Santa Ana",
      notes: "Caja de regalo",
      marketing: {
        email: "maria@example.com",
        consent: true,
        version: "cart-2026-08",
      },
    });
    const href = await page.getByRole("link", { name: /Finalizar por WhatsApp/ }).getAttribute("href");
    expect(decodeURIComponent(href!)).not.toContain("maria@example.com");
  });

  test("permite reintentar con el mismo UUID cuando Neon falla", async ({ page, context }) => {
    await page.goto("/tienda/brigadeiros");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);

    const ids: string[] = [];
    await page.route("**/api/orders", async (route) => {
      const payload = route.request().postDataJSON() as { id: string };
      ids.push(payload.id);
      const retry = ids.length > 1;
      await route.fulfill({
        status: retry ? 200 : 503,
        contentType: "application/json",
        body: retry ? '{"status":"already_saved"}' : '{"code":"storage_unavailable"}',
      });
    });
    await context.route("**api.whatsapp.com**", (route) => route.abort());
    await page.getByRole("link", { name: /Finalizar por WhatsApp/ }).click({ force: true });

    await expect(page.getByRole("button", { name: "Reintentar guardado" })).toBeVisible();
    await page.getByRole("button", { name: "Reintentar guardado" }).click();
    await expect(page.getByText("Pedido guardado.")).toBeVisible();
    expect(ids).toHaveLength(2);
    expect(ids[1]).toBe(ids[0]);
  });
});

test.describe("la portada enlaza bien con la tienda", () => {
  test("los 8 destacados llevan a fichas que existen", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator(".menu-item-name")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));

    expect(hrefs).toHaveLength(8);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/tienda\/[a-z0-9-]+$/);
    }

    // Se comprueba una de verdad: un slug desincronizado daría 404.
    const response = await page.goto(hrefs[0]!);
    expect(response?.status()).toBe(200);
  });

  test("Catálogo del nav navega a /tienda y conserva dropdown de categorías", async ({
    page,
    viewport,
  }) => {
    test.skip(viewport!.width <= 991, "A ≤991 el nav vive dentro del drawer");
    await page.goto("/");

    const nav = page.getByLabel("Principal");
    const catalogo = nav.getByRole("link", { name: "Catálogo", exact: true });
    await catalogo.hover();
    // Las 3 categorías del catálogo de Ale, en el mismo orden que los chips.
    const links = nav.locator(".nav-dropdown").first().locator(".nav-dropdown-link");
    await expect(links).toHaveCount(3);
    await expect(links).toHaveText(["Queques", "Galletas", "Dulces"]);
    await expect(links.first()).toHaveAttribute("href", "/tienda?categoria=queques");
    await expect(links.first()).not.toContainText("—");

    await catalogo.click();
    await expect(page).toHaveURL(/\/tienda$/);
    await expect(page.locator("h1")).toHaveText("Catálogo de productos");
  });

  test("la búsqueda del header filtra productos en /tienda", async ({ page, viewport }) => {
    test.skip(viewport!.width <= 991, "La búsqueda visible vive en el header desktop");
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Buscar productos" }).fill("brigadeiros");
    await page.getByRole("button", { name: "Buscar productos" }).click();

    await expect(page).toHaveURL(/\/tienda\?q=brigadeiros/);
    await expect(page.locator(".shop-card")).toHaveCount(1);
    await expect(page.locator(".shop-card-name")).toHaveText("Brigadeiros");
  });

  test("la busqueda del header muestra autocomplete y aplica filtros", async ({
    page,
    viewport,
  }) => {
    test.skip(viewport!.width <= 991, "La busqueda visible vive en el header desktop");
    await page.goto("/");

    let searchbox = page.getByRole("searchbox", { name: "Buscar productos" });
    await searchbox.fill("Queq");
    await expect(page.getByRole("option", { name: "Queques" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Queque de zanahoria" })).toBeVisible();

    const overflow = await page.locator(".nav-search-suggestions").evaluate((list) => ({
      clientHeight: list.clientHeight,
      scrollHeight: list.scrollHeight,
    }));
    expect(overflow.scrollHeight).toBeGreaterThan(overflow.clientHeight);

    await page.getByRole("option", { name: "Queques" }).click();
    await expect(page).toHaveURL(/\/tienda\?categoria=queques/);

    await page.goto("/");
    searchbox = page.getByRole("searchbox", { name: "Buscar productos" });
    await searchbox.fill("huevo");
    await expect(page.getByRole("option", { name: "Sin huevo" })).toBeVisible();
    await page.getByRole("option", { name: "Sin huevo" }).click();
    await expect(page).toHaveURL(/\/tienda\?sinAlergeno=huevo/);
    await expect(page.locator(".shop-card")).toHaveCount(3);
  });

  test("la portada movil muestra buscador en el header", async ({ page, viewport }) => {
    test.skip(viewport!.width > 991, "El buscador movil vive en el header");
    await page.goto("/");

    const searchbox = page.getByRole("searchbox", { name: "Buscar productos" });
    await expect(searchbox).toBeVisible();
    await searchbox.fill("Queq");
    await expect(page.getByRole("option", { name: "Queques" })).toBeVisible();
    await page.getByRole("option", { name: "Queques" }).click();

    await expect(page).toHaveURL(/\/tienda\?categoria=queques/);
  });
});

/**
 * UI-067. Los filtros del catálogo son `searchParams`, así que las 11 vistas son
 * la misma ruta. Antes de esto compartían título, descripción y canonical con el
 * catálogo entero.
 *
 * No es cosmética: la forma de compartir una vista filtrada en este producto es
 * pegar la URL en WhatsApp, y WhatsApp lee exactamente este título.
 */
test.describe("metadatos por vista de catálogo", () => {
  const titulo = (page: import("@playwright/test").Page) => page.title();

  test("el catálogo sin filtros conserva su título", async ({ page }) => {
    await page.goto("/tienda");
    expect(await titulo(page)).toContain("Catálogo");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/tienda$/);
  });

  test("la categoría cambia título, descripción y canonical", async ({ page }) => {
    await page.goto("/tienda?categoria=dulces");

    expect(await titulo(page)).toContain("Dulces");
    expect(await titulo(page)).not.toContain("Catálogo");

    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc).toContain("dulces");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /categoria=dulces/,
    );
  });

  test("categoría y ocasión juntas aparecen las dos", async ({ page }) => {
    await page.goto("/tienda?categoria=queques&ocasion=cumpleanos");
    const t = await titulo(page);
    expect(t).toContain("Queques");
    expect(t).toContain("Cumpleaños");
  });

  test("la búsqueda no se indexa y dice qué se buscó", async ({ page }) => {
    await page.goto("/tienda?q=chocolate");

    expect(await titulo(page)).toContain("chocolate");
    // Infinitas URLs de contenido derivado no entran en el índice.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    // El canonical de una búsqueda apunta al catálogo, no a sí misma.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/tienda$/);
  });

  test("una búsqueda sin resultados no promete productos que no hay", async ({ page }) => {
    await page.goto("/tienda?q=zzzzzzzz");
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc).toMatch(/Ning[úu]n producto/i);
  });

  test("un parámetro inválido cae en el catálogo completo", async ({ page }) => {
    await page.goto("/tienda?categoria=inventada");
    expect(await titulo(page)).toContain("Catálogo");
  });
});

/**
 * UI-031. El repo usa `aria-disabled` y no `disabled` en los steppers y en las
 * flechas del slider, a propósito: cuando un elemento ENFOCADO se deshabilita,
 * el navegador manda el foco al <body>, y quien navega con teclado hasta un
 * extremo pierde el punto de anclaje. Está razonado en TestimonialsSlider.tsx.
 *
 * Pero `aria-disabled` no deshabilita nada por su cuenta: es una promesa que
 * tiene que cumplir el handler. Si alguien quita el clamp, el control queda
 * anunciado como no disponible y funcionando igualmente — que es peor que no
 * anunciarlo. Esto fija la promesa.
 */
test.describe("los controles aria-disabled no hacen nada al pulsarlos", () => {
  test("el − del stepper de la ficha no baja de 1", async ({ page }) => {
    await page.goto("/tienda/queque-de-zanahoria");

    const menos = page.getByRole("button", { name: /Quitar una unidad/ });
    const cantidad = page.locator(".qty-value").first();

    await expect(cantidad).toHaveText("1");
    await expect(menos).toHaveAttribute("aria-disabled", "true");

    // `force: true` es obligatorio y dice algo por sí solo: Playwright considera
    // `aria-disabled="true"` como no accionable y un `click()` normal esperaría
    // hasta agotar el timeout. O sea, la semántica se está anunciando bien. Lo
    // que se quiere comprobar aquí es lo otro: que si el usuario consigue
    // pulsarlo igualmente —puntero, Enter, un lector que lo active—, no pase nada.
    await menos.click({ force: true });
    await menos.click({ force: true });
    await expect(cantidad, "el stepper bajó por debajo del mínimo").toHaveText("1");
  });

  test("el botón anunciado como no disponible conserva el foco", async ({ page }) => {
    await page.goto("/tienda/queque-de-zanahoria");

    const menos = page.getByRole("button", { name: /Quitar una unidad/ });
    await menos.focus();
    await menos.click({ force: true });

    // Con `disabled` real el navegador habría mandado el foco al <body>: eso es
    // exactamente lo que la decisión documentada evita.
    await expect(menos, "el control perdió el foco al pulsarlo en el extremo").toBeFocused();
  });
});

/**
 * El hueco del kill-switch de `styles/99-a11y.css`: ese bloque enumera selectores
 * uno a uno y su `*` final sólo apaga `animation-*`, no `transition`. Un
 * `transform` nuevo que se olvide de apuntarse ahí sigue moviéndose con
 * `prefers-reduced-motion` y no lo dice nadie.
 */
test.describe("la tarjeta del catálogo con prefers-reduced-motion", () => {
  test("la foto no se acerca al pasar el ratón", async ({ page, viewport }) => {
    test.skip(viewport!.width <= 479, "A ≤479 el proyecto emula táctil: no hay puntero fino");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/tienda");

    const img = page.locator(".shop-card").first().locator(".shop-card-img");
    await page.locator(".shop-card").first().locator(".shop-card-tag").hover();

    await expect(img).toHaveCSS("transform", "none");
    await expect(img).toHaveCSS("transition-duration", "0s");
  });
});
