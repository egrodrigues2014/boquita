import { expect, test } from "@playwright/test";

/**
 * Comportamiento interactivo: puntos 7, 8, 12 y parte del 14 del checklist §9.
 *
 * La geometría estática vive en geometry.spec.ts. Aquí se comprueba lo que sólo
 * existe cuando el JavaScript corre.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready.then(() => true));
});

// ── Reveal ─────────────────────────────────────────────────────────────────
test.describe("reveal al entrar en pantalla", () => {
  test("el script inline marca el documento como con-JS antes del primer pintado", async ({
    page,
  }) => {
    await expect(page.locator("html")).toHaveClass(/\bjs\b/);
  });

  test("los elementos sobre el pliegue se revelan solos", async ({ page }) => {
    // El eyebrow del hero ya está intersecando al montar, así que el observer
    // dispara en su primer tick.
    await expect(page.locator(".hero-content .reveal").first()).toHaveClass(/is-in/, {
      timeout: 3000,
    });
  });

  test("un elemento del pie empieza oculto y se revela al llegar", async ({ page }) => {
    const target = page.locator(".menu-item").first();
    // Antes de scrollear: presente en el DOM pero transparente.
    await expect(target).not.toHaveClass(/is-in/);
    await expect(target).toHaveCSS("opacity", "0");

    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveClass(/is-in/);
    await expect(target).toHaveCSS("opacity", "1");
  });

  test("el escalonado del catálogo va por FILAS, no por item", async ({ page }) => {
    // Con 2 columnas: 0,0,100,100,200,200,200,200 ms.
    const delays = await page
      .locator(".menu-item")
      .evaluateAll((items) =>
        items.map((el) => getComputedStyle(el).getPropertyValue("transition-delay").trim()),
      );
    expect(delays).toEqual([
      "0s",
      "0s",
      "0.1s",
      "0.1s",
      "0.2s",
      "0.2s",
      "0.2s",
      "0.2s",
    ]);
  });

  test("la imagen del hero NO lleva reveal: es el elemento LCP (desvío D-20)", async ({ page }) => {
    const heroImg = page.locator(".hero-img");
    await expect(heroImg).toHaveCSS("opacity", "1");
    const wrapped = await heroImg.evaluate((el) => !!el.closest(".reveal"));
    expect(wrapped).toBe(false);
  });
});

// ── Punto 12 · prefers-reduced-motion ──────────────────────────────────────
test.describe("prefers-reduced-motion", () => {
  test("desactiva el reveal por completo, sin necesidad de scroll", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.evaluate(() => document.fonts.ready.then(() => true));

    const target = page.locator(".menu-item").first();
    // Visible aunque esté bajo el pliegue y sin la clase is-in.
    await expect(target).toHaveCSS("opacity", "1");
    await expect(target).toHaveCSS("transition-duration", "0s");
  });

  test("congela el parallax en su posición media", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.locator(".gallery").scrollIntoViewIfNeeded();

    const read = () =>
      page.locator(".track--1").evaluate((el) => getComputedStyle(el).transform);

    const before = await read();
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
    expect(await read()).toBe(before);
  });

  test("quita la transición del slider", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.locator(".slider-mask")).toHaveCSS("transition-duration", "0s");
  });
});

// ── Punto 7 · parallax ─────────────────────────────────────────────────────
test.describe("parallax de la galería", () => {
  test("las dos filas se mueven en direcciones OPUESTAS al hacer scroll", async ({ page }) => {
    await page.locator(".gallery").scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);

    /** Lee el desplazamiento horizontal (m41) de la matriz de cada fila. */
    const readOffsets = () =>
      page.evaluate(() => {
        const m = (selector: string) =>
          new DOMMatrixReadOnly(getComputedStyle(document.querySelector(selector)!).transform).m41;
        return { row1: m(".track--1"), row2: m(".track--2") };
      });

    const samples: { row1: number; row2: number }[] = [await readOffsets()];
    for (let i = 0; i < 4; i++) {
      await page.mouse.wheel(0, 250);
      await page.waitForTimeout(150);
      samples.push(await readOffsets());
    }

    const delta1 = samples.at(-1)!.row1 - samples[0]!.row1;
    const delta2 = samples.at(-1)!.row2 - samples[0]!.row2;

    // Ambas se han movido de verdad...
    expect(Math.abs(delta1)).toBeGreaterThan(5);
    expect(Math.abs(delta2)).toBeGreaterThan(5);
    // ...y en sentidos contrarios.
    expect(Math.sign(delta1)).toBe(-Math.sign(delta2));
  });

  test("`will-change` sólo se activa mientras la sección está en pantalla (desvío D-3)", async ({
    page,
  }) => {
    // Arriba de la página, con la galería fuera del alcance del gate.
    await expect(page.locator(".track--1")).not.toHaveClass(/is-animating/);

    await page.locator(".gallery").scrollIntoViewIfNeeded();
    await expect(page.locator(".track--1")).toHaveClass(/is-animating/);
    await expect(page.locator(".track--1")).toHaveCSS("will-change", "transform");
  });
});

