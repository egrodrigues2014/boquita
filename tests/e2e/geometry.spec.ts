import { expect, test, type Page } from "@playwright/test";

/**
 * Los puntos 1 a 10 del checklist §9 del spec, como aserciones ejecutables.
 *
 * Cada `test` se corresponde con un punto numerado. Los valores esperados se
 * derivan del ancho del viewport, siguiendo las mismas tablas de breakpoints del
 * spec, para que un cambio de CSS que rompa un breakpoint concreto falle sólo en
 * ese proyecto y sea evidente cuál.
 */

/** Elige el valor que corresponde al ancho actual, con la cascada del spec. */
function byWidth<T>(
  width: number,
  values: { base: T; min1280?: T; min1440?: T; min1920?: T; max991?: T; max767?: T; max479?: T },
): T {
  if (width <= 479 && values.max479 !== undefined) return values.max479;
  if (width <= 767 && values.max767 !== undefined) return values.max767;
  if (width <= 991 && values.max991 !== undefined) return values.max991;
  if (width >= 1920 && values.min1920 !== undefined) return values.min1920;
  if (width >= 1440 && values.min1440 !== undefined) return values.min1440;
  if (width >= 1280 && values.min1280 !== undefined) return values.min1280;
  return values.base;
}

async function style(page: Page, selector: string, property: string): Promise<string> {
  return page.evaluate(
    ([sel, prop]) => {
      const el = document.querySelector(sel as string);
      if (!el) throw new Error(`No existe ${sel}`);
      return getComputedStyle(el).getPropertyValue(prop as string).trim();
    },
    [selector, property],
  );
}

async function box(page: Page, selector: string) {
  const rect = await page.locator(selector).first().boundingBox();
  if (!rect) throw new Error(`Sin caja para ${selector}`);
  return rect;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // Hay que esperar a las fuentes de verdad: Cormorant Infant es mucho más
  // estrecha que su fallback Georgia, así que medir antes del swap da conteos de
  // línea equivocados en los anchos pequeños.
  //
  // Ojo: `page.evaluate(() => document.fonts.ready)` NO espera — resuelve a un
  // FontFaceSet que no es serializable. Hay que encadenar a un valor simple.
  await page.evaluate(() => document.fonts.ready.then(() => true));
});

// ── 1 ──────────────────────────────────────────────────────────────────────
test("1 · hero 100vh, imagen a sangre derecha, navbar transparente encima", async ({
  page,
  viewport,
}) => {
  const width = viewport!.width;
  const heroBox = await box(page, ".hero");
  const imgBox = await box(page, ".hero-img");

  expect(await style(page, ".navbar", "position")).toBe("absolute");

  if (width >= 992) {
    // 100vh exacto.
    expect(heroBox.height).toBeCloseTo(viewport!.height, 0);
    // A sangre en el borde derecho.
    expect(imgBox.x + imgBox.width).toBeCloseTo(width, 0);
    // Transparente sobre el hero.
    expect(await style(page, ".navbar", "background-color")).toBe("rgba(0, 0, 0, 0)");

    // Anchos del §6.1.
    const expected = byWidth(width, {
      base: 43.5,
      min1280: 46,
      min1440: 38,
      min1920: 39,
    });
    expect(imgBox.width / width).toBeCloseTo(expected / 100, 2);
  } else {
    // A ≤991 la imagen pasa a estática, a todo el ancho y con alto fijo.
    expect(await style(page, ".hero-img", "position")).toBe("static");
    expect(imgBox.width).toBeCloseTo(width, 0);
    expect(imgBox.height).toBeCloseTo(
      byWidth(width, { base: 420, max991: 420, max767: 360, max479: 320 }),
      0,
    );
    // DESVÍO D-5: aquí el nav queda sobre la foto, así que lleva fondo.
    expect(await style(page, ".navbar", "background-color")).not.toBe("rgba(0, 0, 0, 0)");
  }
});

