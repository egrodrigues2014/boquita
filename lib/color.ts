/**
 * Matemática de contraste WCAG 2.x.
 *
 * Puro y sin dependencias, para que lo usen por igual el test que blinda el
 * punto 13 del checklist (tests/unit/contrast.test.ts) y la página de
 * especímenes (app/dev/tokens), y así no haya dos implementaciones que
 * puedan discrepar.
 */

export type Rgb = { r: number; g: number; b: number; a: number };

/** Acepta #rgb, #rrggbb, rgb(...) y rgba(...) — lo que aparece en los tokens. */
export function parseColor(value: string): Rgb {
  const v = value.trim();

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex?.[1]) {
    const h =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((c) => c + c)
            .join("")
        : hex[1];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }

  const rgba = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/i.exec(v);
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }

  throw new Error(`No se pudo parsear el color: ${JSON.stringify(value)}`);
}

/**
 * Compone un color translúcido sobre su fondo antes de medirlo.
 * Necesario para --body-text del footer, que es blanco al 86%.
 */
export function flatten(fg: Rgb, bg: Rgb): Rgb {
  if (fg.a >= 1) return fg;
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Ratio de contraste entre 1 y 21. El alfa del primer plano se compone sobre el fondo. */
export function contrastRatio(foreground: string, background: string): number {
  const bg = parseColor(background);
  const fg = flatten(parseColor(foreground), bg);
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Umbrales WCAG 2.x.
 *
 * Ojo: "large" en WCAG es ≥24px, o ≥18.66px EN NEGRITA. El checklist del spec
 * lo redacta más flojo ("≥18px o bold"); aquí se aplica el umbral real de WCAG,
 * que es el motivo de que los precios de 18px usen --gold-ink y no --gold-display.
 */
export const THRESHOLD = {
  /** Texto normal (<24px, o <18.66px en negrita) */
  AA_NORMAL: 4.5,
  /** Texto grande (≥24px, o ≥18.66px en negrita) */
  AA_LARGE: 3.0,
  /** Componentes de UI y elementos gráficos (SC 1.4.11) */
  NON_TEXT: 3.0,
} as const;

export type TextSize = "normal" | "large" | "non-text";

export function meetsAA(ratio: number, size: TextSize): boolean {
  const min =
    size === "normal"
      ? THRESHOLD.AA_NORMAL
      : size === "large"
        ? THRESHOLD.AA_LARGE
        : THRESHOLD.NON_TEXT;
  return ratio >= min;
}
