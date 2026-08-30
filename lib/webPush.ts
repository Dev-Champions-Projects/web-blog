import webpush from "web-push";


export type TechPathPushPayload = {
    title: string;

    body: string;

    url: string;

    tag?: string;

    icon?: string;

    badge?: string;

    type?:
    | "test"
    | "new-post"
    | "announcement"
    | "winback";

    campaign?: string;

    pushId?: string;
};


export type StoredPushSubscription = {
    endpoint: string;

    p256dh: string;

    auth: string;
};


export type PushDeliveryResult = {
    delivered: boolean;

    stale: boolean;

    statusCode: number | null;
};


function configureWebPush() {
    const publicKey =
        process.env
            .NEXT_PUBLIC_VAPID_PUBLIC_KEY;


    const privateKey =
        process.env
            .VAPID_PRIVATE_KEY;


    const subject =
        process.env
            .VAPID_SUBJECT ||
        "mailto:dev.champions.it@gmail.com";


    if (
        !publicKey ||
        !privateKey
    ) {
        throw new Error(
            "Tech Path Web Push VAPID keys are not configured.",
        );
    }


    webpush.setVapidDetails(
        subject,
        publicKey,
        privateKey,
    );
}


function getStatusCode(
    error: unknown,
) {
    if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error
    ) {
        const statusCode =
            Number(
                (
                    error as {
                        statusCode?: unknown;
                    }
                ).statusCode,
            );


        if (
            Number.isFinite(
                statusCode,
            )
        ) {
            return statusCode;
        }
    }


    return null;
}


export async function sendWebPush(
    subscription:
        StoredPushSubscription,

    payload:
        TechPathPushPayload,
): Promise<PushDeliveryResult> {
    configureWebPush();


    try {
        await webpush.sendNotification(
            {
                endpoint:
                    subscription.endpoint,

                keys: {
                    p256dh:
                        subscription.p256dh,

                    auth:
                        subscription.auth,
                },
            },

            JSON.stringify({
                ...payload,

                icon:
                    payload.icon ||
                    "/icons/icon-192.png",

                badge:
                    payload.badge ||
                    "/icons/icon-192.png",
            }),

            {
                TTL:
                    60 * 60 * 24,
            },
        );


        return {
            delivered: true,

            stale: false,

            statusCode: 201,
        };
    } catch (error) {
        const statusCode =
            getStatusCode(
                error,
            );


        /*
         * 404 / 410 means that browser's
         * subscription no longer exists.
         */

        if (
            statusCode === 404 ||
            statusCode === 410
        ) {
            return {
                delivered: false,

                stale: true,

                statusCode,
            };
        }


        console.error(
            "Tech Path Web Push delivery failed:",
            statusCode ||
            "unknown",
        );


        return {
            delivered: false,

            stale: false,

            statusCode,
        };
    }
}