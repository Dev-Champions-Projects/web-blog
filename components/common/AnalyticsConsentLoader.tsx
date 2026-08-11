"use client";

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-GRV3ED5KDB";

export default function AnalyticsConsentLoader() {
  if (!GA_ID) return null;

  return (
    <>
      {/* Initialize Consent Mode before GA fires */}
      <Script id="google-consent-mode" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];

          function gtag() {
            dataLayer.push(arguments);
          }

          window.gtag = gtag;

          var analyticsConsent = 'denied';

          try {
            if (
              window.localStorage.getItem('devChampionsConsent') === 'accepted'
            ) {
              analyticsConsent = 'granted';
            }
          } catch (e) {}

          gtag('consent', 'default', {
            analytics_storage: analyticsConsent,
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
        `}
      </Script>

      {/* Google tag */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];

          function gtag() {
            dataLayer.push(arguments);
          }

          window.gtag = gtag;

          gtag('js', new Date());

          gtag('config', '${GA_ID}', {
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
