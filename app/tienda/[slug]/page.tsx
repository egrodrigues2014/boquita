import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/cart/ProductPurchase";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { JsonLd } from "@/components/ui/JsonLd";
import { Picture } from "@/components/ui/Picture";
import { getCatalog, getProduct } from "@/lib/db/catalog";
import { formatCRCShort } from "@/lib/format";
import { getHomeContent } from "@/lib/homeContent";
import { SITE_URL } from "@/lib/seo";
import { toShopSearchSources } from "@/lib/shopSearch";
import { variantsLabel } from "@/lib/variants";
import { CATEGORIAS, OCASIONES, SUBCATEGORIAS } from "@/types/shop";

/**
 * Ficha de producto.
 *
 * Se prerenderizan todas con `generateStaticParams`, así que se sirven desde el
 * CDN sin tocar ninguna función. `dynamicParams` sigue en su valor por defecto
 * (`true`) a propósito: un producto añadido a la tabla DESPUÉS del build se
 * renderiza a demanda en su primera visita en vez de dar 404 hasta el siguiente
 * despliegue.
 *
 * El `generateMetadata` con su Open Graph es lo que hace que pegar el enlace en
 * un chat de WhatsApp muestre la foto y el precio en vez de una tarjeta vacía.
 * Es el uso principal que va a tener esta página.
 */

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado" };

  const price = `${product.priceFrom ? "desde " : ""}${formatCRCShort(product.price)}`;
  // El primer párrafo hace de resumen: es el que va en la tarjeta del catálogo y
  // el que WhatsApp muestra al pegar el enlace en un chat.
  const [summary = product.name] = product.description;

  return {
    title: product.name,
    description: `${summary} ${price} · ${variantsLabel(product.variants)}.`,
    alternates: { canonical: `/tienda/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} · Boquita`,
      description: summary,
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
  const [catalog, product, home] = await Promise.all([getCatalog(), getProduct(slug), getHomeContent()]);
  if (!product) notFound();

  const prices = product.variants.map((variant) => variant.price);

  /**
   * Con varias presentaciones la oferta es un `AggregateOffer` con su horquilla,
   * no un `Offer` con el precio más bajo: declarar 2.500 a secas cuando el mismo
   * queque llega a 24.000 hace que Google publique un precio que no existe para
   * el tamaño que la mayoría pide.
   */
  const offers =
    product.variants.length > 1
      ? {
          "@type": "AggregateOffer",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: product.variants.length,
          priceCurrency: "CRC",
          availability: "https://schema.org/PreOrder",
          url: `${SITE_URL}/tienda/${product.slug}`,
          seller: { "@id": `${SITE_URL}#negocio` },
        }
      : {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "CRC",
          // Se hornea por encargo: no hay stock, hay pre-pedido. Declarar InStock
          // haría que Google prometiera disponibilidad inmediata.
          availability: "https://schema.org/PreOrder",
          url: `${SITE_URL}/tienda/${product.slug}`,
          seller: { "@id": `${SITE_URL}#negocio` },
        };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.join(" "),
    image: `${SITE_URL}${product.image.srcSet?.at(-1)?.src ?? product.image.src}`,
    category: CATEGORIAS[product.categoria],
    brand: { "@type": "Brand", name: "Boquita — Sweet & Salty" },
    offers,
  };

  const leadTimeLabel =
    product.leadTimeHours >= 168
      ? "una semana"
      : `${product.leadTimeHours} horas`;

  return (
    <>
      <JsonLd data={productJsonLd} />
      <Navbar nav={home.nav} searchProducts={toShopSearchSources(catalog)} />

      <main id="contenido">
        <section className="section">
          <div className="container container--start">
            <Link className="product-back" href="/tienda">
              ← Catálogo de productos
            </Link>

            <div className="product-layout">
              <div className="product-gallery">
                <Picture image={product.image} className="product-img" />
                {/* Segunda foto sólo donde ver otro encargo explica el producto:
                    hoy, el queque personalizado. */}
                {product.imageB && <Picture image={product.imageB} className="product-img" />}
              </div>

              <div>
                <p className="h6-sans primary">
                  {CATEGORIAS[product.categoria]}
                  {product.subcategoria ? ` · ${SUBCATEGORIAS[product.subcategoria]}` : ""}
                </p>
                <h1>{product.name}</h1>

                {/* El precio y la presentación los pinta `ProductPurchase`, que es
                    quien conoce la variante elegida. La descripción se le pasa como
                    hijo para que siga siendo del servidor y no cambie de sitio. */}
                <ProductPurchase product={product}>
                  {product.description.map((paragraph) => (
                    <p className="mt-20" key={paragraph.slice(0, 30)}>
                      {paragraph}
                    </p>
                  ))}
                </ProductPurchase>

                <dl className="product-meta">
                  <dt>Anticipación</dt>
                  <dd>Se hornea por encargo, con {leadTimeLabel} de anticipación.</dd>

                  <dt>Ingredientes</dt>
                  <dd>{product.ingredients.join(", ")}.</dd>

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
                    Retiro en Condado del Río, Santa Ana, o entrega dentro de la Gran Área
                    Metropolitana, coordinada por WhatsApp.
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
