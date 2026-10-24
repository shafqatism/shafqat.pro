"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Grid where a glowing navy/sky highlight slides between hovered cards. */
export function HoverEffect({ items, className, dark = false }: { items: { key: string; content: ReactNode }[]; className?: string; dark?: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, idx) => (
        <div key={item.key} className="group relative block h-full w-full p-2" onMouseEnter={() => setHovered(idx)} onMouseLeave={() => setHovered(null)}>
          <AnimatePresence>
            {hovered === idx && (
              <motion.span
                className={cn("absolute inset-0 block h-full w-full rounded-3xl", dark ? "bg-sky-400/15" : "bg-navy-100/80")}
                layoutId="hover-effect-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>
          <div className="relative z-10 h-full">{item.content}</div>
        </div>
      ))}
    </div>
  );
}
