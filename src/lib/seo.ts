import "server-only";
import type { Metadata } from "next";
import { profile, services } from "./content";
import { getAllPageSeo, getSettings, type SiteSettings } from "./settings";

type PageDefaults = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "profile";
};

/** Builds page metadata: code defaults, overridden by admin-managed SEO for that path. */
export async function pageMetadata(defaults: PageDefaults): Promise<Metadata> {
  const [settings, seo] = await Promise.all([getSettings(), getAllPageSeo()]);
  const override = seo[defaults.path];
  const title = override?.title || defaults.title;
  const description = override?.description || defaults.description;
  const keywords = override?.keywords?.length ? override.keywords : [...(defaults.keywords ?? []), ...settings.keywords];
  const image = override?.og_image || defaults.image || settings.ogImage;
  const isHome = defaults.path === "/";

  return {
    title: isHome ? { absolute: title } : title,
    description,
    keywords: [...new Set(keywords)],
    alternates: { canonical: defaults.path },
    robots: override?.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: defaults.type ?? "website",
      url: defaults.path,
      title,
      description,
      siteName: settings.siteName,
      locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: settings.twitterHandle,
      site: settings.twitterHandle,
      images: [image],
    },
  };
}

export function personJsonLd(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${settings.siteUrl}/#person`,
        name: profile.name,
        jobTitle: "Software Architect & Technology Leader",
        description: profile.bio,
        url: settings.siteUrl,
        email: `mailto:${settings.contactEmail}`,
        telephone: settings.phone,
        image: `${settings.siteUrl}/opengraph-image`,
        sameAs: Object.values(profile.socials),
        knowsAbout: ["Software Architecture", "Shopify Plus", "SaaS Development", "Mobile App Development", "Cloud Engineering", "FastAPI", "Next.js", "Flutter", "AWS", "Azure"],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${settings.siteUrl}/#business`,
        name: `${profile.name} — Software Architecture & Development`,
        url: settings.siteUrl,
        email: settings.contactEmail,
        telephone: settings.phone,
        image: `${settings.siteUrl}/opengraph-image`,
        founder: { "@id": `${settings.siteUrl}/#person` },
        areaServed: "Worldwide",
        address: { "@type": "PostalAddress", addressCountry: "PK" },
        priceRange: "$$$",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services",
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.title, description: s.summary, url: `${settings.siteUrl}/services#${s.slug}` },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${settings.siteUrl}/#website`,
        url: settings.siteUrl,
        name: settings.siteName,
        publisher: { "@id": `${settings.siteUrl}/#person` },
        inLanguage: "en",
      },
    ],
  };
}

export function breadcrumbJsonLd(siteUrl: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path === "/" ? "" : item.path}`,
    })),
  };
}
