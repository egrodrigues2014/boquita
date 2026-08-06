/**
 * Datos públicos de contacto.
 *
 * Una sola fuente de verdad: este número se usa en el navbar, footer, carrito,
 * JSON-LD, tarjetas OG y páginas de error. Si cambia, no debe quedar un `wa.me`
 * viejo escondido en otro archivo.
 */

export const CONTACT = {
  instagramHandle: "boquita_cr",
  instagramUrl: "https://instagram.com/boquita_cr",
  whatsappDigits: "50671322355",
  whatsappDisplay: "+506 7132 2355",
  address: "Calle Obelisco, condominio Condado del Río, Santa Ana, Costa Rica",
  addressLocality: "Santa Ana",
  addressRegion: "San José",
  addressCountry: "CR",
} as const;

export function telHref(): string {
  return `tel:+${CONTACT.whatsappDigits}`;
}

export function whatsappBaseUrl(): string {
  return `https://wa.me/${CONTACT.whatsappDigits}`;
}

export function whatsappUrl(message: string): string {
  return `${whatsappBaseUrl()}?text=${encodeURIComponent(message)}`;
}
