import { ImageResponse } from "next/og";

// Branded 1200x630 share image per page: /api/og?title=…&tag=…&icon=…&chips=a,b,c
// Used as the Open Graph / Twitter image for pages whose SEO is set in Admin → SEO.

const ICONS: Record<string, string> = {
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  package: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
};

const clean = (v: string | null, max: number) => (v ?? "").replace(/[<>]/g, "").trim().slice(0, max);

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const title = clean(sp.get("title"), 90) || "Shafqat Rasool";
  const tag = clean(sp.get("tag"), 32) || "Software Architect";
  const chips = clean(sp.get("chips"), 120).split(",").map((c) => c.trim()).filter(Boolean).slice(0, 5);
  const icon = ICONS[sp.get("icon") ?? ""] ?? ICONS.code;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>`;
  const iconSrc = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const size = title.length > 52 ? 54 : title.length > 36 ? 64 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#fff",
          background: "radial-gradient(circle at 85% 15%, #1d3c86 0%, #0a1a3f 42%, #05070d 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#38bdf8", color: "#05070d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>SR</div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>Shafqat</div>
          </div>
          <div style={{ display: "flex", padding: "8px 20px", border: "1px solid rgba(125,211,252,0.4)", borderRadius: 999, color: "#7dd3fc", fontSize: 22, letterSpacing: 3, textTransform: "uppercase" }}>{tag}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", width: 132, height: 132, borderRadius: 32, background: "rgba(56,189,248,0.12)", border: "1px solid rgba(125,211,252,0.35)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconSrc} width={72} height={72} alt="" />
          </div>
          <div style={{ display: "flex", fontSize: size, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }}>{title}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {chips.map((c) => (
              <div key={c} style={{ display: "flex", padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", fontSize: 22 }}>{c}</div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#7dd3fc", fontWeight: 600 }}>shafqat.pro</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
