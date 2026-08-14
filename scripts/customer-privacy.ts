import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { customers, orders } from "@/lib/db/schema";
import { normalizeEmail } from "@/lib/orderSubmission";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Un clon sin credenciales debe fallar abajo con un mensaje útil.
  }
}

const [command, rawEmail, confirmation] = process.argv.slice(2);
const email = rawEmail ? normalizeEmail(rawEmail) : "";

function usage(): never {
  console.error(
    "Uso:\n" +
      "  npm run customer:privacy -- optout correo@ejemplo.com\n" +
      "  npm run customer:privacy -- delete correo@ejemplo.com --confirm",
  );
  process.exit(1);
}

if (!email || !email.includes("@") || !["optout", "delete"].includes(command ?? "")) usage();
if (command === "delete" && confirmation !== "--confirm") usage();

const db = getDb();
if (!db) {
  console.error("Falta DATABASE_URL en .env.local o .env.");
  process.exit(1);
}

if (command === "optout") {
  const changed = await db
    .update(customers)
    .set({ marketingOptIn: false, marketingOptOutAt: new Date(), updatedAt: new Date() })
    .where(eq(customers.email, email))
    .returning({ email: customers.email });

  if (changed.length === 0) {
    console.error(`No existe un cliente con el correo ${email}.`);
    process.exitCode = 2;
  } else {
    console.log(`Promociones desactivadas para ${email}.`);
  }
} else {
  const [deletedOrders, deletedCustomers] = await db.batch([
    db.delete(orders).where(eq(orders.customerEmail, email)).returning({ id: orders.id }),
    db.delete(customers).where(eq(customers.email, email)).returning({ email: customers.email }),
  ]);

  if (deletedCustomers.length === 0) {
    console.error(`No existe un cliente con el correo ${email}.`);
    process.exitCode = 2;
  } else {
    console.log(`Datos eliminados para ${email}: ${deletedOrders.length} pedidos y 1 cliente.`);
  }
}
