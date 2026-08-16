import { home } from "@/content/home";
import { CONTACT } from "@/lib/contact";

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
 * Se declaran sólo canales confirmados: nada de Facebook o correo placeholder en
 * datos estructurados públicos.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * La URL de producción de Vercel existe antes de que el dominio esté listo.
 * Exigir esta segunda llave evita que esa URL temporal se indexe durante la
 * validación interna o que un despliegue accidental anuncie el sitio antes del
 * cambio de DNS.
 */
export function isSiteIndexable(
  vercelEnv = process.env.VERCEL_ENV,
  siteLaunched = process.env.SITE_LAUNCHED,
): boolean {
  return vercelEnv === "production" && siteLaunched === "true";
}

export function bakeryJsonLd() {
  const { footer, menu, service } = home;

  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${SITE_URL}#negocio`,
    name: "Boquita — Sweet & Salty",
    description: footer.brandText,
    url: SITE_URL,
    telephone: `+${CONTACT.whatsappDigits}`,
    image: `${SITE_URL}${home.hero.image.src}`,
    logo: `${SITE_URL}/img/brand/logo-transparent-86x86.png`,
    priceRange: "₡₡",
    currenciesAccepted: "CRC",
    // Se pide por WhatsApp y se retira o coordina la entrega: no hay pago online.
    paymentAccepted: "Efectivo, SINPE Móvil, transferencia",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Condominio Condado del Río",
      addressLocality: CONTACT.addressLocality,
      addressRegion: CONTACT.addressRegion,
      addressCountry: CONTACT.addressCountry,
    },
    areaServed: [
      { "@type": "City", name: "Santa Ana" },
      { "@type": "City", name: "Escazú" },
      { "@type": "AdministrativeArea", name: "Valle Central" },
    ],
    sameAs: [CONTACT.instagramUrl],
    // Horneado por encargo con 48 h de anticipación: no hay horario de tienda,
    // así que no se declara `openingHoursSpecification` — sería falso.
    slogan: "Dulce y salado, hecho en casa",
    founder: { "@type": "Person", name: "Ale" },
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
