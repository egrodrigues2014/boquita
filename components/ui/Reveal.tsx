"use client";

import { type ElementType, type ReactNode, useEffect, useRef } from "react";
import { observeOnce } from "@/lib/revealObserver";

/**
 * Revelado al entrar en pantalla (spec §4.1): sube 100px con fundido, ~600ms,
 * escalonado 0/100/200ms en listas.
 *
 * Es un componente CLIENTE que renderiza `children` provistos por el SERVIDOR:
 * así el contenido y las imágenes que envuelve siguen fuera del bundle de
 * JavaScript. Sólo viaja la lógica del observer.
 *
 * Tres cosas que hay que respetar y que no son evidentes:
 *
 * 1. **El markup del servidor y del cliente es idéntico.** Sólo se AÑADE la
 *    clase `is-in` al montar. Nada de `useState(mounted)` ni renderizado
 *    condicional, que darían mismatch de hidratación.
 * 2. **El estado oculto vive bajo `.js`** (ver 05-components.css), que añade el
 *    script inline del layout. Sin JavaScript todo es visible.
 * 3. **`prefers-reduced-motion` no se consulta aquí.** Lo apaga el CSS
 *    (99-a11y.css), que aplica antes de que exista hidratación y no se puede
 *    olvidar en un componente nuevo.
 */
export function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  index,
  transformOnly = false,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  /** Retardo explícito en ms. Se ignora si se pasa `index`. */
  delay?: number;
  /** Posición en una lista → escalona 0/100/200ms y ahí se queda. */
  index?: number;
  /** Mantiene la opacidad a 1 y sólo desplaza. Para el elemento LCP. */
  transformOnly?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // El failsafe del layout ya no hace falta: si esto corre, hay hidratación.
    clearTimeout((window as unknown as { __revealFailsafe?: number }).__revealFailsafe);

    const element = ref.current;
    if (!element || element.classList.contains("is-in")) return;

    return observeOnce(element, (node) => node.classList.add("is-in"));
  }, []);

  const revealDelay = index !== undefined ? Math.min(index, 2) * 100 : delay;

  return (
    <Tag
      ref={ref}
      className={`reveal${transformOnly ? " reveal--transform-only" : ""}${className ? ` ${className}` : ""}`}
      style={revealDelay ? { "--reveal-delay": `${revealDelay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
