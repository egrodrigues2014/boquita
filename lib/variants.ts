import type { ProductVariant, ShopProduct } from "@/types/shop";

/**
 * Utilidades de presentaciones.
 *
 * Existe una sola razón para que esto sea un módulo y no dos líneas dentro de la
 * tarjeta: la etiqueta compacta se usa en TRES sitios con reglas idénticas —la
 * línea de la tarjeta del catálogo, la descripción del Open Graph de la ficha y
 * la tarjeta de la rejilla de la portada— y las tres tienen que decir lo mismo.
 */

/** La presentación de entrada: la más barata. `undefined` sólo si no hay ninguna. */
export function entryVariant(product: ShopProduct): ProductVariant | undefined {
  return product.variants.reduce<ProductVariant | undefined>(
    (cheapest, variant) => (!cheapest || variant.price < cheapest.price ? variant : cheapest),
    undefined,
  );
}

/** La presentación con esta etiqueta. `unit` es la clave de la variante. */
export function findVariant(product: ShopProduct, unit: string): ProductVariant | undefined {
  return product.variants.find((variant) => variant.unit === unit);
}

/**
 * Quita el paréntesis explicativo: «mediano (8-10 personas)» → «mediano».
 *
 * En el selector de la ficha hace falta entero, porque ahí la decisión es cuánta
 * gente come. En la línea de la tarjeta no cabe: las tres presentaciones de un
 * queque suman 62 caracteres con sus paréntesis y la línea es de una sola línea.
 */
function shortUnit(unit: string): string {
  return unit.replace(/\s*\([^)]*\)/g, "").trim();
}

/**
 * Factoriza el sustantivo repetido: «6 unidades, 12 unidades o 24 unidades» pasa
 * a «6, 12 o 24 unidades».
 *
 * Sólo actúa si TODAS las etiquetas tienen más de una palabra y terminan en la
 * misma. Con «mediano, grande o grande sin azúcar» las últimas palabras difieren
 * y no se toca nada, que es lo correcto: factorizar ahí produciría galimatías.
 */
function factorTail(labels: string[]): string[] {
  if (labels.length < 2) return labels;

  const words = labels.map((label) => label.split(" "));
  const tail = words[0]?.at(-1);

  if (!tail) return labels;
  if (words.some((parts) => parts.length < 2 || parts.at(-1) !== tail)) return labels;

  return words.map((parts, index) =>
    index === words.length - 1 ? parts.join(" ") : parts.slice(0, -1).join(" "),
  );
}

/** «a», «a o b», «a, b o c». La «o» final es la que se lee en voz alta. */
function joinWithO(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} o ${labels.at(-1)}`;
}

/**
 * Las presentaciones en una línea, para la tarjeta: «pequeño, mediano o grande»,
 * «6, 12 o 24 unidades», «120 o 250 g».
 */
export function variantsLabel(variants: readonly ProductVariant[]): string {
  const labels = [...new Set(variants.map((variant) => shortUnit(variant.unit)))].filter(Boolean);
  return joinWithO(factorTail(labels));
}
