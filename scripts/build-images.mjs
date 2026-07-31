#!/usr/bin/env node
/**
 * Genera los derivados de imagen del layout desde los originales extraídos del PDF.
 *
 * Python extrae (scripts/extract-pdf-images.py), sharp redimensiona. Una sola
 * implementación de resize, para que una foto procesada hoy y otra el año que
 * viene salgan idénticas.
 *
 * El razonamiento de cada asignación está en docs/IMAGE_MAP.md. Este archivo es
 * la fuente de verdad EJECUTABLE: los recortes son datos versionados, no
 * argumentos de línea de comandos.
 *
 * Uso:
 *   npm run images:build
 *   node scripts/build-images.mjs --force    # reescribe aunque no haya cambios
 *   node scripts/build-images.mjs --check    # sólo valida los recortes, no escribe
 *
 * Ratios objetivo: inventario de assets del spec, §7.
 * Techo de las fuentes: 1440px de ancho. Nunca se hace upscale — ver §"Techo de
 * resolución" en docs/IMAGE_MAP.md.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const RAW = path.join(ROOT, "assets", "raw");
const OUT = path.join(ROOT, "public", "img");
// Huellas de receta para no regenerar sin motivo. FUERA de public/: cualquier
// cosa en public/ se despliega, y esto es caché de build.
const CACHE = path.join(ROOT, ".image-cache");

const WEBP = { quality: 82, effort: 5 };
const AVIF = { quality: 55, effort: 5 };

/**
 * Recortes en coordenadas del ORIGINAL. `crop` es {left, top, width, height};
 * omitirlo usa la imagen completa.
 *
 * `sizes` son los derivados a emitir, del más pequeño al más grande. Ninguno
 * debe superar las dimensiones del recorte: eso sería upscale, y el script
 * aborta si ocurre.
 */
const SLOTS = [
  {
    slot: "hero",
    src: "ig-27-obj70.jpg",
    // Bundt con azúcar glas. Sólo se recortan laterales: la composición
    // (queque en el 60% inferior, porche al fondo) se conserva.
    crop: { left: 45, top: 0, width: 1350, height: 1800 },
    ratio: 0.75,
    // El hero se renderiza al 43.5/46/38/39% del viewport × 100vh en escritorio,
    // y a 100vw × 420px de alto a ≤991. A 1920px eso son ~749 CSS px de ancho.
    // La escalera cubre desde móvil hasta ~1.8× en pantalla grande.
    sizes: [
      [500, 667],
      [800, 1067],
      [1050, 1400],
      [1350, 1800],
    ],
    // Es el elemento LCP: calidad algo más contenida y AVIF además de WebP.
    quality: 78,
    avif: true,
  },
  {
    slot: "wide",
    src: "ig-33-obj88.jpg",
    // La ÚNICA foto del archivo que sobrevive a una banda 2.9:1. El plato y la
    // taza viven entre y≈460-845, así que no se pierde nada.
    crop: { left: 0, top: 385, width: 1440, height: 497 },
    ratio: 1440 / 497,
    sizes: [
      [1170, 403],
      [1440, 497],
    ],
  },
  {
    slot: "service",
    src: "ig-09-obj28.jpg",
    crop: { left: 0, top: 100, width: 1440, height: 1655 },
    ratio: 1440 / 1655,
    sizes: [
      [540, 624],
      [1080, 1248],
    ],
  },
  {
    slot: "media",
    src: "ig-24-obj61.jpg",
    // Interina: falta un fotograma real del reel de Ale decorando.
    crop: { left: 0, top: 96, width: 1440, height: 864 },
    ratio: 5 / 3,
    sizes: [
      [493, 300],
      [986, 600],
    ],
  },
  {
    slot: "cta",
    src: "ig-31-obj80.jpg",
    crop: { left: 0, top: 290, width: 1440, height: 960 },
    ratio: 1.5,
    sizes: [
      [585, 384],
      [1170, 768],
    ],
  },
  {
    slot: "inline",
    name: "brigadeiro",
    src: "ig-05-obj18.jpg",
    // ~100px dentro del flujo de un h2: sólo sobreviven siluetas simples, así que
    // hay que encuadrar la esfera COMPLETA con algo de cápsula alrededor. Un
    // recuadro más apretado cae dentro de la pieza y a 100px se lee como una
    // mancha marrón, no como un brigadeiro.
    // El recuadro queda por debajo del logo incrustado (y>140).
    crop: { left: 198, top: 530, width: 380, height: 380 },
    ratio: 1,
    sizes: [
      [100, 100],
      [200, 200],
    ],
  },
  {
    slot: "inline",
    name: "galleta-corazon",
    src: "ig-04-obj11.jpg",
    // La galleta con forma de corazón más aislada, sobre plato blanco: es la
    // única silueta del archivo que se reconoce a 100px. El titular incrustado
    // acaba en y≈70 y el logo en y≈90, así que top=110 es limpio.
    crop: { left: 190, top: 110, width: 340, height: 340 },
    ratio: 1,
    sizes: [
      [100, 100],
      [200, 200],
    ],
  },
];

