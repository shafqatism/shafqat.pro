import Link from "next/link";
import { ArrowRight, CheckCircle2, Gauge } from "lucide-react";
import { MovingBorderLink } from "@/components/aceternity/moving-border";
import { Reveal } from "@/components/aceternity/reveal";
import { JsonLd } from "@/components/json-ld";
import { PageHero, SectionHeading } from "@/components/site/section";
import { ServiceIcon } from "@/components/site/service-icon";
import { products, services } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return pageMetadata({
    path: "/services",
    title: "Services — Software Architecture, Shopify, SaaS, Mobile & Cloud",
    description:
      "Custom software and API development, Shopify & Next.js websites, SaaS MVPs, iOS/Android/Flutter apps, AWS & Azure cloud engineering, and product strategy.",
    keywords: ["software architecture services", "Shopify Plus developer", "SaaS MVP development", "Flutter app developer", "AWS cloud engineer"],
  });
}

export default async function ServicesPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={<>Design, develop & <span className="text-gradient">scale</span> modern digital solutions.</>}
        description="I help founders, startups, and businesses design, develop, and scale modern digital solutions through software architecture, engineering, cloud technologies, and strategic product development."
      >
        <nav aria-label="Services" className="mt-10 flex flex-wrap gap-2">
          {services.map((s) => (
            <a key={s.slug} href={`#${s.slug}`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-sky-400 hover:text-sky-300">
              {s.number} · {s.title.split(" & ")[0]}
            </a>
          ))}
        </nav>
      </PageHero>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
          {services.map((s, i) => (
            <Reveal key={s.slug}>
              <article
                id={s.slug}
                className={
                  i % 2 === 0
                    ? "grid scroll-mt-28 gap-8 rounded-[2rem] border border-slate-200 bg-white p-8 sm:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
                    : "grid scroll-mt-28 gap-8 rounded-[2rem] bg-navy-900 p-8 text-white sm:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
                }
              >
                <div>
                  <div className="flex items-center gap-4">
                    <span className={i % 2 === 0 ? "grid size-14 place-items-center rounded-2xl bg-navy-900 text-sky-300" : "grid size-14 place-items-center rounded-2xl bg-sky-400 text-ink"}>
                      <ServiceIcon name={s.icon} className="size-7" />
                    </span>
                    <span className={i % 2 === 0 ? "font-mono text-sm text-slate-400" : "font-mono text-sm text-white/40"}>{s.number}</span>
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold sm:text-3xl">{s.title}</h2>
                  <p className={i % 2 === 0 ? "mt-3 text-slate-600" : "mt-3 text-white/70"}>{s.summary}</p>
                  <Link
                    href={`/book-a-meeting?type=${encodeURIComponent(s.title)}`}
                    className={
                      i % 2 === 0
                        ? "mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
                        : "mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 hover:bg-sky-100"
                    }
                  >
                    Book a meeting <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className={i % 2 === 0 ? "text-xs font-semibold tracking-[0.2em] text-sky-600 uppercase" : "text-xs font-semibold tracking-[0.2em] text-sky-300 uppercase"}>Capabilities</h3>
                    <ul className="mt-4 space-y-2.5">
                      {s.capabilities.map((c) => (
                        <li key={c} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-500" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className={i % 2 === 0 ? "text-xs font-semibold tracking-[0.2em] text-sky-600 uppercase" : "text-xs font-semibold tracking-[0.2em] text-sky-300 uppercase"}>Core tech</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.tech.map((t) => (
                        <span key={t} className={i % 2 === 0 ? "rounded-lg bg-navy-50 px-3 py-1.5 text-sm text-navy-800" : "rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm"}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="products" className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-radial" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading dark eyebrow="Products" title="Ready-to-deploy platforms" description="Battle-tested foundations that cut months off your roadmap — licensed or custom-deployed for your business." />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {products.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08} className="h-full">
                <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-navy-900 to-navy-950 p-7 transition hover:border-sky-400/40 hover:shadow-[0_0_50px_-12px_rgba(56,189,248,0.4)]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-300">{p.category}</span>
                    <span className="font-mono text-sm text-white/30">{p.number}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-sky-200/80">{p.tagline}</p>
                  <p className="mt-4 text-sm leading-relaxed text-white/65">{p.description}</p>
                  <ul className="mt-5 space-y-2 text-sm text-white/80">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-400" />{f}</li>
                    ))}
                  </ul>
                  <div className="mt-6 space-y-2 rounded-2xl border border-sky-400/20 bg-sky-400/5 p-4">
                    {p.benchmarks.map((b) => (
                      <p key={b} className="flex items-center gap-2 text-sm text-sky-100"><Gauge className="size-4 text-sky-400" />{b}</p>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {p.stack.map((t) => <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/60">{t}</span>)}
                  </div>
                  <p className="mt-auto pt-6 text-xs text-white/40">{p.licensing} · {p.useCases.join(" · ")}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-semibold text-ink sm:text-5xl">Ready to architect your solution?</h2>
          <p className="mt-4 text-lg text-slate-600">Book a free discovery call and get an architecture roadmap for your project.</p>
          <div className="mt-8 flex justify-center">
            <MovingBorderLink href="/book-a-meeting">Book a meeting <ArrowRight className="size-4" /></MovingBorderLink>
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd(settings.siteUrl, [{ name: "Services", path: "/services" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: { "@type": "Service", name: s.title, description: s.summary, provider: { "@id": `${settings.siteUrl}/#person` }, url: `${settings.siteUrl}/services#${s.slug}` },
          })),
        }}
      />
    </>
  );
}
