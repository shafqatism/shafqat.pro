// Shared helpers for shafqat.pro edge functions.
// Secrets are read from public.integration_secrets (managed in the admin dashboard)
// and fall back to Edge Function env vars of the same name in UPPER_CASE.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-site-secret",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

let adminClient: SupabaseClient | null = null;
export function admin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

let secretCache: { at: number; values: Record<string, string> } | null = null;
export async function secrets(): Promise<Record<string, string>> {
  if (secretCache && Date.now() - secretCache.at < 30_000) return secretCache.values;
  const { data, error } = await admin().from("integration_secrets").select("key,value");
  if (error) throw error;
  const values: Record<string, string> = {};
  for (const row of data ?? []) values[row.key] = row.value;
  secretCache = { at: Date.now(), values };
  return values;
}

export async function secret(key: string): Promise<string | undefined> {
  const values = await secrets();
  return values[key] || Deno.env.get(key.toUpperCase()) || undefined;
}

export type BookingSettings = {
  timezone: string;
  slotMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
  workingDays: number[];
  startHour: number;
  endHour: number;
  meetingTypes: string[];
};

export type SiteSettings = {
  siteName: string;
  siteUrl: string;
  contactEmail: string;
  whatsapp: string;
  tracking?: { metaPixelId?: string };
  booking: BookingSettings;
};

export async function siteSettings(): Promise<SiteSettings> {
  const { data, error } = await admin().from("site_settings").select("data").eq("id", 1).single();
  if (error) throw error;
  return data.data as SiteSettings;
}

export async function logActivity(kind: string, message: string, meta: Record<string, unknown> = {}) {
  await admin().from("activity_log").insert({ kind, message, meta });
}

/** Checks the shared secret the Next.js server sends on every forwarded request. */
export async function verifySiteSecret(req: Request) {
  const expected = await secret("site_functions_secret");
  const got = req.headers.get("x-site-secret");
  return Boolean(expected && got && timingSafeEqual(expected, got));
}

export function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function sha256Hex(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Asks the Next.js site to refresh its cached settings / SEO after a change. */
export async function revalidateSite(tags: string[]) {
  const settings = await siteSettings();
  const siteSecret = await secret("site_functions_secret");
  if (!settings.siteUrl || !siteSecret) return false;
  try {
    const res = await fetch(new URL("/api/revalidate", settings.siteUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-site-secret": siteSecret },
      body: JSON.stringify({ tags }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
