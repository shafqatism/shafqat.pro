import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Lightbulb, Target, Wrench } from "lucide-react";
import { Reveal } from "@/components/aceternity/reveal";
import { JsonLd } from "@/components/json-ld";
import { ProjectCard } from "@/components/site/project-card";
import { PageHero } from "@/components/site/section";
import { projects } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return pageMetadata({
    path: `/portfolio/${project.slug}`,
    title: `${project.name}${project.caseStudy ? " — Case Study" : ""}`,
    description: project.caseStudy ? `${project.caseStudy.problem} ${project.caseStudy.solution}`.slice(0, 300) : `${project.summary} Built with ${project.stack.slice(0, 4).join(", ")}.`,
    keywords: [project.category, ...project.stack],
    type: "article",
  });
}

export default async function ProjectPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  const settings = await getSettings();
  const cs = project.caseStudy;
  const related = projects.filter((p) => p.category === project.category && p.slug !== project.slug).slice(0, 3);

  return (
    <>
      <PageHero eyebrow={`${project.category} · ${project.region}`} title={project.name} description={cs?.overview ?? project.summary}>
        <div className="mt-8 flex flex-wrap gap-3">
          {project.links?.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sky-300">
              {l.label} <ArrowUpRight className="size-4" />
            </a>
          ))}
          <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
            <ArrowLeft className="size-4" /> All projects
          </Link>
        </div>
      </PageHero>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
          <div className="space-y-6">
            {cs ? (
              <>
                {[
                  { icon: Target, label: "The challenge", text: cs.problem },
                  { icon: Lightbulb, label: "The solution", text: cs.solution },
                ].map((b, i) => (
                  <Reveal key={b.label} delay={i * 0.08}>
                    <div className="rounded-3xl border border-slate-200 p-7">
                      <b.icon className="size-6 text-sky-500" />
                      <h2 className="mt-4 text-2xl font-semibold text-ink">{b.label}</h2>
                      <p className="mt-3 text-lg leading-relaxed text-slate-600">{b.text}</p>
                    </div>
                  </Reveal>
                ))}
                <Reveal delay={0.16}>
                  <div className="rounded-3xl bg-navy-900 p-7 text-white">
                    <h2 className="text-2xl font-semibold">Outcomes</h2>
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {cs.outcomes.map((o) => (
                        <li key={o} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                          <CheckCircle2 className="size-5 shrink-0 text-sky-400" /> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </>
            ) : (
              <Reveal>
                <div className="rounded-3xl border border-slate-200 p-7">
                  <h2 className="text-2xl font-semibold text-ink">Project overview</h2>
                  <p className="mt-3 text-lg leading-relaxed text-slate-600">{project.summary}</p>
                  {project.metrics && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {project.metrics.map((m) => <li key={m} className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800">{m}</li>)}
                    </ul>
                  )}
                </div>
              </Reveal>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-slate-200 p-6">
              <dl className="space-y-4 text-sm">
                {cs?.client && (<div><dt className="text-slate-500">Client</dt><dd className="font-semibold text-ink">{cs.client}</dd></div>)}
                {cs?.role && (<div><dt className="text-slate-500">Role</dt><dd className="font-semibold text-ink">{cs.role}</dd></div>)}
                <div><dt className="text-slate-500">Category</dt><dd className="font-semibold text-ink">{project.category}</dd></div>
                <div><dt className="text-slate-500">Region</dt><dd className="font-semibold text-ink">{project.region}</dd></div>
              </dl>
              <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold text-ink"><Wrench className="size-4 text-sky-500" /> Tech stack</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((t) => <span key={t} className="rounded-md bg-navy-50 px-2 py-1 text-xs text-navy-800">{t}</span>)}
              </div>
            </div>
            <div className="rounded-3xl bg-ink p-6 text-white">
              <p className="font-semibold">Building something similar?</p>
              <p className="mt-1 text-sm text-white/60">Let&apos;s map your architecture in a free call.</p>
              <Link href={`/book-a-meeting?type=${encodeURIComponent(project.category)}`} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sky-300">
                Book a meeting <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-2xl font-semibold text-ink">More {project.category.toLowerCase()} work</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <ProjectCard key={p.slug} project={p} />)}
            </div>
          </div>
        </section>
      )}

      <JsonLd
        data={breadcrumbJsonLd(settings.siteUrl, [
          { name: "Portfolio", path: "/portfolio" },
          { name: project.name, path: `/portfolio/${project.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": project.category === "Mobile Apps" ? "SoftwareApplication" : "CreativeWork",
          name: project.name,
          description: cs?.overview ?? project.summary,
          url: `${settings.siteUrl}/portfolio/${project.slug}`,
          creator: { "@id": `${settings.siteUrl}/#person` },
          keywords: project.stack.join(", "),
          ...(project.category === "Mobile Apps" ? { applicationCategory: "MobileApplication", operatingSystem: project.links?.map((l) => (l.label === "App Store" ? "iOS" : "Android")).join(", ") } : {}),
          ...(project.links?.[0] ? { sameAs: project.links.map((l) => l.href) } : {}),
        }}
      />
    </>
  );
}
