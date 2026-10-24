"use client";

import { Loader2, Save } from "lucide-react";
import { Btn, FieldRow, inputClass, PageHeader, Panel } from "@/components/admin/ui";
import { useSiteSettings } from "@/components/admin/use-settings";
import { cn } from "@/lib/utils";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SettingsPage() {
  const { settings, setSettings, save, saving } = useSiteSettings();
  if (!settings) return <Loader2 className="size-6 animate-spin text-navy-900" />;
  const b = settings.booking;
  const setB = (patch: Partial<typeof b>) => setSettings({ ...settings, booking: { ...b, ...patch } });
  const num = (v: string) => Math.max(0, Number(v) || 0);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Contact details and meeting availability used across the site."
        actions={<Btn onClick={() => save({})} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save all</Btn>}
      />
      <div className="grid gap-6">
        <Panel title="Contact">
          <div className="grid gap-4 md:grid-cols-3">
            <FieldRow label="Contact email"><input className={inputClass} value={settings.contactEmail} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} /></FieldRow>
            <FieldRow label="Phone (display)"><input className={inputClass} value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} /></FieldRow>
            <FieldRow label="WhatsApp number" hint="Digits only, with country code"><input className={inputClass} value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value.replace(/\D/g, "") })} /></FieldRow>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-navy-900" checked={settings.whatsappWidget} onChange={(e) => setSettings({ ...settings, whatsappWidget: e.target.checked })} />
            Show the floating WhatsApp chat button on the website
          </label>
        </Panel>

        <Panel title="Meeting availability" description="Slots are generated in your time zone; visitors see them in theirs. Busy times in Google Calendar are blocked automatically.">
          <div className="grid gap-4 md:grid-cols-3">
            <FieldRow label="Your time zone" hint="IANA name, e.g. Asia/Karachi"><input className={inputClass} value={b.timezone} onChange={(e) => setB({ timezone: e.target.value })} /></FieldRow>
            <FieldRow label="Start hour (0–23)"><input type="number" min={0} max={23} className={inputClass} value={b.startHour} onChange={(e) => setB({ startHour: Math.min(23, num(e.target.value)) })} /></FieldRow>
            <FieldRow label="End hour (1–24)"><input type="number" min={1} max={24} className={inputClass} value={b.endHour} onChange={(e) => setB({ endHour: Math.min(24, num(e.target.value)) })} /></FieldRow>
            <FieldRow label="Meeting length (minutes)"><input type="number" min={10} step={5} className={inputClass} value={b.slotMinutes} onChange={(e) => setB({ slotMinutes: Math.max(10, num(e.target.value)) })} /></FieldRow>
            <FieldRow label="Buffer between meetings (minutes)"><input type="number" min={0} step={5} className={inputClass} value={b.bufferMinutes} onChange={(e) => setB({ bufferMinutes: num(e.target.value) })} /></FieldRow>
            <FieldRow label="Minimum notice (hours)"><input type="number" min={0} className={inputClass} value={b.minNoticeHours} onChange={(e) => setB({ minNoticeHours: num(e.target.value) })} /></FieldRow>
            <FieldRow label="Book up to (days ahead)"><input type="number" min={1} max={120} className={inputClass} value={b.maxDaysAhead} onChange={(e) => setB({ maxDaysAhead: Math.max(1, num(e.target.value)) })} /></FieldRow>
          </div>
          <p className="mt-5 text-sm font-medium text-ink">Working days</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {days.map((d, i) => {
              const on = b.workingDays.includes(i);
              return (
                <button key={d} type="button" onClick={() => setB({ workingDays: on ? b.workingDays.filter((x) => x !== i) : [...b.workingDays, i].sort() })} className={cn("h-10 w-14 rounded-xl text-sm font-medium", on ? "bg-navy-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200")}>
                  {d}
                </button>
              );
            })}
          </div>
          <div className="mt-5">
            <FieldRow label="Meeting topics" hint="One per line — shown as choices on the booking page">
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-400"
                rows={6}
                value={b.meetingTypes.join("\n")}
                onChange={(e) => setB({ meetingTypes: e.target.value.split("\n").map((t) => t.trimStart()).filter((t, i, arr) => t || i === arr.length - 1) })}
              />
            </FieldRow>
          </div>
        </Panel>
      </div>
    </>
  );
}
