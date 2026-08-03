"use client";

import { useEffect } from "react";

/**
 * Último recinto: sólo se usa si falla el propio `layout.tsx`.
 *
 * A este nivel el layout raíz NO se ha renderizado, así que este componente debe
 * emitir sus propios `<html>` y `<body>` — y tampoco puede contar con que las
 * hojas de estilo o las fuentes estén cargadas. De ahí los estilos en línea: es
 * el único caso del proyecto donde están justificados.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error("Fallo del layout raíz:", error.digest ?? "sin digest", error);
  }, [error]);

  return (
    <html lang="es-CR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          background: "#faf5ec",
          color: "#3a2a1a",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: 40, margin: "0 0 16px", textTransform: "uppercase" }}>
            Boquita
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, margin: "0 0 28px", color: "#6b5b4d" }}>
            El sitio no pudo cargarse. Escribinos por WhatsApp al{" "}
            <strong>+506 6276 2196</strong> y te atendemos directamente.
          </p>
          <a
            href="https://wa.me/50662762196"
            style={{
              display: "inline-block",
              padding: "14px 30px",
              borderRadius: 5,
              background: "#e8a81b",
              color: "#3a2a1a",
              fontSize: 18,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </body>
    </html>
  );
}
