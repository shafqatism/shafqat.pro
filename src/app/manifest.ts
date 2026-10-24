import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shafqat Rasool — Software Architect",
    short_name: "shafqat.pro",
    description: "Software architecture, Shopify, SaaS, mobile and cloud engineering.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a1a3f",
    icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }, { src: "/apple-icon", sizes: "180x180", type: "image/png" }],
  };
}
