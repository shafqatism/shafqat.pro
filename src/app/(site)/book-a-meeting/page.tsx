import { CheckCircle2 } from "lucide-react";
import { LazyBookingWidget } from "@/components/forms/booking-widget-lazy";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/site/section";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return pageMetadata({
    path: "/book-a-meeting",
    title: "Book a Meeting — Free Discovery Call",
    description: "Book a free discovery call with Shafqat Rasool. Pick a time in your time zone and get an instant calendar invite for your software, Shopify, SaaS, or mobile project.",
  });
}

const expectations = ["Clarify your goals & constraints", "Get a high-level architecture direction", "Honest estimate of scope & timeline", "Clear next steps — no obligation"];

export default async function BookMeetingPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHero eyebrow="Book a meeting" title={<>Let&apos;s talk about <span className="text-gradient">your project.</span></>} description="Choose a topic and a time that works for you. The invite lands in your calendar instantly.">
        <ul className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          {expectations.map((e) => (
            <li key={e} className="flex items-center gap-3 text-sm text-white/80"><CheckCircle2 className="size-4 text-sky-400" /> {e}</li>
          ))}
        </ul>
      </PageHero>
      <section className="bg-slate-50 pb-24">
        <div className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:px-6">
          <LazyBookingWidget config={settings.booking} />
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd(settings.siteUrl, [{ name: "Book a Meeting", path: "/book-a-meeting" }])} />
    </>
  );
}
