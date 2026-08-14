import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { MARKETING_CONSENT_VERSION } from "@/lib/orderSubmission";

const mocks = vi.hoisted(() => {
  class RateError extends Error {}
  class StorageError extends Error {}
  return { save: vi.fn(), RateError, StorageError };
});

vi.mock("@/lib/db/orderSubmissions", () => ({
  saveOrderSubmission: mocks.save,
  OrderRateLimitError: mocks.RateError,
  OrderStorageUnavailableError: mocks.StorageError,
}));

const { POST } = await import("@/app/api/orders/route");

function payload() {
  return {
    id: "5e663181-962d-43ae-b763-c4c4ed7f6228",
    name: "Ana",
    marketing: {
      email: "ana@example.com",
      consent: true,
      version: MARKETING_CONSENT_VERSION,
    },
    items: [{ slug: "brigadeiros", name: "Brigadeiros", unit: "12 unidades", price: 5000, qty: 1 }],
    website: "",
  };
}

function request(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("https://boquita.cr/api/orders", {
    method: "POST",
    headers: {
      origin: "https://boquita.cr",
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.9, 10.0.0.1",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  mocks.save.mockReset();
  vi.restoreAllMocks();
});

describe("POST /api/orders", () => {
  it("responde 201 al crear y entrega al almacenamiento la IP inmediata", async () => {
    mocks.save.mockResolvedValue({ created: true });
    const response = await POST(request(payload()));
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ status: "saved" });
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ name: "Ana" }), "203.0.113.9");
  });

  it("responde 200 a un UUID idempotente ya guardado", async () => {
    mocks.save.mockResolvedValue({ created: false });
    const response = await POST(request(payload()));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "already_saved" });
  });

  it("rechaza origen, cuerpo y contrato inválidos", async () => {
    expect((await POST(request(payload(), { origin: "https://evil.example" }))).status).toBe(403);
    expect((await POST(request({ ...payload(), website: "spam" }))).status).toBe(400);
    expect(
      (
        await POST(
          new NextRequest("https://boquita.cr/api/orders", {
            method: "POST",
            headers: { origin: "https://boquita.cr", "content-type": "text/plain" },
            body: "x",
          }),
        )
      ).status,
    ).toBe(415);
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("distingue límite y almacenamiento no disponible sin filtrar detalles", async () => {
    mocks.save.mockRejectedValueOnce(new mocks.RateError());
    expect((await POST(request(payload()))).status).toBe(429);

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.save.mockRejectedValueOnce(new mocks.StorageError("secret connection detail"));
    const response = await POST(request(payload()));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ code: "storage_unavailable" });
  });
});
