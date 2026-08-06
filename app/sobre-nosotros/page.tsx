import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/ui/JsonLd";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import { about } from "@/content/pages";
import { getHomeContent } from "@/lib/homeContent";
import { SITE_URL } from "@/lib/seo";

/**
 * Sobre nosotros: la historia, cómo se hornea, entregas y preguntas frecuentes.
 *
 * Existe porque el dropdown del nav ya prometía «Entregas y zonas» y «Preguntas
 * frecuentes», y esos enlaces apuntaban a la sección de servicio de la portada,
 * que no cubre ninguna de las dos cosas. Una promesa incumplida en el nav es
 * peor que un nav más corto.
 *
 * Las preguntas frecuentes llevan JSON-LD `FAQPage`: Google las puede mostrar
 * desplegadas en el resultado de búsqueda, y para un negocio local las dudas de
 * «¿con cuánta anticipación?» y «¿hacen entregas?» son justo lo que la gente
 * escribe en el buscador.
 */

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Boquita nació en la cocina de casa de Ale Budowski, en Santa Ana. " +
    "Cómo horneamos, zonas de entrega y las preguntas que más nos hacen.",
  alternates: { canonical: "/sobre-nosotros" },
};

export default async function SobreNosotrosPage() {
  // Sólo por el nav y el pie: ambos salen del contenido de portada, que puede
  // depender de la tabla `products`.
  const home = await getHomeContent();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: about.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${SITE_URL}/sobre-nosotros`,
    name: "Sobre Boquita — Sweet & Salty",
    about: { "@id": `${SITE_URL}#negocio` },
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={aboutJsonLd} />
      <Navbar nav={home.nav} />

      <main id="contenido">
        <section className="section section--no-bottom">
          <div className="container container--start">
            <p className="h6-sans primary">{about.eyebrow}</p>
            <h1>{about.title}</h1>
            <p className="lead mt-20 prose-narrow">{about.lead}</p>
          </div>
        </section>

        {/* La foto de la bandeja de polvorones: es la que muestra el obrador real. */}
        <section className="section section--no-bottom">
          <div className="container">
            <Picture image={home.service.image} className="about-hero-img" />
          </div>
        </section>

        <section className="section">
          <div className="container container--start">
            <div className="prose">
              {about.sections.map((block) => (
                <Reveal as="article" key={block.id} className="prose-block">
                  {/* `scroll-margin-top` en el CSS: sin él, el navbar absoluto
                      tapa el titular al llegar por un enlace con ancla. */}
                  <h2 id={block.id}>{block.title}</h2>
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 30)}>{paragraph}</p>
                  ))}
                </Reveal>
              ))}

              <Reveal as="article" className="prose-block">
                <h2 id="preguntas-frecuentes">Preguntas frecuentes</h2>
                <dl className="faq">
                  {about.faq.map((item) => (
                    <div className="faq-item" key={item.question}>
                      <dt>{item.question}</dt>
                      <dd>{item.answer}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal className="prose-block">
                <h2>¿Te quedó alguna duda?</h2>
                <p>
                  Escribinos por WhatsApp y te contestamos. O echá un ojo al{" "}
                  <Link href="/tienda">catálogo completo</Link> si ya sabés lo que querés.
                </p>
                <div className="btn-group">
                  <a
                    className="btn"
                    href={home.nav.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Escribinos por WhatsApp
                    <span className="sr-only"> (abre una pestaña nueva)</span>
                  </a>
                  <Link className="btn btn--ghost" href="/tienda">
                    Ver el catálogo
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <Footer footer={home.footer} />
    </>
  );
}
