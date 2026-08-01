import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Sitemap. En la Fase 1 sólo existe la portada; `/tienda`, `/blog` y
 * `/sobre-nosotros` se añaden cuando esas rutas existan de verdad.
 *
 * La fecha se pasa desde la variable de build para que el sitemap sea
 * determinista: un `new Date()` haría que cambiara en cada build sin que el
 * contenido hubiera cambiado.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: process.env.VERCEL_GIT_COMMIT_SHA ? new Date() : undefined,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
