"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, CalendarCheck, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, Globe2, Loader2, Video } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { meetingTopics } from "@/lib/content";
import type { BookingSettings } from "@/lib/settings";
import { trackConversion, trackingContext } from "@/lib/track";
import { cn } from "@/lib/utils";

type Step = "slot" | "details" | "done";
type Confirmation = { start: string; meetingLink: string | null; calendarSynced: boolean };

function datesAhead(cfg: BookingSettings) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: cfg.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [y, m, d] = today.split("-").map(Number);
  const out: string[] = [];
  for (let i = 0; i <= cfg.maxDaysAhead; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    if (cfg.workingDays.includes(dt.getUTCDay())) out.push(dt.toISOString().slice(0, 10));
  }
  return out;
}

async function fetchSlots(date: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/booking?date=${date}`, { cache: "no-store" });
    const data = await res.json();
    return data.ok ? data.slots : [];
  } catch {
    toast.error("Could not load available times.");
    return [];
  }
}

const field = "h-11 rounded-xl border-slate-200 bg-white focus-visible:border-sky-400 focus-visible:ring-sky-400/20";

export function BookingWidget({ config }: { config: BookingSettings }) {
  // This component renders only in the browser (see booking-widget-lazy), so "today",
  // the visitor's time zone and ?type= come straight from the client.
  const [dates] = useState(() => datesAhead(config));
  const [visitorTz] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || config.timezone);
  const [meetingType, setMeetingType] = useState(() => {
    const type = new URLSearchParams(window.location.search).get("type")?.toLowerCase();
    // ?type= comes from product / service / project links: exact topic name first, then a loose match on its first word
    const match = type && (config.meetingTypes.find((t) => t.toLowerCase() === type) ?? config.meetingTypes.find((t) => type.includes(t.toLowerCase().match(/[a-z]+/)?.[0] ?? "\0")));
    return match || config.meetingTypes[0] || "Discovery Call";
  });
  const [date, setDate] = useState<string | null>(dates[0] ?? null);
  const [page, setPage] = useState(0);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(Boolean(dates[0]));
  const [slot, setSlot] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("slot");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const topic = meetingTopics.find((t) => t.title === meetingType);
  // /products links pass ?product=<name> so the notes start with what the visitor is interested in
  const [defaultNotes] = useState(() => {
    const product = new URLSearchParams(window.location.search).get("product");
    return product ? `I'm interested in: ${product.slice(0, 120)}.\n\n` : "";
  });

  const loadSlots = useCallback((d: string) => {
    setDate(d);
    setSlot(null);
    setSlots(null);
    setLoadingSlots(true);
    fetchSlots(d).then((s) => {
      setSlots(s);
      setLoadingSlots(false);
    });
  }, []);

  useEffect(() => {
    if (!dates[0]) return;
    fetchSlots(dates[0]).then((s) => {
      setSlots(s);
      setLoadingSlots(false);
    });
  }, [dates]);

  const perPage = 7;
  const pageDates = dates.slice(page * perPage, page * perPage + perPage);
  const fmtTime = (iso: string) => new Intl.DateTimeFormat(undefined, { timeZone: visitorTz, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  const fmtLong = (iso: string) =>
    new Intl.DateTimeFormat(undefined, { timeZone: visitorTz, weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
  const dayLabel = (d: string) => {
    const dt = new Date(`${d}T12:00:00Z`);
    return {
      wd: new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: "UTC" }).format(dt),
      day: dt.getUTCDate(),
      mon: new Intl.DateTimeFormat(undefined, { month: "short", timeZone: "UTC" }).format(dt),
    };
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot) return;
    const values = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const tracking = trackingContext();
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, start: slot, meetingType, visitorTimezone: visitorTz, tracking }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Booking failed. Please try again.");
        if (res.status === 409 && date) {
          setStep("slot");
          loadSlots(date);
        }
        return;
      }
      trackConversion("booking", tracking.eventId, { email: values.email, phone: values.phone });
      setConfirmation({ start: data.start, meetingLink: data.meetingLink, calendarSynced: data.calendarSynced });
      setStep("done");
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-navy-900/10">
      <div className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        {/* Summary rail */}
        <div className="relative overflow-hidden bg-ink p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-60" />
          <div className="relative">
            <span className="grid size-12 place-items-center rounded-2xl bg-sky-400 font-heading font-bold text-ink">SR</span>
            <p className="mt-5 text-sm text-white/60">Shafqat Rasool</p>
            <h2 className="mt-1 text-2xl font-semibold">{meetingType}</h2>
            <ul className="mt-6 space-y-3 text-sm text-white/75">
              <li className="flex items-center gap-3"><Clock className="size-4 text-sky-400" /> {config.slotMinutes} minutes</li>
              <li className="flex items-center gap-3"><Video className="size-4 text-sky-400" /> Google Meet / video call</li>
              <li className="flex items-center gap-3"><Globe2 className="size-4 text-sky-400" /> Times shown in {visitorTz.replace(/_/g, " ")}</li>
              {slot && <li className="flex items-center gap-3 font-semibold text-sky-300"><CalendarCheck className="size-4" /> {fmtLong(slot)}</li>}
            </ul>
            <div className="mt-8">
              <label htmlFor="b-topic" className="text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">Meeting topic</label>
              <div className="relative mt-3">
                <select
                  id="b-topic"
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  disabled={step === "done"}
                  className="h-12 w-full appearance-none rounded-xl border border-white/15 bg-white/5 pr-10 pl-4 text-sm font-medium text-white outline-none transition hover:border-sky-400/60 focus:border-sky-400 focus:ring-3 focus:ring-sky-400/20 disabled:opacity-60"
                >
                  {config.meetingTypes.filter(Boolean).map((t) => (
                    <option key={t} value={t} className="bg-navy-950 text-white">{t}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-sky-300" />
              </div>
              {topic && (
                <AnimatePresence mode="wait">
                  <motion.div key={topic.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-sm text-white/70">{topic.summary}</p>
                    <p className="mt-4 text-xs font-semibold tracking-[0.15em] text-sky-300 uppercase">What we&apos;ll discuss</p>
                    <ul className="mt-2 space-y-2">
                      {topic.points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm text-white/85">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-400" /> {p}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === "slot" && (
              <motion.div key="slot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink">Select a date</h3>
                  <div className="flex gap-1">
                    <button type="button" aria-label="Previous dates" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="grid size-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40">
                      <ChevronLeft className="size-4" />
                    </button>
                    <button type="button" aria-label="Next dates" disabled={(page + 1) * perPage >= dates.length} onClick={() => setPage((p) => p + 1)} className="grid size-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40">
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {pageDates.map((d) => {
                    const l = dayLabel(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => loadSlots(d)}
                        className={cn("rounded-2xl border px-2 py-3 text-center transition", date === d ? "border-navy-900 bg-navy-900 text-white shadow-lg shadow-navy-900/20" : "border-slate-200 hover:border-navy-900/40")}
                      >
                        <span className={cn("block text-xs", date === d ? "text-sky-300" : "text-slate-500")}>{l.wd}</span>
                        <span className="block font-heading text-xl font-semibold">{l.day}</span>
                        <span className={cn("block text-xs", date === d ? "text-white/60" : "text-slate-400")}>{l.mon}</span>
                      </button>
                    );
                  })}
                </div>

                <h3 className="mt-8 text-lg font-semibold text-ink">Available times</h3>
                <div className="mt-4 min-h-40">
                  {loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-11 animate-pulse rounded-xl bg-slate-100" />)}
                    </div>
                  ) : slots && slots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {slots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSlot(s)}
                          className={cn("h-11 rounded-xl border text-sm font-medium transition", slot === s ? "border-sky-500 bg-sky-500 text-white" : "border-slate-200 text-navy-900 hover:border-sky-400 hover:bg-sky-50")}
                        >
                          {fmtTime(s)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">No open times on this day — try another date.</p>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    disabled={!slot}
                    onClick={() => setStep("details")}
                    className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-40"
                  >
                    Continue <ChevronRight className="size-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === "details" && slot && (
              <motion.form key="details" onSubmit={onSubmit} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid gap-5 sm:grid-cols-2">
                <button type="button" onClick={() => setStep("slot")} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-900 sm:col-span-2">
                  <ArrowLeft className="size-4" /> Change time
                </button>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                <div className="grid gap-2">
                  <Label htmlFor="b-name">Full name</Label>
                  <Input id="b-name" name="name" required maxLength={120} autoComplete="name" placeholder="Jane Doe" className={field} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b-email">Email</Label>
                  <Input id="b-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="jane@company.com" className={field} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b-phone">WhatsApp / phone number</Label>
                  <Input id="b-phone" name="phone" type="tel" required minLength={6} maxLength={40} autoComplete="tel" placeholder="+1 555 000 0000" className={field} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b-other">Other contact <span className="text-slate-400">(optional)</span></Label>
                  <Input id="b-other" name="otherContact" maxLength={300} placeholder="LinkedIn, Telegram, Skype, Zoom ID…" className={field} />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="b-notes">What would you like to discuss?</Label>
                  <Textarea
                    id="b-notes"
                    name="notes"
                    defaultValue={defaultNotes}
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={7}
                    placeholder={`Tell me about your project, for example:\n• What you want to build or improve\n• Who it's for and the main features\n• Current stage (idea, design, live product…)\n• Timeline and budget range\n• Links to your website, app or documents`}
                    className="min-h-40 rounded-xl border-slate-200 focus-visible:border-sky-400 focus-visible:ring-sky-400/20"
                  />
                  <p className="text-xs text-slate-500">The more detail you share, the more useful our call will be.</p>
                </div>
                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">You&apos;ll get a calendar invite by email. All discussions are confidential.</p>
                  <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 transition hover:bg-navy-800 disabled:opacity-60">
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : <CalendarCheck className="size-4 text-sky-300" />}
                    {submitting ? "Booking…" : "Confirm booking"}
                  </button>
                </div>
              </motion.form>
            )}

            {step === "done" && confirmation && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
                <CheckCircle2 className="mx-auto size-16 text-sky-500" />
                <h3 className="mt-5 text-2xl font-semibold text-ink">You&apos;re booked!</h3>
                <p className="mt-2 text-lg font-medium text-navy-900">{fmtLong(confirmation.start)}</p>
                <p className="mx-auto mt-3 max-w-md text-slate-600">A confirmation with the calendar invite is on its way to your inbox.</p>
                {confirmation.meetingLink && (
                  <a href={confirmation.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-600">
                    <Video className="size-4" /> Meeting link
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
