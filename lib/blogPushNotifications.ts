// import { db } from "@/lib/db";

// import {
//     sendWebPush,
//     type TechPathPushPayload,
// } from "@/lib/webPush";

// import {
//     getBlogUrl,
// } from "@/lib/slug";


// type BlogForPush = {
//     id: string;

//     title: string;

//     slug?: string | null;

//     coverImage?: string | null;

//     tags: string[];
// };


// export type PushSendSummary = {
//     enabled: number;

//     matched: number;

//     excluded: number;

//     attempted: number;

//     delivered: number;

//     failed: number;

//     removed: number;
// };


// function normalize(
//     value: string,
// ) {
//     return value
//         .trim()
//         .toLowerCase();
// }


// function matchesBlogTags(
//     subscriberTags: string[],

//     blogTags: string[],
// ) {
//     /*
//      * No selected subscriber tags means:
//      *
//      * "I want articles from every topic."
//      */

//     if (
//         subscriberTags.length ===
//         0
//     ) {
//         return true;
//     }


//     const normalizedBlogTags =
//         new Set(
//             blogTags.map(
//                 normalize,
//             ),
//         );


//     return subscriberTags.some(
//         (
//             tag,
//         ) =>
//             normalizedBlogTags.has(
//                 normalize(
//                     tag,
//                 ),
//             ),
//     );
// }


// async function removeStaleSubscription(
//     endpoint: string,
// ) {
//     try {
//         await db
//             .webPushSubscription
//             .deleteMany({
//                 where: {
//                     endpoint,
//                 },
//             });
//     } catch (
//     error
//     ) {
//         console.error(
//             "Unable to remove stale Tech Path push subscription:",
//             error,
//         );
//     }
// }


// async function deliverToSubscriptions(
//     subscriptions: Array<{
//         endpoint: string;

//         p256dh: string;

//         auth: string;
//     }>,

//     payload: TechPathPushPayload,
// ) {
//     const BATCH_SIZE =
//         25;


//     let delivered =
//         0;

//     let failed =
//         0;

//     let removed =
//         0;


//     for (
//         let index =
//             0;
//         index <
//         subscriptions.length;
//         index +=
//         BATCH_SIZE
//     ) {
//         const batch =
//             subscriptions.slice(
//                 index,
//                 index +
//                 BATCH_SIZE,
//             );


//         const results =
//             await Promise.all(
//                 batch.map(
//                     async (
//                         subscription,
//                     ) => {
//                         const result =
//                             await sendWebPush(
//                                 subscription,
//                                 payload,
//                             );


//                         if (
//                             result.stale
//                         ) {
//                             await removeStaleSubscription(
//                                 subscription.endpoint,
//                             );


//                             return "removed";
//                         }


//                         if (
//                             result.delivered
//                         ) {
//                             return "delivered";
//                         }


//                         return "failed";
//                     },
//                 ),
//             );


//         delivered +=
//             results.filter(
//                 (
//                     result,
//                 ) =>
//                     result ===
//                     "delivered",
//             ).length;


//         failed +=
//             results.filter(
//                 (
//                     result,
//                 ) =>
//                     result ===
//                     "failed",
//             ).length;


//         removed +=
//             results.filter(
//                 (
//                     result,
//                 ) =>
//                     result ===
//                     "removed",
//             ).length;
//     }


//     return {
//         attempted:
//             subscriptions.length,

//         delivered,

//         failed,

//         removed,
//     };
// }


// /*
//  * ========================================
//  * AUTOMATIC NEW BLOG PUSH
//  * ========================================
//  */

// export async function notifyNewBlogSubscribers(
//     blog: BlogForPush,
// ): Promise<PushSendSummary> {
//     try {
//         const subscriptions =
//             await db
//                 .webPushSubscription
//                 .findMany({
//                     where: {
//                         enabled:
//                             true,

//                         newPosts:
//                             true,
//                     },

//                     select: {
//                         endpoint:
//                             true,

//                         p256dh:
//                             true,

//                         auth:
//                             true,

//                         tags:
//                             true,
//                     },
//                 });


//         const matching =
//             subscriptions.filter(
//                 (
//                     subscription,
//                 ) =>
//                     matchesBlogTags(
//                         subscription.tags,

