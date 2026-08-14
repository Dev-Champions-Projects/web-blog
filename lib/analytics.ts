import { sendGAEvent } from "@next/third-parties/google";

export type AnalyticsEventParams = Record<
    string,
    string | number | boolean | null | undefined
>;

export function trackEvent(
    eventName: string,
    params?: AnalyticsEventParams
) {
    if (typeof window === "undefined") return;

    sendGAEvent("event", eventName, params ?? {});
}

export function trackPageView(path: string, title?: string) {
    if (typeof window === "undefined") return;

    const pageLocation = `${window.location.origin}${path}`;
    const pageTitle = title || document.title || "Dev Champions";

    sendGAEvent("event", "page_view", {
        page_location: pageLocation,
        page_path: path,
        page_title: pageTitle,
    });
}

export function trackLinkClick(
    label: string,
    params?: AnalyticsEventParams
) {
    trackEvent("link_click", {
        label,
        ...params,
    });
}