/**
 * La puerta de Vercel Web Analytics.
 *
 * El interruptor del panel de Vercel no mide nada por sí solo: hace falta que
 * `app/layout.tsx` monte el `<Analytics />` de `@vercel/analytics/next`. Esta
 * función decide cuándo.
 *
 * **Sólo producción**, por dos motivos que no se ven en el panel:
 *
 *  · el plan Hobby tiene tope mensual de eventos, y cada despliegue de preview
 *    —incluida cualquier pasada de e2e contra uno— lo gastaría;
 *  · las cifras no separan entornos, así que las visitas de prueba se sumarían
 *    a las reales y la métrica dejaría de servir para decidir nada.
 *
 * `VERCEL_ENV` sólo existe dentro de Vercel, así que en local el componente no
 * se monta nunca: el HTML no trae `/_vercel/insights` y no sale ninguna
 * petición. Es además lo que mantiene el sitio libre de dominios de terceros —
 * el paquete pide el script a `/_vercel/insights/script.js`, del mismo origen, y
 * sólo cae en `va.vercel-scripts.com` cuando `NODE_ENV` es `development`, camino
 * que esta puerta ya cierra.
 *
 * No se reutiliza `isSiteIndexable()` de `lib/seo.ts`, que tiene esta misma
 * forma pero responde a otra pregunta: medir **no** depende de `SITE_LAUNCHED`.
 * El sitio sigue en `noindex` hasta el lanzamiento y aun así interesa saber
 * cuánta gente llega.
 *
 * El parámetro con valor por defecto es lo que permite probar la puerta sin
 * tocar `process.env`, igual que en `lib/seo.ts`.
 */
export function isAnalyticsEnabled(vercelEnv = process.env.VERCEL_ENV): boolean {
  return vercelEnv === "production";
}
