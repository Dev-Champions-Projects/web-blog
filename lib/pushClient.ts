import type { BlogAlertPreferencesValue } from "@/components/pwa/BlogAlertPreferences";

export const TECH_PATH_PUSH_SUBSCRIPTION_CHANGED_EVENT =
  "techpath:push-subscription-changed";

export type TechPathPushSubscriptionChangedDetail = {
  state: "subscribed" | "ready";
  endpoint: string | null;
  message?: string;
};

function dispatchTechPathPushSubscriptionChange(
  detail: TechPathPushSubscriptionChangedDetail,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      TECH_PATH_PUSH_SUBSCRIPTION_CHANGED_EVENT,
      {
        detail,
      },
    ),
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4,
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (
    let index = 0;
    index < rawData.length;
    index += 1
  ) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}

export function isIOSDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1)
  );
}

export function isStandalonePWA() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigation = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)")
      .matches || navigation.standalone === true
  );
}

export function isWebPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getCurrentPushSubscription() {
  if (!isWebPushSupported()) {
    return null;
  }

  const registration =
    await navigator.serviceWorker.ready;

  return registration.pushManager.getSubscription();
}

export async function syncTechPathPushSubscription(
  subscription: PushSubscription,
  preferences?: BlogAlertPreferencesValue,
) {
  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...subscription.toJSON(),
      ...(preferences ? { preferences } : {}),
    }),
  });

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
      "Unable to save notification subscription.",
    );
  }

  return data;
}

export async function subscribeToTechPathPush(
  preferences: BlogAlertPreferencesValue,
) {
  if (!isWebPushSupported()) {
    throw new Error(
      "Push notifications are not supported on this browser.",
    );
  }

  if (isIOSDevice() && !isStandalonePWA()) {
    throw new Error(
      "On iPhone or iPad, install Tech Path to your Home Screen first, then enable alerts from the installed app.",
    );
  }

  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error(
      "Tech Path VAPID public key is not configured.",
    );
  }

  let permission = Notification.permission;

  if (permission === "default") {
    permission =
      await Notification.requestPermission();
  }

  if (permission !== "granted") {
    throw new Error(
      "Notifications were not enabled. You can allow them later from your browser or device settings.",
    );
  }

  const registration =
    await navigator.serviceWorker.ready;

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription =
      await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          urlBase64ToUint8Array(publicKey),
      });
  }

  await syncTechPathPushSubscription(
    subscription,
    preferences,
  );

  /*
   * Tell other mounted notification controls that
   * this browser has successfully subscribed.
   *
   * BlogAlertsCard listens for this event, allowing
   * the homepage UI to update without a page refresh.
   */
  dispatchTechPathPushSubscriptionChange({
    state: "subscribed",
    endpoint: subscription.endpoint,
    message:
      "Tech Path alerts are enabled on this device.",
  });

  return subscription;
}

export async function saveTechPathPushPreferences(
  endpoint: string,
  preferences: BlogAlertPreferencesValue,
) {
  const response = await fetch(
    "/api/push/preferences",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint,
        ...preferences,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      "Unable to save alert preferences.",
    );
  }

  return data.preferences as BlogAlertPreferencesValue;
}