"use client";

import { ArrowDown, ArrowUp, Download, Eye, Loader2, Mail, Phone, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Btn, Empty, formatDate, inputClass, PageHeader, Pagination, SearchBox, StatusBadge, TableCard, tdClass, textareaClass, thClass,
} from "@/components/admin/ui";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { adminApi, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  budget: string | null;
  message: string;
  source: string | null;
  utm: Record<string, string>;
  status: string;
  notes: string | null;
  created_at: string;
};

const statuses = ["new", "contacted", "qualified", "won", "lost", "spam"];
const PAGE_SIZE = 12;

async function fetchLeads() {
  const { data, error } = await supabaseBrowser().from("contacts").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) toast.error(error.message);
  return (data as Lead[]) ?? [];
}

const origin = (l: Lead) => l.utm?.utm_source || l.utm?.referrer?.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] || (l.utm?.landing ? `site ${l.utm.landing}` : "Direct");

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [drafting, setDrafting] = useState(false);

  useEffect(() => {
    fetchLeads().then((l) => {
      setLeads(l);
      setLoaded(true);
    });
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of statuses) c[s] = leads.filter((l) => l.status === s).length;
    return c;
  }, [leads]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = leads.filter(
      (l) => (filter === "all" || l.status === filter) && (!q || [l.name, l.email, l.phone ?? "", l.company ?? "", l.service ?? "", l.message].some((f) => f.toLowerCase().includes(q))),
    );
    return newestFirst ? list : [...list].reverse();
  }, [leads, filter, query, newestFirst]);

  const shown = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const selected = leads.find((l) => l.id === selectedId) ?? null;

  async function update(id: string, patch: Partial<Lead>) {
    const { data, error } = await supabaseBrowser().from("contacts").update(patch).eq("id", id).select("*").single();
    if (error) return toast.error(error.message);
    setLeads((ls) => ls.map((l) => (l.id === id ? (data as Lead) : l)));
    toast.success("Lead updated");
  }

  async function remove(id: string) {
    if (!confirm("Delete this lead permanently?")) return;
    const { error } = await supabaseBrowser().from("contacts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setLeads((ls) => ls.filter((l) => l.id !== id));
    setSelectedId(null);
  }

  async function aiReply(lead: Lead) {
    setDrafting(true);
    setDraft(null);
    try {
      const { result } = await adminApi<{ result: { subject: string; body: string } }>("/api/ai", {
        task: "reply",
        lead: { name: lead.name, company: lead.company, service: lead.service, budget: lead.budget, message: lead.message },
      });
      setDraft(result);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDrafting(false);
    }
  }

  function exportCsv() {
    const cols: (keyof Lead)[] = ["created_at", "name", "email", "phone", "company", "service", "budget", "status", "message", "source"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...rows.map((l) => cols.map((c) => esc(l[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `leads-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader
        title="Leads"
        description="Contact form submissions with ad attribution."
        actions={<Btn variant="ghost" onClick={exportCsv}><Download className="size-4" /> Export CSV ({rows.length})</Btn>}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {["all", ...statuses].map((s) => (
            <button key={s} type="button" onClick={() => { setFilter(s); setPage(0); }} className={cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm capitalize", filter === s ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-navy-900/30")}>
              {s}
              <span className={cn("text-xs tabular-nums", filter === s ? "text-sky-300" : "text-slate-400")}>{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
        <SearchBox value={query} onChange={(v) => { setQuery(v); setPage(0); }} placeholder="Search name, email, service, message…" className="w-full lg:w-80" />
      </div>

      <TableCard>
        {loaded && shown.length === 0 && <div className="p-6"><Empty>{leads.length === 0 ? "No leads yet. They appear here as soon as someone submits the contact form." : "No leads match your filters."}</Empty></div>}
        <table className={cn("w-full min-w-[920px]", loaded && shown.length === 0 && "hidden")}>
          <thead className="bg-slate-50">
            <tr>
              <th className={thClass}>
                <button type="button" onClick={() => setNewestFirst((v) => !v)} className="inline-flex items-center gap-1 uppercase">
                  Date {newestFirst ? <ArrowDown className="size-3.5" /> : <ArrowUp className="size-3.5" />}
                </button>
              </th>
              <th className={thClass}>Lead</th>
              <th className={thClass}>Contact</th>
              <th className={thClass}>Interest</th>
              <th className={thClass}>Source</th>
              <th className={thClass}>Status</th>
              <th className={thClass}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loaded ? (
              <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-400"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
            ) : shown.length === 0 ? (
              null
            ) : (
              shown.map((l) => (
                <tr key={l.id} className="cursor-pointer hover:bg-slate-50/70" onClick={() => { setSelectedId(l.id); setDraft(null); }}>
                  <td className={cn(tdClass, "whitespace-nowrap")}>
                    <p className="text-ink">{formatDate(l.created_at, { dateStyle: "medium" })}</p>
                    <p className="text-xs text-slate-400">{formatDate(l.created_at, { timeStyle: "short" })}</p>
                  </td>
                  <td className={tdClass}>
                    <p className="font-medium text-ink">{l.name}</p>
                    {l.company && <p className="text-xs text-slate-500">{l.company}</p>}
                  </td>
                  <td className={tdClass}>
                    <p>{l.email}</p>
                    {l.phone && <p className="text-xs text-slate-500">{l.phone}</p>}
                  </td>
                  <td className={cn(tdClass, "max-w-56")}>
                    <p className="truncate">{l.service || <span className="text-slate-400">Not specified</span>}</p>
                    {l.budget && <p className="text-xs text-slate-500">{l.budget}</p>}
                  </td>
                  <td className={cn(tdClass, "max-w-40 truncate text-slate-500")}>{origin(l)}</td>
                  <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                    <select
                      aria-label={`Status for ${l.name}`}
                      value={l.status}
                      onChange={(e) => update(l.id, { status: e.target.value })}
                      className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium capitalize outline-none focus:border-sky-400"
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className={cn(tdClass, "text-right")}>
                    <Btn variant="ghost" className="h-8 px-3 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedId(l.id); setDraft(null); }}><Eye className="size-3.5" /> View</Btn>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
      </TableCard>

      <Sheet open={Boolean(selected)} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader className="border-b border-slate-100">
                <SheetTitle className="font-heading text-xl">{selected.name}</SheetTitle>
                <SheetDescription className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <span>{formatDate(selected.created_at)}</span>
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 p-4">
                <div className="flex flex-wrap gap-2">
                  <a href={`mailto:${selected.email}?subject=${encodeURIComponent(draft?.subject ?? "Re: your project")}&body=${encodeURIComponent(draft?.body ?? "")}`} className="inline-flex h-9 items-center gap-2 rounded-xl bg-navy-900 px-4 text-sm font-semibold text-white hover:bg-navy-800"><Mail className="size-4" /> Reply</a>
                  {selected.phone && <a href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-navy-900 hover:bg-slate-50"><Phone className="size-4" /> WhatsApp</a>}
                  <Btn variant="sky" className="h-9" onClick={() => aiReply(selected)} disabled={drafting}>{drafting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Draft with Claude</Btn>
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  {[["Email", selected.email], ["Phone", selected.phone], ["Company", selected.company], ["Service", selected.service], ["Budget", selected.budget], ["Source", origin(selected)]].map(([k, v]) => (
                    <div key={k as string} className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">{k}</dt><dd className="break-words font-medium text-ink">{v || "—"}</dd></div>
                  ))}
                </dl>

                <div>
                  <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Message</h3>
                  <p className="mt-2 text-sm whitespace-pre-wrap text-slate-700">{selected.message}</p>
                </div>

                {Object.keys(selected.utm ?? {}).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(selected.utm).map(([k, v]) => <span key={k} className="rounded-md bg-sky-50 px-2 py-0.5 text-xs text-sky-800">{k}: {v}</span>)}
                  </div>
                )}

                {draft && (
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                    <p className="text-sm font-semibold text-ink">{draft.subject}</p>
                    <textarea className={cn(textareaClass, "mt-2")} rows={9} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
                    <p className="mt-2 text-xs text-slate-500">Edit it, then click Reply to open it in your mail app.</p>
                  </div>
                )}

                <label className="grid gap-1.5 text-sm font-medium">Status
                  <select className={inputClass} value={selected.status} onChange={(e) => update(selected.id, { status: e.target.value })}>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm font-medium">Internal notes
                  <textarea className={textareaClass} rows={4} defaultValue={selected.notes ?? ""} key={selected.id} onBlur={(e) => e.target.value !== (selected.notes ?? "") && update(selected.id, { notes: e.target.value })} />
                </label>

                <div className="border-t border-slate-100 pt-4">
                  <Btn variant="danger" onClick={() => remove(selected.id)}><Trash2 className="size-4" /> Delete lead</Btn>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
