"use client";

import { Download, Loader2, Mail, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Btn, Empty, formatDate, inputClass, PageHeader, Panel, StatusBadge, textareaClass } from "@/components/admin/ui";
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

async function fetchLeads(filter: string) {
  let q = supabaseBrowser().from("contacts").select("*").order("created_at", { ascending: false }).limit(500);
  if (filter !== "all") q = q.eq("status", filter);
  const { data, error } = await q;
  if (error) toast.error(error.message);
  return (data as Lead[]) ?? [];
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [drafting, setDrafting] = useState(false);

  useEffect(() => {
    fetchLeads(filter).then(setLeads);
  }, [filter]);

  async function update(id: string, patch: Partial<Lead>) {
    const { data, error } = await supabaseBrowser().from("contacts").update(patch).eq("id", id).select("*").single();
    if (error) return toast.error(error.message);
    setLeads((ls) => ls.map((l) => (l.id === id ? (data as Lead) : l)));
    setSelected(data as Lead);
    toast.success("Lead updated");
  }

  async function remove(id: string) {
    if (!confirm("Delete this lead permanently?")) return;
    const { error } = await supabaseBrowser().from("contacts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setLeads((ls) => ls.filter((l) => l.id !== id));
    setSelected(null);
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
    const csv = [cols.join(","), ...leads.map((l) => cols.map((c) => esc(l[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `leads-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader title="Leads" description="Contact form submissions with ad attribution." actions={<Btn variant="ghost" onClick={exportCsv}><Download className="size-4" /> Export CSV</Btn>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...statuses].map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={cn("rounded-full px-3.5 py-1.5 text-sm capitalize", filter === s ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200")}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Panel className="p-2 sm:p-2">
          {leads.length === 0 ? (
            <Empty>No leads.</Empty>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-auto">
              {leads.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => { setSelected(l); setDraft(null); }} className={cn("w-full rounded-xl px-4 py-3 text-left transition", selected?.id === l.id ? "bg-navy-50" : "hover:bg-slate-50")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-medium text-ink">{l.name}</p>
                      <StatusBadge status={l.status} />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{l.service ?? l.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(l.created_at)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {selected ? (
          <Panel
            title={selected.name}
            description={`${selected.email}${selected.phone ? ` · ${selected.phone}` : ""}`}
            actions={<Btn variant="danger" onClick={() => remove(selected.id)} aria-label="Delete lead"><Trash2 className="size-4" /></Btn>}
          >
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              {[["Company", selected.company], ["Service", selected.service], ["Budget", selected.budget]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium text-ink">{v || "—"}</dd></div>
              ))}
            </dl>
            <p className="mt-5 text-sm whitespace-pre-wrap text-slate-700">{selected.message}</p>
            {Object.keys(selected.utm ?? {}).length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {Object.entries(selected.utm).map(([k, v]) => <span key={k} className="rounded-md bg-sky-50 px-2 py-0.5 text-xs text-sky-800">{k}: {v}</span>)}
              </div>
            )}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">Status
                <select className={inputClass} value={selected.status} onChange={(e) => update(selected.id, { status: e.target.value })}>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <div className="flex items-end gap-2">
                <a className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-navy-900 hover:bg-slate-50" href={`mailto:${selected.email}?subject=${encodeURIComponent(draft?.subject ?? "Re: your project")}&body=${encodeURIComponent(draft?.body ?? "")}`}>
                  <Mail className="size-4" /> Reply
                </a>
                <Btn variant="sky" onClick={() => aiReply(selected)} disabled={drafting} className="flex-1">
                  {drafting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Draft with Claude
                </Btn>
              </div>
            </div>
            {draft && (
              <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                <p className="text-sm font-semibold text-ink">{draft.subject}</p>
                <textarea className={cn(textareaClass, "mt-2")} rows={9} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
                <p className="mt-2 text-xs text-slate-500">Edit, then click Reply to open it in your mail app.</p>
              </div>
            )}
            <label className="mt-6 grid gap-1.5 text-sm font-medium">Internal notes
              <textarea className={textareaClass} rows={3} defaultValue={selected.notes ?? ""} key={selected.id} onBlur={(e) => e.target.value !== (selected.notes ?? "") && update(selected.id, { notes: e.target.value })} />
            </label>
          </Panel>
        ) : (
          <Panel><Empty>Select a lead to see details.</Empty></Panel>
        )}
      </div>
    </>
  );
}
