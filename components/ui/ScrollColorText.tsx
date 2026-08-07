"use client";

import { Fragment, useEffect, useRef } from "react";

/**
 * Texto que el scroll va tiñendo de izquierda a derecha, palabra a palabra.
 *
 * ── Por qué la unidad es la PALABRA y no la frase ──────────────────────────
 * El barrido es un `clip-path` horizontal. Eso sólo se comporta si el elemento
 * recortado ocupa UNA sola línea visual: si envuelve, el recorte atraviesa
 * todas sus líneas a la vez y se ve una columna vertical cortando el párrafo
 * por la mitad — se lee como un fallo de renderizado, no como un efecto.
 *
 * La versión anterior lo esquivaba partiendo el texto a mano en trozos cortos
 * escritos dentro del componente. Dos problemas: duplicaba el contenido (el de
 * verdad vive en content/home.ts y se ignoraba), y bastaba un ancho no previsto
 * para que un trozo envolviera igualmente. Una palabra no puede envolver, así
 * que los saltos de línea vuelven a ser cosa del navegador y el artefacto
 * desaparece por construcción.
 *
 * ── Orden: primero el titular, después el cuerpo ───────────────────────────
 * No es «suele ir antes»: el recorrido se reparte en dos tramos disjuntos, y el
 * cuerpo está literalmente a 0% hasta que el titular llega al 100%.
 */

/** Fracción del recorrido reservada al titular. El cuerpo no arranca hasta aquí. */
const TITLE_SHARE = 0.4;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

/**
 * El espacio va como nodo de texto FUERA del span, no dentro ni como padding:
 * es lo que deja que la línea rompa entre palabras y que el copiar-pegar
 * recupere la frase con sus espacios.
 */
function Words({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <>
      {words.map((word, index) => (
        // La clave va por índice: las palabras se repiten ("de", "y", "en"), así
        // que el texto no es un identificador único.
        <Fragment key={index}>
          <span className="scroll-color-text__word">
            <span className="scroll-color-text__base">{word}</span>
            <span className="scroll-color-text__fill" aria-hidden="true">
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

export function ScrollColorText({
  id,
  title,
  body,
  className,
}: {
  id?: string;
  title: string;
  body: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const heading = element.querySelector<HTMLElement>(".scroll-color-text__heading");
    if (!heading) return;

    // El DOM de este componente no cambia nunca, así que se recorre una vez y no
    // en cada frame de scroll.
    const titleWords = [...heading.querySelectorAll<HTMLElement>(".scroll-color-text__word")];
    const bodyWords = [
      ...element.querySelectorAll<HTMLElement>(
        ".scroll-color-text__body .scroll-color-text__word",
      ),
    ];
    const allWords = [...titleWords, ...bodyWords];

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const paint = (words: HTMLElement[], progress: number) => {
      words.forEach((word, index) => {
        const reveal = clamp(progress * words.length - index);
        word.style.setProperty("--reveal", `${Math.round(reveal * 100)}%`);
      });
    };

    const update = () => {
      if (reduceMotion.matches) {
        for (const word of allWords) word.style.setProperty("--reveal", "100%");
        return;
      }

      // Se mide el TITULAR, no la raíz. La raíz es `display: contents` para que
      // el <h2> y el <p> sean celdas de la rejilla del padre, y un elemento sin
      // caja devuelve un rect a cero: el progreso saldría siempre a 1 y todo
      // aparecería ya revelado.
      const rect = heading.getBoundingClientRect();
      const progress = clamp((window.innerHeight - rect.top) / window.innerHeight);

      paint(titleWords, clamp(progress / TITLE_SHARE));
      paint(bodyWords, clamp((progress - TITLE_SHARE) / (1 - TITLE_SHARE)));
    };

    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduceMotion.addEventListener("change", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduceMotion.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <div ref={ref} className={className ? `scroll-color-text ${className}` : "scroll-color-text"}>
      <h2 id={id} className="scroll-color-text__heading">
        <Words text={title} />
      </h2>
      <p className="scroll-color-text__body">
        <Words text={body} />
      </p>
    </div>
  );
}