// ── 2 ──────────────────────────────────────────────────────────────────────
test("2 · h1 del hero en 2 líneas, segunda en ámbar, 70→72→86px", async ({ page, viewport }) => {
  const width = viewport!.width;

  // La escala del spec §2.3, sin desvíos: el titular se acortó para caber en
  // ella, en vez de tocar los tamaños para que cupiera el titular.
  const fontSize = await style(page, ".h1-hero", "font-size");
  expect(fontSize).toBe(
    `${byWidth(width, { base: 70, min1440: 72, min1920: 86, max991: 52, max767: 46 })}px`,
  );

  // La segunda línea usa --gold-display (#B07208), no el dorado de relleno.
  expect(await style(page, ".text-primary", "color")).toBe("rgb(176, 114, 8)");

  // Exactamente 2 líneas de texto, garantizadas por el <br> duro.
  //
  // No se usa `getClientRects().length`: sobre un elemento de bloque devuelve
  // UNA caja, sin importar cuántas líneas de texto contenga. Con `line-height:1em`
  // en el h1, la altura dividida por el tamaño de fuente sí da el número de líneas.
  const lines = await page.locator(".h1-hero").first().evaluate((el) => {
    const size = Number.parseFloat(getComputedStyle(el).fontSize);
    return Math.round(el.clientHeight / size);
  });
  expect(lines).toBe(2);
});

// ── 3 ──────────────────────────────────────────────────────────────────────
test("3 · los dos recortes van DENTRO del flujo del h2", async ({ page }) => {
  const h2 = await box(page, ".section--no-bottom h2");
  const inline1 = await box(page, ".inline-img--1");
  const inline2 = await box(page, ".inline-img--2");

  for (const img of [inline1, inline2]) {
    // Contenidos vertical y horizontalmente en la caja del h2.
    expect(img.y).toBeGreaterThanOrEqual(h2.y - 2);
    expect(img.y + img.height).toBeLessThanOrEqual(h2.y + h2.height + 2);
    expect(img.x).toBeGreaterThanOrEqual(h2.x - 2);
    expect(img.x + img.width).toBeLessThanOrEqual(h2.x + h2.width + 2);
    // 100px de ancho, alto de una línea.
    expect(img.width).toBeCloseTo(100, 0);
  }

  expect(await style(page, ".inline-img--1", "background-image")).not.toBe("none");
  expect(await style(page, ".inline-img--2", "background-image")).not.toBe("none");
});

// ── 4 ──────────────────────────────────────────────────────────────────────
test("4 · la imagen ancha queda por encima del bloque crema", async ({ page, viewport }) => {
  const width = viewport!.width;

  expect(await style(page, ".cream-block", "margin-top")).toBe(
    `${byWidth(width, { base: -200, max991: -150, max767: -100 })}px`,
  );

  // El z-index de .wide-img es lo que hace visible el solape.
  expect(await style(page, ".wide-img", "z-index")).toBe("1");

  const wide = await box(page, ".wide-img");
  const cream = await box(page, ".cream-block");
  // La foto se extiende por debajo de donde arranca el crema.
  expect(wide.y + wide.height).toBeGreaterThan(cream.y);
});

// ── 5 ──────────────────────────────────────────────────────────────────────
test("5 · rejilla de catálogo 2×4 con 1.2fr 1fr y gaps 80/70/60", async ({ page, viewport }) => {
  const width = viewport!.width;

  expect(await page.locator(".menu-item").count()).toBe(8);

  if (width >= 768) {
    const columns = (await style(page, ".menu-grid", "grid-template-columns")).split(/\s+/);
    expect(columns).toHaveLength(2);
    const ratio = Number.parseFloat(columns[0]!) / Number.parseFloat(columns[1]!);
    expect(ratio).toBeCloseTo(1.2, 1);

    expect(await style(page, ".menu-grid", "column-gap")).toBe(
      `${byWidth(width, { base: 80, min1280: 70, min1440: 60 })}px`,
    );
    expect(await style(page, ".menu-grid", "row-gap")).toBe("30px");
  } else {
    // A ≤767 pasa a lista vertical, con nombre y precio a los extremos.
    expect(await style(page, ".menu-grid", "flex-direction")).toBe("column");
    expect(await style(page, ".menu-item-head", "justify-content")).toBe("space-between");
  }
});

