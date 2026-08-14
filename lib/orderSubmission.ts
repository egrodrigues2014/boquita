import { z } from "zod";

/** Cambiar esta cadena obliga a registrar de nuevo el consentimiento. */
export const MARKETING_CONSENT_VERSION = "cart-2026-08";
export const ORDER_RETENTION_MONTHS = 24;
export const MAX_ORDER_LINES = 50;
export const MAX_ORDER_QTY = 20;

export function normalizeEmail(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || undefined)
    .optional();
}

export function isISODate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const orderItemSchema = z
  .object({
    slug: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(160),
    unit: z.string().trim().min(1).max(100),
    price: z.number().int().positive().max(10_000_000),
    qty: z.number().int().min(1).max(MAX_ORDER_QTY),
  })
  .strict();

const marketingSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform(normalizeEmail),
    consent: z.literal(true),
    version: z.literal(MARKETING_CONSENT_VERSION),
  })
  .strict();

export const orderSubmissionSchema = z
  .object({
    id: z.string().uuid(),
    name: optionalText(100),
    date: optionalText(10).refine((value) => value === undefined || isISODate(value), {
      message: "La fecha debe usar el formato YYYY-MM-DD",
    }),
    zone: optionalText(160),
    notes: optionalText(500),
    marketing: marketingSchema.optional(),
    items: z.array(orderItemSchema).min(1).max(MAX_ORDER_LINES),
    /** Campo trampa: no se muestra ni se completa en un navegador normal. */
    website: z.string().max(0).default(""),
  })
  .strict();

export type OrderSubmission = z.infer<typeof orderSubmissionSchema>;

export function orderSubtotal(items: OrderSubmission["items"]): number {
  return items.reduce((total, item) => total + item.price * item.qty, 0);
}

export function orderRetentionCutoff(from: Date): Date {
  const cutoff = new Date(from);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - ORDER_RETENTION_MONTHS);
  return cutoff;
}

export function configuredOrderRateLimit(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 1_000 ? parsed : 20;
}

export type MarketingValidation =
  | { valid: true; marketing?: OrderSubmission["marketing"] }
  | { valid: false; field: "email" | "consent"; message: string };

/** Regla del bloque opcional: vacío es válido; si se empieza, se completa entero. */
export function validateMarketingChoice(emailValue: string, consent: boolean): MarketingValidation {
  const email = normalizeEmail(emailValue);
  if (!email && !consent) return { valid: true };
  if (!email) {
    return { valid: false, field: "email", message: "Ingresá el correo que querés suscribir." };
  }
  if (!z.string().email().max(254).safeParse(email).success) {
    return { valid: false, field: "email", message: "Ingresá un correo electrónico válido." };
  }
  if (!consent) {
    return {
      valid: false,
      field: "consent",
      message: "Marcá la casilla para autorizar el envío de promociones.",
    };
  }
  return {
    valid: true,
    marketing: { email, consent: true, version: MARKETING_CONSENT_VERSION },
  };
}