/** Galería: 8 únicas, 4 por fila, todas a 4:3. Sin colisión con los slots de arriba. */
const GALLERY = [
  { row: 1, i: 1, src: "ig-29-obj78.jpg", crop: { left: 0, top: 470, width: 1440, height: 1080 } },
  { row: 1, i: 2, src: "ig-35-obj90.jpg", crop: { left: 0, top: 0, width: 1440, height: 1080 } },
  { row: 1, i: 3, src: "ig-28-obj71.jpg", crop: { left: 0, top: 500, width: 1440, height: 1080 } },
  { row: 1, i: 4, src: "ig-36-obj91.jpg", crop: { left: 0, top: 400, width: 1440, height: 1080 } },
  { row: 2, i: 1, src: "ig-13-obj38.jpg", crop: { left: 0, top: 720, width: 1440, height: 1080 } },
  { row: 2, i: 2, src: "ig-34-obj89.jpg", crop: { left: 0, top: 640, width: 1440, height: 1080 } },
  { row: 2, i: 3, src: "ig-30-obj79.jpg", crop: { left: 0, top: 550, width: 1440, height: 1080 } },
  {
    row: 2,
    i: 4,
    src: "ig-37-obj98.jpg",
    crop: { left: 0, top: 0, width: 1440, height: 1080 },
    // Subexpuesta: el chocolate se empasta y la silla del fondo es un agujero
    // negro. Es el único ajuste tonal de todo el pipeline.
    tone: { brightness: 1.12, saturation: 1.05 },
  },
].map((g) => ({
  ...g,
  slot: "gallery",
  name: `fila${g.row}-${g.i}`,
  ratio: 4 / 3,
  sizes: [
    [321, 239],
    [642, 478],
  ],
}));

const ALL = [...SLOTS, ...GALLERY];

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const CHECK_ONLY = args.has("--check");

/** Huella de la receta: si cambia, el derivado se regenera aunque exista. */
function recipeHash(job, [w, h]) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        src: job.src,
        crop: job.crop,
        tone: job.tone ?? null,
        w,
        h,
        webp: { ...WEBP, quality: job.quality ?? WEBP.quality },
        avif: job.avif ? AVIF : null,
      }),
    )
    .digest("hex")
    .slice(0, 8);
}

function outputName(job, [w, h]) {
  const base = job.name ? `${job.name}-` : "";
  return `${base}${w}x${h}.webp`;
}

let written = 0;
let skipped = 0;
let problems = 0;