//                         blog.tags,
//                     ),
//             );


//         console.info(
//             "Tech Path push matching:",
//             {
//                 enabled:
//                     subscriptions.length,

//                 matched:
//                     matching.length,

//                 excluded:
//                     subscriptions.length -
//                     matching.length,

//                 blogId:
//                     blog.id,
//             },
//         );


//         const url =
//             getBlogUrl(
//                 blog,
//             );


//         const topic =
//             blog.tags.length >
//                 0
//                 ? blog.tags
//                     .slice(
//                         0,
//                         2,
//                     )
//                     .join(
//                         " • ",
//                     )
//                 : "Tech Path";


//         const result =
//             await deliverToSubscriptions(
//                 matching,

//                 {
//                     title:
//                         blog.title,

//                     body:
//                         `New on Tech Path • ${topic}`,

//                     url,

//                     tag:
//                         `tech-path-blog-${blog.id}`,

//                     icon:
//                         blog.coverImage ||
//                         "/icons/icon-192.png",

//                     badge:
//                         "/icons/icon-192.png",

//                     type:
//                         "new-post",
//                 },
//             );


//         const summary = {
//             enabled:
//                 subscriptions.length,

//             matched:
//                 matching.length,

//             excluded:
//                 subscriptions.length -
//                 matching.length,

//             ...result,
//         };


//         console.info(
//             "Tech Path push delivery:",
//             summary,
//         );


//         return summary;
//     } catch (
//     error
//     ) {
//         /*
//          * Publishing a blog must NEVER fail
//          * because Web Push failed.
//          */

//         console.error(
//             "Unable to send Tech Path article notifications:",
//             error,
//         );


//         return {
//             enabled:
//                 0,

//             matched:
//                 0,

//             excluded:
//                 0,

//             attempted:
//                 0,

//             delivered:
//                 0,

//             failed:
//                 0,

//             removed:
//                 0,
//         };
//     }
// }


// /*
//  * ========================================
//  * SPECIAL ANNOUNCEMENTS
//  * ========================================
//  *
//  * No admin UI yet.
//  *
//  * This prepares the delivery engine for
//  * a later Tech Path announcement center.
//  */

// export async function sendTechPathAnnouncement(
//     payload: TechPathPushPayload,
// ) {
//     try {
//         const subscriptions =
//             await db
//                 .webPushSubscription
//                 .findMany({
//                     where: {
//                         enabled:
//                             true,

//                         specialAnnouncements:
//                             true,
//                     },

//                     select: {
//                         endpoint:
//                             true,

//                         p256dh:
//                             true,

//                         auth:
//                             true,
//                     },
//                 });


//         return await deliverToSubscriptions(
//             subscriptions,

//             {
//                 ...payload,

//                 type:
//                     "announcement",
//             },
//         );
//     } catch (
//     error
//     ) {
//         console.error(
//             "Unable to send Tech Path announcement:",
//             error,
//         );


//         return {
//             attempted:
//                 0,

//             delivered:
//                 0,

//             failed:
//                 0,

//             removed:
//                 0,
//         };
//     }
// }

import {
    db,
} from "@/lib/db";

import {
    getBlogUrl,
} from "@/lib/slug";

import {
    emitNotificationToUsers,
} from "@/lib/socketServer";

import {
    sendWebPush,
    type TechPathPushPayload,
} from "@/lib/webPush";


type BlogForNotification = {
    id:
    string;

    title:
    string;

    slug?:
    string |
    null;

    coverImage?:
    string |
    null;

    tags:
    string[];

    userId:
    string;
};


type PushSubscriptionRecord = {
    endpoint:
    string;

    p256dh:
    string;

    auth:
    string;

    userId:
    string |
    null;

    tags:
    string[];
};


export type NotificationDeliverySummary = {
    enabled:
    number;

    matched:
    number;

    inAppRecipients:
    number;

    attempted:
    number;

    delivered:
    number;

    failed:
    number;

    removed:
    number;
};


function normalize(
    value:
        string,
) {
    return value
        .trim()
        .toLowerCase();
}


