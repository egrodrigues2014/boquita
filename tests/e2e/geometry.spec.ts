import { expect, test, type Page } from "@playwright/test";

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

/**
 * Dónde cae el TRAZO del statement, no su caja de línea.
 *
 * El reparto del statement alinea el alto de mayúscula del titular con el borde
 * superior de la foto y la línea base de la última línea del cuerpo con el
 * inferior; entre uno y otro hay un medio-espacio de línea que se recorta con
 * margen negativo (12-statement.css). Medir cajas dejaría pasar un recorte mal
 * puesto: la caja cuadra igual, y lo que se ve descuadrado es la letra.
 *
 * Cap-height y línea base se sacan de las métricas de la fuente vía canvas, que
 * es de donde salieron los números del CSS.
 */
async function statementInk(page: Page) {
  return page.evaluate(() => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    const setFont = (node: Element) => {
      const cs = getComputedStyle(node);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      return Number.parseFloat(cs.lineHeight);
    };

    const heading = document.querySelector(".scroll-color-text__heading")!;
    const headingLh = setFont(heading);
    const hm = ctx.measureText("Hxp");
    const capHeight = ctx.measureText("H").actualBoundingBoxAscent;
    const headingBox = heading.getBoundingClientRect();
    const capTop =
      headingBox.top +
      (headingLh - (hm.fontBoundingBoxAscent + hm.fontBoundingBoxDescent)) / 2 +
      (hm.fontBoundingBoxAscent - capHeight);

    const body = document.querySelector(".scroll-color-text__body")!;
    const bodyLh = setFont(body);
    const bm = ctx.measureText("Hxp");
    const bodyBox = body.getBoundingClientRect();
    const lastBaseline =
      bodyBox.bottom -
      bodyLh +
      (bodyLh - (bm.fontBoundingBoxAscent + bm.fontBoundingBoxDescent)) / 2 +
      bm.fontBoundingBoxAscent;

    return { capTop, lastBaseline };
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready.then(() => true));
});

test("hero ocupa la primera pantalla con imagen full-bleed", async ({ page, viewport }) => {
  const hero = await box(page, ".hero");
  const image = await box(page, ".hero-img");

  expect(hero.height).toBeCloseTo(viewport!.height, 0);
  expect(await style(page, ".hero-img", "position")).toBe("absolute");
  expect(await style(page, ".hero-img", "object-fit")).toBe("cover");
  expect(image.x).toBeLessThanOrEqual(0);
  expect(image.x + image.width).toBeGreaterThanOrEqual(viewport!.width);
});

test("marca, promesa y CTA permanecen dentro del primer viewport", async ({ page }) => {
  const heading = page.getByRole("heading", { level: 1 });
  const tagline = page.locator(".hero-tagline");
  const actions = page.locator(".hero .btn-group");

  await expect(heading).toHaveCount(1);
  await expect(heading).toHaveText("Boquita");
  await expect(tagline).toHaveText("Pequeños bocados. Grandes momentos.");
  await expect(actions).toHaveCSS("transform", "none");

  const wordmark = heading.locator(".hero-brand__art");
  await expect(wordmark).toHaveAttribute("src", "/img/brand/wordmark-boquita-white.svg");
  await expect(wordmark).toHaveAttribute("alt", "");
  await expect(wordmark).toHaveAttribute("aria-hidden", "true");
  expect(await style(page, ".hero-brand", "text-transform")).toBe("none");

  const hero = await box(page, ".hero");
  const content = await box(page, ".hero-content");
  expect(content.y).toBeGreaterThanOrEqual(hero.y);
  expect(content.y + content.height).toBeLessThanOrEqual(hero.y + hero.height + 1);

  const heroRegion = page.locator(".hero");
  await expect(heroRegion.getByRole("link", { name: "Pedir por WhatsApp" })).toBeInViewport();
  await expect(heroRegion.getByRole("link", { name: "Ver el catálogo" })).toBeInViewport();
});

