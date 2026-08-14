import { Btn } from "@/components/ui/Btn";
import { Picture } from "@/components/ui/Picture";
import { Reveal } from "@/components/ui/Reveal";
import type { HomeContent } from "@/types/content";

/**
 * Hero: 100vh con la imagen a sangre en el borde derecho (spec §6.1).
 * Puntos 1 y 2 del checklist.
 *
 * La marca es el único `h1`. La frase de impacto queda fuera del encabezado
 * para que la jerarquía semántica y la visual coincidan: primero Boquita,
 * después su promesa.
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
          <Reveal as="h1" className="h1-hero hero-brand" index={1}>
            {hero.brand}
          </Reveal>
          <Reveal as="p" className="hero-tagline" index={2}>
            {hero.tagline}
          </Reveal>
          <Reveal as="p" className="lead" index={3}>
            {hero.lead}
          </Reveal>
          <Reveal className="btn-group" index={3}>
            <Btn link={hero.ctas[0]} />
            <Btn link={hero.ctas[1]} variant="ghost" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
