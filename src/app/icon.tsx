import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a1a3f", borderRadius: 14, color: "#fff", fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>
        S<span style={{ color: "#38bdf8" }}>R</span>
      </div>
    ),
    size,
  );
}
