import { Btn } from "@/components/ui/Btn";
import { Picture } from "@/components/ui/Picture";
import type { HomeContent } from "@/types/content";

/**
 * Hero: 100vh con la imagen a sangre en el borde derecho (spec §6.1).
 * Puntos 1 y 2 del checklist.
 *
 * El `h1` va en DOS líneas con un `<br>` duro, y la segunda en ámbar. El `<br>`
 * es intencionado y no debe sustituirse por `text-wrap:balance`: Cormorant
 * Infant es mucho más estrecha que su fallback Georgia, así que con el `<br>` el
 * swap de fuente cambia anchos pero nunca el número de líneas — sin él,
 * reintroduce reflujo.
 *
 * El eyebrow se renderiza como `<p class="h6-sans primary">` y no como `h6`,
 * porque un h6 antes de un h2 rompe el orden de encabezados (desvío D-6).
 * Es pixel-idéntico.
 */
export function Hero({ hero }: { hero: HomeContent["hero"] }) {
  return (
    <section className="hero">
      {/* La imagen es el elemento LCP: eager, fetchPriority alto y precargada
          desde el <head>. */}
      <Picture image={hero.image} className="hero-img" priority />

      <div className="container container--start">
        <div className="hero-content">
          <p className="h6-sans primary">{hero.eyebrow}</p>
          <h1 className="h1-hero">
            {hero.titleTop}
            <br />
            <span className="text-primary">{hero.titleBottom}</span>
          </h1>
          <p className="lead mt-20">{hero.lead}</p>
          <div className="btn-group">
            <Btn link={hero.ctas[0]} />
            <Btn link={hero.ctas[1]} variant="ghost" />
          </div>
        </div>
      </div>
    </section>
  );
}
