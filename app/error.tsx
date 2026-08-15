"use client";

import { useEffect } from "react";
import { buildDirectWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Límite de error de la aplicación.
 *
 * Sin esto, un fallo de render muestra la pantalla por defecto de Next: una
 * traza en desarrollo y una página en blanco con texto genérico en producción.
 * Para una tienda, eso es perder el pedido sin que el cliente sepa qué hacer,
 * así que aquí siempre queda una vía de salida por WhatsApp.
 *
 * No se muestra `error.message` al visitante: puede contener detalles internos y
 * no le dice nada útil. Va a la consola, donde sirve para depurar.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // El `digest` es lo que permite cruzar este fallo con los logs del servidor.
    console.error("Fallo de render:", error.digest ?? "sin digest", error);
  }, [error]);

  return (
    <main id="contenido">
      <section className="section">
        <div className="container container--start">
          <p className="h6-sans primary">Algo salió mal</p>
          <h1>Se nos cayó la bandeja</h1>
          <p className="lead mt-20 prose-narrow">
            Hubo un error al cargar esta parte del sitio. Puedes intentarlo de nuevo o
            escribirnos por WhatsApp y te atendemos directamente.
          </p>

          <div className="btn-group">
            <button type="button" className="btn" onClick={reset}>
              Intentar de nuevo
            </button>
            <a
              className="btn btn--ghost"
              href={buildDirectWhatsAppUrl("error")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escríbenos por WhatsApp
              <span className="sr-only"> (abre una pestaña nueva)</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
