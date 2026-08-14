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
 * `ScrollColorText` reparte el titular y el cuerpo en dos elementos (<h2> + <p>)
 * y no se ocupa de la entrada: eso lo hace el <Reveal> que lo envuelve.
 *
 * ── Las DOS celdas suben a la vez, y no por casualidad ─────────────────────
 * Los dos <Reveal> comparten `delay={100}` y la transición de 0.6s de
 * `05-components.css`. Lo que sincroniza el DISPARO es la geometría: a ≥992 la
 * columna de texto se estira a la altura de la foto (`align-items: stretch` en
 * 12-statement.css), así que ambas celdas tienen el mismo borde superior y la
 * misma altura, y cruzan el `threshold: 0.15` del observer compartido en el
 * mismo tick.
 *
 * Antes no era así: la foto subía con <Reveal>, el <p> subía por su cuenta con
 * un timing propio (0.95s/120ms) y el <h2> no subía en absoluto.
 */
export function Statement({ mediaText }: { mediaText: HomeContent["mediaText"] }) {
  return (
    <section className="section statement-section" aria-labelledby="statement-title">
      <div className="container">
        <div className="statement-media-layout">
          <Reveal className="statement-photo" delay={100}>
            <Picture image={mediaText.poster} className="statement-photo-img" />
          </Reveal>

          <Reveal className="statement-story" delay={100}>
            {/* `fitTo`: el párrafo reparte su interlineado para llenar la banda
                que queda bajo el titular, hasta el pie de la foto. */}
            <ScrollColorText
              id="statement-title"
              title={`${mediaText.titleTop} ${mediaText.titleBottom}`}
              body={mediaText.body}
              fitTo=".statement-photo"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
