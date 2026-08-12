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
    slot: "brand",
    name: "logo",
    // El único original que no viene del PDF.
    dir: path.join(ROOT, "assets"),
    src: "logo-boquita.jpg",
    // El logo es un badge circular cuadrado (816×816), no un wordmark
    // horizontal. A los 43px de alto que pide el spec queda como insignia.
    // ⚠ TODO: hace falta un SVG/PNG transparente y una variante clara para el
    // pie marrón — el JPG lleva el fondo blanco horneado. Ver CONTENT_TODO §1.
    ratio: 1,
    sizes: [
      [43, 43],
      [86, 86],
    ],
    quality: 88,
  },
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

/**
 * Fichas de producto para `/tienda` y `/tienda/[slug]` (Fase 4).
 *
 * Proporción NATURAL, no recortada: varios productos son verticales y altos —el
 * queque de dos pisos ocupa 1710 de los 1800px de su foto— y ningún recorte
 * cuadrado los contiene sin decapitarlos. La ficha muestra la foto entera y es
 * el CSS de la tarjeta el que recorta al cuadrado con `object-fit:cover`.
 *
 * Un archivo por producto aunque dos compartan la foto de origen (los mini
 * queques de manzana usan la misma que el hero, los biscotti de almendra la
 * misma que el CTA). Duplicar ~50 KB es barato y permite que Ale cambie la foto
 * de un producto sin tocar la de otro ni la del layout.
 *
 * La asignación foto→producto está razonada en docs/IMAGE_MAP.md.
 */
/**
 * Escalera ajustada a los anchos de render REALES, medidos en el navegador.
 *
 * Un primer intento usó [300, 600, 1200] suponiendo tarjetas de ~300px. Estaba
 * mal: `.shop-grid` son 3 columnas en un contenedor de 1170px con huecos de 30,
 * así que cada tarjeta mide **370px**. El escalón de 300 nunca se elegía y el
 * navegador bajaba el de 600 en todos los casos.
 *
 *   400  → tarjeta en pantalla 1x (370px de render)
 *   800  → tarjeta en 2x (740px) y ficha en 1x (~540px)
 *   1200 → ficha en 2x (~1080px)
 */
const PRODUCT_WIDTHS = [400, 800, 1200];
const LOGO_VARIANT_SIZES = {
  transparent: [
    [43, 43],
    [86, 86],
    // 192 y 512 son los dos tamaños que pide el manifest de PWA. El original es
    // 816×816, así que siguen siendo reducciones: no se rompe la regla de no
    // hacer upscale nunca.
    [192, 192],
    [512, 512],
  ],
  light: [
    [36, 36],
    [72, 72],
    [144, 144],
  ],
};

/**
 * Iconos de pestaña y de iOS. Van a `app/`, no a `public/img/`, porque Next los
 * descubre por convención de nombre de fichero (`app/icon.png`,
 * `app/apple-icon.png`) y emite él mismo los <link> con su hash de versión.
 *
 * 180×180 es el tamaño que pide apple-touch-icon; el mismo fichero sirve de
 * favicon de alta densidad.
 */
const APP_ICON_PX = 180;

/**
 * Las fotos de producto NO vienen del PDF de Instagram: las manda Ale nombradas
 * por SKU del catálogo (`data/boquita_products_catalog.xlsx`), así que viven en
 * su propia carpeta y no en `assets/raw`.
 */
const PRODUCTS_SRC = path.join(ROOT, "assets", "products");

/**
 * Un job por producto, en el orden del catálogo. El `name` es el slug —de ahí
 * salen las rutas que reconstruye `lib/productImage.ts`— y el `src` es el SKU.
 *
 * Dos fuentes son miniaturas y sólo emiten el escalón de 400 (`QUE-03`, 403×268;
 * `QUE-010`, 407×320): el filtro `w <= width` las recorta sola y el esquema
 * admite un solo escalón por eso. Van marcadas `photoTodo` en el catálogo.
 */
const PRODUCTS = [
  { name: "queque-de-zanahoria", src: "QUE-01.jpg" },
  { name: "cupcakes-de-zanahoria", src: "QUE-02.jpeg" },
  { name: "cupcakes-de-limon", src: "QUE-03.jpg" },
  { name: "queque-de-limon", src: "QUE-04.jpeg" },
  { name: "cupcakes-devils-food", src: "QUE-05.jpg" },
  { name: "queque-devils-food", src: "QUE-06.jpg" },
  { name: "coffee-cake", src: "QUE-07.jpeg" },
  { name: "queque-chocolate-chip-cookie", src: "QUE-08.jpg" },
  { name: "cupcakes-de-vainilla", src: "QUE-09.jpg" },
  { name: "queque-de-vainilla", src: "QUE-010.jpg" },
  { name: "cupcakes-de-banano", src: "QUE-011.jpg" },
  { name: "banana-bread", src: "QUE-012.jpeg" },
  { name: "queque-personalizado", src: "QUE-013.jpeg" },
  // Segunda foto del personalizado: es el único producto donde ver dos encargos
  // distintos explica lo que se compra. La ficha la muestra bajo la principal.
  { name: "queque-personalizado-b", src: "QUE-013-B.jpeg" },
  { name: "polvorones-espanoles", src: "GAL-014.jpeg" },
  { name: "galletas-de-granola", src: "GAL-015.jpg" },
  { name: "galletas-de-miel-y-limon", src: "GAL-016.jpg" },
  { name: "barra-de-datiles", src: "DUL-017.jpg" },
  { name: "brigadeiros", src: "DUL-018.jpeg" },
  { name: "mousse-de-chocolate", src: "DUL-019.jpeg" },
  { name: "pie-de-brigadeiro", src: "DUL-020.jpeg" },
  { name: "key-lime-pie", src: "DUL-021.jpeg" },
  { name: "cheesecake", src: "DUL-022.jpeg" },
  { name: "quesillo", src: "DUL-023.jpeg" },
].map((product) => ({
  dir: PRODUCTS_SRC,
  ...product,
  slot: "producto",
  widths: PRODUCT_WIDTHS,
  // q75 y no el 82 general: varias fotos son verticales y a 1200×1500 pesaban
  // más de 300 KB, demasiado para la imagen principal de una ficha. Las fuentes
  // ya vienen recomprimidas por Instagram, así que el detalle fino que se pierde
  // a 75 en gran medida ya no estaba.
  quality: 75,
}));

