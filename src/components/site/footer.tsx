import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { navLinks, profile, services } from "@/lib/content";
import type { SiteSettings } from "@/lib/settings";
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, WhatsappIcon } from "./icons";
import { Logo } from "./logo";

export function Footer({ settings }: { settings: SiteSettings }) {
  const socials = [
    { href: profile.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: profile.socials.github, label: "GitHub", Icon: GithubIcon },
    { href: profile.socials.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: profile.socials.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: `https://wa.me/${settings.whatsapp}`, label: "WhatsApp", Icon: WhatsappIcon },
  ];

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-radial opacity-50" />
      <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-10 sm:px-6">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-navy-900 to-navy-950 p-8 sm:p-10 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-sky-300 uppercase">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Let&apos;s architect what&apos;s next.</h2>
            <p className="mt-3 max-w-lg text-white/70">{profile.confidentiality}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/book-a-meeting" className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-sky-300">
              Book a Meeting <ArrowUpRight className="size-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Send a message
            </Link>
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo dark />
            <p className="mt-4 text-sm leading-relaxed text-white/60">{profile.tagline}</p>
            <div className="mt-5 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/70 transition hover:border-sky-400/50 hover:text-sky-300">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Footer">
            <h3 className="text-sm font-semibold text-white">Navigate</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-sky-300">{l.label}</Link>
                </li>
              ))}
              <li><Link href="/book-a-meeting" className="hover:text-sky-300">Book a Meeting</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold text-white">Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services#${s.slug}`} className="hover:text-sky-300">{s.title.split(" & ")[0]}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="inline-flex items-center gap-2 hover:text-sky-300"><Mail className="size-4" /> {settings.contactEmail}</a>
              </li>
              <li>
                <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-sky-300"><Phone className="size-4" /> {settings.phone}</a>
              </li>
              <li className="text-white/40">{profile.location}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {2026} Shafqat Rasool. All rights reserved.</p>
          <p>{profile.footerLine}</p>
        </div>
      </div>
    </footer>
  );
}
