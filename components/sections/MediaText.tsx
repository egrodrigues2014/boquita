import { Picture } from "@/components/ui/Picture";
import type { HomeContent } from "@/types/content";

/**
 * Foto + texto: presenta el origen de Boquita sin overlay de video.
 */
export function MediaText({ mediaText }: { mediaText: HomeContent["mediaText"] }) {
  return (
    <section className="section media-text-section" id="video">
      <div className="container">
        <div className="media-text">
          <div className="media" aria-label={mediaText.poster.alt}>
            <Picture image={mediaText.poster} className="media-img" />
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
