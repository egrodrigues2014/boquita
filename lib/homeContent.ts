import {
  FEATURED_SLUGS,
  GALLERY_ITEMS_PER_ROW,
  GALLERY_ROW_COUNT,
  chunkGalleryRows,
  home as fallbackHome,
  toFeatured,
  toGalleryItems,
} from "@/content/home";
import { getCatalog } from "@/lib/db/catalog";
import type { GalleryRows, HomeContent, Product } from "@/types/content";
import type { ShopProduct } from "@/types/shop";

/**
 * Proyecta el catálogo servido sobre el contenido de la portada.
 *
 * Existe porque `content/home.ts` es un objeto literal y `getCatalog()` es
 * asíncrono: no se puede llamar a una promesa dentro de un literal. Pero el
 * motivo de fondo es otro y está documentado en `content/home.ts`: los nombres y
 * precios de la portada ESTUVIERON duplicados y derivaron —un slug viejo dejó un
 * enlace apuntando a una ficha inexistente—. La lección no fue parchear el
 * string, fue que haya una sola fuente. Este archivo mantiene esa propiedad
 * cuando la fuente pasa a ser Postgres.
 *
 * Se recalculan exactamente las dos cosas de la portada que dependen del
 * catálogo. El resto del copy no se toca.
 */

/**
 * Los 8 de la rejilla 2×4.
 *
 * Orden: primero los destacados de `FEATURED_SLUGS` que existan en el catálogo
 * servido; si faltan, se completa con otros productos DEL MISMO catálogo hasta
 * llegar a 8.
 *
 * Lo que deliberadamente NO hace es rellenar con productos del fallback que no
 * estén en el catálogo servido. El comentario original de `content/home.ts`
 * proponía eso («rellenar desde aquí para que la portada no se pueda romper»),
 * pero produce tarjetas cuyo enlace da 404: `/tienda/[slug]` resuelve contra el
 * mismo `getCatalog()`. Una rejilla de 6 celdas es un defecto de maquetación; una
 * tarjeta que lleva a un 404 le cuesta un pedido a Ale. Se elige la primera.
 */
function featuredFrom(catalog: ShopProduct[]): Product[] {
  const bySlug = new Map(catalog.map((product) => [product.slug, product]));

  const chosen: ShopProduct[] = [];
  for (const slug of FEATURED_SLUGS) {
    const product = bySlug.get(slug);
    if (product) chosen.push(product);
  }

  if (chosen.length < FEATURED_SLUGS.length) {
    const taken = new Set(chosen.map((product) => product.slug));
    for (const product of catalog) {
      if (chosen.length === FEATURED_SLUGS.length) break;
      if (!taken.has(product.slug)) chosen.push(product);
    }
  }

  if (chosen.length < FEATURED_SLUGS.length) {
    // El catálogo servido tiene menos de 8 productos. Sólo pasa con una tabla
    // sembrada a medias, porque el fallback completo son 14.
    console.warn(
      `[home] la rejilla de la portada se queda en ${chosen.length} de ${FEATURED_SLUGS.length}: ` +
        `el catálogo servido sólo tiene ${catalog.length} productos`,
    );
  }

  return chosen.map(toFeatured);
}

function galleryFrom(catalog: ShopProduct[]): GalleryRows {
  const items = catalog.flatMap(toGalleryItems);
  const expected = GALLERY_ROW_COUNT * GALLERY_ITEMS_PER_ROW;

  if (items.length !== expected) {
    console.warn(
      `[home] la galeria de la portada tiene ${items.length} fotos de ${expected}: ` +
        `el catalogo servido tiene ${catalog.length} productos`,
    );
  }

  return chunkGalleryRows(items);
}

/**
 * Devuelve el contenido de la portada coherente con el catálogo recibido.
 *
 * Con `catalog === content/products.ts` (el caso sin `DATABASE_URL`) el
 * resultado es equivalente al objeto `home` literal: es lo que afirma
 * `tests/unit/homeContent.test.ts`.
 */
export function buildHomeContent(catalog: ShopProduct[]): HomeContent {
  const [metricTodo, metricRecetas] = fallbackHome.service.metrics;

  return {
    ...fallbackHome,

    menu: {
      ...fallbackHome.menu,
      products: featuredFrom(catalog),
      // «Ver los 14 productos» no puede quedarse en 14 si la tabla tiene otra cosa.
      ...(fallbackHome.menu.more
        ? {
            more: {
              ...fallbackHome.menu.more,
              label: `Ver los ${catalog.length} productos`,
            },
          }
        : {}),
    },

    service: {
      ...fallbackHome.service,
      // La métrica «14 recetas» ES el tamaño del catálogo. Un número escrito a
      // mano aquí es una promesa que la tienda puede desmentir en la misma
      // pantalla, dos secciones más abajo.
      metrics: [metricTodo, { ...metricRecetas, value: String(catalog.length) }],
    },

    gallery: {
      ...fallbackHome.gallery,
      rows: galleryFrom(catalog),
    },
  };
}

/**
 * Atajo para las páginas: el contenido de la portada ya coherente con el
 * catálogo servido. `getCatalog()` está cacheado por petición, así que llamarlo
 * aquí y además en la página no cuesta un segundo viaje a Postgres.
 */
export async function getHomeContent(): Promise<HomeContent> {
  return buildHomeContent(await getCatalog());
}
