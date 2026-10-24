// Automation API for Claude (or any agent/workflow tool) to operate the website.
// Auth: `Authorization: Bearer <automation token>` created in Admin → Automation.
//
//   GET    /automation/stats
//   GET    /automation/settings              PATCH /automation/settings      { data: {...partial} }
//   GET    /automation/seo                   PUT   /automation/seo           { path, title, description, keywords, og_image, noindex }
//   GET    /automation/leads?status=new      PATCH /automation/leads/:id     { status, notes }
//   GET    /automation/bookings?from=ISO     PATCH /automation/bookings/:id  { status }
//   GET    /automation/activity
//   POST   /automation/revalidate            { tags?: string[] }
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "npm:zod@3.23.8";
import { admin, corsHeaders, json, logActivity, revalidateSite, sha256Hex } from "../_shared/core.ts";
import { cancelCalendarEvent } from "../_shared/google.ts";

const seoSchema = z.object({
  path: z.string().startsWith("/").max(200),
  title: z.string().max(120).nullable().optional(),
  description: z.string().max(320).nullable().optional(),
  keywords: z.array(z.string().max(80)).max(40).optional(),
  og_image: z.string().max(500).nullable().optional(),
  noindex: z.boolean().optional(),
});

async function authorize(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token.startsWith("sp_")) return null;
  const hash = await sha256Hex(token);
  const { data } = await admin().from("automation_tokens").select("id,name,scopes").eq("token_hash", hash).maybeSingle();
  if (!data) return null;
  await admin().from("automation_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return data as { id: string; name: string; scopes: string[] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const caller = await authorize(req);
  if (!caller) return json({ error: "Unauthorized" }, 401);

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("automation");
  const [resource, id] = parts.slice(idx + 1);
  const write = req.method !== "GET";
  if (write && !caller.scopes.includes("write")) return json({ error: "Token is read-only" }, 403);
  const db = admin();

  try {
    switch (`${req.method} ${resource ?? ""}`) {
      case "GET stats": {
        const since = new Date(Date.now() - 30 * 86400_000).toISOString();
        const [leads, newLeads, bookings, upcoming] = await Promise.all([
          db.from("contacts").select("id", { count: "exact", head: true }).gte("created_at", since),
          db.from("contacts").select("id", { count: "exact", head: true }).eq("status", "new"),
          db.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", since),
          db.from("bookings").select("id", { count: "exact", head: true }).eq("status", "confirmed").gte("start_at", new Date().toISOString()),
        ]);
        return json({ leads_30d: leads.count, leads_new: newLeads.count, bookings_30d: bookings.count, bookings_upcoming: upcoming.count });
      }
      case "GET settings": {
        const { data } = await db.from("site_settings").select("data,updated_at").eq("id", 1).single();
        return json(data);
      }
      case "PATCH settings": {
        const body = z.object({ data: z.record(z.unknown()) }).parse(await req.json());
        const { data: current } = await db.from("site_settings").select("data").eq("id", 1).single();
        const merged = { ...(current?.data ?? {}) } as Record<string, unknown>;
        for (const [k, v] of Object.entries(body.data)) {
          const prev = merged[k];
          merged[k] = v && typeof v === "object" && !Array.isArray(v) && prev && typeof prev === "object" && !Array.isArray(prev) ? { ...prev, ...v } : v;
        }
        const { data, error } = await db.from("site_settings").update({ data: merged }).eq("id", 1).select("data,updated_at").single();
        if (error) throw error;
        await logActivity("automation", `Settings updated by token "${caller.name}"`, { keys: Object.keys(body.data) });
        const revalidated = await revalidateSite(["settings", "seo"]);
        return json({ ...data, revalidated });
      }
      case "GET seo": {
        const { data } = await db.from("page_seo").select("*").order("path");
        return json(data);
      }
      case "PUT seo": {
        const body = seoSchema.parse(await req.json());
        const { data, error } = await db.from("page_seo").upsert(body).select("*").single();
        if (error) throw error;
        await logActivity("automation", `SEO updated for ${body.path} by "${caller.name}"`);
        const revalidated = await revalidateSite(["seo"]);
        return json({ ...data, revalidated });
      }
      case "GET leads": {
        let q = db.from("contacts").select("*").order("created_at", { ascending: false }).limit(Number(url.searchParams.get("limit") ?? 50));
        const status = url.searchParams.get("status");
        if (status) q = q.eq("status", status);
        const { data } = await q;
        return json(data);
      }
      case "PATCH leads": {
        const body = z.object({ status: z.enum(["new", "contacted", "qualified", "won", "lost", "spam"]).optional(), notes: z.string().max(5000).optional() }).parse(await req.json());
        const { data, error } = await db.from("contacts").update(body).eq("id", id).select("*").single();
        if (error) throw error;
        return json(data);
      }
      case "GET bookings": {
        const from = url.searchParams.get("from") ?? new Date(Date.now() - 7 * 86400_000).toISOString();
        const { data } = await db.from("bookings").select("*").gte("start_at", from).order("start_at").limit(200);
        return json(data);
      }
      case "PATCH bookings": {
        const body = z.object({ status: z.enum(["pending", "confirmed", "cancelled", "completed", "no_show"]) }).parse(await req.json());
        const { data, error } = await db.from("bookings").update(body).eq("id", id).select("*").single();
        if (error) throw error;
        if (body.status === "cancelled" && data.google_event_id) await cancelCalendarEvent(data.google_event_id).catch(() => false);
        return json(data);
      }
      case "GET activity": {
        const { data } = await db.from("activity_log").select("*").order("created_at", { ascending: false }).limit(100);
        return json(data);
      }
      case "POST revalidate": {
        const body = z.object({ tags: z.array(z.string()).optional() }).parse(await req.json().catch(() => ({})));
        return json({ revalidated: await revalidateSite(body.tags ?? ["settings", "seo"]) });
      }
      default:
        return json({ error: "Not found", resources: ["stats", "settings", "seo", "leads", "bookings", "activity", "revalidate"] }, 404);
    }
  } catch (e) {
    if (e instanceof z.ZodError) return json({ error: "Invalid body", issues: e.flatten() }, 422);
    console.error(e);
    return json({ error: (e as Error).message ?? "Server error" }, 500);
  }
});
