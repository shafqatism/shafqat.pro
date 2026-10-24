"use client";

import { CheckCircle2, Circle, Loader2, Save, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Btn, FieldRow, inputClass, PageHeader, Panel, textareaClass } from "@/components/admin/ui";
import { useSiteSettings } from "@/components/admin/use-settings";
import type { TrackingSettings } from "@/lib/settings";
import { adminTool, supabaseBrowser } from "@/lib/supabase/browser";

type SecretField = { key: string; label: string; hint?: string; multiline?: boolean; secret?: boolean };
type SecretGroup = { id: string; title: string; description: string; test?: string; fields: SecretField[] };

const groups: SecretGroup[] = [
  {
    id: "email",
    title: "Business email",
    description: "Lead and booking notifications plus auto-replies. Use Resend (recommended) or your mailbox's SMTP on port 465.",
    test: "test_email",
    fields: [
      { key: "notify_email", label: "Send notifications to", hint: "Defaults to the contact email in Settings", secret: false },
      { key: "email_from", label: "From address", hint: 'e.g. Shafqat Rasool <info@shafqat.pro> — domain must be verified with your provider', secret: false },
      { key: "resend_api_key", label: "Resend API key", hint: "resend.com → API Keys (verify shafqat.pro under Domains)" },
      { key: "smtp_host", label: "SMTP host", hint: "e.g. smtp.gmail.com / smtp.zoho.com / smtp.hostinger.com", secret: false },
      { key: "smtp_port", label: "SMTP port", hint: "465 (SSL). Ports 25 & 587 are blocked on Supabase Edge Functions.", secret: false },
      { key: "smtp_user", label: "SMTP username", secret: false },
      { key: "smtp_pass", label: "SMTP password / app password" },
    ],
  },
  {
    id: "calendar",
    title: "Google Calendar",
    description: "Creates events for every booking and blocks times you're busy. OAuth mode also invites the client and adds a Google Meet link.",
    test: "test_calendar",
    fields: [
      { key: "google_calendar_id", label: "Calendar ID", hint: "Usually your Gmail / Workspace address, or 'primary' with OAuth", secret: false },
      { key: "google_client_id", label: "OAuth client ID", secret: false },
      { key: "google_client_secret", label: "OAuth client secret" },
      { key: "google_refresh_token", label: "OAuth refresh token", hint: "Scope: https://www.googleapis.com/auth/calendar (get one via OAuth Playground)" },
      { key: "google_service_account_json", label: "…or service account JSON", hint: "Share your calendar with the service account email (Make changes to events)", multiline: true },
      { key: "default_meeting_link", label: "Fallback meeting link", hint: "Used when no Meet link is generated (e.g. your Zoom room)", secret: false },
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp Cloud API",
    description: "Instant WhatsApp alerts for new leads and bookings (Meta Business → WhatsApp → API Setup).",
    test: "test_whatsapp",
    fields: [
      { key: "whatsapp_token", label: "Permanent access token" },
      { key: "whatsapp_phone_number_id", label: "Phone number ID", secret: false },
      { key: "whatsapp_notify_to", label: "Notify this number", hint: "International format, e.g. 923045101870", secret: false },
      { key: "whatsapp_template", label: "Template name (optional)", hint: "Approved template with one {{1}} body variable — needed outside the 24h window", secret: false },
      { key: "whatsapp_template_lang", label: "Template language", hint: "e.g. en or en_US", secret: false },
    ],
  },
  {
    id: "meta",
    title: "Meta Conversions API",
    description: "Server-side Lead and Schedule events for Facebook & Instagram ads, deduplicated with the browser pixel.",
    fields: [
      { key: "meta_capi_token", label: "Conversions API access token", hint: "Events Manager → your pixel → Settings → Generate access token" },
      { key: "meta_test_event_code", label: "Test event code (optional)", hint: "Remove after testing", secret: false },
    ],
  },
];

const trackingFields: { key: keyof TrackingSettings; label: string; hint: string }[] = [
  { key: "gtmId", label: "Google Tag Manager ID", hint: "GTM-XXXXXXX" },
  { key: "ga4Id", label: "Google Analytics 4 ID", hint: "G-XXXXXXXXXX" },
  { key: "googleAdsId", label: "Google Ads ID", hint: "AW-XXXXXXXXX" },
  { key: "googleAdsLeadLabel", label: "Google Ads lead conversion label", hint: "From the conversion action's tag setup" },
  { key: "googleAdsBookingLabel", label: "Google Ads booking conversion label", hint: "Separate conversion for booked meetings" },
  { key: "metaPixelId", label: "Meta (Facebook / Instagram) Pixel ID", hint: "Numbers only" },
  { key: "googleSiteVerification", label: "Google Search Console verification", hint: "content value of the google-site-verification meta tag" },
  { key: "bingSiteVerification", label: "Bing Webmaster verification", hint: "msvalidate.01 content value" },
  { key: "facebookDomainVerification", label: "Facebook domain verification", hint: "facebook-domain-verification content value" },
];

// Only key names are read back for secrets; plain settings (hosts, IDs, addresses) are shown for editing.
async function fetchKeys() {
  const db = supabaseBrowser();
  const plainKeys = groups.flatMap((g) => g.fields.filter((f) => f.secret === false).map((f) => f.key));
  const [{ data: keys }, { data: plain }] = await Promise.all([
    db.from("integration_secrets").select("key"),
    db.from("integration_secrets").select("key,value").in("key", plainKeys),
  ]);
  return {
    keys: new Set((keys ?? []).map((r) => r.key as string)),
    plain: Object.fromEntries((plain ?? []).map((r) => [r.key as string, r.value as string])),
  };
}

export default function IntegrationsPage() {
  const { settings, setSettings, save, saving } = useSiteSettings();
  const [configured, setConfigured] = useState<Set<string>>(new Set());
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const loadKeys = useCallback(
    () =>
      fetchKeys().then(({ keys, plain }) => {
        setConfigured(keys);
        setValues((v) => ({ ...plain, ...v }));
      }),
    [],
  );

  useEffect(() => {
    fetchKeys().then(({ keys, plain }) => {
      setConfigured(keys);
      setValues((v) => ({ ...plain, ...v }));
    });
  }, []);

  async function saveGroup(group: SecretGroup) {
    const entries = group.fields.map((f) => [f.key, values[f.key]] as const).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return toast.info("Nothing changed");
    setBusy(group.id);
    const db = supabaseBrowser();
    const upserts = entries.filter(([, v]) => v.trim() !== "").map(([key, value]) => ({ key, value: value.trim() }));
    const deletes = entries.filter(([, v]) => v.trim() === "").map(([key]) => key);
    const results = await Promise.all([
      upserts.length ? db.from("integration_secrets").upsert(upserts) : Promise.resolve({ error: null }),
      deletes.length ? db.from("integration_secrets").delete().in("key", deletes) : Promise.resolve({ error: null }),
    ]);
    setBusy(null);
    const err = results.find((r) => r.error)?.error;
    if (err) return toast.error(err.message);
    setValues((v) => Object.fromEntries(Object.entries(v).filter(([k]) => !group.fields.some((f) => f.key === k))));
    await loadKeys();
    toast.success(`${group.title} saved`);
  }

  async function test(group: SecretGroup) {
    if (!group.test) return;
    setBusy(`${group.id}-test`);
    try {
      const res = await adminTool<{ ok: boolean; error?: string; via?: string; mode?: string; busyNext7Days?: number; to?: string }>(group.test);
      if (res.ok) toast.success(group.test === "test_calendar" ? `Connected (${res.mode}) — ${res.busyNext7Days} busy blocks in the next 7 days` : `Sent via ${res.via}${res.to ? ` to ${res.to}` : ""}`);
      else toast.error(res.error ?? "Test failed");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageHeader title="Integrations" description="Ads tracking, business email, Google Calendar, WhatsApp, and Meta Conversions API." />

      {settings && (
        <Panel
          title="Ads & analytics tracking"
          description="Loaded on every public page. Lead and booking conversions fire automatically for Google Ads, GA4, GTM and the Meta Pixel."
          className="mb-6"
          actions={<Btn onClick={() => save({ tracking: settings.tracking })} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save</Btn>}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trackingFields.map((f) => (
              <FieldRow key={f.key} label={f.label} hint={f.hint}>
                <input
                  className={inputClass}
                  value={settings.tracking[f.key] ?? ""}
                  onChange={(e) => setSettings({ ...settings, tracking: { ...settings.tracking, [f.key]: e.target.value.trim() } })}
                />
              </FieldRow>
            ))}
          </div>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((group) => {
          const done = group.fields.filter((f) => configured.has(f.key)).length;
          return (
            <Panel
              key={group.id}
              title={group.title}
              description={group.description}
              actions={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 whitespace-nowrap">{done}/{group.fields.length} set</span>}
            >
              <div className="grid gap-4">
                {group.fields.map((f) => (
                  <FieldRow
                    key={f.key}
                    label={f.label}
                    hint={
                      <span className="flex items-center gap-1.5">
                        {configured.has(f.key) ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Circle className="size-3.5 text-slate-300" />}
                        {configured.has(f.key) ? "Saved — type to replace, or clear and save to remove." : f.hint ?? "Not set"}
                        {configured.has(f.key) && f.hint ? ` ${f.hint}` : ""}
                      </span>
                    }
                  >
                    {f.multiline ? (
                      <textarea className={textareaClass} rows={3} placeholder={configured.has(f.key) ? "•••••••• (saved)" : ""} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                    ) : (
                      <input
                        className={inputClass}
                        type={f.secret === false ? "text" : "password"}
                        autoComplete="off"
                        placeholder={configured.has(f.key) ? "•••••••• (saved)" : ""}
                        value={values[f.key] ?? ""}
                        onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                      />
                    )}
                  </FieldRow>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Btn onClick={() => saveGroup(group)} disabled={busy === group.id}>{busy === group.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save</Btn>
                  {group.test && (
                    <Btn variant="ghost" onClick={() => test(group)} disabled={busy === `${group.id}-test`}>
                      {busy === `${group.id}-test` ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send test
                    </Btn>
                  )}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
