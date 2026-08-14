import Link from "next/link";
import { ParallaxTrack } from "@/components/sections/ParallaxTrack";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import type { GalleryItem, HomeContent } from "@/types/content";

/**
 * Galeria: filas desbordadas (spec section 6.6). Punto 7 del checklist.
 *
 * Cada item mide 23% del ancho y hay 7 por fila, asi que la tira ocupa ~161% y
 * `.scroller{overflow:hidden}` la recorta: se ven ~4 fotos completas y 2
 * cortadas. Ese recorte es parte del diseno.
 */
const ITEMS_PER_ROW = 7;

function repeatToSeven(unique: GalleryItem[]) {
  return Array.from({ length: ITEMS_PER_ROW }, (_, i) => unique[i % unique.length]!);
}

function Row({ items, index }: { items: GalleryItem[]; index: number }) {
  const motionRow = index % 2 === 0 ? 1 : 2;
  const spacingRow = index === 0 ? 1 : 2;

  return (
    <div className={`gallery-row gallery-row--${spacingRow}`}>
      <ParallaxTrack row={motionRow}>
        {repeatToSeven(items).map((item, index) => (
          <Link
            className="gallery-item"
            href={item.href}
            key={`${motionRow}-${item.image.src}-${index}`}
            aria-label={`Ver producto: ${item.label}`}
          >
            <Picture image={item.image} className="gallery-img" />
          </Link>
        ))}
      </ParallaxTrack>
    </div>
  );
}

export function Gallery({ gallery }: { gallery: HomeContent["gallery"] }) {
  return (
    <section className="section section--no-bottom gallery-section" id="galeria">
      <div className="container">
        <Reveal as="h2">{gallery.title}</Reveal>
      </div>

      <div className="gallery" data-parallax>
        {gallery.rows.map((items, index) => (
          <Row items={items} index={index} key={`gallery-row-${index}`} />
        ))}
      </div>
    </section>
  );
}
