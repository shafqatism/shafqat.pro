import type { MetadataRoute } from "next";
import { projects } from "@/lib/content";
import { getAllPageSeo, getSettings } from "@/lib/settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, seo] = await Promise.all([getSettings(), getAllPageSeo()]);
  const base = settings.siteUrl.replace(/\/$/, "");
  const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/portfolio", priority: 0.9, changeFrequency: "weekly" },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { path: "/book-a-meeting", priority: 0.9, changeFrequency: "monthly" },
    ...projects.map((p) => ({ path: `/portfolio/${p.slug}`, priority: p.caseStudy ? 0.7 : 0.5, changeFrequency: "monthly" as const })),
  ];
  return pages
    .filter((p) => !seo[p.path]?.noindex)
    .map((p) => ({ url: `${base}${p.path === "/" ? "" : p.path}`, priority: p.priority, changeFrequency: p.changeFrequency }));
}
