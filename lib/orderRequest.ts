export function requestIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    headers.get("cf-connecting-ip")?.trim() ||
    forwarded ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function isAllowedOrderOrigin(
  origin: string | null,
  requestUrl: string,
  configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL,
): boolean {
  if (!origin) return false;
  const allowed = new Set([new URL(requestUrl).origin]);
  if (configuredSiteUrl) {
    try {
      allowed.add(new URL(configuredSiteUrl).origin);
    } catch {
      // Una configuración inválida no amplía los orígenes permitidos.
    }
  }
  return allowed.has(origin);
}
