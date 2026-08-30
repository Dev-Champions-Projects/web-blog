"use client";

import { useCallback, useEffect, useState } from "react";

import BlogAlertPreferences, {
  DEFAULT_BLOG_ALERT_PREFERENCES,
  type BlogAlertPreferencesValue,
} from "@/components/pwa/BlogAlertPreferences";

import {
  getCurrentPushSubscription,
  isWebPushSupported,
  subscribeToTechPathPush,
  syncTechPathPushSubscription,
} from "@/lib/pushClient";

import {
  getNotificationOnboardingState,
  isNotificationOnboardingSnoozed,
  setNotificationOnboardingState,
  snoozeNotificationOnboarding,
  TECH_PATH_NOTIFICATION_ONBOARDING_EVENT,
} from "@/lib/pushOnboarding";

import { trackEvent } from "@/lib/analytics";

const CONSENT_KEY = "devChampionsConsent";

function analyticsAllowed() {
  return (
    typeof window !== "undefined" &&
    window.localStorage.getItem(CONSENT_KEY) === "accepted"
  );
}

export default function PushNotificationOnboarding() {
  const [open, setOpen] = useState(false);

  const inspectOnboarding = useCallback(async () => {
    if (!isWebPushSupported()) {
      setOpen(false);

      return;
    }

    /*
     * Only pending users should receive the
     * onboarding prompt.
     *
     * "enabled" and "disabled" are real decisions.
     */
    if (getNotificationOnboardingState() !== "pending") {
      setOpen(false);

      return;
    }

    /*
     * "Not now" is different from "disabled".
     *
     * While the snooze timestamp is still active,
     * keep the onboarding state pending but do not
     * show the modal.
     */
    if (isNotificationOnboardingSnoozed()) {
      setOpen(false);

      return;
    }

    try {
      const existing = await getCurrentPushSubscription();

      /*
       * The browser may already have a valid
       * subscription even if localStorage does not
       * yet know about it.
       */
      if (existing) {
        await syncTechPathPushSubscription(existing);

        setNotificationOnboardingState("enabled");

        setOpen(false);

        return;
      }
    } catch (error) {
      console.error(
        "Unable to inspect Tech Path notification onboarding:",
        error,
      );
    }

    setOpen(true);
  }, []);

  useEffect(() => {
    const consentAccepted =
      window.localStorage.getItem(CONSENT_KEY) === "accepted";

    const onboardingState = getNotificationOnboardingState();

    if (consentAccepted && !onboardingState) {
      setNotificationOnboardingState("pending");

      void inspectOnboarding();
    } else if (consentAccepted && onboardingState === "pending") {
      void inspectOnboarding();
    }

    function handleOnboardingRequest() {
      void inspectOnboarding();
    }

    window.addEventListener(
      TECH_PATH_NOTIFICATION_ONBOARDING_EVENT,
      handleOnboardingRequest,
    );

    return () => {
      window.removeEventListener(
        TECH_PATH_NOTIFICATION_ONBOARDING_EVENT,
        handleOnboardingRequest,
      );
    };
  }, [inspectOnboarding]);

  async function enable(preferences: BlogAlertPreferencesValue) {
    await subscribeToTechPathPush(preferences);

    /*
     * Only mark onboarding enabled after the
     * browser subscription and server sync succeed.
     */
    setNotificationOnboardingState("enabled");

    if (analyticsAllowed()) {
      trackEvent("push_subscription_enabled", {
        source: "consent_onboarding",
        learning_reminders: preferences.learningReminders,
        selected_topics: preferences.tags.length,
      });
    }

    setOpen(false);
  }

  function dismiss() {
    /*
     * Do NOT mark this as disabled.
     *
     * The user has only said "not now", so the
     * onboarding remains pending and becomes
     * eligible again after the snooze expires.
     */
    snoozeNotificationOnboarding();

    setOpen(false);
  }

  if (!open) {
    return null;
  }

  return (
    <BlogAlertPreferences
      mode="onboarding"
      initialPreferences={DEFAULT_BLOG_ALERT_PREFERENCES}
      onClose={dismiss}
      onEnable={enable}
      onSaved={() => undefined}
    />
  );
}
