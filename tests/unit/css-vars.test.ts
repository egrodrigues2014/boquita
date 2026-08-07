/**
 * Guardián de custom properties: ninguna `var(--x)` de styles/ puede apuntar a
 * una variable que no exista.
 *
 * Por qué existe. Una referencia sin fallback a una variable no declarada NO
 * degrada: es «inválida en tiempo de cómputo», y la propiedad entera se cae al
 * valor heredado o inicial. Falla en silencio — sin error de build, sin aviso en
 * consola, sin nada en el diff. Tres casos convivieron en el repo a la vez:
 *
 *   · `--ff-quote: var(--font-quote), Lato, …` → blockquote heredaba la sans en
 *     vez de caer a Lato, justo lo contrario de lo que prometía su comentario.
 *   · `.nav-search-button { background: var(--gold-fill) }` → el botón de
 *     búsqueda se quedaba SIN fondo (transparent), no dorado.
 *   · `.scroll-color-text__heading`, `.footer-brand-name` con `var(--ff-serif)`
 *     → el titular del statement y la marca del pie salían en la sans.
 *
 * Ninguno lo detectó el typecheck, el lint, los 171 unitarios ni los e2e. Es el
 * mismo trato que `contrast.test.ts` le da al color: si alguien rompe la
 * cadena, el build cae aquí y no en una auditoría tres commits después.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const STYLES_DIR = path.join(process.cwd(), "styles");
const CODE_DIRS = ["app", "components", "lib"];

/**
 * Variables que `next/font` inyecta en runtime sobre <html>. No están —ni deben
 * estar— declaradas en CSS: las emite el bundler con el nombre de familia
 * autohospedado. Ver app/fonts.ts.
 */
const RUNTIME_FONT_VARS = new Set(["--font-display", "--font-sans"]);

const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

function readCss(): { file: string; text: string }[] {
  return readdirSync(STYLES_DIR)
    .filter((f) => f.endsWith(".css"))
    .sort()
    .map((f) => ({ file: `styles/${f}`, text: stripComments(readFileSync(path.join(STYLES_DIR, f), "utf8")) }));
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.name.startsWith(".") || name.name === "node_modules") continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name.name)) out.push(p);
  }
  return out;
}

const css = readCss();
const allCss = css.map((c) => c.text).join("\n");

const code = CODE_DIRS.flatMap((d) => {
  try {
    return walk(path.join(process.cwd(), d));
  } catch {
    return [];
  }
})
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

/**
 * Declaradas en CSS. El `(?:^|[{;])` es lo que separa una declaración real de un
 * modificador BEM: sin él, `.btn--ghost:hover {` se leería como si declarara
 * `--ghost`.
 */
const declared = new Set<string>();
for (const m of allCss.matchAll(/(?:^|[{;])\s*(--[\w-]+)\s*:\s*[^;{}]+(?=[;}])/gm)) {
  declared.add(m[1]!);
}

/** Fijadas desde TSX: style={{ "--x": … }} o element.style.setProperty("--x", …). */
const setAtRuntime = new Set<string>();
for (const m of code.matchAll(/["'](--[\w-]+)["']\s*:/g)) setAtRuntime.add(m[1]!);
for (const m of code.matchAll(/setProperty\(\s*["'](--[\w-]+)["']/g)) setAtRuntime.add(m[1]!);

/** Referencias `var(--x)` SIN fallback, con el fichero donde aparecen. */
const referencedNoFallback = new Map<string, Set<string>>();
for (const { file, text } of css) {
  // El `(?=\s*\))` exige que el cierre siga al nombre: con coma de por medio hay
  // fallback y la declaración ya degrada sola, que es justo lo que queremos.
  for (const m of text.matchAll(/var\(\s*(--[\w-]+)\s*(?=\))/g)) {
    const name = m[1]!;
    if (!referencedNoFallback.has(name)) referencedNoFallback.set(name, new Set());
    referencedNoFallback.get(name)!.add(file);
  }
}

describe("custom properties: integridad de las referencias", () => {
  it("toda var() sin fallback apunta a una variable que existe", () => {
    const rotas: string[] = [];
    for (const [name, files] of referencedNoFallback) {
      if (declared.has(name)) continue;
      if (setAtRuntime.has(name)) continue;
      if (RUNTIME_FONT_VARS.has(name)) continue;
      rotas.push(`${name} — referenciada en ${[...files].join(", ")}`);
    }

    expect(
      rotas,
      `Referencias a variables inexistentes. Cada una es una propiedad que se cae ` +
        `en silencio al valor heredado o inicial. Declárala, corrige el nombre, o ` +
        `dale un fallback dentro del var():\n  ${rotas.join("\n  ")}`
    ).toEqual([]);
  });

  it("las variables que next/font inyecta se consumen con la envoltura --ff-*", () => {
    // Salvaguarda de la regla de app/fonts.ts: --font-* sólo se toca dentro de
    // 01-tokens.css, para que el resto del CSS dependa de --ff-* y no del bundler.
    for (const { file, text } of css) {
      if (file.endsWith("01-tokens.css")) continue;
      for (const v of RUNTIME_FONT_VARS) {
        expect(text, `${file} usa ${v} directamente en vez de la envoltura --ff-*`).not.toContain(v);
      }
    }
  });

  it("no quedan variables declaradas en :root que nadie use", () => {
    // Huérfanas conocidas y aceptadas: reservadas por el spec, sin consumidor hoy.
    const toleradas = new Set(["--light-gray", "--dark-gray-50", "--dark-gray"]);

    const usadas = new Set<string>();
    for (const m of allCss.matchAll(/var\(\s*(--[\w-]+)/g)) usadas.add(m[1]!);
    for (const m of code.matchAll(/var\(\s*(--[\w-]+)/g)) usadas.add(m[1]!);

    const tokens = stripComments(readFileSync(path.join(STYLES_DIR, "01-tokens.css"), "utf8"));
    const enTokens = [...tokens.matchAll(/(?:^|[{;])\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]!);

    const huerfanas = [...new Set(enTokens)].filter((v) => !usadas.has(v) && !toleradas.has(v));
    expect(huerfanas, `Tokens declarados y sin usar: ${huerfanas.join(", ")}`).toEqual([]);
  });
});
