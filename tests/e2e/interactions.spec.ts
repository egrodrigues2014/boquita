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

  test("el CTA Ver el catálogo navega a la tienda", async ({ page }) => {
    await page.getByRole("link", { name: "Ver el catálogo" }).click();
    await expect(page).toHaveURL(/\/tienda$/);
  });

  test("la frase editorial revela color al hacer scroll", async ({ page }) => {
    const words = page.locator(".statement-section .scroll-color-text__word");
    await expect(words).not.toHaveCount(0);
    await expect(words.first()).toHaveCSS("--reveal", "0%");

    await page.locator(".scroll-color-text__heading").evaluate((text) => {
      const top = text.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5;
      window.scrollTo(0, top);
    });
    await page.waitForFunction(() => {
      const first = document.querySelector<HTMLElement>(
        ".statement-section .scroll-color-text__word",
      );
      if (!first) return false;
      return Number.parseFloat(getComputedStyle(first).getPropertyValue("--reveal")) > 0;
    });

    const values = await words.evaluateAll((items) =>
      items.map((item) => Number.parseFloat(getComputedStyle(item).getPropertyValue("--reveal"))),
    );
    expect(new Set(values).size).toBeGreaterThan(1);
    expect(values[0]).toBeGreaterThan(values.at(-1) ?? 100);
    expect(values.filter((value) => value > 0 && value < 100).length).toBeLessThanOrEqual(1);

    await page.locator(".scroll-color-text__heading").evaluate((text) => {
      const top = text.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top);
    });
    await expect
      .poll(async () =>
        words
          .last()
          .evaluate((item) => Number.parseFloat(getComputedStyle(item).getPropertyValue("--reveal"))),
      )
      .toBeGreaterThanOrEqual(99);
  });

  test("Del horno de Ale no renderiza play ni lightbox de video", async ({ page }) => {
    await expect(page.locator(".media .play-wrap")).toHaveCount(0);
    await expect(page.locator('[data-lightbox="video"]')).toHaveCount(0);
    await expect(page.locator(".media-text-section")).toHaveCount(0);
    await expect(page.locator(".statement-dot")).toHaveCount(0);
    await expect(page.locator(".statement-photo-img")).toBeVisible();
    await expect(page.locator(".statement-photo a")).toHaveCount(0);
  });

  test("la foto de Ale aparece sin efecto de blur", async ({ page }) => {
    const photo = page.locator(".statement-photo");
    await expect(page.locator(".statement-photo-img")).toHaveCSS("filter", "none");

    await photo.scrollIntoViewIfNeeded();
    await expect(photo).toHaveClass(/is-in/);
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

  test("no monta el slider de testimonios mientras el bloque está pendiente", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.locator(".slider-mask")).toHaveCount(0);
  });

  test("la frase editorial queda revelada sin animación", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect(page.locator(".statement-section .scroll-color-text__word").first()).toHaveCSS(
      "--reveal",
      "100%",
    );
    await expect(page.locator(".statement-photo-img")).toHaveCSS("filter", "none");
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
test.describe("testimonios pendientes", () => {
  test("no muestra flechas hasta tener reseñas reales", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Ver reseñas anteriores" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Ver reseñas siguientes" })).toHaveCount(0);
  });

  test("no expone reseñas inventadas al teclado", async ({ page }) => {
    await page.keyboard.press("Tab");
    await expect(page.locator(".review-card")).toHaveCount(0);
  });

  test("no deja reseñas ocultas en el DOM para lectores de pantalla", async ({ page }) => {
    await expect(page.locator(".review-card")).toHaveCount(0);
    await expect(page.locator(".slider p.sr-only")).toHaveCount(0);
  });
});