// ── Punto 8 · slider ───────────────────────────────────────────────────────
test.describe("slider de testimonios", () => {
  test("navega con las flechas y se deshabilita en los extremos", async ({ page, viewport }) => {
    const perView = viewport!.width <= 767 ? 1 : viewport!.width <= 991 ? 2 : 3;
    const maxIndex = 6 - perView;

    const left = page.getByRole("button", { name: "Ver reseñas anteriores" });
    const right = page.getByRole("button", { name: "Ver reseñas siguientes" });
    const mask = page.locator(".slider-mask");

    // Arranca al principio: izquierda apagada, derecha activa.
    // Se comprueba `aria-disabled`, no `disabled`: deshabilitar de verdad un
    // botón enfocado manda el foco al <body> y rompe la navegación por teclado.
    await expect(left).toHaveAttribute("aria-disabled", "true");
    await expect(right).toHaveAttribute("aria-disabled", "false");
    await expect(mask).toHaveAttribute("style", /--i:\s*0/);

    await right.click();
    await expect(mask).toHaveAttribute("style", /--i:\s*1/);
    await expect(left).toHaveAttribute("aria-disabled", "false");

    // Hasta el final.
    for (let i = 1; i < maxIndex; i++) await right.click();
    await expect(mask).toHaveAttribute("style", new RegExp(`--i:\\s*${maxIndex}`));
    await expect(right).toHaveAttribute("aria-disabled", "true");

    // Un clic extra en el extremo no debe mover nada.
    // `force: true` es necesario porque Playwright considera `aria-disabled="true"`
    // como no accionable y esperaría en vano — lo cual es, en sí, la prueba de que
    // el estado se comunica correctamente a la tecnología asistiva.
    await right.click({ force: true });
    await expect(mask).toHaveAttribute("style", new RegExp(`--i:\\s*${maxIndex}`));

    // Y de vuelta.
    for (let i = 0; i < maxIndex; i++) await left.click();
    await expect(mask).toHaveAttribute("style", /--i:\s*0/);
    await expect(left).toHaveAttribute("aria-disabled", "true");
  });

  test("responde al teclado con flechas, Home y End", async ({ page, viewport }) => {
    const perView = viewport!.width <= 767 ? 1 : viewport!.width <= 991 ? 2 : 3;
    const maxIndex = 6 - perView;
    const mask = page.locator(".slider-mask");

    await page.getByRole("button", { name: "Ver reseñas siguientes" }).focus();

    await page.keyboard.press("ArrowRight");
    await expect(mask).toHaveAttribute("style", /--i:\s*1/);

    await page.keyboard.press("End");
    await expect(mask).toHaveAttribute("style", new RegExp(`--i:\\s*${maxIndex}`));

    // El foco debe seguir en la flecha tras llegar al extremo: es justo lo que
    // se perdía cuando el botón se deshabilitaba de verdad.
    await expect(page.getByRole("button", { name: "Ver reseñas siguientes" })).toBeFocused();

    await page.keyboard.press("Home");
    await expect(mask).toHaveAttribute("style", /--i:\s*0/);
  });

  test("las 6 reseñas siguen en el DOM para lectores de pantalla", async ({ page }) => {
    await expect(page.locator(".review-card")).toHaveCount(6);
    await expect(page.locator(".slider p.sr-only")).toContainText("de 6");
  });
});

