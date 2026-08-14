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
 *
 * ── Dónde ACABA el recorrido ───────────────────────────────────────────────
 * No en el borde superior del viewport: la cabecera es `position: fixed` y tapa
 * `--header-h`, así que ahí el texto ya se está metiendo debajo mientras aún le
 * falta color. Termina `HEADER_LEAD` px ANTES del borde inferior de la cabecera,
 * para que el bloque se quede un momento entero y en su color final.
 *
 * La entrada ascendente NO es cosa de este componente: la pone el <Reveal> que
 * lo envuelve (ver components/sections/Statement.tsx).
 *
 * ── `fitTo`: el cuerpo llena la caja del vecino ────────────────────────────
 * Con `fitTo`, el interlineado del párrafo se calcula para que el texto ocupe
 * toda la banda que queda entre el titular y el pie del elemento apuntado (en la
 * portada, la foto). Sin `fitTo` el componente no toca nada y manda el CSS.
 */

/** Fracción del recorrido reservada al titular. El cuerpo no arranca hasta aquí. */
const TITLE_SHARE = 0.48;

/** Holgura sobre la cabecera: el teñido acaba con margen, no en el último píxel. */
const HEADER_LEAD = 80;

/**
 * Rango legible del interlineado calculado, en em.
 *
 * Fuera de él se deja de llenar exacto A PROPÓSITO: `content/schema.ts` admite un
 * `body` de 40 a 280 caracteres, y en los extremos el reparto pide disparates —
 * una sola línea querría ~14em, y 280 caracteres en la columna estrecha bajarían
 * de ascent+descent, o sea líneas solapadas. Cuando un tope actúa se anota en
 * `data-fit` del propio <p>: un tope silencioso se lee como «llena bien».
 */
