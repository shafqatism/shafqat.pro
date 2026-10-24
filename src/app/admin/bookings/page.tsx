"use client";

import { ExternalLink, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Btn, Empty, formatDate, PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
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

async function fetchBookings(view: "upcoming" | "past" | "all") {
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
  const [view, setView] = useState<"upcoming" | "past" | "all">("upcoming");

  const load = useCallback(() => fetchBookings(view).then(setBookings), [view]);

  useEffect(() => {
    fetchBookings(view).then(setBookings);
  }, [view]);

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
    load();
  }

  return (
    <>
      <PageHeader title="Bookings" description="Meetings booked through /book-a-meeting, synced to Google Calendar." />
      <div className="mb-4 flex gap-2">
        {(["upcoming", "past", "all"] as const).map((v) => (
          <button key={v} type="button" onClick={() => setView(v)} className={cn("rounded-full px-3.5 py-1.5 text-sm capitalize", view === v ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200")}>{v}</button>
        ))}
      </div>
      <Panel className="overflow-x-auto p-0 sm:p-0">
        {bookings.length === 0 ? (
          <div className="p-6"><Empty>No bookings here.</Empty></div>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-medium">When</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Topic</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{formatDate(b.start_at)}</p>
                    <p className="text-xs text-slate-400">Client TZ: {b.timezone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{b.name}</p>
                    <a href={`mailto:${b.email}`} className="text-xs text-sky-700">{b.email}</a>
                    {b.phone && <a href={`https://wa.me/${b.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-500 hover:text-emerald-600">{b.phone}</a>}
                    {b.other_contact && <p className="text-xs text-slate-500">{b.other_contact}</p>}
                  </td>
                  <td className="max-w-xs px-5 py-4">
                    <p>{b.meeting_type}</p>
                    {b.notes && <p className="mt-1 line-clamp-3 text-xs text-slate-500">{b.notes}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={b.status} />
                    {b.google_event_id && <p className="mt-1 text-xs text-emerald-600">Calendar synced</p>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {b.meeting_link && (
                        <a href={b.meeting_link} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-navy-900"><ExternalLink className="size-3.5" /> Join</a>
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
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
