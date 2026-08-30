"use client";

import Image from "next/image";

import { Bell, BellRing, X } from "lucide-react";

import { useEffect, useState } from "react";

import BlogAlertPreferences, {
  BlogAlertPreferencesValue,
  DEFAULT_BLOG_ALERT_PREFERENCES,
} from "@/components/pwa/BlogAlertPreferences";
import { setNotificationOnboardingState } from "@/lib/pushOnboarding";
import { trackEvent } from "@/lib/analytics";

type AlertState =
  | "loading"
  | "ready"
  | "subscribed"
  | "denied"
  | "unsupported"
  | "install-required"
  | "error";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}

function isIOS() {
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  const navigation = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigation.standalone === true
  );
}

async function syncSubscription(subscription: PushSubscription) {
  const response = await fetch(
    "/api/push/subscribe",

    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(subscription.toJSON()),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Unable to save notification subscription.");
  }
}

export default function BlogAlertsCard() {
  const [state, setState] = useState<AlertState>("loading");

  const [endpoint, setEndpoint] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  const [message, setMessage] = useState("");

  const [preferences, setPreferences] = useState<BlogAlertPreferencesValue>(
    DEFAULT_BLOG_ALERT_PREFERENCES,
  );

  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const [preferencesLoading, setPreferencesLoading] = useState(false);

  useEffect(() => {
    async function check() {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setState("unsupported");

        return;
      }

      if (isIOS() && !isStandalone()) {
        setState("install-required");

        return;
      }

      if (Notification.permission === "denied") {
        setState("denied");

        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          setState("ready");

          return;
        }

        await syncSubscription(subscription);

        setEndpoint(subscription.endpoint);

        setState("subscribed");
      } catch (error) {
        console.error("Unable to check Tech Path alerts:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to check notification status.",
        );

        setState("error");
      }
    }

    void check();
  }, []);

  async function enableAlerts() {
    setBusy(true);

    setMessage("");

    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("Tech Path VAPID public key is not configured.");
      }

      if (isIOS() && !isStandalone()) {
        setState("install-required");

        return;
      }

      let permission = Notification.permission;

      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission !== "granted") {
        setState("denied");

        return;
      }

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,

          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      await syncSubscription(subscription);

      setEndpoint(subscription.endpoint);

      setState("subscribed");

      setNotificationOnboardingState("enabled");

      if (window.localStorage.getItem("devChampionsConsent") === "accepted") {
        trackEvent("push_subscription_enabled", {
          source: "blog_alert_card",
        });
      }

      setMessage("Tech Path alerts are enabled on this device.");
    } catch (error) {
      console.error("Unable to enable Tech Path alerts:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to enable notifications.",
      );

      setState("error");
    } finally {
      setBusy(false);
    }
  }

  async function disableAlerts() {
    setBusy(true);

    setMessage("");

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const response = await fetch(
          "/api/push/subscribe",

          {
            method: "DELETE",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              endpoint: subscription.endpoint,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Unable to remove notification subscription.");
        }

        await subscription.unsubscribe();
      }

      setEndpoint(null);

      setState("ready");

      setNotificationOnboardingState("disabled");

      setMessage("Tech Path alerts have been turned off.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to turn off notifications.",
      );

      setState("error");
    } finally {
      setBusy(false);
    }
  }

  if (state === "unsupported") {
    return null;
  }

  async function openPreferences() {
    if (!endpoint) {
      return;
    }

    setPreferencesLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/push/preferences", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          endpoint,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load alert preferences.");
      }

      setPreferences(data.preferences);

      setPreferencesOpen(true);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load alert preferences.",
      );
    } finally {
      setPreferencesLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-[#5A1C4B]/10 bg-gradient-to-br from-[#fff9fc] via-white to-[#eefafe] shadow-sm dark:border-[#409FB6]/20 dark:from-[#24111f] dark:via-slate-950 dark:to-[#10272d]">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-md">
              <Image
                src="/icons/icon-192.png"
                alt="Tech Path alerts"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  Never miss a Tech Path article
                </h2>

                {state === "subscribed" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                )}
              </div>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Get notified when new tutorials, developer guides and important
                Tech Path updates are published.
              </p>

              <div aria-live="polite" className="mt-2">
                {state === "install-required" && (
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    On iPhone or iPad, install Tech Path to your Home Screen
                    first, then enable alerts from the installed app.
                  </p>
                )}

                {state === "denied" && (
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    Notifications are blocked in your browser or device
                    settings.
                  </p>
                )}

                {message && (
                  <p
                    className={`text-xs font-medium ${
                      state === "error"
                        ? "text-red-600"
                        : "text-[#5A1C4B] dark:text-[#7fd2eb]"
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {state === "subscribed" ? (
              <>
                <button
                  type="button"
                  disabled={preferencesLoading}
                  onClick={openPreferences}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#5A1C4B] px-4 text-sm font-bold text-white transition hover:bg-[#6d255c] disabled:opacity-60 dark:bg-[#409FB6] dark:text-slate-950"
                >
                  {preferencesLoading ? "Loading..." : "Manage Alerts"}
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={disableAlerts}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <X className="h-4 w-4" />

                  {busy ? "Please wait..." : "Turn Off"}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={
                  busy ||
                  state === "loading" ||
                  state === "denied" ||
                  state === "install-required"
                }
                onClick={enableAlerts}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5A1C4B] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#6d255c] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#409FB6] dark:text-slate-950"
              >
                {state === "loading" ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellRing className="h-4 w-4" />
                )}

                {busy ? "Enabling..." : "Enable Alerts"}
              </button>
            )}
          </div>
        </div>
      </div>

      {preferencesOpen && endpoint && (
        <BlogAlertPreferences
          endpoint={endpoint}
          initialPreferences={preferences}
          onClose={() => setPreferencesOpen(false)}
          onSaved={(updated) => {
            setPreferences(updated);

            setMessage("Your Tech Path alert preferences have been saved.");
          }}
        />
      )}
    </section>
  );
}
