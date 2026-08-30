"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { getCurrentPushSubscription, isWebPushSupported } from "@/lib/pushClient";

const ACTIVITY_STORAGE_KEY = "techPathPushLastActivitySync";
const LAST_PUSH_EVENT_KEY = "techPathLastTrackedPushEvent";
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const CONSENT_KEY = "devChampionsConsent";

function cleanValue(value: string | null, max = 160) {
  return value?.trim().slice(0, max) || null;
}

export default function PushActivityTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function syncActivity() {
      if (!isWebPushSupported()) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const pushType = cleanValue(currentUrl.searchParams.get("push_type"));
      const campaign = cleanValue(
        currentUrl.searchParams.get("push_campaign") ||
          currentUrl.searchParams.get("utm_campaign"),
      );
      const pushId = cleanValue(currentUrl.searchParams.get("push_id"));
      const isPushClick =
        currentUrl.searchParams.get("utm_medium") === "web_push" ||
        Boolean(pushType);

      const now = Date.now();
      const lastSync = Number(
        window.localStorage.getItem(ACTIVITY_STORAGE_KEY) || "0",
      );

      if (!isPushClick && now - lastSync < SIX_HOURS_MS) {
        return;
      }

      try {
        const subscription = await getCurrentPushSubscription();

        if (!subscription || cancelled) {
          return;
        }

        const response = await fetch("/api/push/activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            ...(isPushClick
              ? {
                  source: "notification_click",
                  campaign,
                  pushId,
                }
              : {}),
          }),
        });

        if (!response.ok || cancelled) {
          return;
        }

        window.localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));

        if (
          isPushClick &&
          window.localStorage.getItem(CONSENT_KEY) === "accepted"
        ) {
          const eventKey =
            pushId || `${campaign || "unknown"}:${pushType || "general"}:${pathname}`;

          if (window.localStorage.getItem(LAST_PUSH_EVENT_KEY) !== eventKey) {
            trackEvent("push_notification_click", {
              push_type: pushType || "general",
              push_campaign: campaign || "unknown",
              push_id: pushId || "unknown",
              page_path: pathname,
            });

            window.localStorage.setItem(LAST_PUSH_EVENT_KEY, eventKey);
          }
        }
      } catch (error) {
        console.error("Unable to sync Tech Path push activity:", error);
      }
    }

    void syncActivity();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
