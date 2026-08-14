import { formatCRCShort } from "@/lib/format";
import { CONTACT, whatsappTextUrl, whatsappUrl } from "@/lib/contact";
import type { CartLine, CheckoutFields } from "@/types/shop";

/**
 * Construye el mensaje de WhatsApp del pedido.
 *
 * Puro y sin dependencias del DOM, para poder testearlo: es el artefacto que
 * llega literalmente al teléfono de Ale, así que un fallo aquí es un pedido mal
 * entendido, no un problema de maquetación.
 */

export const WA_NUMBER = CONTACT.whatsappDigits;

/**
 * WhatsApp Desktop trunca y algunos manejadores de intents de Android fallan
 * pasados ~2000 caracteres CODIFICADOS. Las tildes y los emoji ocupan 3-9 bytes
 * al codificar, así que un carrito con nombres acentuados llega al límite antes
 * de lo que parece.
 *
 * **1600 y no 1400, y el número sale de medirlo.** Al pasar el mensaje al formato
 * con emoji cada producto ocupa dos líneas y unos 110 caracteres codificados, y
 * la cabecera fija se lleva ~585 de entrada. Medido con un carrito real y los
 * cuatro campos rellenos: 2 productos → 805, 4 → 1023, 6 → 1249, 8 → ~1470. Con
 * el techo anterior **un pedido de 8 productos perdía el detalle** y caía al
 * mensaje compacto. Con 1600 caben 9 y quedan 400 de margen sobre el punto en que
 * wa.me empieza a fallar.
 *
 * Lo fija `tests/unit/whatsapp.test.ts`, que mide un carrito de 8 y exige que NO
 * se trunque: si alguien alarga la cabecera, ahí se entera.
 */
export const MAX_ENCODED_LENGTH = 1600;

/** Cuántas líneas se detallan antes de resumir el resto. */
const MAX_DETAILED_LINES = 20;

/**
 * Las etiquetas del mensaje son un CONTRATO, no decoración.
 *
 * Hoy lo lee Ale, pero está pensado para que mañana lo parsee un chatbot: un dato
 * por línea, etiqueta fija delante y `└` para la presentación de cada producto.
 * Añadir un campo es seguro; **renombrar uno de estos rótulos rompe al
 * consumidor**, así que no se tocan por gusto estético.
 *
 * La negrita va con UN asterisco porque es lo que entiende WhatsApp. Con dos
 * —sintaxis de Markdown— los asteriscos se ven literales en el chat.
 */
const LABEL = {
  greeting: "Hola, Ale 👋",
  detail: "📋 *Detalle del pedido*",
  requestDetail: "📋 *Detalle de la solicitud*",
  total: "💰 *Total:*",
  totalPartial: "💰 *Total (productos con precio fijo):*",
  quoted: "⚠️ Hay productos que se cotizan aparte.",
  client: "👤 *Cliente:*",
  date: "📅 *Fecha deseada:*",
  zone: "📍 *Zona:*",
  notes: "📝 *Notas:*",
  request: "📌 *Solicitud:*",
} as const;

/**
 * La cabecera y el pie llevan el dominio dentro, así que son funciones y no
 * cadenas: guardar `"🛍️ *Nuevo pedido desde"` con el asterisco a medio cerrar y
 * completarlo en el sitio de la llamada deja una constante que se rompe sola en
 * cuanto alguien la reutiliza. Aquí la negrita abre y cierra en la misma línea.
 */
function header(kind: string): string {
  return `🛍️ *${kind} desde ${CONTACT.siteDomain}*`;
}

function directHeader(icon: string, kind: string): string {
  return `${icon} *${kind} desde ${CONTACT.siteDomain}*`;
}

function footer(): string {
  return `🌐 Generado desde ${CONTACT.siteDomain}`;
}

/**
 * `2026-08-28` → `28/08/2026`, partiendo la cadena a mano.
 *
 * **Nada de `Intl.DateTimeFormat`**, por el mismo motivo por el que `lib/format.ts`
 * prohíbe `Intl` para la moneda: sus resultados varían entre builds de ICU y este
 * mensaje se arma en el navegador. Un valor con otra forma se devuelve tal cual —
 * mejor que inventar una fecha en el pedido de alguien.
 */
