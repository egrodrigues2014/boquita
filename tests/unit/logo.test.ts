/**
 * Guardián de los derivados de marca de `public/img/brand/`.
 *
 * Por qué existe. El logo es un badge circular sobre papel blanco, y para
 * servirlo sobre el marrón del pie hay que recortarle el fondo. El recorte es un
 * relleno por inundación que entra desde los cuatro bordes… y **el anillo
 * exterior del dibujo es discontinuo**: por esos huecos el relleno se cuela
 * dentro del disco y se lleva la crema blanca de arriba, que es exactamente del
 * mismo blanco que el papel. Lo que queda es un disco dorado con unas virutas
 * flotando sobre el fondo.
 *
 * No es hipotético ni es un riesgo futuro: `logo-light-144x144.png` y
 * `logo-transparent-192x192.png` estuvieron publicados así. Sólo se libraban los
 * tamaños pequeños, donde la reducción emborrona el anillo hasta cerrarle los
 * huecos al relleno por accidente —de ahí que el logo del pie a 1x se viera
 * «bien» y el de las pantallas de densidad alta no.
 *
 * Y no lo cazaba nadie: no hay error de build, ni de tipos, ni de lint. El PNG
 * es válido; simplemente le falta un trozo del dibujo.
 */

import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

const BRAND_DIR = path.join(process.cwd(), "public", "img", "brand");

/** Los PNG que salen de `scripts/build-images.mjs`, con su lado en píxeles. */
const VARIANTS = [
  ["logo-light-36x36.png", 36],
  ["logo-light-72x72.png", 72],
  ["logo-light-144x144.png", 144],
  ["logo-light-216x216.png", 216],
  ["logo-transparent-43x43.png", 43],
  ["logo-transparent-86x86.png", 86],
  ["logo-transparent-192x192.png", 192],
  ["logo-transparent-512x512.png", 512],
] as const;

/**
 * Coordenadas en fracciones del lado, medidas sobre el original de 816×816:
 *
 *   · `crema`   (400, 200) — el merengue blanco de la parte alta del disco, lo
 *                            primero que desaparece cuando el relleno se cuela.
 *   · `disco`   (375, 500) — dorado macizo bajo el texto.
 *   · `esquina` (  8,   8) — papel, fuera del badge: tiene que irse siempre.
 */
const CREMA = [400 / 816, 200 / 816] as const;
const DISCO = [375 / 816, 500 / 816] as const;
const ESQUINA = [8 / 816, 8 / 816] as const;

async function alphaAt(
  file: string,
  side: number,
  [fx, fy]: readonly [number, number],
) {
  const { data, info } = await sharp(path.join(BRAND_DIR, file))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const x = Math.round(fx * side);
  const y = Math.round(fy * side);
  const offset = (y * info.width + x) * info.channels;
  return {
    alpha: data[offset + 3]!,
    rgb: [data[offset]!, data[offset + 1]!, data[offset + 2]!] as const,
  };
}

describe("derivados de marca", () => {
  it.each(VARIANTS)("%s mide lo que dice su nombre", async (file, side) => {
    const { width, height } = await sharp(
      path.join(BRAND_DIR, file),
    ).metadata();
    expect([width, height]).toEqual([side, side]);
  });

  it.each(VARIANTS)("%s conserva la crema del disco", async (file, side) => {
    const { alpha } = await alphaAt(file, side, CREMA);
    expect(alpha).toBeGreaterThan(200);
  });

  it.each(VARIANTS)("%s conserva el disco dorado", async (file, side) => {
    const { alpha, rgb } = await alphaAt(file, side, DISCO);
    expect(alpha).toBeGreaterThan(200);
    // Sigue siendo dorado: el recoloreado de la variante `light` toca la tinta
    // oscura, no el relleno del disco.
    const [r, , b] = rgb;
    expect(r - b).toBeGreaterThan(90);
  });

  it.each(VARIANTS)("%s recorta el papel de alrededor", async (file, side) => {
    const { alpha } = await alphaAt(file, side, ESQUINA);
    expect(alpha).toBe(0);
  });
});