function matchesArticleTopics(
    subscriberTags:
        string[],

    articleTags:
        string[],
) {
    /*
     * [] means ALL topics.
     */

    if (
        subscriberTags.length ===
        0
    ) {
        return true;
    }


    const blogTags =
        new Set(
            articleTags.map(
                normalize,
            ),
        );


    return subscriberTags.some(
        (
            tag,
        ) =>
            blogTags.has(
                normalize(
                    tag,
                ),
            ),
    );
}


function matchesAnnouncementTopic(
    subscriberTags:
        string[],

    targetTag:
        string |
        null,
) {
    if (
        !targetTag
    ) {
        return true;
    }


    /*
     * User selected "all topics".
     */
    if (
        subscriberTags.length ===
        0
    ) {
        return true;
    }


    const target =
        normalize(
            targetTag,
        );


    return subscriberTags.some(
        (
            tag,
        ) =>
            normalize(
                tag,
            ) ===
            target,
    );
}


async function removeStaleSubscription(
    endpoint:
        string,
) {
    try {
        await db
            .webPushSubscription
            .deleteMany({
                where: {
                    endpoint,
                },
            });
    } catch (
    error
    ) {
        console.error(
            "Unable to remove stale Tech Path subscription:",
            error,
        );
    }
}


async function deliverPush(
    subscriptions:
        PushSubscriptionRecord[],

    payload:
        TechPathPushPayload,
) {
    const BATCH_SIZE =
        25;


    let delivered =
        0;

    let failed =
        0;

    let removed =
        0;


    for (
        let index =
            0;
        index <
        subscriptions.length;
        index +=
        BATCH_SIZE
    ) {
        const batch =
            subscriptions.slice(
                index,

                index +
                BATCH_SIZE,
            );


        const results =
            await Promise.all(
                batch.map(
                    async (
                        subscription,
                    ) => {
                        try {
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

                                    payload,
                                );


                            if (
                                result.stale
                            ) {
                                await removeStaleSubscription(
                                    subscription.endpoint,
                                );

                                return "removed";
                            }


                            if (
                                result.delivered
                            ) {
                                return "delivered";
                            }


                            return "failed";
                        } catch (
                        error
                        ) {
                            console.error(
                                "Tech Path push delivery failed:",
                                error,
                            );

                            return "failed";
                        }
                    },
                ),
            );


        delivered +=
            results.filter(
                (
                    value,
                ) =>
                    value ===
                    "delivered",
            ).length;


        failed +=
            results.filter(
                (
                    value,
                ) =>
                    value ===
                    "failed",
            ).length;


        removed +=
            results.filter(
                (
                    value,
                ) =>
                    value ===
                    "removed",
            ).length;
    }


    return {
        attempted:
            subscriptions.length,

        delivered,

        failed,

        removed,
    };
}


/*
 * ========================================
 * NEW ARTICLE
 * ========================================
 */

