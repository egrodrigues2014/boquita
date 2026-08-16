import type { CSSProperties } from "react";

/**
 * Cinco estrellas para la tarjeta de reseña (desvío D-41).
 *
 * ⚠ El valor es **fijo y de diseño**, no un dato por reseña: no hay campo
 * `rating` en `content/schema.ts` y no debe haberlo mientras cuatro de las seis
 * reseñas sigan siendo andamio. Un campo por persona haría creer que cada una
 * puntuó, y hoy sólo dos escribieron algo (y una escribió tres estrellas: ver
 * `docs/TESTIMONIOS_FUENTES.md`).
 *
 * Sigue el contrato de `SocialIcon.tsx`: `viewBox` de 24 sin `width`/`height`
 * —el tamaño lo pone el CSS— y **el color tampoco va aquí**. `.review-stars svg`
 * pinta el relleno con `--gold` y el contorno con `--gold-line`, que es lo que
 * sostiene el 3:1 no textual sobre el crema de la tarjeta; `--gold` solo se
 * queda en 1.95:1. Sin ese contorno la estrella deja de percibirse — y eso vale
 * también mientras están a medio rellenar, que es justo por qué la animación
 * mueve `fill-opacity` y no `opacity`.
 *
 * `--star-i` es lo único que este componente aporta a la animación: el escalonado
 * de izquierda a derecha lo calcula el CSS a partir de ese entero
 * (`transition-delay: calc(var(--star-i) * 90ms)`). Sin `setTimeout`, sin estado
 * y sin `"use client"`: se renderiza en el servidor como el resto de la tarjeta.
 *
 * `role="img"` + `aria-label` en el envoltorio, y no un `.sr-only` aparte: un
 * nodo menos, y el lector anuncia la valoración de una pieza en vez de leer
 * cinco gráficos sueltos.
 */
const STAR = "M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z";

export function StarRating({ value = 5 }: { value?: number }) {
  return (
    <span className="review-stars" role="img" aria-label={`${value} de 5 estrellas`}>
      {Array.from({ length: value }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          style={{ "--star-i": i } as CSSProperties}
        >
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}
