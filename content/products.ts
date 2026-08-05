import { productImage } from "@/lib/productImage";
import type { ShopProduct } from "@/types/shop";

/**
 * El catálogo completo: 14 productos.
 *
 * Este archivo es el FALLBACK de la tabla `products` (ver `lib/db/catalog.ts`):
 * se usa tal cual cuando no hay `DATABASE_URL`, cuando la tabla está vacía o
 * cuando una fila no pasa `shopSchema`. No es contenido muerto — es el modo en
 * que corren CI y cualquier máquina recién clonada.
 *
 * ⚠ TODOS los precios son placeholders. El menú fijado de Instagram tiene los
 * reales, pero es una imagen y su texto no se puede extraer. Ver
 * docs/CONTENT_TODO.md §2. Los tests afirman que siguen marcados, para que
 * cerrar ese TODO sea un acto explícito y no un olvido.
 *
 * Las fotos y su procedencia están razonadas en docs/IMAGE_MAP.md. Las marcadas
 * `photoTodo` funcionan pero convendría rehacerlas.
 */

export const products: ShopProduct[] = [
  {
    slug: "queque-de-zanahoria",
    name: "Queque de zanahoria",
    price: 14000,
    priceTodo: true,
    unit: "molde de 8 porciones",
    summary: "El de siempre: zanahoria rallada a mano y frosting de queso crema.",
    description: [
      "Nuestro producto estrella y la razón por la que la mayoría nos escribe la primera vez. " +
        "Zanahoria rallada a mano, mantequilla de verdad y un frosting de queso crema que no " +
        "empalaga.",
      "Se decora con coco rallado y pecanas. Si lo querés para una celebración, podemos " +
        "escribir un mensaje encima sin costo extra.",
    ],
    categoria: "queques",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    allergens: ["gluten", "huevo", "lácteos", "nueces"],
    leadTimeHours: 48,
    image: productImage(
      "queque-de-zanahoria",
      [281, 562, 843],
      "Queque de zanahoria entero con frosting de queso crema y pecanas, sobre un pie de cristal",
    ),
  },
  {
    slug: "queque-personalizado",
    name: "Queque personalizado",
    price: 22000,
    priceFrom: true,
    priceOnRequest: true,
    priceTodo: true,
    unit: "por encargo, según tamaño y diseño",
    summary: "Vos mandás la foto o la idea y lo hacemos. Uno o dos pisos.",
    description: [
      "Para cumpleaños, bodas y bautizos. Mandanos una foto de referencia o contanos la idea y " +
        "te confirmamos si se puede hacer y cuánto sale.",
      "El precio depende del tamaño, el número de pisos y la decoración, así que este se " +
        "cotiza por WhatsApp. Los de dos pisos necesitan más tiempo: mejor avisar con una semana.",
    ],
    categoria: "queques",
    ocasiones: ["cumpleanos", "bodas-bautizos", "baby-shower"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 168,
    image: productImage(
      "queque-personalizado",
      [500, 1000, 1500],
      "Queque de zanahoria de dos pisos decorado con rosetones de queso crema, nueces y velas doradas",
    ),
  },
  {
    slug: "galletas-de-granola",
    name: "Galletas de granola",
    price: 5500,
    priceTodo: true,
    unit: "caja de 6",
    summary: "Sin gluten y bajas en azúcar, con granola casera y harina de almendra.",
    description: [
      "Crujientes por fuera y suaves por dentro. Llevan granola hecha en casa y harina de " +
        "almendra en lugar de trigo, así que no tienen gluten.",
      "Son las que más se piden para desayuno o para llevar a la oficina. Aguantan bien " +
        "varios días en un recipiente cerrado.",
    ],
    categoria: "sin-gluten-keto",
    ocasiones: ["oficinas", "regalos"],
    allergens: ["almendra", "huevo", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "galletas-de-granola",
      [500, 1000, 1500],
      "Galletas de granola en un plato blanco con fresas laminadas y una taza de café",
    ),
  },
  {
    slug: "galletas-con-nutella",
    name: "Galletas con Nutella",
    price: 6000,
    priceTodo: true,
    unit: "caja de 6",
    summary: "Galleta de chocolate chip con un centro de Nutella que se desborda.",
    description: [
      "Masa de chocolate chip horneada en molde, con un pozo de Nutella al centro. Se sirven " +
        "tibias si se puede.",
      "Las favoritas de los niños, y de bastantes adultos.",
    ],
    categoria: "galletas",
    ocasiones: ["cumpleanos", "oficinas"],
    allergens: ["gluten", "huevo", "lácteos", "avellana"],
    leadTimeHours: 48,
    image: productImage(
      "galletas-con-nutella",
      [500, 1000, 1500],
      "Seis galletas de chocolate chip rellenas de Nutella sobre un plato blanco, con un jardín al fondo",
    ),
  },
  {
    slug: "polvorones-de-almendra",
    name: "Polvorones de almendra",
    price: 5000,
    priceTodo: true,
    unit: "caja de 8",
    summary: "Receta española, 75% almendra. Se deshacen en la boca.",
    description: [
      "Auténtico sabor español, hechos a mano y espolvoreados con azúcar glas. La proporción " +
        "alta de almendra es lo que les da esa textura que se desarma al morderlos.",
      "En diciembre son lo que más sale, pero se hacen todo el año.",
    ],
    categoria: "bocaditos",
    ocasiones: ["navidad", "regalos", "bodas-bautizos"],
    allergens: ["almendra", "gluten", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "polvorones-de-almendra",
      [500, 1000, 1500],
      "Bandeja de horno con polvorones de almendra cubiertos de azúcar glas",
    ),
  },
  {
    slug: "brigadeiros",
    name: "Brigadeiros",
    price: 6500,
    priceTodo: true,
    unit: "docena",
    summary: "El clásico brasileño: chocolate fino y leche condensada, con granillo.",
    description: [
      "Se hacen a fuego lento con chocolate de verdad y leche condensada, se enfrían y se " +
        "ruedan a mano uno por uno.",
      "Van en cápsulas de papel, listos para poner en una mesa de dulces o para regalar.",
    ],
    categoria: "bocaditos",
    ocasiones: ["cumpleanos", "baby-shower", "bodas-bautizos", "regalos"],
    allergens: ["lácteos", "chocolate"],
    leadTimeHours: 48,
    image: productImage(
      "brigadeiros",
      [358, 716, 1073],
      "Brigadeiros de chocolate cubiertos de granillo, en cápsulas de papel dentro de una caja de regalo",
    ),
  },
  {
    slug: "biscotti-de-almendra",
    name: "Biscotti de almendra",
    price: 5800,
    priceTodo: true,
    unit: "bolsa de 10",
    summary: "Doble horneado, con almendra entera. Para mojar en café.",
    description: [
      "Se hornean dos veces, como manda la receta, así que quedan firmes y aguantan el café " +
        "sin deshacerse. Llevan almendra entera.",
      "También los hacemos con un dip de chocolate para acompañar.",
    ],
    categoria: "galletas",
    ocasiones: ["oficinas", "regalos"],
    allergens: ["gluten", "almendra", "huevo"],
    leadTimeHours: 48,
    image: productImage(
      "biscotti-de-almendra",
      [400, 800, 1200],
      "Biscotti de almendra dispuestos alrededor de un cuenco de chocolate para mojar",
    ),
  },
  {
    slug: "biscotti-keto",
    name: "Biscotti keto",
    price: 6500,
    priceTodo: true,
    unit: "bolsa de 10",
    summary: "Harina de almendra y endulzante keto. Sin azúcar ni harina de trigo.",
    description: [
      "La versión sin azúcar de nuestros biscotti: harina de almendra y endulzante apto para " +
        "dieta keto. Mismo doble horneado, misma textura.",
      "Los pide bastante gente que lleva control de carbohidratos y no quiere renunciar al " +
        "café con algo.",
    ],
    categoria: "sin-gluten-keto",
    ocasiones: ["regalos", "oficinas"],
    allergens: ["almendra", "huevo"],
    leadTimeHours: 48,
    image: productImage(
      "biscotti-keto",
      [500, 1000, 1500],
      "Biscotti de almendra sin azúcar en un plato blanco, junto a una bolsa de regalo",
    ),
  },
  {
    slug: "key-lime-pie",
    name: "Key lime pie",
    price: 16000,
    priceTodo: true,
    unit: "molde de 8 porciones",
    summary: "Base de galleta, crema de limón ácida y merengue tostado.",
    description: [
      "Ácido de verdad, no dulzón. Base de galleta con mantequilla, relleno de limón y " +
        "merengue tostado con soplete por encima.",
      "Se sirve frío. Mejor pedirlo para el mismo día que se va a comer.",
    ],
    categoria: "queques",
    ocasiones: ["cumpleanos", "bodas-bautizos"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    // ⚠ La única foto disponible tiene luz plana y el relleno se ve desvaído.
    photoTodo: true,
    image: productImage(
      "key-lime-pie",
      [500, 1000, 1500],
      "Key lime pie en un molde de cristal, con corona de merengue tostado",
    ),
  },
  {
    slug: "barras-de-datil",
    name: "Barras de dátil",
    price: 5500,
    priceTodo: true,
    unit: "bandeja de 9 porciones",
    summary: "Dátil, avena y almendra. Sin azúcar añadida.",
    description: [
      "El dulzor sale sólo del dátil: no llevan azúcar añadida. Con avena y almendra, quedan " +
        "densas y saciantes.",
      "Buenas para llevar en la bolsa o para media mañana.",
    ],
    categoria: "sin-gluten-keto",
    ocasiones: ["oficinas", "regalos"],
    allergens: ["almendra", "avena"],
    leadTimeHours: 48,
    // ⚠ La foto es de una bandeja con tapa de plástico y reflejos; el producto
    // apenas se distingue.
    photoTodo: true,
    image: productImage(
      "barras-de-datil",
      [500, 1000, 1500],
      "Bandeja de barras de dátil espolvoreadas con azúcar glas",
    ),
  },
  {
    slug: "mini-queques-de-manzana",
    name: "Mini queques de manzana",
    price: 7500,
    priceTodo: true,
    unit: "caja de 4",
    summary: "Manzana, canela y azúcar glas. Del tamaño justo para regalar.",
    description: [
      "Esponjosos y húmedos, con trozos de manzana y canela. Se espolvorean con azúcar glas " +
        "al salir del horno.",
      "Van en caja individual, así que funcionan bien como detalle.",
    ],
    categoria: "queques",
    ocasiones: ["regalos", "oficinas", "cumpleanos"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "mini-queques-de-manzana",
      [500, 1000, 1500],
      "Queque de manzana espolvoreado con azúcar glas sobre un plato blanco, en la terraza",
    ),
  },
  {
    slug: "coffee-cake-vegano",
    name: "Coffee cake vegano",
    price: 15000,
    priceTodo: true,
    unit: "molde de 8 porciones",
    summary: "Sin nada de origen animal. Costra de canela y nueces.",
    description: [
      "Dos capas con una costra de canela y azúcar en medio y por encima, con nueces y chispas " +
        "de chocolate. Sin huevo, sin leche y sin mantequilla.",
      "Se llama coffee cake porque acompaña al café, no porque lleve café.",
    ],
    categoria: "queques",
    ocasiones: ["oficinas", "cumpleanos"],
    allergens: ["gluten", "nueces"],
    leadTimeHours: 48,
    image: productImage(
      "coffee-cake-vegano",
      [500, 1000, 1500],
      "Coffee cake de dos capas con costra de canela, nueces y chispas de chocolate",
    ),
  },
  {
    slug: "cachitos-de-jamon",
    name: "Cachitos de jamón",
    price: 7500,
    priceTodo: true,
    unit: "media docena",
    summary: "Lo salado de la casa: masa hojaldrada y jamón, con brillo de huevo.",
    description: [
      "Masa trabajada en casa, rellena de jamón y pintada con huevo antes de hornear. Salen " +
        "dorados y brillantes.",
      "Se piden mucho para reuniones de oficina y desayunos. Se pueden recalentar en horno " +
        "unos minutos.",
    ],
    categoria: "salado",
    ocasiones: ["oficinas", "cumpleanos"],
    allergens: ["gluten", "huevo", "lácteos", "cerdo"],
    leadTimeHours: 48,
    // ⚠ La única foto lleva un rótulo incrustado y hay que recortarla; queda una
    // franja estrecha. Es el único salado además del asado negro: vale la pena
    // una foto nueva.
    photoTodo: true,
    image: productImage(
      "cachitos-de-jamon",
      [226, 452],
      "Cachitos de jamón recién horneados, dorados y brillantes, sobre papel de horno",
    ),
  },
  {
    slug: "asado-negro",
    name: "Asado negro",
    price: 16000,
    priceTodo: true,
    unit: "por kilo",
    summary: "Dulce y salado a la vez. Sólo por encargo.",
    description: [
      "Carne cocinada lentamente hasta que el azúcar se carameliza y toma ese color oscuro. " +
        "Es el plato que le da la mitad del nombre a Boquita.",
      "Se vende por kilo y va en su salsa. Necesita avisar con antelación porque la cocción " +
        "es larga.",
    ],
    categoria: "salado",
    ocasiones: ["cumpleanos", "bodas-bautizos"],
    allergens: [],
    leadTimeHours: 72,
    // ⚠ La foto está tomada a sol duro y la corteza se ve casi quemada.
    photoTodo: true,
    image: productImage(
      "asado-negro",
      [500, 1000, 1500],
      "Asado negro fileteado sobre una tabla de cortar",
    ),
  },
];

/** Búsqueda por slug, para `/tienda/[slug]`. */
export function findProduct(slug: string): ShopProduct | undefined {
  return products.find((product) => product.slug === slug);
}

export default products;
