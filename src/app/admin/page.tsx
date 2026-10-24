"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Empty, formatDate, PageHeader, Panel, StatCard, StatusBadge } from "@/components/admin/ui";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Lead = { id: string; name: string; email: string; service: string | null; status: string; created_at: string };
type Booking = { id: string; name: string; meeting_type: string; start_at: string; status: string };
type Activity = { id: number; kind: string; message: string; created_at: string };

export default function AdminOverview() {
  const [stats, setStats] = useState({ leads30: 0, newLeads: 0, bookings30: 0, upcoming: 0 });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    const db = supabaseBrowser();
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const now = new Date().toISOString();
    Promise.all([
      db.from("contacts").select("id", { count: "exact", head: true }).gte("created_at", since),
      db.from("contacts").select("id", { count: "exact", head: true }).eq("status", "new"),
      db.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", since),
      db.from("bookings").select("id", { count: "exact", head: true }).eq("status", "confirmed").gte("start_at", now),
      db.from("contacts").select("id,name,email,service,status,created_at").order("created_at", { ascending: false }).limit(6),
      db.from("bookings").select("id,name,meeting_type,start_at,status").eq("status", "confirmed").gte("start_at", now).order("start_at").limit(6),
      db.from("activity_log").select("id,kind,message,created_at").order("created_at", { ascending: false }).limit(10),
    ]).then(([a, b, c, d, l, bk, act]) => {
      setStats({ leads30: a.count ?? 0, newLeads: b.count ?? 0, bookings30: c.count ?? 0, upcoming: d.count ?? 0 });
      setLeads((l.data as Lead[]) ?? []);
      setBookings((bk.data as Booking[]) ?? []);
      setActivity((act.data as Activity[]) ?? []);
    });
  }, []);

  return (
    <>
      <PageHeader title="Overview" description="Leads, meetings, and automation activity across shafqat.pro." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard accent label="New leads" value={stats.newLeads} hint="Awaiting a reply" />
        <StatCard label="Leads (30 days)" value={stats.leads30} />
        <StatCard label="Upcoming meetings" value={stats.upcoming} />
        <StatCard label="Bookings (30 days)" value={stats.bookings30} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Upcoming meetings" actions={<Link href="/admin/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-900">All <ArrowRight className="size-4" /></Link>}>
          {bookings.length === 0 ? (
            <Empty>No upcoming meetings.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-ink">{b.name}</p>
                    <p className="text-sm text-slate-500">{b.meeting_type}</p>
                  </div>
                  <p className="text-right text-sm font-medium text-navy-900">{formatDate(b.start_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Latest leads" actions={<Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-900">All <ArrowRight className="size-4" /></Link>}>
          {leads.length === 0 ? (
            <Empty>No leads yet — they&apos;ll appear here as soon as someone submits the contact form.</Empty>
          ) : (
            <ul className="divide-y divide-slate-100">
              {leads.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{l.name}</p>
                    <p className="truncate text-sm text-slate-500">{l.service ?? l.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={l.status} />
                    <span className="text-xs text-slate-400">{formatDate(l.created_at, { dateStyle: "short" })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Activity log" description="Bookings, leads, automation changes, and integration errors." className="mt-6">
        {activity.length === 0 ? (
          <Empty>No activity yet.</Empty>
        ) : (
          <ul className="space-y-2 text-sm">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
                <span className={a.kind === "integration_error" ? "mt-1 size-2 shrink-0 rounded-full bg-red-500" : "mt-1 size-2 shrink-0 rounded-full bg-sky-500"} />
                <span className="flex-1 text-slate-700">{a.message}</span>
                <span className="shrink-0 text-xs text-slate-400">{formatDate(a.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
