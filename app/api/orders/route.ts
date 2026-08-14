import { NextRequest, NextResponse } from "next/server";
import {
  OrderRateLimitError,
  OrderStorageUnavailableError,
  saveOrderSubmission,
} from "@/lib/db/orderSubmissions";
import { isAllowedOrderOrigin, requestIp } from "@/lib/orderRequest";
import { orderSubmissionSchema } from "@/lib/orderSubmission";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JSON_HEADERS = { "Cache-Control": "no-store" } as const;
const MAX_BODY_BYTES = 64 * 1024;

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, { status, headers: JSON_HEADERS });
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrderOrigin(request.headers.get("origin"), request.url)) {
    return json({ code: "forbidden_origin" }, 403);
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ code: "unsupported_media_type" }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return json({ code: "payload_too_large" }, 413);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ code: "invalid_json" }, 400);
  }

  const parsed = orderSubmissionSchema.safeParse(raw);
  if (!parsed.success) return json({ code: "invalid_order" }, 400);

  try {
    const result = await saveOrderSubmission(parsed.data, requestIp(request.headers));
    return json({ status: result.created ? "saved" : "already_saved" }, result.created ? 201 : 200);
  } catch (error) {
    if (error instanceof OrderRateLimitError) return json({ code: "rate_limited" }, 429);
    if (error instanceof OrderStorageUnavailableError) {
      console.error("No se pudo guardar el pedido", error.message);
      return json({ code: "storage_unavailable" }, 503);
    }
    console.error("Fallo inesperado al guardar el pedido", error);
    return json({ code: "storage_unavailable" }, 503);
  }
}
