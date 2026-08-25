import {
    siteConfig,
} from "@/lib/seo";


function normalizeOrigin(
    value: string,
) {
    try {
        return new URL(
            value,
        ).origin;
    } catch {
        return null;
    }
}


export function isAllowedRequestOrigin(
    request: Request,
) {
    const origin =
        request.headers.get(
            "origin",
        );


    if (!origin) {
        return false;
    }


    const normalizedOrigin =
        normalizeOrigin(
            origin,
        );


    if (!normalizedOrigin) {
        return false;
    }


    const allowedOrigins =
        new Set<string>([
            new URL(
                siteConfig.url,
            ).origin,

            "http://localhost:3000",

            "http://127.0.0.1:3000",
        ]);


    return allowedOrigins.has(
        normalizedOrigin,
    );
}