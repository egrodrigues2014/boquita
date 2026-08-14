import { Picture } from "@/components/ui/Picture";
import type { HomeContent } from "@/types/content";

/**
 * Servicio / sobre nosotros (spec §6.5). Punto 6 del checklist.
 *
 * El corte con el catálogo reparte `--home-section-gap` entre los dos fondos:
 * media separación crema arriba y media blanca antes de esta rejilla. Hacia la
 * galería no añade padding inferior, porque la siguiente sección reserva el
 * ritmo completo.
 *
 * Exactamente 2 métricas: `.stats` es una rejilla de 2 columnas.
 */
export function Service({ service }: { service: HomeContent["service"] }) {
  return (
    <section className="section section--overlap-up" id="sobre">
      <div className="container">
        <div className="service-grid">
          <Picture image={service.image} className="service-img" />

          <div className="service-copy">
            <p className="h6-sans">{service.eyebrow}</p>
            <h2>
              {service.titleTop}
              <br />
              {service.titleBottom}
            </h2>
            <p className="mt-20">{service.body}</p>

            <div className="stats">
              {service.metrics.map((metric) => (
                <div key={metric.label}>
                  <div className="stat-num">{metric.value}</div>
                  <p>{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
