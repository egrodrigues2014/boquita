import { TestimonialsSlider } from "@/components/sections/TestimonialsSlider";
import { Avatar } from "@/components/ui/Avatar";
import { Reveal } from "@/components/ui/Reveal";
import type { HomeContent } from "@/types/content";

/**
 * Testimonios (spec §6.7). Punto 8 del checklist.
 *
 * La alineación de las flechas con el titular sale de dos números que trabajan
 * juntos: `h2.mb--40` y `.slider{padding-top:95px}`. No tocar uno sin el otro.
 *
 * En esta fase el slider es estático: las 6 tarjetas están en el DOM y se ven 3
 * (el resto quedan recortadas por `overflow:hidden`). Las flechas se renderizan
 * ya en su sitio para poder verificar su geometría, pero deshabilitadas — sin
 * JavaScript no navegan, y una flecha que no hace nada es peor que una apagada.
 * En 4f pasan a ser el slider real.
 *
 * Los avatares son SVG con iniciales, no fotos: no hay caras de clientes reales
 * disponibles e inventar personas con fotos de stock sería deshonesto.
 */
export function Testimonials({
  testimonials,
}: {
  testimonials: HomeContent["testimonials"];
}) {
  return (
    <section className="section">
      <div className="container container--stretch">
        <Reveal as="h2" className="mb--40 w-50-tablet">
          {testimonials.title}
        </Reveal>

        {/* Las 6 tarjetas se renderizan en el servidor y le llegan al slider
            (cliente) como children: sólo viaja la lógica de navegación. */}
        <TestimonialsSlider count={testimonials.items.length}>
          {testimonials.items.map((item, index) => (
            <div
              className="slide"
              key={item.id}
              role="group"
              aria-roledescription="reseña"
              aria-label={`${index + 1} de ${testimonials.items.length}`}
            >
              <article className="review-card">
                <div className="review-head">
                  <Avatar name={item.name} />
                  <div>
                    <div className="review-name">{item.name}</div>
                    <div className="review-role">{item.role}</div>
                  </div>
                </div>
                <p>{item.quote}</p>
              </article>
            </div>
          ))}
        </TestimonialsSlider>
      </div>
    </section>
  );
}
