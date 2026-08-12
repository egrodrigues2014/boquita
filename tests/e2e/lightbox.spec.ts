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

  expect(labels).toHaveLength(14);
  for (const label of labels) {
    expect(label).toMatch(/^Ver producto: .{2,}/);
  }
});
