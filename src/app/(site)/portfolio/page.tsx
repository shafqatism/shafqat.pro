import { JsonLd } from "@/components/json-ld";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { PageHero } from "@/components/site/section";
import { projects } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return pageMetadata({
    path: "/portfolio",
    title: "Portfolio — Mobile Apps, E-Commerce Stores & Platforms",
    description:
      "Projects by Shafqat Rasool: Flutter and Android apps on Google Play, Shopify, WooCommerce and Magento stores, WordPress and Laravel websites, healthcare platforms, and SaaS products.",
    keywords: ["Flutter app developer", "Google Play apps", "web development portfolio", "Shopify portfolio", "WordPress portfolio", "Magento portfolio", "Laravel projects", "SaaS case study"],
  });
}

export default async function PortfolioPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title={<>{projects.length} projects. <span className="text-gradient">Built to perform.</span></>}
        description="Mobile apps on Google Play, Shopify, WooCommerce and Magento stores, WordPress and Laravel websites, healthcare platforms, and SaaS products."
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
            itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: p.caseStudy ? `${settings.siteUrl}/portfolio/${p.slug}` : (p.links?.[0]?.href ?? `${settings.siteUrl}/portfolio`), name: p.name })),
          },
        }}
      />
    </>
  );
}
