import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boquita — Sweet & Salty · Repostería artesanal en Río Oro, Santa Ana",
};

/**
 * Marcador de la Fase 0.
 *
 * En la Fase 1 este archivo pasa a ser el Server Component que renderiza las
 * 9 secciones en el orden exacto del §6 del spec:
 *   Navbar · Hero · Statement · MediaText · OverlapMenu (wide-img + bloque
 *   crema) · Service · Gallery · Testimonials · Footer
 */
export default function HomePage() {
  return (
    <main id="contenido">
      <section className="section">
        <div className="container">
          <p className="h6-sans primary">Repostería artesanal en Río Oro</p>
          <h1 className="h1-hero text-center">
            Dulce y salado
            <br />
            <span className="text-primary">hecho en casa</span>
          </h1>
          <p className="lead text-center">
            Cimientos listos: tokens, escala tipográfica y componentes base. Las secciones del
            layout llegan en la Fase 1.
          </p>
          <div className="btn-group">
            <a className="btn" href="/dev/tokens">
              Ver especímenes
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
