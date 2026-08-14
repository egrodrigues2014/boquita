import { describe, expect, it } from "vitest";
import {
  MARKETING_CONSENT_VERSION,
  configuredOrderRateLimit,
  isISODate,
  normalizeEmail,
  orderRetentionCutoff,
  orderSubmissionSchema,
  orderSubtotal,
  validateMarketingChoice,
} from "@/lib/orderSubmission";
import { isAllowedOrderOrigin, requestIp } from "@/lib/orderRequest";

function validSubmission() {
  return {
    id: "5e663181-962d-43ae-b763-c4c4ed7f6228",
    name: "  María  ",
    date: "2026-08-30",
    zone: "Santa Ana",
    notes: "Sin nueces",
    marketing: {
      email: "  MARIA@Example.COM ",
      consent: true,
      version: MARKETING_CONSENT_VERSION,
    },
    items: [
      { slug: "brigadeiros", name: "Brigadeiros", unit: "12 unidades", price: 5000, qty: 2 },
    ],
    website: "",
  } as const;
}

describe("contrato del intento de pedido", () => {
  it("normaliza correo y texto sin alterar el snapshot comercial", () => {
    const result = orderSubmissionSchema.parse(validSubmission());
    expect(result.name).toBe("María");
    expect(result.marketing?.email).toBe("maria@example.com");
    expect(result.items[0]).toEqual({
      slug: "brigadeiros",
      name: "Brigadeiros",
      unit: "12 unidades",
      price: 5000,
      qty: 2,
    });
  });

  it("rechaza campos extra, honeypot completo, cantidades y fechas inválidas", () => {
    expect(orderSubmissionSchema.safeParse({ ...validSubmission(), extra: true }).success).toBe(false);
    expect(orderSubmissionSchema.safeParse({ ...validSubmission(), website: "bot" }).success).toBe(false);
    expect(
      orderSubmissionSchema.safeParse({
        ...validSubmission(),
        date: "2026-02-30",
        items: [{ ...validSubmission().items[0], qty: 21 }],
      }).success,
    ).toBe(false);
    expect(isISODate("2024-02-29")).toBe(true);
    expect(isISODate("2025-02-29")).toBe(false);
  });

  it("recalcula el subtotal y fija la retención en 24 meses", () => {
    const parsed = orderSubmissionSchema.parse(validSubmission());
    expect(orderSubtotal(parsed.items)).toBe(10_000);
    expect(orderRetentionCutoff(new Date("2026-08-14T12:00:00Z")).toISOString()).toBe(
      "2024-08-14T12:00:00.000Z",
    );
  });
});

describe("consentimiento promocional", () => {
  it("acepta dejar el bloque completamente vacío", () => {
    expect(validateMarketingChoice("", false)).toEqual({ valid: true });
  });

  it("exige correo válido y consentimiento cuando se empieza a completar", () => {
    expect(validateMarketingChoice("", true)).toMatchObject({ valid: false, field: "email" });
    expect(validateMarketingChoice("mal", true)).toMatchObject({ valid: false, field: "email" });
    expect(validateMarketingChoice("ana@example.com", false)).toMatchObject({
      valid: false,
      field: "consent",
    });
  });

  it("devuelve el consentimiento versionado y el correo normalizado", () => {
    expect(validateMarketingChoice(" ANA@EXAMPLE.COM ", true)).toEqual({
      valid: true,
      marketing: {
        email: "ana@example.com",
        consent: true,
        version: MARKETING_CONSENT_VERSION,
      },
    });
    expect(normalizeEmail(" ANA@EXAMPLE.COM ")).toBe("ana@example.com");
  });
});

describe("protección de la ruta", () => {
  it("limita la configuración a un rango seguro", () => {
    expect(configuredOrderRateLimit(undefined)).toBe(20);
    expect(configuredOrderRateLimit("35")).toBe(35);
    expect(configuredOrderRateLimit("0")).toBe(20);
    expect(configuredOrderRateLimit("2000")).toBe(20);
  });

  it("acepta sólo el origen propio o el dominio configurado", () => {
    expect(isAllowedOrderOrigin("https://boquita.cr", "https://boquita.cr/api/orders")).toBe(true);
    expect(
      isAllowedOrderOrigin(
        "https://www.boquita.cr",
        "https://preview.example/api/orders",
        "https://www.boquita.cr",
      ),
    ).toBe(true);
    expect(isAllowedOrderOrigin("https://evil.example", "https://boquita.cr/api/orders")).toBe(false);
    expect(isAllowedOrderOrigin(null, "https://boquita.cr/api/orders")).toBe(false);
  });

  it("elige la cabecera de IP sin conservar listas de proxies", () => {
    expect(requestIp(new Headers({ "cf-connecting-ip": "203.0.113.5" }))).toBe("203.0.113.5");
    expect(requestIp(new Headers({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" }))).toBe(
      "198.51.100.2",
    );
    expect(requestIp(new Headers())).toBe("unknown");
  });
});
