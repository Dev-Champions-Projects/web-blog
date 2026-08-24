import { siteConfig } from "@/lib/seo";

import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    auth,
} from "@/auth";

import {
    tags as availableTags,
} from "@/lib/tags";

import {
    sendTechPathAnnouncement,
} from "@/lib/blogPushNotifications";


function cleanString(
    value:
        unknown,
) {
    return typeof value ===
        "string"
        ? value.trim()
        : "";
}


function validDestination(
    value:
        string,
) {
    return (
        value.startsWith(
            "/",
        ) &&
        !value.startsWith(
            "//",
        )
    );
}

function getAllowedOrigins(
    request: NextRequest,
) {
    const origins =
        new Set<string>();

    /*
     * Canonical production origin.
     */
    origins.add(
        new URL(
            siteConfig.url,
        ).origin,
    );

    /*
     * Next.js-resolved origin.
     * Useful locally and when there is
     * no reverse proxy.
     */
    origins.add(
        request.nextUrl.origin,
    );

    /*
     * Reverse proxies such as Render
     * usually forward the original host
     * and protocol.
     */
    const forwardedHost =
        request.headers
            .get("x-forwarded-host")
            ?.split(",")[0]
            ?.trim();

    const forwardedProto =
        request.headers
            .get("x-forwarded-proto")
            ?.split(",")[0]
            ?.trim();

    if (
        forwardedHost &&
        forwardedProto
    ) {
        origins.add(
            `${forwardedProto}://${forwardedHost}`,
        );
    }

    /*
     * Local development.
     */
    if (
        process.env.NODE_ENV !==
        "production"
    ) {
        origins.add(
            "http://localhost:3000",
        );

        origins.add(
            "http://127.0.0.1:3000",
        );
    }

    return origins;
}


function hasValidRequestOrigin(
    request: NextRequest,
) {
    const origin =
        request.headers.get(
            "origin",
        );

    /*
     * Requests without an Origin header
     * are not rejected here. Authentication
     * and ADMIN authorization still apply.
     */
    if (!origin) {
        return true;
    }

    try {
        const normalizedOrigin =
            new URL(origin).origin;

        return getAllowedOrigins(
            request,
        ).has(
            normalizedOrigin,
        );
    } catch {
        return false;
    }
}

export async function POST(
    request:
        NextRequest,
) {
    try {
        const session =
            await auth();


        if (
            !session?.user ||
            session.user.role !==
            "ADMIN" ||
            !session.user.userId
        ) {
            return NextResponse.json(
                {
                    error:
                        "Access denied.",
                },

                {
                    status:
                        403,
                },
            );
        }


        if (
            !hasValidRequestOrigin(
                request,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid request origin.",
                },
                {
                    status: 403,
                },
            );
        }


        if (
            origin &&
            origin !==
            request.nextUrl
                .origin
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid request origin.",
                },

                {
                    status:
                        403,
                },
            );
        }


        const body =
            await request.json();


        const title =
            cleanString(
                body.title,
            );


        const message =
            cleanString(
                body.message,
            );


        const url =
            cleanString(
                body.url,
            ) ||
            "/blog/feed/1";


        const targetTag =
            cleanString(
                body.targetTag,
            );


        if (
            !title ||
            title.length >
            80
        ) {
            return NextResponse.json(
                {
                    error:
                        "Title must contain 1–80 characters.",
                },

                {
                    status:
                        400,
                },
            );
        }


        if (
            !message ||
            message.length >
            240
        ) {
            return NextResponse.json(
                {
                    error:
                        "Message must contain 1–240 characters.",
                },

                {
                    status:
                        400,
                },
            );
        }


        if (
            !validDestination(
                url,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Destination must be an internal Tech Path path.",
                },

                {
                    status:
                        400,
                },
            );
        }


        const validTags =
            availableTags.filter(
                (
                    tag,
                ) =>
                    tag !==
                    "All",
            );


        if (
            targetTag &&
            !validTags.includes(
                targetTag,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid topic audience.",
                },

                {
                    status:
                        400,
                },
            );
        }


        const result =
            await sendTechPathAnnouncement({
                senderId:
                    session.user
                        .userId,

                title,

                message,

                url,

                targetTag:
                    targetTag ||
                    null,
            });


        return NextResponse.json({
            success:
                true,

            delivery:
                result,
        });
    } catch (
    error
    ) {
        console.error(
            "Unable to send Tech Path announcement:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to send notification.",
            },

            {
                status:
                    500,
            },
        );
    }
}