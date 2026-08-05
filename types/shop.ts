import type { Colones, ImageRef } from "@/types/content";

/**
 * Formas del catálogo de la tienda.
 *
 * Separado de `types/content.ts` a propósito: ese archivo describe el contenido
 * de la PORTADA, cuyas cantidades están atadas al layout del spec (8 productos
 * en la rejilla, 6 testimonios en el slider). El catálogo no tiene esa
 * restricción — puede crecer a 20 productos sin romper nada.
 */

/** Categorías del primer dropdown del nav. Debe coincidir con content/nav. */
export const CATEGORIAS = {
  queques: "Queques",
  galletas: "Galletas y biscotti",
  bocaditos: "Bocaditos dulces",
  salado: "Salado",
  "sin-gluten-keto": "Sin gluten y keto",
} as const;

export type Categoria = keyof typeof CATEGORIAS;

/** Ocasiones del segundo dropdown. Un producto puede servir para varias. */
export const OCASIONES = {
  cumpleanos: "Cumpleaños",
  "bodas-bautizos": "Bodas y bautizos",
  "baby-shower": "Baby shower",
  oficinas: "Oficinas y cafeterías",
  regalos: "Regalos corporativos",
  navidad: "Navidad",
} as const;

export type Ocasion = keyof typeof OCASIONES;

export interface ShopProduct {
  slug: string;
  /** Capitalización normal; los títulos se ponen en mayúsculas por CSS. */
  name: string;
  price: Colones;
  /** true → se muestra «desde ₡ …» */
  priceFrom?: boolean;
  /**
   * true → no hay precio fijo: se cotiza. No se puede añadir al carrito con un
   * importe, así que el CTA lleva directo a WhatsApp.
   */
  priceOnRequest?: boolean;
  /** ⚠ El precio es un placeholder pendiente de confirmar con Ale. */
  priceTodo?: boolean;
  /** Unidad de venta: «molde de 8 porciones», «caja de 6». */
  unit: string;
  /** Una frase para la tarjeta del catálogo. */
  summary: string;
  /** Párrafos para la ficha. */
  description: string[];
  categoria: Categoria;
  ocasiones: Ocasion[];
  /** En lenguaje llano, no códigos de alérgeno. */
  allergens: string[];
  /** Horas de anticipación que necesita el pedido. */
  leadTimeHours: number;
  image: ImageRef;
  /** ⚠ La foto disponible es floja y conviene rehacerla. */
  photoTodo?: boolean;
}

/** Una línea del carrito. Guarda el precio para no depender del catálogo. */
export interface CartLine {
  slug: string;
  name: string;
  unit: string;
  /** Precio unitario en el momento de añadir. */
  price: Colones;
  qty: number;
  /** Ruta de la miniatura, para el drawer. */
  image?: string;
  priceOnRequest?: boolean;
  /**
   * Anticipación del producto en el momento de añadir, por el mismo motivo que
   * el precio: el carrito vive en el cliente y el catálogo ya no.
   *
   * Opcional porque un carrito guardado antes de que existiera este campo no lo
   * trae; en ese caso el drawer lo resuelve contra `content/products.ts`. Añadir
   * un campo opcional no obliga a subir `CART_STORAGE_KEY` — descartar el
   * carrito de alguien para ganar un número que se sabe deducir sería peor.
   */
  leadTimeHours?: number;
}

/** Datos opcionales que el cliente puede rellenar antes de pedir. */
export interface CheckoutFields {
  name?: string;
  /** ISO `YYYY-MM-DD`. */
  date?: string;
  zone?: string;
  notes?: string;
}
