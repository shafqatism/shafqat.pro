import { ImageResponse } from "next/og";

export const alt = "Shafqat Rasool — Software Architect & Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#fff",
          background: "radial-gradient(circle at 80% 20%, #1d3c86 0%, #0a1a3f 40%, #05070d 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "#38bdf8", color: "#05070d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800 }}>SR</div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>
            shafqat<span style={{ color: "#38bdf8" }}>.pro</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#7dd3fc", letterSpacing: 4, textTransform: "uppercase" }}>Technology Leader & Software Architect</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 18 }}>I don&apos;t just write code.</div>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, color: "#bae6fd" }}>I build what&apos;s next.</div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "rgba(255,255,255,0.7)" }}>
          {["Software Architecture", "Shopify Plus", "SaaS", "iOS & Android", "AWS & Azure"].map((t) => (
            <div key={t} style={{ padding: "8px 18px", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999 }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
