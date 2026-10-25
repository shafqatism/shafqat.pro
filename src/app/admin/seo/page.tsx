"use client";

import { Loader2, Save, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Btn, FieldRow, inputClass, PageHeader, Panel, textareaClass } from "@/components/admin/ui";
import { useSiteSettings } from "@/components/admin/use-settings";
import { projects, services } from "@/lib/content";
import type { PageSeo } from "@/lib/settings";
import { adminApi, revalidateSite, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const corePages = [
  { path: "/", label: "Home", context: "Homepage: hero, capabilities, services, featured work, architecture, process, FAQ." },
  { path: "/about", label: "About", context: "About Shafqat Rasool: story, stats, values, expertise and process." },
  { path: "/services", label: "Services", context: `Services: ${services.map((s) => `${s.title} (${s.tech.join(", ")})`).join("; ")}. Plus ERP, SaaS engine and API gateway products.` },
  { path: "/products", label: "Products", context: "Ready-to-use business software: clinic, hospital, education, LMS, law firm, POS, restaurant, distribution, warehouse, HR, project management, pharma ERP, custom ERP, marketing automation, car rental, multi-vendor." },
  { path: "/portfolio", label: "Portfolio", context: `Portfolio of ${projects.length} projects: mobile apps, Shopify, WooCommerce, Magento, WordPress, Laravel, healthcare, real estate and SaaS.` },
  { path: "/contact", label: "Contact", context: "Contact form, email info@shafqat.pro, WhatsApp, replies within one business day." },
  { path: "/book-a-meeting", label: "Book a meeting", context: "Free discovery call booking with live availability and instant calendar invites." },
];
const pages = [
  ...corePages,
  ...projects.map((p) => ({ path: `/portfolio/${p.slug}`, label: p.name, context: `${p.name} (${p.category}${p.region ? `, ${p.region}` : ""}): ${p.caseStudy?.overview ?? p.summary} Stack: ${p.stack.join(", ")}.` })),
];

const empty = (path: string): PageSeo => ({ path, title: "", description: "", keywords: [], og_image: "", noindex: false });

export default function SeoPage() {
  const { settings, setSettings, save, saving } = useSiteSettings();
  const [overrides, setOverrides] = useState<Record<string, PageSeo>>({});
  const [path, setPath] = useState("/");
  // unsaved edits per path, layered over the saved overrides
  const [edits, setEdits] = useState<Record<string, PageSeo>>({});
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabaseBrowser().from("page_seo").select("*").then(({ data }) => {
      setOverrides(Object.fromEntries((data ?? []).map((r) => [r.path, r as PageSeo])));
    });
  }, []);

  const form = edits[path] ?? overrides[path] ?? empty(path);
  const setForm = (next: PageSeo | ((f: PageSeo) => PageSeo)) =>
    setEdits((e) => ({ ...e, [path]: typeof next === "function" ? next(e[path] ?? overrides[path] ?? empty(path)) : next }));

  const page = pages.find((p) => p.path === path)!;
  const visiblePages = useMemo(() => pages.filter((p) => !query || p.label.toLowerCase().includes(query.toLowerCase()) || p.path.includes(query.toLowerCase())), [query]);

  async function savePage() {
    setBusy(true);
    const row = { ...form, title: form.title || null, description: form.description || null, og_image: form.og_image || null };
    const { data, error } = await supabaseBrowser().from("page_seo").upsert(row).select("*").single();
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    setOverrides((o) => ({ ...o, [path]: data as PageSeo }));
    setEdits((e) => Object.fromEntries(Object.entries(e).filter(([p]) => p !== path)));
    await revalidateSite(["seo"]).catch(() => null);
    setBusy(false);
    toast.success(`SEO saved for ${path}`);
  }

  async function generate() {
    setGenerating(true);
    try {
      const { result } = await adminApi<{ result: { title: string; description: string; keywords: string[] } }>("/api/ai", { task: "seo", path, context: page.context });
      setForm((f) => ({ ...f, ...result }));
      toast.success("Claude drafted SEO — review and save.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <PageHeader title="SEO" description="Global defaults and per-page overrides. Changes go live instantly (pages stay static)." />

      {settings && (
        <Panel title="Global SEO" className="mb-6" actions={<Btn onClick={() => save({})} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save</Btn>}>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldRow label="Default title"><input className={inputClass} value={settings.defaultTitle} onChange={(e) => setSettings({ ...settings, defaultTitle: e.target.value })} /></FieldRow>
            <FieldRow label="Title template" hint="%s is replaced by the page title"><input className={inputClass} value={settings.titleTemplate} onChange={(e) => setSettings({ ...settings, titleTemplate: e.target.value })} /></FieldRow>
            <div className="md:col-span-2">
              <FieldRow label="Default description" hint={`${settings.defaultDescription.length}/160`}><textarea className={textareaClass} rows={2} value={settings.defaultDescription} onChange={(e) => setSettings({ ...settings, defaultDescription: e.target.value })} /></FieldRow>
            </div>
            <FieldRow label="Keywords" hint="Comma separated"><input className={inputClass} value={settings.keywords.join(", ")} onChange={(e) => setSettings({ ...settings, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })} /></FieldRow>
            <FieldRow label="Default share image (OG)" hint="URL or /opengraph-image (auto-generated)"><input className={inputClass} value={settings.ogImage} onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })} /></FieldRow>
            <FieldRow label="Site URL" hint="Canonical domain used for sitemap and structured data"><input className={inputClass} value={settings.siteUrl} onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })} /></FieldRow>
            <FieldRow label="X / Twitter handle"><input className={inputClass} value={settings.twitterHandle} onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })} /></FieldRow>
          </div>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <Panel title="Pages" className="p-3 sm:p-3">
          <input className={cn(inputClass, "mb-2")} placeholder="Filter pages…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <ul className="max-h-[60vh] overflow-auto">
            {visiblePages.map((p) => (
              <li key={p.path}>
                <button type="button" onClick={() => setPath(p.path)} className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm", path === p.path ? "bg-navy-900 text-white" : "hover:bg-slate-50")}>
                  <span className="truncate">{p.label}</span>
                  {overrides[p.path] && <span className={cn("size-2 shrink-0 rounded-full", path === p.path ? "bg-sky-300" : "bg-sky-500")} title="Has overrides" />}
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={page.label}
          description={path}
          actions={
            <div className="flex gap-2">
              <Btn variant="sky" onClick={generate} disabled={generating}>{generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Claude</Btn>
              <Btn onClick={savePage} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save</Btn>
            </div>
          }
        >
          <div className="grid gap-4">
            <FieldRow label="SEO title" hint={`${(form.title ?? "").length}/60 — leave empty to use the built-in title`}>
              <input className={inputClass} value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </FieldRow>
            <FieldRow label="Meta description" hint={`${(form.description ?? "").length}/160`}>
              <textarea className={textareaClass} rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FieldRow>
            <FieldRow label="Keywords" hint="Comma separated">
              <input className={inputClass} value={form.keywords.join(", ")} onChange={(e) => setForm({ ...form, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })} />
            </FieldRow>
            <FieldRow label="Share image URL" hint="Upload in Media and paste the public URL">
              <input className={inputClass} value={form.og_image ?? ""} onChange={(e) => setForm({ ...form, og_image: e.target.value })} />
            </FieldRow>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" className="size-4 accent-navy-900" checked={form.noindex} onChange={(e) => setForm({ ...form, noindex: e.target.checked })} />
              Hide from search engines (noindex, removed from sitemap)
            </label>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Google preview</p>
              <p className="mt-1 truncate text-lg text-[#1a0dab]">{form.title || page.label}</p>
              <p className="text-xs text-emerald-700">{(settings?.siteUrl ?? "https://shafqat.pro") + (path === "/" ? "" : path)}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{form.description || settings?.defaultDescription}</p>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
