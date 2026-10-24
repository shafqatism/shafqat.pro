// Outbound notifications: business email (Resend or SMTP), WhatsApp Cloud API, Meta Conversions API.
import nodemailer from "npm:nodemailer@6.9.16";
import { logActivity, secret, sha256Hex } from "./core.ts";

export type Attachment = { filename: string; content: string; contentType: string };

/**
 * Sends an email through Resend (resend_api_key) or SMTP (smtp_host/port/user/pass).
 * Note: Supabase Edge Functions block outbound port 25 and 587; use SMTP port 465 (SSL).
 */
export async function sendEmail(opts: { to: string; subject: string; html: string; replyTo?: string; attachments?: Attachment[] }) {
  const [resendKey, from, smtpHost, smtpPort, smtpUser, smtpPass] = await Promise.all([
    secret("resend_api_key"),
    secret("email_from"),
    secret("smtp_host"),
    secret("smtp_port"),
    secret("smtp_user"),
    secret("smtp_pass"),
  ]);
  const sender = from || (smtpUser ? `Shafqat Rasool <${smtpUser}>` : "Shafqat Rasool <info@shafqat.pro>");

  if (resendKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: sender,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo,
        attachments: opts.attachments?.map((a) => ({ filename: a.filename, content: btoa(a.content), content_type: a.contentType })),
      }),
    });
    if (!res.ok) throw new Error(`Resend failed: ${await res.text()}`);
    return "resend";
  }

  if (smtpHost && smtpUser && smtpPass) {
    const port = Number(smtpPort || 465);
    const transport = nodemailer.createTransport({ host: smtpHost, port, secure: port === 465, auth: { user: smtpUser, pass: smtpPass } });
    await transport.sendMail({
      from: sender,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
      attachments: opts.attachments?.map((a) => ({ filename: a.filename, content: a.content, contentType: a.contentType })),
    });
    return "smtp";
  }

  return null;
}

/** Sends a WhatsApp message to the owner (whatsapp_notify_to) via the WhatsApp Cloud API. */
export async function sendWhatsApp(text: string, to?: string) {
  const [token, phoneId, notifyTo, template, lang] = await Promise.all([
    secret("whatsapp_token"),
    secret("whatsapp_phone_number_id"),
    secret("whatsapp_notify_to"),
    secret("whatsapp_template"),
    secret("whatsapp_template_lang"),
  ]);
  const recipient = (to || notifyTo || "").replace(/\D/g, "");
  if (!token || !phoneId || !recipient) return null;

  // Free-form text only reaches numbers that messaged the business in the last 24h;
  // an approved template with one {{1}} body parameter works any time.
  const payload = template
    ? {
        messaging_product: "whatsapp",
        to: recipient,
        type: "template",
        template: {
          name: template,
          language: { code: lang || "en" },
          components: [{ type: "body", parameters: [{ type: "text", text: text.slice(0, 1000) }] }],
        },
      }
    : { messaging_product: "whatsapp", to: recipient, type: "text", text: { body: text.slice(0, 4000) } };

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`WhatsApp failed: ${await res.text()}`);
  return "whatsapp";
}

/** Server-side Meta Conversions API event, deduplicated with the browser pixel by eventId. */
export async function metaConversion(opts: {
  pixelId?: string;
  eventName: "Lead" | "Schedule" | "Contact";
  eventId: string;
  email: string;
  phone?: string;
  sourceUrl?: string;
  ip?: string | null;
  userAgent?: string | null;
  fbp?: string;
  fbc?: string;
}) {
  const token = await secret("meta_capi_token");
  if (!token || !opts.pixelId) return null;
  const testCode = await secret("meta_test_event_code");
  const userData: Record<string, unknown> = {
    em: [await sha256Hex(opts.email.trim().toLowerCase())],
    client_ip_address: opts.ip ?? undefined,
    client_user_agent: opts.userAgent ?? undefined,
    fbp: opts.fbp,
    fbc: opts.fbc,
  };
  if (opts.phone) userData.ph = [await sha256Hex(opts.phone.replace(/\D/g, ""))];
  const res = await fetch(`https://graph.facebook.com/v21.0/${opts.pixelId}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [
        {
          event_name: opts.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: opts.eventId,
          action_source: "website",
          event_source_url: opts.sourceUrl,
          user_data: userData,
        },
      ],
      ...(testCode ? { test_event_code: testCode } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Meta CAPI failed: ${await res.text()}`);
  return "meta_capi";
}

/** Runs notification tasks without failing the request; failures are logged. */
export async function settle(label: string, tasks: Promise<unknown>[]) {
  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "rejected") await logActivity("integration_error", `${label}: ${String(r.reason?.message ?? r.reason)}`.slice(0, 2000));
  }
  return results.map((r) => (r.status === "fulfilled" ? r.value : null)).filter(Boolean);
}

export function icsInvite(opts: { uid: string; start: Date; end: Date; summary: string; description: string; organizer: string; attendee: string; url?: string }) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//shafqat.pro//Booking//EN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${opts.uid}@shafqat.pro`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(opts.start)}`,
    `DTEND:${fmt(opts.end)}`,
    `SUMMARY:${esc(opts.summary)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    opts.url ? `URL:${opts.url}` : "",
    `ORGANIZER;CN=Shafqat Rasool:mailto:${opts.organizer}`,
    `ATTENDEE;RSVP=TRUE:mailto:${opts.attendee}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
