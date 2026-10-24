"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Browser Supabase client for the admin dashboard (session kept in localStorage; RLS enforces admin access). */
export function supabaseBrowser() {
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "sp-admin-auth" },
  });
  return client;
}

/** Calls one of this site's admin API routes with the signed-in admin's access token. */
export async function adminApi<T = unknown>(path: string, body: unknown): Promise<T> {
  const { data } = await supabaseBrowser().auth.getSession();
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json as T;
}

/** Refreshes the public site's cached settings / SEO after an admin change. */
export function revalidateSite(tags: ("settings" | "seo")[]) {
  return adminApi<{ revalidated: boolean }>("/api/revalidate", { tags });
}

/** Invokes the admin-tools Supabase Edge Function. */
export async function adminTool<T = Record<string, unknown>>(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabaseBrowser().functions.invoke("admin-tools", { body: { action, ...payload } });
  if (error) throw error;
  return data as T;
}
