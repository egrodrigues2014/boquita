import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * En Vercel Hobby la protección de despliegues es de pago, así que las URL de
 * preview son públicas. Todo lo que no sea producción se marca `noindex` para que
 * no compita con el sitio real en los buscadores.
 */
const isProduction = process.env.VERCEL_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
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
