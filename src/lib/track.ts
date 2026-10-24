// Browser-side conversion tracking shared by the contact and booking forms.

type TrackingConfig = { ga4: string; ads: string; adsLeadLabel: string; adsBookingLabel: string; pixel: string };

declare global {
  interface Window {
    __spTracking?: TrackingConfig;
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const UTM_KEY = "sp_utm";
const UTM_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];

/** Stores first-touch UTM / click IDs for this session so leads keep their ad attribution. */
export function captureUtm() {
  try {
    if (sessionStorage.getItem(UTM_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of UTM_FIELDS) {
      const v = params.get(key);
      if (v) utm[key] = v.slice(0, 200);
    }
    if (document.referrer && !document.referrer.includes(window.location.host)) utm.referrer = document.referrer.slice(0, 200);
    utm.landing = window.location.pathname;
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  } catch {
    // storage unavailable (private mode): attribution is best-effort
  }
}

function readCookie(name: string) {
  return document.cookie.split("; ").find((c) => c.startsWith(`${name}=`))?.split("=")[1];
}

/** Tracking context sent with form submissions (for Meta CAPI dedup and attribution). */
export function trackingContext() {
  let utm: Record<string, string> = {};
  try {
    utm = JSON.parse(sessionStorage.getItem(UTM_KEY) ?? "{}");
  } catch {}
  return {
    eventId: crypto.randomUUID(),
    sourceUrl: window.location.href.slice(0, 500),
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
    utm,
  };
}

/** Fires browser-side conversions; eventId matches the server-side Meta CAPI event. */
export function trackConversion(kind: "lead" | "booking", eventId: string, user: { email: string; phone?: string }) {
  const cfg = window.__spTracking;
  if (!cfg) return;
  if (cfg.pixel && window.fbq) window.fbq("track", kind === "lead" ? "Lead" : "Schedule", {}, { eventID: eventId });
  if (window.gtag) {
    window.gtag("set", "user_data", { email: user.email, phone_number: user.phone || undefined });
    if (cfg.ga4) window.gtag("event", kind === "lead" ? "generate_lead" : "book_appointment", { event_id: eventId });
    const label = kind === "lead" ? cfg.adsLeadLabel : cfg.adsBookingLabel;
    if (cfg.ads && label) window.gtag("event", "conversion", { send_to: `${cfg.ads}/${label}`, transaction_id: eventId });
  }
  window.dataLayer?.push({ event: kind === "lead" ? "sp_lead" : "sp_booking", event_id: eventId });
}
