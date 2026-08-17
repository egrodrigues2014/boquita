import { NextResponse } from "next/server";
import { isAnalyticsEnabled } from "@/lib/analytics";
import { isSiteIndexable } from "@/lib/seo";

/**
 * ⚠ ANDAMIO TEMPORAL. Se retira en cuanto se cierre el diagnóstico.
 *
 * Por qué existe: `<Analytics />` no se monta en producción y desde fuera no se
 * puede saber por qué. Está medido que el sitio hidrata (4 de 18 `.reveal` con
 * `is-in`, consola limpia), que el despliegue es el nuevo y que
 * `/_vercel/insights/script.js` responde 200 — así que la puerta de
 * `lib/analytics.ts` está devolviendo `false` y la pregunta es qué ve el
 * proceso, no qué hace el código.
 *
 * **Se declara `force-static` a propósito**: así se evalúa EN EL BUILD, que es
 * exactamente el momento que decide el HTML de la portada (estática, con
 * `revalidate = 3600`). La ruta hermana `diag-entorno-runtime` hace lo mismo por
 * petición. Si las dos no coinciden, el problema es el momento y no la variable.
 *
 * No devuelve secretos: `VERCEL_ENV` y `VERCEL` son indicadores públicos, y de
 * `SITE_LAUNCHED` sale sólo el booleano de la comparación, nunca el valor.
 */

export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    momento: "build",
    vercel: process.env.VERCEL ?? null,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    vercelTargetEnv: process.env.VERCEL_TARGET_ENV ?? null,
    gitRef: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    siteLaunchedEsTrue: process.env.SITE_LAUNCHED === "true",
    isAnalyticsEnabled: isAnalyticsEnabled(),
    isSiteIndexable: isSiteIndexable(),
  });
}