test("statement usa foto izquierda y texto con revelado", async ({ page, viewport }) => {
  await page.locator(".statement-photo").scrollIntoViewIfNeeded();
  await expect(page.locator(".statement-photo")).toHaveClass(/is-in/);
  await expect(page.locator(".statement-photo")).toHaveCSS("transform", "none");

  // La columna de texto TAMBIÉN sube ahora, y con la entrada en vuelo su caja va
  // desplazada 100px: medir ahí daría un número distinto en cada pasada.
  await expect(page.locator(".statement-story")).toHaveClass(/is-in/);
  await expect(page.locator(".statement-story")).toHaveCSS("transform", "none");

  const titleText = await page
    .locator(".scroll-color-text__heading .scroll-color-text__base")
    .evaluateAll((items) => items.map((item) => item.textContent).join(" "));
  expect(titleText).toContain("Del horno de Ale");
  expect(titleText).toContain("a tu mesa");

  const bodyText = await page
    .locator(".scroll-color-text__body .scroll-color-text__base")
    .evaluateAll((items) => items.map((item) => item.textContent).join(" "));
  expect(bodyText).toContain(
    "Ale Budowski hornea en su",
  );
  expect(bodyText).toContain(
    "pequeñas y el sabor de lo hecho a mano.",
  );
  await expect(page.locator(".statement-dot")).toHaveCount(0);
  await expect(page.locator(".statement-photo-img")).toBeVisible();
  await expect(page.locator(".statement-photo-img")).toHaveAttribute(
    "src",
    /queque-de-zanahoria/,
  );
  await expect(page.locator(".media-text-section")).toHaveCount(0);
  expect(await style(page, ".statement-section", "background-color")).toBe("rgb(255, 255, 255)");
  expect(await style(page, ".statement-photo-img", "filter")).toBe("none");
  const bodySize = Number.parseFloat(
    await style(page, ".scroll-color-text__body", "font-size"),
  );
  const bodyLineHeight = Number.parseFloat(
    await style(page, ".scroll-color-text__body", "line-height"),
  );
  if (viewport!.width >= 992) {
    // A dos columnas el cuerpo crece para LLENAR la banda bajo el titular
    // (desvío D-35): `clamp(22px, 1.8vw, 26px)`. 26px fijos no caben abajo —
    // medido, a 992 pedirían 6 líneas y el interlineado se iría a 0,91em.
    expect(bodySize).toBeGreaterThanOrEqual(22);
    expect(bodySize).toBeLessThanOrEqual(26);
  } else {
    // Apilado no hay banda que llenar: se queda en el 18px del spec §2.3.
    expect(bodySize).toBe(18);
  }
  expect(bodyLineHeight).toBeGreaterThan(30);

  const titleLine = await box(page, ".scroll-color-text__heading");
  const copy = await box(page, ".scroll-color-text__body");
  expect(copy.y).toBeGreaterThan(titleLine.y + titleLine.height);

  // Titular y cuerpo van CENTRADOS a todos los anchos, no alineados a la
  // izquierda ni justificados. Fuera del if/else a propósito: es la misma regla
  // base para los dos casos, y tenerla duplicada en las dos ramas invitaba a que
  // una se quedara atrás.
  expect(await style(page, ".scroll-color-text__heading", "text-align")).toBe("center");
  expect(await style(page, ".scroll-color-text__body", "text-align")).toBe("center");

  const photo = await box(page, ".statement-photo");
  if (viewport!.width >= 992) {
    expect(photo.x + photo.width).toBeLessThan(titleLine.x);
    expect(Math.abs((photo.y + photo.height / 2) - (titleLine.y + titleLine.height / 2))).toBeLessThan(
      180,
    );

    // El texto se reparte en la ALTURA DE LA FOTO: mayúsculas del titular a ras
    // del borde superior, línea base de la última línea a ras del inferior.
    const ink = await statementInk(page);
    expect(Math.abs(ink.capTop - photo.y)).toBeLessThan(4);
    expect(Math.abs(ink.lastBaseline - (photo.y + photo.height))).toBeLessThan(4);

    /**
     * Y el párrafo LLENA la banda: entre el titular y el texto sólo cabe el
     * `margin-top` de 28px, sin agujero.
     *
     * Esto es lo que se rompió al introducir `space-between`: con 3 líneas de
     * 18px sobraban hasta 133px y toda la holgura se iba a ese hueco. Medir sólo
     * la línea base de abajo no lo detecta — cuadra igual con el agujero puesto.
     */
    const hueco = copy.y - (titleLine.y + titleLine.height);
    expect(hueco).toBeGreaterThan(20);
    expect(hueco).toBeLessThan(36);

    // Y el interlineado calculado no se ha ido a un tope: `data-fit` sólo
    // aparece cuando el relleno deja de ser exacto.
    await expect(page.locator(".scroll-color-text__body[data-fit]")).toHaveCount(0);
  } else {
    expect(titleLine.y).toBeGreaterThan(photo.y + photo.height);
  }
});

test("imagen ancha vive en banda blanca y catalogo conserva banda crema", async ({ page }) => {
  expect(await style(page, ".overlap-wrapper", "background-color")).toBe("rgb(250, 245, 236)");
  expect(await style(page, ".wide-img-block", "background-color")).toBe("rgb(255, 255, 255)");
  expect(await style(page, ".cream-block", "background-color")).toBe("rgb(250, 245, 236)");
  const band = await box(page, ".wide-img-block");
  const wide = await box(page, ".wide-img");
  const cream = await box(page, ".cream-block");
  expect(wide.y).toBeGreaterThanOrEqual(band.y);
  expect(wide.y + wide.height).toBeGreaterThan(cream.y);
  expect(wide.x + wide.width / 2).toBeCloseTo(band.x + band.width / 2, 1);
});

test("catalogo mantiene la rejilla editorial de 8 productos", async ({ page, viewport }) => {
  await expect(page.locator(".menu-item")).toHaveCount(8);

  if (viewport!.width >= 768) {
    const columns = (await style(page, ".menu-grid", "grid-template-columns")).split(/\s+/);
    expect(columns).toHaveLength(2);
    const ratio = Number.parseFloat(columns[0]!) / Number.parseFloat(columns[1]!);
    expect(ratio).toBeCloseTo(1.2, 1);
  } else {
    expect(await style(page, ".menu-grid", "flex-direction")).toBe("column");
  }
});

test("sobre Boquita empieza alineado con su foto", async ({ page, viewport }) => {
  const section = await box(page, ".section--overlap-up");
  const image = await box(page, ".service-img");

  expect(await style(page, ".section--overlap-up", "background-color")).toBe("rgb(255, 255, 255)");
  expect(await style(page, ".service-img", "top")).toBe("0px");
  if (viewport!.width >= 992) {
    expect(image.y).toBeGreaterThan(section.y);
    expect(await style(page, ".section--overlap-up", "margin-bottom")).toBe("0px");
    const copy = await box(page, ".service-copy");
    const imageCenter = image.y + image.height / 2;
    const copyCenter = copy.y + copy.height / 2;
    expect(Math.abs(imageCenter - copyCenter)).toBeLessThan(80);
  }
});

/**
 * La portada usa un solo ritmo entre contenidos consecutivos. Antes el corte
 * catálogo -> servicio sumaba 170px de crema y 112px de blanco (282px), y el
 * de testimonios -> footer necesitaba conservar una banda blanca explícita.
 * Medir sólo cada regla por separado dejaría regresar esas sumas o perder el
 * cambio de superficie, así que aquí se comparan cajas reales entre bloques.
 */
test("todos los espacios entre secciones de Home comparten el mismo ritmo", async ({ page }) => {
  await page.evaluate(() => document.documentElement.classList.add("reveal-all"));
  await page.locator(".footer").scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.images].every((image) => image.complete && image.naturalWidth > 0),
  );
  await expect(page.locator(".gallery-section h2")).toHaveCSS("transform", "none");
  await expect(page.locator(".testimonials-section h2")).toHaveCSS("transform", "none");

  const medidas = await page.evaluate(() => {
    const rect = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`No existe ${selector}`);
      const box = element.getBoundingClientRect();
      return { top: box.top + scrollY, bottom: box.bottom + scrollY };
    };
    const gap = (from: string, to: string) => rect(to).top - rect(from).bottom;
    const statement = document.querySelector(".statement-section")!;

    return {
      // Una custom property conserva `clamp(...)` como tokens; el padding del
      // statement es su resolución real en píxeles para este viewport.
      ritmo: Number.parseFloat(getComputedStyle(statement).paddingTop),
      huecos: {
        heroStatement: gap(".hero", ".statement-media-layout"),
        statementCatalogo: gap(".statement-media-layout", ".wide-img"),
        catalogoServicio: gap(".menu-layout", ".service-grid"),
        servicioGaleria: gap(".service-grid", ".gallery-section h2"),
        galeriaTestimonios: gap(".gallery", ".testimonials-section h2"),
        // La separación final acaba donde empieza el fondo marrón. El padding
        // oscuro posterior pertenece al layout interno del footer.
        testimoniosFooter: gap(".slider", ".footer"),
      },
    };
  });

  expect(medidas.ritmo, "falta --home-section-gap").toBeGreaterThan(0);
  for (const [corte, hueco] of Object.entries(medidas.huecos)) {
    expect(hueco, `el corte ${corte} no sigue el ritmo de Home`).toBeCloseTo(medidas.ritmo, 0);
  }
});

