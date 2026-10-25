import Link from "next/link";
import { ArrowRight, BadgeCheck, CheckCircle2, Gauge, MessageCircle } from "lucide-react";
import { MovingBorderLink } from "@/components/aceternity/moving-border";
import { Reveal } from "@/components/aceternity/reveal";
import { JsonLd } from "@/components/json-ld";
import { ProductGlyph } from "@/components/site/product-icon";
import { PageHero, SectionHeading } from "@/components/site/section";
import { type CatalogProduct, productCatalog, productGroups, products } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return pageMetadata({
    path: "/products",
    title: "Products — Ready-to-Use Business Software",
    description:
      "Ready-to-use clinic, hospital, education, restaurant, POS, distribution, warehouse, HR, LMS, pharma ERP, car rental and multi-vendor e-commerce software, plus custom ERP on demand.",
    keywords: [
      "clinic management system", "hospital management system", "school management software", "restaurant POS software", "distribution management system",
      "warehouse management system", "HR software", "LMS", "pharmaceutical ERP", "car rental software", "multi-vendor marketplace", "custom ERP development",
    ],
  });
}

const demoHref = (name: string) => `/book-a-meeting?type=${encodeURIComponent("Ready-to-Use Software Demo")}&product=${encodeURIComponent(name)}`;

function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article id={product.slug} className="group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-navy-900/30 hover:shadow-[0_24px_60px_-24px_rgba(10,26,63,0.4)]">
      {/* illustration strip: gradient + oversized icon */}
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-700 to-sky-500">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <ProductGlyph name={product.icon} aria-hidden strokeWidth={1.25} className="absolute -right-3 -bottom-6 size-36 text-white/20 transition duration-500 group-hover:scale-110 group-hover:-rotate-6" />
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-navy-900">
          <BadgeCheck className="size-3.5 text-emerald-500" /> Ready to use
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        {/* icon in front of the title */}
        <div className="-mt-12 flex items-end gap-4">
          <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl border-4 border-white bg-navy-900 text-sky-300 shadow-lg shadow-navy-900/25">
            <ProductGlyph name={product.icon} className="size-6" />
          </span>
        </div>
        <h3 className="mt-3 text-xl leading-snug font-semibold text-ink">{product.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{product.summary}</p>

        {product.includes && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {product.includes.map((i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 ring-1 ring-sky-200">
                {i === "WhatsApp" && <MessageCircle className="size-3" />} {i}
              </span>
            ))}
          </div>
        )}

        <ul className="mt-5 space-y-2 text-sm text-slate-700">
          {product.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-500" /> {f}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          <Link href={demoHref(product.name)} className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800">
            Book a demo <ArrowRight className="size-4" />
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-navy-900 underline-offset-4 hover:underline">
            Get a quote
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function ProductsPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Products"
        title={<>Ready-to-use software, <span className="text-gradient">available today.</span></>}
        description="Proven management systems for healthcare, education, retail, distribution, HR and more. Every product below is ready to use and available now, and can be customised to your business."
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
            <BadgeCheck className="size-4" /> All {productCatalog.length} products ready to use &amp; available
          </span>
          <nav aria-label="Product groups" className="flex flex-wrap gap-2">
            {productGroups.map((g) => (
              <a key={g.name} href={`#${g.name.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-sky-400 hover:text-sky-300">
                {g.name}
              </a>
            ))}
          </nav>
        </div>
      </PageHero>

      {productGroups.map((group, gi) => {
        const items = productCatalog.filter((p) => p.group === group.name);
        return (
          <section key={group.name} id={group.name.toLowerCase().replace(/[^a-z]+/g, "-")} className={`scroll-mt-20 py-20 ${gi % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <SectionHeading eyebrow={`0${gi + 1} · ${items.length} products`} title={group.name} description={group.blurb} />
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {items.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 3) * 0.08} className="h-full">
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="relative overflow-hidden bg-navy-900 py-20 text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">Don&apos;t see your industry?</h2>
            <p className="mt-3 max-w-xl text-white/70">A custom ERP can be built on demand for any industry and customised around how your business actually works.</p>
          </div>
          <MovingBorderLink href={demoHref("Custom ERP")}>
            Talk about a custom ERP <ArrowRight className="size-4" />
          </MovingBorderLink>
        </div>
      </section>

      <section id="blueprints" className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="pointer-events-none absolute inset-0 bg-grid mask-radial" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading dark eyebrow="Platforms" title="Ready-to-deploy architecture platforms" description="Battle-tested foundations that cut months off your roadmap, licensed or custom-deployed for your business." />
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

      <JsonLd data={breadcrumbJsonLd(settings.siteUrl, [{ name: "Products", path: "/products" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Ready-to-use business software",
          itemListElement: productCatalog.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "SoftwareApplication",
              name: p.name,
              description: p.summary,
              applicationCategory: "BusinessApplication",
              url: `${settings.siteUrl}/products#${p.slug}`,
              provider: { "@id": `${settings.siteUrl}/#person` },
            },
          })),
        }}
      />
    </>
  );
}
