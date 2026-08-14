import { GoogleAnalytics } from "@next/third-parties/google";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function AnalyticsConsentLoader() {
  if (!GA_ID) {
    return null;
  }

  return <GoogleAnalytics gaId={GA_ID} />;
}
