"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, description, children, className, actions }: { title?: string; description?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-slate-200 bg-white p-5 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-heading text-lg font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, accent = false }: { label: string; value: ReactNode; hint?: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl p-5", accent ? "bg-navy-900 text-white" : "border border-slate-200 bg-white")}>
      <p className={cn("text-sm", accent ? "text-white/60" : "text-slate-500")}>{label}</p>
      <p className={cn("mt-2 font-heading text-3xl font-semibold", accent ? "text-sky-300" : "text-navy-900")}>{value}</p>
      {hint && <p className={cn("mt-1 text-xs", accent ? "text-white/50" : "text-slate-400")}>{hint}</p>}
    </div>
  );
}

const statusColors: Record<string, string> = {
  new: "bg-sky-100 text-sky-800",
  contacted: "bg-indigo-100 text-indigo-800",
  qualified: "bg-amber-100 text-amber-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-slate-200 text-slate-700",
  spam: "bg-red-100 text-red-700",
  confirmed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-navy-100 text-navy-800",
  no_show: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", statusColors[status] ?? "bg-slate-100 text-slate-700")}>{status.replace("_", " ")}</span>;
}

export const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-3 focus:ring-sky-400/20";
export const textareaClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-400 focus:ring-3 focus:ring-sky-400/20";

export function Btn({ variant = "primary", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "sky" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-navy-900 text-white hover:bg-navy-800",
        variant === "sky" && "bg-sky-400 text-ink hover:bg-sky-300",
        variant === "ghost" && "border border-slate-200 bg-white text-navy-900 hover:bg-slate-50",
        variant === "danger" && "border border-red-200 bg-white text-red-600 hover:bg-red-50",
        className,
      )}
    />
  );
}

export function FieldRow({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">{children}</p>;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }) {
  return new Intl.DateTimeFormat(undefined, opts).format(new Date(iso));
}
