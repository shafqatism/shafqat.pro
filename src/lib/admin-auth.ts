import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Verifies a Supabase access token from the Authorization header and requires app_metadata.role = "admin". */
export async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await supabase.auth.getUser(token);
  return data.user?.app_metadata?.role === "admin" ? data.user : null;
}