test("galeria desborda horizontalmente", async ({ page }) => {
  await page.locator(".gallery").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const imgs = [...document.querySelectorAll<HTMLImageElement>(".gallery-img")];
    return imgs.length > 0 && imgs.every((img) => img.complete && img.naturalWidth > 0);
  });

  expect(await style(page, ".scroller", "overflow")).toBe("hidden");
  await expect(page.locator(".gallery-row")).toHaveCount(6);
  for (let row = 0; row < 6; row++) {
    const track = page.locator(".gallery-row").nth(row).locator(".track");
    await expect(track.locator(".gallery-item")).toHaveCount(7);
    const overflow = await page
      .locator(".gallery-row")
      .nth(row)
      .locator(".track")
      .evaluate((el) => el.scrollWidth / (el.parentElement as HTMLElement).clientWidth);
    expect(overflow).toBeGreaterThan(1.3);
  }
});

/**
 * Testimonios (spec §6.7), justo debajo de la galería.
 *
 * Las seis tarjetas están SIEMPRE en el DOM: el slider no monta ni desmonta
 * nada, sólo traslada la tira y `.slider{overflow:hidden}` recorta el resto.
 * Por eso aquí se cuenta 6 y no «las visibles».
 */
test("los testimonios van bajo la galería, sin retrato y con la fila cuadrada", async ({
  page,
  viewport,
}) => {
  await page.locator(".slider").scrollIntoViewIfNeeded();

  await expect(page.locator(".review-card")).toHaveCount(6);
  // D-34: el spec §7 pide un .review-avatar de 70×70 y aquí no hay ninguno.
  await expect(page.locator(".review-avatar")).toHaveCount(0);
  expect(await style(page, ".review-card", "background-color")).toBe("rgb(250, 245, 236)");

  // La sección empieza donde acaba la galería, sin solaparla.
  const gallery = await box(page, ".gallery");
  const slider = await box(page, ".slider");
  expect(gallery.y + gallery.height).toBeLessThanOrEqual(slider.y + 1);

  // `--per-view` es la ÚNICA fuente de la tabla de breakpoints: el componente
  // cliente la lee de aquí en vez de duplicarla en JavaScript. Si este test
  // repitiera los anchos, volverían a ser dos tablas.
  const esperado = viewport!.width >= 992 ? 3 : viewport!.width >= 768 ? 2 : 1;
  const perView = await page
    .locator(".slider-mask")
    .evaluate((el) => Number.parseInt(getComputedStyle(el).getPropertyValue("--per-view"), 10));
  expect(perView).toBe(esperado);

  // Criterio 7 de la referencia: las tarjetas a la vista cuadran de altura
  // aunque las citas midan entre 3 y 5 líneas. Lo sostiene el `min-height`.
  const alturas = await page
    .locator(".review-card")
    .evaluateAll((cards, n) => cards.slice(0, n).map((c) => c.getBoundingClientRect().height), perView);
  for (const alto of alturas) expect(alto).toBeCloseTo(alturas[0]!, 0);
});

/**
 * Las flechas cuelgan del titular por dos números que trabajan juntos:
 * `h2.mb--40` sube el slider 40px sobre el h2, y las flechas van a `top: 0` de
 * ese slider. Tocar uno sin el otro las descuelga, y es justo lo que avisa la
 * cabecera de `17-testimonials.css`.
 */
test("las flechas del slider cuelgan del titular", async ({ page, viewport }) => {
  await page.locator(".slider").scrollIntoViewIfNeeded();

  // El h2 lleva `.reveal`: mientras la entrada está en vuelo su caja va
  // desplazada, y medir ahí daría un número distinto en cada pasada.
  const titularLoc = page.locator(".container--stretch h2");
  await expect(titularLoc).toHaveClass(/is-in/);
  await expect(titularLoc).toHaveCSS("transform", "none");

  const izquierda = page.locator(".slider-arrow--left");
  const derecha = page.locator(".slider-arrow--right");

  for (const flecha of [izquierda, derecha]) {
    const caja = await flecha.boundingBox();
    expect(caja!.width).toBeCloseTo(34, 0);
    expect(caja!.height).toBeCloseTo(34, 0);
  }
  expect(await style(page, ".slider-arrow--right", "border-top-width")).toBe("1px");

  const cajaDerecha = (await derecha.boundingBox())!;
  const cajaIzquierda = (await izquierda.boundingBox())!;
  const linea = await box(page, ".slider-line");
  const titular = await box(page, ".container--stretch h2");
  const slider = await box(page, ".slider");
  const tarjeta = await box(page, ".review-card");

  // Las dos comparten fila, y esa fila es el borde superior del slider.
  expect(cajaIzquierda.y).toBeCloseTo(cajaDerecha.y, 0);
  expect(cajaDerecha.y).toBeCloseTo(slider.y, 0);

  // El acople: el slider arranca 40px por encima de donde acaba el titular.
  // A ≤479 la regla le añade `margin-top: 30px`, que se come 30 de esos 40 y
  // deja el solape en 10 — el par de números baja, pero sigue acoplado.
  const solape = viewport!.width <= 479 ? 10 : 40;
  expect(slider.y).toBeCloseTo(titular.y + titular.height - solape, 0);

  // Y en ningún ancho invaden la primera tarjeta.
  expect(cajaDerecha.y + cajaDerecha.height).toBeLessThanOrEqual(tarjeta.y);

  if (viewport!.width >= 480) {
    // 218px = 160 (línea) + 34 (círculo) + 24: entre círculo y círculo quedan
    // 184. Es un número que se copia del CSS, no se recalcula.
    expect(cajaDerecha.x - (cajaIzquierda.x + cajaIzquierda.width)).toBeCloseTo(184, 0);
    expect(linea.width).toBeCloseTo(160, 0);
  } else {
    // A ≤479 la izquierda salta al otro extremo y la línea deja de unirlas.
    expect(cajaIzquierda.x).toBeLessThan(cajaDerecha.x);
    expect(linea.width).toBeCloseTo(260, 0);
  }
});

