import { CONTACT } from "@/lib/contact";

/**
 * Contenido de las páginas de texto: «sobre nosotros» y el aviso legal.
 *
 * Se separa de `content/home.ts` porque no está atado al layout del spec: aquí
 * no hay cantidades obligatorias, sólo prosa.
 *
 * ⚠ Lo marcado TODO son datos que hay que confirmar con Ale antes de publicar.
 * Se han redactado con lo que se sabe y NO se inventa nada verificable (formas
 * de pago u horarios): en una página legal o de preguntas
 * frecuentes, un dato falso es peor que un dato ausente.
 */

export interface FaqItem {
  question: string;
  answer: string;
  todo?: boolean;
}

/**
 * Un párrafo de la prosa: texto suelto, un texto con su entradilla en negrita, o
 * una lista de viñetas.
 *
 * No hay mini-markdown ni parser: el marcado sigue viviendo en la página, que es
 * la convención de este fichero. Lo único que se añade es de qué trata el
 * párrafo, que es un dato, no una etiqueta.
 *
 * ⚠ El `lead` lleva SU PROPIA puntuación («Queques:») porque el render mete un
 * único espacio entre los dos. Sin ella salen párrafos que empiezan por coma. Lo
 * vigila `tests/unit/pages.test.ts`.
 *
 * ⚠ `items` NO se pinta dentro de un `<p>`: la página devuelve un `<ul>` HERMANO
 * de los párrafos. El parser de HTML cierra un `<p>` abierto en cuanto ve un
 * `<ul>`, así que el marcado del servidor no coincidiría con el árbol de React y
 * la hidratación fallaría — sin romper ningún test, sólo con un aviso en consola.
 */
export type LeadParagraph = { lead: string; text: string };
export type ListParagraph = { items: string[] };
export type Paragraph = string | LeadParagraph | ListParagraph;

/**
 * Las dos guardias de forma. Existen porque `"items" in paragraph` **deja de
 * discriminar** en cuanto una sección mezcla las dos formas: TypeScript infiere
 * el literal con `items?: undefined` en la rama de la entradilla, así que la
 * propiedad existe en las dos y `items` sale `string[] | undefined`. Dentro de
 * estas funciones el parámetro es la unión DECLARADA, donde el `in` sí estrecha,
 * y el resto del código usa la guardia y se olvida del problema.
 *
 * ⚠ El `string` sale ANTES a propósito: sin ese `return`, TypeScript rechaza el
 * `in` sobre una unión que todavía puede ser un primitivo (TS2361).
 */
export function isListParagraph(paragraph: Paragraph): paragraph is ListParagraph {
  if (typeof paragraph === "string") return false;
  return "items" in paragraph;
}

export function isLeadParagraph(paragraph: Paragraph): paragraph is LeadParagraph {
  if (typeof paragraph === "string") return false;
  return "lead" in paragraph;
}

/** El texto plano de un párrafo: claves de React y aserciones de los tests. */
export function paragraphText(paragraph: Paragraph): string {
  if (typeof paragraph === "string") return paragraph;
  if (isListParagraph(paragraph)) return paragraph.items.join(" ");
  return `${paragraph.lead} ${paragraph.text}`;
}

export interface AboutSection {
  id: string;
  title: string;
  paragraphs: Paragraph[];
}

