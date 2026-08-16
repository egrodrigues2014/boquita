import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { home } from "@/content/home";
import { CONTACT } from "@/lib/contact";

/**
 * Tarjeta de Open Graph — la imagen que aparece al pegar el enlace en WhatsApp,
 * que es el canal principal de la tienda.
 *
 * Reproduce el hero: la foto a sangre bajo un velo oscuro, el wordmark de la
 * marca en blanco y el tagline debajo. Se compone con `ImageResponse` y no con
 * un archivo estático para que los textos salgan de `content/home.ts` y no haya
 * que reeditar una imagen cada vez que Ale cambie el eslogan.
 *
 * ── Por qué aquí no hace falta ninguna fuente ─────────────────────────────
 * «Boquita» NO es tipografía: es `wordmark-boquita-white.svg`, los tres
 * contornos exactos del logo maestro. Lo impone **D-39** en docs/DEVIATIONS.md
 * —«una fuente aproximada altera la B, la q, la inclinación y los remates»— y de
 * paso resuelve el problema difícil, porque `ImageResponse` necesita los BYTES
 * de la fuente y en el repo no hay ni un TTF/OTF/WOFF: `next/font` sólo
 * materializa WOFF2, que Satori no acepta. El resto de textos van en las
 * familias de sistema, que a este tamaño dan un resultado digno.
 *
 * El wordmark se rasteriza a PNG con sharp en vez de pasarle el SVG a Satori
 * porque el fichero **no trae `width` ni `height`**, sólo
 * `viewBox="0 250 770 340"` con el `min-y` en 250, y resvg calcula mal el
 * intrínseco en ese caso. Se lee del SVG y no de un PNG commiteado para que el
 * wordmark conserve una sola fuente de verdad: si `npm run brand:wordmark` lo
 * regenera, la tarjeta lo sigue sin que nadie tenga que acordarse.
 *
 * ── Por qué sale JPEG y no PNG ────────────────────────────────────────────
 * `ImageResponse` sólo emite PNG, y resvg lo escribe en color completo: con una
 * foto dentro eso son cientos de KB para un thumbnail que WhatsApp reduce, y
 * roza el tamaño en el que los rastreadores abandonan la descarga y no muestran
 * vista previa. Recomprimir a JPEG deja la MISMA imagen por una fracción del
 * peso. Una ruta de metadata es un route handler, así que puede devolver el
 * `Response` que quiera mientras `contentType` lo declare.
 *
 * `sharp` es devDependency y aquí no es un problema: la ruta se hornea en el
 * build —donde Vercel sí instala devDependencies— y lo que se despliega es el
 * JPEG ya resuelto. `serverExternalPackages` en `next.config.ts` evita que el
 * binario nativo se intente empaquetar.
 *
 * ⚠ Los bytes se leen con `readFileSync`, NO con el
 * `fetch(new URL("./x.jpg", import.meta.url))` que documenta Next para fuentes:
 * webpack reescribe ese patrón a una ruta de asset relativa
 * (`/_next/static/media/og-hero.<hash>.jpg`) y `fetch` no puede parsear una URL
 * sin origen, así que el build **falla** al prerenderizar esta ruta. Los dos
 * ficheros que se leen están en `outputFileTracingIncludes`.
 */

export const alt = "Boquita — Sweet & Salty · Repostería artesanal en Santa Ana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

/** El acento dorado de la marca, como franja izquierda. */
const BORDE = 24;
const ORO = "#E8A81B";

/**
 * El wordmark a 620px de ancho; el viewBox es 770×340, así que el alto sale de
 * mantener esa proporción. Se rasteriza al doble para que los contornos no
 * queden dentados al reducirlos.
 */
const MARCA_ANCHO = 620;
const MARCA_ALTO = Math.round((MARCA_ANCHO * 340) / 770);

/**
 * El velo. No es decoración: el queque va sobre un plato BLANCO y la foto lleva
 * azúcar glas encima, así que sin oscurecerla el wordmark blanco desaparece
 * justo en el centro. Plano y no degradado porque el soporte de
 * `linear-gradient` en Satori es irregular y un rgba sólido es predecible.
 */
const VELO = "rgba(28,18,10,0.66)";

/**
 * Rutas, no bytes. **Importar este módulo no puede tocar el disco**, y no es una
 * preferencia de estilo: Next importa este fichero para leer `alt`, `size` y
 * `contentType` al resolver la metadata, así que sus efectos de importación se
 * ejecutan en el bundle de CUALQUIER ruta que resuelva metadata fuera del build.
 * En Vercel esas funciones no llevan `public/` —se sirve como estático desde el
 * CDN— ni `app/`, de modo que un `readFileSync` aquí arriba revienta la
 * resolución de metadata entera: el `<head>` sale sin `<title>`, Next arrastra el
 * error al cliente y el límite de error sustituye la página ya pintada.
 *
 * Fue exactamente eso: medido el 17 ago 2026 contra producción, con `/tienda`
 * —la única ruta dinámica— cayéndose al hidratar y las revalidaciones ISR de `/`
 * fallando en silencio. Bisecado a `e8188e5`, que fue quien añadió la lectura de
 * `public/`; `9ac4b7e`, que sólo leía de `app/`, todavía se servía bien.
 */
const RUTA_FOTO = ["app", "og-hero.jpg"];
const RUTA_MARCA = ["public", "img", "brand", "wordmark-boquita-white.svg"];

export default async function OpengraphImage() {
  // Dentro del handler: aquí sí corre en la función de `/opengraph-image`, que es
  // la única a la que `outputFileTracingIncludes` le mete estos dos ficheros.
  const fotoSrc = `data:image/jpeg;base64,${readFileSync(
    path.join(process.cwd(), ...RUTA_FOTO),
  ).toString("base64")}`;
  const marcaSvg = readFileSync(path.join(process.cwd(), ...RUTA_MARCA));

  const marcaPng = await sharp(marcaSvg, { density: 300 })
    .resize({ width: MARCA_ANCHO * 2 })
    .png()
    .toBuffer();
  const marcaSrc = `data:image/png;base64,${marcaPng.toString("base64")}`;

  const tarjeta = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        <img
          src={fotoSrc}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: VELO,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: BORDE,
            height: "100%",
            backgroundColor: ORO,
          }}
        />

        {/* Bloque central: ópticamente centrado, con el pie anclado abajo aparte. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: `0 64px 0 ${64 + BORDE}px`,
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: ORO,
              fontWeight: 600,
            }}
          >
            {home.hero.eyebrow}
          </div>

          <img
            src={marcaSrc}
            alt=""
            width={MARCA_ANCHO}
            height={MARCA_ALTO}
            style={{ marginTop: 18 }}
          />

          <div style={{ marginTop: 12, fontSize: 40, color: ORO }}>{home.hero.tagline}</div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 44,
            left: 0,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          <span>Boquita — Sweet &amp; Salty</span>
          <span style={{ margin: "0 14px", color: ORO }}>·</span>
          <span>{CONTACT.whatsappDisplay}</span>
        </div>
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
