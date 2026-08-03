import { formatCRCShort } from "@/lib/format";
import type { CartLine, CheckoutFields } from "@/types/shop";

/**
 * Construye el mensaje de WhatsApp del pedido.
 *
 * Puro y sin dependencias del DOM, para poder testearlo: es el artefacto que
 * llega literalmente al teléfono de Ale, así que un fallo aquí es un pedido mal
 * entendido, no un problema de maquetación.
 */

export const WA_NUMBER = "50662762196";

/**
 * WhatsApp Desktop trunca y algunos manejadores de intents de Android fallan
 * pasados ~2000 caracteres CODIFICADOS. Las tildes y los emoji ocupan 3-9 bytes
 * al codificar, así que un carrito con nombres acentuados llega al límite antes
 * de lo que parece. 1400 deja margen.
 */
export const MAX_ENCODED_LENGTH = 1400;

/** Cuántas líneas se detallan antes de resumir el resto. */
const MAX_DETAILED_LINES = 20;

export function buildOrderMessage(lines: CartLine[], fields: CheckoutFields = {}): string {
  const detailed = lines.slice(0, MAX_DETAILED_LINES);
  const rest = lines.slice(MAX_DETAILED_LINES);

  const items = detailed.map((line) => {
    const price = line.priceOnRequest
      ? "precio a convenir"
      : formatCRCShort(line.price * line.qty);
    return `• ${line.qty} × ${line.name} (${line.unit}) — ${price}`;
  });

  if (rest.length > 0) {
    const restUnits = rest.reduce((total, line) => total + line.qty, 0);
    items.push(`• …y ${restUnits} unidades más de ${rest.length} productos`);
  }

  const subtotal = lines
    .filter((line) => !line.priceOnRequest)
    .reduce((total, line) => total + line.price * line.qty, 0);
  const hasQuoted = lines.some((line) => line.priceOnRequest);

  const parts = [
    "¡Hola Boquita! Quiero hacer este pedido:",
    "",
    ...items,
    "",
    `Total${hasQuoted ? " de los productos con precio" : ""}: ${formatCRCShort(subtotal)}`,
  ];

  if (hasQuoted) parts.push("(hay productos que se cotizan aparte)");

  if (fields.name) parts.push("", `Nombre: ${fields.name}`);
  if (fields.date) parts.push(`Fecha deseada: ${fields.date}`);
  if (fields.zone) parts.push(`Zona de entrega: ${fields.zone}`);
  if (fields.notes) parts.push(`Notas: ${fields.notes}`);

  parts.push("", "Enviado desde boquita.cr");

  return parts.join("\n");
}

/**
 * Versión compacta para cuando el mensaje completo se pasa del límite. Conserva
 * lo imprescindible: cuántas cosas, cuánto suma y cómo contactar.
 */
export function buildCompactMessage(lines: CartLine[], fields: CheckoutFields = {}): string {
  const units = lines.reduce((total, line) => total + line.qty, 0);
  const subtotal = lines
    .filter((line) => !line.priceOnRequest)
    .reduce((total, line) => total + line.price * line.qty, 0);

  const parts = [
    "¡Hola Boquita! Quiero hacer un pedido grande:",
    "",
    `${units} unidades de ${lines.length} productos`,
    `Total aproximado: ${formatCRCShort(subtotal)}`,
  ];

  if (fields.name) parts.push(`Nombre: ${fields.name}`);
  if (fields.date) parts.push(`Fecha deseada: ${fields.date}`);

  parts.push("", "Te paso el detalle en el siguiente mensaje.");

  return parts.join("\n");
}

/**
 * URL de wa.me con el mensaje ya codificado.
 *
 * Los saltos de línea van como `\n` y se codifican DESPUÉS (a `%0A`). Escribir
 * `%0A` a mano y volver a codificar daría `%250A` literal en el chat.
 */
export function buildWhatsAppUrl(
  lines: CartLine[],
  fields: CheckoutFields = {},
): { url: string; encodedLength: number; truncated: boolean } {
  const full = buildOrderMessage(lines, fields);
  let encoded = encodeURIComponent(full);
  let truncated = false;

  if (encoded.length > MAX_ENCODED_LENGTH) {
    encoded = encodeURIComponent(buildCompactMessage(lines, fields));
    truncated = true;
  }

  return {
    url: `https://wa.me/${WA_NUMBER}?text=${encoded}`,
    encodedLength: encoded.length,
    truncated,
  };
}

/** Enlace de consulta, sin carrito. Lo usan el navbar y el CTA del pie. */
export function waPlainLink(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Primera fecha de entrega válida, en formato `YYYY-MM-DD`.
 *
 * Se calcula desde el lead time más largo del carrito: si hay un queque
 * personalizado (168 h), no sirve ofrecer pasado mañana.
 */
export function earliestDate(leadTimeHours: number, from: Date): string {
  const date = new Date(from.getTime() + leadTimeHours * 3600_000);
  // `toISOString` da UTC; para una fecha local basta con recortar la parte de día.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
