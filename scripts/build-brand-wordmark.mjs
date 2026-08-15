import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "assets", "logo-boquita.svg");
const outputPath = path.join(root, "public", "img", "brand", "wordmark-boquita-white.svg");
const source = await readFile(sourcePath, "utf8");

const pathTags = source.match(/<path\b[\s\S]*?>/g) ?? [];

function channel(fill, offset) {
  return Number.parseInt(fill.slice(offset, offset + 2), 16);
}

function luminance(fill) {
  return (
    0.2126 * channel(fill, 1) +
    0.7152 * channel(fill, 3) +
    0.0722 * channel(fill, 5)
  );
}

function controlBounds(tag) {
  const d = tag.match(/\bd="([\s\S]*?)"/)?.[1];
  if (!d) return null;

  const numbers = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  const xs = [];
  const ys = [];
  for (let index = 0; index + 1 < numbers.length; index += 2) {
    xs.push(numbers[index]);
    ys.push(numbers[index + 1]);
  }

  return {
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

const wordmarkPaths = pathTags.filter((tag) => {
  const fill = tag.match(/\bfill="(#[0-9A-Fa-f]{6})"/)?.[1];
  const bounds = controlBounds(tag);
  if (!fill || !bounds) return false;

  // El wordmark son los tres contornos oscuros que cruzan la franja central.
  // Los arcos terminan antes de y=260 o empiezan después de y=520; el claim
  // «Sweet & Salty» vive por debajo de y=636. Estas cotas proceden del SVG
  // original de 816 x 816 y hacen que una alteración del archivo falle fuerte.
  return luminance(fill) < 100 && bounds.minY < 500 && bounds.maxY > 260;
});

if (wordmarkPaths.length !== 3) {
  throw new Error(
    `Se esperaban 3 contornos del wordmark y se encontraron ${wordmarkPaths.length}. ` +
      "Revisa assets/logo-boquita.svg antes de publicar.",
  );
}

const whitePaths = wordmarkPaths.map((tag) =>
  tag
    .replace(/\bfill="#[0-9A-Fa-f]{6}"/, 'fill="#FFFFFF"')
    .replace(/>$/, "/>"),
);

const output = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 250 770 340" role="presentation">
${whitePaths.join("\n")}
</svg>
`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, output, "utf8");
console.log(`Wordmark exacto generado: ${path.relative(root, outputPath)}`);
