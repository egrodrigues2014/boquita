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

export interface AboutSection {
  id: string;
  title: string;
  paragraphs: string[];
}

export const about = {
  eyebrow: "Sobre Boquita",
  title: "Hecho a mano, en tandas pequeñas",
  lead:
    "Boquita nació en la cocina de casa de Ale Budowski, en Santa Ana. " +
    "Lo que empezó como queques para la familia hoy son catorce recetas que salen del " +
    "horno por encargo, una tanda a la vez.",

  sections: [
    {
      id: "historia",
      title: "La historia de Ale",
      paragraphs: [
        "Ale empezó a hornear en 2019 para su familia. Los queques de zanahoria se le " +
          "pedían tanto que un día alguien le dijo que los vendiera, y ahí empezó todo.",
        "El nombre lo dice bastante claro: «Sweet & Salty», dulce y salado. Porque además " +
          "de los queques y las galletas hay cachitos de jamón y asado negro, que es lo que " +
          "se cocina cuando alguien de la casa cumple años.",
        "Sigue siendo una cocina de casa. No hay una fábrica detrás: hay una persona que " +
          "hornea lo que se le pide, con el tiempo que cada receta necesita.",
      ],
    },
    {
      id: "como-horneamos",
      title: "Cómo horneamos",
      paragraphs: [
        "Mantequilla de verdad, zanahoria rallada a mano, chocolate que se derrite y " +
          "almendra molida. Sin mezclas industriales y sin conservantes, que es también la " +
          "razón por la que todo se hornea el día que se entrega.",
        "Cada pedido se hace desde cero. No hay vitrina ni stock: por eso hacen falta 48 " +
          "horas de anticipación, y una semana para los queques personalizados de dos pisos.",
        "Las tandas son pequeñas a propósito. Se pueden hacer más, pero no al mismo tiempo.",
      ],
    },
    {
      id: "entregas",
      title: "Entregas y zonas",
      paragraphs: [
        `Podés retirar el pedido en ${CONTACT.address}, o coordinamos la entrega en ` +
          "Santa Ana, Escazú y alrededores. La zona y la hora se acuerdan por WhatsApp " +
          "cuando confirmamos el pedido.",
        "Para pedidos grandes o fuera de esa zona, escribinos y vemos si se puede: depende " +
          "del día y de lo que haya en el horno.",
      ],
    },
  ] satisfies AboutSection[],

  faq: [
    {
      question: "¿Con cuánta anticipación tengo que pedir?",
      answer:
        "48 horas para casi todo, porque se hornea desde cero el día de la entrega. Los " +
        "queques personalizados de dos pisos necesitan una semana, y el asado negro tres " +
        "días por la cocción lenta.",
    },
    {
      question: "¿Hacen entregas a domicilio?",
      answer:
        `Coordinamos entregas en Santa Ana, Escazú y alrededores, y también podés retirar ` +
        `en ${CONTACT.address}. La zona y la hora se acuerdan por WhatsApp.`,
    },
    {
      question: "¿Cómo se paga?",
      // ⚠ TODO: confirmar con Ale qué medios acepta de verdad.
      answer:
        "El pago se acuerda por WhatsApp al confirmar el pedido. No hay pago online en el " +
        "sitio: el carrito sólo arma el mensaje con lo que querés.",
      todo: true,
    },
    {
      question: "¿Tienen opciones sin gluten?",
      answer:
        "Sí. Las galletas de granola, los biscotti keto y las barras de dátil se hacen con " +
        "harina de almendra o avena, sin trigo. Están agrupadas en la categoría «Sin gluten " +
        "y keto» del catálogo.",
    },
    {
      question: "¿Y sin azúcar o veganos?",
      answer:
        "Los biscotti keto llevan endulzante apto para dieta keto, y las barras de dátil no " +
        "tienen azúcar añadida: el dulzor sale del dátil. El coffee cake es vegano, sin huevo " +
        "ni lácteos.",
    },
    {
      question: "¿Puedo pedir un queque con un diseño concreto?",
      answer:
        "Sí. Mandanos una foto de referencia o contanos la idea por WhatsApp y te decimos si " +
        "se puede hacer y cuánto sale. El precio depende del tamaño, los pisos y la decoración, " +
        "así que ese producto no lleva precio fijo en el catálogo.",
    },
    {
      question: "¿Cuánto me dura?",
      answer:
        "Los queques con frosting de queso crema aguantan tres o cuatro días en refrigeración. " +
        "Las galletas, los polvorones y los biscotti, una o dos semanas en un recipiente " +
        "cerrado. Los brigadeiros, mejor comerlos en los primeros días.",
    },
    {
      question: "¿Puedo avisar de una alergia?",
      answer:
        "Sí, y conviene hacerlo. Cada ficha del catálogo lista lo que contiene, y en el " +
        "carrito hay un campo para notas. Ojo: todo se hornea en la misma cocina, así que no " +
        "podemos garantizar que no haya trazas de frutos secos, gluten o lácteos.",
    },
  ] satisfies FaqItem[],
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
        // ⚠ TODO: si Boquita está inscrita, poner razón social y cédula jurídica.
        "Los datos fiscales y de inscripción se añadirán aquí cuando corresponda.",
      ],
    },
    {
      id: "datos",
      title: "Qué datos recogemos",
      paragraphs: [
        "Este sitio no tiene cuentas de usuario, no cobra pagos y no guarda información " +
          "personal en ningún servidor propio.",
        "El carrito se guarda ÚNICAMENTE en tu navegador (en el almacenamiento local del " +
          "dispositivo). No se envía a ninguna parte ni lo podemos ver. Si borrás los datos " +
          "del navegador, el carrito desaparece.",
        "Los datos que escribís en el carrito —nombre, fecha, zona y notas— no se almacenan: " +
          "se usan sólo para redactar el mensaje de WhatsApp que vos decidís enviar. Si no lo " +
          "enviás, no llegan a ningún sitio.",
        "Al enviar ese mensaje, la conversación pasa a WhatsApp y se rige por sus propias " +
          "condiciones y por las de Meta, que no controlamos.",
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
      id: "terceros",
      title: "Servicios de terceros",
      paragraphs: [
        "El sitio está alojado en Vercel, que registra datos técnicos de las peticiones " +
          "(dirección IP, navegador) para servir las páginas y protegerse de abusos.",
        "El vídeo de la portada se muestra incrustado desde Instagram, y sólo se carga si " +
          "pulsás el botón de reproducción. Hasta ese momento no se hace ninguna petición a " +
          "los servidores de Meta.",
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
          "escribinos y lo resolvemos.",
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
        "Si tenés una alergia severa, avisanos antes de pedir.",
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
