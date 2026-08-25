import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    auth,
} from "@/auth";

import {
    db,
} from "@/lib/db";

import {
    isAllowedRequestOrigin,
} from "@/lib/requestOrigin";


type SubscriptionBody = {
    endpoint?: unknown;

    keys?: {
        p256dh?: unknown;

        auth?: unknown;
    };
};


function validateSubscription(
    body: SubscriptionBody,
) {
    if (
        typeof body.endpoint !==
        "string" ||
        body.endpoint.length ===
        0 ||
        body.endpoint.length >
        4096
    ) {
        return null;
    }


    try {
        const endpointUrl =
            new URL(
                body.endpoint,
            );


        if (
            endpointUrl.protocol !==
            "https:"
        ) {
            return null;
        }
    } catch {
        return null;
    }


    const p256dh =
        body.keys?.p256dh;

    const authKey =
        body.keys?.auth;


    if (
        typeof p256dh !==
        "string" ||
        typeof authKey !==
        "string" ||
        !p256dh ||
        !authKey ||
        p256dh.length >
        2048 ||
        authKey.length >
        2048
    ) {
        return null;
    }


    return {
        endpoint:
            body.endpoint,

        p256dh,

        auth:
            authKey,
    };
}


export async function POST(
    request: NextRequest,
) {
    try {
        if (
            !isAllowedRequestOrigin(
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


        const body =
            (await request.json()) as
            SubscriptionBody;


        const subscription =
            validateSubscription(
                body,
            );


        if (
            !subscription
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid push subscription.",
                },
                {
                    status: 400,
                },
            );
        }


        /*
         * Authentication is optional.
         *
         * Anonymous Tech Path readers can
         * subscribe to browser notifications.
         */
        let userId:
            string | null =
            null;


        try {
            const session =
                await auth();


            userId =
                session?.user
                    ?.userId ||
                null;
        } catch {
            /*
             * A missing/expired login should
             * never prevent Web Push.
             */
            userId =
                null;
        }


        await db
            .webPushSubscription
            .upsert({
                where: {
                    endpoint:
                        subscription.endpoint,
                },

                update: {
                    p256dh:
                        subscription.p256dh,

                    auth:
                        subscription.auth,

                    userId,

                    enabled:
                        true,
                },

                create: {
                    endpoint:
                        subscription.endpoint,

                    p256dh:
                        subscription.p256dh,

                    auth:
                        subscription.auth,

                    userId,

                    enabled:
                        true,
                },
            });


        return NextResponse.json({
            subscribed:
                true,
        });
    } catch (error) {
        console.error(
            "Unable to save Tech Path push subscription:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to enable notifications.",
            },
            {
                status: 500,
            },
        );
    }
}


export async function DELETE(
    request: NextRequest,
) {
    try {
        if (
            !isAllowedRequestOrigin(
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


        const body =
            (await request.json()) as {
                endpoint?: unknown;
            };


        const endpoint =
            typeof body.endpoint ===
                "string"
                ? body.endpoint
                : "";


        if (
            !endpoint ||
            endpoint.length >
            4096
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid push subscription.",
                },
                {
                    status: 400,
                },
            );
        }


        await db
            .webPushSubscription
            .deleteMany({
                where: {
                    endpoint,
                },
            });


        return NextResponse.json({
            subscribed:
                false,
        });
    } catch (error) {
        console.error(
            "Unable to remove Tech Path push subscription:",
            error,
        );


        return NextResponse.json(
            {
                error:
                    "Unable to disable notifications.",
            },
            {
                status: 500,
            },
        );
    }
}