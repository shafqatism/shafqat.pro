// Google Calendar integration.
// Two auth modes (configure one in Admin → Integrations):
//  1. OAuth refresh token (google_client_id, google_client_secret, google_refresh_token)
//     → can invite the client as attendee and auto-create a Google Meet link.
//  2. Service account (google_service_account_json) with the calendar shared to it
//     → creates events on your calendar; the client gets the invite via email (.ics).
import { secret } from "./core.ts";

const CAL_API = "https://www.googleapis.com/calendar/v3";
const SCOPE = "https://www.googleapis.com/auth/calendar";

type Token = { token: string; mode: "oauth" | "service_account" };
let cached: { at: number; value: Token } | null = null;

function b64url(input: ArrayBuffer | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function serviceAccountToken(raw: string): Promise<string> {
  const sa = JSON.parse(raw) as { client_email: string; private_key: string; token_uri?: string };
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: sa.token_uri ?? "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }),
  );
  const pem = sa.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claim}`));
  const res = await fetch(sa.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${header}.${claim}.${b64url(sig)}` }),
  });
  if (!res.ok) throw new Error(`Google service account auth failed: ${await res.text()}`);
  return (await res.json()).access_token;
}

async function oauthToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
  });
  if (!res.ok) throw new Error(`Google OAuth refresh failed: ${await res.text()}`);
  return (await res.json()).access_token;
}

export async function googleToken(): Promise<Token | null> {
  if (cached && Date.now() - cached.at < 50 * 60_000) return cached.value;
  const [clientId, clientSecret, refreshToken, sa] = await Promise.all([
    secret("google_client_id"),
    secret("google_client_secret"),
    secret("google_refresh_token"),
    secret("google_service_account_json"),
  ]);
  let value: Token | null = null;
  if (clientId && clientSecret && refreshToken) value = { token: await oauthToken(clientId, clientSecret, refreshToken), mode: "oauth" };
  else if (sa) value = { token: await serviceAccountToken(sa), mode: "service_account" };
  if (value) cached = { at: Date.now(), value };
  return value;
}

async function calendarId() {
  return (await secret("google_calendar_id")) || "primary";
}

/** Busy intervals from Google Calendar between two instants (empty when not configured). */
export async function busyIntervals(timeMin: Date, timeMax: Date): Promise<{ start: Date; end: Date }[]> {
  const auth = await googleToken().catch(() => null);
  if (!auth) return [];
  const id = await calendarId();
  const res = await fetch(`${CAL_API}/freeBusy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: timeMin.toISOString(), timeMax: timeMax.toISOString(), items: [{ id }] }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  const busy = (data.calendars?.[id]?.busy ?? []) as { start: string; end: string }[];
  return busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

export type CalendarEventInput = {
  summary: string;
  description: string;
  start: Date;
  end: Date;
  timeZone: string;
  attendeeEmail: string;
  attendeeName: string;
  requestId: string;
};

export async function createCalendarEvent(input: CalendarEventInput): Promise<{ id: string; link?: string; htmlLink?: string } | null> {
  const auth = await googleToken();
  if (!auth) return null;
  const id = await calendarId();
  const body: Record<string, unknown> = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.start.toISOString(), timeZone: input.timeZone },
    end: { dateTime: input.end.toISOString(), timeZone: input.timeZone },
    reminders: { useDefault: false, overrides: [{ method: "email", minutes: 60 }, { method: "popup", minutes: 10 }] },
  };
  const params = new URLSearchParams();
  if (auth.mode === "oauth") {
    body.attendees = [{ email: input.attendeeEmail, displayName: input.attendeeName }];
    body.conferenceData = { createRequest: { requestId: input.requestId, conferenceSolutionKey: { type: "hangoutsMeet" } } };
    params.set("conferenceDataVersion", "1");
    params.set("sendUpdates", "all");
  }
  const res = await fetch(`${CAL_API}/calendars/${encodeURIComponent(id)}/events?${params}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Google Calendar event failed: ${await res.text()}`);
  const event = await res.json();
  return { id: event.id, link: event.hangoutLink, htmlLink: event.htmlLink };
}

export async function cancelCalendarEvent(eventId: string) {
  const auth = await googleToken();
  if (!auth) return false;
  const id = await calendarId();
  const res = await fetch(`${CAL_API}/calendars/${encodeURIComponent(id)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${auth.token}` },
  });
  return res.ok || res.status === 410;
}
