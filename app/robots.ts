import type { MetadataRoute } from "next";
import { isSiteIndexable, SITE_URL } from "@/lib/seo";

/**
 * Las URL temporales de Vercel son públicas. Preview y la producción previa al
 * cambio de dominio se bloquean hasta que `SITE_LAUNCHED=true` confirme que el
 * lanzamiento ya ocurrió.
 */
const shouldIndex = isSiteIndexable();

export default function robots(): MetadataRoute.Robots {
  if (!shouldIndex) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admin llega en la Fase 3, pero se excluye ya: es más fácil olvidarlo
        // después que ponerlo ahora.
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
