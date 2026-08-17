import { productImage } from "@/lib/productImage";
import type { ShopProduct } from "@/types/shop";

/**
 * El catálogo completo: 26 productos y 63 presentaciones.
 *
 * **Es el catálogo real de Ale**, cargado desde `data/boquita_products_catalog.xlsx`.
 * Ese Excel es la referencia de fondo: nombres, precios, descripciones,
 * ingredientes, alérgenos, ocasiones y tamaños salen de ahí. Lo que se cambió al
 * traerlo, y nada más:
 *
 *  · **Tildes y erratas.** El Excel viene sin acentos y con algún desliz
 *    («limon», «lacteos», «Coffe Cake», «chocolatre», «Polvorones Espanoles»).
 *  · **Nombres en orden natural.** «Zanahoria Queque Cupcake» → «Cupcakes de
 *    zanahoria».
 *  · **Etiquetas de presentación.** Los cupcakes traen las tres filas con el mismo
 *    `sale_unit` («molde cupcake») y sólo se distinguen por `package_quantity`, así
 *    que aquí son «6 unidades», «12 unidades» y «24 unidades». `DUL-020` decía
 *    «grande 15 (personas)».
 *  · **El mousse sin azúcar.** El Excel le da a `DUL-019` una tercera fila con
 *    otro nombre («Mousse de Chocolate S/Azucar»); es la misma ficha con una
 *    presentación más, no un producto aparte.
 *  · **Las dos tortillas son dos productos.** `SAL-25` y `SAL-26` comparten la
 *    etiqueta «grande (12 personas)», así que como presentaciones de una misma
 *    ficha chocarían con el `.refine()` de etiquetas únicas — y son recetas
 *    distintas, no dos tamaños de una.
 *
 * ⚠ **Un queque y su versión cupcake NO comparten descripción.** Lo parecían:
 * `queque-de-vainilla` llevaba el texto de `cupcakes-de-vainilla` y
 * `cupcakes-de-banano` el de `banana-bread`, así que cada ficha describía la
 * cobertura de su hermana y contradecía a su propia foto. El Excel distingue las
 * cuatro (QUE-09/010/011/012) y ésa es la referencia.
 *
 * Este archivo es el FALLBACK de las tablas `products` y `product_variants` (ver
 * `lib/db/catalog.ts`): se usa tal cual cuando no hay `DATABASE_URL`, cuando la
 * tabla está vacía o cuando una fila no pasa `shopSchema`. No es contenido muerto
 * — es el modo en que corren CI y cualquier máquina recién clonada.
 *
 * **Los precios ya no son placeholders**: son los de Ale, así que no queda ningún
 * `priceTodo`. `price` es siempre el de la presentación más barata y hay un
 * `.refine()` en `content/shopSchema.ts` que lo comprueba producto a producto.
 *
 * Las fotos van nombradas por SKU en `assets/products/` y su asignación está en
 * `docs/IMAGE_MAP.md`. Las dos marcadas `photoTodo` son miniaturas de ~400px:
 * funcionan, pero sólo emiten un escalón de la escalera.
 */