const ALL = [...SLOTS, ...GALLERY, ...PRODUCTS];

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
  const srcPath = path.join(job.dir ?? RAW, job.src);
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

  /**
   * Dos formas de declarar los tamaños de salida:
   *
   *  · `sizes: [[w, h], …]`  — recorte a una proporción FIJA. Es lo que necesitan
   *    los slots del layout, donde el spec impone el ratio (2.9:1, 5:3, 4:3…).
   *
   *  · `widths: [600, 1200]` — se conserva la proporción NATURAL de la fuente y
   *    sólo se fija el ancho. Es lo que necesitan las fichas de producto: un
   *    queque de dos pisos no cabe en ningún recorte cuadrado sin decapitarlo,
   *    así que la ficha muestra la foto entera y es el CSS quien la recorta para
   *    la tarjeta del catálogo, con `aspect-ratio` y `object-fit:cover`.
   *    Así también hay UN archivo por producto sirviendo tarjeta y detalle.
   */
  const sizes = job.widths
    ? job.widths
        .filter((w) => w <= width)
        .map((w) => [w, Math.round(w / cropRatio)])
    : job.sizes;

  if (!sizes?.length) {
    console.error(`  ✗ ${job.slot}/${job.name ?? job.slot}: sin tamaños que emitir`);
    problems++;
    return;
  }

  if (job.ratio && Math.abs(cropRatio - job.ratio) / job.ratio > 0.01) {
    console.error(
      `  ✗ ${job.slot}/${job.name ?? job.slot}: el recorte da ratio ${cropRatio.toFixed(4)} ` +
        `pero el slot pide ${job.ratio.toFixed(4)} (>1% de desvío)`,
    );
    problems++;
    return;
  }

  for (const [w, h] of sizes) {
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

  for (const size of sizes) {
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

function isLogoBackground(data, offset) {
  return data[offset] >= 248 && data[offset + 1] >= 248 && data[offset + 2] >= 248;
}

function transparentizeEdgeBackground(data, width, height, channels) {
  const out = Buffer.from(data);
  const seen = new Uint8Array(width * height);
  const queue = [];

  function push(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pixel = y * width + x;
    if (seen[pixel]) return;
    const offset = pixel * channels;
    if (!isLogoBackground(out, offset)) return;
    seen[pixel] = 1;
    out[offset + 3] = 0;
    queue.push([x, y]);
  }

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  return out;
}

async function writeLogoVariant(variant, [w, h]) {
  const srcPath = path.join(ROOT, "assets", "logo-boquita.jpg");
  const dir = path.join(OUT, "brand");
  await mkdir(dir, { recursive: true });

  const { data, info } = await sharp(srcPath, { failOn: "error" })
    .resize(w, h, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = transparentizeEdgeBackground(data, info.width, info.height, info.channels);

  if (variant === "light") {
    for (let offset = 0; offset < out.length; offset += info.channels) {
      const alpha = out[offset + 3];
      if (alpha === 0) continue;
      const isInk = out[offset] < 95 && out[offset + 1] < 80 && out[offset + 2] < 60;
      if (isInk) {
        out[offset] = 255;
        out[offset + 1] = 248;
        out[offset + 2] = 230;
      }
    }
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(dir, `logo-${variant}-${w}x${h}.png`));
  written++;
}

/**
 * Escribe app/icon.png y app/apple-icon.png.
 *
 * Se diferencian en la transparencia, y no es un capricho:
 *   · icon.png     transparente, para que el disco dorado se recorte limpio
 *                  contra la pestaña clara u oscura del navegador.
 *   · apple-icon   OPACO. iOS no respeta el canal alfa en los iconos de
 *                  pantalla de inicio: compone lo transparente sobre negro, y
 *                  un wordmark marrón oscuro sobre negro es un cuadrado negro.
 *                  Se deja el fondo blanco del original.
 */
async function writeAppIcons() {
  const srcPath = path.join(ROOT, "assets", "logo-boquita.jpg");
  const appDir = path.join(ROOT, "app");

  // Opaco: reducción directa del original, sin tocar el alfa.
  await sharp(srcPath, { failOn: "error" })
    .resize(APP_ICON_PX, APP_ICON_PX, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(appDir, "apple-icon.png"));
  written++;

  // Transparente: mismo tratamiento de borde que las variantes de marca.
  const { data, info } = await sharp(srcPath, { failOn: "error" })
    .resize(APP_ICON_PX, APP_ICON_PX, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = transparentizeEdgeBackground(data, info.width, info.height, info.channels);

  await sharp(out, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(appDir, "icon.png"));
  written++;
}

async function processLogoVariants() {
  if (CHECK_ONLY) {
    console.log("  ✓ brand/logo-variants: se generan desde logo-boquita.jpg sin upscale");
    console.log("  ✓ app/icon.png y app/apple-icon.png: idem, a 180×180");
    return;
  }

  await writeAppIcons();

  for (const [variant, sizes] of Object.entries(LOGO_VARIANT_SIZES)) {
    for (const size of sizes) {
      await writeLogoVariant(variant, size);
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
  await processLogoVariants();

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
