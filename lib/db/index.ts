import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * El ÚNICO sitio del proyecto que construye un cliente de base de datos.
 *
 * Está así por portabilidad, y es un requisito explícito del README: Vercel
 * Hobby prohíbe el uso comercial y esto es una tienda, así que mudarse a
 * Cloudflare Pages tiene que ser cuestión de días. Con todo el acceso detrás de
 * `lib/db`, cambiar de proveedor es cambiar este archivo.
 *
 * Driver HTTP (`neon-http`), no TCP: cada consulta es un `fetch`, sin sockets ni
 * pool que mantener vivo entre invocaciones. Es lo que corresponde a una función
 * serverless — un pool TCP en un entorno que se congela entre peticiones acaba
 * agotando conexiones. Las migraciones sí van por TCP, pero eso lo hace
 * drizzle-kit con `DATABASE_URL_UNPOOLED` (ver `drizzle.config.ts`).
 *
 * `DATABASE_URL` no lleva prefijo `NEXT_PUBLIC_`, así que Next nunca la inserta
 * en el bundle del cliente: en un componente de cliente vale `undefined`. Este
 * módulo, de todos modos, sólo lo importan Server Components y scripts de Node.
 */

type Db = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Cliente memoizado por cadena de conexión. Se crea al primer uso y no al
 * importar: así los tests pueden cambiar `process.env` sin pelearse con el orden
 * de los imports, y una página que no toca la base no paga nada.
 */
let cached: { url: string; db: Db } | undefined;

/**
 * Devuelve el cliente, o `null` si no hay `DATABASE_URL`.
 *
 * `null` no es un error: es el modo en que corre CI, una máquina recién clonada
 * y `npm run dev` antes de que exista `.env.local`. Quien llame decide qué hacer
 * — en la práctica, `lib/db/catalog.ts` cae al catálogo de `content/`.
 */
export function getDb(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (cached?.url !== url) cached = { url, db: drizzle(neon(url), { schema }) };
  return cached.db;
}