export const products: ShopProduct[] = [
  {
    slug: "queque-de-zanahoria",
    name: "Queque de zanahoria",
    price: 2500,
    priceFrom: true,
    variants: [
      { unit: "pequeño (2 personas)", price: 2500 },
      { unit: "mediano (8-10 personas)", price: 12000 },
      { unit: "grande (20 personas)", price: 24000 },
    ],
    description: [
      "Queque esponjoso de zanahoria, coco y nueces, relleno y cubierto por un rico frosting de " +
        "queso crema.",
    ],
    categoria: "queques",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: [
      "harina de trigo",
      "zanahoria",
      "coco",
      "nueces",
      "huevos",
      "queso crema",
      "mantequilla",
      "canela",
    ],
    allergens: ["gluten", "huevo", "nueces", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "queque-de-zanahoria",
      [300, 600, 900],
      "Queque de zanahoria entero con frosting de queso crema rizado, coco rallado y una flor de pecanas en el centro",
    ),
  },
  {
    slug: "cupcakes-de-zanahoria",
    name: "Cupcakes de zanahoria",
    price: 8400,
    priceFrom: true,
    variants: [
      { unit: "6 unidades", price: 8400 },
      { unit: "12 unidades", price: 15500 },
      { unit: "24 unidades", price: 27600 },
    ],
    description: [
      "Queque esponjoso de zanahoria, coco y nueces, relleno y cubierto por un rico frosting de " +
        "queso crema.",
    ],
    categoria: "queques",
    subcategoria: "cupcake",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: [
      "harina de trigo",
      "zanahoria",
      "coco",
      "nueces",
      "huevos",
      "queso crema",
      "mantequilla",
      "canela",
    ],
    allergens: ["gluten", "huevo", "nueces", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "cupcakes-de-zanahoria",
      [533, 1067, 1600],
      "Cupcakes de zanahoria en capsulillas de colores, cada uno con frosting de queso crema, coco rallado y una pecana",
    ),
  },
  {
    slug: "cupcakes-de-limon",
    name: "Cupcakes de limón",
    price: 4500,
    priceFrom: true,
    variants: [
      { unit: "6 unidades", price: 4500 },
      { unit: "12 unidades", price: 8000 },
      { unit: "24 unidades", price: 14000 },
    ],
    description: [
      "Queque de limón, refrescante y rico en sabor, contiene jugo y ralladura de limón natural.",
    ],
    categoria: "queques",
    subcategoria: "cupcake",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: ["harina de trigo", "limón", "mantequilla", "leche", "huevo"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    // ⚠ La fuente mide 403×268: sólo da el escalón de 400 y en la ficha se ve
    // blanda. Hace falta el original. Ver docs/CONTENT_TODO.md.
    photoTodo: true,
    image: productImage(
      "cupcakes-de-limon",
      [266],
      "Cuatro cupcakes de limón con glaseado blanco por encima, sobre un plato de madera",
    ),
  },
  {
    slug: "queque-de-limon",
    name: "Queque de limón",
    price: 2250,
    priceFrom: true,
    variants: [
      { unit: "pequeño (2 personas)", price: 2250 },
      { unit: "mediano (8-10 personas)", price: 8000 },
      { unit: "grande (20 personas)", price: 12500 },
    ],
    description: [
      "Queque de limón, refrescante y rico en sabor, contiene jugo y ralladura de limón natural.",
    ],
    categoria: "queques",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: ["harina de trigo", "limón", "mantequilla", "leche", "huevo"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "queque-de-limon",
      [371, 741],
      "Queque de limón en molde de corona, bañado en glaseado blanco que escurre, con ralladura verde por encima",
    ),
  },
  {
    slug: "cupcakes-devils-food",
    name: "Cupcakes Devil's Food",
    price: 8400,
    priceFrom: true,
    variants: [
      { unit: "6 unidades", price: 8400 },
      { unit: "12 unidades", price: 15500 },
      { unit: "24 unidades", price: 27600 },
    ],
    description: [
      "Explosión de chocolate: bizcocho de chocolate oscuro, relleno y cubierto por brigadeiro, " +
        "delicado, perfecto para los amantes del chocolate.",
    ],
    categoria: "queques",
    subcategoria: "cupcake",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: ["harina de trigo", "chocolate", "mantequilla", "crema de leche", "huevo"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "cupcakes-devils-food",
      [410, 819],
      "Cupcake de chocolate oscuro en capsulilla fucsia, con una espiral de brigadeiro y una chispa de chocolate encima",
    ),
  },
  {
    slug: "queque-devils-food",
    name: "Queque Devil's Food",
    price: 2500,
    priceFrom: true,
    variants: [
      { unit: "pequeño (2 personas)", price: 2500 },
      { unit: "mediano (8-10 personas)", price: 12000 },
      { unit: "grande (20 personas)", price: 24000 },
    ],
    description: [
      "Explosión de chocolate: bizcocho de chocolate oscuro, relleno y cubierto por brigadeiro, " +
        "delicado, perfecto para los amantes del chocolate.",
    ],
    categoria: "queques",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: ["harina de trigo", "chocolate", "mantequilla", "crema de leche", "huevo"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "queque-devils-food",
      [384, 769],
      "Queque de chocolate entero cubierto de brigadeiro en anillos, con siete trufas de granillo alrededor del borde",
    ),
  },
  {
    slug: "coffee-cake",
    name: "Coffee cake",
    price: 2250,
    priceFrom: true,
    variants: [
      { unit: "pequeño (2 personas)", price: 2250 },
      { unit: "mediano (8-10 personas)", price: 8000 },
      { unit: "grande (20 personas)", price: 16500 },
    ],
    description: [
      "Balance, confort, para tomar café: bizcocho de vainilla con nueces, dulce de leche, canela " +
        "y chocolate.",
    ],
    categoria: "queques",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: [
      "harina de trigo",
      "chocolate",
      "mantequilla",
      "crema de leche",
      "huevo",
      "nueces",
    ],
    allergens: ["gluten", "huevo", "lácteos", "nueces"],
    leadTimeHours: 48,
    image: productImage(
      "coffee-cake",
      [225, 450, 675],
      "Coffee cake redondo con cobertura de canela, nueces picadas y un hilo de chocolate en zigzag",
    ),
  },
  {
    slug: "queque-chocolate-chip-cookie",
    name: "Queque chocolate chip cookie",
    price: 2400,
    priceFrom: true,
    variants: [
      { unit: "pequeño (2 personas)", price: 2400 },
      { unit: "mediano (8-10 personas)", price: 9000 },
      { unit: "grande (20 personas)", price: 14000 },
    ],
    description: [
      "Un queque de galleta crocante afuera y esponjosa, suave, con chispas de chocolate por " +
        "adentro. Para los amantes de las galletas.",
    ],
    categoria: "queques",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: ["harina de trigo", "chocolate", "mantequilla", "crema de leche", "huevo"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "queque-chocolate-chip-cookie",
      [400, 800, 1200],
      "Queque de galleta con chispas de chocolate, partido en porciones y con rosetones de crema de chocolate en el borde",
    ),
  },
  {
    slug: "cupcakes-de-vainilla",
    name: "Cupcakes de vainilla",
    price: 7000,
    priceFrom: true,
    variants: [
      { unit: "6 unidades", price: 7000 },
      { unit: "12 unidades", price: 12000 },
      { unit: "24 unidades", price: 22000 },
    ],
    description: [
      "Queque de vainilla, suave, terso, esponjoso, mi mejor versión de un pound cake, cubierto " +
        "con butter cream de vainilla.",
    ],
    categoria: "queques",
    subcategoria: "cupcake",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: [
      "harina de trigo",
      "huevos",
      "crema de leche",
      "mantequilla",
      "dulce de leche",
    ],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "cupcakes-de-vainilla",
      [266, 533, 799],
      "Cupcakes de vainilla con una espiral de butter cream cada uno, sobre una superficie de mármol blanco",
    ),
  },
  {
    slug: "queque-de-vainilla",
    name: "Queque de vainilla",
    price: 2150,
    priceFrom: true,
    variants: [
      { unit: "pequeño (2 personas)", price: 2150 },
      { unit: "mediano (8-10 personas)", price: 11500 },
      { unit: "grande (20 personas)", price: 20700 },
    ],
    description: [
      "Queque de vainilla, suave, terso, esponjoso, mi mejor versión de un pound cake, cubierto " +
        "con azúcar pulverizada o decorado con dulce de leche.",
    ],
    categoria: "queques",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: [
      "harina de trigo",
      "huevos",
      "crema de leche",
      "mantequilla",
      "dulce de leche",
    ],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    // ⚠ La fuente mide 407×320: sólo da el escalón de 400. Hace falta el original.
    photoTodo: true,
    image: productImage(
      "queque-de-vainilla",
      [314],
      "Queque de vainilla en molde de corona con azúcar nevada, con varias rodajas cortadas y un bol de frutos rojos al lado",
    ),
  },
  {
    slug: "cupcakes-de-banano",
    name: "Cupcakes de banano",
    price: 4500,
    priceFrom: true,
    variants: [
      { unit: "6 unidades", price: 4500 },
      { unit: "12 unidades", price: 8000 },
      { unit: "24 unidades", price: 14000 },
    ],
    description: [
      "Clásico pan de banano, suave, esponjoso, hecho con bananas naturales y cubierto con " +
        "buttercream de vainilla.",
    ],
    categoria: "queques",
    subcategoria: "cupcake",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: ["harina de trigo", "banano", "mantequilla", "leche", "huevo"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "cupcakes-de-banano",
      [573, 1146, 1719],
      "Cupcakes de banano con espiral de butter cream, migas de galleta y una rodaja de banano encima de cada uno",
    ),
  },
  {
    slug: "banana-bread",
    name: "Banana bread",
    price: 1950,
    priceFrom: true,
    variants: [
      { unit: "pequeño (2 personas)", price: 1950 },
      { unit: "mediano (8-10 personas)", price: 6000 },
      { unit: "grande (20 personas)", price: 12000 },
    ],
    description: [
      "Clásico pan de banano, suave, esponjoso, hecho con bananas naturales y cubierto por azúcar " +
        "nevada.",
    ],
    categoria: "queques",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: ["harina de trigo", "banano", "mantequilla", "leche", "huevo"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "banana-bread",
      [351, 703],
      "Banana bread en molde de corona, espolvoreado con azúcar nevada, servido en un plato blanco",
    ),
  },
  {
    slug: "queque-personalizado",
    name: "Queque personalizado",
    /**
     * `price` es el `price_min` del Excel, no el mínimo de sus presentaciones: se
     * cotiza, así que su única presentación no lleva importe. El `.refine()` de
     * coherencia excluye por eso a los `priceOnRequest`.
     */
    price: 22000,
    priceFrom: true,
    priceOnRequest: true,
    variants: [{ unit: "por encargo, según tamaño y diseño", price: 22000 }],
    description: [
      "Queque por encargo. El precio depende del tamaño, los pisos y la decoración.",
      "Los de dos pisos necesitan una semana de anticipación. Mandanos una foto de referencia o " +
        "contanos la idea y te confirmamos si se puede y cuánto sale.",
    ],
    categoria: "queques",
    subcategoria: "personalizado",
    ocasiones: ["cumpleanos", "bodas-bautizos", "baby-shower"],
    ingredients: ["según diseño"],
    allergens: ["según diseño"],
    leadTimeHours: 168,
    image: productImage(
      "queque-personalizado",
      [533, 1067, 1600],
      "Queque de zanahoria de dos pisos con frosting de queso crema, nueces, coco, zanahorias de azúcar y velas doradas de cumpleaños",
    ),
    imageB: productImage(
      "queque-personalizado-b",
      [604, 1209],
      "Queque de chocolate sobre un pedestal dorado, decorado para una graduación bajo un rótulo de neón",
    ),
  },
  {
    slug: "polvorones-espanoles",
    name: "Polvorones españoles",
    price: 3000,
    priceFrom: true,
    variants: [
      { unit: "6 unidades", price: 3000 },
      { unit: "12 unidades", price: 5000 },
    ],
    description: ["Deliciosas galletas de almendras molidas."],
    categoria: "galletas",
    ocasiones: ["oficinas", "regalos", "navidad"],
    ingredients: ["harina de trigo", "manteca", "almendras", "harina de almendra", "huevo"],
    allergens: ["gluten", "huevo"],
    leadTimeHours: 48,
    image: productImage(
      "polvorones-espanoles",
      [368, 737],
      "Polvorones redondos espolvoreados con azúcar glas, recién salidos en la bandeja del horno",
    ),
  },
  {
    slug: "galletas-de-granola",
    name: "Galletas de granola",
    price: 3000,
    priceFrom: true,
    variants: [
      { unit: "6 unidades", price: 3000 },
      { unit: "12 unidades", price: 5000 },
    ],
    description: [
      "Galletas energéticas, calificadas como súper alimentos, con ingredientes sanos y naturales.",
    ],
    categoria: "galletas",
    ocasiones: ["oficinas", "regalos"],
    ingredients: [
      "harina de trigo",
      "avena",
      "coco",
      "mantequilla",
      "mantequilla de maní",
      "granola",
      "chocolate",
      "huevos",
      "almendras",
    ],
    allergens: ["gluten", "huevo", "nueces", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "galletas-de-granola",
      [364, 729],
      "Galletas de granola con forma de corazón, con avena y almendras a la vista, servidas en un plato blanco",
    ),
  },
  {
    slug: "galletas-de-miel-y-limon",
    name: "Galletas de miel y limón",
    price: 2500,
    priceFrom: true,
    variants: [
      { unit: "120 g", price: 2500 },
      { unit: "250 g", price: 4500 },
    ],
    description: ["Galletas crujientes, llenas de sabor, perfectas para el café."],
    categoria: "galletas",
    ocasiones: ["oficinas", "regalos"],
    ingredients: ["harina de trigo", "miel", "limón", "huevos", "mantequilla", "canela", "manteca"],
    allergens: ["gluten", "huevo", "lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "galletas-de-miel-y-limon",
      [445, 889],
      "Montón de galletas redondas y crujientes de miel y limón, en una bandeja blanca sobre una mesa de madera",
    ),
  },
  {
    slug: "barra-de-datiles",
    name: "Barra de dátiles",
    price: 12000,
    priceFrom: true,
    variants: [
      { unit: "mediana", price: 12000 },
      { unit: "grande", price: 22000 },
    ],
    description: ["Barra crocante y suave a la vez, elaborada con dátiles."],
    categoria: "dulces",
    ocasiones: ["oficinas", "regalos"],
    ingredients: ["harina de trigo", "mantequilla", "huevo", "dátiles", "nueces"],
    allergens: ["gluten", "huevo", "lácteos", "nueces"],
    leadTimeHours: 48,
    image: productImage(
      "barra-de-datiles",
      [524, 1048],
      "Barra de dátiles entera en su bandeja de aluminio, espolvoreada con azúcar glas y con la etiqueta de Boquita",
    ),
  },
  {
    slug: "brigadeiros",
    name: "Brigadeiros",
    price: 3000,
    priceFrom: true,
    variants: [
      { unit: "6 unidades", price: 3000 },
      { unit: "12 unidades", price: 5000 },
      { unit: "24 unidades", price: 9000 },
    ],
    description: [
      "Ricas trufas de chocolate cubiertas por hormiguitas de chocolate. Un bocado de amor y " +
        "felicidad.",
    ],
    categoria: "dulces",
    ocasiones: ["oficinas", "regalos"],
    ingredients: ["leche", "chocolate", "crema de leche", "mantequilla"],
    allergens: ["lácteos"],
    leadTimeHours: 48,
    image: productImage(
      "brigadeiros",
      [533, 1067, 1600],
      "Doce brigadeiros de chocolate en capsulillas blancas, ordenados en una bandeja rectangular",
    ),
  },
  {
    slug: "mousse-de-chocolate",
    name: "Mousse de chocolate",
    price: 6500,
    priceFrom: true,
    /**
     * La tercera es la que el Excel apunta como «Mousse de Chocolate S/Azucar»:
     * mismo tamaño que la grande normal, endulzada con monk fruit y 2.000 colones
     * más. Es una presentación, no otro producto.
     */
    variants: [
      { unit: "mediano (8 personas)", price: 6500 },
      { unit: "grande (18 personas)", price: 12000 },
      { unit: "grande sin azúcar (18 personas)", price: 14000 },
    ],
    description: [
      "Espumoso pero chocolatoso, elaborado con chocolate oscuro, perfecto para personas " +
        "intolerantes al gluten y lácteos.",
      "La versión sin azúcar se endulza con monk fruit, así que también sirve para personas " +
        "diabéticas.",
    ],
    categoria: "dulces",
    ocasiones: ["oficinas", "regalos"],
    ingredients: ["chocolate", "huevo", "monk fruit (sin azúcar)"],
    allergens: ["huevo"],
    leadTimeHours: 48,
    image: productImage(
      "mousse-de-chocolate",
      [267, 533, 800],
      "Tres mousses de chocolate en vasitos individuales con cucharilla, decorados con perlas de chocolate blanco y negro",
    ),
  },
  {
    slug: "pie-de-brigadeiro",
    name: "Pie de brigadeiro",
    price: 17350,
    variants: [{ unit: "grande (15 personas)", price: 17350 }],
    description: [
      "Pie con crust de galleta de mantequilla, relleno de un delicioso brigadeiro de chocolate y " +
        "decorado con flecos de sal marina.",
    ],
    categoria: "dulces",
    ocasiones: ["oficinas", "regalos"],
    ingredients: ["chocolate", "leche", "crema de leche", "mantequilla", "galleta molida"],
    allergens: ["lácteos", "gluten"],
    leadTimeHours: 48,
    image: productImage(
      "pie-de-brigadeiro",
      [300, 600, 900],
      "Pie de brigadeiro entero sobre una blonda blanca, con la cobertura de chocolate en espiral y fresas y arándanos en el centro",
    ),
  },
  {
    slug: "key-lime-pie",
    name: "Key lime pie",
    price: 2400,
    priceFrom: true,
    variants: [
      { unit: "individual", price: 2400 },
      { unit: "mediano (8 personas)", price: 12000 },
      { unit: "grande (18 personas)", price: 21000 },
    ],
    description: [
      "Clásico pie de limón de Florida, cremoso y cítrico, con crust de galleta y cubierto por un " +
        "rico merengue italiano.",
    ],
    categoria: "dulces",
    ocasiones: ["oficinas", "regalos"],
    ingredients: ["leche", "huevo", "galleta", "mantequilla", "limón"],
    allergens: ["lácteos", "gluten", "huevo"],
    leadTimeHours: 48,
    image: productImage(
      "key-lime-pie",
      [336, 673],
      "Key lime pie entero en su molde de cristal, cubierto de merengue italiano rizado en espiral",
    ),
  },
  {
    slug: "cheesecake",
    name: "Cheesecake",
    price: 2500,
    priceFrom: true,
    variants: [
      { unit: "individual", price: 2500 },
      { unit: "mediano (8 personas)", price: 13000 },
      { unit: "grande (18 personas)", price: 22000 },
    ],
    description: [
      "Cheesecake sencillo pero delicioso: crust de galleta molida relleno con una mezcla de queso " +
        "crema y crema de leche, con cubierta de fresas naturales en láminas. El coulis va aparte.",
    ],
    categoria: "dulces",
    ocasiones: ["oficinas", "regalos"],
    ingredients: ["leche", "huevo", "galleta", "mantequilla", "crema de leche", "fresas"],
    allergens: ["lácteos", "gluten", "huevo", "fresas"],
    leadTimeHours: 48,
    image: productImage(
      "cheesecake",
      [341, 681],
      "Cheesecake individual en un plato blanco, con coulis y láminas de fresa natural por encima",
    ),
  },
  {
    slug: "quesillo",
    name: "Quesillo",
    price: 1600,
    priceFrom: true,
    variants: [
      { unit: "individual", price: 1600 },
      { unit: "mediano (10 personas)", price: 12000 },
    ],
    description: ["Dulce cremoso de leche cubierto con caramelo."],
    categoria: "dulces",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: ["leche", "huevos"],
    allergens: ["lácteos", "huevo"],
    leadTimeHours: 48,
    image: productImage(
      "quesillo",
      [321, 642],
      "Quesillo individual desmoldado en un plato blanco, bañado en su caramelo",
    ),
  },
  {
    slug: "quesillo-de-coco",
    name: "Quesillo de coco",
    price: 14000,
    variants: [{ unit: "mediano (10 personas)", price: 14000 }],
    description: [
      "Dulce cremoso de leche de coco cubierto con caramelo y decorado con coco tostado.",
    ],
    categoria: "dulces",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    // Los dos campos, tal cual el Excel. El coco aparece en la descripción y en
    // la foto pero NO aquí: Ale lo quitó de los alérgenos el 17 ago, así que la
    // ficha lo cuenta como sabor y no como advertencia. Es decisión suya.
    ingredients: ["leche", "huevos"],
    allergens: ["lácteos", "huevo"],
    leadTimeHours: 48,
    image: productImage(
      "quesillo-de-coco",
      [533, 1067, 1600],
      "Quesillo de coco entero sobre un plato blanco, con la superficie de caramelo cubierta de coco tostado rallado",
    ),
  },
  {
    slug: "tortilla-espanola-original",
    name: "Tortilla española original",
    price: 12000,
    variants: [{ unit: "grande (12 personas)", price: 12000 }],
    description: ["Tierna tortilla de papas con cebolla caramelizada, mi versión."],
    categoria: "salado",
    // El Excel escribe «oficinas, reuniones», pero `reuniones` no es una ocasión
    // del catálogo y `oficinas` ya se rotula «Oficinas y cafeterías».
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: ["huevos", "papas", "aceite", "sal", "cebolla"],
    allergens: ["huevo"],
    leadTimeHours: 48,
    image: productImage(
      "tortilla-espanola-original",
      [533, 1067, 1600],
      "Tortilla española entera sobre un plato metálico, dorada y jugosa, con el centro tostado",
    ),
  },
  {
    slug: "tortilla-espanola-con-chorizo",
    name: "Tortilla española con chorizo",
    price: 15000,
    variants: [{ unit: "grande (12 personas)", price: 15000 }],
    description: ["Tierna tortilla de papas con cebolla caramelizada y chorizo."],
    categoria: "salado",
    ocasiones: ["cumpleanos", "bodas-bautizos", "oficinas"],
    ingredients: ["huevos", "papas", "aceite", "sal", "cebolla", "chorizo"],
    allergens: ["huevo"],
    leadTimeHours: 48,
    image: productImage(
      "tortilla-espanola-con-chorizo",
      [533, 1067, 1600],
      "Tortilla española con chorizo entera sobre un plato metálico, vista desde arriba y dorada en los bordes",
    ),
  },
];

/** Búsqueda por slug, para `/tienda/[slug]`. */
export function findProduct(slug: string): ShopProduct | undefined {
  return products.find((product) => product.slug === slug);
}

export default products;
