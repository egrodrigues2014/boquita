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
    await page.getByRole("button", { name: "Ocasiones", exact: true }).click();
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

  /**
   * UI-027 sostenía que el H2 del carrito precede al H1 en todas las páginas y
   * rompe el orden de encabezados. En el DOM es cierto: el drawer se monta en el
   * header, antes de `<main>`.
   *
   * En el árbol de accesibilidad NO lo es, y ésa es la que cuenta. El drawer
   * cerrado lleva `inert` y `visibility: hidden`, y cada uno por separado ya
   * saca su subárbol del árbol de accesibilidad: ningún lector de pantalla
   * encuentra ese H2 antes del H1. Abierto es un diálogo modal con foco
   * atrapado, donde el H2 es su título y está en su sitio.
   *
   * Este test existe para que la conclusión no caduque en silencio: si alguien
   * quita el `inert` o cambia el ocultado por algo que no poda el árbol, el
   * hallazgo original pasa a ser real y esto se pone rojo.
   */
  test("el carrito cerrado no aporta encabezados al documento", async ({ page }) => {
    await page.goto("/tienda");

    const estado = await page.evaluate(() => {
      const titulo = document.querySelector("#cart-title") as HTMLElement;
      const drawer = titulo.closest(".cart-drawer") as HTMLElement;
      return {
        inert: drawer.hasAttribute("inert"),
        visibility: getComputedStyle(drawer).visibility,
        h1DespuesEnElDom: !!(
          titulo.compareDocumentPosition(document.querySelector("h1")!) &
          Node.DOCUMENT_POSITION_FOLLOWING
        ),
      };
    });

    // Se afirma la premisa además de la conclusión: si el H1 dejara de ir
    // después en el DOM, este test estaría comprobando otra cosa.
    expect(estado.h1DespuesEnElDom).toBe(true);
    expect(
      estado.inert || estado.visibility === "hidden",
      "el carrito cerrado quedó expuesto al árbol de accesibilidad: su H2 pasa a preceder al H1 de verdad",
    ).toBe(true);
  });

  /* axe no detecta esto: un `outline:0` deja el elemento perfectamente
     accesible en el árbol, sólo invisible para quien navega con teclado. El
     buscador lo tuvo hasta UI-096, y hay que afirmarlo a mano. */
  test("el buscador del header muestra anillo de foco al llegar por teclado", async ({
    page,
    viewport,
  }) => {
    test.skip((viewport?.width ?? 0) <= 991, "el buscador no se renderiza por debajo de 992");

    await page.goto("/");
    await page.locator(".nav-search-input").focus();

    // El anillo vive en el contenedor: el input está dentro de un
    // `overflow:hidden` que lo recortaría.
    //
    // Hay que mirar `outlineStyle`, NO `outlineWidth`: `outline-width` computa a
    // `medium` (3px) aunque el estilo sea `none`, así que una aserción sobre el
    // ancho pasa igual con el anillo suprimido y no comprueba nada.
    const ring = await page.locator(".nav-search").evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor };
    });

    expect(ring.style, "el contenedor del buscador no dibuja anillo de foco").not.toBe("none");
    expect(parseFloat(ring.width)).toBeGreaterThanOrEqual(2);
  });
});
