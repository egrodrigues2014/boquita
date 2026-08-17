/**
 * La puerta de Web Analytics, medida sin navegador.
 *
 * Es el equivalente de `seo.test.ts` para la otra variable de entorno del
 * despliegue: `app/layout.tsx` monta `<Analytics />` sólo si esto dice `true`, y
 * un `true` de más gasta cuota del plan Hobby y mezcla visitas de prueba con las
 * reales. Ningún test de navegador puede cubrirlo — `VERCEL_ENV` no existe fuera
 * de Vercel, así que en local el componente jamás se monta.
 */

import { describe, expect, it } from "vitest";
import { isAnalyticsEnabled } from "@/lib/analytics";

describe("medición de visitas", () => {
  it("no mide fuera de producción", () => {
    expect(isAnalyticsEnabled(undefined)).toBe(false);
    expect(isAnalyticsEnabled("")).toBe(false);
    expect(isAnalyticsEnabled("development")).toBe(false);
    expect(isAnalyticsEnabled("preview")).toBe(false);
  });

  it("mide sólo en la producción de Vercel", () => {
    expect(isAnalyticsEnabled("production")).toBe(true);
    // Comparación exacta: `VERCEL_ENV` es un enum de Vercel, no texto libre.
    expect(isAnalyticsEnabled("Production")).toBe(false);
  });
});
