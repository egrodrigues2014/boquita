/**
 * Convierte el punto 13 del checklist §9 del spec ("Contraste AA") de una
 * revisión a ojo en un test de CI.
 *
 * Lee styles/01-tokens.css a través de lib/tokens.ts y recalcula todos los
 * pares de la tabla de mapeo del plan con lib/color.ts — la misma
 * implementación que usa la página de especímenes, para que no puedan discrepar.
 *
 * Si alguien "mejora" un color y rompe un ratio, el build falla aquí en vez de
 * descubrirse en una auditoría de accesibilidad.
 */

import { describe, expect, it } from "vitest";
import { THRESHOLD, contrastRatio } from "@/lib/color";
import { footerBackground, getTokens } from "@/lib/tokens";

const tokens = getTokens();
const { light, footer, footerOverrides } = tokens;

const BROWN = footerBackground(tokens);
const WHITE = light["--white"]!;
const CREAM = light["--primary-light"]!;

const { AA_NORMAL, AA_LARGE, NON_TEXT } = THRESHOLD;

describe("tokens: sanidad", () => {
  it("los tokens esperados existen en :root", () => {
    for (const key of [
      "--text-dark",
      "--body-text",
      "--link",
      "--gold",
      "--gold-display",
      "--gold-ink",
      "--gold-line",
      "--gold-bright",
      "--white",
      "--primary-light",
      "--focus",
    ]) {
      expect(light[key], `falta ${key}`).toBeTruthy();
    }
  });

  it(".footer-dark invierte los tokens de tinta", () => {
    for (const key of ["--gold-ink", "--gold-display", "--gold-line", "--text-dark", "--focus"]) {
      expect(footerOverrides[key], `falta ${key} en .footer-dark`).toBeTruthy();
      expect(footerOverrides[key], `${key} no se invirtió en .footer-dark`).not.toBe(light[key]);
    }
  });
});

describe("contexto claro: texto ámbar ≥24px usa --gold-display (AA-large)", () => {
  // h2 (50/42/34px), h4 (30/26px), .text-primary (86/72/70/52/46px), .stat-num (50/42/38/36px)
  it.each([
    ["blanco", WHITE],
    ["crema", CREAM],
  ])("--gold-display sobre %s ≥ 3:1", (_label, bg) => {
    expect(contrastRatio(light["--gold-display"]!, bg)).toBeGreaterThanOrEqual(AA_LARGE);
  });
});

