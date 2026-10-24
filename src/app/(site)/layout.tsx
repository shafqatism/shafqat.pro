import { JsonLd } from "@/components/json-ld";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { WhatsappFab } from "@/components/site/whatsapp-fab";
import { Analytics } from "@/components/tracking/analytics";
import { personJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Navbar />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      {settings.whatsappWidget && <WhatsappFab number={settings.whatsapp} />}
      <JsonLd data={personJsonLd(settings)} />
      <Analytics tracking={settings.tracking} />
    </>
  );
}
