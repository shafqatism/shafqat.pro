import Link from "next/link";
import { CalendarCheck, Clock, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { JsonLd } from "@/components/json-ld";
import { WhatsappIcon } from "@/components/site/icons";
import { PageHero } from "@/components/site/section";
import { profile } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata() {
  return pageMetadata({
    path: "/contact",
    title: "Contact Shafqat Rasool — Start Your Project",
    description: "Tell me about your software, Shopify, SaaS, mobile, or cloud project. Replies within one business day. Email info@shafqat.pro or message on WhatsApp.",
  });
}

export default async function ContactPage() {
  const settings = await getSettings();
  const channels = [
    { icon: Mail, label: "Email", value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    { icon: WhatsappIcon, label: "WhatsApp", value: settings.phone, href: `https://wa.me/${settings.whatsapp}` },
    { icon: CalendarCheck, label: "Book a call", value: "Pick a time that suits you", href: "/book-a-meeting" },
  ];

  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let&apos;s build <span className="text-gradient">what&apos;s next.</span></>} description="Share a few details about your project and I'll get back to you within one business day with next steps." />

      <section className="relative bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:-mt-36 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
          <div className="relative z-10">
            <ContactForm />
          </div>
          <aside className="relative z-10 space-y-4 lg:pt-36">
            {channels.map((c) => (
              <Link key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-navy-900 hover:shadow-lg">
                <span className="grid size-12 place-items-center rounded-xl bg-navy-900 text-sky-300 transition group-hover:bg-sky-400 group-hover:text-ink">
                  <c.icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm text-slate-500">{c.label}</span>
                  <span className="block font-semibold text-ink">{c.value}</span>
                </span>
              </Link>
            ))}
            <div className="space-y-3 rounded-2xl bg-ink p-5 text-sm text-white/70">
              <p className="flex items-center gap-3"><Clock className="size-4 text-sky-400" /> Replies within 1 business day</p>
              <p className="flex items-center gap-3"><MapPin className="size-4 text-sky-400" /> {profile.location}</p>
              <p className="text-white/50">{profile.confidentiality}</p>
            </div>
          </aside>
        </div>
      </section>

      <JsonLd data={breadcrumbJsonLd(settings.siteUrl, [{ name: "Contact", path: "/contact" }])} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Shafqat Rasool", url: `${settings.siteUrl}/contact` }} />
    </>
  );
}
