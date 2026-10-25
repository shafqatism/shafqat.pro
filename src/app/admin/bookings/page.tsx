"use client";

import { ExternalLink, Loader2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Btn, Empty, formatDate, PageHeader, Pagination, SearchBox, StatusBadge, TableCard, tdClass, thClass } from "@/components/admin/ui";
import { adminTool, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  other_contact: string | null;
  meeting_type: string;
  notes: string | null;
  start_at: string;
  end_at: string;
  timezone: string;
  status: string;
  google_event_id: string | null;
  meeting_link: string | null;
};

type View = "upcoming" | "past" | "all";
const PAGE_SIZE = 12;

async function fetchBookings(view: View) {
  let q = supabaseBrowser().from("bookings").select("*").limit(500);
  const now = new Date().toISOString();
  if (view === "upcoming") q = q.gte("start_at", now).order("start_at");
  else if (view === "past") q = q.lt("start_at", now).order("start_at", { ascending: false });
  else q = q.order("start_at", { ascending: false });
  const { data, error } = await q;
  if (error) toast.error(error.message);
  return (data as Booking[]) ?? [];
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>("upcoming");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchBookings(view).then((b) => {
      setBookings(b);
      setLoaded(true);
    });
  }, [view]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => !q || [b.name, b.email, b.phone ?? "", b.meeting_type, b.notes ?? "", b.other_contact ?? ""].some((f) => f.toLowerCase().includes(q)));
  }, [bookings, query]);
  const shown = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  async function setStatus(b: Booking, status: string) {
    if (status === "cancelled") {
      if (!confirm(`Cancel the meeting with ${b.name}? The Google Calendar event will be removed.`)) return;
      try {
        const res = await adminTool<{ ok: boolean; calendar: boolean }>("cancel_booking", { id: b.id });
        toast.success(res.calendar ? "Cancelled and removed from Google Calendar" : "Cancelled");
      } catch (e) {
        return toast.error((e as Error).message);
      }
    } else {
      const { error } = await supabaseBrowser().from("bookings").update({ status }).eq("id", b.id);
      if (error) return toast.error(error.message);
      toast.success("Updated");
    }
    setBookings(await fetchBookings(view));
  }

  return (
    <>
      <PageHeader title="Bookings" description="Meetings booked through /book-a-meeting, synced to Google Calendar." />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2">
          {(["upcoming", "past", "all"] as const).map((v) => (
            <button key={v} type="button" onClick={() => { setLoaded(false); setView(v); setPage(0); }} className={cn("rounded-full px-3.5 py-1.5 text-sm capitalize", view === v ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-navy-900/30")}>{v}</button>
          ))}
        </div>
        <SearchBox value={query} onChange={(v) => { setQuery(v); setPage(0); }} placeholder="Search name, email, topic, notes…" className="w-full lg:w-80" />
      </div>

      <TableCard>
        {loaded && shown.length === 0 && <div className="p-6"><Empty>{bookings.length === 0 ? "No bookings here." : "No bookings match your search."}</Empty></div>}
        <table className={cn("w-full min-w-[900px]", loaded && shown.length === 0 && "hidden")}>
          <thead className="bg-slate-50">
            <tr>
              <th className={thClass}>When</th>
              <th className={thClass}>Client</th>
              <th className={thClass}>Contact</th>
              <th className={thClass}>Topic &amp; notes</th>
              <th className={thClass}>Status</th>
              <th className={thClass}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loaded ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-400"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
            ) : shown.length === 0 ? (
              null
            ) : (
              shown.map((b) => (
                <tr key={b.id} className="align-top hover:bg-slate-50/60">
                  <td className={cn(tdClass, "whitespace-nowrap")}>
                    <p className="font-medium text-ink">{formatDate(b.start_at, { dateStyle: "medium" })}</p>
                    <p className="text-xs text-slate-500">{formatDate(b.start_at, { timeStyle: "short" })}</p>
                    <p className="text-[11px] text-slate-400">Client TZ: {b.timezone}</p>
                  </td>
                  <td className={tdClass}>
                    <p className="font-medium text-ink">{b.name}</p>
                    <a href={`mailto:${b.email}`} className="text-xs text-sky-700">{b.email}</a>
                  </td>
                  <td className={tdClass}>
                    {b.phone && <a href={`https://wa.me/${b.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block text-xs hover:text-emerald-600">{b.phone}</a>}
                    {b.other_contact && <p className="text-xs text-slate-500">{b.other_contact}</p>}
                    {!b.phone && !b.other_contact && <span className="text-slate-300">—</span>}
                  </td>
                  <td className={cn(tdClass, "max-w-xs")}>
                    <p className="font-medium text-ink">{b.meeting_type}</p>
                    {b.notes && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{b.notes}</p>}
                  </td>
                  <td className={tdClass}>
                    <StatusBadge status={b.status} />
                    {b.google_event_id && <p className="mt-1 text-xs text-emerald-600">Calendar synced</p>}
                  </td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap justify-end gap-2">
                      {b.meeting_link && (
                        <a href={b.meeting_link} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-navy-900 hover:bg-slate-50"><ExternalLink className="size-3.5" /> Join</a>
                      )}
                      {b.status === "confirmed" && (
                        <>
                          <Btn variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => setStatus(b, "completed")}>Done</Btn>
                          <Btn variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => setStatus(b, "no_show")}>No-show</Btn>
                          <Btn variant="danger" className="h-8 px-2.5 text-xs" onClick={() => setStatus(b, "cancelled")}><XCircle className="size-3.5" /> Cancel</Btn>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPage={setPage} />
      </TableCard>
    </>
  );
}
