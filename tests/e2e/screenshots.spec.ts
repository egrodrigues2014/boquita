import { expect, type Page, test } from "@playwright/test";

/**
 * Capturas de revisión visual. No son aserciones: la verificación de medidas vive
 * en geometry.spec.ts. Esto es para mirar la página con ojos humanos.
 *
 *   npx playwright test screenshots --project=w1440
 *
 * Salida en tests/e2e/__screenshots__/ (gitignored).
 *
 * Por qué siguen sin ser `toHaveScreenshot`: este repo protege el layout con
 * aserciones de geometría, no con baselines de píxel. Una baseline de imagen
 * ata la suite al renderizado de fuentes de UNA máquina, y aquí el árbol vive en
 * OneDrive bajo Windows — el primer CI en Linux la rompería entera sin que nada
 * estuviera mal. Las capturas sirven para comparar antes/después a mano durante
 * un bloque de trabajo; lo que debe fallar solo se afirma en geometry.spec.ts.
 *
 * ⚠ MEDIDO, no supuesto: dos capturas consecutivas de la portada SIN ningún
 * cambio de código difieren en un ~5.6% de subpíxeles. La causa es el estado de
 * las animaciones dirigidas por scroll —`ScrollColorText` y los `.reveal`—, que
 * no aterriza en el mismo punto dos veces porque depende de cuándo se resolvió
 * cada imagen. Consecuencia práctica: **un diff de píxeles de la portada por
 * debajo de ~6% no prueba nada**. Para comparar de verdad hay que mirar bandas
 * concretas, o usar las páginas internas, que sí son estables. Un
 * `toHaveScreenshot` aquí sería intermitente desde el primer día.
 *
 * Cubre las 10 vistas que la convención 7 del backlog exige como baseline:
 * portada, catálogo, catálogo filtrado, búsqueda sin resultados, ficha, carrito
 * abierto, drawer de navegación, sobre nosotros, aviso legal y 404.
 */

/** Deja la página quieta: fuentes listas, lazy-loading forzado, imágenes cargadas. */
async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready.then(() => true));

  await page.evaluate(async () => {
    for (const img of document.images) {
      img.loading = "eager";
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });

  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
      ),
    );
  });
}

async function shoot(page: Page, name: string, width: number, fullPage = true) {
  await settle(page);
  await page.screenshot({ path: `tests/e2e/__screenshots__/${name}-${width}.png`, fullPage });
}

const viewportWidth = (testInfo: { project: { use: { viewport?: { width: number } | null } } }) =>
  testInfo.project.use.viewport?.width ?? 0;

test("captura de la portada", async ({ page }, testInfo) => {
  await page.goto("/");
  await shoot(page, "portada", viewportWidth(testInfo));
});

test("captura del catalogo", async ({ page }, testInfo) => {
  await page.goto("/tienda");
  await shoot(page, "catalogo", viewportWidth(testInfo));
});

test("captura del catalogo filtrado", async ({ page }, testInfo) => {
  await page.goto("/tienda?categoria=dulces");
  await shoot(page, "catalogo-filtrado", viewportWidth(testInfo));
});

test("captura del catalogo sin resultados", async ({ page }, testInfo) => {
  // Búsqueda deliberadamente imposible: es el estado vacío que la fase 5 tiene
  // que rellenar (UI-082), y conviene tener el «antes».
  await page.goto("/tienda?q=zzzzzzzz");
  await shoot(page, "catalogo-vacio", viewportWidth(testInfo));
});

test("captura de la ficha de producto", async ({ page }, testInfo) => {
  await page.goto("/tienda/queque-de-zanahoria");
  await shoot(page, "ficha", viewportWidth(testInfo));
});

test("captura del carrito abierto", async ({ page }, testInfo) => {
  await page.goto("/tienda/queque-de-zanahoria");
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await page.getByRole("button", { name: /^Carrito/ }).click();
  // El drawer es fixed: fullPage lo capturaría sobre una página larga y en la
  // captura saldría flotando a media altura. Sólo el viewport.
  await shoot(page, "carrito", viewportWidth(testInfo), false);
});

test("captura del drawer de navegación", async ({ page, viewport }, testInfo) => {
  test.skip(viewport!.width > 991, "El drawer sólo existe a ≤991");
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.getByRole("button", { name: "Abrir menú" }).click();
  const drawer = page.locator("#nav-menu");
  await expect.poll(async () => (await drawer.boundingBox())!.x).toBeCloseTo(0, 0);
  await drawer.evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.screenshot({
    path: `tests/e2e/__screenshots__/drawer-navegacion-${viewportWidth(testInfo)}.png`,
    fullPage: false,
  });
});

test("captura de sobre nosotros", async ({ page }, testInfo) => {
  await page.goto("/sobre-nosotros");
  await shoot(page, "sobre-nosotros", viewportWidth(testInfo));
});

test("captura del aviso legal", async ({ page }, testInfo) => {
  await page.goto("/aviso-legal");
  await shoot(page, "aviso-legal", viewportWidth(testInfo));
});

test("captura del 404", async ({ page }, testInfo) => {
  await page.goto("/ruta-que-no-existe");
  await shoot(page, "404", viewportWidth(testInfo));
});
