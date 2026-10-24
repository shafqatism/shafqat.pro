import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const ALLOWED = new Set(["settings", "seo"]);

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Refreshes cached settings / SEO. Authorized by either:
 *  - x-site-secret (Supabase automation function), or
 *  - Authorization: Bearer <admin access token> (admin dashboard).
 */
export async function POST(req: Request) {
  const secret = process.env.SITE_FUNCTIONS_SECRET ?? "";
  const headerSecret = req.headers.get("x-site-secret") ?? "";
  let authorized = Boolean(secret && headerSecret && safeEqual(secret, headerSecret));

  if (!authorized) {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (token) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await supabase.auth.getUser(token);
      authorized = data.user?.app_metadata?.role === "admin";
    }
  }
  if (!authorized) return Response.json({ revalidated: false, error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { tags?: string[] };
  const tags = (body.tags ?? ["settings", "seo"]).filter((t) => ALLOWED.has(t));
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ revalidated: true, tags, now: Date.now() });
}
