/**
 * Lee los design tokens directamente de styles/01-tokens.css.
 *
 * SÓLO SERVIDOR / BUILD TIME (usa node:fs). Lo consumen el test de contraste y
 * la página de especímenes /dev/tokens.
 *
 * El motivo de leer el CSS en vez de duplicar los hex en TypeScript: el CSS es
 * la única fuente de verdad. Si alguien cambia un token, el test y la página de
 * especímenes lo ven al instante, en vez de quedarse mintiendo.
 */

import { readFileSync } from "node:fs";
import path from "node:path";

const TOKENS_CSS_PATH = path.join(process.cwd(), "styles", "01-tokens.css");

function readTokensCss(): string {
  return readFileSync(TOKENS_CSS_PATH, "utf8");
}

/** Extrae las custom properties de un bloque, ignorando comentarios. */
function parseBlock(css: string, selectorRegex: string): Record<string, string> {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const block = new RegExp(`${selectorRegex}\\s*\\{([^}]*)\\}`).exec(stripped);
  if (!block?.[1]) {
    throw new Error(`No se encontró el bloque ${selectorRegex} en styles/01-tokens.css`);
  }

  const out: Record<string, string> = {};
  for (const decl of block[1].split(";")) {
    const [name, ...rest] = decl.split(":");
    if (!name || rest.length === 0) continue;
    const key = name.trim();
    if (!key.startsWith("--")) continue;
    out[key] = rest.join(":").trim();
  }
  return out;
}

export type TokenSet = Record<string, string>;

export type Tokens = {
  /** Tokens del ámbito claro (:root) */
  light: TokenSet;
  /** Tokens efectivos dentro de .footer-dark (los de :root con los overrides aplicados) */
  footer: TokenSet;
  /** Sólo los tokens que .footer-dark redefine */
  footerOverrides: TokenSet;
};

export function getTokens(): Tokens {
  const css = readTokensCss();
  const light = parseBlock(css, ":root");
  const footerOverrides = parseBlock(css, "\\.footer-dark");
  return { light, footer: { ...light, ...footerOverrides }, footerOverrides };
}

/**
 * El fondo de `.footer-dark` es `--surface-dark`, un token que NO se invierte.
 *
 * Antes se usaba `var(--text-dark)`, pero ese mismo elemento lo re-declara a
 * blanco y una propiedad personalizada declarada en un elemento aplica a las
 * declaraciones de ese elemento: el fondo resolvía a blanco. Lo detectó la
 * auditoría de axe, no esta suite.
 */
export function footerBackground(tokens: Tokens): string {
  const brown = tokens.light["--surface-dark"];
  if (!brown) throw new Error("Falta --surface-dark en :root");
  return brown;
}
