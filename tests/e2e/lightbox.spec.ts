import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready.then(() => true));
});

test("la galeria ya no monta lightbox ni disparadores de galeria", async ({ page }) => {
  await expect(page.locator("dialog.lightbox")).toHaveCount(0);
  await expect(page.locator('[data-lightbox="gallery"]')).toHaveCount(0);
  await expect(page.locator("[data-lightbox-index]")).toHaveCount(0);
});

test("una foto de galeria navega a la ficha del producto", async ({ page }) => {
  await page.locator(".gallery").scrollIntoViewIfNeeded();

  const first = page.locator(".gallery-item").first();
  await expect(first).toHaveAttribute("href", "/tienda/queque-de-zanahoria");
  await first.click();

  await expect(page).toHaveURL(/\/tienda\/queque-de-zanahoria$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Queque de zanahoria");
});

test("cada foto de la galeria anuncia que producto abre", async ({ page }) => {
  const labels = await page
    .locator(".gallery-item")
    .evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")));

  expect(labels).toHaveLength(42);
  for (const label of labels) {
    expect(label).toMatch(/^Ver producto: .{2,}/);
  }
});

test("la foto de galeria se acerca al pasar el raton", async ({ page, viewport }) => {
  test.skip(viewport!.width <= 479, "A <=479 el proyecto emula tactil: no hay puntero fino");
  await page.locator(".gallery").scrollIntoViewIfNeeded();

  const item = page.locator(".gallery-item").nth(1);
  const img = item.locator(".gallery-img");

  await expect(img).toHaveCSS("transform", "none");
  await item.hover();
  await expect(img).not.toHaveCSS("transform", "none");
  await expect(item).toHaveCSS("overflow", "hidden");
});

test("la foto de galeria no se acerca con prefers-reduced-motion", async ({ page, viewport }) => {
  test.skip(viewport!.width <= 479, "A <=479 el proyecto emula tactil: no hay puntero fino");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.locator(".gallery").scrollIntoViewIfNeeded();

  const item = page.locator(".gallery-item").nth(1);
  const img = item.locator(".gallery-img");

  await item.hover();
  await expect(img).toHaveCSS("transform", "none");
  await expect(img).toHaveCSS("transition-duration", "0s");
});
