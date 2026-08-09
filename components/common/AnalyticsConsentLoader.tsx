"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "devChampionsConsent";

export default function AnalyticsConsentLoader() {
  const [consent, setConsent] = useState<string | null>(null);
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    setConsent(stored);
  }, []);

  if (consent !== "accepted") {
    return null;
  }

  if (!gaId && !gtmId) {
    return null;
  }

  return (
    <>
      <Script id="analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          ${gaId ? `gtag('config', '${gaId}');` : ""}
        `}
      </Script>

      {gaId ? (
        <Script
          id="ga4-script"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        />
      ) : null}

      {gtmId ? (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}