export const about = {
  eyebrow: "Sobre Boquita",
  title: "Un bocado de felicidad",
  // Dos párrafos, no uno: el primero dice a qué vino Boquita y el segundo a qué
  // saben sus recetas. Partirlos es lo que evita una entradilla de seis líneas.
  lead: [
    "Boquita nace de una idea sencilla: ofrecer opciones prácticas para todo tipo de " +
      "ocasiones, con productos apetitosos e ingredientes de buena calidad.",
    "Son recetas delicadas, suaves y originales. Un bocado de sabor y frescura con un " +
      "equilibrio natural que transmite bienestar y placer, y nos transporta a nuestras raíces " +
      "porque tienen el sabor de lo hecho en casa.",
  ],

  sections: [
    {
      id: "historia",
      title: "Quién está detrás",
      paragraphs: [
        "Soy Ale y Boquita es mi cocina.",
        "Empecé horneando para mis círculos cercanos —amistades, colegio, club y actividades " +
          "deportivas— y de ahí llegaron los primeros pedidos, por " +
          "boca a boca y por referencia de quienes ya habían probado. En abril de 2022 vendí " +
          "el primer pedido y ese es el arranque oficial de Boquita.",
        "Las recetas son propias y originales, y las han probado personas con gustos y " +
          "nacionalidades diferentes. Esa variedad de opiniones me ha ayudado a crear sabores " +
          "que disfrutan paladares muy distintos.",
        // «Diecisiete recetas base» y no «diecisiete recetas» a secas: la portada
        // anuncia una métrica que cuenta PRODUCTOS del catálogo (hoy 23, la
        // calcula `lib/homeContent.ts`), y los cupcakes son la misma receta en
        // otro molde. Sin la palabra «base», las dos cifras se desmienten.
        "Hoy son diecisiete recetas base —siete de queque, tres de galleta y siete postres—, " +
          "que en el catálogo se abren en más productos según el tamaño y el formato, más los " +
          "queques personalizados por encargo. Todas se preparan en mi casa, con mi horno y " +
          "mis manos. La cantidad que sale cada día depende de los pedidos que haya, no al revés.",
      ],
    },
    {
      id: "como-horneamos",
      title: "Cómo horneamos",
      paragraphs: [
        "Empieza en el mercado. Una vez por semana visito ferias y mercados mayoristas para " +
          "seleccionar productos frescos y de buena calidad: mantequilla, queso crema, crema " +
          "de leche, huevos, nueces y almendras, coco, chocolate oscuro, dulce de leche, " +
          "dátiles, fresas, limón y bananas naturales.",
        "Después viene la preparación. Peso cada ingrediente, tuesto las harinas y las nueces, " +
          "trituro, tamizo y amaso; luego dejo reposar la masa durante una hora. Cada lote " +
          "requiere dos horas y media de horneado. Son unas seis horas de trabajo al día y tres " +
          "tandas de horno como máximo.",
        "Mis dulces no buscan tener un exceso de azúcar. Tienen un sabor equilibrado, se preparan " +
          "con ingredientes de alta calidad y celebran el placer de comer bien. Son ligeros, no " +
          "demasiado dulces, y eso es intencional.",
      ],
    },
    {
      id: "catalogo",
      title: "Qué hay en el catálogo",
      paragraphs: [
        {
          lead: "Queques:",
          text:
            "Zanahoria con coco y nueces bajo una cobertura de queso crema; limón con jugo " +
            "y ralladura natural; Devil's Food, explosión de chocolate rellena y cubierta de " +
            "brigadeiro; Coffee Cake, de vainilla con nueces, dulce de leche y canela; Chocolate " +
            "Chip Cookie, crujiente por fuera y suave por dentro; vainilla, mi mejor versión de un " +
            "bizcocho de mantequilla; y Banana Bread con bananas naturales y azúcar en polvo. Cada uno se ofrece en " +
            "tamaño pequeño, mediano o grande, y varios también en moldes de cupcake de 6, 12 o " +
            "24 porciones.",
        },
        {
          lead: "Galletas:",
          text:
            "Polvorones españoles de almendras molidas, galletas de granola con avena, " +
            "coco y mantequilla de maní, y galletas de miel y limón, crujientes y perfectas para " +
            "el café. En paquetes de 6 o 12 unidades, o por peso.",
        },
        {
          lead: "Postres:",
          text:
            "Brigadeiros, que son trufas de chocolate cubiertas de hormiguitas: un bocado " +
            "de amor y felicidad. Pie de brigadeiro con base de galleta de mantequilla y un toque " +
            "de sal marina. Key Lime Pie con merengue italiano. Cheese cake con fresas naturales " +
            "en láminas. Quesillo cremoso con caramelo. Barra de dátiles, crujiente y suave a la " +
            "vez. Y mousse de chocolate oscuro, que se hace sólo con chocolate y huevo, así que " +
            "sirve para quien no puede tomar gluten ni lácteos, con una versión endulzada con " +
            "monk fruit sin azúcar añadida.",
        },
        {
          lead: "Queques personalizados:",
          text:
            "Se hacen por encargo: el precio depende del tamaño, los pisos " +
            "y la decoración. Envíame una foto de referencia o cuéntame la idea y te digo si se " +
            "puede hacer y cuánto cuesta.",
        },
        "Los precios de cada tamaño, la lista completa de ingredientes y los alérgenos están " +
          "en la ficha de cada producto del catálogo.",
      ],
    },
    {
      id: "presentaciones",
      title: "Presentaciones",
      paragraphs: [
        "Para mí, la presentación es parte del producto: cada detalle debe resultar tan agradable " +
          "a la vista como al paladar.",
        "Hay flexibilidad de tamaños y formatos, incluidos los individuales, para que cada " +
          "quien encuentre su bocado. Los cupcakes se acomodan en una caja armados en forma de " +
          "queque, lo que resalta la individualidad de las porciones y resulta práctico para un " +
          "cumpleaños. Los queques van en su caja, con etiqueta, lazo y un mensaje, como si " +
          "fueran un regalo. Las galletas y los polvorones salen en cajas y bolsas según la fecha.",
        "Los diseños son propios y las presentaciones se pueden personalizar. Si tienes una idea " +
          "para una fecha concreta, se puede armar.",
      ],
    },
    {
      id: "ocasiones",
      title: "Para qué ocasiones",
      paragraphs: [
        "Cumpleaños, bodas y bautizos, baby showers, regalos y Navidad. También pedidos para " +
          "oficinas: reuniones de equipo, almuerzos y celebraciones, en porciones individuales " +
          "o en cajas para compartir.",
        "Para las fechas de mayor demanda conviene avisar con tiempo, porque trabajo con un solo horno.",
      ],
    },
    {
      id: "entregas",
      title: "Pedidos y entregas",
      // Un rótulo por tema, con su texto debajo: la misma forma que el catálogo,
      // porque quien viene aquí busca UNA cosa —el plazo, la zona, el pago— y la
      // encuentra por el rótulo sin leer el resto. Estuvo en viñetas de una frase
      // y el texto quedaba sangrado 30px: la sección se leía desalineada de sus
      // hermanas, y el carril de la viñeta no aportaba nada que el rótulo no diga
      // mejor.
      //
      // La ÚNICA lista que queda son los dos plazos, y ahí sí gana: son dos
      // valores del mismo eje, y en viñetas se comparan de un vistazo.
      // Lo vigila `tests/unit/pages.test.ts`.
      paragraphs: [
        {
          lead: "Cómo hacer tu pedido:",
          text:
            "Todo se coordina por WhatsApp. Ahí acordamos qué quieres, para cuándo y dónde, y " +
            "te confirmo todo al momento.",
        },
        { lead: "Tiempo de anticipación:", text: "Todo se hornea por encargo:" },
        {
          items: [
            "Casi todo el menú: 48 horas de anticipación.",
            "Queques personalizados: 1 semana.",
          ],
        },
        {
          lead: "Retiro en punto de entrega:",
          text: `Puedes retirar tu pedido en ${CONTACT.address}.`,
        },
        {
          lead: "Entrega a domicilio:",
          text:
            "Hacemos entregas en todo el Gran Área Metropolitana. En las zonas cercanas, la " +
            "entrega la hago yo personalmente en mi vehículo; para el resto, coordinamos con " +
            "mensajería. La zona y la hora de entrega se acuerdan al confirmar tu pedido.",
        },
        {
          lead: "Formas de pago:",
          text:
            "Puedes pagar en efectivo o por SINPE. La forma de pago se acuerda al confirmar el " +
            "pedido.",
        },
        {
          lead: "Puntualidad:",
          text:
            "La puntualidad es un valor que cuidamos y una parte importante de esta iniciativa. " +
            "La hora que acordamos es la hora en que llega tu pedido.",
        },
      ],
    },
  ] satisfies AboutSection[],

  faq: [
    {
      question: "¿Cómo hago un pedido?",
      answer:
        "Escríbeme por WhatsApp con lo que quieres, la fecha y la zona. Te confirmo si se puede " +
        "para ese día y cerramos ahí los detalles.",
    },
    {
      question: "¿Con cuánta anticipación tengo que pedir?",
      answer:
        "48 horas para casi todo, porque se hornea desde cero por encargo. Los queques " +
        "personalizados necesitan una semana, y los de dos pisos también.",
    },
    {
      question: "¿Hacen entregas o tengo que ir a buscarlo?",
      answer:
        `Las dos cosas. Puedes retirar en ${CONTACT.address}, o coordinamos la entrega dentro ` +
        "del Gran Área Metropolitana. En los sectores cercanos la entrega la hago yo; para el " +
        "resto vamos con mensajería.",
    },
    {
      question: "¿Cómo se paga?",
      // Ya no es un TODO: Ale confirmó los medios reales (efectivo o SINPE).
      answer: "En efectivo o por SINPE, al confirmar el pedido. No hay pagos en línea en el sitio: " +
        "el carrito solo prepara el mensaje de WhatsApp con lo que quieres.",
    },
    {
      question: "¿Cuánto tiempo se conserva?",
      answer:
        "Los queques se conservan de cinco a siete días en el refrigerador. Como no llevan conservantes, " +
        "mejor sacarlos un rato antes de servir.",
    },
    {
      question: "¿Puedo pedir un queque con un diseño específico?",
      answer:
        "Sí, el queque personalizado es un producto del catálogo. Envíame una foto de " +
        "referencia o cuéntame la idea y te digo si se puede y cuánto cuesta: el precio depende " +
        "del tamaño, los pisos y la decoración. Necesito una semana.",
    },
    {
      question: "¿Puedo pedir porciones individuales?",
      answer:
        "Sí. Los queques también se preparan como cupcakes, en paquetes de 6, 12 o 24, y " +
        "varios postres tienen presentación individual. Para una oficina o un evento suele ser " +
        "la opción más práctica.",
    },
    {
      question: "¿Tienen opciones sin gluten o sin lácteos?",
      // Se dice UNA cosa porque es la única que hay: en el catálogo real sólo el
      // mousse de chocolate no lleva harina. Prometer más era lo que hacía esta
      // respuesta con el catálogo anterior.
      answer:
        "El mousse de chocolate se hace sólo con chocolate y huevo, sin harina y sin lácteos. " +
        "El resto del catálogo lleva harina de trigo, incluidos los polvorones: la ficha de " +
        "cada producto lista lo que contiene, así que se puede comprobar antes de pedir.",
    },
    {
      question: "¿Y sin azúcar?",
      answer:
        "El mousse de chocolate tiene una versión endulzada con monk fruit, sin azúcar añadida. " +
        "Es una opción para quienes deben evitar el azúcar.",
    },
    {
      question: "¿Puedo avisar de una alergia?",
      answer:
        "Sí, y conviene hacerlo. Cada ficha del catálogo lista sus ingredientes y sus alérgenos. " +
        "Ten en cuenta que todo se hornea en la misma cocina, así que no puedo garantizar que no haya trazas " +
        "de gluten, huevo, lácteos o frutos secos.",
    },
    {
      question: "¿Hacen pedidos para oficinas y eventos?",
      answer:
        "Sí. Se puede armar el pedido en porciones individuales o en cajas para compartir, y " +
        "coordinamos la entrega en el lugar. Cuéntame para cuántas personas es y para cuándo.",
    },
  ] satisfies FaqItem[],

  /**
   * El bloque de cierre. Los enlaces los pone la página: aquí sólo va el texto.
   *
   * ⚠ ESTE BLOQUE TUTEA Y EL RESTO DE LA PÁGINA VOSEA. Es decisión del cliente,
   * no un descuido: está registrado como la única excepción en CLAUDE.md §Idioma.
   * No «normalizarlo» al voseo del sitio ni extenderlo a la FAQ — lo afirma
   * `tests/unit/pages.test.ts`. Alcanza también a dos cadenas escritas a mano en
   * `app/sobre-nosotros/page.tsx`: el «o mira el catálogo completo» y la etiqueta
   * del botón de WhatsApp.
   *
   * ⚠ `body` termina SIN punto a propósito: la página cierra la frase con el
   * enlace de Instagram («… está todo en @boquita_cr.») y el punto lo pone el JSX.
   */
  closing: {
    title: "Escríbeme",
    body:
      "Cuéntame qué necesitas y para cuándo, y lo coordinamos por WhatsApp. Si quieres ver antes " +
      "lo que va saliendo del horno, está todo en",
    emailIntro: "También puedes escribirme a",
    signature: "La felicidad comienza desde el primer bocado.",
  },
};