test("footer muestra 4 columnas editoriales sin CTA ni newsletter visibles", async ({ page }) => {
  await page.locator(".footer").scrollIntoViewIfNeeded();

  await expect(page.locator(".cta-card")).toHaveCount(0);
  await expect(page.locator(".newsletter-form")).toHaveCount(0);
  await expect(page.locator(".footer-social")).toHaveCount(0);
  await expect(page.locator(".footer-cols > *")).toHaveCount(4);
  await expect(page.locator(".footer-brand-col")).toContainText("Boquita");
  await expect(page.locator(".footer-brand-col")).toContainText("Sweet & Salty");
  await expect(page.locator(".footer-nav .footer-link")).toHaveCount(4);
  await expect(page.locator(".footer-address")).not.toContainText("Calle Obelisco");
  await expect(page.locator(".footer-address")).toContainText("Condominio Condado del Río");
  await expect(page.locator(".footer-contact")).toContainText("+506 7132 2355");
  await expect(page.locator(".footer-contact")).toContainText("@boquitacostarica");
  await expect(page.locator(".footer-contact")).toContainText("ticaboquita@gmail.com");
  await expect(page.locator(".footer-contact")).not.toContainText("Tel.");
  await expect(page.locator(".footer-contact")).not.toContainText("WhatsApp");
  await expect(page.locator(".footer-contact")).not.toContainText("Instagram");
  await expect(page.locator(".footer-contact-link")).toHaveCount(3);
  await expect(page.locator(".footer-contact-icon")).toHaveCount(3);
  await expect(page.locator(".footer-contact-link").nth(0)).toHaveAttribute(
    "href",
    /api\.whatsapp\.com\/send\?phone=50671322355/,
  );
  await expect(page.locator(".footer-contact-link").nth(1)).toHaveAttribute(
    "href",
    "https://www.instagram.com/boquitacostarica/",
  );
  await expect(page.locator(".footer-contact-link").nth(2)).toHaveAttribute(
    "href",
    "mailto:ticaboquita@gmail.com",
  );
  if ((await page.viewportSize())!.width >= 992) {
    const links = await page.locator(".footer-contact-link").evaluateAll((items) =>
      items.slice(0, 2).map((item) => item.getBoundingClientRect().height),
    );
    expect(links.every((height) => height < 46)).toBe(true);
  }
  await expect(page.locator(".footer-copy")).toContainText("© 2026 Boquita — Sweet & Salty");
});

test("contenedor mantiene el ancho maximo del sistema", async ({ page, viewport }) => {
  const container = await box(page, ".cream-block .container");
  const expected = Math.min(1170, Math.min(1200, viewport!.width) - 30);
  expect(container.width - 30).toBeCloseTo(expected, 0);
});

/**
 * La cabecera es `position:absolute`: no ocupa sitio en el flujo, así que nada
 * garantiza por sí solo que el contenido empiece por debajo de ella.
 *
 * Antes de UI-016 no empezaba: con `.section` a 80px de padding contra una
 * cabecera de 101px, las cuatro páginas internas tenían el contenido superior
 * tapado 31px por debajo de 1280 — y a ≥1280 se salvaban por 15px de
 * casualidad, porque el logo crece y la cabecera pasa a 115px.
 *
 * El `--header-h` de 01-tokens.css es lo que lo mantiene alineado. Este test es
 * lo que impide que vuelva a desalinearse: si alguien cambia el alto del logo
 * sin tocar el token, o el padding de `.section`, esto se pone rojo.
 */
test.describe("la cabecera no tapa el contenido", () => {
  const INTERNAS = ["/tienda", "/tienda/brigadeiros", "/sobre-nosotros", "/aviso-legal", "/nope"];

  for (const url of INTERNAS) {
    test(`${url} empieza por debajo de la cabecera`, async ({ page }) => {
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready.then(() => true));

      const { navH, primerTop, quien } = await page.evaluate(() => {
        const nav = document.querySelector(".navbar") as HTMLElement;
        const main = document.querySelector("main") as HTMLElement;

        let top = Number.POSITIVE_INFINITY;
        let quien = "";
        for (const el of main.querySelectorAll<HTMLElement>("h1,h2,h3,p,span,a,img")) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && r.top < top) {
            top = r.top;
            quien = `${el.tagName}.${el.className || "-"}`;
          }
        }
        return { navH: nav.getBoundingClientRect().height, primerTop: top, quien };
      });

      expect(
        primerTop,
        `${quien} empieza en y=${Math.round(primerTop)} y la cabecera mide ${Math.round(navH)}px: queda tapado`,
      ).toBeGreaterThanOrEqual(navH);
    });
  }

  test("--header-h coincide con la altura real de la navbar", async ({ page }) => {
    await page.goto("/tienda");
    const { token, real } = await page.evaluate(() => ({
      token: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")),
      real: (document.querySelector(".navbar") as HTMLElement).getBoundingClientRect().height,
    }));
    expect(token, "el token --header-h se ha desalineado de la navbar real").toBeCloseTo(real, 0);
  });
});

/**
 * UI-015. La cabecera era `position:absolute`, así que desaparecía al primer
 * scroll — en una portada de varios miles de píxeles eso deja al usuario sin
 * navegación durante casi toda la página.
 *
 * Se afirma `fixed` y no `sticky` a propósito: `sticky` ocuparía sitio en el
 * flujo y descuadraría el hero y el `--header-h` de las páginas internas.
 */
