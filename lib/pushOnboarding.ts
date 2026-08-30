export const TECH_PATH_NOTIFICATION_ONBOARDING_KEY =
  "techPathNotificationOnboarding";

export const TECH_PATH_NOTIFICATION_ONBOARDING_EVENT =
  "techpath:notification-onboarding";

export const TECH_PATH_NOTIFICATION_ONBOARDING_SNOOZE_KEY =
  "techPathNotificationOnboardingSnoozedUntil";

export const TECH_PATH_NOTIFICATION_ONBOARDING_SNOOZE_MS =
  3 * 24 * 60 * 60 * 1000;

export type TechPathNotificationOnboardingState =
  | "pending"
  | "enabled"
  | "disabled";

export function getNotificationOnboardingState():
  | TechPathNotificationOnboardingState
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(
    TECH_PATH_NOTIFICATION_ONBOARDING_KEY,
  );

  if (
    value === "pending" ||
    value === "enabled" ||
    value === "disabled"
  ) {
    return value;
  }

  return null;
}

export function clearNotificationOnboardingSnooze() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    TECH_PATH_NOTIFICATION_ONBOARDING_SNOOZE_KEY,
  );
}

export function setNotificationOnboardingState(
  state: TechPathNotificationOnboardingState,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    TECH_PATH_NOTIFICATION_ONBOARDING_KEY,
    state,
  );

  /*
   * A real notification decision supersedes any
   * temporary "Not now" snooze.
   */
  if (state === "enabled" || state === "disabled") {
    clearNotificationOnboardingSnooze();
  }
}

export function snoozeNotificationOnboarding() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    TECH_PATH_NOTIFICATION_ONBOARDING_SNOOZE_KEY,
    String(
      Date.now() +
      TECH_PATH_NOTIFICATION_ONBOARDING_SNOOZE_MS,
    ),
  );
}

export function isNotificationOnboardingSnoozed() {
  if (typeof window === "undefined") {
    return false;
  }

  const storedValue = window.localStorage.getItem(
    TECH_PATH_NOTIFICATION_ONBOARDING_SNOOZE_KEY,
  );

  if (!storedValue) {
    return false;
  }

  const snoozedUntil = Number(storedValue);

  /*
   * Remove invalid or expired values instead of
   * allowing stale localStorage data to accumulate.
   */
  if (
    !Number.isFinite(snoozedUntil) ||
    snoozedUntil <= Date.now()
  ) {
    clearNotificationOnboardingSnooze();

    return false;
  }

  return true;
}