describe("contexto claro: texto ámbar <24px usa --gold-ink (AA normal)", () => {
  // precios (18/20px), nav/search/cart (18px), a:hover (20px), li (16px),
  // .h6-sans.primary (20px), flechas del slider (glifo de 20px)
  it.each([
    ["blanco", WHITE],
    ["crema", CREAM],
  ])("--gold-ink sobre %s ≥ 4.5:1", (_label, bg) => {
    expect(contrastRatio(light["--gold-ink"]!, bg)).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});

describe("statement: texto aún no revelado (UI-060)", () => {
  // El ScrollColorText pinta el texto dos veces: `--text-ghost` debajo y el
  // color revelado encima, recortado por scroll. El de debajo es el MISMO texto
  // que el usuario lee mientras baja, no un adorno, así que le aplica el umbral.
  //
  // Los dos pasos superan siempre los 24px (`clamp(34px,…)` el titular,
  // `clamp(24px,…)` el cuerpo), así que el umbral aplicable es AA-large.
  it("--text-ghost sobre crema ≥ 3:1", () => {
    expect(contrastRatio(light["--text-ghost"]!, CREAM)).toBeGreaterThanOrEqual(AA_LARGE);
  });

  // Y tiene que seguir siendo claramente más tenue que su estado revelado: si
  // alguien lo oscurece "para cumplir mejor", el efecto de revelado se pierde.
  it("--text-ghost es más tenue que el revelado del titular", () => {
    expect(contrastRatio(light["--text-ghost"]!, CREAM)).toBeLessThan(
      contrastRatio(light["--gold-ink"]!, CREAM),
    );
  });
});

describe("contexto claro: tinta neutra", () => {
  it.each([
    ["--text-dark", "blanco", WHITE],
    ["--text-dark", "crema", CREAM],
    ["--body-text", "blanco", WHITE],
    ["--body-text", "crema", CREAM],
    ["--link", "blanco", WHITE],
    ["--link", "crema", CREAM],
  ])("%s sobre %s ≥ 4.5:1", (token, _label, bg) => {
    expect(contrastRatio(light[token]!, bg)).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});

describe("botón: relleno dorado con etiqueta marrón (desvío D-0)", () => {
  it("--on-gold sobre --gold ≥ 4.5:1 — la etiqueta del botón es legible", () => {
    expect(contrastRatio(light["--on-gold"]!, light["--gold"]!)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it("--on-gold NO se invierte en .footer-dark", () => {
    // Este es el test que faltaba. `.btn` usaba `--text-dark`, que .footer-dark
    // invierte a blanco: el botón de la newsletter quedaba a 2.08:1 sobre el
    // dorado. Lo detectó axe, no esta suite, porque aquí se comprobaban pares de
    // tokens y aquello era la interacción entre una inversión y un componente
    // que usa dos tokens a la vez.
    expect(footerOverrides["--on-gold"]).toBeUndefined();
    expect(footer["--on-gold"]).toBe(light["--on-gold"]);
    expect(contrastRatio(footer["--on-gold"]!, footer["--gold"]!)).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it("--text-dark invertido sobre --gold FALLARÍA: por eso existe --on-gold", () => {
    expect(contrastRatio(footer["--text-dark"]!, light["--gold"]!)).toBeLessThan(AA_NORMAL);
  });

  it("blanco sobre --gold FALLA — este es el motivo de existir del desvío D-0", () => {
    // El spec pide .btn{background:primary; color:white}. Este test documenta
    // por qué no se puede cumplir literalmente. Si algún día --gold se
    // oscureciera lo suficiente, el test avisaría y se podría revertir D-0.
    expect(contrastRatio(WHITE, light["--gold"]!)).toBeLessThan(AA_NORMAL);
  });

  it("--gold-line sobre blanco ≥ 3:1 — límite del control (SC 1.4.11)", () => {
    expect(contrastRatio(light["--gold-line"]!, WHITE)).toBeGreaterThanOrEqual(NON_TEXT);
  });
});

describe("indicador de foco (SC 1.4.11)", () => {
  it.each([
    ["blanco", WHITE],
    ["crema", CREAM],
  ])("--focus sobre %s ≥ 3:1", (_label, bg) => {
    expect(contrastRatio(light["--focus"]!, bg)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("--focus invertido sobre el marrón del footer ≥ 3:1", () => {
    expect(contrastRatio(footer["--focus"]!, BROWN)).toBeGreaterThanOrEqual(NON_TEXT);
  });
});

describe("contexto oscuro (.footer-dark sobre el marrón de marca)", () => {
  it("--gold-ink invertido ≥ 4.5:1 — dirección, teléfonos, iconos sociales (18/20px)", () => {
    expect(contrastRatio(footer["--gold-ink"]!, BROWN)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("--gold-display invertido ≥ 3:1 — el h4 de la newsletter (30/26px)", () => {
    expect(contrastRatio(footer["--gold-display"]!, BROWN)).toBeGreaterThanOrEqual(AA_LARGE);
  });

  it("--text-dark invertido (blanco) ≥ 4.5:1 — enlaces y copyright del footer", () => {
    expect(contrastRatio(footer["--text-dark"]!, BROWN)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("--body-text invertido (blanco translúcido, compuesto) ≥ 4.5:1", () => {
    expect(contrastRatio(footer["--body-text"]!, BROWN)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("--gold-line invertido ≥ 3:1 — trazos decorativos", () => {
    expect(contrastRatio(footer["--gold-line"]!, BROWN)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("--gold-bright ≥ 3:1 sobre el marrón — sólo decorativo, sólo sobre oscuro", () => {
    expect(contrastRatio(light["--gold-bright"]!, BROWN)).toBeGreaterThanOrEqual(NON_TEXT);
  });

  it("--gold-bright FALLA sobre blanco — por eso está restringido a fondos oscuros", () => {
    expect(contrastRatio(light["--gold-bright"]!, WHITE)).toBeLessThan(AA_LARGE);
  });
});

describe("lib/color: la matemática en sí", () => {
  it("reproduce los extremos conocidos", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });

  it("compone el alfa contra el fondo antes de medir", () => {
    // Blanco al 50% sobre negro debe medir igual que un gris medio sólido.
    const composed = contrastRatio("rgba(255,255,255,.5)", "#000000");
    const solid = contrastRatio("#808080", "#000000");
    expect(composed).toBeCloseTo(solid, 1);
  });

  it("acepta hex de 3 dígitos", () => {
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 5);
  });

  it("es simétrico: el orden de los argumentos no altera el ratio", () => {
    expect(contrastRatio("#b07208", "#ffffff")).toBeCloseTo(
      contrastRatio("#ffffff", "#b07208"),
      10,
    );
  });
});
