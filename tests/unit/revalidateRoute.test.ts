import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * La ruta que hace que un `db:seed` se vea al instante.
 *
 * Lo que se protege aquí no es la respuesta HTTP sino las DOS llamadas a
 * `next/cache`: si alguien quitara `revalidatePath`, la portada y las fichas
 * seguirían una hora con los precios viejos aunque `/tienda` ya estuviera
 * fresca, y el síntoma sería «unas páginas sí y otras no» — de los peores de
 * diagnosticar. Por eso se afirman las dos por separado.
 */

const mocks = vi.hoisted(() => ({ revalidateTag: vi.fn(), revalidatePath: vi.fn() }));

vi.mock("next/cache", () => ({
  revalidateTag: mocks.revalidateTag,
  revalidatePath: mocks.revalidatePath,
  // `lib/db/catalog.ts` lo importa al cargarse; devuelve la función tal cual.
  unstable_cache: (fn: unknown) => fn,
}));

const { POST } = await import("@/app/api/revalidate/route");

const SECRET = "un-secreto-de-prueba";

function request(authorization?: string) {
  return new NextRequest("https://boquitacostarica.com/api/revalidate", {
    method: "POST",
    headers: authorization ? { authorization } : {},
  });
}

beforeEach(() => {
  process.env.REVALIDATE_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.REVALIDATE_SECRET;
  mocks.revalidateTag.mockReset();
  mocks.revalidatePath.mockReset();
});

describe("POST /api/revalidate", () => {
  it("con el secreto correcto invalida el catálogo Y el ISR del layout", async () => {
    const response = await POST(request(`Bearer ${SECRET}`));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "revalidated", tag: "catalog" });
    expect(mocks.revalidateTag).toHaveBeenCalledWith("catalog");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("sin secreto configurado está APAGADA, no abierta", async () => {
    // Un despliegue al que se le olvide la variable no debe quedar con un botón
    // de invalidar caché accesible desde internet.
    delete process.env.REVALIDATE_SECRET;

    const response = await POST(request(`Bearer ${SECRET}`));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ code: "revalidate_disabled" });
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rechaza la cabecera ausente, el esquema equivocado y el secreto que no es", async () => {
    // El de longitud distinta importa aparte: `timingSafeEqual` LANZA si los
    // buffers no miden lo mismo, así que sin el guardia de longitud esto sería
    // un 500 en vez de un 401.
    for (const authorization of [
      undefined,
      "Bearer ",
      `Basic ${SECRET}`,
      SECRET,
      "Bearer no-es-el-secreto-y-mide-otra-cosa",
      `Bearer ${"x".repeat(SECRET.length)}`,
    ]) {
      const response = await POST(request(authorization));

      expect(response.status, `debería rechazar: ${authorization ?? "(sin cabecera)"}`).toBe(401);
      await expect(response.json()).resolves.toEqual({ code: "unauthorized" });
    }

    expect(mocks.revalidateTag).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("no se cachea a sí misma", async () => {
    const response = await POST(request(`Bearer ${SECRET}`));
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
