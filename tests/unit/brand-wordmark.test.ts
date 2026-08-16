import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
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

/**
 * La tarjeta de Open Graph monta dos piezas de marca: la foto de fondo y el
 * wordmark encima. Hasta ahora ninguna estaba vigilada, y el síntoma de que la
 * foto se quede con un recorte viejo no es un rojo — es una tarjeta descuadrada
 * que nadie mira hasta que la comparte un cliente.
 */
describe("piezas de la tarjeta de Open Graph", () => {
  it("la foto de fondo mide exactamente el lienzo de la tarjeta", async () => {
    const meta = await sharp(path.join(root, "app", "og-hero.jpg")).metadata();
    expect({ width: meta.width, height: meta.height, format: meta.format }).toEqual({
      width: 1200,
      height: 630,
      format: "jpeg",
    });
  });

  it("el wordmark sigue siendo blanco, que es lo que lo hace legible sobre el velo", () => {
    // Duplica a propósito la aserción de arriba: allí protege la fidelidad de la
    // marca, aquí la legibilidad de la tarjeta. Si el wordmark dejara de ser
    // blanco, sobre el velo oscuro se volvería invisible y el build no diría nada.
    expect(wordmark.match(/fill="#FFFFFF"/g)).toHaveLength(3);
  });
});
