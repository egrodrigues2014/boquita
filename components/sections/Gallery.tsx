import { Picture } from "@/components/ui/Picture";
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

/** Repite las 4 únicas hasta llegar a 7, en orden cíclico. */
function repeatToSeven(unique: ImageRef[]): ImageRef[] {
  return Array.from({ length: ITEMS_PER_ROW }, (_, i) => unique[i % unique.length]!);
}

function Row({ images, row }: { images: ImageRef[]; row: 1 | 2 }) {
  return (
    <div className={`gallery-row gallery-row--${row}`}>
      <div className="scroller">
        <div className={`track track--${row}`}>
          {repeatToSeven(images).map((image, index) => (
            <div className="gallery-item" key={`${row}-${index}`}>
              <Picture image={image} className="gallery-img" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Gallery({ gallery }: { gallery: HomeContent["gallery"] }) {
  const [row1, row2] = gallery.rows;

  return (
    <section className="section section--no-bottom" id="galeria">
      <div className="container">
        <h2>{gallery.title}</h2>
      </div>

      <div className="gallery" data-parallax>
        <Row images={row1} row={1} />
        <Row images={row2} row={2} />
      </div>
    </section>
  );
}
