import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Picture } from "@/components/ui/Picture";
import { getCatalog } from "@/lib/db/catalog";
import { formatCRCShort } from "@/lib/format";
import { getHomeContent } from "@/lib/homeContent";
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
 */
export async function generateMetadata(): Promise<Metadata> {
  const catalog = await getCatalog();
  return {
    title: "Catálogo",
    description:
      `Los ${catalog.length} productos de Boquita: queques de zanahoria, galletas de granola ` +
      "sin gluten, polvorones españoles, brigadeiros, biscotti y bocaditos salados. " +
      "Horneado por encargo en Río Oro de Santa Ana.",
    alternates: { canonical: "/tienda" },
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
  searchParams: Promise<{ categoria?: string; ocasion?: string }>;
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

  const filtered = products.filter(
    (product) =>
      (!categoria || product.categoria === categoria) &&
      (!ocasion || product.ocasiones.includes(ocasion)),
  );

  const activeLabel = categoria
    ? CATEGORIAS[categoria]
    : ocasion
      ? OCASIONES[ocasion]
      : undefined;

  /** Conserva el otro filtro al cambiar uno: son combinables. */
  const hrefFor = (next: { categoria?: Categoria; ocasion?: Ocasion }) => {
    const search = new URLSearchParams();
    const nextCategoria = "categoria" in next ? next.categoria : categoria;
    const nextOcasion = "ocasion" in next ? next.ocasion : ocasion;
    if (nextCategoria) search.set("categoria", nextCategoria);
    if (nextOcasion) search.set("ocasion", nextOcasion);
    const query = search.toString();
    return query ? `/tienda?${query}` : "/tienda";
  };

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
                {filtered.length === products.length
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

            {filtered.length === 0 ? (
              <div className="shop-empty">
                <p>
                  No hay productos con esa combinación de filtros.{" "}
                  <Link href="/tienda">Ver todo el catálogo</Link>.
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
