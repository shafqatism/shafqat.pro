import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a1a3f", color: "#fff", fontSize: 84, fontWeight: 800 }}>
        S<span style={{ color: "#38bdf8" }}>R</span>
      </div>
    ),
    size,
  );
}
