import { describe, expect, it } from "vitest";
import {
  MAX_ENCODED_LENGTH,
  WA_NUMBER,
  buildCompactMessage,
  buildDirectWhatsAppMessage,
  buildDirectWhatsAppUrl,
  buildOrderMessage,
  buildWhatsAppUrl,
  earliestDate,
} from "@/lib/whatsapp";
import type { CartLine } from "@/types/shop";

/**
 * Este mensaje es el artefacto que llega literalmente al teléfono de Ale. Un
 * fallo aquí no se ve en la pantalla: se ve en un pedido mal entendido.
 *
 * Y desde que el formato está pensado para que mañana lo lea un chatbot, las
 * etiquetas son un contrato: por eso el primer test compara el mensaje entero
 * carácter a carácter en vez de buscar trozos. Los `toContain` de los demás casos
 * comprueban reglas concretas; ese comprueba la FORMA.
 */

const line = (over: Partial<CartLine> = {}): CartLine => ({
  slug: "queque-de-zanahoria",
  name: "Queque de zanahoria",
  unit: "molde de 8 porciones",
  price: 14000,
  qty: 1,
  ...over,
});

describe("buildOrderMessage", () => {
  it("produce EXACTAMENTE el formato pactado", () => {
    const message = buildOrderMessage(
      [
        line({ slug: "queque-de-limon", name: "Queque de limón", unit: "pequeño (2 personas)", price: 2250 }),
        line({ slug: "brigadeiros", name: "Brigadeiros", unit: "12 unidades", price: 5000 }),
      ],
      { name: "Elton Rodrigues", date: "2026-08-28" },
    );

    expect(message).toBe(
      [
        "Hola, Ale 👋",
        "",
        "🛍️ *Nuevo pedido desde boquitacostarica.com*",
        "",
        "📋 *Detalle del pedido*",
        "• 1 × Queque de limón",
        "└ Pequeño (2 personas) — ₡ 2.250",
        "• 1 × Brigadeiros",
        "└ 12 unidades — ₡ 5.000",
        "",
        "💰 *Total:* ₡ 7.250",
        "",
        "👤 *Cliente:* Elton Rodrigues",
        "📅 *Fecha deseada:* 28/08/2026",
        "",
        "📌 *Solicitud:* Confirmar disponibilidad y detalles del pedido.",
        "",
        "🌐 Generado desde boquitacostarica.com",
      ].join("\n"),
    );
  });

  it("la negrita va con UN asterisco, que es lo que entiende WhatsApp", () => {
    // Con dos, sintaxis de Markdown, los asteriscos se ven literales en el chat.
    const message = buildOrderMessage([line()]);
    expect(message).not.toContain("**");
    expect(message).toContain("*Total:*");
  });

  it("cada producto ocupa dos líneas: qué es, y presentación con importe", () => {
    const message = buildOrderMessage([line({ qty: 2 })]);
    expect(message).toContain("• 2 × Queque de zanahoria\n└ Molde de 8 porciones — ₡ 28.000");
  });

  it("el importe de la línea es el total de la línea, no el unitario", () => {
    // Es lo que hace que las líneas sumen el total que va más abajo.
    expect(buildOrderMessage([line({ qty: 3 })])).toContain("— ₡ 42.000");
  });

  it("suma el total en colones", () => {
    const message = buildOrderMessage([
      line({ qty: 2 }),
      line({ slug: "brigadeiros", name: "Brigadeiros", unit: "docena", price: 6500, qty: 1 }),
    ]);
    expect(message).toContain("💰 *Total:* ₡ 34.500");
  });

  /**
   * El mismo producto en dos tamaños son DOS líneas con dos precios, y el mensaje
   * tiene que distinguirlas: si el carrito las fundiera por slug —como hacía antes
   * de que existieran las presentaciones— Ale recibiría un pedido con el tamaño
   * equivocado y el importe de otro.
   */
  it("dos presentaciones del mismo producto salen como dos bloques", () => {
    const message = buildOrderMessage([
      line({ unit: "mediano (8-10 personas)", price: 12000 }),
      line({ unit: "grande (20 personas)", price: 24000 }),
    ]);

    expect(message).toContain("└ Mediano (8-10 personas) — ₡ 12.000");
    expect(message).toContain("└ Grande (20 personas) — ₡ 24.000");
    expect(message).toContain("💰 *Total:* ₡ 36.000");
  });

  it("la presentación va con la primera letra en mayúscula, y los números intactos", () => {
    expect(buildOrderMessage([line({ unit: "pequeño (2 personas)" })])).toContain("└ Pequeño");
    expect(buildOrderMessage([line({ unit: "12 unidades" })])).toContain("└ 12 unidades");
    expect(buildOrderMessage([line({ unit: "120 g" })])).toContain("└ 120 g");
  });

  it("los productos a convenir NO se suman al total y se avisa", () => {
    // Sumar un «desde» daría un total que no es el que se va a pagar.
    const message = buildOrderMessage([
      line({ qty: 1 }),
      line({
        slug: "queque-personalizado",
        name: "Queque personalizado",
        unit: "por encargo, según tamaño y diseño",
        price: 22000,
        priceOnRequest: true,
      }),
    ]);
    expect(message).toContain("└ Por encargo, según tamaño y diseño — precio a convenir");
    expect(message).toContain("💰 *Total (productos con precio fijo):* ₡ 14.000");
    expect(message).toContain("⚠️ Hay productos que se cotizan aparte.");
    expect(message).not.toContain("36.000");
  });

  it("incluye los campos opcionales sólo si vienen rellenos", () => {
    const con = buildOrderMessage([line()], {
      name: "María Rodríguez",
      date: "2026-08-15",
      zone: "Santa Ana centro",
      notes: "Sin nueces, por favor",
    });
    expect(con).toContain("👤 *Cliente:* María Rodríguez");
    expect(con).toContain("📅 *Fecha deseada:* 15/08/2026");
    expect(con).toContain("📍 *Zona:* Santa Ana centro");
    expect(con).toContain("📝 *Notas:* Sin nueces, por favor");

    const sin = buildOrderMessage([line()]);
    expect(sin).not.toContain("Cliente:");
    expect(sin).not.toContain("Fecha deseada:");
    expect(sin).not.toContain("Zona:");
    expect(sin).not.toContain("Notas:");
  });

  it("sin ningún campo no deja líneas en blanco de más", () => {
    // Un hueco entre el total y la solicitud, no dos.
    const message = buildOrderMessage([line()]);
    expect(message).not.toContain("\n\n\n");
    expect(message).toContain("₡ 14.000\n\n📌 *Solicitud:*");
  });

  it("la fecha se muestra en DD/MM/YYYY, no en ISO", () => {
    const message = buildOrderMessage([line()], { date: "2026-12-01" });
    expect(message).toContain("📅 *Fecha deseada:* 01/12/2026");
    expect(message).not.toContain("2026-12-01");
  });

  it("una fecha con otra forma se pasa tal cual en vez de inventarse", () => {
    expect(buildOrderMessage([line()], { date: "mañana" })).toContain("*Fecha deseada:* mañana");
  });

  it("siempre cierra con la solicitud y la procedencia", () => {
    const message = buildOrderMessage([line()]);
    expect(message).toContain("📌 *Solicitud:* Confirmar disponibilidad y detalles del pedido.");
    expect(message.endsWith("🌐 Generado desde boquitacostarica.com")).toBe(true);
  });

  it("usa saltos de línea reales, no literales escapados", () => {
    const message = buildOrderMessage([line()]);
    expect(message).toContain("\n");
    expect(message).not.toContain("\\n");
    expect(message).not.toContain("%0A");
  });

  it("resume las líneas que pasan de 20 en vez de listarlas todas", () => {
    const many = Array.from({ length: 25 }, (_, i) =>
      line({ slug: `producto-${i}`, name: `Producto ${i}`, qty: 2 }),
    );
    const message = buildOrderMessage(many);
    expect(message).toContain("Producto 19");
    expect(message).not.toContain("Producto 20");
    // El resumen es una viñeta suelta: no tiene presentación que colgar debajo.
    expect(message).toContain("• …y 10 unidades más de 5 productos");
  });
});

