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

test("statement usa fondo crema, escala compacta y layout hibrido", async ({ page, viewport }) => {
  await expect(page.locator(".statement-section h2")).toContainText("Del horno de Ale");
  await expect(page.locator(".statement-section h2")).toContainText("a tu mesa");
  await expect(page.locator(".statement-section h2")).toContainText(
    "Ale Budowski hornea en su",
  );
  await expect(page.locator(".statement-section h2")).toContainText(
    "pequeñas y el sabor de lo hecho a mano.",
  );
  await expect(page.locator(".statement-section .scroll-color-text__line")).toHaveCount(6);
  await expect(page.locator(".statement-photo-img")).toBeVisible();
  await expect(page.locator(".media-text-section")).toHaveCount(0);
  expect(await style(page, ".statement-section", "background-color")).toBe("rgb(250, 245, 236)");
  expect(await style(page, ".statement-photo-img", "filter")).toBe("none");
  const bodySize = Number.parseFloat(
    await style(page, ".scroll-color-text__line--body", "font-size"),
  );
  if (viewport!.width <= 479) {
    expect(bodySize).toBe(18);
  } else if (viewport!.width <= 767) {
    expect(bodySize).toBe(20);
  } else {
    expect(bodySize).toBeGreaterThan(20);
  }

  const titleLine = await box(page, ".scroll-color-text__line--title");
  const titleBase = await box(
    page,
    ".scroll-color-text__line--title .scroll-color-text__base",
  );
  expect(titleBase.height).toBeCloseTo(titleLine.height, 1);

  const copy = await box(page, ".statement-copy");
  const photo = await box(page, ".statement-photo");
  if (viewport!.width >= 992) {
    expect(photo.x).toBeGreaterThan(copy.x + copy.width);
    expect(photo.y).toBeGreaterThan(copy.y + 80);
  } else {
    expect(photo.y).toBeGreaterThan(copy.y + copy.height);
  }
});

test("imagen ancha vive en banda blanca y catalogo conserva banda crema", async ({ page }) => {
  expect(await style(page, ".overlap-wrapper", "background-color")).toBe("rgb(250, 245, 236)");
  expect(await style(page, ".wide-img-block", "background-color")).toBe("rgb(255, 255, 255)");
  expect(await style(page, ".cream-block", "background-color")).toBe("rgb(250, 245, 236)");
  expect(await style(page, ".cream-block", "margin-top")).toBe("0px");

  const band = await box(page, ".wide-img-block");
  const wide = await box(page, ".wide-img");
  const cream = await box(page, ".cream-block");
  expect(wide.y).toBeGreaterThan(band.y);
  expect(wide.y + wide.height).toBeLessThan(cream.y);
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

test("galeria desborda horizontalmente sin publicar testimonios falsos", async ({ page }) => {
  await page.locator(".gallery").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const imgs = [...document.querySelectorAll<HTMLImageElement>(".gallery-img")];
    return imgs.length > 0 && imgs.every((img) => img.complete && img.naturalWidth > 0);
  });

  expect(await style(page, ".scroller", "overflow")).toBe("hidden");
  for (const row of [1, 2]) {
    await expect(page.locator(`.track--${row} .gallery-item`)).toHaveCount(7);
    const overflow = await page
      .locator(`.track--${row}`)
      .evaluate((el) => el.scrollWidth / (el.parentElement as HTMLElement).clientWidth);
    expect(overflow).toBeGreaterThan(1.3);
  }

  await expect(page.locator(".review-card")).toHaveCount(0);
});

test("footer muestra 4 columnas editoriales sin CTA ni newsletter visibles", async ({ page }) => {
  await page.locator(".footer").scrollIntoViewIfNeeded();

  await expect(page.locator(".cta-card")).toHaveCount(0);
  await expect(page.locator(".newsletter-form")).toHaveCount(0);
  await expect(page.locator(".footer-cols > *")).toHaveCount(4);
  await expect(page.locator(".footer-brand-col")).toContainText("Boquita");
  await expect(page.locator(".footer-brand-col")).toContainText("Sweet & Salty");
  await expect(page.locator(".footer-nav .footer-link")).toHaveCount(4);
  await expect(page.locator(".footer-address")).toContainText("Calle Obelisco");
  await expect(page.locator(".footer-contact")).toContainText("+506 7132 2355");
  await expect(page.locator(".footer-contact")).toContainText("@boquita_cr");
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
