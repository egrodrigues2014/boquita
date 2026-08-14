import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ProductWheelCarousel } from "@/components/sections/ProductWheelCarousel";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/ui/Reveal";
import { about, isListParagraph, paragraphText } from "@/content/pages";
import { CONTACT } from "@/lib/contact";
import { getCatalog } from "@/lib/db/catalog";
import { getHomeContent } from "@/lib/homeContent";
import { SITE_URL } from "@/lib/seo";
import { toShopSearchSources } from "@/lib/shopSearch";

/**
 * Sobre nosotros: quién está detrás, cómo hornea Ale, qué hay en el catálogo,
 * presentaciones, ocasiones, pedidos y entregas, y las preguntas frecuentes.
 *
 * El texto es el de `docs/boquita-sobre-nosotros.md` y va en primera persona del
 * singular: es la única página donde habla Ale, no la marca.
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
  title: "Sobre Nosotros",
  description:
    "Ale Budowski hornea Boquita en su cocina de Santa Ana: recetas propias en tandas " +
    "pequeñas. Cómo horneamos, qué hay en el catálogo, pedidos, entregas y preguntas frecuentes.",
  alternates: { canonical: "/sobre-nosotros" },
};

export default async function SobreNosotrosPage() {
  // Sólo por el nav y el pie: ambos salen del contenido de portada, que puede
  // depender de la tabla `products`.
  const [catalog, home] = await Promise.all([getCatalog(), getHomeContent()]);

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
      <Navbar nav={home.nav} searchProducts={toShopSearchSources(catalog)} />

      {/* `editorial-page` comparte carril y ritmo con el aviso legal; `about-page`
          conserva sólo los detalles propios de esta página. */}
      <main id="contenido" className="editorial-page about-page">
        <section className="section section--no-bottom">
          <div className="container container--start">
            <p id="sobre-boquita" className="h6-sans primary">
              {about.eyebrow}
            </p>
            <h1>{about.title}</h1>
            {/* Los dos párrafos comparten el cuerpo editorial para que la
                introducción se lea como un único bloque. Sin `.prose-narrow`:
                aquí el texto ocupa el carril completo. */}
            {about.lead.map((paragraph) => (
              <p key={paragraph.slice(0, 30)} className="mt-20">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {/* Rueda decorativa con todas las fotos del catálogo, a ancho de viewport. */}
        <section className="section section--no-bottom">
          <ProductWheelCarousel products={catalog} />
        </section>

        <section className="section">
          <div className="container container--start">
            {/* `prose--wide`: todas las secciones, la FAQ y el cierre cuelgan de
                aquí, así que el ancho de la página entera se decide en esta clase. */}
            <div className="prose prose--wide">
              {about.sections.map((block) => (
                <Reveal as="article" key={block.id} className="prose-block">
                  {/* `scroll-margin-top` en el CSS: sin él, el navbar absoluto
                      tapa el titular al llegar por un enlace con ancla. */}
                  <h2 id={block.id}>{block.title}</h2>
                  {block.paragraphs.map((paragraph) => {
                    const clave = paragraphText(paragraph).slice(0, 30);

                    // ⚠ El `<ul>` sale HERMANO de los `<p>`, nunca dentro de uno.
                    // El parser de HTML cierra un `<p>` abierto en cuanto ve un
                    // `<ul>`, así que el marcado del servidor (`…</p><ul>`) no
                    // coincidiría con el árbol de React (`<p><ul>…</ul></p>`): la
                    // hidratación fallaría sin romper ningún test, sólo con un
                    // aviso en consola, y quedaría un `<p>` vacío con su margen.
                    // Por eso la bifurcación va aquí y no dentro del párrafo.
                    if (isListParagraph(paragraph)) {
                      return (
                        // `role="list"`: `02-reset.css` pone `list-style: none` a
                        // todo `<ul>`, y con eso WebKit le quita al elemento las
                        // semánticas de lista — VoiceOver deja de anunciar «lista,
                        // 6 elementos», que es justo lo que esta sección es. En
                        // Chromium no cambia nada, y la suite entera es Chromium:
                        // si se cae, aquí no se nota.
                        <ul className="prose-list" role="list" key={clave}>
                          {paragraph.items.map((item) => (
                            <li key={item.slice(0, 30)}>{item}</li>
                          ))}
                        </ul>
                      );
                    }

                    return (
                      <p key={clave}>
                        {typeof paragraph === "string" ? (
                          paragraph
                        ) : (
                          <>
                            {/* Un solo espacio entre la entradilla y el texto: la
                                puntuación va DENTRO del `lead`. Con
                                `.prose-lead-in` en `display: block` ese espacio
                                cae al principio de la línea siguiente, donde el
                                colapsado de blancos lo elimina: no deja sangría. */}
                            <strong className="prose-lead-in">{paragraph.lead}</strong>{" "}
                            {paragraph.text}
                          </>
                        )}
                      </p>
                    );
                  })}
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
                <h2 id="escribeme">{about.closing.title}</h2>
                {/* Los enlaces viven aquí y no en `content/pages.ts`: los
                    párrafos de las secciones se pintan como texto plano. */}
                <p>
                  {about.closing.body}{" "}
                  <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer">
                    @{CONTACT.instagramHandle}
                    <span className="sr-only"> (abre una pestaña nueva)</span>
                  </a>
                  . {about.closing.emailIntro}{" "}
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>, o mira el{" "}
                  <Link href="/tienda">catálogo completo</Link> si ya sabes lo que quieres.
                </p>
                <p className="prose-signature">{about.closing.signature}</p>
                <div className="btn-group">
                  <a
                    className="btn"
                    href={home.nav.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Escríbeme por WhatsApp
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
