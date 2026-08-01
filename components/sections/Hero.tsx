import { Btn } from "@/components/ui/Btn";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
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
          desde el <head>.
          DESVÍO D-20: el spec la incluye entre los elementos con reveal, pero
          aquí NO lo lleva, por dos razones que se refuerzan. (1) Es el LCP:
          cualquier `opacity:0` inicial lo aplazaría hasta la hidratación.
          (2) Envolverla en un div reintroduciría el bug de D-14 — a ≤991 la
          imagen es `width:100%` y se resolvería contra el envoltorio en vez de
          contra `.hero`, saliendo a 315px. Animar la portada no vale ninguna de
          las dos cosas. */}
      <Picture image={hero.image} className="hero-img" priority />

      <div className="container container--start">
        <div className="hero-content">
          <Reveal as="p" className="h6-sans primary" index={0}>
            {hero.eyebrow}
          </Reveal>
          <Reveal as="h1" className="h1-hero" index={1}>
            {hero.titleTop}
            <br />
            <span className="text-primary">{hero.titleBottom}</span>
          </Reveal>
          <Reveal as="p" className="lead mt-20" index={2}>
            {hero.lead}
          </Reveal>
          <Reveal className="btn-group" index={2}>
            <Btn link={hero.ctas[0]} />
            <Btn link={hero.ctas[1]} variant="ghost" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