test.describe("la cabecera acompaña el scroll", () => {
  test("sigue en pantalla despues de bajar", async ({ page }) => {
    await page.goto("/");
    expect(await style(page, ".navbar", "position")).toBe("fixed");

    const antes = await box(page, ".navbar");
    expect(Math.round(antes.y)).toBe(0);

    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForFunction(() => window.scrollY > 1500);

    const despues = await page.locator(".navbar").boundingBox();
    expect(despues, "la cabecera desapareció al hacer scroll").not.toBeNull();
    // `boundingBox` da coordenadas de viewport: una cabecera fija sigue en y=0.
    expect(Math.round(despues!.y)).toBe(0);
    expect(despues!.height).toBeCloseTo(antes.height, 0);
  });

  test("el estado scrolled solo aparece con contenido debajo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".navbar")).not.toHaveClass(/navbar--scrolled/);

    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(page.locator(".navbar")).toHaveClass(/navbar--scrolled/);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator(".navbar")).not.toHaveClass(/navbar--scrolled/);
  });

  /* El drawer y el scrim son `position:fixed` DENTRO del navbar. Si alguien
     añade `backdrop-filter` o `filter` a `.navbar`, se convierte en su bloque
     contenedor y los confina a la caja de la cabecera. Ya pasó una vez. */
  test("el navbar no crea bloque contenedor para el drawer", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) > 991, "el drawer sólo existe a ≤991");

    await page.goto("/");
    for (const prop of ["filter", "backdropFilter", "transform", "perspective"]) {
      const value = await page.evaluate((p) => {
        const cs = getComputedStyle(document.querySelector(".navbar")!);
        return cs[p as keyof CSSStyleDeclaration] as string;
      }, prop);
      expect(value, `.navbar tiene ${prop}: confinaría el drawer y el scrim`).toMatch(/^(none|)$/);
    }

    await page.getByRole("button", { name: /men/i }).first().click();
    const drawer = await box(page, ".nav-menu");
    expect(drawer.height).toBeGreaterThan(viewport!.height * 0.9);
  });
});

/**
 * A ≤991 los cuatro controles van en UNA fila y los tres huecos entre ellos
 * miden lo mismo. No es una preferencia estética que se pueda dejar caer: los
 * huecos los ponen dos contenedores distintos —`.nav-container` para
 * logo↔buscador y cesta↔menú, `.navbar-actions` para buscador↔cesta— y basta
 * tocar el `gap` de uno para que el tramo del medio deje de coincidir. Se rompe
 * también si alguien le devuelve a `.nav-menu-wrapper` una caja en flujo: un
 * ítem flex de ancho cero sigue generando su hueco a los dos lados y el primer
 * tramo sale doble.
 *
 * Sustituye a «la cesta queda pegada al boton de menu en movil», que exigía
 * ≤8px entre cesta y menú: ese contrato describía el header de dos filas, donde
 * la cesta y la hamburguesa eran un grupo suelto a la derecha.
 */
test("los cuatro controles del header movil comparten linea y distancia", async ({
  page,
  viewport,
}) => {
  test.skip(viewport!.width > 991, "Solo aplica al header movil");
  await page.goto("/");

  const medidas = await page.evaluate(() => {
    const caja = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    const cajas = [caja(".brand"), caja(".nav-search"), caja(".cart-button"), caja(".menu-button")];
    return {
      huecos: cajas.slice(1).map((c, i) => Math.round(c.left - cajas[i]!.right)),
      centros: cajas.map((c) => Math.round(c.top + c.height / 2)),
    };
  });

  expect(
    new Set(medidas.huecos).size,
    `los huecos del header no son iguales: ${medidas.huecos.join(" / ")}`,
  ).toBe(1);
  expect(medidas.huecos[0], "el header movil no deja aire entre controles").toBeGreaterThan(0);
  expect(
    Math.max(...medidas.centros) - Math.min(...medidas.centros),
    `los controles no van en la misma linea: centros en ${medidas.centros.join(" / ")}`,
  ).toBeLessThanOrEqual(1);
});

/**
 * El navbar montó `ProductSearchAutocomplete` dos veces durante un tiempo —uno
 * para escritorio y otro para la segunda fila móvil—, con una copia siempre en
 * `display:none`. El coste no era el peso: era que `.nav-search-input` resolvía
 * a dos elementos y Playwright abortaba por modo estricto antes de medir nada,
 * dejando el anillo de foco del buscador sin vigilancia (`a11y.spec.ts`).
 */
test("el header monta un unico buscador", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".nav-search")).toHaveCount(1);
  await expect(page.locator(".nav-search-input")).toHaveCount(1);
});

test("el drawer móvil aplica la geometría y paleta de Boquita", async ({ page, viewport }) => {
  test.skip(viewport!.width > 991, "Solo aplica al drawer móvil");
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menú" }).click();

  const drawer = page.locator("#nav-menu");
  await expect.poll(async () => (await drawer.boundingBox())!.x).toBeCloseTo(0, 0);

  const medidas = await page.evaluate(() => {
    const menu = document.querySelector<HTMLElement>("#nav-menu")!;
    const padre = menu.querySelector<HTMLElement>(".nav-dropdown-toggle")!;
    const subitems = [...menu.querySelectorAll<HTMLElement>(".nav-dropdown-link")].slice(0, 2);
    const iconoPadre = padre.querySelector<HTMLElement>(".nav-item-icon")!;
    const iconoSub = subitems[0]!.querySelector<HTMLElement>(".nav-subitem-icon")!;
    const caja = (elemento: Element) => elemento.getBoundingClientRect();
    const css = (elemento: Element) => getComputedStyle(elemento);

    return {
      fondo: css(menu).backgroundColor,
      padding: [css(menu).paddingTop, css(menu).paddingRight, css(menu).paddingBottom, css(menu).paddingLeft],
      fuentePadre: css(padre).fontFamily,
      pesoPadre: css(padre).fontWeight,
      altoPadre: caja(padre).height,
      altoSub: caja(subitems[0]!).height,
      huecoSub: caja(subitems[1]!).top - caja(subitems[0]!).bottom,
      iconoPadre: [caja(iconoPadre).width, caja(iconoPadre).height],
      iconoSub: [caja(iconoSub).width, caja(iconoSub).height],
      desbordaX: menu.scrollWidth > menu.clientWidth,
    };
  });

  expect(medidas.fondo).toBe("rgb(58, 42, 26)");
  expect(medidas.padding).toEqual(["32px", "24px", "32px", "24px"]);
  expect(medidas.fuentePadre).toMatch(/Poppins/i);
  expect(medidas.pesoPadre).toBe("600");
  expect(medidas.altoPadre).toBeCloseTo(48, 0);
  expect(medidas.altoSub).toBeGreaterThanOrEqual(44);
  expect(medidas.huecoSub).toBeCloseTo(4, 0);
  expect(medidas.iconoPadre).toEqual([32, 32]);
  expect(medidas.iconoSub).toEqual([20, 20]);
  expect(medidas.desbordaX).toBe(false);
});

