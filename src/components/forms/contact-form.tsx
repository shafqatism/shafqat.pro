"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { services } from "@/lib/content";
import { trackConversion, trackingContext } from "@/lib/track";

const budgets = ["< $5k", "$5k – $15k", "$15k – $50k", "$50k – $100k", "$100k+", "Not sure yet"];
const field = "h-11 rounded-xl border-slate-200 bg-white focus-visible:border-sky-400 focus-visible:ring-sky-400/20";
const selectClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-3 focus:ring-sky-400/20";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const tracking = trackingContext();
    setPending(true);
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, tracking }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrors(data.issues ?? {});
        toast.error(data.error ?? "Could not send your message.");
        return;
      }
      trackConversion("lead", tracking.eventId, { email: values.email, phone: values.phone });
      setDone(true);
      form.reset();
    } catch {
      toast.error("Network error — please try again or email info@shafqat.pro.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-8">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center">
            <CheckCircle2 className="mx-auto size-14 text-sky-500" />
            <h2 className="mt-5 text-2xl font-semibold text-ink">Message received!</h2>
            <p className="mx-auto mt-2 max-w-sm text-slate-600">Thanks for reaching out. I&apos;ll reply within one business day — check your inbox for a confirmation.</p>
            <button type="button" onClick={() => setDone(false)} className="mt-6 text-sm font-semibold text-navy-900 underline-offset-4 hover:underline">
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-5 sm:grid-cols-2" noValidate={false}>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <Field label="Full name" name="name" error={errors.name}>
              <Input id="name" name="name" required maxLength={120} autoComplete="name" placeholder="Jane Doe" className={field} />
            </Field>
            <Field label="Email" name="email" error={errors.email}>
              <Input id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="jane@company.com" className={field} />
            </Field>
            <Field label="Phone / WhatsApp" name="phone" optional error={errors.phone}>
              <Input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="+1 555 000 0000" className={field} />
            </Field>
            <Field label="Company" name="company" optional error={errors.company}>
              <Input id="company" name="company" maxLength={160} autoComplete="organization" placeholder="Acme Inc." className={field} />
            </Field>
            <Field label="Service" name="service" optional>
              <select id="service" name="service" className={selectClass} defaultValue="">
                <option value="">Select a service</option>
                {services.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Budget" name="budget" optional>
              <select id="budget" name="budget" className={selectClass} defaultValue="">
                <option value="">Select a range</option>
                {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Project details" name="message" error={errors.message}>
                <Textarea id="message" name="message" required minLength={10} maxLength={5000} rows={6} placeholder="Tell me about your goals, timeline, and current stack…" className="rounded-xl border-slate-200 focus-visible:border-sky-400 focus-visible:ring-sky-400/20" />
              </Field>
            </div>
            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">Protected under mutual NDA standards. No spam, ever.</p>
              <button
                type="submit"
                disabled={pending}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-900/20 transition hover:bg-navy-800 disabled:opacity-60"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 text-sky-300 transition group-hover:translate-x-0.5" />}
                {pending ? "Sending…" : "Send message"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, name, optional, error, children }: { label: string; name: string; optional?: boolean; error?: string[]; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="text-sm font-medium text-ink">
        {label} {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </Label>
      {children}
      {error?.[0] && <p className="text-xs text-red-600">{error[0]}</p>}
    </div>
  );
}
