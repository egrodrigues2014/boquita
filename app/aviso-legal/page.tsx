import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { legal } from "@/content/pages";
import { getCatalog } from "@/lib/db/catalog";
import { getHomeContent } from "@/lib/homeContent";
import { toShopSearchSources } from "@/lib/shopSearch";

/**
 * Aviso legal y privacidad.
 *
 * Existe porque el enlace del pie apuntaba a `#`. Y porque hay cosas que este
 * sitio hace con datos —el carrito en el navegador, el embed de Instagram— que
 * conviene decir en claro, aunque sean pocas.
 *
 * `noindex`: no aporta nada en búsqueda y competiría con las páginas que sí
 * importan. Se sigue el enlace para que Google entienda que existe.
 */

export const metadata: Metadata = {
  title: "Aviso legal y privacidad",
  description:
    "Qué datos usa este sitio (muy pocos), cómo funcionan los pedidos y qué pasa con los " +
    "alérgenos. Boquita — Sweet & Salty, Santa Ana.",
  alternates: { canonical: "/aviso-legal" },
  robots: { index: false, follow: true },
};

export default async function AvisoLegalPage() {
  // Sólo por el nav y el pie, que comparten el contenido global de la portada.
  const [catalog, home] = await Promise.all([getCatalog(), getHomeContent()]);

  return (
    <>
      <Navbar nav={home.nav} searchProducts={toShopSearchSources(catalog)} />

      <main id="contenido" className="editorial-page legal-page">
        <section className="section section--no-bottom">
          <div className="container container--start">
            <p className="h6-sans primary">Última actualización: {legal.updated}</p>
            <h1>{legal.title}</h1>
          </div>
        </section>

        <section className="section">
          <div className="container container--start">
            <div className="prose prose--wide">
              {legal.sections.map((block) => (
                <article className="prose-block" key={block.id}>
                  <h2 id={block.id}>{block.title}</h2>
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 30)}>{paragraph}</p>
                  ))}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer footer={home.footer} />
    </>
  );
}