async function processJob(job) {
  const srcPath = path.join(RAW, job.src);
  const image = sharp(srcPath, { failOn: "error" });
  const meta = await image.metadata();

  // ── Validaciones antes de escribir nada ────────────────────────────────
  const { left, top, width, height } = job.crop ?? {
    left: 0,
    top: 0,
    width: meta.width,
    height: meta.height,
  };

  if (left + width > meta.width || top + height > meta.height) {
    console.error(
      `  ✗ ${job.slot}/${job.name ?? job.slot}: el recorte (${left},${top} ${width}×${height}) ` +
        `se sale del original ${meta.width}×${meta.height}`,
    );
    problems++;
    return;
  }

  const cropRatio = width / height;
  if (job.ratio && Math.abs(cropRatio - job.ratio) / job.ratio > 0.01) {
    console.error(
      `  ✗ ${job.slot}/${job.name ?? job.slot}: el recorte da ratio ${cropRatio.toFixed(4)} ` +
        `pero el slot pide ${job.ratio.toFixed(4)} (>1% de desvío)`,
    );
    problems++;
    return;
  }

  for (const [w, h] of job.sizes) {
    if (w > width || h > height) {
      console.error(
        `  ✗ ${job.slot}/${job.name ?? job.slot}: ${w}×${h} sería UPSCALE desde ` +
          `${width}×${height}. No se hace upscale (ver docs/IMAGE_MAP.md).`,
      );
      problems++;
      return;
    }
  }

  if (CHECK_ONLY) {
    console.log(
      `  ✓ ${job.slot}/${job.name ?? job.slot}: recorte ${width}×${height} ` +
        `(${cropRatio.toFixed(3)}) desde ${job.src} ${meta.width}×${meta.height}`,
    );
    return;
  }

  // ── Emisión ────────────────────────────────────────────────────────────
  const dir = path.join(OUT, job.slot);
  const cacheDir = path.join(CACHE, job.slot);
  await mkdir(dir, { recursive: true });
  await mkdir(cacheDir, { recursive: true });
  const existing = new Set(await readdir(dir).catch(() => []));

  for (const size of job.sizes) {
    const [w, h] = size;
    const name = outputName(job, size);
    const target = path.join(dir, name);
    const stamp = path.join(cacheDir, `${name}.recipe`);
    const hash = recipeHash(job, size);

    if (!FORCE && existing.has(name)) {
      const prev = await readFile(stamp, "utf8").catch(() => null);
      if (prev === hash) {
        skipped++;
        continue;
      }
    }

    let pipe = sharp(srcPath, { failOn: "error" })
      .rotate() // honra la orientación EXIF antes de recortar
      .extract({ left, top, width, height });

    if (job.tone) {
      pipe = pipe.modulate(job.tone);
    }

    // fit:"cover" con position centre. Sin sharpening: las fuentes ya vienen
    // recomprimidas por Instagram y acentuarlas amplifica los artefactos.
    pipe = pipe.resize(w, h, { fit: "cover", position: "centre", withoutEnlargement: true });

    await pipe
      .clone()
      .webp({ ...WEBP, quality: job.quality ?? WEBP.quality })
      .toFile(target);
    await writeFile(stamp, hash, "utf8");
    written++;

    if (job.avif) {
      const avifName = name.replace(/\.webp$/, ".avif");
      await sharp(srcPath, { failOn: "error" })
        .rotate()
        .extract({ left, top, width, height })
        .resize(w, h, { fit: "cover", position: "centre", withoutEnlargement: true })
        .avif(AVIF)
        .toFile(path.join(dir, avifName));
      written++;
    }
  }
}

async function main() {
  console.log(
    CHECK_ONLY
      ? "Validando recortes (sin escribir)…\n"
      : `Generando derivados en public/img/…${FORCE ? " (--force)" : ""}\n`,
  );

  for (const job of ALL) {
    await processJob(job);
  }

  if (problems > 0) {
    console.error(`\n✗ ${problems} recortes inválidos. No se generó nada de ellos.`);
    return 1;
  }

  if (CHECK_ONLY) {
    console.log(`\n✓ ${ALL.length} recortes válidos.`);
    return 0;
  }

  console.log(`\n✓ ${written} archivos escritos · ${skipped} sin cambios`);
  console.log(`  ${ALL.length} slots · derivados en public/img/`);
  return 0;
}

process.exit(await main());
