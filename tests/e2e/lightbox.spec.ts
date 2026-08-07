import { expect, test } from "@playwright/test";

/** Lightbox de galería y vídeo (spec §4.7). */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready.then(() => true));
});

test("el iframe del vídeo NO existe hasta abrir el lightbox", async ({ page }) => {
  // Si viviera en el shell de la página, cargaría scripts de terceros en cada
  // visita para un vídeo que casi nadie abre.
  await expect(page.locator("iframe")).toHaveCount(0);

  await expect(page.getByRole("button", { name: /Ver el video/i })).toHaveCount(0);
  await expect(page.locator('[data-lightbox="video"]')).toHaveCount(0);
  await expect(page.locator(".lightbox-video iframe")).toHaveCount(0);
});

test("una foto de galería abre, navega y cierra devolviendo el foco", async ({ page }) => {
  await page.locator(".gallery").scrollIntoViewIfNeeded();

  const trigger = page.locator('.gallery-item[data-lightbox-index="2"]').first();
  await trigger.click();

  const dialog = page.locator("dialog.lightbox");
  await expect(dialog).toBeVisible();
  // El índice del lightbox es el de la foto ÚNICA, no el de la celda repetida.
  await expect(page.locator(".lightbox-counter")).toHaveText("3 de 8");

  await page.getByRole("button", { name: "Foto siguiente" }).click();
  await expect(page.locator(".lightbox-counter")).toHaveText("4 de 8");

  // Las flechas del teclado también navegan.
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".lightbox-counter")).toHaveText("3 de 8");

  // Da la vuelta al llegar al final, que es lo esperable en una galería.
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".lightbox-counter")).toHaveText("8 de 8");

  // Escape cierra (lo da el <dialog> nativo) y el foco vuelve al disparador.
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("bloquea el scroll de la página mientras está abierto", async ({ page }) => {
  await page.locator(".gallery").scrollIntoViewIfNeeded();
  await page.locator("[data-lightbox=gallery]").first().click();
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");

  await page.getByRole("button", { name: "Cerrar" }).click();
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
});

test("cada foto de la galería anuncia qué amplía", async ({ page }) => {
  const labels = await page
    .locator("[data-lightbox=gallery]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")));

  expect(labels).toHaveLength(14);
  for (const label of labels) {
    expect(label).toMatch(/^Ampliar foto: .{15,}/);
  }
});
