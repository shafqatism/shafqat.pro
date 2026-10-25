import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CardBody, CardContainer, CardItem } from "@/components/aceternity/card-3d";
import type { Project } from "@/lib/content";
import { cn } from "@/lib/utils";

const gradients: Record<string, string> = {
  "Mobile Apps": "from-sky-400 via-navy-500 to-navy-900",
  "E-Commerce Websites": "from-emerald-300 via-sky-500 to-navy-800",
  "Custom Websites": "from-sky-300 via-navy-600 to-ink",
  SaaS: "from-indigo-300 via-navy-500 to-navy-950",
  "Industry Solutions": "from-teal-300 via-navy-500 to-navy-950",
};

/** 3D tilt project card with a generated cover (no third-party screenshots needed). */
export function ProjectCard({ project, dark = false }: { project: Project; dark?: boolean }) {
  const external = project.links?.[0]?.href;
  const linkClass = cn("inline-flex items-center gap-1.5 text-sm font-semibold after:absolute after:inset-0", dark ? "text-sky-300" : "text-navy-900");
  const arrow = <ArrowUpRight className="size-4 transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />;
  const initials = project.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("");
  return (
    <CardContainer containerClassName="h-full" className="h-full w-full">
      <CardBody
        className={cn(
          "group/card relative flex h-full w-full flex-col rounded-3xl border p-5 transition-shadow",
          dark ? "border-white/10 bg-navy-950/80 hover:shadow-[0_20px_60px_-15px_rgba(56,189,248,0.35)]" : "border-slate-200 bg-white hover:shadow-[0_20px_60px_-20px_rgba(10,26,63,0.35)]",
        )}
      >
        <CardItem translateZ={60} className="relative w-full overflow-hidden rounded-2xl">
          <div className={cn("relative aspect-[16/10] w-full bg-gradient-to-br", gradients[project.category] ?? gradients["Custom Websites"])}>
            <div className="absolute inset-0 bg-grid opacity-40" />
            <span className="absolute top-3 left-3 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">{project.category}</span>
            <span className="absolute right-4 bottom-2 font-heading text-6xl font-bold text-white/25">{initials}</span>
            {project.metrics?.[0] && (
              <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-navy-900">{project.metrics[0]}</span>
            )}
          </div>
        </CardItem>
        <CardItem translateZ={40} className="mt-5">
          {project.region && <p className={cn("text-xs font-medium", dark ? "text-sky-300" : "text-sky-600")}>{project.region}</p>}
          <h3 className={cn("mt-1 font-heading text-lg font-semibold leading-snug", dark ? "text-white" : "text-ink")}>{project.name}</h3>
        </CardItem>
        <CardItem translateZ={25} as="p" className={cn("mt-2 text-sm leading-relaxed", dark ? "text-white/60" : "text-slate-600")}>
          {project.summary}
        </CardItem>
        <CardItem translateZ={20} className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 4).map((t) => (
            <span key={t} className={cn("rounded-md px-2 py-0.5 text-[11px]", dark ? "bg-white/5 text-white/70" : "bg-navy-50 text-navy-700")}>{t}</span>
          ))}
        </CardItem>
        <CardItem translateZ={30} className="mt-auto pt-5">
          {project.caseStudy ? (
            <Link href={`/portfolio/${project.slug}`} className={linkClass}>
              Read case study {arrow}
            </Link>
          ) : !external ? (
            // listed without a website link: nothing to open
            <span className={cn("text-xs", dark ? "text-white/40" : "text-slate-400")}>Link not available</span>
          ) : project.links && project.links.length > 1 ? (
            // available in several places (e.g. Google Play and App Store): one button each
            <div className="relative z-10 flex flex-wrap gap-x-5 gap-y-2">
              {project.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", dark ? "text-sky-300" : "text-navy-900")}>
                  {l.label} {arrow}
                </a>
              ))}
            </div>
          ) : (
            <a href={external} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {project.links?.[0]?.label.startsWith("Visit") ? "Visit website" : `Open on ${project.links?.[0]?.label}`} {arrow}
            </a>
          )}
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
