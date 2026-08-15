import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/shop/ProductCard";
import { getCatalog } from "@/lib/db/catalog";
import { getHomeContent } from "@/lib/homeContent";
import { toShopSearchSources } from "@/lib/shopSearch";

/**
 * 404 propia.
 *
 * No es adorno: la tienda lleva años compartiendo enlaces por Instagram y
 * WhatsApp, y los que caduquen van a aterrizar aquí. La página por defecto de
 * Next no ofrece ninguna salida.
 *
 * Se muestran tres productos para que un enlace roto acabe en un pedido en vez
 * de en un callejón sin salida.
 */

export const metadata: Metadata = {
  title: "Esta página no existe",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const [products, home] = await Promise.all([getCatalog(), getHomeContent()]);

  // Las sugerencias salen del catálogo SERVIDO, no del estático: una 404 que
  // recomienda un producto que ya no está en la tabla lleva a otra 404.
  const sugerencias = products
    .filter((product) => !product.priceOnRequest && !product.photoTodo)
    .slice(0, 3);

  return (
    <>
      <Navbar nav={home.nav} searchProducts={toShopSearchSources(products)} />

      <main id="contenido">
        <section className="section">
          <div className="container container--start">
            <p className="h6-sans primary">Error 404</p>
            <h1>No encontramos esta página</h1>
            <p className="lead mt-20 prose-narrow">
              El enlace que seguiste no existe o cambió de sitio. Puede que venga de una
              publicación vieja de Instagram.
            </p>

            <div className="btn-group">
              <Link className="btn" href="/tienda">
                Ver el catálogo
              </Link>
              <Link className="btn btn--ghost" href="/">
                Volver a la portada
              </Link>
            </div>

            <h2 className="mt-40">Quizá buscabas alguno de estos</h2>
            <ul className="shop-grid">
              {/* Sin la línea de etiquetas: aquí la tarjeta es una salida de
                  emergencia, no una ficha que se compare con las de al lado. */}
              {sugerencias.map((product) => (
                <ProductCard key={product.slug} product={product} showTag={false} />
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer footer={home.footer} />
    </>
  );
}
