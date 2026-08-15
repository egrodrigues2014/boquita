import { type Page, expect, test } from "@playwright/test";

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

  test("el CTA principal abre el pedido directo en WhatsApp", async ({ page }) => {
    const cta = page.locator(".hero").getByRole("link", { name: "Pedir por WhatsApp" });
    await expect(cta).toHaveAttribute(
      "href",
      /^https:\/\/api\.whatsapp\.com\/send\?phone=50671322355&text=/,
    );
    await expect(cta).toHaveAttribute("target", "_blank");
    await expect(cta).toHaveAttribute("rel", "noopener noreferrer");
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

  test("el relleno está completo cuando la foto llega a la cabecera", async ({
    page,
    viewport,
  }) => {
    test.skip(
      viewport!.width < 992,
      "apilado, la foto va encima del texto y no comparten borde superior",
    );

    const words = page.locator(".statement-section .scroll-color-text__word");

    /**
     * Primero se deja aterrizar la entrada. No es ceremonia: sin revelar, la
     * celda está a `translate3d(0,100px,0)` y `getBoundingClientRect()` lo
     * incluye, así que el destino se calcularía 100px más abajo de donde la foto
     * acaba de verdad — y el `waitForFunction` de abajo no se cumpliría nunca.
     */
    await page.locator(".statement-photo").scrollIntoViewIfNeeded();
    await expect(page.locator(".statement-photo")).toHaveCSS("transform", "none");
    await expect(page.locator(".statement-story")).toHaveCSS("transform", "none");

    // La cabecera es `position: fixed` y tapa `--header-h`. Al llegar ahí el
    // borde superior de la foto, el teñido tiene que estar hecho — con holgura,
    // porque el recorrido acaba 80px antes (HEADER_LEAD en ScrollColorText).
    await page.evaluate(() => {
      const photo = document.querySelector(".statement-photo")!;
      const headerH = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
      );
      window.scrollTo(0, photo.getBoundingClientRect().top + window.scrollY - headerH);
    });

    // `scroll-behavior: smooth` (02-reset.css) ANIMA el salto: leer al frame
    // siguiente devuelve el estado de partida, no el de destino.
    await page.waitForFunction(() => {
      const photo = document.querySelector(".statement-photo")!.getBoundingClientRect();
      const headerH = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
      );
      return Math.abs(photo.top - headerH) < 2;
    });

    const values = await words.evaluateAll((items) =>
      items.map((item) => Number.parseFloat(getComputedStyle(item).getPropertyValue("--reveal"))),
    );
    expect(Math.min(...values)).toBeGreaterThanOrEqual(99);
  });

  test("la foto y el texto suben con el mismo gesto y a la vez", async ({ page }) => {
    // Se comparan ENTRE SÍ y no contra literales: lo que se exige es que sean el
    // mismo gesto, no un valor concreto. Antes el <p> subía en 0.95s/120ms por su
    // cuenta y el <h2> no subía en absoluto.
    const gesto = (selector: string) =>
      page.evaluate((sel) => {
        const cs = getComputedStyle(document.querySelector(sel)!);
        return {
          property: cs.transitionProperty,
          duration: cs.transitionDuration,
          delay: cs.transitionDelay,
        };
      }, selector);

    expect(await gesto(".statement-story")).toEqual(await gesto(".statement-photo"));

    // El párrafo ya no lleva revelado propio: lo sube la celda entera, con el
    // titular dentro. Si vuelve a aparecer, se puede volver a desincronizar.
    await expect(page.locator(".scroll-color-text__body.reveal")).toHaveCount(0);

    await page.locator(".statement-photo").scrollIntoViewIfNeeded();
    await expect(page.locator(".statement-photo")).toHaveClass(/is-in/);
    await expect(page.locator(".statement-story")).toHaveClass(/is-in/);
  });

  test("Del horno de Ale no renderiza play ni lightbox de video", async ({ page }) => {
    await expect(page.locator(".media .play-wrap")).toHaveCount(0);
    await expect(page.locator('[data-lightbox="video"]')).toHaveCount(0);
    await expect(page.locator(".media-text-section")).toHaveCount(0);
    await expect(page.locator(".statement-dot")).toHaveCount(0);
    await expect(page.locator(".statement-photo-img")).toBeVisible();
    await expect(page.locator(".statement-photo-img")).toHaveAttribute(
      "src",
      /queque-de-zanahoria/,
    );
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
      page.locator(".track--1").first().evaluate((el) => getComputedStyle(el).transform);

    const before = await read();
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
    expect(await read()).toBe(before);
  });

  test("el slider de testimonios salta de tarjeta sin deslizarse", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();

    // El slider sigue funcionando: lo que se apaga es el deslizamiento, no la
    // navegación. Lo neutraliza el kill-switch de 99-a11y.css.
    await expect(page.locator(".slider-mask")).toHaveCSS("transition-duration", "0s");
    await page.getByRole("button", { name: "Ver reseñas siguientes" }).click();
    await expect(page.locator(".slider-mask")).toHaveCSS("--i", "1");
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

  test("detiene el carrusel de productos", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/sobre-nosotros");

    const disc = page.locator(".product-wheel__disc");
    await expect(disc).toHaveCSS("animation-name", "none");
    await expect(disc).toHaveCSS("will-change", "auto");
  });

  test("el drawer cambia de estado sin desplazarse", async ({ page, viewport }) => {
    test.skip(viewport!.width > 991, "El drawer sólo existe a ≤991");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();

    const menu = page.locator("#nav-menu");
    const chevron = page.locator("#nav-menu .nav-chevron");
    await expect(menu).toHaveCSS("transition-duration", "0s");
    await expect(chevron).toHaveCSS("transition-duration", "0s");

    await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(menu).toHaveClass(/nav-menu--open/);
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
    const firstTrack = page.locator(".track--1").first();
    await expect(firstTrack).not.toHaveClass(/is-animating/);

    await page.locator(".gallery").scrollIntoViewIfNeeded();
    await expect(firstTrack).toHaveClass(/is-animating/);
    await expect(firstTrack).toHaveCSS("will-change", "transform");
  });
});

