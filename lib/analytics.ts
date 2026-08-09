declare global {
    interface Window {
        dataLayer?: Array<Record<string, unknown>>;
        gtag?: (...args: unknown[]) => void;
    }
}

export type AnalyticsEventParams = Record<string, string | number | boolean | null | undefined>;

function pushDataLayer(eventName: string, params?: AnalyticsEventParams) {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
}

export function trackEvent(eventName: string, params?: AnalyticsEventParams) {
    if (typeof window === "undefined") return;

    pushDataLayer(eventName, params);

    if (typeof window.gtag === "function") {
        window.gtag("event", eventName, params);
    }
}

export function trackLinkClick(label: string, params?: AnalyticsEventParams) {
    trackEvent("link_click", {
        label,
        ...params,
    });
}