/**
 * `.section--no-bottom` estuvo sin efecto a ≥1280 y a ≤767: los overrides
 * responsivos escribían el atajo `padding-block`, que reescribe también
 * `padding-bottom`, iban después y tenían la misma especificidad. El modificador
 * perdía por orden de aparición. En /sobre-nosotros eran 240px de aire fantasma.
 *
 * Se afirma en los tres breakpoints porque el fallo sólo aparecía en dos.
 */
test("las secciones sin fondo no arrastran padding inferior", async ({ page }) => {
  await page.goto("/sobre-nosotros");
  const paddings = await page
    .locator("main > .section--no-bottom")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).paddingBottom));

  expect(paddings.length).toBeGreaterThan(0);
  for (const pad of paddings) {
    expect(pad, "un .section--no-bottom conserva padding inferior").toBe("0px");
  }
});

/**
 * Los cinco huecos verticales de /sobre-nosotros son EL MISMO número.
 *
 * Salían de tres sitios que no se hablaban entre sí —el `padding-block` de
 * `.section`, el `margin-top` de `.prose-block` y los `margin: 10px 0` de la
 * tipografía base— y daban 130/130/184/64/120px a ≥1280. Cualquiera de los tres
 * puede volver a desbordarse sin que se note: un residuo de 10px no se ve a ojo.
 * Por eso se afirma la aritmética término a término y no sólo el total, para
 * saber QUÉ margen volvió.
 *
 * Los dos cantos van por separado a propósito: `.container` es flex, así que
 * esos márgenes NO colapsan contra el padding de la sección, y `.prose` es un
 * flex item —contexto propio—, así que ni el margen del primer bloque ni el de
 * su h2 se escapan hacia fuera. Son los cuatro sitios donde reaparecerían.
 */
test("en sobre nosotros todos los huecos verticales miden lo mismo", async ({ page }) => {
  await page.goto("/sobre-nosotros");

  const medidas = await page.evaluate(() => {
    const main = document.querySelector("main.about-page") as HTMLElement;
    const px = (valor: string) => Number.parseFloat(valor);
    const cs = (el: Element) => getComputedStyle(el);
    const secciones = [...main.querySelectorAll<HTMLElement>(":scope > .section")];
    const bloques = [...main.querySelectorAll<HTMLElement>(".prose--wide > .prose-block")];

    return {
      ritmo: px(cs(main).getPropertyValue("--editorial-rhythm")),
      headerH: px(cs(document.documentElement).getPropertyValue("--header-h")),
      padTop: secciones.map((s) => px(cs(s).paddingTop)),
      padBottom: secciones.map((s) => px(cs(s).paddingBottom)),
      eyebrowTop: px(cs(main.querySelector(".container > *")!).marginTop),
      entradillaBottom: px(
        cs(main.querySelector(".section--no-bottom .container > :last-child")!).marginBottom,
      ),
      bloqueTop: bloques.map((b) => px(cs(b).marginTop)),
      h2Top: bloques.map((b) => px(cs(b.querySelector("h2")!).marginTop)),
    };
  });

  const { ritmo, headerH } = medidas;
  expect(
    ritmo,
    "falta --editorial-rhythm: el var() se cayó y los paddings valen 0",
  ).toBeGreaterThan(0);
  expect(medidas.padTop).toEqual([headerH + ritmo, ritmo, ritmo]);
  expect(medidas.padBottom).toEqual([0, 0, ritmo]);
  expect(medidas.eyebrowTop, "vuelve el margen del eyebrow: 10px más bajo la cabecera").toBe(0);
  expect(medidas.entradillaBottom, "vuelve el margen del último párrafo de la entradilla").toBe(0);
  expect(medidas.bloqueTop[0], "el primer bloque duplica el padding de su sección").toBe(0);
  for (const top of medidas.bloqueTop.slice(1)) expect(top).toBe(ritmo);
  for (const top of medidas.h2Top) {
    expect(top, "el h2 mete 10px que .prose no deja colapsar hacia fuera").toBe(0);
  }

  // Y una medida de caja real, para que la aritmética no se quede en teoría. El
  // bloque lleva `.reveal`: con la entrada en vuelo su caja va 100px desplazada
  // y el número saldría distinto en cada pasada.
  const primero = page.locator(".prose--wide > .prose-block").first();
  await primero.scrollIntoViewIfNeeded();
  await expect(primero).toHaveClass(/is-in/);
  await expect(primero).toHaveCSS("transform", "none");

  const [rueda, titular] = await Promise.all([
    box(page, ".product-wheel"),
    box(page, ".prose--wide > .prose-block h2"),
  ]);
  expect(titular.y - (rueda.y + rueda.height)).toBeCloseTo(ritmo, 0);
});

/**
 * La raya bajo cada titular de /sobre-nosotros llega al final del carril. Con
 * 56px era una marca junto al titular y se pidió completa; el `::after` no se
 * puede medir con `boundingBox`, así que se lee su ancho computado contra el del
 * h2 — que es el que da el carril.
 */
