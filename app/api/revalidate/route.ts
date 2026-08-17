import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CATALOG_CACHE_TAG } from "@/lib/db/catalog";

/**
 * Tira la caché del catálogo, para que un `db:seed` se vea al instante.
 *
 * Existe porque hasta ahora no había forma de hacerlo. `lib/db/catalog.ts`
 * envuelve la consulta en `unstable_cache` con una hora de vida y el layout raíz
 * declara `revalidate = 3600`, así que sembrar Neon NO cambiaba nada de lo
 * servido: ni en dev ni en producción, donde la única salida era redesplegar.
 * Los dos comentarios que prometían resolverlo «en la fase 3» llevaban ahí desde
 * que se montó la caché, y el panel de esa fase no existe.
 *
 * Se descubrió a lo bruto: tras sembrar tres productos nuevos, `/tienda` seguía
 * sirviendo 23 tarjetas y el filtro de la categoría recién creada salía vacío.
 * La entrada culpable estaba en `.next/cache/fetch-cache`, fechada horas antes.
 *
 * **Las dos invalidaciones hacen falta y cubren cosas distintas:**
 *
 *  · `revalidateTag` tira el `unstable_cache` del catálogo — es lo que alimenta
 *    `/tienda`, que es dinámica y no tiene caché de página.
 *  · `revalidatePath("/", "layout")` tira el ISR de todo lo que cuelga del layout
 *    raíz: portada, fichas `/tienda/[slug]`, `/sobre-nosotros` y el sitemap.
 *    Esas SÍ son páginas cacheadas, con su propio reloj, y sin esto seguirían una
 *    hora con los precios viejos aunque el catálogo ya estuviera fresco.
 *
 * La llama `scripts/seed-catalog.ts` al terminar. A mano:
 *
 *     curl -X POST "$NEXT_PUBLIC_SITE_URL/api/revalidate" \
 *          -H "Authorization: Bearer $REVALIDATE_SECRET"
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JSON_HEADERS = { "Cache-Control": "no-store" } as const;

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status, headers: JSON_HEADERS });
}

/**
 * Compara en tiempo constante. `timingSafeEqual` LANZA si los buffers miden
 * distinto, así que la longitud se compara antes: eso filtra el tamaño del
 * secreto, que es la fuga que todo el mundo acepta a cambio de no filtrar su
 * contenido carácter a carácter.
 */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  /**
   * Sin secreto configurado la ruta está APAGADA, no abierta. Un despliegue al
   * que se le olvide la variable no debe quedar con un botón de invalidar caché
   * accesible desde internet: no borra datos, pero es un modo barato de tumbar
   * el CDN a base de peticiones.
   */
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return json({ code: "revalidate_disabled" }, 503);

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!provided || !secretMatches(provided, expected)) {
    return json({ code: "unauthorized" }, 401);
  }

  revalidateTag(CATALOG_CACHE_TAG);
  revalidatePath("/", "layout");

  return json({ status: "revalidated", tag: CATALOG_CACHE_TAG }, 200);
}
