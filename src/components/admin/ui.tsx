"use client";

import { ChevronLeft, ChevronRight, Search as SearchIcon, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
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

// ------------------------------- tabs -------------------------------

/** Active tab, mirrored in the URL hash (#tab) so a refresh or shared link opens the same tab. Client-only pages. */
export function useHashTab<T extends string>(ids: readonly T[], fallback: T) {
  const [tab, setTabState] = useState<T>(() => {
    if (typeof window === "undefined") return fallback;
    const h = window.location.hash.slice(1) as T;
    return ids.includes(h) ? h : fallback;
  });
  const setTab = (next: T) => {
    setTabState(next);
    window.history.replaceState(null, "", `#${next}`);
  };
  return [tab, setTab] as const;
}

export type TabDef<T extends string = string> = { id: T; label: string; icon?: LucideIcon; badge?: ReactNode; dot?: "ok" | "warn" | "off" };

export function TabBar<T extends string>({ tabs, value, onChange, className }: { tabs: TabDef<T>[]; value: T; onChange: (id: T) => void; className?: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // on narrow screens the bar scrolls sideways: bring the selected tab into view (horizontal only)
    const el = scroller.current;
    const active = el?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (el && active) el.scrollTo({ left: active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2, behavior: "auto" });
  }, [value]);
  return (
    <div ref={scroller} className={cn("-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0", className)}>
      <div role="tablist" className="inline-flex min-w-full gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 sm:min-w-0">
        {tabs.map(({ id, label, icon: Icon, badge, dot }) => {
          const active = id === value;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(id)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-medium whitespace-nowrap transition",
                active ? "bg-navy-900 text-white shadow-sm" : "text-slate-600 hover:bg-navy-50 hover:text-navy-900",
              )}
            >
              {Icon && <Icon className={cn("size-4", active && "text-sky-300")} />}
              {label}
              {dot && <span className={cn("size-2 rounded-full", dot === "ok" ? "bg-emerald-500" : dot === "warn" ? "bg-amber-400" : "bg-slate-300")} aria-hidden />}
              {badge !== undefined && (
                <span className={cn("rounded-full px-1.5 text-[11px] leading-5 font-semibold", active ? "bg-white/15 text-sky-200" : "bg-slate-100 text-slate-500")}>{badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------- tables -------------------------------

export const thClass = "px-4 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase whitespace-nowrap";
export const tdClass = "px-4 py-3.5 align-middle text-sm text-slate-700";

export function TableCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white", className)}><div className="overflow-x-auto">{children}</div></div>;
}

export function SearchBox({ value, onChange, placeholder = "Search…", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{placeholder}</span>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(inputClass, "pl-9")} />
    </label>
  );
}

export function Pagination({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row">
      <p>
        Showing <span className="font-medium text-ink">{from}–{to}</span> of <span className="font-medium text-ink">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Previous page" disabled={page <= 0} onClick={() => onPage(page - 1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-navy-900 disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-2 tabular-nums">Page {page + 1} / {pages}</span>
        <button type="button" aria-label="Next page" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-navy-900 disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-100 text-emerald-800",
    POST: "bg-sky-100 text-sky-800",
    PATCH: "bg-amber-100 text-amber-800",
    PUT: "bg-indigo-100 text-indigo-800",
    DELETE: "bg-red-100 text-red-700",
  };
  return <span className={cn("inline-flex min-w-14 justify-center rounded-md px-2 py-0.5 font-mono text-[11px] font-bold", colors[method] ?? "bg-slate-100 text-slate-700")}>{method}</span>;
}
