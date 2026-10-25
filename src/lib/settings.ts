import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export type TrackingSettings = {
  gtmId: string;
  ga4Id: string;
  googleAdsId: string;
  googleAdsLeadLabel: string;
  googleAdsBookingLabel: string;
  metaPixelId: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  facebookDomainVerification: string;
};

export type BookingSettings = {
  timezone: string;
  slotMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
  workingDays: number[];
  startHour: number;
  endHour: number;
  meetingTypes: string[];
};

export type SiteSettings = {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  keywords: string[];
  ogImage: string;
  twitterHandle: string;
  contactEmail: string;
  whatsapp: string;
  phone: string;
  tracking: TrackingSettings;
  booking: BookingSettings;
  whatsappWidget: boolean;
};

export type PageSeo = {
  path: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  og_image: string | null;
  noindex: boolean;
};

export const defaultSettings: SiteSettings = {
  siteName: "Shafqat Rasool",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shafqat.pro",
  defaultTitle: "Shafqat Rasool | Software Architect & Full-Stack Developer",
  titleTemplate: "%s | Shafqat Rasool",
  defaultDescription:
    "Portfolio of Shafqat Rasool, a software architect and technology leader with 10+ years of experience in custom software, Shopify, SaaS, mobile app development, and cloud engineering.",
  keywords: ["Shafqat Rasool", "Software Architect", "Full-Stack Developer", "Shopify Developer", "Mobile App Development", "SaaS Development"],
  ogImage: "/opengraph-image",
  twitterHandle: "@shafqatrasool",
  contactEmail: "info@shafqat.pro",
  whatsapp: "923045101870",
  phone: "+92 304 5101870",
  tracking: {
    gtmId: "",
    ga4Id: "",
    googleAdsId: "",
    googleAdsLeadLabel: "",
    googleAdsBookingLabel: "",
    metaPixelId: "",
    googleSiteVerification: "",
    bingSiteVerification: "",
    facebookDomainVerification: "",
  },
  booking: {
    timezone: "Asia/Karachi",
    slotMinutes: 30,
    bufferMinutes: 15,
    minNoticeHours: 12,
    maxDaysAhead: 30,
    workingDays: [1, 2, 3, 4, 5, 6],
    startHour: 10,
    endHour: 19,
    meetingTypes: [
      "Discovery Call",
      "Software Architecture Review",
      "Custom Software & Backend Development",
      "Website & Web App Development",
      "Shopify & E-Commerce Store",
      "Mobile App Development (iOS / Android)",
      "SaaS / MVP Development",
      "Cloud, DevOps & Infrastructure",
      "ERP & Business Automation",
      "Product Strategy & Technical Consulting",
      "Existing Project Support / Rescue",
      "Ready-to-Use Software Demo",
      "Partnership / Something Else",
    ],
  },
  whatsappWidget: true,
};

// Anonymous, cookie-less client: safe inside `use cache` and at build time.
function publicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Site-wide settings from Supabase, cached and refreshed on the "settings" tag. */
export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  try {
    const { data, error } = await publicClient().from("site_settings").select("data").eq("id", 1).single();
    if (error || !data) return defaultSettings;
    const stored = data.data as Partial<SiteSettings>;
    return {
      ...defaultSettings,
      ...stored,
      tracking: { ...defaultSettings.tracking, ...(stored.tracking ?? {}) },
      booking: { ...defaultSettings.booking, ...(stored.booking ?? {}) },
    };
  } catch {
    return defaultSettings;
  }
}

/** All per-page SEO overrides keyed by path, refreshed on the "seo" tag. */
export async function getAllPageSeo(): Promise<Record<string, PageSeo>> {
  "use cache";
  cacheTag("seo");
  cacheLife("hours");
  try {
    const { data } = await publicClient().from("page_seo").select("path,title,description,keywords,og_image,noindex");
    return Object.fromEntries((data ?? []).map((row) => [row.path, row as PageSeo]));
  } catch {
    return {};
  }
}
