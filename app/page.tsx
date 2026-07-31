import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { MediaText } from "@/components/sections/MediaText";
import { OverlapMenu } from "@/components/sections/OverlapMenu";
import { Service } from "@/components/sections/Service";
import { Statement } from "@/components/sections/Statement";
import { Testimonials } from "@/components/sections/Testimonials";
import { home } from "@/content/home";

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
 */
export default function HomePage() {
  return (
    <>
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
    </>
  );
}
