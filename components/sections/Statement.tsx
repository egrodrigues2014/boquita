import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollColorText } from "@/components/ui/ScrollColorText";
import type { HomeContent } from "@/types/content";

/**
 * Banda editorial: una sola secuencia de lectura para la historia corta de Ale.
 *
 * El texto sale ENTERO de content/home.ts. Antes vivía aquí, partido a mano en
 * cinco trozos que replicaban `mediaText.body` palabra por palabra mientras el
 * original quedaba sin usar: dos copias del mismo contenido, libres de
 * desincronizarse sin que nada avisara.
 *
 * `ScrollColorText` es quien reparte el titular y el cuerpo en dos elementos
 * (<h2> + <p>), y su raíz es `display: contents`, así que ambos son celdas
 * directas de `.statement-grid` y el titular puede ocupar la fila completa.
 */
export function Statement({ mediaText }: { mediaText: HomeContent["mediaText"] }) {
  return (
    <section className="section statement-section" aria-labelledby="statement-title">
      <div className="container">
        <div className="statement-media-layout">
          <Reveal className="statement-photo" delay={100}>
            <Picture image={mediaText.poster} className="statement-photo-img" />
          </Reveal>

          <ScrollColorText
            id="statement-title"
            title={`${mediaText.titleTop} ${mediaText.titleBottom}`}
            body={mediaText.body}
            className="statement-story"
          />
        </div>
      </div>
    </section>
  );
}
