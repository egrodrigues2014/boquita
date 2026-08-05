import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/db/catalog";
import { SITE_URL } from "@/lib/seo";

/**
 * Sitemap.
 *
 * Las fichas se derivan del catálogo servido, no se listan a mano: añadir un
 * producto —en `content/products.ts` o en la tabla— no debe requerir acordarse de
 * tocar este archivo.
 *
 * `/aviso-legal` queda fuera a propósito — es `noindex`, así que anunciarlo en el
 * sitemap sería contradictorio.
 *
 * Sin `lastModified` salvo en Vercel: un `new Date()` en cada build haría que el
 * sitemap cambiara sin que el contenido lo hubiera hecho, y eso enseña a los
 * buscadores a desconfiar del campo.
 */
/**
 * El `revalidate` de `app/layout.tsx` NO llega hasta aquí: las rutas de metadata
 * se compilan como route handlers aparte y quedan horneadas en el build. Sin esta
 * línea, un producto añadido a la tabla no aparecería en el sitemap hasta el
 * siguiente despliegue, mientras su ficha ya se estaría sirviendo.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalog();
  const lastModified = process.env.VERCEL_GIT_COMMIT_SHA ? new Date() : undefined;

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/tienda`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sobre-nosotros`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    ...products.map((product) => ({
      url: `${SITE_URL}/tienda/${product.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
