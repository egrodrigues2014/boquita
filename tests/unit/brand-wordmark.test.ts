import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const source = readFileSync(path.join(root, "assets", "logo-boquita.svg"), "utf8");
const wordmark = readFileSync(
  path.join(root, "public", "img", "brand", "wordmark-boquita-white.svg"),
  "utf8",
);

const pathData = (svg: string) =>
  [...svg.matchAll(/<path\b[\s\S]*?\bd="([\s\S]*?)"[\s\S]*?\/>/g)].map(
    (match) => match[1]!,
  );

describe("wordmark exacto de Boquita", () => {
  it("copia únicamente los tres contornos centrales del SVG maestro", () => {
    const contours = pathData(wordmark);
    expect(contours).toHaveLength(3);
    for (const contour of contours) expect(source).toContain(contour);
  });

  it("es vectorial, blanco y no vuelve a aproximar la marca con texto", () => {
    expect(wordmark).toContain('viewBox="0 250 770 340"');
    expect(wordmark.match(/fill="#FFFFFF"/g)).toHaveLength(3);
    expect(wordmark).not.toMatch(/<(?:text|image)\b/);
  });
});
