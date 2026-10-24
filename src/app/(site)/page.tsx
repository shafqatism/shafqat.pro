import Link from "next/link";
import { ArrowRight, ArrowUpRight, Quote, ShieldCheck } from "lucide-react";
import { FlipWords } from "@/components/aceternity/flip-words";
import { HoverEffect } from "@/components/aceternity/hover-effect";
import { Marquee } from "@/components/aceternity/marquee";
import { MovingBorderLink } from "@/components/aceternity/moving-border";
import { Reveal } from "@/components/aceternity/reveal";
import { Spotlight } from "@/components/aceternity/spotlight";
import { CapabilityTabs } from "@/components/home/capability-tabs";
import { TopologyExplorer } from "@/components/home/topology-explorer";
import { JsonLd } from "@/components/json-ld";
import { ServiceIcon } from "@/components/site/service-icon";
import { ProjectCard } from "@/components/site/project-card";
import { Eyebrow, SectionHeading } from "@/components/site/section";
import { LazyHeroScene } from "@/components/three/lazy-hero-scene";
import { faqs, highlights, process, profile, projects, services, stats, techMarquee } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata({
    path: "/",
    title: "Shafqat Rasool | Software Architect & Full-Stack Developer",
    description:
      "Software architect and technology leader with 10+ years building custom software, Shopify Plus stores, SaaS platforms, iOS & Android apps, and cloud infrastructure on AWS & Azure.",
  });
}

