import Anthropic from "@anthropic-ai/sdk";
import { requireAdmin } from "@/lib/admin-auth";
import { profile, services } from "@/lib/content";

// Claude-powered assistant for the admin dashboard: SEO metadata and lead reply drafts.
let client: Anthropic | null = null;

const SYSTEM = `You are the in-house marketing and SEO assistant for ${profile.name}, ${profile.role} (shafqat.pro).
Bio: ${profile.bio}
Services: ${services.map((s) => s.title).join("; ")}.
Contact: ${profile.email}, WhatsApp ${profile.phone}.
Write in clear, confident, professional English. Never invent client names, metrics, or prices that were not provided.`;

const seoSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "SEO title, 45-60 characters, without the site name suffix" },
    description: { type: "string", description: "Meta description, 140-160 characters, with a call to action" },
    keywords: { type: "array", items: { type: "string" }, description: "6-12 search keywords" },
  },
  required: ["title", "description", "keywords"],
  additionalProperties: false,
};

const replySchema = {
  type: "object",
  properties: {
    subject: { type: "string" },
    body: { type: "string", description: "Plain-text email body signed by Shafqat Rasool" },
  },
  required: ["subject", "body"],
  additionalProperties: false,
};

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Admins only" }, { status: 403 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "Set ANTHROPIC_API_KEY on the server to enable the Claude assistant." }, { status: 501 });

  const body = (await req.json().catch(() => ({}))) as { task?: string; path?: string; context?: string; lead?: Record<string, string> };
  let prompt: string;
  let schema: Record<string, unknown>;
  if (body.task === "seo") {
    prompt = `Write SEO metadata for the page "${String(body.path ?? "/").slice(0, 200)}".\nPage context:\n${String(body.context ?? "").slice(0, 6000)}`;
    schema = seoSchema;
  } else if (body.task === "reply") {
    const lead = body.lead ?? {};
    prompt = `Draft a warm, concise first reply to this inbound lead. Propose booking a call at https://shafqat.pro/book-a-meeting and ask 2-3 sharp qualifying questions.\nLead:\n${JSON.stringify(lead).slice(0, 6000)}`;
    schema = replySchema;
  } else {
    return Response.json({ error: "Unknown task" }, { status: 400 });
  }

  try {
    client ??= new Anthropic();
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: { effort: "low", format: { type: "json_schema", schema } },
      messages: [{ role: "user", content: prompt }],
    });
    if (response.stop_reason === "refusal") return Response.json({ error: "Claude declined this request." }, { status: 422 });
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return Response.json({ error: "Empty response" }, { status: 502 });
    return Response.json({ ok: true, result: JSON.parse(text.text) });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: "Invalid ANTHROPIC_API_KEY" }, { status: 500 });
    if (error instanceof Anthropic.RateLimitError) return Response.json({ error: "Claude is rate limited — try again shortly." }, { status: 429 });
    if (error instanceof Anthropic.APIError) return Response.json({ error: `Claude API error ${error.status}` }, { status: 502 });
    return Response.json({ error: "Could not reach Claude" }, { status: 502 });
  }
}
