"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Sends a Meta Pixel PageView on client-side navigations (GA4 tracks history changes itself). */
export function RouteTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