describe("buildWhatsAppUrl", () => {
  it("apunta al número correcto y codifica el texto", () => {
    const { url } = buildWhatsAppUrl([line()]);
    expect(url.startsWith(`https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=`)).toBe(true);
    // Los saltos se codifican DESPUÉS de construir el mensaje.
    expect(url).toContain("%0A");
    expect(url).not.toContain("%250A");
  });

  /**
   * `api.whatsapp.com/send` y no `wa.me`: la redirección del atajo descodifica la
   * query y la recodifica con un codificador que no maneja pares surrogados, así
   * que **cada emoji llegaba como `U+FFFD`**. Los caracteres de 1-3 bytes pasaban
   * intactos; sólo se perdían los de 4. Ver el comentario de `whatsappBaseUrl`.
   *
   * Este test es el que impide volver a `wa.me` sin darse cuenta.
   */
  it("no pasa por wa.me, cuya redirección se come los emoji", () => {
    const { url } = buildWhatsAppUrl([line()]);
    expect(url).not.toContain("wa.me");
    // El 👋 tal y como debe viajar: cuatro bytes, no un carácter de reemplazo.
    expect(url).toContain("%F0%9F%91%8B");
    expect(url).not.toContain("%EF%BF%BD");
  });

  it("codifica correctamente las tildes, el colón y los emoji", () => {
    const { url } = buildWhatsAppUrl([line({ name: "Cachitos de jamón" })]);
    const decoded = decodeURIComponent(url.split("&text=")[1]!);
    expect(decoded).toContain("Cachitos de jamón");
    expect(decoded).toContain("₡");
    expect(decoded).toContain("👋");
  });

  it("un carrito normal no se trunca", () => {
    const { truncated, encodedLength } = buildWhatsAppUrl([line({ qty: 2 })]);
    expect(truncated).toBe(false);
    expect(encodedLength).toBeLessThan(MAX_ENCODED_LENGTH);
  });

  /**
   * El caso que obligó a subir `MAX_ENCODED_LENGTH` de 1400 a 1600: con el formato
   * de emoji cada producto ocupa dos líneas y ~110 caracteres codificados, así que
   * un pedido de 8 productos con los cuatro campos rellenos perdía el detalle y
   * caía al mensaje compacto. Ocho productos es un pedido grande pero real.
   */
  it("un pedido realista de 8 productos conserva el detalle", () => {
    const carrito: CartLine[] = [
      line({ slug: "a", name: "Queque de zanahoria", unit: "mediano (8-10 personas)", price: 12000 }),
      line({ slug: "b", name: "Cupcakes de zanahoria", unit: "12 unidades", price: 15500 }),
      line({ slug: "c", name: "Galletas de miel y limón", unit: "250 g", price: 4500, qty: 2 }),
      line({ slug: "d", name: "Brigadeiros", unit: "24 unidades", price: 9000 }),
      line({ slug: "e", name: "Cheesecake", unit: "grande (18 personas)", price: 22000 }),
      line({ slug: "f", name: "Key lime pie", unit: "mediano (8 personas)", price: 12000 }),
      line({ slug: "g", name: "Polvorones españoles", unit: "12 unidades", price: 5000, qty: 3 }),
      line({ slug: "h", name: "Mousse de chocolate", unit: "grande sin azúcar (18 personas)", price: 14000 }),
    ];

    const { truncated, encodedLength, url } = buildWhatsAppUrl(carrito, {
      name: "María Rodríguez",
      date: "2026-08-28",
      zone: "Santa Ana centro",
      notes: "Sin nueces, por favor",
    });

    expect(truncated).toBe(false);
    expect(encodedLength).toBeLessThan(MAX_ENCODED_LENGTH);
    expect(decodeURIComponent(url.split("&text=")[1]!)).toContain("Mousse de chocolate");
  });

  it("un carrito enorme cae al mensaje compacto y sigue bajo el límite", () => {
    // 20 líneas con nombres acentuados y largos: el caso que rompe wa.me si no
    // se controla, porque cada tilde ocupa 9 caracteres al codificar.
    const many = Array.from({ length: 20 }, (_, i) =>
      line({
        slug: `producto-${i}`,
        name: `Galletas de granola con almendra número ${i}`,
        unit: "caja de 6 unidades surtidas",
        qty: 3,
      }),
    );
    const { truncated, encodedLength, url } = buildWhatsAppUrl(many);
    expect(truncated).toBe(true);
    expect(encodedLength).toBeLessThan(MAX_ENCODED_LENGTH);
    expect(decodeURIComponent(url.split("&text=")[1]!)).toContain("60 unidades de 20 productos");
  });
});

