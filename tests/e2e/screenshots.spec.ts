import { test } from "@playwright/test";

/**
 * Capturas de revisión visual. No son aserciones: la verificación de medidas vive
 * en geometry.spec.ts. Esto es para mirar la página con ojos humanos.
 *
 *   npx playwright test screenshots --project=w1440
 *
 * Salida en tests/e2e/__screenshots__/ (gitignored).
 * En la Fase 6 estas mismas capturas pasan a ser baselines de `toHaveScreenshot`.
 */
test("captura de la portada", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready.then(() => true));

  // Forzar la carga de las imágenes lazy antes de capturar.
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

  const width = testInfo.project.use.viewport?.width ?? 0;
  await page.screenshot({
    path: `tests/e2e/__screenshots__/portada-${width}.png`,
    fullPage: true,
  });
});
