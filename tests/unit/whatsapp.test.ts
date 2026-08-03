import { describe, expect, it } from "vitest";
import {
  MAX_ENCODED_LENGTH,
  WA_NUMBER,
  buildCompactMessage,
  buildOrderMessage,
  buildWhatsAppUrl,
  earliestDate,
  waPlainLink,
} from "@/lib/whatsapp";
import type { CartLine } from "@/types/shop";

/**
 * Este mensaje es el artefacto que llega literalmente al teléfono de Ale. Un
 * fallo aquí no se ve en la pantalla: se ve en un pedido mal entendido.
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
  it("lista cada producto con cantidad, unidad y total de línea", () => {
    const message = buildOrderMessage([line({ qty: 2 })]);
    expect(message).toContain("• 2 × Queque de zanahoria (molde de 8 porciones) — ₡ 28.000");
  });

  it("suma el total en colones", () => {
    const message = buildOrderMessage([
      line({ qty: 2 }),
      line({ slug: "brigadeiros", name: "Brigadeiros", unit: "docena", price: 6500, qty: 1 }),
    ]);
    expect(message).toContain("Total: ₡ 34.500");
  });

  it("los productos a convenir NO se suman al total y se avisa", () => {
    // Sumar un «desde» daría un total que no es el que se va a pagar.
    const message = buildOrderMessage([
      line({ qty: 1 }),
      line({
        slug: "queque-personalizado",
        name: "Queque personalizado",
        unit: "por encargo",
        price: 22000,
        priceOnRequest: true,
      }),
    ]);
    expect(message).toContain("precio a convenir");
    expect(message).toContain("Total de los productos con precio: ₡ 14.000");
    expect(message).toContain("(hay productos que se cotizan aparte)");
    expect(message).not.toContain("36.000");
  });

  it("incluye los campos opcionales sólo si vienen rellenos", () => {
    const con = buildOrderMessage([line()], {
      name: "María Rodríguez",
      date: "2026-08-15",
      zone: "Santa Ana centro",
      notes: "Sin nueces, por favor",
    });
    expect(con).toContain("Nombre: María Rodríguez");
    expect(con).toContain("Fecha deseada: 2026-08-15");
    expect(con).toContain("Zona de entrega: Santa Ana centro");
    expect(con).toContain("Notas: Sin nueces, por favor");

    const sin = buildOrderMessage([line()]);
    expect(sin).not.toContain("Nombre:");
    expect(sin).not.toContain("Fecha deseada:");
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
    expect(message).toContain("…y 10 unidades más de 5 productos");
  });
});

describe("buildWhatsAppUrl", () => {
  it("apunta al número correcto y codifica el texto", () => {
    const { url } = buildWhatsAppUrl([line()]);
    expect(url.startsWith(`https://wa.me/${WA_NUMBER}?text=`)).toBe(true);
    // Los saltos se codifican DESPUÉS de construir el mensaje.
    expect(url).toContain("%0A");
    expect(url).not.toContain("%250A");
  });

  it("codifica correctamente las tildes y el símbolo del colón", () => {
    const { url } = buildWhatsAppUrl([line({ name: "Cachitos de jamón" })]);
    const decoded = decodeURIComponent(url.split("?text=")[1]!);
    expect(decoded).toContain("Cachitos de jamón");
    expect(decoded).toContain("₡");
  });

  it("un carrito normal no se trunca", () => {
    const { truncated, encodedLength } = buildWhatsAppUrl([line({ qty: 2 })]);
    expect(truncated).toBe(false);
    expect(encodedLength).toBeLessThan(MAX_ENCODED_LENGTH);
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
    expect(decodeURIComponent(url.split("?text=")[1]!)).toContain("60 unidades de 20 productos");
  });
});

describe("buildCompactMessage", () => {
  it("conserva lo imprescindible: unidades, total y aviso de detalle", () => {
    const message = buildCompactMessage([line({ qty: 3 })], { name: "Ana" });
    expect(message).toContain("3 unidades de 1 productos");
    expect(message).toContain("Total aproximado: ₡ 42.000");
    expect(message).toContain("Nombre: Ana");
    expect(message).toContain("detalle en el siguiente mensaje");
  });
});

describe("waPlainLink", () => {
  it("arma un enlace de consulta sin carrito", () => {
    const url = waPlainLink("¡Hola Boquita! Quiero hacer una consulta.");
    expect(url).toBe(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("¡Hola Boquita! Quiero hacer una consulta.")}`,
    );
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
});
