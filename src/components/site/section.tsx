import type { ReactNode } from "react";
import { Spotlight } from "@/components/aceternity/spotlight";
import { Reveal } from "@/components/aceternity/reveal";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase",
        dark ? "border-sky-400/30 bg-sky-400/10 text-sky-300" : "border-navy-900/10 bg-navy-50 text-navy-700",
      )}
    >
      <span className={cn("size-1.5 rounded-full", dark ? "bg-sky-400" : "bg-sky-500")} />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  dark?: boolean;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
      <h2 className={cn("mt-5 text-3xl font-semibold sm:text-4xl lg:text-5xl", dark ? "text-white" : "text-ink")}>{title}</h2>
      {description && <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", dark ? "text-white/65" : "text-slate-600")}>{description}</p>}
    </Reveal>
  );
}

/** Dark navy hero used at the top of inner pages. */
export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-ink pt-36 pb-20 text-white sm:pt-44 sm:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-radial" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-navy-700/40 blur-[120px]" />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* CSS-only entrance so the LCP heading paints before hydration */}
        <div className="animate-fade-up">
          <Eyebrow dark>{eyebrow}</Eyebrow>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