// ── Punto 14 · navegación ──────────────────────────────────────────────────
test.describe("navegación", () => {
  test("los dropdowns de escritorio abren y cierran con teclado", async ({ page, viewport }) => {
    test.skip(viewport!.width <= 991, "A ≤991 el nav vive dentro del drawer");

    const toggle = page.getByRole("button", { name: "Ocasiones", exact: true });
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

  test("en el drawer la opción entera es pulsable, no sólo el texto", async ({ page, viewport }) => {
    test.skip(viewport!.width > 991, "El drawer sólo existe a ≤991");

    const menu = page.locator("#nav-menu");
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(menu).toHaveClass(/nav-menu--open/);
    // El panel entra con `transform 0.3s`. La clase se pone en el primer frame,
    // así que medir aquí da cajas a medio deslizar, con la x negativa. Hay que
    // esperar a que el canto izquierdo asiente en 0.
    await expect
      .poll(async () => (await menu.boundingBox())!.x, { timeout: 2000 })
      .toBeCloseTo(0, 0);

    // Catálogo es el único grupo con destino propio: en el drawer su lista sale
    // desplegada de entrada, así que sirve para medir los dos niveles a la vez.
    const grupo = page.locator(".nav-dropdown-toggle--link");
    const subenlace = page.locator(".nav-dropdown-link").first();

    const panel = (await menu.boundingBox())!;
    const filaGrupo = (await grupo.boundingBox())!;
    const filaSub = (await subenlace.boundingBox())!;

    // Alto cómodo para el dedo en los dos niveles. Lo fija `min-height`, no la
    // suma de línea y padding, para que no dependa del tamaño de fuente.
    expect(filaGrupo.height).toBeGreaterThanOrEqual(44);
    expect(filaSub.height).toBeGreaterThanOrEqual(44);

    // La fila va a sangre: si alguien devuelve el `padding: 10px 0` de antes, el
    // alto aguanta pero el realce de hover vuelve a ceñirse al texto y esto no
    // lo detecta nadie más.
    expect(filaGrupo.width).toBeCloseTo(panel.width, 0);
    // El subenlace sangra el nivel entero —fila y barra— y alinea su canto
    // derecho con el del primer nivel.
    expect(filaSub.x).toBeGreaterThan(filaGrupo.x);
    expect(filaSub.x + filaSub.width).toBeCloseTo(filaGrupo.x + filaGrupo.width, 0);

    // La sangría del TEXTO, que es distinta de la de la fila: 16px el primer
    // nivel, 34px el subítem. Sólo es medible porque la etiqueta va envuelta en
    // un `.nav-label` (que existe para poder animarla sin mover el fondo).
    const textoGrupo = (await grupo.locator(".nav-label").boundingBox())!;
    const textoSub = (await subenlace.locator(".nav-label").boundingBox())!;
    expect(textoGrupo.x - panel.x).toBeCloseTo(16, 0);
    expect(textoSub.x - panel.x).toBeCloseTo(34, 0);

    // El ✕ va en el mismo carril de 16px, por el otro lado. Sin el padding del
    // `.close-button-wrap` queda pegado al canto, porque las filas van a sangre
    // y `space-between` lo empuja hasta el borde del panel.
    const cerrar = (await page.locator(".close-button").boundingBox())!;
    const huecoDerecho = panel.x + panel.width - (cerrar.x + cerrar.width);
    expect(huecoDerecho).toBeCloseTo(16, 0);

    // El sublistado medía 320px dentro de una caja más estrecha y sacaba scroll
    // horizontal dentro del panel. Se comprueba también CON EL CURSOR ENCIMA: el
    // `translateX` + `scale` del hover amplía la región de desbordamiento, y
    // `.nav-menu` es `overflow-y: auto`, lo que hace que el eje X compute a
    // `auto`. Ya pasó una vez.
    const desborda = () => menu.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(await desborda()).toBe(false);
    await subenlace.hover();
    expect(await desborda()).toBe(false);

    // Y la prueba de fondo: un clic lejos de la etiqueta, contra el borde
    // derecho de la fila, navega igual.
    await grupo.click({ position: { x: filaGrupo.width - 12, y: filaGrupo.height / 2 } });
    await expect(page).toHaveURL(/\/tienda$/);
  });

  test("Escape en dos etapas: primero el dropdown, luego el drawer", async ({ page, viewport }) => {
    test.skip(viewport!.width > 991, "El drawer sólo existe a ≤991");

    await page.getByRole("button", { name: "Abrir menú" }).click();
    const toggle = page.getByRole("button", { name: "Ocasiones", exact: true });
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
