export const TECH_PATH_NOTIFICATION_ONBOARDING_KEY =
  "techPathNotificationOnboarding";

export const TECH_PATH_NOTIFICATION_ONBOARDING_EVENT =
  "techpath:notification-onboarding";

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

  if (value === "pending" || value === "enabled" || value === "disabled") {
    return value;
  }

  return null;
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
}