// ── Punto 8 · slider ───────────────────────────────────────────────────────
/**
 * El componente cliente inyecta UN entero (`--i`) y el resto de la aritmética
 * vive en CSS. Por eso estos tests leen `--i` y no el `transform` resuelto:
 * medir píxeles aquí sería medir el `calc()` del CSS, no la navegación.
 */
test.describe("slider de testimonios", () => {
  const anteriores = (page: Page) => page.getByRole("button", { name: "Ver reseñas anteriores" });
  const siguientes = (page: Page) => page.getByRole("button", { name: "Ver reseñas siguientes" });

  test.beforeEach(async ({ page }) => {
    await page.locator(".slider").scrollIntoViewIfNeeded();

    // Esperar a la hidratación ANTES de tocar nada. El servidor ya pinta las
    // flechas con su `aria-disabled` correcto, así que un test que sólo mire el
    // atributo pasa sin que el JavaScript haya llegado — y el clic siguiente se
    // perdería sin handler. `--i` es lo primero que escribe el componente al
    // montarse, así que es la señal de que el slider está vivo.
    await expect(page.locator(".slider-mask")).toHaveCSS("--i", "0");
  });

  test("la flecha derecha avanza una tarjeta", async ({ page }) => {
    const mask = page.locator(".slider-mask");

    await siguientes(page).click();
    await expect(mask).toHaveCSS("--i", "1");
    await expect(anteriores(page)).toHaveAttribute("aria-disabled", "false");
  });

  /**
   * UI-031 / D-21. Las flechas usan `aria-disabled` y NO `disabled`, porque al
   * deshabilitar un elemento que tiene el foco el navegador lo manda al <body>
   * y quien navega con teclado pierde el anclaje. La contrapartida es que
   * `aria-disabled` no deshabilita nada por su cuenta: es una promesa que
   * cumple el handler. Esto fija la promesa, igual que `tienda.spec.ts` hace
   * con los steppers.
   */
  /**
   * UI-031 / D-21. Que Playwright no pueda pulsar este botón con un `click()`
   * normal ya dice algo: considera `aria-disabled="true"` como no accionable, o
   * sea que la semántica se está anunciando bien. Lo que se comprueba aquí es lo
   * otro: que si alguien lo activa igualmente —puntero, Enter, un lector de
   * pantalla—, el handler no haga nada y el foco se quede donde estaba.
   *
   * ⚠ Se usa `dispatchEvent("click")` y NO `click({ force: true })`, y no es
   * cosmético. `force` desactiva la comprobación de blanco: el clic se manda a
   * unas coordenadas, y si el layout se movió entremedias —el reveal, el rAF del
   * parallax, una imagen que termina de cargar más arriba— aterriza en lo que
   * haya ahí. Con esta página eso significaba caer en un `.gallery-item` de la
   * fila de encima y **navegar a una ficha de producto**: el test fallaba 1 de 8
   * bajo carga con «element(s) not found», porque ya no estaba en la portada.
   * `dispatchEvent` va al elemento directamente, sin coordenadas ni hit-testing.
   * `tienda.spec.ts:670` usa `force` para lo mismo y es la causa probable del
   * intermitente que `ESTADO.md` tiene anotado ahí.
   */
  test("la izquierda nace apagada y al pulsarla no pasa nada", async ({ page }) => {
    await expect(anteriores(page)).toHaveAttribute("aria-disabled", "true");

    await anteriores(page).focus();
    await anteriores(page).dispatchEvent("click");

    await expect(page.locator(".slider-mask")).toHaveCSS("--i", "0");
    // El foco sigue en el botón: con `disabled` real el navegador lo habría
    // mandado al <body>, que es justo lo que la decisión documentada evita.
    await expect(anteriores(page)).toBeFocused();
  });

  test("End y Home llevan a los extremos", async ({ page, viewport }) => {
    const mask = page.locator(".slider-mask");
    const porVista = viewport!.width >= 992 ? 3 : viewport!.width >= 768 ? 2 : 1;

    await siguientes(page).focus();
    await page.keyboard.press("End");
    // 6 reseñas: el último índice es 6 − las que caben a la vez.
    await expect(mask).toHaveCSS("--i", String(6 - porVista));
    await expect(siguientes(page)).toHaveAttribute("aria-disabled", "true");

    await page.keyboard.press("Home");
    await expect(mask).toHaveCSS("--i", "0");
  });

  test("anuncia el rango visible a los lectores de pantalla", async ({ page, viewport }) => {
    const porVista = viewport!.width >= 992 ? 3 : viewport!.width >= 768 ? 2 : 1;
    const aviso = page.locator(".slider p.sr-only");

    await expect(aviso).toHaveText(`Mostrando reseñas 1 a ${porVista} de 6`);
    await siguientes(page).click();
    await expect(aviso).toHaveText(`Mostrando reseñas 2 a ${porVista + 1} de 6`);
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

    // El panel adopta los 325px de la guía, sin superar nunca el viewport, y
    // ocupa TODO el alto disponible.
    // Se comprueba porque es fácil romperlo sin darse cuenta: cualquier
    // `filter`, `backdrop-filter` o `transform` en un ancestro crea un bloque
    // contenedor y confina este `position:fixed` a la caja del navbar.
    const panel = (await menu.boundingBox())!;
    expect(panel.width).toBeCloseTo(Math.min(325, viewport!.width), 0);
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

    // Los grupos con destino propio (Catálogo y Sobre nosotros) salen en el
    // drawer con su lista ya desplegada, así que sirven para medir los dos
    // niveles a la vez. Se toma el primero, que es Catálogo.
    const grupo = page.locator(".nav-dropdown-toggle--link").first();
    const subenlace = page.locator(".nav-dropdown-link").first();
    await expect(grupo).toHaveAttribute("aria-expanded", "true");

    const panel = (await menu.boundingBox())!;
    const filaGrupo = (await grupo.boundingBox())!;
    const filaSub = (await subenlace.boundingBox())!;

    // Alto cómodo para el dedo en los dos niveles. Lo fija `min-height`, no la
    // suma de línea y padding, para que no dependa del tamaño de fuente.
    expect(filaGrupo.height).toBeCloseTo(48, 0);
    expect(filaSub.height).toBeGreaterThanOrEqual(44);

    // El carril exterior es de 24px a cada lado; padre y subítem comparten caja
    // para que fondos y radios queden alineados.
    expect(filaGrupo.width).toBeCloseTo(panel.width - 48, 0);
    expect(filaSub.x).toBeCloseTo(filaGrupo.x, 0);
    expect(filaSub.width).toBeCloseTo(filaGrupo.width, 0);

    // Ambos textos caen a 64px del borde del ítem: 8+48+8 en el padre y 40+24
    // en el subítem. Respecto al panel son 24+64 = 88px.
    const textoGrupo = (await grupo.locator(".nav-label").boundingBox())!;
    const textoSub = (await subenlace.locator(".nav-label").boundingBox())!;
    expect(textoGrupo.x - filaGrupo.x).toBeCloseTo(64, 0);
    expect(textoSub.x - filaSub.x).toBeCloseTo(64, 0);
    expect(textoGrupo.x - panel.x).toBeCloseTo(88, 0);
    expect(textoSub.x - panel.x).toBeCloseTo(88, 0);

    // El cierre ocupa un blanco táctil de 48px y respeta el carril de 24px.
    const cerrar = (await page.locator(".close-button").boundingBox())!;
    const huecoDerecho = panel.x + panel.width - (cerrar.x + cerrar.width);
    expect(cerrar.width).toBeCloseTo(48, 0);
    expect(cerrar.height).toBeCloseTo(48, 0);
    expect(huecoDerecho).toBeCloseTo(24, 0);

    // El sublistado medía más que su caja y sacaba scroll
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

  test("la iconografía del drawer es decorativa y el chevron refleja el estado", async ({
    page,
    viewport,
  }) => {
    await page.goto("/");

    const iconosPrincipales = page.locator("#nav-menu .nav-item-icon");
    const iconosSecundarios = page.locator("#nav-menu .nav-subitem-icon");

    await expect(iconosPrincipales).toHaveCount(4);
    await expect(iconosSecundarios).toHaveCount(18);
    await expect(iconosPrincipales.first()).toHaveAttribute("aria-hidden", "true");
    await expect(iconosSecundarios.first()).toHaveAttribute("focusable", "false");

    if (viewport!.width > 991) {
      await expect(iconosPrincipales.first()).toBeHidden();
      await expect(page.locator("#nav-menu .nav-chevron")).toBeHidden();
      return;
    }

    await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(iconosPrincipales.first()).toBeVisible();

    const toggle = page.getByRole("button", { name: "Ocasiones", exact: true });
    const chevron = toggle.locator(".nav-chevron");
    await expect(chevron).toHaveAttribute("aria-hidden", "true");
    await expect(chevron).toHaveCSS("transform", "none");

    const colores = await toggle.evaluate((element) => {
      const icono = element.querySelector(".nav-item-icon")!;
      return [getComputedStyle(element).color, getComputedStyle(icono).color];
    });
    expect(colores[1]).toBe(colores[0]);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(chevron).not.toHaveCSS("transform", "none");
  });

  test("el drawer permite alcanzar el último enlace sin desplazar la página", async ({
    page,
    viewport,
  }) => {
    test.skip(viewport!.width > 991, "El drawer sólo existe a ≤991");
    await page.getByRole("button", { name: "Abrir menú" }).click();

    const menu = page.locator("#nav-menu");
    const ultimo = menu.getByRole("link", { name: "Escríbeme", exact: true });
    await ultimo.scrollIntoViewIfNeeded();
    await expect(ultimo).toBeVisible();
    expect(await menu.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
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

  test("la etiqueta «Sobre nosotros» del nav lleva a su página", async ({ page, viewport }) => {
    // La regresión que este test existe para cazar: el grupo no llevaba `href`,
    // así que `Dropdown` lo pintaba como <button> y el clic sólo abría el panel.
    // La página respondía 200 y era inalcanzable desde su propia etiqueta.
    if (viewport!.width <= 991) {
      await page.getByRole("button", { name: "Abrir menú" }).click();
      await expect(page.locator("#nav-menu")).toHaveClass(/nav-menu--open/);
    }

    // Acotado a `#nav-menu`: el pie tiene otro enlace con la misma etiqueta.
    await page
      .locator("#nav-menu")
      .getByRole("link", { name: "Sobre nosotros", exact: true })
      .click();
    await expect(page).toHaveURL(/\/sobre-nosotros$/);
    await expect(page.locator("h1")).toHaveText("Un bocado de felicidad");
  });
});
