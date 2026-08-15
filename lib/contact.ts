/**
 * Datos públicos de contacto.
 *
 * Una sola fuente de verdad: este número se usa en el navbar, footer, carrito,
 * JSON-LD, tarjetas OG y páginas de error. Si cambia, no debe quedar un `wa.me`
 * viejo escondido en otro archivo.
 */

export const CONTACT = {
  instagramHandle: "boquitacostarica",
  instagramUrl: "https://www.instagram.com/boquitacostarica/",
  /**
   * El dominio tal y como se le enseña a un humano, sin protocolo. Aparece dos
   * veces en el mensaje de WhatsApp del pedido (cabecera y pie), y por eso vive
   * aquí: cuando se registre el definitivo no debe quedar una copia vieja
   * escondida en `lib/whatsapp.ts`.
   *
   * No es `SITE_URL` (`lib/seo.ts`), que sale del entorno y en local vale
   * `http://localhost:3000` — eso no se le manda a nadie por WhatsApp.
   */
  siteDomain: "boquitacostarica.com",
  whatsappDigits: "50671322355",
  whatsappDisplay: "+506 7132 2355",
  /**
   * El correo público de Ale. Se muestra en «Sobre Nosotros» y en la columna de
   * contacto del pie.
   */
  email: "ticaboquita@gmail.com",
  address: "Condominio Condado del Río, Santa Ana, Costa Rica",
  addressLocality: "Santa Ana",
  addressRegion: "San José",
  addressCountry: "CR",
} as const;

export function telHref(): string {
  return `tel:+${CONTACT.whatsappDigits}`;
}

/**
 * `api.whatsapp.com/send` y NO `wa.me`, y el motivo está medido.
 *
 * `wa.me` es un atajo que redirige a este mismo endpoint, y **en ese salto
 * WhatsApp descodifica la query y la vuelve a codificar con otro codificador que
 * no maneja pares surrogados**: todo carácter de 4 bytes en UTF-8 llega como
 * `U+FFFD`. Comprobado con el mensaje del pedido, que lleva emoji:
 *
 *   · lo que enviamos:            …text=Hola%2C%20Ale%20%F0%9F%91%8B%0A%0A…
 *   · lo que quedaba tras el salto: …text=Hola%2C+Ale+%EF%BF%BD%0A%0A…
 *
 * Los espacios pasaron de `%20` a `+` y el `*` de literal a `%2A`, que es la
 * huella de la recodificación. Sobrevivía TODO lo de 1-3 bytes (`•`, `×`, `└`,
 * `—`, `₡`, la `ñ`) y se perdían los 8 emoji, que son los únicos de 4.
 *
 * Enlazando aquí directamente no hay salto que recodifique. Ojo al detalle: este
 * endpoint lleva el número en la query (`?phone=`), así que el texto se añade con
 * `&` y no con `?` — de eso se encarga `whatsappTextUrl` para que no haya dos
 * sitios que lo recuerden.
 */
export function whatsappBaseUrl(): string {
  return `https://api.whatsapp.com/send?phone=${CONTACT.whatsappDigits}`;
}

/** Añade un texto YA codificado. Lo usa `lib/whatsapp.ts`, que mide su longitud. */
export function whatsappTextUrl(encodedText: string): string {
  return `${whatsappBaseUrl()}&text=${encodedText}`;
}

export function whatsappUrl(message: string): string {
  return whatsappTextUrl(encodeURIComponent(message));
}