export default function HomePage() {
  const featured = projects.filter((p) => p.featured).slice(0, 6);

  return (
    <>
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-radial" />
        <div className="pointer-events-none absolute -top-32 left-1/4 h-[520px] w-[720px] rounded-full bg-navy-700/50 blur-[140px]" />
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />

        <div className="relative mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:pt-24">
          {/* CSS-only entrance so the LCP heading paints before hydration */}
          <div>
            <div className="animate-fade-up">
              <Eyebrow dark>{profile.role}</Eyebrow>
            </div>
            <div className="animate-fade-up [animation-delay:80ms]">
              <h1 className="mt-6 text-[2.6rem] leading-[1.02] font-semibold sm:text-6xl xl:text-7xl">
                I don&apos;t just write code.
                <br />
                <span className="text-gradient">I build what&apos;s next.</span>
              </h1>
            </div>
            <div className="animate-fade-up [animation-delay:160ms]">
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                {profile.subheadline} Scalable{" "}
                <FlipWords words={["SaaS platforms", "Shopify Plus stores", "iOS & Android apps", "cloud architectures", "enterprise systems"]} className="font-semibold text-sky-300" />
              </p>
            </div>
            <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:240ms]">
              <MovingBorderLink href="/book-a-meeting">
                Book a free strategy call <ArrowRight className="size-4" />
              </MovingBorderLink>
              <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-sky-400/60 hover:text-sky-300">
                View 42 projects <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <div className="mt-12 grid max-w-xl animate-fade-up grid-cols-3 gap-4 border-t border-white/10 pt-8 [animation-delay:320ms]">
              {stats.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-3xl font-semibold text-white sm:text-4xl">{s.value}</p>
                  <p className="mt-1 text-xs text-white/55 sm:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[340px] sm:h-[460px] lg:h-[560px]" aria-hidden>
            <div className="absolute inset-0 animate-float">
              <LazyHeroScene />
            </div>
            <div className="absolute top-8 right-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs backdrop-blur-md sm:right-6">
              <p className="text-white/50">Mobile Core Web Vitals</p>
              <p className="font-heading text-2xl font-semibold text-sky-300">96/100</p>
            </div>
            <div className="absolute bottom-10 left-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs backdrop-blur-md sm:left-4">
              <p className="text-white/50">API routing latency</p>
              <p className="font-heading text-2xl font-semibold text-white">&lt;30ms</p>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 py-6">
          <Marquee duration="50s">
            {techMarquee.map((t) => (
              <span key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm whitespace-nowrap text-white/60">
                {t}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* --------------------------- Stats / Bio --------------------------- */}
      <section className="relative bg-white py-24">
        <div className="pointer-events-none absolute inset-0 bg-grid-light mask-radial" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="Who I am"
            title={<>Engineering technology. <span className="text-gradient-navy">Enabling growth.</span></>}
            description={profile.bio}
          />
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <div className={i % 3 === 0 ? "h-full rounded-3xl bg-navy-900 p-6 text-white" : "h-full rounded-3xl border border-slate-200 bg-white p-6"}>
                  <p className={i % 3 === 0 ? "font-heading text-4xl font-semibold text-sky-300" : "font-heading text-4xl font-semibold text-navy-900"}>{s.value}</p>
                  <p className="mt-2 font-semibold">{s.label}</p>
                  <p className={i % 3 === 0 ? "mt-1 text-sm text-white/60" : "mt-1 text-sm text-slate-500"}>{s.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- Capabilities --------------------------- */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="01 · Capabilities" title="Five disciplines. One accountable architect." description="From the first architecture diagram to the App Store release, every layer is designed to work together." />
          <CapabilityTabs />
        </div>
      </section>

      {/* ----------------------------- Services ----------------------------- */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="02 · Services" title="How I can help" description="Founders, startups, and enterprises hire me to design, build, and scale modern digital products." />
            <Link href="/services" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-navy-900 hover:text-sky-600">
              All services <ArrowRight className="size-4" />
            </Link>
          </div>
          <HoverEffect
            className="mt-10 -mx-2"
            items={services.map((s) => ({
              key: s.slug,
              content: (
                <Link href={`/services#${s.slug}`} className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 transition-colors hover:border-navy-900/20">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-navy-900 text-sky-300">
                      <ServiceIcon name={s.icon} className="size-6" />
                    </span>
                    <span className="font-mono text-sm text-slate-400">{s.number}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-ink">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.summary}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
                    {s.tech.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-md bg-navy-50 px-2 py-0.5 text-xs text-navy-700">{t}</span>
                    ))}
                  </div>
                </Link>
              ),
            }))}
          />
        </div>
      </section>

      {/* ---------------------------- Featured work ---------------------------- */}
      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-30 mask-radial" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading dark eyebrow="03 · Selected work" title="Products used by millions" description="A few highlights from 42 shipped projects across mobile, e-commerce, and enterprise software." />
            <Link href="/portfolio" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200">
              Full portfolio <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.08} className="h-full">
                <ProjectCard project={p} dark />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Results ----------------------------- */}
      <section className="border-y border-slate-200 bg-white py-10">
        <Marquee duration="45s">
          {highlights.map((h) => (
            <div key={h.project + h.metric} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-5 py-3 whitespace-nowrap">
              <span className="font-heading text-2xl font-semibold text-navy-900">{h.metric}</span>
              <span className="text-sm text-slate-600">{h.label}</span>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">{h.project}</span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ---------------------------- Architecture ---------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 to-ink py-24">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading dark eyebrow="04 · Architecture topology" title="Every request, every layer, engineered." description="Hover the stack to explore how I design production systems — from the edge to the database." />
          <TopologyExplorer />
        </div>
      </section>

      {/* ------------------------------ Process ------------------------------ */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="05 · How I work" title="From discovery to launch — and beyond" align="center" />
          <ol className="relative mt-16 grid gap-6 md:grid-cols-4">
            <div aria-hidden className="absolute top-7 right-[12%] left-[12%] hidden h-px bg-gradient-to-r from-navy-900 via-sky-400 to-navy-900 md:block" />
            {process.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.1}>
                <li className="relative text-center">
                  <span className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-navy-900 font-mono text-lg font-semibold text-sky-300 shadow-lg shadow-navy-900/25 ring-8 ring-white">
                    {p.step}
                  </span>
                  <h3 className="mt-6 text-lg font-semibold text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------- Philosophy ----------------------------- */}
      <section className="relative overflow-hidden bg-navy-900 py-24 text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal>
            <Eyebrow dark>06 · Philosophy</Eyebrow>
            <h2 className="mt-6 text-3xl font-semibold sm:text-5xl">
              Good code solves problems. <span className="text-sky-300">Great thinking creates possibilities.</span>
            </h2>
            <figure className="mx-auto mt-10 max-w-2xl">
              <Quote className="mx-auto size-8 text-sky-400" />
              <blockquote className="mt-4 text-lg leading-relaxed text-white/75">
                The best digital solutions are not simply developed. They are thoughtfully architected to create lasting value.
              </blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-sky-300">— Shafqat Rasool</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* -------------------------------- FAQ -------------------------------- */}
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <SectionHeading eyebrow="FAQ" title="Questions, answered" />
            <p className="mt-6 flex items-start gap-3 rounded-2xl bg-navy-50 p-5 text-sm text-navy-800">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-sky-600" />
              {profile.confidentiality}
            </p>
          </div>
          <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200">
            {faqs.map((f) => (
              <details key={f.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-heading text-lg font-semibold text-ink">
                  {f.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-900 transition group-open:rotate-45 group-open:bg-navy-900 group-open:text-white">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