const LH_MIN_EM = 1.15;
const LH_MAX_EM = 2.8;

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
  fitTo,
}: {
  id?: string;
  title: string;
  body: string;
  /**
   * Selector del elemento cuya altura tiene que llenar el párrafo, buscado
   * DENTRO de la fila (el abuelo de esta raíz), no con un `document.querySelector`
   * global. Sin él no se ajusta nada.
   */
  fitTo?: string;
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

    /**
     * Alto de la cabecera fija, leído del token para no duplicar el número.
     * Cambia en el breakpoint de 1280 (101px → 115px), así que se relee en el
     * `resize` y no una sola vez al montar.
     */
    let headerH = 0;
    const measureHeader = () => {
      headerH =
        Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
        ) || 0;
    };
    measureHeader();

    /**
     * Reparte la banda que queda bajo el titular entre las líneas REALES del
     * párrafo, para que el texto la ocupe entera en vez de dejar un agujero.
     *
     * ── Contra qué se mide ────────────────────────────────────────────────
     * Contra el elemento de `fitTo` (la foto), NO contra la fila: la fila crece
     * si el texto se pasa, y medirla sería perseguirse la cola. La altura de la
     * foto sale de su `aspect-ratio` y de su columna, así que es independiente
     * del texto y el cálculo converge en una pasada.
     *
     * ── La fórmula ────────────────────────────────────────────────────────
     * Con `space-between`, que no sobre holgura es
     *   h2Outer + marginTop + N·LH + marginBottom = H
     * y como el recorte de abajo depende del propio interlineado
     * (`marginBottom = −((LH − asc − desc)/2 + desc)`), se despeja:
     *   LH = [ H − h2Outer − marginTop + (desc − asc)/2 ] / (N − 0.5)
     *
     * El número de líneas NO depende del interlineado —el ajuste de línea va por
     * ancho y tamaño—, así que contar una vez basta y no hay iteración.
     */
    const bodyEl = element.querySelector<HTMLElement>(".scroll-color-text__body");

    const fitBody = () => {
      if (!fitTo || !bodyEl) return;

      // El breakpoint vive en la hoja de estilos, no aquí: a ≤991 la foto se
      // apila encima y no hay banda que llenar.
      const activo =
        getComputedStyle(element).getPropertyValue("--statement-fit").trim() === "1";
      if (!activo) {
        bodyEl.style.removeProperty("--body-lh");
        bodyEl.style.removeProperty("--body-trim");
        bodyEl.removeAttribute("data-fit");
        return;
      }

      // La fila es el abuelo: .scroll-color-text → .statement-story → la rejilla.
      const target = element.parentElement?.parentElement?.querySelector(fitTo);
      if (!target) return;

      const lineTops = new Set(
        bodyWords.map((word) => Math.round(word.getBoundingClientRect().top)),
      );
      const lines = lineTops.size;
      if (!lines) return;

      const cs = getComputedStyle(bodyEl);
      const size = Number.parseFloat(cs.fontSize);
      const context = document.createElement("canvas").getContext("2d");
      if (!context) return;
      context.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const metrics = context.measureText("Hxp");
      const asc = metrics.fontBoundingBoxAscent;
      const desc = metrics.fontBoundingBoxDescent;

      const headingStyle = getComputedStyle(heading);
      const h2Outer =
        heading.getBoundingClientRect().height + Number.parseFloat(headingStyle.marginTop);
      const banda = target.getBoundingClientRect().height;
      const marginTop = Number.parseFloat(cs.marginTop);

      const ideal = (banda - h2Outer - marginTop + (desc - asc) / 2) / (lines - 0.5);
      const lh = Math.min(size * LH_MAX_EM, Math.max(size * LH_MIN_EM, ideal));
      const trim = (lh - (asc + desc)) / 2 + desc;

      bodyEl.style.setProperty("--body-lh", `${lh.toFixed(2)}px`);
      bodyEl.style.setProperty("--body-trim", `${trim.toFixed(2)}px`);

      // Sólo se marca cuando el relleno NO es exacto, para que se vea.
      if (Math.abs(lh - ideal) > 0.5) {
        bodyEl.setAttribute("data-fit", ideal > lh ? "min" : "max");
      } else {
        bodyEl.removeAttribute("data-fit");
      }
    };

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

      /**
       * Se mide el TITULAR, que a ≥992 comparte borde superior con la foto de al
       * lado (`align-items: stretch` + `space-between`, 12-statement.css). O sea:
       * medirlo aquí es medir el borde superior de la foto, que es lo que manda
       * el efecto — pero sin romperse a ≤991, donde la foto se apila ENCIMA y
       * anclarse a ella teñiría el texto antes de que asomara.
       */
      const rect = heading.getBoundingClientRect();
      const travel = Math.max(1, window.innerHeight - headerH - HEADER_LEAD);
      const progress = clamp((window.innerHeight - rect.top) / travel);

      paint(titleWords, clamp(progress / TITLE_SHARE));
      paint(bodyWords, clamp((progress - TITLE_SHARE) / (1 - TITLE_SHARE)));
    };

    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    const onResize = () => {
      measureHeader();
      fitBody();
      schedule();
    };

    /**
     * El <Reveal> de fuera desplaza este bloque 100px durante 0.6s al entrar, y
     * `getBoundingClientRect()` incluye ese `transform`: mientras la entrada
     * está en vuelo, el progreso se lee ~100px por detrás.
     *
     * Se corrige solo mientras haya scroll, pero si el usuario se para justo ahí
     * el teñido se queda congelado corto hasta el siguiente gesto. Repintar al
     * acabar la transición lo cierra. Saltan dos (opacidad y transform) y
     * `schedule` está coalescido por rAF, así que cuestan un repintado.
     */
    const revealHost = element.closest(".reveal");

    fitBody();
    update();

    /**
     * El conteo de líneas y las métricas sólo valen con la webfont RESUELTA. Con
     * `display: swap` el primer ajuste se calcularía contra system-ui —que es más
     * ancha que Libre Franklin— y quedaría torcido hasta el primer `resize`.
     *
     * `cancelled` evita escribir sobre un componente ya desmontado: la promesa no
     * se puede abortar.
     */
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (cancelled) return;
      fitBody();
      schedule();
    });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    reduceMotion.addEventListener("change", schedule);
    revealHost?.addEventListener("transitionend", schedule);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      reduceMotion.removeEventListener("change", schedule);
      revealHost?.removeEventListener("transitionend", schedule);
    };
  }, [fitTo]);

  return (
    <div ref={ref} className="scroll-color-text">
      <h2 id={id} className="scroll-color-text__heading">
        <Words text={title} />
      </h2>
      <p className="scroll-color-text__body">
        <Words text={body} />
      </p>
    </div>
  );
}
