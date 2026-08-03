import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Picture } from "@/components/ui/Picture";
import { home } from "@/content/home";
import { products } from "@/content/products";
import { formatCRCShort } from "@/lib/format";

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

export default function NotFound() {
  const sugerencias = products
    .filter((product) => !product.priceOnRequest && !product.photoTodo)
    .slice(0, 3);

  return (
    <>
      <Navbar nav={home.nav} />

      <main id="contenido">
        <section className="section">
          <div className="container container--start">
            <p className="h6-sans primary">Error 404</p>
            <h1>Esta página se nos quemó</h1>
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
              {sugerencias.map((product) => (
                <li className="shop-card" key={product.slug}>
                  <Link className="shop-card-link" href={`/tienda/${product.slug}`}>
                    <Picture image={product.image} className="shop-card-img" />
                    <span className="shop-card-name">{product.name}</span>
                  </Link>
                  <p className="shop-card-price">{formatCRCShort(product.price)}</p>
                  <p className="shop-card-summary">{product.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer footer={home.footer} />
    </>
  );
}