function formatDateCR(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/**
 * `pequeño (2 personas)` → `Pequeño (2 personas)`.
 *
 * Las etiquetas de presentación van en minúscula en el catálogo porque ahí viven
 * dentro de una frase; en el mensaje encabezan su propia línea. Sólo la primera
 * letra, así que `12 unidades` y `120 g` se quedan como están.
 */
function capitalizeFirst(value: string): string {
  return value.charAt(0).toLocaleUpperCase("es-CR") + value.slice(1);
}

export function buildOrderMessage(lines: CartLine[], fields: CheckoutFields = {}): string {
  const detailed = lines.slice(0, MAX_DETAILED_LINES);
  const rest = lines.slice(MAX_DETAILED_LINES);

  /** Dos líneas por producto: qué es, y en qué presentación y por cuánto. */
  const items = detailed.flatMap((line) => {
    const price = line.priceOnRequest
      ? "precio a convenir"
      : formatCRCShort(line.price * line.qty);
    return [`• ${line.qty} × ${line.name}`, `└ ${capitalizeFirst(line.unit)} — ${price}`];
  });

  if (rest.length > 0) {
    const restUnits = rest.reduce((total, line) => total + line.qty, 0);
    // El resumen es una viñeta suelta: no tiene presentación que colgar debajo.
    items.push(`• …y ${restUnits} unidades más de ${rest.length} productos`);
  }

  const subtotal = lines
    .filter((line) => !line.priceOnRequest)
    .reduce((total, line) => total + line.price * line.qty, 0);
  const hasQuoted = lines.some((line) => line.priceOnRequest);

  const parts = [
    LABEL.greeting,
    "",
    header("Nuevo pedido"),
    "",
    LABEL.detail,
    ...items,
    "",
    `${hasQuoted ? LABEL.totalPartial : LABEL.total} ${formatCRCShort(subtotal)}`,
  ];

  if (hasQuoted) parts.push(LABEL.quoted);

  /**
   * El bloque del cliente sólo existe si hay algo que poner: un rótulo con el
   * hueco vacío detrás es ruido para quien lee y basura para quien parsea.
   *
   * Spread condicional y no `.filter(Boolean)`: el filtro no estrecha el tipo en
   * TypeScript —seguiría siendo `(string | undefined)[]`— y aquí `parts` es
   * `string[]`.
   */
  const client = [
    ...(fields.name ? [`${LABEL.client} ${fields.name}`] : []),
    ...(fields.date ? [`${LABEL.date} ${formatDateCR(fields.date)}`] : []),
    ...(fields.zone ? [`${LABEL.zone} ${fields.zone}`] : []),
    ...(fields.notes ? [`${LABEL.notes} ${fields.notes}`] : []),
  ];

  if (client.length > 0) parts.push("", ...client);

  parts.push("", `${LABEL.request} Confirmar disponibilidad y detalles del pedido.`, "", footer());

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
    LABEL.greeting,
    "",
    header("Nuevo pedido grande"),
    "",
    `📦 *Resumen:* ${units} unidades de ${lines.length} productos`,
    `💰 *Total aproximado:* ${formatCRCShort(subtotal)}`,
  ];

  const client = [
    ...(fields.name ? [`${LABEL.client} ${fields.name}`] : []),
    ...(fields.date ? [`${LABEL.date} ${formatDateCR(fields.date)}`] : []),
  ];

  if (client.length > 0) parts.push("", ...client);

  parts.push("", `${LABEL.request} Te paso el detalle en el siguiente mensaje.`, "", footer());

  return parts.join("\n");
}

/**
 * URL de WhatsApp con el mensaje ya codificado.
 *
 * Los saltos de línea van como `\n` y se codifican DESPUÉS (a `%0A`). Escribir
 * `%0A` a mano y volver a codificar daría `%250A` literal en el chat.
 *
 * El endpoint lo decide `lib/contact.ts`, que explica por qué no es `wa.me`: su
 * redirección se come los emoji.
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
    url: whatsappTextUrl(encoded),
    encodedLength: encoded.length,
    truncated,
  };
}

export type DirectWhatsAppKind = "order" | "consultation" | "quote" | "error";

export function buildDirectWhatsAppMessage(
  kind: DirectWhatsAppKind,
  options: { productName?: string } = {},
): string {
  if (kind === "order") {
    return [
      LABEL.greeting,
      "",
      header("Nuevo pedido"),
      "",
      `${LABEL.request} Quiero hacer un pedido y confirmar disponibilidad, fecha y entrega.`,
      "",
      footer(),
    ].join("\n");
  }

  if (kind === "consultation") {
    return [
      LABEL.greeting,
      "",
      directHeader("💬", "Nueva consulta"),
      "",
      `${LABEL.request} Quiero hacer una consulta sobre un pedido.`,
      "",
      footer(),
    ].join("\n");
  }

  if (kind === "quote") {
    return [
      LABEL.greeting,
      "",
      directHeader("🧁", "Cotización"),
      "",
      LABEL.requestDetail,
      `• ${options.productName ?? "Producto a cotizar"}`,
      "└ Precio a convenir según tamaño y diseño",
      "",
      `${LABEL.request} Quiero cotizar este producto y contarles la idea para confirmar tamaño, diseño y fecha.`,
      "",
      footer(),
    ].join("\n");
  }

  return [
    LABEL.greeting,
    "",
    directHeader("⚠️", "Ayuda"),
    "",
    `${LABEL.request} La web me dio un error y quiero hacer un pedido por WhatsApp.`,
    "",
    footer(),
  ].join("\n");
}

export function buildDirectWhatsAppUrl(
  kind: DirectWhatsAppKind,
  options: { productName?: string } = {},
): string {
  return whatsappUrl(buildDirectWhatsAppMessage(kind, options));
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
