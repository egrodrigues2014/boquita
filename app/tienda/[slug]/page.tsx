import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/ui/JsonLd";
import { Picture } from "@/components/ui/Picture";
import { home } from "@/content/home";
import { findProduct, products } from "@/content/products";
import { formatCRCShort } from "@/lib/format";
import { SITE_URL } from "@/lib/seo";
import { CATEGORIAS, OCASIONES } from "@/types/shop";

/**
 * Ficha de producto.
 *
 * Se prerenderizan las 14 con `generateStaticParams`: son fijas y así se sirven
 * desde el CDN sin tocar ninguna función.
 *
 * El `generateMetadata` con su Open Graph es lo que hace que pegar el enlace en
 * un chat de WhatsApp muestre la foto y el precio en vez de una tarjeta vacía.
 * Es el uso principal que va a tener esta página.
 */

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return { title: "Producto no encontrado" };

  const price = `${product.priceFrom ? "desde " : ""}${formatCRCShort(product.price)}`;

  return {
    title: product.name,
    description: `${product.summary} ${price} · ${product.unit}.`,
    alternates: { canonical: `/tienda/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} · Boquita`,
      description: product.summary,
      url: `${SITE_URL}/tienda/${product.slug}`,
      images: [
        {
          url: `${SITE_URL}${product.image.srcSet?.at(-1)?.src ?? product.image.src}`,
          alt: product.image.alt,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    image: `${SITE_URL}${product.image.srcSet?.at(-1)?.src ?? product.image.src}`,
    category: CATEGORIAS[product.categoria],
    brand: { "@type": "Brand", name: "Boquita — Sweet & Salty" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "CRC",
      // Se hornea por encargo: no hay stock, hay pre-pedido. Declarar InStock
      // haría que Google prometiera disponibilidad inmediata.
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}/tienda/${product.slug}`,
      seller: { "@id": `${SITE_URL}#negocio` },
    },
  };

  const leadTimeLabel =
    product.leadTimeHours >= 168
      ? "una semana"
      : `${product.leadTimeHours} horas`;

  return (
    <>
      <JsonLd data={productJsonLd} />
      <Navbar nav={home.nav} />

      <main id="contenido">
        <section className="section">
          <div className="container container--start">
            <Link className="product-back" href="/tienda">
              ← Todo el catálogo
            </Link>

            <div className="product-layout">
              <Picture image={product.image} className="product-img" />

              <div>
                <p className="h6-sans primary">{CATEGORIAS[product.categoria]}</p>
                <h1>{product.name}</h1>

                <p className="product-price">
                  {product.priceFrom ? "desde " : ""}
                  {formatCRCShort(product.price)}
                </p>
                <p className="product-unit">{product.unit}</p>

                {product.description.map((paragraph) => (
                  <p className="mt-20" key={paragraph.slice(0, 30)}>
                    {paragraph}
                  </p>
                ))}

                <AddToCartButton product={product} />

                <dl className="product-meta">
                  <dt>Anticipación</dt>
                  <dd>Se hornea por encargo, con {leadTimeLabel} de anticipación.</dd>

                  {product.allergens.length > 0 && (
                    <>
                      <dt>Contiene</dt>
                      <dd>{product.allergens.join(", ")}.</dd>
                    </>
                  )}

                  <dt>Ideal para</dt>
                  <dd>
                    {product.ocasiones.map((key, index) => (
                      <span key={key}>
                        {index > 0 && " · "}
                        <Link href={`/tienda?ocasion=${key}`}>{OCASIONES[key]}</Link>
                      </span>
                    ))}
                  </dd>

                  <dt>Entrega</dt>
                  <dd>
                    Retiro en Río Oro de Santa Ana, o entrega en Santa Ana, Escazú y alrededores
                    coordinada por WhatsApp.
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer footer={home.footer} />
    </>
  );
}
