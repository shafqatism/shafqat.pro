import { JsonLd } from "@/components/json-ld";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { PageHero } from "@/components/site/section";
import { projects } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return pageMetadata({
    path: "/portfolio",
    title: "Portfolio — 42 Projects in Mobile, Shopify, SaaS & Custom Software",
    description:
      "Case studies and projects by Shafqat Rasool: iOS & Android apps with millions of users, Shopify Plus stores, enterprise e-commerce, ERP, and SaaS platforms.",
    keywords: ["software portfolio", "mobile app case study", "Shopify Plus portfolio", "SaaS case study"],
  });
}

export default async function PortfolioPage() {
  const settings = await getSettings();
  const mobile = projects.filter((p) => p.category === "Mobile Apps").length;

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title={<>{projects.length} projects. <span className="text-gradient">Millions of users.</span></>}
        description={`A directory of shipped work — ${mobile} mobile apps on the App Store and Google Play, high-converting Shopify and custom e-commerce, and enterprise SaaS platforms.`}
      />
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <PortfolioGrid />
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd(settings.siteUrl, [{ name: "Portfolio", path: "/portfolio" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Portfolio",
          url: `${settings.siteUrl}/portfolio`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: projects.length,
            itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${settings.siteUrl}/portfolio/${p.slug}`, name: p.name })),
          },
        }}
      />
    </>
  );
}
