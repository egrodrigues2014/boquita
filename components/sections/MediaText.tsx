import { Picture } from "@/components/ui/Picture";
import type { HomeContent } from "@/types/content";

/**
 * Media + texto: grid de 2 columnas asimétrico (spec §6.3).
 *
 * El botón de play son tres capas concéntricas (§3.4). En esta fase es un enlace
 * directo al reel; en la fase de interacciones pasa a abrir el lightbox.
 *
 * DESVÍO D-10: el spec declara `.media` como `background:url(...) 50%/cover`.
 * Un background no admite srcset ni lazy loading, y es una foto de 493×300 que
 * se enviaría a tamaño completo a un móvil de 390px. Pasa a un `<img srcset>`
 * posicionado en absoluto dentro del `.media`, conservando su `height:300px` y
 * el centrado flex.
 */
export function MediaText({ mediaText }: { mediaText: HomeContent["mediaText"] }) {
  return (
    <section className="section" id="video">
      <div className="container">
        <div className="media-text">
          <div className="media">
            <Picture image={mediaText.poster} className="media-img" />
            <a
              className="play-wrap"
              href={mediaText.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={mediaText.videoLabel}
            >
              <span className="play-ring" aria-hidden="true" />
              <span className="play-ring--h" aria-hidden="true" />
              <span className="play-icon" aria-hidden="true">
                ▶
              </span>
            </a>
          </div>

          <div className="media-copy">
            <h2>
              {mediaText.titleTop}
              <br />
              {mediaText.titleBottom}
            </h2>
            <p className="mt-20 w-90-desktop">{mediaText.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
