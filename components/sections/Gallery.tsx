import { ParallaxTrack } from "@/components/sections/ParallaxTrack";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import type { HomeContent, ImageRef } from "@/types/content";

/**
 * Galería: dos filas desbordadas (spec §6.6). Punto 7 del checklist.
 *
 * Cada item mide 23% del ancho y hay 7 por fila, así que la tira ocupa ~161% y
 * `.scroller{overflow:hidden}` la recorta: se ven ~4 fotos completas y 2
 * cortadas. **Ese recorte es parte del diseño, no un bug.**
 *
 * Son 4 fotos únicas por fila, repetidas hasta 7. Como el `src` y el `sizes` de
 * las repetidas son idénticos, el navegador hace 8 peticiones, no 14.
 *
 * En esta fase las filas son estáticas. El parallax (que las mueve en
 * direcciones opuestas según el progreso de scroll) llega en 4e, envolviendo
 * estos mismos hijos servidos desde el servidor.
 */
const ITEMS_PER_ROW = 7;

/**
 * Repite las 4 únicas hasta llegar a 7, en orden cíclico.
 * Devuelve también el índice ÚNICO de cada una, que es el que necesita el
 * lightbox: al pulsar la 6ª celda debe abrir la 2ª foto, no la sexta.
 */
function repeatToSeven(unique: ImageRef[], offset: number) {
  return Array.from({ length: ITEMS_PER_ROW }, (_, i) => {
    const uniqueIndex = i % unique.length;
    return { image: unique[uniqueIndex]!, lightboxIndex: offset + uniqueIndex };
  });
}

function Row({ images, row, offset }: { images: ImageRef[]; row: 1 | 2; offset: number }) {
  return (
    <div className={`gallery-row gallery-row--${row}`}>
      {/* ParallaxTrack es cliente, pero los 7 <img> le llegan como children del
          servidor: no entran en el bundle de JavaScript. */}
      <ParallaxTrack row={row}>
        {repeatToSeven(images, offset).map(({ image, lightboxIndex }, index) => (
          <button
            type="button"
            className="gallery-item"
            key={`${row}-${index}`}
            data-lightbox="gallery"
            data-lightbox-index={lightboxIndex}
            aria-label={`Ampliar foto: ${image.alt}`}
          >
            <Picture image={image} className="gallery-img" />
          </button>
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
        {/* El offset alinea los índices con la lista plana de 8 que recibe el
            lightbox: fila 1 → 0-3, fila 2 → 4-7. */}
        <Row images={row1} row={1} offset={0} />
        <Row images={row2} row={2} offset={row1.length} />
      </div>
    </section>
  );
}