export const legal = {
  title: "Aviso legal y privacidad",
  updated: "agosto de 2026",

  sections: [
    {
      id: "responsable",
      title: "Quién está detrás de este sitio",
      paragraphs: [
        `Boquita — Sweet & Salty es un emprendimiento de repostería artesanal en ` +
          `${CONTACT.address}. Contacto por WhatsApp: ${CONTACT.whatsappDisplay}.`,
      ],
    },
    {
      id: "datos",
      title: "Qué datos recogemos",
      paragraphs: [
        "Este sitio no tiene cuentas de usuario ni procesa pagos. Cuando abres WhatsApp desde " +
          "el carrito guardamos un intento de pedido con los productos, cantidades y precios " +
          "mostrados en ese momento, además del nombre, la fecha, la zona y las notas que hayas " +
          "escrito. Abrir WhatsApp no significa que el pedido esté enviado ni confirmado.",
        "El carrito se guarda ÚNICAMENTE en tu navegador (en el almacenamiento local del " +
          "dispositivo) mientras lo preparas. Boquita no puede verlo antes de que selecciones " +
          "«Finalizar por WhatsApp». Si borras los datos del navegador, el carrito desaparece.",
        "Los intentos de pedido se almacenan en una base de datos de Neon durante 24 meses " +
          "para dar seguimiento a solicitudes y entender qué productos interesan. El sitio " +
          "elimina los que superan ese plazo al procesar nuevas solicitudes. Para limitar envíos " +
          "abusivos usamos durante un máximo de " +
          "dos días un hash irreversible de la dirección IP; nunca guardamos la IP original.",
        "Al enviar ese mensaje, la conversación pasa a WhatsApp y se rige por sus propias " +
          "condiciones y por las de Meta, que no controlamos.",
      ],
    },
    {
      id: "promociones",
      title: "Promociones por correo",
      paragraphs: [
        "El correo es opcional y solo se guarda si completas la dirección y marcas la casilla " +
          "de consentimiento. Lo relacionamos con tu nombre y tus intentos de pedido para poder " +
          "enviarte en el futuro novedades, productos de temporada y promociones de Boquita.",
        "Aceptar promociones no es necesario para pedir por WhatsApp. Conservamos el correo y " +
          "el registro del consentimiento hasta que solicites la baja. Todavía no hay envíos " +
          "automatizados ni se comparte la lista con una plataforma de campañas.",
        `Puedes retirar el consentimiento o pedir que eliminemos tus datos escribiendo a ` +
          `${CONTACT.email}. La baja no afecta a los pedidos que ya hayas coordinado por WhatsApp.`,
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      paragraphs: [
        "No usamos cookies de seguimiento, ni analítica de terceros, ni píxeles publicitarios. " +
          "No hay banner de cookies porque no hay nada que consentir.",
        "El único almacenamiento que usa el sitio es el del carrito descrito arriba, que es " +
          "técnico y necesario para que funcione.",
      ],
    },
    {
      id: "pedidos",
      title: "Precios, pedidos y facturación",
      paragraphs: [
        "Los precios del catálogo son de referencia y pueden cambiar. El precio final del " +
          "pedido es el que se confirma por WhatsApp antes de hornear.",
        "Los productos se elaboran por encargo, así que un pedido confirmado no se puede " +
          "cancelar una vez empezada la producción. Si algo no salió como esperabas, " +
          "escríbenos y lo resolvemos.",
        "El resumen que genera el carrito NO es una factura ni un documento fiscal: es " +
          "sólo un mensaje para pedir.",
      ],
    },
    {
      id: "alergenos",
      title: "Alérgenos",
      paragraphs: [
        "Cada ficha del catálogo indica los alérgenos que el producto contiene de forma " +
          "intencionada. Todo se elabora en una cocina doméstica donde se manipulan gluten, " +
          "huevo, lácteos y frutos secos, así que no podemos garantizar la ausencia de trazas.",
        "Si tienes una alergia grave, avísanos antes de pedir.",
      ],
    },
    {
      id: "imagenes",
      title: "Imágenes y contenido",
      paragraphs: [
        "Las fotografías son de Boquita y corresponden a productos elaborados por el propio " +
          "negocio. Los textos y las imágenes de este sitio no se pueden reutilizar sin " +
          "permiso.",
      ],
    },
  ],
};
