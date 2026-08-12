import Link from "next/link";
import { ParallaxTrack } from "@/components/sections/ParallaxTrack";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import type { GalleryItem, HomeContent } from "@/types/content";

/**
 * Galeria: dos filas desbordadas (spec section 6.6). Punto 7 del checklist.
 *
 * Cada item mide 23% del ancho y hay 7 por fila, asi que la tira ocupa ~161% y
 * `.scroller{overflow:hidden}` la recorta: se ven ~4 fotos completas y 2
 * cortadas. Ese recorte es parte del diseno.
 */
const ITEMS_PER_ROW = 7;

function repeatToSeven(unique: GalleryItem[]) {
  return Array.from({ length: ITEMS_PER_ROW }, (_, i) => unique[i % unique.length]!);
}

function Row({ items, row }: { items: GalleryItem[]; row: 1 | 2 }) {
  return (
    <div className={`gallery-row gallery-row--${row}`}>
      <ParallaxTrack row={row}>
        {repeatToSeven(items).map((item, index) => (
          <Link
            className="gallery-item"
            href={item.href}
            key={`${row}-${index}`}
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
  const [row1, row2] = gallery.rows;

  return (
    <section className="section section--no-bottom" id="galeria">
      <div className="container">
        <Reveal as="h2">{gallery.title}</Reveal>
      </div>

      <div className="gallery" data-parallax>
        <Row items={row1} row={1} />
        <Row items={row2} row={2} />
      </div>
    </section>
  );
}
