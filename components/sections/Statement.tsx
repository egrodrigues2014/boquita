import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollColorText } from "@/components/ui/ScrollColorText";
import type { HomeContent } from "@/types/content";

/**
 * Banda editorial: una sola secuencia de lectura para la historia corta de Ale.
 */
export function Statement({ mediaText }: { mediaText: HomeContent["mediaText"] }) {
  const storySegments = [
    { text: `${mediaText.titleTop} ${mediaText.titleBottom}`, tone: "title" },
    { text: "Ale Budowski hornea en su", tone: "body" },
    { text: "casa de Santa Ana desde 2019.", tone: "body" },
    { text: "Sin conservantes y sin mezclas", tone: "body" },
    { text: "industriales: recetas propias, tandas", tone: "body" },
    { text: "pequeñas y el sabor de lo hecho a mano.", tone: "body" },
  ] as const;

  return (
    <section className="section statement-section" aria-labelledby="statement-title">
      <div className="container">
        <div className="statement-grid">
          <div className="statement-copy">
            <ScrollColorText
              id="statement-title"
              segments={storySegments}
              className="statement-story"
            />
          </div>

          <Reveal className="statement-photo" delay={200}>
            <Picture image={mediaText.poster} className="statement-photo-img" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
