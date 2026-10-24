"use client";

import { Copy, KeyRound, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Btn, Empty, formatDate, inputClass, PageHeader, Panel } from "@/components/admin/ui";
import { adminTool, supabaseBrowser } from "@/lib/supabase/browser";

type Token = { id: string; name: string; scopes: string[]; last_used_at: string | null; created_at: string };

const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/automation`;

async function fetchTokens() {
  const { data } = await supabaseBrowser().from("automation_tokens").select("id,name,scopes,last_used_at,created_at").order("created_at", { ascending: false });
  return (data as Token[]) ?? [];
}

const endpoints = [
  ["GET", "/stats", "Lead & booking counts"],
  ["GET", "/settings", "All site settings (SEO defaults, tracking IDs, availability)"],
  ["PATCH", "/settings", '{ "data": { "tracking": { "metaPixelId": "123" } } } — merges and refreshes the site'],
  ["GET", "/seo", "Per-page SEO overrides"],
  ["PUT", "/seo", '{ "path": "/services", "title": "…", "description": "…", "keywords": [] }'],
  ["GET", "/leads?status=new", "Recent leads (filter by status)"],
  ["PATCH", "/leads/:id", '{ "status": "contacted", "notes": "…" }'],
  ["GET", "/bookings?from=ISO", "Meetings from a date"],
  ["PATCH", "/bookings/:id", '{ "status": "cancelled" } — also removes the Google Calendar event'],
  ["GET", "/activity", "Automation & integration log"],
  ["POST", "/revalidate", "Force-refresh cached pages"],
];

export default function AutomationPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [name, setName] = useState("Claude automation");
  const [readOnly, setReadOnly] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => fetchTokens().then(setTokens), []);

  useEffect(() => {
    fetchTokens().then(setTokens);
  }, []);

  async function create() {
    setBusy(true);
    try {
      const res = await adminTool<{ ok: boolean; token: string; error?: string }>("create_token", { name, readOnly });
      if (!res.ok) throw new Error(res.error);
      setCreated(res.token);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this token? Anything using it will stop working.")) return;
    const { error } = await supabaseBrowser().from("automation_tokens").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const claudePrompt = `You manage my website shafqat.pro. Use the Automation API at ${BASE} with header "Authorization: Bearer <token>".
Each morning: GET /stats and GET /leads?status=new, draft a reply for each new lead, mark handled leads "contacted" via PATCH /leads/:id, and list today's meetings from GET /bookings.
Weekly: review GET /seo and improve titles/descriptions for pages with weak copy via PUT /seo (titles ≤ 60 chars, descriptions ≤ 160).
Never change tracking IDs or delete data without asking me first.`;

  return (
    <>
      <PageHeader title="Claude & Automation" description="Let Claude (or Zapier, n8n, Make…) operate the website through a secure API." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Panel title="API tokens" description="Tokens are shown once and stored hashed.">
          <div className="grid gap-3">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Token name" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-navy-900" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} /> Read-only</label>
            <Btn onClick={create} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Create token</Btn>
          </div>
          {created && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-800">Copy this token now — it won&apos;t be shown again.</p>
              <div className="mt-2 flex gap-2">
                <code className="flex-1 truncate rounded-lg bg-white px-2 py-1.5 text-xs">{created}</code>
                <Btn variant="ghost" className="h-8 px-2.5" onClick={() => copy(created)} aria-label="Copy token"><Copy className="size-3.5" /></Btn>
              </div>
            </div>
          )}
          <div className="mt-6">
            {tokens.length === 0 ? (
              <Empty>No tokens yet.</Empty>
            ) : (
              <ul className="divide-y divide-slate-100">
                {tokens.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-ink">{t.name} <span className="text-xs text-slate-400">({t.scopes.join(", ")})</span></p>
                      <p className="text-xs text-slate-500">{t.last_used_at ? `Last used ${formatDate(t.last_used_at)}` : "Never used"}</p>
                    </div>
                    <Btn variant="danger" className="h-8 px-2.5" onClick={() => revoke(t.id)} aria-label="Revoke"><Trash2 className="size-3.5" /></Btn>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Endpoints" description={BASE} actions={<Btn variant="ghost" className="h-8 px-2.5" onClick={() => copy(BASE)} aria-label="Copy base URL"><Copy className="size-3.5" /></Btn>}>
            <ul className="space-y-2 text-sm">
              {endpoints.map(([m, p, d]) => (
                <li key={m + p} className="flex flex-col gap-1 rounded-xl bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:gap-3">
                  <span className="w-14 font-mono text-xs font-bold text-sky-700">{m}</span>
                  <code className="font-mono text-xs text-ink">{p}</code>
                  <span className="text-xs text-slate-500 sm:ml-auto sm:text-right">{d}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Run it with Claude" description="Paste into a Claude scheduled task or routine (with the token stored as a secret)." actions={<Btn variant="ghost" className="h-8 px-2.5" onClick={() => copy(claudePrompt)} aria-label="Copy prompt"><Copy className="size-3.5" /></Btn>}>
            <pre className="rounded-xl bg-ink p-4 text-xs leading-relaxed whitespace-pre-wrap text-sky-100">{claudePrompt}</pre>
            <p className="mt-3 text-xs text-slate-500">
              Claude can also manage the site directly through the Supabase connector (tables <code>site_settings</code>, <code>page_seo</code>, <code>contacts</code>, <code>bookings</code>). Google Ads and Meta Ads campaigns are managed from Claude&apos;s own ads connectors; this site supplies the pixels and conversion events they optimise on.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}
