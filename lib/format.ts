/**
 * Formato de moneda para Boquita.
 *
 * ⚠ NO usar Intl.NumberFormat aquí. Verificado:
 *   new Intl.NumberFormat("es-CR").format(12000)  →  "12 000"  (espacio duro fino U+202F)
 *   ...{ style:"currency", currency:"CRC" }        →  "₡12 000,00"
 *
 * Ninguno de los dos coincide con el formato que pide el spec §8 ("$ 00.00 USD"
 * adaptado a la moneda del proyecto, manteniendo el espacio tras el símbolo), y
 * los separadores de millar de es-CR varían entre builds de ICU (Node
 * small-icu vs Vercel vs navegador). Eso significa que el mismo precio puede
 * renderizarse "₡8,500" en el servidor y "₡8.500" en el cliente → mismatch de
 * hidratación en un precio, que es de los errores más caros de detectar.
 *
 * Los precios son SIEMPRE enteros en colones (el colón no lleva decimales en
 * la práctica), así que un separador manual es suficiente y determinista.
 */

/** Agrupa millares con punto: 12000 → "12.000" */
function groupThousands(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Formato completo, para el bloque de catálogo y las páginas de producto.
 * Sigue el patrón del spec §8: símbolo, espacio, importe, código de moneda.
 *
 *   formatCRC(14000) → "₡ 14.000 CRC"
 */
export function formatCRC(colones: number): string {
  return `₡ ${groupThousands(colones)} CRC`;
}

/**
 * Formato corto, para el carrito y el mensaje de WhatsApp, donde el sufijo
 * "CRC" es ruido (nadie duda de la moneda dentro de un chat costarricense).
 *
 *   formatCRCShort(14000) → "₡ 14.000"
 */
export function formatCRCShort(colones: number): string {
  return `₡ ${groupThousands(colones)}`;
}

/**
 * Para productos cuyo precio arranca en un mínimo (queques personalizados).
 *
 *   formatFrom(22000) → "desde ₡ 22.000 CRC"
 */
export function formatFrom(colones: number): string {
  return `desde ${formatCRC(colones)}`;
}
