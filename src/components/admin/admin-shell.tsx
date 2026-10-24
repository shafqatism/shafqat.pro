"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, CalendarDays, ExternalLink, Gauge, Image as ImageIcon, Inbox, Loader2, LogOut, Menu, Plug, Search, Settings, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { Btn, inputClass } from "./ui";

const nav = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/integrations", label: "Integrations", icon: Plug },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/automation", label: "Claude & Automation", icon: Bot },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const pathname = usePathname();
  // the mobile sidebar belongs to the path it was opened on, so navigating closes it
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-svh place-items-center bg-slate-50">
        <Loader2 className="size-6 animate-spin text-navy-900" />
      </div>
    );
  }
  if (recovery && session) return <SetPassword onDone={() => setRecovery(false)} />;
  if (!session) return <Login />;
  if (session.user.app_metadata?.role !== "admin") return <NotAdmin email={session.user.email ?? ""} />;

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-svh bg-slate-50 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className={cn("fixed inset-y-0 left-0 z-40 w-[260px] -translate-x-full bg-sidebar text-sidebar-foreground transition-transform lg:sticky lg:top-0 lg:h-svh lg:translate-x-0", open && "translate-x-0")}>
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between px-2 py-2">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-sky-400 font-heading text-sm font-bold text-ink">SR</span>
              <span className="font-heading font-semibold text-white">Admin</span>
            </Link>
            <button type="button" className="lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X className="size-5" /></button>
          </div>
          <nav className="mt-6 flex-1 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", isActive(item.href) ? "bg-sidebar-accent text-white" : "text-white/65 hover:bg-white/5 hover:text-white")}
              >
                <item.icon className={cn("size-4", isActive(item.href) && "text-sky-300")} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="space-y-1 border-t border-sidebar-border pt-4">
            <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 hover:bg-white/5 hover:text-white">
              <ExternalLink className="size-4" /> View website
            </Link>
            <button type="button" onClick={() => supabaseBrowser().auth.signOut()} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/65 hover:bg-white/5 hover:text-white">
              <LogOut className="size-4" /> Sign out
            </button>
            <p className="truncate px-3 pt-2 text-xs text-white/40">{session.user.email}</p>
          </div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:hidden">
          <button type="button" aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="size-5" /></button>
          <span className="font-heading font-semibold">shafqat.pro admin</span>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden bg-ink px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-radial" />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white p-7 shadow-2xl">
        <span className="grid size-11 place-items-center rounded-2xl bg-navy-900 font-heading font-bold text-sky-300">SR</span>
        <h1 className="mt-5 font-heading text-2xl font-semibold text-ink">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
  }

  async function reset() {
    if (!email) return toast.error("Enter your email first.");
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin` });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent — check your inbox.");
  }

  return (
    <AuthCard title="Sign in to admin">
      <form onSubmit={signIn} className="mt-6 grid gap-4">
        <input className={inputClass} type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={inputClass} type="password" required autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Btn type="submit" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} Sign in</Btn>
        <button type="button" onClick={reset} className="text-sm text-slate-500 hover:text-navy-900">Forgot password?</button>
      </form>
    </AuthCard>
  );
}

function SetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    onDone();
  }
  return (
    <AuthCard title="Set a new password">
      <form onSubmit={save} className="mt-6 grid gap-4">
        <input className={inputClass} type="password" minLength={8} required autoComplete="new-password" placeholder="New password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Btn type="submit">Save password</Btn>
      </form>
    </AuthCard>
  );
}

function NotAdmin({ email }: { email: string }) {
  return (
    <AuthCard title="Not authorized">
      <p className="mt-3 text-sm text-slate-600">
        <strong>{email}</strong> is signed in but isn&apos;t an admin. Add this email to <code>public.admin_emails</code> in Supabase, then sign out and back in.
      </p>
      <Btn className="mt-6 w-full" variant="ghost" onClick={() => supabaseBrowser().auth.signOut()}>Sign out</Btn>
    </AuthCard>
  );
}