test("en sobre nosotros los titulares comparten acabado y sus rayas cubren el carril", async ({
  page,
  viewport,
}) => {
  await page.goto("/sobre-nosotros");

  const titulares = await page.evaluate(() => {
    const h1 = document.querySelector(".about-page h1")!;
    const h2 = document.querySelector(".prose--wide > .prose-block h2")!;
    const h1Style = getComputedStyle(h1);
    const h2Style = getComputedStyle(h2);
    const h1Raya = getComputedStyle(h1, "::after");
    const h2Raya = getComputedStyle(h2, "::after");
    return {
      h1: {
        fontSize: Number.parseFloat(h1Style.fontSize),
        fontFamily: h1Style.fontFamily,
        fontWeight: h1Style.fontWeight,
        color: h1Style.color,
        rayaAncho: Number.parseFloat(h1Raya.width),
        rayaAlto: Number.parseFloat(h1Raya.height),
        rayaColor: h1Raya.backgroundColor,
        carril: h1.getBoundingClientRect().width,
      },
      h2: {
        fontFamily: h2Style.fontFamily,
        fontWeight: h2Style.fontWeight,
        color: h2Style.color,
        rayaAncho: Number.parseFloat(h2Raya.width),
        rayaAlto: Number.parseFloat(h2Raya.height),
        rayaColor: h2Raya.backgroundColor,
        carril: h2.getBoundingClientRect().width,
      },
    };
  });

  const h1Esperado = viewport!.width <= 767 ? 46 : viewport!.width <= 991 ? 52 : 70;
  expect(titulares.h1.fontSize, "cambió la escala responsive del h1").toBe(h1Esperado);
  expect(titulares.h1.fontFamily).toBe(titulares.h2.fontFamily);
  expect(titulares.h1.fontWeight).toBe(titulares.h2.fontWeight);
  expect(titulares.h1.color).toBe(titulares.h2.color);
  expect(titulares.h1.rayaColor).toBe(titulares.h2.rayaColor);

  for (const titular of [titulares.h1, titulares.h2]) {
    expect(titular.rayaAncho, "la raya del titular se quedó corta").toBeCloseTo(
      titular.carril,
      0,
    );
    expect(titular.rayaAlto).toBeCloseTo(2, 0);
  }

  // Y la lista de preguntas no dibuja una SEGUNDA línea a todo lo ancho 18px más
  // abajo, en otro color y otro grosor: con la raya completa, ella es el tope.
  expect(
    await style(page, ".prose--wide .faq-item", "border-top-width"),
    "el borde superior de la FAQ duplica la raya del titular",
  ).toBe("0px");
});

/**
 * El carrusel sustituyó a la foto contenida de polvorones y sangra hasta ambos
 * bordes del viewport. El texto conserva el carril editorial de 1170px: son dos
 * decisiones distintas que este test protege a la vez.
 */
test("en sobre nosotros el texto se alinea y el carrusel ocupa todo el viewport", async ({
  page,
  viewport,
}) => {
  await page.goto("/sobre-nosotros");

  const introduccion = await page
    .locator(".about-page > .section:first-child p.mt-20")
    .evaluateAll((paragraphs) =>
      paragraphs.map((paragraph) => {
        const cs = getComputedStyle(paragraph);
        return {
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          color: cs.color,
        };
      }),
    );
  expect(introduccion).toHaveLength(2);
  expect(
    introduccion[0],
    "los dos párrafos de la introducción usan formatos tipográficos distintos",
  ).toEqual(introduccion[1]);

  const [entradilla, texto, carrusel] = await Promise.all([
    page.locator(".about-page > .section:first-child .container").boundingBox(),
    page.locator(".prose").locator("..").boundingBox(),
    page.locator(".product-wheel").boundingBox(),
  ]);

  expect(texto!.x, "los contenedores editoriales no arrancan en el mismo canto").toBeCloseTo(
    entradilla!.x,
    0,
  );
  expect(texto!.width, "los contenedores editoriales no tienen la misma medida").toBeCloseTo(
    entradilla!.width,
    0,
  );
  // Y la prosa LLENA ese carril. Comparar contenedor con contenedor no basta:
  // devolverle a `.prose` su `max-width: 720px` encogería el texto dentro de un
  // contenedor que sigue midiendo 1170, y los dos cantos de arriba cuadrarían
  // igual. Esto es lo que fija la medida completa que se pidió.
  const carril = await page.locator(".prose").evaluate((el) => {
    const contenedor = el.closest(".container")!;
    const cs = getComputedStyle(contenedor);
    return {
      disponible:
        contenedor.getBoundingClientRect().width -
        Number.parseFloat(cs.paddingLeft) -
        Number.parseFloat(cs.paddingRight),
      prosa: el.getBoundingClientRect().width,
    };
  });
  expect(carril.prosa, "la prosa se encogió dentro de su carril").toBeCloseTo(
    carril.disponible,
    0,
  );

  expect(carrusel!.x, "el carrusel no llega al borde izquierdo").toBeCloseTo(0, 0);
  expect(carrusel!.width, "el carrusel no cubre el ancho del viewport").toBeCloseTo(
    viewport!.width,
    0,
  );

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, "la rueda crea scroll horizontal").toBe(viewport!.width);

  // La entradilla vive FUERA de `.prose` (va antes del carrusel), así que se
  // comprueba aparte. Se mira el `max-width` computado y no la caja: un párrafo
  // en un flex con `align-items: flex-start` se ajusta al texto, y la última
  // línea corta haría fallar una medida de anchura sin que nada esté mal.
  const topes = await page
    .locator("main .section:first-child p")
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).maxWidth));

  expect(topes.length).toBeGreaterThan(0);
  for (const tope of topes) {
    expect(tope, "la entradilla conserva un tope de anchura").toBe("none");
  }

  if (viewport!.width > 767) {
    const disc = page.locator(".product-wheel__disc");
    await expect(disc).toHaveCSS(
      "animation-name",
      "product-wheel-spin",
    );
    await expect(disc).toHaveCSS("animation-iteration-count", "infinite");
    await expect(page.locator(".product-wheel__set--copy")).toHaveCSS("display", "none");

    const geometry = await page.evaluate(() => {
      const wheel = document.querySelector(".product-wheel") as HTMLElement;
      const disc = document.querySelector(".product-wheel__disc") as HTMLElement;
      const card = document.querySelector(".product-wheel__card") as HTMLElement;
      const count = Number(wheel.dataset.carouselCount);
      const radius = disc.getBoundingClientRect().width / 2;
      const cardStyle = getComputedStyle(card);
      const cardWidth = Number.parseFloat(cardStyle.width);
      const cardHeight = Number.parseFloat(cardStyle.height);
      const halfAngle = Math.PI / count;

      // Separación sobre el eje que une los centros. La proyección incluye la
      // altura porque las tarjetas vecinas están giradas entre sí.
      const centerDistance = 2 * radius * Math.sin(halfAngle);
      const projectedCards =
        cardWidth * Math.cos(halfAngle) + cardHeight * Math.sin(halfAngle);
      const animation = disc.getAnimations()[0]!;

      return {
        visibleGap: centerDistance - projectedCards,
        topClearance: Number.parseFloat(getComputedStyle(wheel).paddingTop) - cardHeight / 2,
        keyframes: (animation.effect as KeyframeEffect)
          .getKeyframes()
          .map((frame) => frame.transform),
      };
    });

    expect(geometry.visibleGap, "las esquinas de dos fotos se quedan pegadas").toBeGreaterThanOrEqual(
      30,
    );
    expect(geometry.topClearance, "el fondo crema superior no mide unos 80px").toBeCloseTo(80, 0);
    expect(geometry.keyframes.at(0)).toBe("rotate(0deg)");
    expect(geometry.keyframes.at(-1)).toBe("rotate(-360deg)");
  } else {
    const disc = page.locator(".product-wheel__disc");
    await expect(disc).toHaveCSS(
      "animation-name",
      "product-wheel-slide",
    );
    await expect(disc).toHaveCSS("animation-iteration-count", "infinite");
    await expect(page.locator(".product-wheel__set--copy")).toHaveCSS("display", "flex");
    await expect(page.locator(".product-wheel__set").first()).toHaveCSS("column-gap", "32px");
    await expect(page.locator(".product-wheel")).toHaveCSS("padding-top", "20px");

    const finalTransform = await disc.evaluate(
      (element) =>
        (element.getAnimations()[0]!.effect as KeyframeEffect).getKeyframes().at(-1)!.transform,
    );
    expect(finalTransform).toBe("translateX(-50%)");
  }
});

