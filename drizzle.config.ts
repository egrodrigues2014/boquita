import { defineConfig } from "drizzle-kit";

/**
 * Configuración de drizzle-kit (migraciones y studio).
 *
 * Usa `DATABASE_URL_UNPOOLED` — la conexión DIRECTA, sin `-pooler` en el host.
 * PgBouncer en modo transacción no soporta estado de sesión (`SET`,
 * `LISTEN/NOTIFY`), que es justo lo que necesitan las migraciones; los propios
 * docs de Neon lo dicen: «Schema migrations → Direct». Una migración lanzada por
 * el pooler falla de formas difíciles de leer.
 *
 * Si la variable no está, se deja la cadena vacía a propósito: `db:generate` no
 * conecta a nada y tiene que funcionar en una máquina sin credencial, mientras
 * `db:migrate` y `db:studio` fallan ahí, que es lo correcto.
 */

/**
 * `.env.local` a mano: drizzle-kit no lo lee por su cuenta —eso lo hace Next— y
 * `--env-file` no se puede pasar por `NODE_OPTIONS`, que es lo que un script de
 * npm tendría a mano. `process.loadEnvFile` es de Node, sin dependencias.
 * Duplicado en `scripts/seed-catalog.ts` por el mismo motivo.
 */
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // No existe: es el caso normal en CI y en un clon recién hecho.
  }
}
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
    // Neon exige TLS. Explícito porque el `sslmode=require` de la cadena lo
    // interpretan distinto según el driver.
    ssl: "require",
  },
  // Pide confirmación antes de aplicar algo destructivo, y explica qué SQL va a
  // ejecutar. Con un catálogo real detrás, esto no es opcional.
  strict: true,
  verbose: true,
});
