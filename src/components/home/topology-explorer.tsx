"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { topology } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Interactive, isometric stack of the four architecture layers. */
export function TopologyExplorer() {
  const [active, setActive] = useState(1);
  const layer = topology[active];

  return (
    <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
      <div className="relative mx-auto h-[380px] w-full max-w-md [perspective:1400px]">
        <div className="absolute inset-0 [transform:rotateX(58deg)_rotateZ(-38deg)] [transform-style:preserve-3d]">
          {topology.map((t, i) => {
            const depth = (topology.length - 1 - i) * 70;
            const isActive = i === active;
            return (
              <motion.button
                key={t.layer}
                type="button"
                aria-label={`${t.layer} ${t.title}`}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                animate={{ z: depth + (isActive ? 36 : 0) }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={cn(
                  "absolute inset-x-6 top-16 h-56 rounded-3xl border text-left transition-colors [transform-style:preserve-3d]",
                  isActive ? "border-sky-300 bg-gradient-to-br from-sky-400/80 to-navy-600/90 shadow-[0_0_60px_rgba(56,189,248,0.45)]" : "border-white/15 bg-navy-800/70 hover:border-sky-400/50",
                )}
              >
                <span className="absolute top-4 left-5 font-mono text-sm font-bold text-white">{t.layer}</span>
                <span className="absolute inset-4 rounded-2xl bg-dots opacity-60" />
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          {topology.map((t, i) => (
            <button
              key={t.layer}
              type="button"
              onClick={() => setActive(i)}
              className={cn("rounded-full border px-4 py-1.5 font-mono text-xs transition", i === active ? "border-sky-400 bg-sky-400 text-ink" : "border-white/15 text-white/70 hover:border-sky-400/60")}
            >
              {t.layer}
            </button>
          ))}
        </div>
        <motion.div key={layer.layer} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <h3 className="mt-6 text-3xl font-semibold text-white">{layer.title}</h3>
          <p className="mt-4 leading-relaxed text-white/70">{layer.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {layer.tech.map((t) => (
              <span key={t} className="rounded-lg border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 text-sm text-sky-200">{t}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
