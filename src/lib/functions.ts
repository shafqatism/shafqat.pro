import "server-only";

/**
 * Calls the `public-forms` Supabase Edge Function from the Next.js server.
 * The shared secret never reaches the browser.
 */
export async function callPublicForms(body: Record<string, unknown>, req?: Request) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/public-forms`;
  const ip = req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req?.headers.get("user-agent") ?? null;
  const tracking = typeof body.tracking === "object" && body.tracking ? { ...(body.tracking as object), ip, userAgent } : undefined;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-site-secret": process.env.SITE_FUNCTIONS_SECRET ?? "",
      apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    },
    body: JSON.stringify(tracking ? { ...body, tracking } : body),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({ ok: false, error: "Unexpected response" }));
  return { status: res.status, data };
}

// Minimal in-memory rate limit per IP (per server instance) to blunt form spam.
const hits = new Map<string, number[]>();
export function rateLimited(req: Request, limit = 8, windowMs = 10 * 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}
