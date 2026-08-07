import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Picture } from "@/components/ui/Picture";
import { getCatalog } from "@/lib/db/catalog";
import { formatCRCShort } from "@/lib/format";
import { getHomeContent } from "@/lib/homeContent";
import { filterShopProducts } from "@/lib/shopSearch";
import { CATEGORIAS, OCASIONES, type Categoria, type Ocasion } from "@/types/shop";

/**
 * Catálogo completo, con filtros por categoría y por ocasión.
 *
 * Los filtros son `searchParams` y no rutas: así son 1 plantilla en vez de 11, se
 * pueden combinar, y cada combinación tiene una URL que se puede compartir por
 * WhatsApp — que es exactamente lo que Ale va a hacer.
 *
 * El filtrado se hace en memoria sobre el catálogo entero, no con un `WHERE` por
 * combinación: son 14 filas y una sola consulta cacheada por petición sirve las
 * 11 vistas. Un `WHERE` por filtro serían 11 planes de consulta para ahorrar
 * microsegundos sobre un array de 14 elementos.
 */

/**
 * El recuento del catálogo va en la descripción, así que la metadata no puede ser
 * un objeto estático: «Los 14 productos» tiene que dejar de decir 14 el día que
 * la tabla tenga 15.
 *
 * Y como los filtros son `searchParams`, las 11 vistas son la MISMA ruta: sin
 * leerlos aquí, «Salado» y «Navidad» compartían título, descripción y canonical
 * con el catálogo entero. Eso importa más de lo que parece en este producto,
 * porque la forma de compartir una vista filtrada es pegar su URL en WhatsApp, y
 * WhatsApp muestra exactamente este título y esta descripción.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; ocasion?: string; q?: string }>;
}): Promise<Metadata> {
  const [params, catalog] = await Promise.all([searchParams, getCatalog()]);

  const categoria = isCategoria(params.categoria) ? params.categoria : undefined;
  const ocasion = isOcasion(params.ocasion) ? params.ocasion : undefined;
  const q = params.q?.trim() ?? "";

  const encontrados = filterShopProducts(catalog, { categoria, ocasion, q }).length;

  // Búsqueda: no se indexa. Son infinitas URLs de contenido derivado, y una
  // búsqueda sin resultados sería una página vacía en el índice.
  if (q) {
    return {
      title: `«${q}» en el catálogo`,
      description:
        encontrados > 0
          ? `${encontrados} ${encontrados === 1 ? "producto" : "productos"} de Boquita para «${q}».`
          : `Ningún producto de Boquita coincide con «${q}». Mirá el catálogo completo.`,
      robots: { index: false, follow: true },
      alternates: { canonical: "/tienda" },
    };
  }

  const partes = [categoria && CATEGORIAS[categoria], ocasion && OCASIONES[ocasion]].filter(Boolean);

  if (partes.length === 0) {
    return {
      title: "Catálogo",
      description:
        `Los ${catalog.length} productos de Boquita: queques de zanahoria, galletas de granola ` +
        "sin gluten, polvorones españoles, brigadeiros, biscotti y bocaditos salados. " +
        "Horneado por encargo en Santa Ana.",
      alternates: { canonical: "/tienda" },
    };
  }

  // Las vistas filtradas sí se indexan y apuntan a sí mismas: son destinos de
  // navegación reales —el dropdown del header enlaza a ellas— y responden a
  // búsquedas concretas («queques Santa Ana»), no a contenido duplicado.
  const query = new URLSearchParams();
  if (categoria) query.set("categoria", categoria);
  if (ocasion) query.set("ocasion", ocasion);

  return {
    title: partes.join(" · "),
    description:
      `${encontrados} ${encontrados === 1 ? "producto" : "productos"} de Boquita` +
      `${categoria ? ` en ${CATEGORIAS[categoria].toLowerCase()}` : ""}` +
      `${ocasion ? ` para ${OCASIONES[ocasion].toLowerCase()}` : ""}. ` +
      "Horneado por encargo en Santa Ana.",
    alternates: { canonical: `/tienda?${query.toString()}` },
  };
}

function isCategoria(value: string | undefined): value is Categoria {
  return value !== undefined && value in CATEGORIAS;
}

function isOcasion(value: string | undefined): value is Ocasion {
  return value !== undefined && value in OCASIONES;
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; ocasion?: string; q?: string }>;
}) {
  const [params, products, home] = await Promise.all([
    searchParams,
    getCatalog(),
    getHomeContent(),
  ]);

  // Un valor inválido en la URL se ignora en vez de dar error: alguien puede
  // haber editado el enlace a mano o el parámetro puede venir de un share viejo.
  const categoria = isCategoria(params.categoria) ? params.categoria : undefined;
  const ocasion = isOcasion(params.ocasion) ? params.ocasion : undefined;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const filtered = filterShopProducts(products, { categoria, ocasion, q: query });

  const activeLabel = categoria
    ? CATEGORIAS[categoria]
    : ocasion
      ? OCASIONES[ocasion]
      : undefined;

  /** Conserva el otro filtro al cambiar uno: son combinables. */
  const hrefFor = (
    next: { categoria?: Categoria; ocasion?: Ocasion },
    options: { q?: string } = { q: query },
  ) => {
    const search = new URLSearchParams();
    const nextCategoria = "categoria" in next ? next.categoria : categoria;
    const nextOcasion = "ocasion" in next ? next.ocasion : ocasion;
    if (nextCategoria) search.set("categoria", nextCategoria);
    if (nextOcasion) search.set("ocasion", nextOcasion);
    if (options.q) search.set("q", options.q);
    const queryString = search.toString();
    return queryString ? `/tienda?${queryString}` : "/tienda";
  };

  const clearSearchHref = hrefFor({}, { q: "" });

  return (
    <>
      <Navbar nav={home.nav} />

      <main id="contenido">
        <section className="section">
          <div className="container container--start">
            <div className="shop-header">
              <p className="h6-sans primary">Horneado por encargo</p>
              <h1>{activeLabel ?? "Todo el catálogo"}</h1>
              <p className="lead mt-20">
                {query
                  ? `${filtered.length} ${filtered.length === 1 ? "producto" : "productos"} para “${query}”.`
                  : filtered.length === products.length
                  ? `Los ${products.length} productos que salen de nuestro horno. Todo se hornea por encargo, con 48 horas de anticipación.`
                  : `${filtered.length} ${filtered.length === 1 ? "producto" : "productos"} en ${activeLabel}.`}
              </p>
            </div>

            <nav className="shop-filters" aria-label="Filtrar por categoría">
              <Link
                className="shop-filter"
                href={hrefFor({ categoria: undefined })}
                aria-current={!categoria ? "true" : undefined}
              >
                Todo
              </Link>
              {Object.entries(CATEGORIAS).map(([key, label]) => (
                <Link
                  key={key}
                  className="shop-filter"
                  href={hrefFor({ categoria: key as Categoria })}
                  aria-current={categoria === key ? "true" : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {ocasion && (
              <nav className="shop-filters" aria-label="Filtro por ocasión activo">
                <Link className="shop-filter" href={hrefFor({ ocasion: undefined })}>
                  Quitar el filtro «{OCASIONES[ocasion]}» ✕
                </Link>
              </nav>
            )}

            {query && (
              <nav className="shop-filters" aria-label="Búsqueda activa">
                <span className="shop-filter shop-filter--static">Búsqueda: “{query}”</span>
                <Link className="shop-filter" href={clearSearchHref}>
                  Limpiar búsqueda ✕
                </Link>
              </nav>
            )}

            {filtered.length === 0 ? (
              <div className="shop-empty">
                <p>
                  No hay productos con esa combinación de filtros.{" "}
                  <Link href="/tienda">Ver catálogo completo</Link>.
                </p>
              </div>
            ) : (
              <ul className="shop-grid">
                {filtered.map((product) => (
                  <li className="shop-card" key={product.slug}>
                    <Link className="shop-card-link" href={`/tienda/${product.slug}`}>
                      <Picture image={product.image} className="shop-card-img" />
                      <span className="shop-card-name">{product.name}</span>
                    </Link>
                    <p className="shop-card-price">
                      {product.priceFrom ? "desde " : ""}
                      {formatCRCShort(product.price)}
                    </p>
                    <p className="shop-card-summary">{product.summary}</p>
                    <p className="shop-card-tag">
                      {CATEGORIAS[product.categoria]} · {product.unit}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <Footer footer={home.footer} />
    </>
  );
}
