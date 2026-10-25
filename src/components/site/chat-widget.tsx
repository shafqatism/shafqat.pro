"use client";

import { AnimatePresence, motion } from "motion/react";
import { Mail, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { WhatsappIcon } from "./icons";

type Props = { whatsapp: string; phone: string; email: string };

/** Small navy chat bubble (bottom-right). Opens a compact popup: WhatsApp, Email, Call. */
export function ChatWidget({ whatsapp, phone, email }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const digits = whatsapp.replace(/\D/g, "");
  const options = [
    {
      label: "WhatsApp",
      hint: "Chat with me now",
      href: `https://wa.me/${digits}?text=${encodeURIComponent("Hi Shafqat, I found you on your website and would like to discuss a project.")}`,
      Icon: WhatsappIcon,
      external: true,
    },
    {
      label: "Email",
      hint: email,
      href: `mailto:${email}?subject=${encodeURIComponent("Project inquiry")}`,
      Icon: Mail,
      external: false,
    },
    {
      label: "Call",
      hint: phone,
      href: `tel:+${digits}`,
      Icon: Phone,
      external: false,
    },
  ];

  // close on Escape or when clicking outside the widget
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div
      ref={root}
      className="fixed right-3 bottom-3 z-40 flex flex-col items-end gap-2.5 sm:right-5 sm:bottom-5"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Contact options"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={{ transformOrigin: "bottom right" }}
            className="w-[min(17rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-navy-900/25"
          >
            <div className="flex items-center justify-between bg-navy-900 px-4 py-3 text-white">
              <div>
                <p className="font-heading text-sm font-semibold">Let&apos;s talk</p>
                <p className="text-[11px] text-white/60">Choose how you&apos;d like to reach me</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-7 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <ul className="p-2">
              {options.map(({ label, hint, href, Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-navy-50"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy-900 text-sky-300 transition group-hover:bg-sky-400 group-hover:text-ink">
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">{label}</span>
                      <span className="block truncate text-xs text-slate-500">{hint}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact options" : "Open contact options"}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "relative grid size-12 place-items-center rounded-full bg-navy-900 text-white shadow-lg shadow-navy-900/40 ring-1 ring-sky-400/40 transition duration-200 hover:scale-105 hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 active:scale-95",
        )}
      >
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-navy-700/50 [animation-duration:2.8s]" aria-hidden />}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? "x" : "chat"} initial={{ rotate: -80, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 80, opacity: 0 }} transition={{ duration: 0.14 }} className="grid place-items-center">
            {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
