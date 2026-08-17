import { NextResponse } from "next/server";
import { isAnalyticsEnabled } from "@/lib/analytics";
import { isSiteIndexable } from "@/lib/seo";

/** ⚠ ANDAMIO TEMPORAL. La hermana de `diag-entorno`, pero por petición. Ver allí el motivo. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      momento: "runtime",
      vercel: process.env.VERCEL ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      vercelTargetEnv: process.env.VERCEL_TARGET_ENV ?? null,
      gitRef: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      siteLaunchedEsTrue: process.env.SITE_LAUNCHED === "true",
      isAnalyticsEnabled: isAnalyticsEnabled(),
      isSiteIndexable: isSiteIndexable(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
