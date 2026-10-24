// Public website forms: contact leads, meeting availability and booking.
// Called only by the Next.js server (route handlers), which adds the x-site-secret header.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "npm:zod@3.23.8";
import { admin, corsHeaders, escapeHtml, json, logActivity, secret, siteSettings, verifySiteSecret, type BookingSettings } from "../_shared/core.ts";
import { busyIntervals, createCalendarEvent } from "../_shared/google.ts";
import { icsInvite, metaConversion, sendEmail, sendWhatsApp, settle } from "../_shared/notify.ts";
import { addDays, formatInZone, todayIn, weekday, zonedToUtc } from "../_shared/time.ts";

const tracking = z
  .object({
    eventId: z.string().max(80).optional(),
    sourceUrl: z.string().max(500).optional(),
    fbp: z.string().max(200).optional(),
    fbc: z.string().max(300).optional(),
    utm: z.record(z.string().max(200)).optional(),
    ip: z.string().max(80).nullable().optional(),
    userAgent: z.string().max(500).nullable().optional(),
  })
  .default({});

const contactSchema = z.object({
  action: z.literal("contact"),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  service: z.string().trim().max(120).optional().or(z.literal("")),
  budget: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  tracking,
});

const availabilitySchema = z.object({
  action: z.literal("availability"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const bookSchema = z.object({
  action: z.literal("book"),
  start: z.string().datetime(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(6).max(40),
  otherContact: z.string().trim().max(300).optional().or(z.literal("")),
  meetingType: z.string().trim().min(1).max(80),
  notes: z.string().trim().min(10).max(5000),
  visitorTimezone: z.string().max(80).optional(),
  tracking,
});

const shell = (title: string, body: string) => `
<div style="font-family:Inter,Arial,sans-serif;background:#f4f7fb;padding:32px">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5eaf2">
    <div style="background:#0a1a3f;color:#fff;padding:24px 28px">
      <div style="font-size:12px;letter-spacing:2px;color:#7dd3fc;text-transform:uppercase">shafqat.pro</div>
      <div style="font-size:20px;font-weight:700;margin-top:6px">${title}</div>
    </div>
    <div style="padding:28px;color:#0f172a;font-size:15px;line-height:1.6">${body}</div>
  </div>
</div>`;

const rows = (pairs: [string, string | undefined | null][]) =>
  `<table style="width:100%;border-collapse:collapse">${pairs
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#64748b;width:130px;vertical-align:top">${k}</td><td style="padding:6px 0">${escapeHtml(String(v)).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`;

async function computeSlots(date: string, cfg: BookingSettings) {
  const tz = cfg.timezone;
  const today = todayIn(tz);
  if (date < today || date > addDays(today, cfg.maxDaysAhead)) return [];
  if (!cfg.workingDays.includes(weekday(date))) return [];

  const dayStart = zonedToUtc(date, cfg.startHour, 0, tz);
  const dayEnd = zonedToUtc(date, cfg.endHour, 0, tz);
  const earliest = Date.now() + cfg.minNoticeHours * 3600_000;
  const slotMs = cfg.slotMinutes * 60_000;
  const bufferMs = cfg.bufferMinutes * 60_000;

  const [{ data: booked }, busy] = await Promise.all([
    admin()
      .from("bookings")
      .select("start_at,end_at")
      .in("status", ["pending", "confirmed"])
      .lt("start_at", dayEnd.toISOString())
      .gt("end_at", dayStart.toISOString()),
    busyIntervals(dayStart, dayEnd),
  ]);
  const blocked = [
    ...(booked ?? []).map((b) => ({ start: new Date(b.start_at), end: new Date(b.end_at) })),
    ...busy,
  ];

  const slots: string[] = [];
  for (let t = dayStart.getTime(); t + slotMs <= dayEnd.getTime(); t += slotMs + bufferMs) {
    if (t < earliest) continue;
    const s = t - bufferMs;
    const e = t + slotMs + bufferMs;
    if (blocked.some((b) => b.start.getTime() < e && b.end.getTime() > s)) continue;
    slots.push(new Date(t).toISOString());
  }
  return slots;
}

async function handleContact(input: z.infer<typeof contactSchema>) {
  const settings = await siteSettings();
  const { data, error } = await admin()
    .from("contacts")
    .insert({
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      company: input.company || null,
      service: input.service || null,
      budget: input.budget || null,
      message: input.message,
      source: input.tracking.sourceUrl ?? "website",
      utm: input.tracking.utm ?? {},
    })
    .select("id")
    .single();
  if (error) throw error;

  const notifyTo = (await secret("notify_email")) || settings.contactEmail;
  await settle("contact", [
    sendEmail({
      to: notifyTo,
      replyTo: input.email,
      subject: `New lead: ${input.name}${input.service ? ` · ${input.service}` : ""}`,
      html: shell("New project inquiry", rows([
        ["Name", input.name],
        ["Email", input.email],
        ["Phone", input.phone],
        ["Company", input.company],
        ["Service", input.service],
        ["Budget", input.budget],
        ["Message", input.message],
        ["Source", input.tracking.sourceUrl],
      ])),
    }),
    sendEmail({
      to: input.email,
      replyTo: settings.contactEmail,
      subject: "Thanks for reaching out — Shafqat Rasool",
      html: shell(
        `Thanks, ${escapeHtml(input.name.split(" ")[0])}!`,
        `<p>I've received your message and will reply within one business day. Everything you share stays confidential under mutual NDA standards.</p>
         <p>Want to talk sooner? <a style="color:#0369a1" href="${settings.siteUrl}/book-a-meeting">Book a meeting</a> or message me on <a style="color:#0369a1" href="https://wa.me/${settings.whatsapp}">WhatsApp</a>.</p>
         <p style="margin-top:24px">— Shafqat Rasool<br><span style="color:#64748b">Software Architect &amp; Technology Leader</span></p>`,
      ),
    }),
    sendWhatsApp(`New lead on shafqat.pro\n${input.name} <${input.email}>${input.phone ? `\n${input.phone}` : ""}${input.service ? `\nService: ${input.service}` : ""}${input.budget ? `\nBudget: ${input.budget}` : ""}\n\n${input.message.slice(0, 600)}`),
    metaConversion({
      pixelId: settings.tracking?.metaPixelId,
      eventName: "Lead",
      eventId: input.tracking.eventId ?? data.id,
      email: input.email,
      phone: input.phone || undefined,
      sourceUrl: input.tracking.sourceUrl,
      ip: input.tracking.ip,
      userAgent: input.tracking.userAgent,
      fbp: input.tracking.fbp,
      fbc: input.tracking.fbc,
    }),
  ]);
  await logActivity("lead", `New contact lead from ${input.name}`, { contact_id: data.id });
  return { ok: true, id: data.id };
}

async function handleBook(input: z.infer<typeof bookSchema>) {
  const settings = await siteSettings();
  const cfg = settings.booking;
  const start = new Date(input.start);
  const ownerDate = new Intl.DateTimeFormat("en-CA", { timeZone: cfg.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(start);
  const slots = await computeSlots(ownerDate, cfg);
  if (!slots.includes(start.toISOString())) return json({ ok: false, error: "That time was just taken. Please pick another slot." }, 409);

  const end = new Date(start.getTime() + cfg.slotMinutes * 60_000);
  const { data: booking, error } = await admin()
    .from("bookings")
    .insert({
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      other_contact: input.otherContact || null,
      meeting_type: input.meetingType,
      notes: input.notes,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      timezone: input.visitorTimezone || cfg.timezone,
      status: "confirmed",
      utm: input.tracking.utm ?? {},
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return json({ ok: false, error: "That time was just taken. Please pick another slot." }, 409);
    throw error;
  }

  const description = [
    `Meeting type: ${input.meetingType}`,
    `Client: ${input.name} <${input.email}>`,
    `WhatsApp / phone: ${input.phone}`,
    input.otherContact ? `Other contact: ${input.otherContact}` : "",
    `\nWants to discuss:\n${input.notes}`,
    `\nBooked via shafqat.pro`,
  ]
    .filter(Boolean)
    .join("\n");

  let event: Awaited<ReturnType<typeof createCalendarEvent>> = null;
  try {
    event = await createCalendarEvent({
      summary: `${input.meetingType} · ${input.name}`,
      description,
      start,
      end,
      timeZone: cfg.timezone,
      attendeeEmail: input.email,
      attendeeName: input.name,
      requestId: booking.id,
    });
  } catch (e) {
    await logActivity("integration_error", `Google Calendar: ${String((e as Error).message)}`.slice(0, 2000), { booking_id: booking.id });
  }
  const meetingLink = event?.link || (await secret("default_meeting_link")) || null;
  if (event || meetingLink) {
    await admin().from("bookings").update({ google_event_id: event?.id ?? null, meeting_link: meetingLink }).eq("id", booking.id);
  }

  const visitorTz = input.visitorTimezone || cfg.timezone;
  const notifyTo = (await secret("notify_email")) || settings.contactEmail;
  const ics = icsInvite({
    uid: booking.id,
    start,
    end,
    summary: `${input.meetingType} with Shafqat Rasool`,
    description: meetingLink ? `Join: ${meetingLink}` : "Shafqat will share the meeting link before the call.",
    organizer: settings.contactEmail,
    attendee: input.email,
    url: meetingLink ?? undefined,
  });

  await settle("booking", [
    sendEmail({
      to: notifyTo,
      replyTo: input.email,
      subject: `New meeting booked: ${input.name} · ${formatInZone(start, cfg.timezone)}`,
      html: shell("New meeting booked", rows([
        ["When", formatInZone(start, cfg.timezone)],
        ["Type", input.meetingType],
        ["Name", input.name],
        ["Email", input.email],
        ["WhatsApp / phone", input.phone],
        ["Other contact", input.otherContact],
        ["Wants to discuss", input.notes],
        ["Calendar", event?.htmlLink ?? "Not synced (configure Google Calendar)"],
        ["Meeting link", meetingLink],
      ])),
    }),
    sendEmail({
      to: input.email,
      replyTo: settings.contactEmail,
      subject: `Confirmed: ${input.meetingType} with Shafqat Rasool`,
      html: shell(
        "Your meeting is confirmed",
        `<p>Hi ${escapeHtml(input.name.split(" ")[0])}, looking forward to our conversation.</p>
         ${rows([
           ["When", formatInZone(start, visitorTz)],
           ["Duration", `${cfg.slotMinutes} minutes`],
           ["Topic", input.meetingType],
           ["Join", meetingLink ?? "I'll share the meeting link before the call."],
         ])}
         <p style="margin-top:20px">The calendar invite is attached. Need to reschedule? Just reply to this email or message me on <a style="color:#0369a1" href="https://wa.me/${settings.whatsapp}">WhatsApp</a>.</p>`,
      ),
      attachments: [{ filename: "invite.ics", content: ics, contentType: "text/calendar; method=REQUEST" }],
    }),
    sendWhatsApp(`New meeting booked on shafqat.pro\n${formatInZone(start, cfg.timezone)}\n${input.meetingType}\n${input.name} <${input.email}>\n${input.phone}${input.otherContact ? `\n${input.otherContact}` : ""}\n\n${input.notes.slice(0, 500)}`),
    metaConversion({
      pixelId: settings.tracking?.metaPixelId,
      eventName: "Schedule",
      eventId: input.tracking.eventId ?? booking.id,
      email: input.email,
      phone: input.phone,
      sourceUrl: input.tracking.sourceUrl,
      ip: input.tracking.ip,
      userAgent: input.tracking.userAgent,
      fbp: input.tracking.fbp,
      fbc: input.tracking.fbc,
    }),
  ]);
  await logActivity("booking", `Meeting booked by ${input.name}`, { booking_id: booking.id, calendar: Boolean(event) });

  return json({ ok: true, id: booking.id, start: start.toISOString(), end: end.toISOString(), meetingLink, calendarSynced: Boolean(event) });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!(await verifySiteSecret(req))) return json({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    switch (body?.action) {
      case "contact": {
        const parsed = contactSchema.safeParse(body);
        if (!parsed.success) return json({ ok: false, error: "Please check the form fields.", issues: parsed.error.flatten().fieldErrors }, 422);
        return json(await handleContact(parsed.data));
      }
      case "availability": {
        const parsed = availabilitySchema.safeParse(body);
        if (!parsed.success) return json({ ok: false, error: "Invalid date" }, 422);
        const settings = await siteSettings();
        return json({ ok: true, date: parsed.data.date, timezone: settings.booking.timezone, slotMinutes: settings.booking.slotMinutes, slots: await computeSlots(parsed.data.date, settings.booking) });
      }
      case "book": {
        const parsed = bookSchema.safeParse(body);
        if (!parsed.success) return json({ ok: false, error: "Please check the form fields.", issues: parsed.error.flatten().fieldErrors }, 422);
        return await handleBook(parsed.data);
      }
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "Something went wrong. Please try again or email info@shafqat.pro." }, 500);
  }
});
