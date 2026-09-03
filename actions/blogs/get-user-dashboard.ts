"use server";

import { BlogApprovalStatus } from "@prisma/client";
import { db } from "@/lib/db";
const normalizeDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

const calculateStreak = (dates: number[]) => {
    if (!dates.length) return 0;

    const today = normalizeDate(new Date());
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a);

    let streak = 0;
    let expected = today;

    for (const date of uniqueDates) {
        if (date === expected) {
            streak += 1;
            expected -= 24 * 60 * 60 * 1000;
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
        const totalPosts = await db.blog.count({ where: { userId } });

        const totalClaps = await db.clap.count({
            where: {
                blog: {
                    userId,
                },
            },
        });

        const totalBookmarks = await db.bookmark.count({
            where: {
                blog: {
                    userId,
                },
            },
        });

        const totalComments = await db.comment.count({
            where: {
                blog: {
                    userId,
                },
            },
        });

        const totalReaderRecords = await db.blogView.findMany({
            where: {
                blog: {
                    userId,
                },
                userId: {
                    not: null,
                },
            },
            select: {
                userId: true,
            },
        });

        const totalReaders = new Set(
            totalReaderRecords
                .map((record) => record.userId)
                .filter((id): id is string => typeof id === "string")
        ).size;

        const weeklyAgo = new Date();
        weeklyAgo.setHours(0, 0, 0, 0);
        weeklyAgo.setDate(weeklyAgo.getDate() - 6);

        const weeklyViewsRecords = await db.blogView.findMany({
            where: {
                blog: {
                    userId,
                },
                createdAt: {
                    gte: weeklyAgo,
                },
            },
            select: {
                createdAt: true,
                userId: true,
            },
        });

        const weeklyDates = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(weeklyAgo);
            date.setDate(date.getDate() + index);
            return date.toISOString().slice(0, 10);
        });

        const weeklyViewsMap = new Map<string, number>();
        const weeklyReadersSet = new Set<string>();

        weeklyDates.forEach((date) => weeklyViewsMap.set(date, 0));

        weeklyViewsRecords.forEach((record) => {
            const day = record.createdAt.toISOString().slice(0, 10);
            weeklyViewsMap.set(day, (weeklyViewsMap.get(day) ?? 0) + 1);
            if (record.userId) {
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

        const weeklyViews = weeklyDates.map((date) => {
            const label = weekdayNames[new Date(`${date}T00:00:00Z`).getUTCDay()];

            return {
                date,
                label,
                count: weeklyViewsMap.get(date) ?? 0,
            };
        });

        const allViewDates = await db.blogView.findMany({
            where: {
                blog: {
                    userId,
                },
            },
            select: {
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 365,
        });

        const readerStreak = calculateStreak(
            Array.from(
                new Set(allViewDates.map((record) => normalizeDate(record.createdAt)))
            )
        );

        const recentPosts = await db.blog.findMany({
            where: {
                userId,
                isPublished: true,
                approvalStatus: BlogApprovalStatus.APPROVED,
            },
            take: 4,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                title: true,
                createdAt: true,
                views: true,
                _count: {
                    select: {
                        claps: true,
                        comments: true,
                        bookmarks: true,
                    },
                },
            },
        });

        const draftPosts = await db.blog.findMany({
            where: {
                userId,
                isPublished: false,
                approvalStatus: BlogApprovalStatus.DRAFT,
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
        });

        const viewAggregate = await db.blog.aggregate({
            where: { userId },
            _sum: {
                views: true,
            },
        });

        const topViewedPosts = await db.blog.findMany({
            where: { userId },
            orderBy: { views: "desc" },
            take: 5,
            select: {
                id: true,
                title: true,
                views: true,
            },
        });

        return {
            success: {
                totalPosts,
                totalClaps,
                totalBookmarks,
                totalComments,
                totalViews: viewAggregate._sum.views ?? 0,
                totalReaders,
                weeklyActiveReaders: weeklyReadersSet.size,
                readerStreak,
                streak: 0,
                recentPosts,
                draftPosts,
                topViewedPosts,
                weeklyViews,
            },
        };
    } catch (error) {
        return { error: "Error fetching dashboard metrics" };
    }
};
