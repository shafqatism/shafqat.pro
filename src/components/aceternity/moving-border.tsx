import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Pill CTA with an animated conic-gradient border (Aceternity "moving border" style, CSS-only). */
export function MovingBorderLink({ href, children, className, innerClassName }: { href: string; children: ReactNode; className?: string; innerClassName?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex overflow-hidden rounded-full p-[1.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
        className,
      )}
    >
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0a1a3f_0%,#38bdf8_50%,#0a1a3f_100%)]" />
      <span
        className={cn(
          "relative inline-flex h-full w-full items-center justify-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white backdrop-blur-3xl transition-colors group-hover:bg-navy-800",
          innerClassName,
        )}
      >
        {children}
      </span>
    </Link>
  );
}
