import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    db,
} from "@/lib/db";

import {
    sendWebPush,
} from "@/lib/webPush";


function isLocalRequest(
    request: NextRequest,
) {
    return (
        request.nextUrl.hostname ===
        "localhost" ||
        request.nextUrl.hostname ===
        "127.0.0.1"
    );
}


export async function POST(
    request: NextRequest,
) {
    try {
        /*
         * Development diagnostic only.
         *
         * This endpoint does NOT exist
         * functionally on path.dev-champions.tech.
         */

        if (
            !isLocalRequest(
                request,
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Not found.",
                },

                {
                    status: 404,
                },
            );
        }


        const body =
            await request.json();


        const endpoint =
            typeof body.endpoint ===
                "string"
                ? body.endpoint
                : "";


        if (!endpoint) {
            return NextResponse.json(
                {
                    error:
                        "Push endpoint is required.",
                },

                {
                    status: 400,
                },
            );
        }


        const subscription =
            await db
                .webPushSubscription
                .findUnique({
                    where: {
                        endpoint,
                    },
                });


        if (
            !subscription ||
            !subscription.enabled
        ) {
            return NextResponse.json(
                {
                    error:
                        "Active subscription not found.",
                },

                {
                    status: 404,
                },
            );
        }


        const result =
            await sendWebPush(
                {
                    endpoint:
                        subscription.endpoint,

                    p256dh:
                        subscription.p256dh,

                    auth:
                        subscription.auth,
                },

                {
                    title:
                        "Tech Path alerts are ready 🎉",

                    body:
                        "You can now receive new articles and important Tech Path updates.",

                    url:
                        "/blog/feed/1",

                    tag:
                        "tech-path-test",

                    type:
                        "test",
                },
            );


        if (
            result.stale
        ) {
            await db
                .webPushSubscription
                .delete({
                    where: {
                        endpoint:
                            subscription.endpoint,
                    },
                });


            return NextResponse.json(
                {
                    error:
                        "This browser subscription expired. Enable alerts again.",
                },

                {
                    status: 410,
                },
            );
        }


        if (
            !result.delivered
        ) {
            return NextResponse.json(
                {
                    error:
                        "Push service did not accept the notification.",
                },

                {
                    status: 502,
                },
            );
        }


        return NextResponse.json({
            success: true,

            delivered: true,
        });
    } catch (error) {
        console.error(
            "Tech Path test notification failed:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to send the test notification.",
            },

            {
                status: 500,
            },
        );
    }
}