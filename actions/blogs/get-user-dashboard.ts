"use server";

import { BlogApprovalStatus } from "@prisma/client";
import { db } from "@/lib/db";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfUtcDay = (date: Date) =>
    new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        )
    );

const normalizeUtcDate = (date: Date) => startOfUtcDay(date).getTime();

const calculateReaderStreak = (dates: number[]) => {
    if (!dates.length) return 0;

    const today = normalizeUtcDate(new Date());
    const yesterday = today - MS_PER_DAY;

    const uniqueDates = Array.from(new Set(dates)).sort(
        (a, b) => b - a
    );

    const latestDate = uniqueDates[0];

    /*
     * Keep the streak active when the latest reader activity
     * happened today or yesterday.
     *
     * This prevents the streak from immediately resetting
     * before today's first reader arrives.
     */
    if (latestDate !== today && latestDate !== yesterday) {
        return 0;
    }

    let streak = 0;
    let expected = latestDate;

    for (const date of uniqueDates) {
        if (date === expected) {
            streak += 1;
            expected -= MS_PER_DAY;
            continue;
        }

        if (date < expected) {
            break;
        }
    }

    return streak;
};

export const getUserDashboard = async (userId: string) => {
    try {
        /*
         * Seven calendar days including today.
         *
         * UTC is used consistently so analytics do not shift
         * because of server timezone or daylight-saving changes.
         */
        const weeklyStart = startOfUtcDay(new Date());

        weeklyStart.setUTCDate(
            weeklyStart.getUTCDate() - 6
        );

        /*
         * Keep reader-streak lookup bounded instead of loading
         * unlimited BlogView history.
         */
        const streakWindowStart = startOfUtcDay(new Date());

        streakWindowStart.setUTCDate(
            streakWindowStart.getUTCDate() - 364
        );

        const [
            totalPosts,
            totalClaps,
            totalBookmarks,
            totalComments,
            totalReaderRecords,
            weeklyViewsRecords,
            readerViewDates,
            recentPosts,
            draftPosts,
            viewAggregate,
            topViewedPosts,
        ] = await Promise.all([
            /*
             * Every post owned by the author.
             *
             * Includes:
             * - drafts
             * - pending posts
             * - approved posts
             * - rejected posts
             *
             * Therefore the UI labels this metric "Total posts".
             */
            db.blog.count({
                where: {
                    userId,
                },
            }),

            /*
             * Claps received across the author's posts.
             */
            db.clap.count({
                where: {
                    blog: {
                        userId,
                    },
                },
            }),

            /*
             * Bookmarks/saves received across the author's posts.
             */
            db.bookmark.count({
                where: {
                    blog: {
                        userId,
                    },
                },
            }),

            /*
             * Comments received on the author's posts.
             *
             * This intentionally does not count comments the author
             * left on somebody else's post.
             */
            db.comment.count({
                where: {
                    blog: {
                        userId,
                    },
                },
            }),

            /*
             * Unique identifiable readers.
             *
             * Anonymous visitors cannot be uniquely identified by
             * the current schema, so this metric represents unique
             * signed-in readers.
             *
             * The author's own signed-in views are excluded.
             */
            db.blogView.findMany({
                where: {
                    blog: {
                        userId,
                    },

                    userId: {
                        not: null,
                    },

                    NOT: {
                        userId,
                    },
                },

                distinct: ["userId"],

                select: {
                    userId: true,
                },
            }),

            /*
             * All view events during the current seven-day window.
             *
             * Anonymous views remain valid article views and are
             * therefore included in weekly view counts.
             */
            db.blogView.findMany({
                where: {
                    blog: {
                        userId,
                    },

                    createdAt: {
                        gte: weeklyStart,
                    },
                },

                select: {
                    createdAt: true,
                    userId: true,
                },
            }),

            /*
             * Reader activity used for the streak calculation.
             *
             * Anonymous reading activity counts.
             * The author's own authenticated views do not.
             */
            db.blogView.findMany({
                where: {
                    blog: {
                        userId,
                    },

                    createdAt: {
                        gte: streakWindowStart,
                    },

                    OR: [
                        {
                            userId: null,
                        },

                        {
                            userId: {
                                not: userId,
                            },
                        },
                    ],
                },

                select: {
                    createdAt: true,
                },

                orderBy: {
                    createdAt: "desc",
                },
            }),

            /*
             * Latest approved and published posts.
             *
             * publishedAt is preferred over createdAt so an article
             * drafted earlier but published today appears as recent.
             */
            db.blog.findMany({
                where: {
                    userId,

                    isPublished: true,

                    approvalStatus:
                        BlogApprovalStatus.APPROVED,
                },

                take: 4,

                orderBy: [
                    {
                        publishedAt: {
                            sort: "desc",
                            nulls: "last",
                        },
                    },

                    {
                        createdAt: "desc",
                    },
                ],

                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    publishedAt: true,
                    views: true,

                    _count: {
                        select: {
                            claps: true,
                            comments: true,
                            bookmarks: true,
                        },
                    },
                },
            }),

            /*
             * Editable draft posts.
             */
            db.blog.findMany({
                where: {
                    userId,

                    isPublished: false,

                    approvalStatus:
                        BlogApprovalStatus.DRAFT,
                },

                orderBy: {
                    createdAt: "desc",
                },

                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    isPublished: true,
                    approvalStatus: true,
                },
            }),

            /*
             * Blog.views remains the canonical historical total.
             *
             * Older traffic may have been recorded before BlogView
             * event creation was added.
             *
             * Switching this immediately to BlogView.count() could
             * therefore incorrectly reduce historical totals.
             */
            db.blog.aggregate({
                where: {
                    userId,
                },

                _sum: {
                    views: true,
                },
            }),

            /*
             * Highest-viewed approved and published posts.
             *
             * Drafts, pending posts and rejected posts are excluded.
             */
            db.blog.findMany({
                where: {
                    userId,

                    isPublished: true,

                    approvalStatus:
                        BlogApprovalStatus.APPROVED,
                },

                orderBy: {
                    views: "desc",
                },

                take: 5,

                select: {
                    id: true,
                    title: true,
                    views: true,
                },
            }),
        ]);

        /*
         * Build the seven UTC calendar dates that will appear
         * on the weekly graph.
         */
        const weeklyDates = Array.from(
            {
                length: 7,
            },

            (_, index) => {
                const date = new Date(weeklyStart);

                date.setUTCDate(
                    date.getUTCDate() + index
                );

                return date
                    .toISOString()
                    .slice(0, 10);
            }
        );

        const weeklyViewsMap =
            new Map<string, number>();

        const weeklyReadersSet =
            new Set<string>();

        /*
         * Initialize every date with zero so days without
         * traffic still appear on the chart.
         */
        weeklyDates.forEach((date) => {
            weeklyViewsMap.set(date, 0);
        });

        weeklyViewsRecords.forEach((record) => {
            const day = record.createdAt
                .toISOString()
                .slice(0, 10);

            weeklyViewsMap.set(
                day,
                (weeklyViewsMap.get(day) ?? 0) + 1
            );

            /*
             * Weekly active readers represents distinct
             * authenticated readers excluding the author.
             */
            if (
                record.userId &&
                record.userId !== userId
            ) {
                weeklyReadersSet.add(record.userId);
            }
        });

        const weekdayNames = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
        ];

        const weeklyViews = weeklyDates.map(
            (date) => ({
                date,

                label:
                    weekdayNames[
                    new Date(
                        `${date}T00:00:00.000Z`
                    ).getUTCDay()
                    ],

                count:
                    weeklyViewsMap.get(date) ?? 0,
            })
        );

        const readerStreak =
            calculateReaderStreak(
                readerViewDates.map((record) =>
                    normalizeUtcDate(record.createdAt)
                )
            );

        return {
            success: {
                totalPosts,

                totalClaps,

                totalBookmarks,

                totalComments,

                /*
                 * Historical view total.
                 */
                totalViews:
                    viewAggregate._sum.views ?? 0,

                /*
                 * Distinct authenticated readers excluding
                 * the author's account.
                 */
                totalReaders:
                    totalReaderRecords.length,

                weeklyActiveReaders:
                    weeklyReadersSet.size,

                readerStreak,

                recentPosts,

                draftPosts,

                topViewedPosts,

                weeklyViews,
            },
        };
    } catch (error) {
        console.error(
            "Error fetching user dashboard metrics",
            error
        );

        return {
            error:
                "Error fetching dashboard metrics",
        };
    }
};