"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { rowX, sectionProgress } from "@/lib/parallax";

/**
 * Una fila de la galería, desplazándose horizontalmente según el progreso de
 * scroll de la sección (spec §4.2, punto 7 del checklist).
 *
 * Igual que `Reveal`, es un componente cliente que renderiza `children` del
 * servidor: las 7 imágenes de la fila no entran en el bundle.
 *
 * Decisiones que importan:
 *
 * · **Bucle rAF autosostenido, no un listener de `scroll`.** Un listener que
 *   escribe estilos se dispara más veces que el pintado en algunos navegadores y
 *   puede intercalar lecturas y escrituras. Así se hace exactamente una lectura
 *   de `getBoundingClientRect()` y una escritura de `transform` por frame, en ese
 *   orden: cero layout síncrono forzado.
 *
 * · **El bucle está cerrado por IntersectionObserver y `visibilitychange`**, así
 *   que no consume nada cuando la sección no se ve o la pestaña está en segundo
 *   plano.
 *
 * · **Los offsets estáticos (`left:-15%` / `-30%`) se quedan en CSS.** El JS sólo
 *   escribe `transform`, para no pelear con el desplazamiento de layout.
 *
 * · **Los `%` del transform se resuelven contra la caja propia de `.track`** (el
 *   100% de `.scroller`), no contra la tira de contenido que desborda a ~161%.
 *   Eso es lo que hacía el original: no "arreglarlo" a píxeles.
 *
 * · **`will-change` sólo mientras se anima** (desvío D-3): permanente serían dos
 *   capas compositadas grandes siempre activas, caro en móvil.
 */
export function ParallaxTrack({ row, children }: { row: 1 | 2; children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const section = track?.closest<HTMLElement>("[data-parallax]");
    if (!track || !section) return;

    const apply = (progress: number) => {
      track.style.transform = `translate3d(${rowX(progress, row).toFixed(3)}%, 0, 0)`;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      // Estado estático a mitad de composición: se lee como intencionado, no
      // como algo a medio cargar.
      apply(0.5);
      return;
    }

    let rafId = 0;
    let running = false;

    const frame = () => {
      rafId = 0;
      // Una lectura...
      const rect = section.getBoundingClientRect();
      // ...y una escritura. En ese orden.
      apply(sectionProgress(rect, window.innerHeight));
      if (running) rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      track.classList.add("is-animating");
      rafId = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      track.classList.remove("is-animating");
    };

    const gate = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !document.hidden) start();
        else stop();
      },
      // Arranca justo antes de entrar, para que no se vea el salto inicial.
      { rootMargin: "200px 0px" },
    );
    gate.observe(section);

    const onVisibilityChange = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Posición correcta ya en la carga, sin esperar al primer scroll.
    apply(sectionProgress(section.getBoundingClientRect(), window.innerHeight));

    return () => {
      gate.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [row]);

  return (
    <div className="scroller">
      <div className={`track track--${row}`} ref={trackRef}>
        {children}
      </div>
    </div>
  );
}