describe("buildCompactMessage", () => {
  it("conserva lo imprescindible con el mismo lenguaje visual", () => {
    const message = buildCompactMessage([line({ qty: 3 })], { name: "Ana", date: "2026-08-28" });
    expect(message).toContain("Hola, Ale 👋");
    expect(message).toContain("📦 *Resumen:* 3 unidades de 1 productos");
    expect(message).toContain("💰 *Total aproximado:* ₡ 42.000");
    expect(message).toContain("👤 *Cliente:* Ana");
    expect(message).toContain("📅 *Fecha deseada:* 28/08/2026");
    expect(message).toContain("detalle en el siguiente mensaje");
    expect(message).not.toContain("**");
  });
});

describe("buildDirectWhatsAppMessage", () => {
  it("alinea el pedido directo con la estructura del carrito", () => {
    expect(buildDirectWhatsAppMessage("order")).toBe(
      [
        "Hola, Ale 👋",
        "",
        "🛍️ *Nuevo pedido desde boquitacostarica.com*",
        "",
        "📌 *Solicitud:* Quiero hacer un pedido y confirmar disponibilidad, fecha y entrega.",
        "",
        "🌐 Generado desde boquitacostarica.com",
      ].join("\n"),
    );
  });

  it("alinea la consulta directa con saludo, solicitud y procedencia", () => {
    expect(buildDirectWhatsAppMessage("consultation")).toBe(
      [
        "Hola, Ale 👋",
        "",
        "💬 *Nueva consulta desde boquitacostarica.com*",
        "",
        "📌 *Solicitud:* Quiero hacer una consulta sobre un pedido.",
        "",
        "🌐 Generado desde boquitacostarica.com",
      ].join("\n"),
    );
  });

  it("alinea la cotización directa e incluye el producto", () => {
    expect(buildDirectWhatsAppMessage("quote", { productName: "Queque personalizado" })).toBe(
      [
        "Hola, Ale 👋",
        "",
        "🧁 *Cotización desde boquitacostarica.com*",
        "",
        "📋 *Detalle de la solicitud*",
        "• Queque personalizado",
        "└ Precio a convenir según tamaño y diseño",
        "",
        "📌 *Solicitud:* Quiero cotizar este producto y contarles la idea para confirmar tamaño, diseño y fecha.",
        "",
        "🌐 Generado desde boquitacostarica.com",
      ].join("\n"),
    );
  });

  it("alinea la salida de error con un mensaje útil para Ale", () => {
    expect(buildDirectWhatsAppMessage("error")).toBe(
      [
        "Hola, Ale 👋",
        "",
        "⚠️ *Ayuda desde boquitacostarica.com*",
        "",
        "📌 *Solicitud:* La web me dio un error y quiero hacer un pedido por WhatsApp.",
        "",
        "🌐 Generado desde boquitacostarica.com",
      ].join("\n"),
    );
  });
});

