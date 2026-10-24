import { callPublicForms, rateLimited } from "@/lib/functions";

export async function POST(req: Request) {
  if (rateLimited(req)) return Response.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  // honeypot: bots fill the hidden "website" field
  if ((body as { website?: string }).website) return Response.json({ ok: true });
  const { status, data } = await callPublicForms({ ...body, action: "contact" }, req);
  return Response.json(data, { status });
}
