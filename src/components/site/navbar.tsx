"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/content";
import { captureUtm } from "@/lib/track";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // the menu belongs to the path it was opened on, so navigating closes it
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  useEffect(() => {
    captureUtm();
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border px-3 transition-all duration-300 sm:px-4",
          scrolled ? "border-slate-200 bg-white shadow-lg shadow-navy-900/10" : "border-slate-200 bg-white shadow-sm",
        )}
      >
        <Logo variant="text" />

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(link.href) ? "text-white" : "text-slate-600 hover:text-navy-900",
                )}
              >
                {isActive(link.href) && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-navy-900" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/book-a-meeting"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-navy-900 px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-navy-900/20 transition hover:bg-navy-800 sm:px-4"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-sky-400/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <CalendarCheck className="size-4 text-sky-300" />
            <span className="hidden sm:inline">Book a Meeting</span>
            <span className="sm:hidden">Book</span>
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl text-navy-900 hover:bg-navy-50 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpenOn(open ? null : pathname)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-navy-900/15 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("block rounded-xl px-4 py-3 text-base font-medium", isActive(link.href) ? "bg-navy-900 text-white" : "text-slate-700 hover:bg-navy-50 hover:text-navy-900")}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
