import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Auditoría automática de accesibilidad — punto 14 del checklist §9.
 *
 * Hasta ahora se afirmaban propiedades una por una (`aria-label` en las flechas,
 * orden de encabezados, foco visible). Eso comprueba lo que uno se acuerda de
 * comprobar. axe comprueba lo que uno NO se acordó.
 *
 * Se audita en los cinco estados que pide el plan, porque un panel abierto es un
 * árbol de accesibilidad distinto: en reposo, con el drawer del nav abierto, con
 * un dropdown desplegado, con el carrito abierto y con el lightbox abierto.
 */

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Espera a que todo elemento visible con reveal haya terminado su fundido.
 *
 * Sin esto, axe medía el color a mitad de animación: reportaba el eyebrow en
 * `#cab48e` (su ámbar mezclado con el blanco al ~50% de opacidad) en vez de su
 * `#8A5A06` final, y el h1 en `#d4d0cd`. Seis violaciones de contraste que no
 * existen en el estado final.
 *
 * Se espera el estado real en vez de emular reduced-motion: así se audita lo que
 * ve la mayoría de la gente, no un modo especial. (El estado con reduced-motion
 * lo cubre tests/e2e/interactions.spec.ts.)
 */
async function waitForReveals(page: Page) {
  await page.evaluate(() => document.fonts.ready.then(() => true));

  // Sólo se espera a los que YA se están revelando (los que tienen `is-in`). Los
  // que aún no han entrado en pantalla se quedan a opacidad 0 y axe los descarta
  // como invisibles; exigirlos colgaba la auditoría con el lightbox abierto,
  // donde el scroll está bloqueado y nunca llegan a revelarse.
  await page.waitForFunction(() =>
    [...document.querySelectorAll<HTMLElement>(".reveal.is-in")].every(
      (el) => Number.parseFloat(getComputedStyle(el).opacity) > 0.99,
    ),
  );
}

async function audit(page: Page, label: string) {
  await waitForReveals(page);
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

  if (results.violations.length > 0) {
    // Mensaje legible: qué regla, qué impacto y en qué nodo. Sin esto, un fallo
    // de axe es un volcado JSON que nadie lee.
    const detail = results.violations
      .map((violation) => {
        const nodes = violation.nodes
          .slice(0, 3)
          .map((node) => `        ${node.target.join(" ")}`)
          .join("\n");
        return `  · [${violation.impact}] ${violation.id}: ${violation.help}\n${nodes}`;
      })
      .join("\n");
    throw new Error(`${results.violations.length} violaciones en «${label}»:\n${detail}`);
  }

  expect(results.violations).toEqual([]);
}

test.describe("accesibilidad", () => {
  test("portada en reposo", async ({ page }) => {
    await page.goto("/");
    await audit(page, "portada en reposo");
  });

  test("portada con el lightbox de galería abierto", async ({ page }) => {
    await page.goto("/");
    await page.locator(".gallery").scrollIntoViewIfNeeded();
    await page.locator("[data-lightbox=gallery]").first().click();
    await expect(page.locator("dialog.lightbox")).toBeVisible();
    await audit(page, "lightbox abierto");
  });

  test("portada con un dropdown del nav desplegado", async ({ page, viewport }) => {
    test.skip(viewport!.width <= 991, "A ≤991 los dropdowns viven dentro del drawer");
    await page.goto("/");
    await page.getByRole("button", { name: "Catálogo", exact: true }).click();
    await audit(page, "dropdown desplegado");
  });

  test("portada con el drawer del nav abierto", async ({ page, viewport }) => {
    test.skip(viewport!.width > 991, "El drawer sólo existe a ≤991");
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await audit(page, "drawer abierto");
  });

  test("carrito con productos dentro", async ({ page }) => {
    await page.goto("/tienda/queque-de-zanahoria");
    await page.getByRole("button", { name: "Añadir al carrito" }).click();
    await page.getByRole("button", { name: /^Carrito/ }).click();
    await expect(page.locator(".cart-drawer")).toHaveClass(/cart-drawer--open/);
    await audit(page, "carrito abierto con productos");
  });

  test("catálogo", async ({ page }) => {
    await page.goto("/tienda");
    await audit(page, "catálogo");
  });

  test("ficha de producto", async ({ page }) => {
    await page.goto("/tienda/brigadeiros");
    await audit(page, "ficha de producto");
  });

  test("sobre nosotros", async ({ page }) => {
    await page.goto("/sobre-nosotros");
    await audit(page, "sobre nosotros");
  });

  test("aviso legal", async ({ page }) => {
    await page.goto("/aviso-legal");
    await audit(page, "aviso legal");
  });
});
