import type { NextRequest } from "next/server";
import { callPublicForms, rateLimited } from "@/lib/functions";

/** GET ?date=YYYY-MM-DD → open slots (live from bookings + Google Calendar busy times). */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Response.json({ ok: false, error: "Invalid date" }, { status: 400 });
  const { status, data } = await callPublicForms({ action: "availability", date });
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

/** POST → books the meeting, creates the Google Calendar event, and sends notifications. */
export async function POST(req: NextRequest) {
  if (rateLimited(req, 5)) return Response.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  if ((body as { website?: string }).website) return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  const { status, data } = await callPublicForms({ ...body, action: "book" }, req);
  return Response.json(data, { status });
}
