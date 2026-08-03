import type { MetadataRoute } from "next";
import { products } from "@/content/products";
import { SITE_URL } from "@/lib/seo";

/**
 * Sitemap.
 *
 * Las 14 fichas se derivan del catálogo, no se listan a mano: añadir un producto
 * no debe requerir acordarse de tocar este archivo.
 *
 * `/aviso-legal` queda fuera a propósito — es `noindex`, así que anunciarlo en el
 * sitemap sería contradictorio.
 *
 * Sin `lastModified` salvo en Vercel: un `new Date()` en cada build haría que el
 * sitemap cambiara sin que el contenido lo hubiera hecho, y eso enseña a los
 * buscadores a desconfiar del campo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
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
