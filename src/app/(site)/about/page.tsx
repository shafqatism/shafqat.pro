import Link from "next/link";
import { ArrowRight, Award, Globe2, Layers, ShieldCheck, Sparkles, Users } from "lucide-react";
import { CardBody, CardContainer, CardItem } from "@/components/aceternity/card-3d";
import { Reveal } from "@/components/aceternity/reveal";
import { JsonLd } from "@/components/json-ld";
import { PageHero, SectionHeading } from "@/components/site/section";
import { capabilities, process, profile, projects, services, stats } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return pageMetadata({
    path: "/about",
    title: "About Shafqat Rasool — Software Architect & Technology Leader",
    description:
      "Meet Shafqat Rasool: 10+ years architecting SaaS platforms, Shopify Plus stores, iOS & Android apps, and cloud-native systems for founders and enterprises worldwide.",
    type: "profile",
  });
}

const values = [
  { icon: Layers, title: "Architecture first", text: "Clear domain boundaries and data models before code, so products scale without rewrites." },
  { icon: ShieldCheck, title: "Security by default", text: "Zero-trust auth, encrypted storage, and least-privilege access on every project." },
  { icon: Sparkles, title: "Obsessive performance", text: "Sub-second pages, 60fps apps, and sub-30ms APIs — speed is a feature." },
  { icon: Users, title: "Founder mindset", text: "I think in revenue, retention, and runway, not just tickets and sprints." },
  { icon: Globe2, title: "Global delivery", text: "Clients across the US, UK, Europe, GCC, and Australia — async-friendly and on time." },
  { icon: Award, title: "Ownership", text: "One accountable architect from strategy to launch, and long after." },
];

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>Technology leader. <span className="text-gradient">Software architect.</span> Digital strategist.</>}
        description={profile.bio}
      />

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <CardContainer>
              <CardBody className="relative h-[440px] w-full max-w-md rounded-[2rem] bg-gradient-to-br from-navy-900 via-navy-800 to-ink p-8 text-white shadow-2xl shadow-navy-900/30">
                <div className="absolute inset-0 rounded-[2rem] bg-grid opacity-40" />
                <CardItem translateZ={50} className="relative">
                  <span className="grid size-20 place-items-center rounded-3xl bg-sky-400 font-heading text-3xl font-bold text-ink">SR</span>
                </CardItem>
                <CardItem translateZ={70} className="relative mt-8">
                  <p className="font-heading text-3xl font-semibold">{profile.name}</p>
                  <p className="mt-1 text-sky-300">{profile.role}</p>
                </CardItem>
                <CardItem translateZ={40} className="relative mt-8 grid grid-cols-3 gap-3">
                  {[
                    { v: "10+", l: "Years" },
                    { v: String(projects.length), l: "Projects" },
                    { v: String(services.length), l: "Services" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                      <p className="font-heading text-2xl font-semibold">{s.v}</p>
                      <p className="text-[11px] text-white/60">{s.l}</p>
                    </div>
                  ))}
                </CardItem>
                <CardItem translateZ={30} className="absolute right-8 bottom-8 left-8 text-sm text-white/60">
                  {profile.location}
                </CardItem>
              </CardBody>
            </CardContainer>
          </Reveal>
          <div>
            <SectionHeading eyebrow="My story" title="I turn complex business challenges into scalable products." />
            <Reveal delay={0.1} className="mt-6 space-y-4 text-lg leading-relaxed text-slate-600">
              <p>
                For more than a decade I&apos;ve designed and shipped software that real businesses run on — from ride-hailing platforms and IoT fleet
                telematics to Shopify Plus stores in the GCC and SaaS engines for subscription companies.
              </p>
              <p>
                I work end-to-end: product strategy and system blueprints, full-stack engineering, App Store and Play Store releases, and
                cloud infrastructure on AWS and Azure. That means fewer handoffs, faster delivery, and one person accountable for the outcome.
              </p>
              <p>{profile.confidentiality}</p>
            </Reveal>
            <Reveal delay={0.2} className="mt-8 flex flex-wrap gap-3">
              <Link href="/book-a-meeting" className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-800">
                Book a meeting <ArrowRight className="size-4" />
              </Link>
              <Link href="/portfolio" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-navy-900 hover:border-navy-900/30">
                See my work
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ink py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading dark eyebrow="By the numbers" title="Impact you can measure" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-white/10 bg-gradient-to-b from-navy-900/80 to-transparent p-6">
                  <p className="font-heading text-5xl font-semibold text-sky-300">{s.value}</p>
                  <p className="mt-3 font-semibold">{s.label}</p>
                  <p className="mt-1 text-sm text-white/55">{s.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="Values" title="How I approach every engagement" align="center" />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={(i % 3) * 0.08}>
                <div className="group h-full rounded-3xl border border-slate-200 p-7 transition hover:-translate-y-1 hover:border-navy-900 hover:bg-navy-900 hover:text-white hover:shadow-xl hover:shadow-navy-900/20">
                  <v.icon className="size-7 text-sky-500 group-hover:text-sky-300" />
                  <h3 className="mt-5 text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 group-hover:text-white/70">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Expertise" title="Deep across the stack" />
            <div className="mt-8 space-y-3">
              {capabilities.map((c) => (
                <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="font-semibold text-ink">{c.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{c.skills.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Process" title="A proven delivery path" />
            <ol className="mt-8 space-y-4 border-l-2 border-navy-900/15 pl-6">
              {process.map((p) => (
                <li key={p.step} className="relative">
                  <span className="absolute top-1 -left-[33px] size-4 rounded-full border-4 border-slate-50 bg-sky-500" />
                  <p className="font-mono text-xs text-sky-600">{p.step}</p>
                  <p className="font-semibold text-ink">{p.title}</p>
                  <p className="text-sm text-slate-600">{p.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd(settings.siteUrl, [{ name: "About", path: "/about" }])} />
    </>
  );
}
