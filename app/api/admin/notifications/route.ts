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


        const origin =
            request.headers.get(
                "origin",
            );


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