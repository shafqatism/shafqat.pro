"use client";

import { AnimatePresence, motion } from "motion/react";
import { Boxes, Check, Cloud, Globe, Rocket, Smartphone } from "lucide-react";
import { useState } from "react";
import { capabilities } from "@/lib/content";
import { cn } from "@/lib/utils";

const icons = [Boxes, Globe, Smartphone, Cloud, Rocket];

export function CapabilityTabs() {
  const [active, setActive] = useState(0);
  const cap = capabilities[active];
  const Icon = icons[active];

  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div role="tablist" aria-label="Capabilities" className="flex flex-col gap-2">
        {capabilities.map((c, i) => {
          const TabIcon = icons[i];
          return (
            <button
              key={c.title}
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "group relative flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all",
                active === i ? "border-navy-900 bg-navy-900 text-white shadow-xl shadow-navy-900/20" : "border-slate-200 bg-white hover:border-navy-900/30",
              )}
            >
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", active === i ? "bg-sky-400/15 text-sky-300" : "bg-navy-50 text-navy-700")}>
                <TabIcon className="size-5" />
              </span>
              <span>
                <span className="block font-heading font-semibold">{c.title}</span>
                <span className={cn("block text-sm", active === i ? "text-white/60" : "text-slate-500")}>{c.kicker}</span>
              </span>
              <span className={cn("ml-auto font-mono text-xs", active === i ? "text-sky-300" : "text-slate-400")}>0{i + 1}</span>
            </button>
          );
        })}
      </div>

      <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-radial" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-sky-500/20 blur-3xl" />
        <AnimatePresence mode="wait">
          <motion.div key={cap.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }} className="relative">
            <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-navy-600 text-white shadow-lg shadow-sky-500/30">
              <Icon className="size-7" />
            </span>
            <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-sky-300 uppercase">{cap.kicker}</p>
            <h3 className="mt-2 text-3xl font-semibold">{cap.title}</h3>
            <p className="mt-4 max-w-xl leading-relaxed text-white/70">{cap.description}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {cap.skills.map((s) => (
                <li key={s} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <Check className="size-4 shrink-0 text-sky-400" /> {s}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
