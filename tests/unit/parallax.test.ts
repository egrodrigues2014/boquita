import { describe, expect, it } from "vitest";
import { ROW1_KEYFRAMES, clamp01, rowX, sectionProgress, trackX } from "@/lib/parallax";

/**
 * La tabla del §4.2 del spec es el test. Si alguien "simplifica" la
 * interpolación a una curva, estos cuatro valores dejan de cuadrar.
 */
describe("trackX reproduce la tabla del spec exactamente", () => {
  it.each([
    [0, 25],
    [0.25, -14],
    [0.5, -28],
    [1, -32],
  ])("progreso %f → %f%%", (progress, expected) => {
    expect(trackX(progress)).toBeCloseTo(expected, 10);
  });
});

describe("interpolación entre keyframes", () => {
  it("el punto medio de un tramo da la media de sus extremos", () => {
    // Tramo 0 → 0.25: de +25 a −14, media 5.5
    expect(trackX(0.125)).toBeCloseTo(5.5, 10);
    // Tramo 0.25 → 0.5: de −14 a −28, media −21
    expect(trackX(0.375)).toBeCloseTo(-21, 10);
    // Tramo 0.5 → 1: de −28 a −32, media −30
    expect(trackX(0.75)).toBeCloseTo(-30, 10);
  });

  it("es monótona decreciente en todo el recorrido", () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const value = trackX(p);
      expect(value).toBeLessThanOrEqual(previous + 1e-9);
      previous = value;
    }
  });

  it("las pendientes por tramo son las del spec: −156, −56 y −8 %/unidad", () => {
    const slope = (a: number, b: number) => (trackX(b) - trackX(a)) / (b - a);
    expect(slope(0, 0.25)).toBeCloseTo(-156, 6);
    expect(slope(0.25, 0.5)).toBeCloseTo(-56, 6);
    expect(slope(0.5, 1)).toBeCloseTo(-8, 6);
  });

  it("ninguna curva suave pasa por los 4 puntos — de ahí la tabla", () => {
    // Si fuera lineal global, el valor en 0.5 seria la interpolacion 0→1.
    const linearGlobal = 25 + (-32 - 25) * 0.5;
    expect(trackX(0.5)).not.toBeCloseTo(linearGlobal, 1);
  });
});

describe("clamp fuera de rango (rubber-band de iOS)", () => {
  it("por debajo de 0 se queda en el primer keyframe", () => {
    expect(trackX(-0.5)).toBe(25);
    expect(trackX(-999)).toBe(25);
  });

  it("por encima de 1 se queda en el último", () => {
    expect(trackX(1.5)).toBe(-32);
    expect(trackX(999)).toBe(-32);
  });

  it("clamp01 acota", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(2)).toBe(1);
  });
});

describe("rowX: la fila 2 es la negación exacta de la fila 1", () => {
  it.each([0, 0.25, 0.5, 0.75, 1])("en progreso %f las filas son opuestas", (p) => {
    expect(rowX(p, 2)).toBeCloseTo(-rowX(p, 1), 10);
  });

  it("las dos filas nunca coinciden salvo si el valor fuera 0", () => {
    for (let p = 0; p <= 1; p += 0.05) {
      if (Math.abs(trackX(p)) > 0.01) {
        expect(Math.sign(rowX(p, 1))).toBe(-Math.sign(rowX(p, 2)));
      }
    }
  });
});

describe("sectionProgress", () => {
  const vh = 900;

  it("da 0 cuando el borde superior toca el fondo del viewport", () => {
    expect(sectionProgress({ top: vh, height: 600 }, vh)).toBe(0);
  });

  it("da 1 cuando el borde inferior sale por arriba", () => {
    expect(sectionProgress({ top: -600, height: 600 }, vh)).toBe(1);
  });

  it("da 0.5 a mitad de recorrido", () => {
    const height = 600;
    // Recorrido total = vh + height = 1500; la mitad son 750 desde top=vh.
    expect(sectionProgress({ top: vh - 750, height }, vh)).toBeCloseTo(0.5, 10);
  });

  it("acota durante el overscroll", () => {
    expect(sectionProgress({ top: vh + 500, height: 600 }, vh)).toBe(0);
    expect(sectionProgress({ top: -2000, height: 600 }, vh)).toBe(1);
  });

  it("no divide por cero con un viewport y una altura degenerados", () => {
    expect(sectionProgress({ top: 0, height: 0 }, 0)).toBe(0);
  });
});

describe("la tabla en sí", () => {
  it("los progresos están ordenados y cubren 0..1", () => {
    const progresses = ROW1_KEYFRAMES.map(([p]) => p);
    expect(progresses).toEqual([...progresses].sort((a, b) => a - b));
    expect(progresses[0]).toBe(0);
    expect(progresses.at(-1)).toBe(1);
  });
});