export async function notifyNewBlogSubscribers(
    blog:
        BlogForNotification,
):
    Promise<NotificationDeliverySummary> {
    try {
        const subscriptions =
            await db
                .webPushSubscription
                .findMany({
                    where: {
                        enabled:
                            true,

                        newPosts:
                            true,
                    },

                    select: {
                        endpoint:
                            true,

                        p256dh:
                            true,

                        auth:
                            true,

                        userId:
                            true,

                        tags:
                            true,
                    },
                });


        const matching =
            subscriptions.filter(
                (
                    subscription,
                ) => {
                    /*
                     * Don't notify the article author
                     * about their own publication.
                     */

                    if (
                        subscription.userId ===
                        blog.userId
                    ) {
                        return false;
                    }


                    return matchesArticleTopics(
                        subscription.tags,

                        blog.tags,
                    );
                },
            );


        const url =
            getBlogUrl({
                id:
                    blog.id,

                title:
                    blog.title,

                slug:
                    blog.slug,
            });


        /*
         * =====================================
         * IN-APP NOTIFICATIONS
         * =====================================
         */

        const recipientIds =
            Array.from(
                new Set(
                    matching
                        .map(
                            (
                                subscription,
                            ) =>
                                subscription.userId,
                        )
                        .filter(
                            (
                                userId,
                            ):
                                userId is string =>
                                Boolean(
                                    userId,
                                ),
                        ),
                ),
            );


        if (
            recipientIds.length >
            0
        ) {
            await db
                .notification
                .createMany({
                    data:
                        recipientIds.map(
                            (
                                recipientId,
                            ) => ({
                                recipientId,

                                senderId:
                                    blog.userId,

                                type:
                                    "NEW_ARTICLE",

                                blogId:
                                    blog.id,

                                entityType:
                                    "BLOG",

                                content:
                                    blog.title,

                                url,
                            }),
                        ),
                });


            /*
             * Instantly refresh notification bell.
             */

            emitNotificationToUsers(
                recipientIds,
            );
        }


        /*
         * =====================================
         * WEB PUSH
         * =====================================
         */

        const topicText =
            blog.tags.length >
                0
                ? blog.tags
                    .slice(
                        0,
                        2,
                    )
                    .join(
                        " • ",
                    )
                : "New article";


        const push =
            await deliverPush(
                matching,

                {
                    title:
                        blog.title,

                    body:
                        `New on Tech Path • ${topicText}`,

                    url,

                    tag:
                        `tech-path-article-${blog.id}`,

                    icon:
                        blog.coverImage ||
                        "/icons/icon-192.png",

                    badge:
                        "/icons/icon-192.png",

                    type:
                        "new-post",

                    campaign:
                        "new_article",

                    pushId:
                        blog.id,
                },
            );


        const summary = {
            enabled:
                subscriptions.length,

            matched:
                matching.length,

            inAppRecipients:
                recipientIds.length,

            ...push,
        };


        console.info(
            "Tech Path article notification:",
            summary,
        );


        return summary;
    } catch (
    error
    ) {
        /*
         * Never roll back a successful blog
         * publication because notification
         * delivery failed.
         */

        console.error(
            "Unable to notify Tech Path article subscribers:",
            error,
        );


        return {
            enabled:
                0,

            matched:
                0,

            inAppRecipients:
                0,

            attempted:
                0,

            delivered:
                0,

            failed:
                0,

            removed:
                0,
        };
    }
}


/*
 * ========================================
 * SPECIAL ADMIN ANNOUNCEMENT
 * ========================================
 */

export async function sendTechPathAnnouncement({
    senderId,
    title,
    message,
    url,
    targetTag,
}: {
    senderId:
    string;

    title:
    string;

    message:
    string;

    url:
    string;

    targetTag?:
    string |
    null;
}) {
    const subscriptions =
        await db
            .webPushSubscription
            .findMany({
                where: {
                    enabled:
                        true,

                    specialAnnouncements:
                        true,
                },

                select: {
                    endpoint:
                        true,

                    p256dh:
                        true,

                    auth:
                        true,

                    userId:
                        true,

                    tags:
                        true,
                },
            });


    const matching =
        subscriptions.filter(
            (
                subscription,
            ) =>
                matchesAnnouncementTopic(
                    subscription.tags,

                    targetTag ||
                    null,
                ),
        );


    const recipientIds =
        Array.from(
            new Set(
                matching
                    .map(
                        (
                            subscription,
                        ) =>
                            subscription.userId,
                    )
                    .filter(
                        (
                            userId,
                        ):
                            userId is string =>
                            Boolean(
                                userId,
                            ) &&
                            userId !==
                            senderId,
                    ),
            ),
        );


    if (
        recipientIds.length >
        0
    ) {
        await db
            .notification
            .createMany({
                data:
                    recipientIds.map(
                        (
                            recipientId,
                        ) => ({
                            recipientId,

                            senderId,

                            type:
                                "SYSTEM_ALERT",

                            content:
                                `${title}: ${message}`,

                            url,
                        }),
                    ),
            });


        emitNotificationToUsers(
            recipientIds,
        );
    }


    const push =
        await deliverPush(
            matching,

            {
                title,

                body:
                    message,

                url,

                tag:
                    `tech-path-announcement-${Date.now()}`,

                icon:
                    "/icons/icon-192.png",

                badge:
                    "/icons/icon-192.png",

                type:
                    "announcement",

                campaign:
                    "special_announcement",
            },
        );


    return {
        enabled:
            subscriptions.length,

        matched:
            matching.length,

        inAppRecipients:
            recipientIds.length,

        ...push,
    };
}