// ── Punto 14 · navegación ──────────────────────────────────────────────────
test.describe("navegación", () => {
  test("los dropdowns de escritorio abren y cierran con teclado", async ({ page, viewport }) => {
    test.skip(viewport!.width <= 991, "A ≤991 el nav vive dentro del drawer");

    // `exact: true` es imprescindible: por defecto getByRole busca por subcadena
    // y "Catálogo" también encajaría con el megamenú "Todo el catálogo".
    const toggle = page.getByRole("button", { name: "Catálogo", exact: true });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const panelId = await toggle.getAttribute("aria-controls");
    await expect(page.locator(`#${panelId}`)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("el drawer móvil abre, bloquea el scroll y cierra con Escape", async ({ page, viewport }) => {
    test.skip(viewport!.width > 991, "El drawer sólo existe a ≤991");

    const burger = page.getByRole("button", { name: "Abrir menú" });
    const menu = page.locator("#nav-menu");

    await expect(menu).not.toHaveClass(/nav-menu--open/);

    await burger.click();
    await expect(menu).toHaveClass(/nav-menu--open/);
    await expect(burger).toHaveAttribute("aria-expanded", "true");

    // El foco tiene que entrar en el panel, no quedarse en la hamburguesa.
    const focusInside = await page.evaluate(
      () => document.querySelector("#nav-menu")?.contains(document.activeElement) ?? false,
    );
    expect(focusInside).toBe(true);

    // El panel debe ocupar 320px de ancho y TODO el alto del viewport.
    // Se comprueba porque es fácil romperlo sin darse cuenta: cualquier
    // `filter`, `backdrop-filter` o `transform` en un ancestro crea un bloque
    // contenedor y confina este `position:fixed` a la caja del navbar.
    const panel = (await menu.boundingBox())!;
    expect(panel.width).toBeCloseTo(320, 0);
    expect(panel.height).toBeCloseTo(viewport!.height, 0);
    expect(panel.y).toBeCloseTo(0, 0);
    // Scroll bloqueado mientras el panel está abierto.
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
    // Y el fondo inertizado, para que un lector de pantalla no se escape.
    await expect(page.locator("main")).toHaveAttribute("inert", "");

    await page.keyboard.press("Escape");
    await expect(menu).not.toHaveClass(/nav-menu--open/);
    await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    await expect(page.locator("main")).not.toHaveAttribute("inert", "");
  });

  test("Escape en dos etapas: primero el dropdown, luego el drawer", async ({ page, viewport }) => {
    test.skip(viewport!.width > 991, "El drawer sólo existe a ≤991");

    await page.getByRole("button", { name: "Abrir menú" }).click();
    // `exact: true` es imprescindible: por defecto getByRole busca por subcadena
    // y "Catálogo" también encajaría con el megamenú "Todo el catálogo".
    const toggle = page.getByRole("button", { name: "Catálogo", exact: true });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    // Primer Escape: cierra sólo el dropdown.
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#nav-menu")).toHaveClass(/nav-menu--open/);

    // Segundo Escape: ahora sí cierra el drawer.
    await page.keyboard.press("Escape");
    await expect(page.locator("#nav-menu")).not.toHaveClass(/nav-menu--open/);
  });

  test("el scrim cierra el drawer al hacer clic (desvío D-4)", async ({ page, viewport }) => {
    test.skip(viewport!.width > 991, "El drawer sólo existe a ≤991");

    await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(page.locator(".nav-scrim")).toBeVisible();
    // Hay que pinchar a la DERECHA de los 320px del drawer: sobre esa franja el
    // panel cubre el scrim y sería el panel quien recibiera el clic.
    await page.locator(".nav-scrim").click({ position: { x: viewport!.width - 20, y: 400 } });
    await expect(page.locator("#nav-menu")).not.toHaveClass(/nav-menu--open/);
  });
});
