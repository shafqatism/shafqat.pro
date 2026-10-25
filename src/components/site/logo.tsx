import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, dark = false, variant = "mark" }: { className?: string; dark?: boolean; variant?: "mark" | "text" }) {
  if (variant === "text") {
    // name only, no badge
    return (
      <Link href="/" aria-label="Shafqat Rasool — home" className={cn("font-heading text-2xl font-bold tracking-tight transition-colors", dark ? "text-white hover:text-sky-300" : "text-navy-900 hover:text-navy-700", className)}>
        Shafqat
      </Link>
    );
  }
  return (
    <Link href="/" aria-label="Shafqat Rasool — home" className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-navy-900 font-heading text-sm font-bold text-white shadow-[0_0_0_1px_rgba(56,189,248,0.35)] transition-transform group-hover:scale-105">
        <span className="absolute inset-0 bg-gradient-to-br from-sky-400/40 via-transparent to-transparent" />
        <span className="relative">SR</span>
      </span>
      <span className={cn("font-heading text-lg font-semibold tracking-tight", dark ? "text-white" : "text-ink")}>
        shafqat
      </span>
    </Link>
  );
}