describe("buildDirectWhatsAppUrl", () => {
  it("apunta al número correcto y codifica el mensaje directo", () => {
    const message = buildDirectWhatsAppMessage("quote", { productName: "Queque personalizado" });
    const url = buildDirectWhatsAppUrl("quote", { productName: "Queque personalizado" });

    expect(url).toBe(
      `https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(message)}`,
    );
    expect(url).not.toContain("wa.me");
    expect(url).toContain("%0A");
    expect(url).toContain("%F0%9F%91%8B");
  });
});

describe("earliestDate", () => {
  it("respeta las 48 horas del horneado por encargo", () => {
    // 1 de agosto de 2026, 10:00 → 3 de agosto.
    expect(earliestDate(48, new Date(2026, 7, 1, 10, 0))).toBe("2026-08-03");
  });

  it("respeta la semana del queque personalizado", () => {
    expect(earliestDate(168, new Date(2026, 7, 1, 10, 0))).toBe("2026-08-08");
  });

  it("cruza bien el fin de mes", () => {
    expect(earliestDate(48, new Date(2026, 7, 30, 10, 0))).toBe("2026-09-01");
  });

  it("cruza bien el fin de año", () => {
    expect(earliestDate(72, new Date(2026, 11, 30, 10, 0))).toBe("2027-01-02");
  });

  it("devuelve una fecha LOCAL, no UTC", () => {
    // Con toISOString(), una hora nocturna en zona negativa (Costa Rica es UTC-6)
    // saltaría al día siguiente y ofrecería una fecha que el cliente no espera.
    const lateNight = new Date(2026, 7, 1, 23, 30);
    expect(earliestDate(48, lateNight)).toBe("2026-08-03");
  });

  /**
   * `earliestDate` sigue devolviendo ISO a propósito: alimenta el atributo `min`
   * del `<input type="date">`, que sólo acepta ese formato. La conversión a
   * DD/MM/YYYY vive dentro del mensaje, que es el único sitio donde la lee alguien.
   */
  it("sigue en ISO porque es lo que pide el input de fecha", () => {
    expect(earliestDate(48, new Date(2026, 7, 1, 10, 0))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
