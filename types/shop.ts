import type { Colones, ImageRef } from "@/types/content";

/**
 * Formas del catálogo de la tienda.
 *
 * Separado de `types/content.ts` a propósito: ese archivo describe el contenido
 * de la PORTADA, cuyas cantidades están atadas al layout del spec (8 productos
 * en la rejilla, 6 testimonios en el slider). El catálogo no tiene esa
 * restricción — puede crecer a 20 productos sin romper nada.
 */

/**
 * Categorías del primer dropdown del nav. Debe coincidir con content/nav.
 *
 * Son las tres de la columna `category` del catálogo de Ale
 * (`data/boquita_products_catalog.xlsx`), en singular y minúscula allí. Las
 * cinco anteriores —`bocaditos`, `salado`, `sin-gluten-keto`— eran del catálogo
 * de andamio y no existen en el real: no hay nada salado ni una línea keto.
 */
export const CATEGORIAS = {
  queques: "Queques",
  galletas: "Galletas",
  dulces: "Dulces",
} as const;

export type Categoria = keyof typeof CATEGORIAS;

/**
 * Segundo nivel, de la columna `subcategory`. Sólo lo tienen 6 de los 23
 * productos, así que es opcional en la ficha y se omite de la línea de la
 * tarjeta cuando falta.
 */
export const SUBCATEGORIAS = {
  cupcake: "Cupcakes",
  personalizado: "Personalizado",
} as const;

export type Subcategoria = keyof typeof SUBCATEGORIAS;

/**
 * Cómo llama la gente a cada categoría cuando escribe en el buscador, que no es
 * como la llama el catálogo. Quien busca «torta» quiere un queque, y sin esto se
 * llevaba cero resultados sobre trece productos.
 *
 * Es SÓLO búsqueda: no crea chips en `/tienda`, ni entradas de nav, ni toca el
 * `pgEnum` de `lib/db/schema.ts`. Añadir sinónimos no pide migración de Drizzle.
 *
 * `cake` queda fuera a propósito: «Coffee cake» es un queque y «Cheesecake» un
 * dulce, así que la palabra no decide categoría. Como texto libre ya los
 * encuentra a los dos por nombre.
 *
 * El `Record<Categoria, …>` es deliberado: una categoría nueva no compila hasta
 * decidir sus sinónimos, aunque la decisión sea `[]`.
 */
export const SINONIMOS_CATEGORIA: Record<Categoria, string[]> = {
  queques: [
    // Se conservan explícitos para reconocer tanto el singular como el plural.
    "queque",
    "queques",
    "torta",
    "tortas",
    "bizcocho",
    "bizcochos",
    "keke",
    "kekes",
  ],
  galletas: ["galleta", "cookie", "cookies"],
  dulces: ["dulce", "postre", "postres", "reposteria"],
};

/** Lo mismo para el segundo nivel. Ver `SINONIMOS_CATEGORIA`. */
export const SINONIMOS_SUBCATEGORIA: Record<Subcategoria, string[]> = {
  cupcake: ["cupcake", "magdalena", "magdalenas", "quequitos"],
  personalizado: ["personalizados", "a medida", "por encargo"],
};

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

/**
 * Una presentación comprable. Es lo que ofrece el selector de la ficha, y es una
 * fila del Excel de Ale: el catálogo trae 60 filas para 23 productos.
 *
 * `unit` es a la vez la etiqueta visible y la CLAVE de la variante — el carrito
 * identifica una línea por `(slug, unit)`, así que dos presentaciones del mismo
 * producto no pueden compartir etiqueta. Lo afirma `shopProductSchema`.
 *
 * Los cupcakes son el caso que obliga a mirar esto: sus tres filas traen el mismo
 * `sale_unit` («molde cupcake») y sólo se distinguen por `package_quantity`, así
 * que aquí se etiquetan «6 unidades», «12 unidades» y «24 unidades».
 */
export interface ProductVariant {
  /** Etiqueta visible y clave: «mediano (8-10 personas)», «12 unidades», «250 g». */
  unit: string;
  price: Colones;
}

export interface ShopProduct {
  slug: string;
  /** Capitalización normal; los títulos se ponen en mayúsculas por CSS. */
  name: string;
  /**
   * Precio de ENTRADA: el de la variante más baja.
   *
   * Es un espejo de `variants`, no un dato independiente — `shopProductSchema`
   * comprueba que coincida con el mínimo. Existe porque la tarjeta del catálogo,
   * el JSON-LD, el Open Graph y la búsqueda necesitan UN número, y recalcular el
   * mínimo en cada uno de esos sitios es la clase de duplicación que ya derivó
   * una vez en este proyecto (ver `FEATURED_SLUGS` en `content/home.ts`).
   */
  price: Colones;
  /** true → se muestra «desde ₡ …». Obligatorio si hay más de una variante. */
  priceFrom?: boolean;
  /**
   * true → no hay precio fijo: se cotiza. No se puede añadir al carrito con un
   * importe, así que el CTA lleva directo a WhatsApp.
   */
  priceOnRequest?: boolean;
  /** ⚠ El precio es un placeholder pendiente de confirmar con Ale. */
  priceTodo?: boolean;
  /** Las presentaciones disponibles, de la más barata a la más cara. */
  variants: ProductVariant[];
  /**
   * Párrafos para la ficha. El primero es también la descripción de la tarjeta
   * del catálogo y la del Open Graph: el Excel trae una descripción por producto
   * y tener un `summary` aparte con el mismo texto sería duplicarla.
   */
  description: string[];
  categoria: Categoria;
  subcategoria?: Subcategoria;
  ocasiones: Ocasion[];
  /** De la columna `ingredients`, en minúscula y en lenguaje llano. */
  ingredients: string[];
  /** En lenguaje llano, no códigos de alérgeno. */
  allergens: string[];
  /** Horas de anticipación que necesita el pedido. */
  leadTimeHours: number;
  image: ImageRef;
  /** Segunda foto, sólo donde ver dos ejemplos vende: el queque personalizado. */
  imageB?: ImageRef;
  /** ⚠ La foto disponible es floja y conviene rehacerla. */
  photoTodo?: boolean;
}

/**
 * Una línea del carrito. Guarda el precio para no depender del catálogo.
 *
 * La identifica el par **`(slug, unit)`**, no el slug: desde que un producto
 * tiene presentaciones, un queque mediano y el mismo queque grande son dos
 * líneas con dos precios. Con la identidad en el slug se habrían sumado en una y
 * el pedido habría salido mal.
 */
export interface CartLine {
  slug: string;
  name: string;
  /** La presentación elegida. Segunda mitad de la clave de la línea. */
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
