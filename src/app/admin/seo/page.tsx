"use client";

import { ExternalLink, FileText, Globe, LayoutList, Loader2, Pencil, Save, Share2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Btn, FieldRow, inputClass, PageHeader, Panel, SearchBox, StatCard, TableCard, TabBar, tdClass, textareaClass, thClass, useHashTab, type TabDef,
} from "@/components/admin/ui";
import { useSiteSettings } from "@/components/admin/use-settings";
import { projects, services } from "@/lib/content";
import type { PageSeo } from "@/lib/settings";
import { adminApi, revalidateSite, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const corePages = [
  { path: "/", label: "Home", context: "Homepage: hero, capabilities, services, ready-to-use products, featured work, architecture, process, FAQ." },
  { path: "/about", label: "About", context: "About Shafqat Rasool: story, stats, values, expertise and process." },
  { path: "/services", label: "Services", context: `Services: ${services.map((s) => `${s.title} (${s.tech.slice(0, 8).join(", ")})`).join("; ")}.` },
  { path: "/products", label: "Products", context: "Ready-to-use business software: clinic, hospital, education, LMS, law firm, POS, restaurant, distribution, warehouse, HR, project management, pharma ERP, custom ERP, marketing automation, car rental, multi-vendor." },
  { path: "/portfolio", label: "Portfolio", context: `Portfolio of ${projects.length} projects: mobile apps, Shopify, WooCommerce, Magento, WordPress, Laravel, healthcare, real estate and SaaS.` },
  { path: "/contact", label: "Contact", context: "Contact form, email info@shafqat.pro, WhatsApp, replies within one business day." },
  { path: "/book-a-meeting", label: "Book a meeting", context: "Free discovery call booking with live availability and instant calendar invites." },
];
const pages = [
  ...corePages,
  ...projects.filter((p) => p.caseStudy).map((p) => ({ path: `/portfolio/${p.slug}`, label: p.name, context: `${p.name} (${p.category}${p.region ? `, ${p.region}` : ""}): ${p.caseStudy?.overview ?? p.summary} Stack: ${p.stack.join(", ")}.` })),
];

const TAB_IDS = ["overview", "global", "pages", "social"] as const;
type TabId = (typeof TAB_IDS)[number];

const empty = (path: string): PageSeo => ({ path, title: "", description: "", keywords: [], og_image: "", noindex: false });

function Counter({ value, max, good }: { value: number; max: number; good: [number, number] }) {
  const ok = value >= good[0] && value <= good[1];
  return <span className={cn("tabular-nums", value === 0 ? "text-slate-400" : ok ? "text-emerald-600" : "text-amber-600")}>{value}/{max}</span>;
}

export default function SeoPage() {
  const { settings, setSettings, save, saving } = useSiteSettings();
  const [tab, setTab] = useHashTab(TAB_IDS, "overview");
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

  const page = pages.find((p) => p.path === path) ?? pages[0];
  const visiblePages = useMemo(() => pages.filter((p) => !query || p.label.toLowerCase().includes(query.toLowerCase()) || p.path.includes(query.toLowerCase())), [query]);
  const overrideCount = Object.keys(overrides).length;
  const noindexCount = Object.values(overrides).filter((o) => o.noindex).length;
  const siteUrl = (settings?.siteUrl ?? "https://shafqat.pro").replace(/\/$/, "");

  const tabs: TabDef<TabId>[] = [
    { id: "overview", label: "Overview", icon: LayoutList },
    { id: "global", label: "Global defaults", icon: Globe },
    { id: "pages", label: "Pages", icon: FileText, badge: pages.length },
    { id: "social", label: "Social sharing", icon: Share2 },
  ];

  function editPage(p: string) {
    setPath(p);
    setTab("pages");
  }

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
      toast.success("Claude drafted SEO. Review it, then save.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  const saveGlobal = (
    <Btn onClick={() => save({})} disabled={saving || !settings}>
      {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
    </Btn>
  );

  const ogPreview = settings?.ogImage?.startsWith("http") ? settings.ogImage : `${siteUrl}${settings?.ogImage || "/opengraph-image"}`;

  return (
    <>
      <PageHeader title="SEO" description="Search and sharing settings. Changes go live instantly while pages stay static and fast." />
      <TabBar tabs={tabs} value={tab} onChange={setTab} />

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard accent label="Core pages" value={corePages.length} hint="Home, services, products…" />
            <StatCard label="Pages with custom SEO" value={overrideCount} hint="Overrides saved in Supabase" />
            <StatCard label="Hidden from search" value={noindexCount} hint="noindex pages" />
            <StatCard label="Indexable URLs" value={`${corePages.length + projects.filter((p) => p.caseStudy).length - noindexCount}`} hint="Listed in the sitemap" />
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-heading text-lg font-semibold text-ink">Core pages</h2>
              <p className="mt-0.5 text-sm text-slate-500">Effective SEO for the main pages. Pages without a custom entry use the built-in title and description.</p>
            </div>
            <div className="flex gap-2">
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-navy-900 hover:bg-slate-50">sitemap.xml <ExternalLink className="size-3.5" /></a>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-navy-900 hover:bg-slate-50">robots.txt <ExternalLink className="size-3.5" /></a>
            </div>
          </div>
          <TableCard>
              <table className="w-full min-w-[760px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className={thClass}>Page</th>
                    <th className={thClass}>SEO title</th>
                    <th className={thClass}>Title</th>
                    <th className={thClass}>Description</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}><span className="sr-only">Edit</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {corePages.map((p) => {
                    const o = overrides[p.path];
                    return (
                      <tr key={p.path} className="hover:bg-slate-50/60">
                        <td className={tdClass}>
                          <p className="font-medium text-ink">{p.label}</p>
                          <p className="font-mono text-xs text-slate-400">{p.path}</p>
                        </td>
                        <td className={cn(tdClass, "max-w-64 truncate")}>{o?.title || <span className="text-slate-400">Built-in default</span>}</td>
                        <td className={tdClass}>{o?.title ? <Counter value={o.title.length} max={60} good={[30, 60]} /> : <span className="text-slate-300">—</span>}</td>
                        <td className={tdClass}>{o?.description ? <Counter value={o.description.length} max={160} good={[110, 160]} /> : <span className="text-slate-300">—</span>}</td>
                        <td className={tdClass}>
                          {o?.noindex ? <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">noindex</span> : o ? <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">Custom</span> : <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">Default</span>}
                        </td>
                        <td className={cn(tdClass, "text-right")}>
                          <Btn variant="ghost" className="h-8 px-3 text-xs" onClick={() => editPage(p.path)}><Pencil className="size-3.5" /> Edit</Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </TableCard>
        </div>
      )}

      {tab === "global" && settings && (
        <Panel title="Global defaults" description="Used on every page that has no custom entry." actions={saveGlobal}>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldRow label="Default title"><input className={inputClass} value={settings.defaultTitle} onChange={(e) => setSettings({ ...settings, defaultTitle: e.target.value })} /></FieldRow>
            <FieldRow label="Title template" hint="%s is replaced by the page title"><input className={inputClass} value={settings.titleTemplate} onChange={(e) => setSettings({ ...settings, titleTemplate: e.target.value })} /></FieldRow>
            <div className="md:col-span-2">
              <FieldRow label="Default description" hint={`${settings.defaultDescription.length}/160`}><textarea className={textareaClass} rows={3} value={settings.defaultDescription} onChange={(e) => setSettings({ ...settings, defaultDescription: e.target.value })} /></FieldRow>
            </div>
            <FieldRow label="Keywords" hint="Comma separated"><input className={inputClass} value={settings.keywords.join(", ")} onChange={(e) => setSettings({ ...settings, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })} /></FieldRow>
            <FieldRow label="Site URL" hint="Canonical domain for sitemap, canonical links and structured data"><input className={inputClass} value={settings.siteUrl} onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })} /></FieldRow>
          </div>
        </Panel>
      )}

      {tab === "pages" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <Panel title="Pages" description={`${pages.length} pages`} className="p-3 sm:p-3">
            <SearchBox value={query} onChange={setQuery} placeholder="Filter pages…" className="mb-2" />
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
              <FieldRow label="SEO title" hint={`${(form.title ?? "").length}/60. Leave empty to use the built-in title`}>
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
                Hide from search engines (noindex, removed from the sitemap)
              </label>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Google preview</p>
                <p className="mt-1 truncate text-lg text-[#1a0dab]">{form.title || page.label}</p>
                <p className="text-xs text-emerald-700">{siteUrl + (path === "/" ? "" : path)}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{form.description || settings?.defaultDescription}</p>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {tab === "social" && settings && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Social sharing" description="How links to your site look on WhatsApp, Facebook, LinkedIn and X." actions={saveGlobal}>
            <div className="grid gap-4">
              <FieldRow label="Default share image (Open Graph)" hint="Use /opengraph-image for the auto-generated card, or paste a public URL from Media (1200×630 works best)">
                <input className={inputClass} value={settings.ogImage} onChange={(e) => setSettings({ ...settings, ogImage: e.target.value })} />
              </FieldRow>
              <FieldRow label="X / Twitter handle"><input className={inputClass} value={settings.twitterHandle} onChange={(e) => setSettings({ ...settings, twitterHandle: e.target.value })} /></FieldRow>
            </div>
          </Panel>
          <Panel title="Share preview">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ogPreview} alt="Share image preview" className="aspect-[1200/630] w-full bg-slate-100 object-cover" />
              <div className="border-t border-slate-200 bg-slate-50 p-4">
                <p className="text-xs tracking-wide text-slate-500 uppercase">{siteUrl.replace(/^https?:\/\//, "")}</p>
                <p className="mt-1 line-clamp-1 font-semibold text-ink">{settings.defaultTitle}</p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{settings.defaultDescription}</p>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
