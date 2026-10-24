"use client";

import dynamic from "next/dynamic";
import type { BookingSettings } from "@/lib/settings";

// Rendered only in the browser: availability depends on the visitor's clock and time zone.
const BookingWidget = dynamic(() => import("./booking-widget").then((m) => m.BookingWidget), {
  ssr: false,
  loading: () => <div className="h-[560px] animate-pulse rounded-[2rem] border border-slate-200 bg-white" />,
});

export function LazyBookingWidget({ config }: { config: BookingSettings }) {
  return <BookingWidget config={config} />;
}
