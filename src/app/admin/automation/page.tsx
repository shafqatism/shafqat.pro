"use client";

import { Activity, Bot, Copy, KeyRound, ListTree, Loader2, Plug, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Btn, Empty, formatDate, inputClass, MethodBadge, PageHeader, Pagination, Panel, StatCard, TableCard, TabBar, tdClass, thClass, useHashTab, type TabDef,
} from "@/components/admin/ui";
import { adminTool, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type Token = { id: string; name: string; scopes: string[]; last_used_at: string | null; created_at: string };
type Log = { id: number; kind: string; message: string; created_at: string };

const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/automation`;
const TAB_IDS = ["tokens", "endpoints", "prompt", "activity"] as const;
type TabId = (typeof TAB_IDS)[number];

const endpoints: { method: string; path: string; what: string; scope: "read" | "write"; body?: string }[] = [
  { method: "GET", path: "/stats", what: "Lead and booking counts", scope: "read" },
  { method: "GET", path: "/settings", what: "All site settings (SEO defaults, tracking IDs, availability)", scope: "read" },
  { method: "PATCH", path: "/settings", what: "Update settings; merges the change and refreshes the live site", scope: "write", body: '{ "data": { "tracking": { "metaPixelId": "123" } } }' },
  { method: "GET", path: "/seo", what: "Per-page SEO overrides", scope: "read" },
  { method: "PUT", path: "/seo", what: "Create or update SEO for one page", scope: "write", body: '{ "path": "/services", "title": "…", "description": "…", "keywords": [] }' },
  { method: "GET", path: "/leads?status=new", what: "Recent leads, filterable by status", scope: "read" },
  { method: "PATCH", path: "/leads/:id", what: "Change a lead's status or notes", scope: "write", body: '{ "status": "contacted", "notes": "…" }' },
  { method: "GET", path: "/bookings?from=ISO", what: "Meetings from a date", scope: "read" },
  { method: "PATCH", path: "/bookings/:id", what: "Change a booking's status; cancelling also removes the Google Calendar event", scope: "write", body: '{ "status": "cancelled" }' },
  { method: "GET", path: "/activity", what: "Automation and integration log", scope: "read" },
  { method: "POST", path: "/revalidate", what: "Force-refresh the cached pages", scope: "write" },
];

const claudePrompt = `You manage my website shafqat.pro. Use the Automation API at ${BASE} with header "Authorization: Bearer <token>".
Each morning: GET /stats and GET /leads?status=new, draft a reply for each new lead, mark handled leads "contacted" via PATCH /leads/:id, and list today's meetings from GET /bookings.
Weekly: review GET /seo and improve titles/descriptions for pages with weak copy via PUT /seo (titles ≤ 60 chars, descriptions ≤ 160).
Never change tracking IDs or delete data without asking me first.`;

const kindStyle: Record<string, string> = {
  automation: "bg-indigo-100 text-indigo-800",
  lead: "bg-sky-100 text-sky-800",
  booking: "bg-emerald-100 text-emerald-800",
  integration_error: "bg-red-100 text-red-700",
};

const copy = (text: string, label = "Copied") => {
  navigator.clipboard.writeText(text);
  toast.success(label);
};

async function fetchTokens() {
  const { data } = await supabaseBrowser().from("automation_tokens").select("id,name,scopes,last_used_at,created_at").order("created_at", { ascending: false });
  return (data as Token[]) ?? [];
}
async function fetchLogs() {
  const { data } = await supabaseBrowser().from("activity_log").select("id,kind,message,created_at").order("created_at", { ascending: false }).limit(200);
  return (data as Log[]) ?? [];
}

export default function AutomationPage() {
  const [tab, setTab] = useHashTab(TAB_IDS, "tokens");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [name, setName] = useState("Claude automation");
  const [readOnly, setReadOnly] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchTokens().then(setTokens);
    fetchLogs().then(setLogs);
  }, []);

  const lastUsed = useMemo(() => tokens.map((t) => t.last_used_at).filter(Boolean).sort().at(-1) ?? null, [tokens]);
  const filteredLogs = useMemo(() => (kind === "all" ? logs : logs.filter((l) => l.kind === kind)), [logs, kind]);
  const pageSize = 12;
  const shownLogs = filteredLogs.slice(page * pageSize, page * pageSize + pageSize);
  const kinds = useMemo(() => ["all", ...Array.from(new Set(logs.map((l) => l.kind)))], [logs]);

  const tabs: TabDef<TabId>[] = [
    { id: "tokens", label: "API tokens", icon: KeyRound, badge: tokens.length },
    { id: "endpoints", label: "Endpoints", icon: Plug, badge: endpoints.length },
    { id: "prompt", label: "Claude prompt", icon: Sparkles },
    { id: "activity", label: "Activity", icon: Activity, badge: logs.length },
  ];

  async function create() {
    setBusy(true);
    try {
      const res = await adminTool<{ ok: boolean; token: string; error?: string }>("create_token", { name, readOnly });
      if (!res.ok) throw new Error(res.error);
      setCreated(res.token);
      setTokens(await fetchTokens());
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
    setTokens(await fetchTokens());
  }

  return (
    <>
      <PageHeader title="Claude & Automation" description="Let Claude, or Zapier, n8n and Make, run parts of the website through a secure API." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard accent label="Active tokens" value={tokens.length} hint={tokens.length ? "Stored hashed" : "Create one to start"} />
        <StatCard label="Last API call" value={lastUsed ? formatDate(lastUsed, { dateStyle: "medium" }) : "Never"} hint={lastUsed ? formatDate(lastUsed, { timeStyle: "short" }) : "No requests yet"} />
        <StatCard label="Endpoints" value={endpoints.length} hint={`${endpoints.filter((e) => e.scope === "write").length} write, ${endpoints.filter((e) => e.scope === "read").length} read`} />
        <button type="button" onClick={() => copy(BASE, "Base URL copied")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-navy-900/30">
          <p className="text-sm text-slate-500">Base URL</p>
          <p className="mt-2 flex items-center gap-2 font-mono text-xs break-all text-navy-900"><Copy className="size-3.5 shrink-0" /> {BASE.replace(/^https?:\/\//, "")}</p>
          <p className="mt-1 text-xs text-slate-400">Click to copy</p>
        </button>
      </div>

      <TabBar tabs={tabs} value={tab} onChange={setTab} />

      {tab === "tokens" && (
        <div className="space-y-6">
          <Panel title="Create a token" description="Tokens are shown once and stored hashed. Give each tool its own token so you can revoke it separately.">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input className={cn(inputClass, "sm:max-w-sm")} value={name} onChange={(e) => setName(e.target.value)} placeholder="Token name" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-navy-900" checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} /> Read-only</label>
              <Btn onClick={create} disabled={busy || !name.trim()}>{busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Create token</Btn>
            </div>
            {created && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-800">Copy this token now. It won&apos;t be shown again.</p>
                <div className="mt-2 flex gap-2">
                  <code className="flex-1 truncate rounded-lg bg-white px-2 py-1.5 text-xs">{created}</code>
                  <Btn variant="ghost" className="h-8 px-2.5" onClick={() => copy(created, "Token copied")} aria-label="Copy token"><Copy className="size-3.5" /></Btn>
                </div>
              </div>
            )}
          </Panel>

          <TableCard>
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Access</th>
                  <th className={thClass}>Last used</th>
                  <th className={thClass}>Created</th>
                  <th className={thClass}><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tokens.length === 0 ? (
                  <tr><td colSpan={5} className="p-6"><Empty>No tokens yet. Create one above.</Empty></td></tr>
                ) : (
                  tokens.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className={cn(tdClass, "font-medium text-ink")}>{t.name}</td>
                      <td className={tdClass}>
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", t.scopes.includes("write") ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>{t.scopes.includes("write") ? "Read & write" : "Read-only"}</span>
                      </td>
                      <td className={tdClass}>{t.last_used_at ? formatDate(t.last_used_at) : <span className="text-slate-400">Never</span>}</td>
                      <td className={tdClass}>{formatDate(t.created_at, { dateStyle: "medium" })}</td>
                      <td className={cn(tdClass, "text-right")}><Btn variant="danger" className="h-8 px-3 text-xs" onClick={() => revoke(t.id)}><Trash2 className="size-3.5" /> Revoke</Btn></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableCard>
        </div>
      )}

      {tab === "endpoints" && (
        <div className="space-y-4">
          <TableCard>
            <table className="w-full min-w-[820px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className={thClass}>Method</th>
                  <th className={thClass}>Path</th>
                  <th className={thClass}>What it does</th>
                  <th className={thClass}>Access</th>
                  <th className={thClass}><span className="sr-only">Copy</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {endpoints.map((e) => (
                  <tr key={e.method + e.path} className="hover:bg-slate-50/60">
                    <td className={tdClass}><MethodBadge method={e.method} /></td>
                    <td className={cn(tdClass, "font-mono text-xs text-ink")}>{e.path}</td>
                    <td className={tdClass}>
                      {e.what}
                      {e.body && <code className="mt-1 block text-[11px] text-slate-400">{e.body}</code>}
                    </td>
                    <td className={tdClass}><span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", e.scope === "write" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>{e.scope}</span></td>
                    <td className={cn(tdClass, "text-right")}>
                      <Btn variant="ghost" className="h-8 px-2.5" aria-label="Copy curl command" onClick={() => copy(`curl -X ${e.method} "${BASE}${e.path}" -H "Authorization: Bearer YOUR_TOKEN"${e.body ? ` -H "Content-Type: application/json" -d '${e.body}'` : ""}`, "curl command copied")}>
                        <Copy className="size-3.5" />
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
          <p className="text-xs text-slate-500">All requests need the header <code>Authorization: Bearer &lt;token&gt;</code>. Read-only tokens can call the GET endpoints only.</p>
        </div>
      )}

      {tab === "prompt" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <Panel title="Starter prompt for Claude" description="Paste into a Claude scheduled task or routine, and store the token as a secret rather than in the prompt." actions={<Btn variant="ghost" onClick={() => copy(claudePrompt, "Prompt copied")}><Copy className="size-4" /> Copy</Btn>}>
            <pre className="rounded-xl bg-ink p-4 text-xs leading-relaxed whitespace-pre-wrap text-sky-100">{claudePrompt}</pre>
          </Panel>
          <Panel title="Good to know">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3"><Bot className="mt-0.5 size-4 shrink-0 text-sky-600" /> Claude can also manage the site through the Supabase connector (tables <code>site_settings</code>, <code>page_seo</code>, <code>contacts</code>, <code>bookings</code>).</li>
              <li className="flex gap-3"><ListTree className="mt-0.5 size-4 shrink-0 text-sky-600" /> Google Ads and Meta Ads campaigns are managed from Claude&apos;s ads connectors. This site supplies the pixels and conversion events they optimise on.</li>
              <li className="flex gap-3"><KeyRound className="mt-0.5 size-4 shrink-0 text-sky-600" /> Use a read-only token for reports and a read &amp; write token only for tasks that change data.</li>
            </ul>
          </Panel>
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {kinds.map((k) => (
              <button key={k} type="button" onClick={() => { setKind(k); setPage(0); }} className={cn("rounded-full px-3.5 py-1.5 text-sm capitalize", kind === k ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200")}>
                {k.replace("_", " ")}
              </button>
            ))}
          </div>
          <TableCard>
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className={thClass}>When</th>
                  <th className={thClass}>Type</th>
                  <th className={thClass}>Event</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shownLogs.length === 0 ? (
                  <tr><td colSpan={3} className="p-6"><Empty>No activity yet.</Empty></td></tr>
                ) : (
                  shownLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/60">
                      <td className={cn(tdClass, "whitespace-nowrap text-slate-500")}>{formatDate(l.created_at)}</td>
                      <td className={tdClass}><span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", kindStyle[l.kind] ?? "bg-slate-100 text-slate-700")}>{l.kind.replace("_", " ")}</span></td>
                      <td className={cn(tdClass, "max-w-xl")}>{l.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={filteredLogs.length} onPage={setPage} />
          </TableCard>
        </div>
      )}
    </>
  );
}
