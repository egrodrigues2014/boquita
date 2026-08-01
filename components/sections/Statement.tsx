import type { CSSProperties } from "react";
import { Reveal } from "@/components/ui/Reveal";
import type { HomeContent, ImageRef } from "@/types/content";

/**
 * Frase grande con dos imágenes DENTRO del flujo del texto (spec §6.2).
 * Punto 3 del checklist: los recortes deben aparecer dentro del `h2`, no al lado.
 *
 * Siguen siendo `background-image` y no `<img>` porque un `<img>` a `height:1em`
 * dentro de un `h2` rompe la caja de línea. Se inyectan con `image-set()` para
 * servir el 2× en pantallas densas.
 *
 * Los spans van vacíos y con `role="presentation"`: un lector de pantalla lee la
 * frase de corrido, que es exactamente lo que debe pasar.
 *
 * ⚠ La frase está calibrada para ocupar 3 líneas a 50px en escritorio. Si se
 * alarga, verificar a 1920/1440/1280/992 que la última línea conserva holgura:
 * este `h2` es el mayor riesgo de CLS del sitio, porque el swap de fuente puede
 * pasarlo a 4 líneas.
 */
function inlineStyle(image: ImageRef): CSSProperties {
  const x2 = image.srcSet?.[0]?.src;
  const set = x2
    ? `image-set(url("${image.src}") 1x, url("${x2}") 2x)`
    : `url("${image.src}")`;
  return { backgroundImage: set };
}

export function Statement({ statement }: { statement: HomeContent["statement"] }) {
  const [first, second] = statement.inline;

  return (
    <section className="section section--no-bottom">
      <div className="container">
        <Reveal as="h2" className="text-center">
          {statement.partA}{" "}
          <span
            className="inline-img inline-img--1"
            style={inlineStyle(first)}
            role="presentation"
          />{" "}
          {statement.partB}{" "}
          <span
            className="inline-img inline-img--2"
            style={inlineStyle(second)}
            role="presentation"
          />{" "}
          {statement.partC}
        </Reveal>
      </div>
    </section>
  );
}
