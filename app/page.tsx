import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { MediaText } from "@/components/sections/MediaText";
import { OverlapMenu } from "@/components/sections/OverlapMenu";
import { Service } from "@/components/sections/Service";
import { Statement } from "@/components/sections/Statement";
import { Testimonials } from "@/components/sections/Testimonials";
import { JsonLd } from "@/components/ui/JsonLd";
import { Lightbox } from "@/components/ui/Lightbox";
import { getHomeContent } from "@/lib/homeContent";
import { bakeryJsonLd, websiteJsonLd } from "@/lib/seo";

/**
 * Portada. Server Component: todo el contenido y las imágenes viajan en el
 * payload del servidor, fuera del bundle de JavaScript.
 *
 * El orden de las secciones es el del §6 del spec y NO se altera — varias
 * dependen del solape con su vecina (el bloque crema sube sobre la imagen
 * ancha, la imagen de servicio invade el bloque crema, el pie oscuro sube bajo
 * la tarjeta CTA), así que reordenar rompe la geometría.
 *
 *   1 header.navbar        absoluto, transparente, sobre el hero
 *   2 section.hero         100vh, imagen a sangre derecha
 *   3 section.statement    frase con 2 imágenes en el flujo del texto
 *   4 section.media-text   still de vídeo + texto, grid asimétrico
 *   5 wrapper              imagen ancha + bloque crema del catálogo
 *   6 section.service      imagen que sobresale + 2 métricas
 *   7 section.gallery      2 filas desbordadas
 *   8 section.testimonials slider de tarjetas crema
 *   9 footer               tarjeta CTA solapada + bloque oscuro
 *
 * `getHomeContent()` es el copy de `content/home.ts` con la rejilla del catálogo,
 * el megamenú y la métrica de recetas recalculados desde la tabla `products`.
 * Sin `DATABASE_URL` devuelve exactamente el contenido estático.
 */
export default async function HomePage() {
  const home = await getHomeContent();

  return (
    <>
      {/* Datos estructurados de negocio local: lo que hace que Google entienda
          que esto es una panadería en Santa Ana con teléfono y catálogo, y no
          una página cualquiera. Cuesta cero bytes de JavaScript. */}
      <JsonLd data={bakeryJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      <Navbar nav={home.nav} />

      <main id="contenido">
        <Hero hero={home.hero} />
        <Statement statement={home.statement} />
        <MediaText mediaText={home.mediaText} />
        <OverlapMenu wideImage={home.wideImage} menu={home.menu} />
        <Service service={home.service} />
        <Gallery gallery={home.gallery} />
        <Testimonials testimonials={home.testimonials} />
      </main>

      <Footer footer={home.footer} />

      {/* Un único lightbox para toda la página. Escucha por delegación los
          `data-lightbox` que renderizan las secciones en el servidor, así que no
          hace falta un provider de contexto ni convertirlas en cliente. */}
      <Lightbox
        groups={{
          gallery: home.gallery.rows.flat(),
          video: { url: home.mediaText.videoUrl, title: home.mediaText.videoLabel },
        }}
      />
    </>
  );
}
