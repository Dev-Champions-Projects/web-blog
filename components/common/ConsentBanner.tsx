"use client";

import { useEffect, useState } from "react";
import {
  getNotificationOnboardingState,
  setNotificationOnboardingState,
  TECH_PATH_NOTIFICATION_ONBOARDING_EVENT,
} from "@/lib/pushOnboarding";

const STORAGE_KEY = "devChampionsConsent";

type ConsentState = "loading" | "pending" | "accepted" | "declined";

type GoogleConsentValue = "granted" | "denied";

type GoogleConsentSettings = {
  analytics_storage: GoogleConsentValue;
  ad_storage: GoogleConsentValue;
  ad_user_data: GoogleConsentValue;
  ad_personalization: GoogleConsentValue;
};

type GoogleGtag = (
  command: "consent",
  action: "update",
  settings: GoogleConsentSettings,
) => void;

type WindowWithGtag = Window & {
  gtag?: GoogleGtag;
};

export default function ConsentBanner() {
  const [consent, setConsent] = useState<ConsentState>("loading");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === "accepted") {
      setConsent("accepted");
      return;
    }

    if (stored === "declined") {
      setConsent("declined");
      return;
    }

    setConsent("pending");
  }, []);

  const updateGoogleConsent = (analyticsStorage: GoogleConsentValue) => {
    const gtag = (window as WindowWithGtag).gtag;

    gtag?.("consent", "update", {
      analytics_storage: analyticsStorage,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  };

  const handleAccept = () => {
    window.localStorage.setItem(STORAGE_KEY, "accepted");
    updateGoogleConsent("granted");
    setConsent("accepted");

    /*
     * Analytics consent and push consent are separate.
     * Accepting the banner only starts the notification
     * onboarding modal. The browser permission prompt is
     * shown later, only if the user explicitly chooses
     * Enable Alerts inside that modal.
     */
    if (!getNotificationOnboardingState()) {
      setNotificationOnboardingState("pending");

      window.dispatchEvent(
        new CustomEvent(TECH_PATH_NOTIFICATION_ONBOARDING_EVENT),
      );
    }
  };

  const handleDecline = () => {
    window.localStorage.setItem(STORAGE_KEY, "declined");
    updateGoogleConsent("denied");
    setConsent("declined");
  };

  if (consent !== "pending") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950 text-white shadow-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-medium">
            We use analytics to improve Dev Champions and make this site better
            for you.
          </p>

          <p className="mt-1 text-sm text-slate-300">
            By accepting, you agree that anonymous usage data may be collected
            to improve content, navigation, and service offerings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDecline}
            className="rounded-xl border border-slate-600 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Decline
          </button>

          <button
            onClick={handleAccept}
            className="rounded-xl bg-[#5A1C4B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#409FB6]"
          >
            Accept and Continue
          </button>
        </div>
      </div>
    </div>
  );
}
