import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { CONTACT } from "@/lib/contact";

/**
 * Tarjeta de Open Graph — la imagen que aparece al pegar el enlace en WhatsApp,
 * que es el canal principal de la tienda.
 *
 * El layout se compone con `ImageResponse` y no con un archivo estático para que
 * los textos salgan del contenido y no haya que reeditar una imagen cada vez que
 * cambia el eslogan.
 *
 * Sin `next/font` aquí: `ImageResponse` necesita los bytes de la fuente y
 * cargarlos añadiría un fetch al build por una tarjeta que casi nadie mira en
 * detalle. Las familias de sistema con el peso adecuado dan un resultado digno.
 *
 * ── Por qué sale JPEG y no PNG ────────────────────────────────────────────
 * `ImageResponse` sólo emite PNG, y resvg lo escribe en color completo: con la
 * foto dentro, la tarjeta pesaba **567 KB**. Para un thumbnail que WhatsApp
 * reduce a unos cientos de píxeles eso es absurdo, y además roza el tamaño en el
 * que los rastreadores de enlaces empiezan a abandonar la descarga y a no
 * mostrar vista previa. Recomprimir a JPEG deja la MISMA imagen por una fracción
 * del peso. Una ruta de metadata es un route handler, así que puede devolver un
 * `Response` cualquiera mientras `contentType` lo declare.
 *
 * `sharp` es devDependency y aquí no es un problema: la ruta se hornea en el
 * build —donde Vercel sí instala devDependencies— y lo que se despliega es el
 * JPEG ya resuelto. `serverExternalPackages` en `next.config.ts` evita que el
 * binario nativo se intente empaquetar.
 *
 * ── La foto ───────────────────────────────────────────────────────────────
 * Ocupa el tercio derecho. Sin ella la tarjeta era un rectángulo de texto, y
 * esto compite en un chat con fotos de comida: lo que gana el toque es el
 * queque, no el eslogan. La genera `scripts/build-images.mjs` con el mismo
 * recorte que el hero, y es JPEG porque Satori no decodifica el WebP ni el AVIF
 * de `public/img/hero/`.
 *
 * ⚠ Los bytes se leen con `readFileSync`, NO con el
 * `fetch(new URL("./x.jpg", import.meta.url))` que documenta Next para fuentes:
 * webpack reescribe ese patrón a una ruta de asset relativa
 * (`/_next/static/media/og-hero.<hash>.jpg`) y `fetch` no puede parsear una URL
 * sin origen, así que el build **falla** al prerenderizar esta ruta.
 */

export const alt = "Boquita — Sweet & Salty · Repostería artesanal en Santa Ana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

/** El acento dorado de la marca, como franja izquierda. */
const BORDE = 24;
const FOTO_ANCHO = 480;

const FOTO_SRC = `data:image/jpeg;base64,${readFileSync(
  path.join(process.cwd(), "app", "og-hero.jpg"),
).toString("base64")}`;

export default async function OpengraphImage() {
  const tarjeta = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FAF5EC",
          borderLeft: `${BORDE}px solid #E8A81B`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "64px 48px 64px 56px",
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#8A5A06",
              fontWeight: 600,
            }}
          >
            Repostería artesanal en Santa Ana
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 24,
              fontSize: 96,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            <span style={{ color: "#3A2A1A" }}>Dulce</span>
            <span style={{ color: "#B07208" }}>y salado</span>
          </div>

          <div style={{ marginTop: 28, fontSize: 28, lineHeight: 1.35, color: "#6B5B4D" }}>
            Queques, cupcakes, galletas y dulces horneados por encargo en Santa Ana.
          </div>

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            <span style={{ color: "#3A2A1A" }}>Boquita — Sweet &amp; Salty</span>
            <span style={{ color: "#8A5A06", marginTop: 6 }}>{CONTACT.whatsappDisplay}</span>
          </div>
        </div>

        <img
          src={FOTO_SRC}
          alt=""
          width={FOTO_ANCHO}
          height={size.height}
          style={{ objectFit: "cover" }}
        />
      </div>
    ),
    size,
  );

  const png = Buffer.from(await tarjeta.arrayBuffer());
  const jpeg = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();

  // Next le cuelga a esta URL un hash de contenido (`/opengraph-image?<hash>`),
  // así que el archivo bajo una URL dada no cambia nunca: cachear a un año es
  // seguro y le ahorra la descarga a cada rastreador que revisite el enlace.
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
