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

test.describe("catálogo", () => {
  test("lista los 14 productos", async ({ page }) => {
    await page.goto("/tienda");
    await expect(page.locator(".shop-card")).toHaveCount(14);
    await expect(page.locator("h1")).toHaveText("Todo el catálogo");
  });

  test("el filtro por categoría reduce la lista y marca el activo", async ({ page }) => {
    await page.goto("/tienda?categoria=salado");

    const cards = page.locator(".shop-card");
    await expect(cards).toHaveCount(2); // cachitos de jamón y asado negro
    await expect(page.locator("h1")).toHaveText("Salado");
    await expect(page.getByRole("link", { name: "Salado", exact: true })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  test("los filtros de categoría y ocasión se combinan y se pueden quitar", async ({ page }) => {
    await page.goto("/tienda?categoria=queques&ocasion=cumpleanos");
    const combinado = await page.locator(".shop-card").count();
    expect(combinado).toBeGreaterThan(0);

    // Al cambiar de categoría se conserva la ocasión: son combinables.
    await page.getByRole("link", { name: "Bocaditos dulces" }).click();
    await expect(page).toHaveURL(/categoria=bocaditos/);
    await expect(page).toHaveURL(/ocasion=cumpleanos/);

    // Y se puede quitar sólo la ocasión.
    await page.getByRole("link", { name: /Quitar el filtro/ }).click();
    await expect(page).not.toHaveURL(/ocasion=/);
    await expect(page).toHaveURL(/categoria=bocaditos/);
  });

  test("un parámetro inválido se ignora en vez de dar error", async ({ page }) => {
    // Alguien puede editar el enlace a mano o venir de un share viejo.
    const response = await page.goto("/tienda?categoria=inventada");
    expect(response?.status()).toBe(200);
    await expect(page.locator(".shop-card")).toHaveCount(14);
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
    expect(product.offers.price).toBeGreaterThan(0);
    // Se hornea por encargo: PreOrder, no InStock.
    expect(product.offers.availability).toContain("PreOrder");
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

  test("muestra alérgenos y anticipación", async ({ page }) => {
    await page.goto("/tienda/galletas-de-granola");
    await expect(page.locator(".product-meta")).toContainText("almendra");
    await expect(page.locator(".product-meta")).toContainText("48 horas");
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
    await expect(link).toHaveAttribute("href", /wa\.me\/50671322355/);
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
    await expect(page.locator(".cart-total strong")).toHaveText("₡ 28.000");

    // Subir la cantidad DESDE EL DRAWER. Hay que acotar el localizador al panel:
    // el mismo aria-label existe en la ficha de producto, que queda detrás del
    // scrim y por tanto no es pulsable.
    const drawer = page.locator(".cart-drawer");
    await drawer
      .getByRole("button", { name: "Añadir una unidad de Queque de zanahoria" })
      .click();
    await expect(page.locator(".cart-total strong")).toHaveText("₡ 42.000");

    await drawer.getByRole("button", { name: "Quitar Queque de zanahoria del pedido" }).click();
    await expect(page.locator(".cart-line")).toHaveCount(0);
    await expect(page.locator(".cart-empty")).toBeVisible();
  });

  test("el carrito sobrevive a la navegación", async ({ page }) => {
    await page.goto("/tienda/brigadeiros");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await expect(page.getByRole("button", { name: "Carrito, 1 producto" })).toBeVisible();

    // Persistido en localStorage con clave versionada.
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Carrito, 1 producto" })).toBeVisible();

    const stored = await page.evaluate(() => localStorage.getItem("boquita.cart.v1"));
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
    await expect(page.locator(".cart-total strong")).toHaveText("₡ 14.000");
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
    await page.goto("/tienda/polvorones-de-almendra");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);

    await page.locator("#cart-name").fill("María Rodríguez");
    await page.locator("#cart-zone").fill("Santa Ana centro");

    const href = await page
      .getByRole("link", { name: /Finalizar por WhatsApp/ })
      .getAttribute("href");

    expect(href).toContain("wa.me/50671322355");
    const message = decodeURIComponent(href!.split("?text=")[1]!);
    expect(message).toContain("Polvorones de almendra");
    expect(message).toContain("₡ 5.000");
    expect(message).toContain("Nombre: María Rodríguez");
    expect(message).toContain("Zona de entrega: Santa Ana centro");
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
    await context.route("**wa.me**", (route) => route.abort());
    await page.getByRole("link", { name: /Finalizar por WhatsApp/ }).click({ force: true });

    await expect(page.locator(".cart-line")).toHaveCount(1);
    // Y aparece el botón explícito para vaciarlo.
    await expect(page.getByRole("button", { name: "Sí, vaciar el carrito" })).toBeVisible();
  });

  test("el botón explícito sí vacía el carrito", async ({ page, context }) => {
    await page.goto("/tienda/brigadeiros");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await openCart(page);

    await context.route("**wa.me**", (route) => route.abort());
    await page.getByRole("link", { name: /Finalizar por WhatsApp/ }).click({ force: true });
    await page.getByRole("button", { name: "Sí, vaciar el carrito" }).click();

    await expect(page.getByRole("button", { name: "Carrito, vacío" })).toBeVisible();
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
    const links = nav.locator(".nav-dropdown").first().locator(".nav-dropdown-link");
    await expect(links).toHaveCount(5);
    await expect(links.first()).toHaveAttribute("href", "/tienda?categoria=queques");
    await expect(links.first()).not.toContainText("—");

    await catalogo.click();
    await expect(page).toHaveURL(/\/tienda$/);
    await expect(page.locator("h1")).toHaveText("Todo el catálogo");
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
    await page.goto("/tienda?categoria=salado");

    expect(await titulo(page)).toContain("Salado");
    expect(await titulo(page)).not.toContain("Catálogo");

    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc).toContain("salado");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /categoria=salado/,
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
