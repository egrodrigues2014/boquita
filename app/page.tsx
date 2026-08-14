import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { OverlapMenu } from "@/components/sections/OverlapMenu";
import { Service } from "@/components/sections/Service";
import { Statement } from "@/components/sections/Statement";
import { Testimonials } from "@/components/sections/Testimonials";
import { JsonLd } from "@/components/ui/JsonLd";
import { getCatalog } from "@/lib/db/catalog";
import { getHomeContent } from "@/lib/homeContent";
import { bakeryJsonLd, websiteJsonLd } from "@/lib/seo";
import { toShopSearchSources } from "@/lib/shopSearch";

/**
 * Portada. Server Component: todo el contenido y las imágenes viajan en el
 * payload del servidor, fuera del bundle de JavaScript.
 *
 * El orden de las secciones es el del §6 del spec y NO se altera — varias
 * dependen del solape con su vecina (el bloque crema sube sobre la imagen
 * ancha, la imagen de servicio invade el bloque crema, el pie oscuro sube bajo
 * la tarjeta CTA), así que reordenar rompe la geometría.
 *
 *   1 header.navbar        absoluto, sobre el hero
 *   2 section.hero         100vh, imagen full-bleed con copy centrado
 *   3 section.statement    foto a la izquierda + titular y párrafo repartidos en su
 *                          altura; el scroll los tiñe palabra a palabra (D-35)
 *   4 section.media-text   foto + texto, grid asimétrico sin video
 *   5 wrapper              imagen ancha + bloque crema del catálogo
 *   6 section.service      imagen + texto y 2 métricas
 *   7 section.gallery      2 filas desbordadas
 *   8 section.testimonials slider de 6 tarjetas crema, sin retrato (D-34). El copy
 *                          es andamio marcado `todo` hasta que Ale entregue reseñas
 *                          reales; con `items: []` la sección se apaga sola
 *   9 footer               tarjeta CTA solapada + bloque oscuro
 *
 * `getHomeContent()` es el copy de `content/home.ts` con la rejilla del catálogo
 * y la métrica de recetas recalculadas desde la tabla `products`.
 * Sin `DATABASE_URL` devuelve exactamente el contenido estático.
 */
export default async function HomePage() {
  const [catalog, home] = await Promise.all([getCatalog(), getHomeContent()]);

  return (
    <>
      {/* Datos estructurados de negocio local: lo que hace que Google entienda
          que esto es una panadería en Santa Ana con teléfono y catálogo, y no
          una página cualquiera. Cuesta cero bytes de JavaScript. */}
      <JsonLd data={bakeryJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      <Navbar nav={home.nav} searchProducts={toShopSearchSources(catalog)} />

      <main id="contenido" className="home-page">
        <Hero hero={home.hero} />
        <Statement mediaText={home.mediaText} />
        <OverlapMenu wideImage={home.wideImage} menu={home.menu} />
        <Service service={home.service} />
        <Gallery gallery={home.gallery} />
        <Testimonials testimonials={home.testimonials} />
      </main>

      <Footer footer={home.footer} />
    </>
  );
}
