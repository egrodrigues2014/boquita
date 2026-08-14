import { TestimonialsSlider } from "@/components/sections/TestimonialsSlider";
import { Reveal } from "@/components/ui/Reveal";
import type { HomeContent } from "@/types/content";

/**
 * Testimonios (spec §6.7). Punto 8 del checklist.
 *
 * La alineación de las flechas con el titular sale de dos números que trabajan
 * juntos: `h2.mb--40` y `.slider{padding-top:95px}`. No tocar uno sin el otro.
 *
 * **La tarjeta no lleva retrato**, y es una decisión, no un olvido: el spec §7
 * define un `.review-avatar` de 70×70 obligatorio. No hay fotos de clientes
 * reales, y las caras de stock quedan descartadas para un negocio real. Hubo un
 * SVG con iniciales como sustituto y también se retiró: ocupaba el sitio de una
 * foto sin aportar lo que una foto aporta. Desvío D-34.
 *
 * ⚠ Con el retrato fuera, `.review-head` **dejó de ser flex**. Si alguien le
 * devuelve el `display:flex`, el nombre y el rol se colocan uno al lado del
 * otro en vez de apilarse.
 *
 * Devolver `null` con la lista vacía es la válvula para apagar el bloque desde
 * el contenido, sin tocar código.
 */
export function Testimonials({
  testimonials,
}: {
  testimonials: HomeContent["testimonials"];
}) {
  if (testimonials.items.length === 0) return null;

  return (
    <section className="section testimonials-section">
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
                  <div className="review-name">{item.name}</div>
                  <div className="review-role">{item.role}</div>
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