// ── 6 ──────────────────────────────────────────────────────────────────────
test("6 · la imagen de servicio sobresale 130/170px con margen compensatorio", async ({
  page,
  viewport,
}) => {
  const width = viewport!.width;
  const overhang = byWidth(width, { base: -130, min1280: -170, max991: 0 });

  expect(await style(page, ".section--overlap-up", "margin-bottom")).toBe(`${overhang}px`);
  expect(await style(page, ".service-img", "top")).toBe(
    // A ≤991 la imagen ya no sobresale, pero el `top` del spec sigue siendo -130.
    `${byWidth(width, { base: -130, min1280: -170 })}px`,
  );
  expect(await style(page, ".section--overlap-up", "padding-bottom")).toBe("0px");
});

// ── 7 ──────────────────────────────────────────────────────────────────────
test("7 · las dos filas de galería desbordan y están recortadas", async ({ page }) => {
  // Las fotos de galería son `loading="lazy"` y viven bajo el pliegue: hay que
  // traerlas al viewport y esperar a que carguen ANTES de medir. Sin esto los
  // items no tienen tamaño y la tira parece caber sin desbordar.
  await page.locator(".gallery").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const imgs = [...document.querySelectorAll<HTMLImageElement>(".gallery-img")];
    return imgs.length > 0 && imgs.every((img) => img.complete && img.naturalWidth > 0);
  });

  expect(await style(page, ".scroller", "overflow")).toBe("hidden");

  for (const row of [1, 2]) {
    const items = await page.locator(`.track--${row} .gallery-item`).count();
    // 7 por fila: es lo que produce el desborde de ~161%.
    expect(items).toBe(7);

    const overflow = await page
      .locator(`.track--${row}`)
      .evaluate((el) => el.scrollWidth / (el.parentElement as HTMLElement).clientWidth);
    expect(overflow).toBeGreaterThan(1.3);
  }

  // Offsets estáticos opuestos: la base del movimiento en direcciones contrarias.
  expect(await style(page, ".track--1", "left")).not.toBe(await style(page, ".track--2", "left"));

  // Sólo 8 URL únicas para 14 elementos: las repetidas comparten petición.
  const unique = await page.locator(".gallery-img").evaluateAll(
    (imgs) => new Set(imgs.map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src)).size,
  );
  expect(unique).toBe(8);
});

// ── 8 ──────────────────────────────────────────────────────────────────────
test("8 · tarjetas crema con min-height y flechas circulares alineadas al titular", async ({
  page,
  viewport,
}) => {
  const width = viewport!.width;

  expect(await page.locator(".review-card").count()).toBe(6);

  expect(await style(page, ".review-card", "min-height")).toBe(
    `${byWidth(width, { base: 420, min1280: 398, max991: 393, max767: 312, max479: 420 })}px`,
  );

  // Flechas: 34×34 y redondeadas.
  const arrow = await box(page, ".slider-arrow--right");
  expect(arrow.width).toBeCloseTo(34, 0);
  expect(arrow.height).toBeCloseTo(34, 0);
  expect(await style(page, ".slider-arrow--right", "border-radius")).toBe("50px");

  // La línea de 160×1. A ≥992 va a `top:17px`, o sea centrada con las flechas
  // (34/2). A ≤991 el spec la baja a `top:57px`: ahí deja de conectarlas, y es
  // intencionado.
  const line = await box(page, ".slider-line");
  expect(line.height).toBeCloseTo(1, 0);
  if (width > 479) {
    expect(line.width).toBeCloseTo(160, 0);
    expect(line.y).toBeCloseTo(arrow.y + (width <= 991 ? 57 : 17), 1);
  }

  // Avatares 70×70 y SIN redondear.
  const avatar = await box(page, ".review-avatar");
  expect(avatar.width).toBeCloseTo(70, 0);
  expect(avatar.height).toBeCloseTo(70, 0);
  expect(await style(page, ".review-avatar", "border-radius")).toBe("0px");

  // Las tarjetas no llevan radio ni sombra.
  expect(await style(page, ".review-card", "border-radius")).toBe("0px");
  expect(await style(page, ".review-card", "box-shadow")).toBe("none");
});

