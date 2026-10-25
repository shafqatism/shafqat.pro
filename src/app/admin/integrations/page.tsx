"use client";

import { BarChart3, CalendarDays, CheckCircle2, Circle, Loader2, Mail, Save, Send, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WhatsappIcon } from "@/components/site/icons";
import { Btn, FieldRow, inputClass, PageHeader, Panel, TabBar, textareaClass, useHashTab, type TabDef } from "@/components/admin/ui";
import { useSiteSettings } from "@/components/admin/use-settings";
import type { TrackingSettings } from "@/lib/settings";
import { adminTool, supabaseBrowser } from "@/lib/supabase/browser";

type SecretField = { key: string; label: string; hint?: string; multiline?: boolean; secret?: boolean };
type SecretGroup = {
  id: "email" | "calendar" | "whatsapp" | "meta";
  title: string;
  description: string;
  test?: string;
  /** the service counts as connected when every key in one of these sets is saved */
  connected: string[][];
  steps: string[];
  fields: SecretField[];
};

const groups: SecretGroup[] = [
  {
    id: "email",
    title: "Business email",
    description: "Lead and booking notifications plus automatic replies to your clients.",
    test: "test_email",
    connected: [["resend_api_key"], ["smtp_host", "smtp_user", "smtp_pass"]],
    steps: [
      "Easiest: create a Resend account and verify shafqat.pro under Domains, then paste an API key.",
      "Or use your mailbox's SMTP details. Only port 465 works from Supabase (ports 25 and 587 are blocked).",
      "Click “Send test” to confirm an email reaches your inbox.",
    ],
    fields: [
      { key: "notify_email", label: "Send notifications to", hint: "Defaults to the contact email in Settings", secret: false },
      { key: "email_from", label: "From address", hint: "e.g. Shafqat Rasool <info@shafqat.pro>. The domain must be verified with your provider", secret: false },
      { key: "resend_api_key", label: "Resend API key", hint: "resend.com → API Keys" },
      { key: "smtp_host", label: "SMTP host", hint: "e.g. smtp.gmail.com, smtp.zoho.com, smtp.hostinger.com", secret: false },
      { key: "smtp_port", label: "SMTP port", hint: "465 (SSL)", secret: false },
      { key: "smtp_user", label: "SMTP username", secret: false },
      { key: "smtp_pass", label: "SMTP password / app password" },
    ],
  },
  {
    id: "calendar",
    title: "Google Calendar",
    description: "Creates an event for every booking and blocks the times you're busy. OAuth mode also invites the client and adds a Google Meet link.",
    test: "test_calendar",
    connected: [["google_client_id", "google_client_secret", "google_refresh_token"], ["google_service_account_json"]],
    steps: [
      "In Google Cloud Console, enable the Google Calendar API for your project.",
      "Create an OAuth client and get a refresh token (scope: calendar), or create a service account and share your calendar with its email.",
      "Click “Send test” to check the connection and your busy times.",
    ],
    fields: [
      { key: "google_calendar_id", label: "Calendar ID", hint: "Usually your Gmail or Workspace address, or “primary” with OAuth", secret: false },
      { key: "google_client_id", label: "OAuth client ID", secret: false },
      { key: "google_client_secret", label: "OAuth client secret" },
      { key: "google_refresh_token", label: "OAuth refresh token", hint: "Scope: https://www.googleapis.com/auth/calendar" },
      { key: "google_service_account_json", label: "…or service account JSON", hint: "Share your calendar with the service account email (Make changes to events)", multiline: true },
      { key: "default_meeting_link", label: "Fallback meeting link", hint: "Used when no Meet link is generated (e.g. your Zoom room)", secret: false },
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp Cloud API",
    description: "Instant WhatsApp alerts on your phone for every new lead and booking.",
    test: "test_whatsapp",
    connected: [["whatsapp_token", "whatsapp_phone_number_id", "whatsapp_notify_to"]],
    steps: [
      "In Meta Business, open WhatsApp → API Setup and copy the Phone number ID.",
      "Create a permanent access token (System User) and paste it here.",
      "Set the number that should receive alerts, then click “Send test”.",
    ],
    fields: [
      { key: "whatsapp_token", label: "Permanent access token" },
      { key: "whatsapp_phone_number_id", label: "Phone number ID", secret: false },
      { key: "whatsapp_notify_to", label: "Notify this number", hint: "International format, e.g. 923045101870", secret: false },
      { key: "whatsapp_template", label: "Template name (optional)", hint: "An approved template with one {{1}} body variable. Needed outside the 24-hour window", secret: false },
      { key: "whatsapp_template_lang", label: "Template language", hint: "e.g. en or en_US", secret: false },
    ],
  },
  {
    id: "meta",
    title: "Meta Conversions API",
    description: "Server-side Lead and Schedule events for Facebook and Instagram ads, matched with the browser pixel so conversions aren't double counted.",
    connected: [["meta_capi_token"]],
    steps: [
      "Add your Pixel ID in the Ads & analytics tab first.",
      "In Events Manager → your pixel → Settings, generate a Conversions API access token.",
      "Use a test event code while testing, then clear it.",
    ],
    fields: [
      { key: "meta_capi_token", label: "Conversions API access token" },
      { key: "meta_test_event_code", label: "Test event code (optional)", hint: "Remove after testing", secret: false },
    ],
  },
];

const trackingSections: { title: string; fields: { key: keyof TrackingSettings; label: string; hint: string }[] }[] = [
  {
    title: "Google",
    fields: [
      { key: "gtmId", label: "Google Tag Manager ID", hint: "GTM-XXXXXXX" },
      { key: "ga4Id", label: "Google Analytics 4 ID", hint: "G-XXXXXXXXXX" },
      { key: "googleAdsId", label: "Google Ads ID", hint: "AW-XXXXXXXXX" },
      { key: "googleAdsLeadLabel", label: "Ads lead conversion label", hint: "From the conversion action's tag setup" },
      { key: "googleAdsBookingLabel", label: "Ads booking conversion label", hint: "A separate conversion for booked meetings" },
    ],
  },
  { title: "Meta (Facebook & Instagram)", fields: [{ key: "metaPixelId", label: "Meta Pixel ID", hint: "Numbers only" }] },
  {
    title: "Site verification",
    fields: [
      { key: "googleSiteVerification", label: "Google Search Console", hint: "Content value of the google-site-verification meta tag" },
      { key: "bingSiteVerification", label: "Bing Webmaster", hint: "msvalidate.01 content value" },
      { key: "facebookDomainVerification", label: "Facebook domain verification", hint: "facebook-domain-verification content value" },
    ],
  },
];

const TAB_IDS = ["tracking", "email", "calendar", "whatsapp", "meta"] as const;
type TabId = (typeof TAB_IDS)[number];

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
  const [tab, setTab] = useHashTab(TAB_IDS, "tracking");
  const [configured, setConfigured] = useState<Set<string>>(new Set());
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const reloadKeys = useCallback(
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

  const isConnected = (g: SecretGroup) => g.connected.some((set) => set.every((k) => configured.has(k)));
  const tracking = settings?.tracking;
  const trackingOn = Boolean(tracking && (tracking.gtmId || tracking.ga4Id || tracking.googleAdsId || tracking.metaPixelId));

  const tabs: TabDef<TabId>[] = [
    { id: "tracking", label: "Ads & analytics", icon: BarChart3, dot: trackingOn ? "ok" : "off" },
    ...groups.map<TabDef<TabId>>((g) => ({
      id: g.id,
      label: g.title.replace("WhatsApp Cloud API", "WhatsApp").replace("Meta Conversions API", "Meta CAPI"),
      icon: { email: Mail, calendar: CalendarDays, whatsapp: WhatsappIcon as unknown as typeof Mail, meta: Share2 }[g.id],
      dot: isConnected(g) ? "ok" : "off",
    })),
  ];

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
    setValues((v) => Object.fromEntries(Object.entries(v).filter(([k]) => !group.fields.some((f) => f.key === k && f.secret !== false))));
    await reloadKeys();
    toast.success(`${group.title} saved`);
  }

  async function test(group: SecretGroup) {
    if (!group.test) return;
    setBusy(`${group.id}-test`);
    try {
      const res = await adminTool<{ ok: boolean; error?: string; via?: string; mode?: string; busyNext7Days?: number; to?: string }>(group.test);
      if (res.ok) toast.success(group.test === "test_calendar" ? `Connected (${res.mode}), ${res.busyNext7Days} busy blocks in the next 7 days` : `Sent via ${res.via}${res.to ? ` to ${res.to}` : ""}`);
      else toast.error(res.error ?? "Test failed");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const active = groups.find((g) => g.id === tab);

  return (
    <>
      <PageHeader title="Integrations" description="Connect ads tracking, email, Google Calendar, WhatsApp and the Meta Conversions API." />
      <TabBar tabs={tabs} value={tab} onChange={setTab} />

      {tab === "tracking" && settings && tracking && (
        <Panel
          title="Ads & analytics tracking"
          description="Loaded on every public page. Lead and booking conversions fire automatically for Google Ads, GA4, Tag Manager and the Meta Pixel."
          actions={<Btn onClick={() => save({ tracking: settings.tracking })} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save</Btn>}
        >
          <div className="space-y-8">
            {trackingSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase">{section.title}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {section.fields.map((f) => (
                    <FieldRow key={f.key} label={f.label} hint={f.hint}>
                      <input className={inputClass} value={tracking[f.key] ?? ""} onChange={(e) => setSettings({ ...settings, tracking: { ...settings.tracking, [f.key]: e.target.value.trim() } })} />
                    </FieldRow>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {active && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <Panel
            title={active.title}
            description={active.description}
            actions={
              <div className="flex gap-2">
                {active.test && (
                  <Btn variant="ghost" onClick={() => test(active)} disabled={busy === `${active.id}-test`}>
                    {busy === `${active.id}-test` ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send test
                  </Btn>
                )}
                <Btn onClick={() => saveGroup(active)} disabled={busy === active.id}>
                  {busy === active.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
                </Btn>
              </div>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              {active.fields.map((f) => (
                <div key={f.key} className={f.multiline ? "md:col-span-2" : undefined}>
                  <FieldRow
                    label={f.label}
                    hint={
                      <span className="flex items-start gap-1.5">
                        {configured.has(f.key) ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 size-3.5 shrink-0 text-slate-300" />}
                        <span>{configured.has(f.key) ? `Saved. ${f.secret === false ? "" : "Type to replace, or clear and save to remove. "}${f.hint ?? ""}` : f.hint ?? "Not set"}</span>
                      </span>
                    }
                  >
                    {f.multiline ? (
                      <textarea className={textareaClass} rows={4} placeholder={configured.has(f.key) ? "•••••••• (saved)" : ""} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
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
                </div>
              ))}
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel title="Status">
              <p className={isConnected(active) ? "flex items-center gap-2 text-sm font-medium text-emerald-700" : "flex items-center gap-2 text-sm font-medium text-slate-600"}>
                {isConnected(active) ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                {isConnected(active) ? "Connected" : "Not connected yet"}
              </p>
              <p className="mt-2 text-xs text-slate-500">{active.fields.filter((f) => configured.has(f.key)).length} of {active.fields.length} fields saved</p>
            </Panel>
            <Panel title="How to connect">
              <ol className="space-y-3 text-sm text-slate-600">
                {active.steps.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-semibold text-sky-300">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
