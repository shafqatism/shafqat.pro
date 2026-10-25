"use client";

import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { projectCategories, projects, type ProjectCategory } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";

const PAGE_SIZE = 18;

export function PortfolioGrid() {
  const [category, setCategory] = useState<ProjectCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const counts = useMemo(() => {
    const map = new Map<string, number>([["All", projects.length]]);
    for (const p of projects) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || [p.name, p.summary, p.region ?? "", p.category, ...p.stack].some((f) => f.toLowerCase().includes(q))),
    );
  }, [category, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Filter projects" className="flex flex-wrap gap-2">
          {(["All", ...projectCategories] as const).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              onClick={() => { setCategory(c); setLimit(PAGE_SIZE); }}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                category === c ? "text-white" : "bg-slate-100 text-slate-700 hover:bg-navy-50",
              )}
            >
              {category === c && <motion.span layoutId="portfolio-filter" className="absolute inset-0 -z-0 rounded-full bg-navy-900" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
              <span className="relative">
                {c} <span className={category === c ? "text-sky-300" : "text-slate-400"}>{counts.get(c) ?? 0}</span>
              </span>
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:w-72">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setLimit(PAGE_SIZE); }}
            placeholder="Search by name, tech, region…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-10 text-sm outline-none focus:border-sky-400 focus:ring-3 focus:ring-sky-400/20"
          />
        </label>
      </div>

      <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.slice(0, limit).map((p) => (
            <motion.div key={p.slug} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }} className="h-full">
              <ProjectCard project={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {visible.length > limit && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={() => setLimit((l) => l + PAGE_SIZE)} className="rounded-xl bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-800">
            Show more ({visible.length - limit} more)
          </button>
        </div>
      )}
      {visible.length === 0 && <p className="py-16 text-center text-slate-500">No projects match “{query}”.</p>}
    </div>
  );
}
