/**
 * Parallax horizontal de la galería (spec §4.2).
 *
 * El spec da una tabla de cuatro puntos:
 *
 *   progreso   fila 1    fila 2
 *   0.00       +25%      −25%
 *   0.25       −14%      +14%
 *   0.50       −28%      +28%
 *   1.00       −32%      +32%
 *
 * Las pendientes por tramo son −156, −56 y −8 %/unidad. **Ninguna curva cúbica
 * ajusta esos cuatro puntos**, y no hace falta: el original es de Webflow
 * ("while scrolling in view"), que interpola LINEALMENTE entre keyframes. Así que
 * esto es una tabla de consulta con interpolación por tramos, que reproduce los
 * cuatro valores exactos y cualquier intermedio que produjera el original.
 *
 * Todo lo de aquí es puro y sin dependencias del DOM: la tabla del spec *es* el
 * test (tests/unit/parallax.test.ts).
 */

/** [progreso, translateX en %] */
export type Keyframe = readonly [progress: number, translateX: number];

export const ROW1_KEYFRAMES: readonly Keyframe[] = [
  [0, 25],
  [0.25, -14],
  [0.5, -28],
  [1, -32],
];

export const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Interpolación lineal por tramos sobre la tabla de keyframes. */
export function trackX(progress: number, keys: readonly Keyframe[] = ROW1_KEYFRAMES): number {
  const t = clamp01(progress);
  const first = keys[0]!;
  if (t <= first[0]) return first[1];

  for (let i = 1; i < keys.length; i++) {
    const [p0, v0] = keys[i - 1]!;
    const [p1, v1] = keys[i]!;
    if (t <= p1) {
      // p1 > p0 siempre en una tabla bien formada, así que no hay división por 0.
      return v0 + (v1 - v0) * ((t - p0) / (p1 - p0));
    }
  }

  return keys[keys.length - 1]![1];
}

/**
 * La fila 2 es la negación exacta de la fila 1. Una sola tabla y un cambio de
 * signo: así es imposible que las dos filas se desincronicen.
 */
export const rowX = (progress: number, row: 1 | 2): number =>
  row === 1 ? trackX(progress) : -trackX(progress);

/**
 * Progreso de la sección a través del viewport, como lo calcula Webflow:
 * 0 en el instante en que su borde superior toca el borde inferior del viewport,
 * 1 en el instante en que su borde inferior sale por arriba.
 *
 * Comprobación mental: si `top === vh` → (vh − vh)/(vh+h) = 0 ✓
 *                      si `top === −h` → (vh + h)/(vh + h) = 1 ✓
 */
export function sectionProgress(rect: { top: number; height: number }, viewportHeight: number): number {
  const travel = viewportHeight + rect.height;
  if (travel <= 0) return 0;
  return clamp01((viewportHeight - rect.top) / travel);
}
