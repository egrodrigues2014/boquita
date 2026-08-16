"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { observeOnce } from "@/lib/revealObserver";

/**
 * Slider de reseñas hecho a mano (spec §6.7, punto 8 del checklist).
 *
 * Sin librería a propósito: un carrusel acotado, sin loop y sin autoplay son
 * ~80 líneas, y cualquier paquete costaría más KB que todo el JavaScript propio
 * del sitio junto.
 *
 * **La idea central: toda la aritmética de breakpoints se queda en CSS y el JS
 * inyecta un solo entero.** El ancho del slide (`--slide-w`) y el hueco
 * (`--slide-gap`) se resuelven contra la misma caja que la traslación, así que
 * `calc()` los mezcla sin necesidad de medir nada:
 *
 *   transform: translate3d(calc(-1 * var(--i) * (var(--slide-w) + var(--slide-gap))), 0, 0)
 *
 * Y `perView` se LEE de `--per-view` en el CSS computado, en vez de duplicar la
 * tabla de breakpoints en JavaScript. Si mañana cambia el breakpoint del slider,
 * se cambia en un sitio.
 */
export function TestimonialsSlider({
  count,
  children,
}: {
  /** Número de slides. Los slides llegan como children del servidor. */
  count: number;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // 3 es el valor de escritorio: coincide con el CSS, así el SSR y el primer
  // render del cliente son idénticos.
  const [perView, setPerView] = useState(3);

  // Lee perView del propio CSS y lo mantiene al redimensionar.
  useEffect(() => {
    const mask = maskRef.current;
    if (!mask) return;

    const read = () => {
      const raw = getComputedStyle(mask).getPropertyValue("--per-view");
      const value = Number.parseInt(raw, 10);
      const next = Number.isFinite(value) && value > 0 ? value : 3;
      setPerView(next);
      // Al ensanchar la ventana, el índice puede quedar fuera de rango.
      setIndex((current) => Math.min(current, Math.max(0, count - next)));
    };

    read();
    const observer = new ResizeObserver(read);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, [count]);

  useEffect(() => {
    maskRef.current?.style.setProperty("--i", String(index));
  }, [index]);

  /**
   * Dispara el rellenado de las estrellas (D-41) cuando la sección asoma.
   *
   * Se observa ESTE nodo y no cada tarjeta: así las seis arrancan la secuencia a
   * la vez, incluidas las cuatro que el `overflow` recorta. Un observer por
   * tarjeta las escalonaría según cuándo entra cada una, que no es lo pedido.
   *
   * `observeOnce` es el mismo observer compartido que usa `Reveal` —threshold
   * 0.15 y disparo único—, así que esto no añade un segundo IntersectionObserver
   * a la página. El estado de reposo y el escalonado viven en
   * `styles/17-testimonials.css`; aquí sólo se pone la clase.
   *
   * No se envuelve el slider en `<Reveal>`, aunque el spec §4.1 lo pida: eso le
   * añadiría el desplazamiento de 100px y volvería intermitentes los tests que
   * miden las flechas y las tarjetas. El desvío está anotado en D-41.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    return observeOnce(root, (node) => node.classList.add("is-rated"));
  }, []);

  const maxIndex = Math.max(0, count - perView);
  const atStart = index === 0;
  const atEnd = index >= maxIndex;

  const go = useCallback(
    (direction: -1 | 1) => {
      setIndex((current) => Math.min(maxIndex, Math.max(0, current + direction)));
    },
    [maxIndex],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        go(1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        go(-1);
        break;
      case "Home":
        event.preventDefault();
        setIndex(0);
        break;
      case "End":
        event.preventDefault();
        setIndex(maxIndex);
        break;
    }
  };

  // Swipe táctil: con una sola tarjeta visible en móvil, las flechas solas son
  // mala experiencia. `touch-action:pan-y` en el CSS deja pasar el scroll vertical.
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (event: React.PointerEvent) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  const first = index + 1;
  const last = Math.min(index + perView, count);

  return (
    <div
      ref={rootRef}
      className="slider"
      role="group"
      aria-roledescription="carrusel"
      aria-label="Reseñas de clientes"
      onKeyDown={onKeyDown}
    >
      <div
        className="slider-mask"
        ref={maskRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {children}
      </div>

      {/* `aria-disabled` en vez de `disabled`, y no es un detalle: cuando un
          elemento ENFOCADO se deshabilita, el navegador manda el foco al <body>.
          Con `disabled`, un usuario de teclado que llegara al último slide perdía
          el foco y las teclas siguientes ya no alcanzaban al carrusel.
          Así el botón sigue enfocable, el lector de pantalla anuncia que no está
          disponible, y el handler simplemente no hace nada. */}
      <button
        type="button"
        className="slider-arrow slider-arrow--left"
        aria-label="Ver reseñas anteriores"
        aria-disabled={atStart}
        onClick={() => {
          if (!atStart) go(-1);
        }}
      >
        ‹
      </button>
      <button
        type="button"
        className="slider-arrow slider-arrow--right"
        aria-label="Ver reseñas siguientes"
        aria-disabled={atEnd}
        onClick={() => {
          if (!atEnd) go(1);
        }}
      >
        ›
      </button>

      <div className="slider-line" aria-hidden="true" />

      {/* Las 6 tarjetas están siempre en el DOM y son legibles por un lector de
          pantalla; las que quedan fuera sólo están recortadas visualmente. Esto
          anuncia qué rango se está mostrando. */}
      <p className="sr-only" aria-live="polite">
        Mostrando reseñas {first} a {last} de {count}
      </p>
    </div>
  );
}
