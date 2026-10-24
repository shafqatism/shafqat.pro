"use client";

import dynamic from "next/dynamic";

// three.js stays out of the initial bundle and never renders on the server.
const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-sky-400/5 blur-3xl" />,
});

export function LazyHeroScene() {
  return <HeroScene />;
}
