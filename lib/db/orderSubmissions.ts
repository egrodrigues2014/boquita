import { createHmac } from "node:crypto";
import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  configuredOrderRateLimit,
  orderRetentionCutoff,
  orderSubtotal,
  type OrderSubmission,
} from "@/lib/orderSubmission";
import { formRateLimits, orders } from "./schema";

export type SaveOrderResult = { created: boolean };

export class OrderRateLimitError extends Error {
  constructor() {
    super("order submission rate limit exceeded");
    this.name = "OrderRateLimitError";
  }
}

export class OrderStorageUnavailableError extends Error {
  constructor(message = "order storage is unavailable") {
    super(message);
    this.name = "OrderStorageUnavailableError";
  }
}

export function utcDay(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function hashRequestIp(ip: string, salt: string): string {
  return createHmac("sha256", salt).update(ip).digest("hex");
}

async function consumeDailyLimit(
  db: NonNullable<ReturnType<typeof getDb>>,
  ipHash: string,
  now: Date,
): Promise<void> {
  const limit = configuredOrderRateLimit(process.env.RATE_LIMIT_ORDER_PER_DAY);
  const accepted = await db
    .insert(formRateLimits)
    .values({ day: utcDay(now), ipHash, submissions: 1, updatedAt: now })
    .onConflictDoUpdate({
      target: [formRateLimits.day, formRateLimits.ipHash],
      set: {
        submissions: sql`${formRateLimits.submissions} + 1`,
        updatedAt: now,
      },
      setWhere: lt(formRateLimits.submissions, limit),
    })
    .returning({ submissions: formRateLimits.submissions });

  if (accepted.length === 0) throw new OrderRateLimitError();
}

async function cleanupExpiredRows(
  db: NonNullable<ReturnType<typeof getDb>>,
  now: Date,
): Promise<void> {
  const oldRateLimitDay = new Date(now);
  // Conserva hoy y ayer: con buckets UTC son como máximo 48 horas.
  oldRateLimitDay.setUTCDate(oldRateLimitDay.getUTCDate() - 1);

  try {
    await db.batch([
      db.delete(orders).where(lt(orders.createdAt, orderRetentionCutoff(now))),
      db.delete(formRateLimits).where(lt(formRateLimits.day, utcDay(oldRateLimitDay))),
    ]);
  } catch (error) {
    // La retención es mantenimiento: nunca convierte un pedido válido en fallo.
    console.error("No se pudieron limpiar pedidos o contadores vencidos", error);
  }
}

/**
 * Inserta cliente, pedido e ítems en UNA sentencia SQL con CTEs.
 *
 * `neon-http` no admite transacciones interactivas. Esta forma mantiene la
 * atomicidad y hace que `ON CONFLICT (id) DO NOTHING` gobierne también los ítems:
 * un reintento no puede añadir líneas a un pedido que ya existía.
 */
export async function saveOrderSubmission(
  submission: OrderSubmission,
  ip: string,
  now = new Date(),
): Promise<SaveOrderResult> {
  const db = getDb();
  if (!db) throw new OrderStorageUnavailableError("Falta DATABASE_URL");

  const existing = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, submission.id));
  if (existing.length > 0) return { created: false };

  const salt = process.env.IP_SALT || (process.env.NODE_ENV !== "production" ? "boquita-dev" : "");
  if (!salt) throw new OrderStorageUnavailableError("Falta IP_SALT");
  await consumeDailyLimit(db, hashRequestIp(ip, salt), now);

  const customerEmail = submission.marketing?.email ?? null;
  const customerName = submission.name ?? null;
  const desiredDate = submission.date ?? null;
  const zone = submission.zone ?? null;
  const notes = submission.notes ?? null;
  const consentVersion = submission.marketing?.version ?? null;
  const itemsJson = JSON.stringify(
    submission.items.map((item, position) => ({
      position,
      product_slug: item.slug,
      product_name: item.name,
      unit: item.unit,
      unit_price: item.price,
      quantity: item.qty,
    })),
  );

  const result = await db.execute<{ inserted: boolean }>(sql`
    WITH customer_upsert AS (
      INSERT INTO customers (
        email, name, marketing_opt_in, marketing_consent_at,
        marketing_consent_source, marketing_consent_version, marketing_opt_out_at,
        created_at, updated_at
      )
      SELECT
        ${customerEmail}::text, ${customerName}::text, true, ${now}::timestamptz,
        'cart', ${consentVersion}::text, NULL, ${now}::timestamptz, ${now}::timestamptz
      WHERE ${customerEmail}::text IS NOT NULL
      ON CONFLICT (email) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, customers.name),
        marketing_opt_in = true,
        marketing_consent_at = EXCLUDED.marketing_consent_at,
        marketing_consent_source = EXCLUDED.marketing_consent_source,
        marketing_consent_version = EXCLUDED.marketing_consent_version,
        marketing_opt_out_at = NULL,
        updated_at = EXCLUDED.updated_at
      RETURNING email
    ), new_order AS (
      INSERT INTO orders (
        id, customer_email, customer_name, status, desired_date, zone, notes,
        subtotal, created_at, updated_at
      ) VALUES (
        ${submission.id}::uuid,
        CASE WHEN ${customerEmail}::text IS NULL THEN NULL
             ELSE (SELECT email FROM customer_upsert) END,
        ${customerName}::text,
        'whatsapp_opened',
        ${desiredDate}::date,
        ${zone}::text,
        ${notes}::text,
        ${orderSubtotal(submission.items)},
        ${now}::timestamptz,
        ${now}::timestamptz
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    ), new_items AS (
      INSERT INTO order_items (
        order_id, position, product_slug, product_name, unit, unit_price, quantity
      )
      SELECT
        new_order.id, item.position, item.product_slug, item.product_name,
        item.unit, item.unit_price, item.quantity
      FROM new_order
      CROSS JOIN jsonb_to_recordset(${itemsJson}::jsonb) AS item(
        position integer,
        product_slug text,
        product_name text,
        unit text,
        unit_price integer,
        quantity integer
      )
      RETURNING order_id
    )
    SELECT EXISTS(SELECT 1 FROM new_order) AS inserted
  `);

  await cleanupExpiredRows(db, now);
  return { created: result.rows[0]?.inserted === true };
}
