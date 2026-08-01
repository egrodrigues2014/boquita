import { home } from "@/content/home";

/**
 * Datos estructurados para búsqueda local.
 *
 * Es el elemento de mayor retorno SEO para una repostería de barrio y cuesta un
 * componente: le dice a Google que esto es una panadería con teléfono, zona de
 * servicio y catálogo, en vez de "una página web cualquiera". De eso salen los
 * paneles de negocio local y los resultados con precio.
 *
 * `Bakery` es un subtipo de `LocalBusiness` y de `FoodEstablishment`, así que un
 * solo nodo cubre las tres cosas.
 *
 * ⚠ La dirección es aproximada hasta que Ale confirme el punto exacto de retiro
 * (CONTENT_TODO §6). Se declara sólo lo que se sabe: sin `streetAddress`
 * inventada, porque un dato falso en JSON-LD es peor que un dato ausente.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function bakeryJsonLd() {
  const { footer, menu, service } = home;

  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${SITE_URL}#negocio`,
    name: "Boquita — Sweet & Salty",
    description: footer.brandText,
    url: SITE_URL,
    telephone: "+50662762196",
    email: "ticaboquita@gmail.com",
    image: `${SITE_URL}${home.hero.image.src}`,
    logo: `${SITE_URL}/img/brand/logo-86x86.webp`,
    priceRange: "₡₡",
    currenciesAccepted: "CRC",
    // Se pide por WhatsApp y se retira o coordina la entrega: no hay pago online.
    paymentAccepted: "Efectivo, SINPE Móvil, transferencia",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Río Oro de Santa Ana",
      addressRegion: "San José",
      addressCountry: "CR",
    },
    areaServed: [
      { "@type": "City", name: "Santa Ana" },
      { "@type": "City", name: "Escazú" },
      { "@type": "AdministrativeArea", name: "Valle Central" },
    ],
    sameAs: ["https://instagram.com/boquitacostarica"],
    // Horneado por encargo con 48 h de anticipación: no hay horario de tienda,
    // así que no se declara `openingHoursSpecification` — sería falso.
    slogan: "Dulce y salado, hecho en casa",
    founder: { "@type": "Person", name: "Ale Budowski" },
    knowsLanguage: "es-CR",
    hasMenu: {
      "@type": "Menu",
      name: menu.title,
      hasMenuSection: {
        "@type": "MenuSection",
        name: menu.eyebrow,
        hasMenuItem: menu.products.map((product) => ({
          "@type": "MenuItem",
          name: product.name,
          description: product.category,
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "CRC",
            availability: "https://schema.org/PreOrder",
          },
        })),
      },
    },
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Repostería por encargo",
        description: service.body,
      },
    },
  };
}

/** JSON-LD del sitio, para que el buscador entienda el nombre y el idioma. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#sitio`,
    url: SITE_URL,
    name: "Boquita — Sweet & Salty",
    inLanguage: "es-CR",
    publisher: { "@id": `${SITE_URL}#negocio` },
  };
}
