import Script from "next/script";
import type { TrackingSettings } from "@/lib/settings";
import { RouteTracker } from "./route-tracker";

const ID = /^[A-Za-z0-9_-]{2,40}$/;
const safe = (v: string) => (ID.test(v) ? v : "");

/**
 * Loads Google Tag Manager, GA4 / Google Ads (gtag) and the Meta Pixel when their IDs are set
 * in Admin → Integrations. IDs are validated so admin input can never inject script.
 */
export function Analytics({ tracking }: { tracking: TrackingSettings }) {
  const gtm = safe(tracking.gtmId);
  const ga4 = safe(tracking.ga4Id);
  const ads = safe(tracking.googleAdsId);
  const pixel = /^\d{5,20}$/.test(tracking.metaPixelId) ? tracking.metaPixelId : "";
  const gtagId = ga4 || ads;

  const clientConfig = {
    ga4,
    ads,
    adsLeadLabel: safe(tracking.googleAdsLeadLabel),
    adsBookingLabel: safe(tracking.googleAdsBookingLabel),
    pixel,
  };

  return (
    <>
      <Script id="sp-tracking-config" strategy="afterInteractive">
        {`window.__spTracking=${JSON.stringify(clientConfig)};`}
      </Script>

      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${ga4 ? `gtag('config','${ga4}');` : ""}${ads ? `gtag('config','${ads}',{allow_enhanced_conversions:true});` : ""}`}
          </Script>
        </>
      )}

      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}

      {pixel && <RouteTracker />}
    </>
  );
}
