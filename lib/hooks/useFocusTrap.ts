"use client";

import { type RefObject, useEffect } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Constante a nivel de módulo, NO un literal en la firma. Un `= ["main","footer"]`
 * como valor por defecto crea un array nuevo en cada render, cambiando la
 * identidad de la dependencia y re-ejecutando el efecto continuamente: cada
 * re-render volvía a robar el foco hacia el primer elemento del panel. En el
 * drawer eso cerraba cualquier dropdown en el instante de abrirlo, y un usuario
 * de teclado perdía el foco con cada cambio de estado.
 */
const DEFAULT_INERT_SELECTORS = ["main", "footer"];

/**
 * Retiene el foco dentro de un panel abierto y lo devuelve al cerrarlo.
 *
 * Además marca el resto de la página como `inert`, para que un lector de
 * pantalla no pueda salirse del panel navegando por el rotor — el trampeo de Tab
 * solo no impide eso.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  /** Elementos de fondo a inertizar. Debe ser una referencia ESTABLE. */
  inertSelectors: string[] = DEFAULT_INERT_SELECTORS,
): void {
  useEffect(() => {
    const container = ref.current;
    if (!active || !container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const backgrounds = inertSelectors
      .flatMap((selector) => [...document.querySelectorAll<HTMLElement>(selector)])
      .filter((element) => !container.contains(element));

    for (const element of backgrounds) element.inert = true;

    const focusables = () => [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];

    /**
     * El foco se mueve en el siguiente frame, no de inmediato.
     *
     * Los paneles se ocultan con `visibility:hidden` y una transición. Un
     * elemento dentro de un subárbol invisible NO es enfocable, y este efecto
     * corre en el mismo frame en que se añade la clase de apertura: en ese
     * instante la visibilidad computada sigue siendo `hidden`, así que `.focus()`
     * falla en silencio y el foco se queda donde estaba.
     *
     * Detectado con el carrito: al abrirlo, el foco seguía en el botón del
     * navbar, de modo que Tab recorría la página de detrás y Escape no llegaba
     * al panel.
     */
    const raf = requestAnimationFrame(() => {
      const first = focusables()[0];
      if (first) first.focus();
      // Si el panel no tuviera nada enfocable, se enfoca el contenedor para que
      // al menos el Escape llegue. Necesita tabindex=-1 en el propio panel.
      else if (container.tabIndex >= 0 || container.hasAttribute("tabindex")) container.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;

      const first = items[0]!;
      const last = items[items.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("keydown", onKeyDown);
      for (const element of backgrounds) element.inert = false;
      previouslyFocused?.focus?.();
    };
  }, [ref, active, inertSelectors]);
}
