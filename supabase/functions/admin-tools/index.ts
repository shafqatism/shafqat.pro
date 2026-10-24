// Admin-only helpers called from the dashboard with the signed-in admin's JWT.
// Actions: test_email, test_whatsapp, test_calendar, cancel_booking, create_token.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { admin, corsHeaders, json, logActivity, secret, sha256Hex, siteSettings } from "../_shared/core.ts";
import { busyIntervals, cancelCalendarEvent, googleToken } from "../_shared/google.ts";
import { sendEmail, sendWhatsApp } from "../_shared/notify.ts";

async function requireAdmin(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await admin().auth.getUser(token);
  if (error || data.user?.app_metadata?.role !== "admin") return null;
  return data.user;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const user = await requireAdmin(req);
  if (!user) return json({ error: "Admins only" }, 403);

  try {
    const body = await req.json();
    switch (body?.action) {
      case "test_email": {
        const settings = await siteSettings();
        const to = (await secret("notify_email")) || settings.contactEmail;
        const via = await sendEmail({ to, subject: "shafqat.pro test email", html: "<p>Your business email integration works.</p>" });
        return json({ ok: Boolean(via), via, to, error: via ? undefined : "No email provider configured" });
      }
      case "test_whatsapp": {
        const via = await sendWhatsApp("✅ shafqat.pro WhatsApp integration works.");
        return json({ ok: Boolean(via), via, error: via ? undefined : "WhatsApp is not configured" });
      }
      case "test_calendar": {
        const auth = await googleToken();
        if (!auth) return json({ ok: false, error: "Google Calendar is not configured" });
        const busy = await busyIntervals(new Date(), new Date(Date.now() + 7 * 86400_000));
        return json({ ok: true, mode: auth.mode, busyNext7Days: busy.length });
      }
      case "cancel_booking": {
        const { data, error } = await admin().from("bookings").update({ status: "cancelled" }).eq("id", body.id).select("*").single();
        if (error) throw error;
        const calendar = data.google_event_id ? await cancelCalendarEvent(data.google_event_id).catch(() => false) : false;
        await logActivity("booking", `Booking cancelled by admin`, { booking_id: data.id });
        return json({ ok: true, calendar });
      }
      case "create_token": {
        const name = String(body.name ?? "Claude automation").slice(0, 80);
        const scopes = body.readOnly ? ["read"] : ["read", "write"];
        const raw = crypto.getRandomValues(new Uint8Array(24));
        const token = "sp_" + [...raw].map((b) => b.toString(16).padStart(2, "0")).join("");
        const { error } = await admin().from("automation_tokens").insert({ name, scopes, token_hash: await sha256Hex(token) });
        if (error) throw error;
        await logActivity("automation", `Automation token "${name}" created`);
        return json({ ok: true, token });
      }
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500);
  }
});
