import { ImageResponse } from "next/og";
import { CONTACT } from "@/lib/contact";

/**
 * Tarjeta de Open Graph — la imagen que aparece al pegar el enlace en WhatsApp,
 * que es el canal principal de la tienda.
 *
 * Se genera con `ImageResponse` en vez de servir un PNG estático porque así los
 * textos salen del contenido y no hay que reeditar un archivo cada vez que cambia
 * el eslogan.
 *
 * Sin `next/font` aquí: `ImageResponse` necesita los bytes de la fuente y
 * cargarlos añadiría un fetch al build por una tarjeta que casi nadie mira en
 * detalle. Las familias de sistema con el peso adecuado dan un resultado
 * perfectamente digno.
 */

export const alt = "Boquita — Sweet & Salty · Repostería artesanal en Santa Ana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "#FAF5EC",
          // Franja dorada a la izquierda, como el acento de la marca.
          borderLeft: "24px solid #E8A81B",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 4,
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
            marginTop: 28,
            fontSize: 104,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          <span style={{ color: "#3A2A1A" }}>Dulce</span>
          <span style={{ color: "#B07208" }}>y salado</span>
        </div>

        <div style={{ marginTop: 36, fontSize: 30, color: "#6B5B4D", maxWidth: 820 }}>
          Queques, cupcakes, galletas y dulces horneados por encargo en Santa Ana.
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 26,
            color: "#3A2A1A",
            fontWeight: 600,
          }}
        >
          <span>Boquita — Sweet &amp; Salty</span>
          <span style={{ color: "#8A5A06" }}>{CONTACT.whatsappDisplay}</span>
        </div>
      </div>
    ),
    size,
  );
}