/**
 * El aviso legal comparte exactamente el carril editorial y el ritmo de
 * /sobre-nosotros. Se comparan cajas reales en vez de repetir los 1170px del
 * contenedor: así el contrato sigue siendo cierto también en tablet y móvil.
 */
test("el aviso legal comparte carril y ritmo con sobre nosotros", async ({ page, viewport }) => {
  const medirCarril = async (url: string) => {
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready.then(() => true));

    return page.evaluate(() => {
      const main = document.querySelector("main.editorial-page")!;
      const cabecera = main.querySelector(":scope > .section:first-child .container")!;
      const prosa = main.querySelector(".prose--wide")!;
      const cajaCabecera = cabecera.getBoundingClientRect();
      const cajaProsa = prosa.getBoundingClientRect();

      return {
        cabecera: { x: cajaCabecera.x, width: cajaCabecera.width },
        prosa: { x: cajaProsa.x, width: cajaProsa.width },
      };
    });
  };

  const sobreNosotros = await medirCarril("/sobre-nosotros");
  const aviso = await medirCarril("/aviso-legal");

  expect(aviso.cabecera.x).toBeCloseTo(sobreNosotros.cabecera.x, 0);
  expect(aviso.cabecera.width).toBeCloseTo(sobreNosotros.cabecera.width, 0);
  expect(aviso.prosa.x).toBeCloseTo(sobreNosotros.prosa.x, 0);
  expect(aviso.prosa.width).toBeCloseTo(sobreNosotros.prosa.width, 0);

  const medidas = await page.evaluate(() => {
    const main = document.querySelector("main.legal-page") as HTMLElement;
    const px = (valor: string) => Number.parseFloat(valor);
    const cs = (el: Element) => getComputedStyle(el);
    const secciones = [...main.querySelectorAll<HTMLElement>(":scope > .section")];
    const bloques = [...main.querySelectorAll<HTMLElement>(".prose-block")];
    const primerH2 = bloques[0]!.querySelector("h2")!;
    const raya = getComputedStyle(primerH2, "::after");

    return {
      ritmo: px(cs(main).getPropertyValue("--editorial-rhythm")),
      headerH: px(cs(document.documentElement).getPropertyValue("--header-h")),
      padTop: secciones.map((section) => px(cs(section).paddingTop)),
      padBottom: secciones.map((section) => px(cs(section).paddingBottom)),
      cabeceraTop: px(cs(main.querySelector(".container > :first-child")!).marginTop),
      cabeceraBottom: px(
        cs(main.querySelector(".section--no-bottom .container > :last-child")!).marginBottom,
      ),
      bloqueTop: bloques.map((block) => px(cs(block).marginTop)),
      h2Top: bloques.map((block) => px(cs(block.querySelector("h2")!).marginTop)),
      cuerpo: {
        fontSize: px(cs(bloques[0]!.querySelector("p")!).fontSize),
        lineHeight: px(cs(bloques[0]!.querySelector("p")!).lineHeight),
      },
      raya: {
        width: px(raya.width),
        height: px(raya.height),
        carril: primerH2.getBoundingClientRect().width,
      },
      scrollWidth: document.documentElement.scrollWidth,
    };
  });

  const ritmoEsperado = viewport!.width <= 767 ? 48 : 64;
  expect(medidas.ritmo).toBe(ritmoEsperado);
  expect(medidas.padTop).toEqual([medidas.headerH + ritmoEsperado, ritmoEsperado]);
  expect(medidas.padBottom).toEqual([0, ritmoEsperado]);
  expect(medidas.cabeceraTop).toBe(0);
  expect(medidas.cabeceraBottom).toBe(0);
  expect(medidas.bloqueTop[0]).toBe(0);
  for (const top of medidas.bloqueTop.slice(1)) expect(top).toBe(ritmoEsperado);
  for (const top of medidas.h2Top) expect(top).toBe(0);
  expect(medidas.cuerpo.fontSize).toBe(viewport!.width <= 767 ? 18 : 19);
  expect(medidas.cuerpo.lineHeight).toBeCloseTo(viewport!.width <= 767 ? 30.6 : 33.25, 1);
  expect(medidas.raya.width).toBeCloseTo(medidas.raya.carril, 0);
  expect(medidas.raya.height).toBeCloseTo(2, 0);
  expect(medidas.scrollWidth).toBe(viewport!.width);
});