// ── 9 ──────────────────────────────────────────────────────────────────────
test("9 · la tarjeta CTA flota a caballo entre el blanco y el bloque oscuro", async ({
  page,
  viewport,
}) => {
  const width = viewport!.width;

  expect(await style(page, ".footer-dark", "margin-top")).toBe(
    `${byWidth(width, { base: -198, max767: -258 })}px`,
  );

  const card = await box(page, ".cta-card");
  const dark = await box(page, ".footer-dark");

  // El borde superior del bloque oscuro cae DENTRO de la tarjeta.
  expect(dark.y).toBeGreaterThan(card.y);
  expect(dark.y).toBeLessThan(card.y + card.height);

  expect(await style(page, ".cta-card", "z-index")).toBe("1");

  // El bloque tiene que ser OSCURO de verdad. Este test comprobaba el solape y
  // el z-index pero no el color, y el pie estuvo BLANCO desde la Fase 1: el
  // elemento re-declara `--text-dark: #ffffff` para invertir su tinta, y su
  // propio `background: var(--text-dark)` resolvía a blanco. Lo encontró axe.
  expect(await style(page, ".footer-dark", "background-color")).toBe("rgb(58, 42, 26)");
  // Y la tarjeta crema encima debe seguir siendo crema, no heredar la inversión.
  expect(await style(page, ".cta-card", "background-color")).toBe("rgb(250, 245, 236)");

  // La tarjeta NO debe estar dentro de .footer-dark: si lo estuviera heredaría
  // los tokens de tinta invertidos y perdería el contraste.
  const nested = await page
    .locator(".cta-card")
    .evaluate((el) => !!el.closest(".footer-dark"));
  expect(nested).toBe(false);
});

// ── 10 ─────────────────────────────────────────────────────────────────────
test("10 · newsletter de 560px con input transparente y botón ámbar", async ({
  page,
  viewport,
}) => {
  const width = viewport!.width;

  const form = await box(page, ".newsletter-form");
  if (width >= 768) {
    expect(form.width).toBeCloseTo(560, 0);
  }

  const input = await box(page, ".newsletter-form .input");
  expect(input.height).toBeCloseTo(60, 0);
  expect(await style(page, ".newsletter-form .input", "background-color")).toBe("rgba(0, 0, 0, 0)");
  expect(await style(page, ".newsletter-form .input", "border-top-color")).toBe("rgb(255, 255, 255)");

  // El botón es relleno dorado con etiqueta MARRÓN (desvío D-0).
  //
  // Esta aserción decía «blanca», codificando el propio bug: dentro de
  // `.footer-dark`, `--text-dark` está invertido a blanco y `.btn` lo usaba para
  // su etiqueta → 2.08:1 sobre el dorado. Ahora usa `--on-gold`, que no se
  // invierte en ningún ámbito.
  expect(await style(page, ".btn--footer", "background-color")).toBe("rgb(232, 168, 27)");
  expect(await style(page, ".btn--footer", "color")).toBe("rgb(58, 42, 26)");
});

// ── Contenedor ─────────────────────────────────────────────────────────────
test("el contenedor da 1170px de contenido real", async ({ page, viewport }) => {
  const width = viewport!.width;
  const container = await box(page, ".cream-block .container");
  const expected = Math.min(1200, width) - 30;
  expect(container.width - 30).toBeCloseTo(Math.min(1170, expected), 0);
});
