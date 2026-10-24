import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const { tracking } = settings;
  const other: Record<string, string> = {};
  if (tracking.bingSiteVerification) other["msvalidate.01"] = tracking.bingSiteVerification;
  if (tracking.facebookDomainVerification) other["facebook-domain-verification"] = tracking.facebookDomainVerification;

  return {
    metadataBase: new URL(settings.siteUrl),
    title: { default: settings.defaultTitle, template: settings.titleTemplate },
    description: settings.defaultDescription,
    keywords: settings.keywords,
    applicationName: settings.siteName,
    authors: [{ name: "Shafqat Rasool", url: settings.siteUrl }],
    creator: "Shafqat Rasool",
    publisher: "Shafqat Rasool",
    category: "technology",
    formatDetection: { telephone: false },
    verification: { google: tracking.googleSiteVerification || undefined, other },
    twitter: { card: "summary_large_image", creator: settings.twitterHandle, site: settings.twitterHandle },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050d24" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full`}>
      <body className="min-h-full">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
