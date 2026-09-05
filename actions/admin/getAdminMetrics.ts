"use server";

import {
    BlogApprovalStatus,
    UserRole,
} from "@prisma/client";

import { auth } from "@/auth";
import { db } from "@/lib/db";

const MAX_ANALYTICS_DAYS = 90;

const startOfUtcDay = (date: Date) =>
    new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        )
    );

const formatUtcDay = (date: Date) =>
    date.toISOString().slice(0, 10);

const normalizeDays = (days: number) => {
    if (!Number.isFinite(days)) {
        return 30;
    }

    return Math.min(
        Math.max(Math.trunc(days), 1),
        MAX_ANALYTICS_DAYS
    );
};

export const getAdminMetrics = async (days = 30) => {
    const session = await auth();

    if (
        !session?.user ||
        session.user.role !== UserRole.ADMIN
    ) {
        return {
            error: "Access denied.",
        };
    }

    try {
        const safeDays = normalizeDays(days);
        const now = new Date();
        const start = startOfUtcDay(now);

        start.setUTCDate(
            start.getUTCDate() - (safeDays - 1)
        );

        const dayArray = Array.from(
            { length: safeDays },
            (_, index) => {
                const date = new Date(start);
                date.setUTCDate(date.getUTCDate() + index);
                return formatUtcDay(date);
            }
        );

        /*
         * These are event-based metrics for the requested date range.
         * BlogView data becomes reliable from the point at which the
         * application started recording individual view events.
         * Historical total views remain sourced from Blog.views.
         */
        const [views, claps, comments, bookmarks, users, topPosts] =
            await Promise.all([
                db.blogView.findMany({
                    where: {
                        createdAt: {
                            gte: start,
                            lte: now,
                        },
                    },
                    select: {
                        createdAt: true,
                    },
                }),

                db.clap.findMany({
                    where: {
                        createdAt: {
                            gte: start,
                            lte: now,
                        },
                    },
                    select: {
                        createdAt: true,
                    },
                }),

                db.comment.findMany({
                    where: {
                        createdAt: {
                            gte: start,
                            lte: now,
                        },
                    },
                    select: {
                        createdAt: true,
                    },
                }),

                db.bookmark.findMany({
                    where: {
                        createdAt: {
                            gte: start,
                            lte: now,
                        },
                    },
                    select: {
                        createdAt: true,
                    },
                }),

                db.user.findMany({
                    where: {
                        createdAt: {
                            gte: start,
                            lte: now,
                        },
                    },
                    select: {
                        createdAt: true,
                    },
                }),

                /*
                 * Performance rankings should contain only articles that
                 * readers can actually access publicly.
                 */
                db.blog.findMany({
                    where: {
                        isPublished: true,
                        approvalStatus: BlogApprovalStatus.APPROVED,
                    },
                    orderBy: {
                        views: "desc",
                    },
                    take: 10,
                    select: {
                        id: true,
                        title: true,
                        views: true,
                        _count: {
                            select: {
                                claps: true,
                            },
                        },
                    },
                }),
            ]);

        const createZeroMap = () =>
            dayArray.reduce<Record<string, number>>(
                (accumulator, date) => {
                    accumulator[date] = 0;
                    return accumulator;
                },
                {}
            );

        const tally = (records: { createdAt: Date }[]) => {
            const map = createZeroMap();

            records.forEach((record) => {
                const day = formatUtcDay(record.createdAt);

                if (map[day] !== undefined) {
                    map[day] += 1;
                }
            });

            return map;
        };

        const viewsMap = tally(views);
        const clapsMap = tally(claps);
        const commentsMap = tally(comments);
        const bookmarksMap = tally(bookmarks);
        const usersMap = tally(users);

        const daily = dayArray.map((date) => ({
            date,
            views: viewsMap[date] ?? 0,
            claps: clapsMap[date] ?? 0,
            comments: commentsMap[date] ?? 0,
            bookmarks: bookmarksMap[date] ?? 0,
            newUsers: usersMap[date] ?? 0,
        }));

        return {
            success: {
                daily,
                topPosts,
            },
        };
    } catch (error) {
        console.error(
            "Unable to fetch admin analytics:",
            error
        );

        return {
            error: "Unable to load admin analytics.",
        };
    }
};
