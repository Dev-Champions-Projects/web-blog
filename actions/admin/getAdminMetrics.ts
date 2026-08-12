"use server";

import { db } from "@/lib/db";

const formatDay = (d: Date) => d.toISOString().slice(0, 10);

export const getAdminMetrics = async (days = 30) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const dayArray: string[] = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dayArray.push(formatDay(d));
    }

    // fetch raw events in range
    const [views, claps, comments, bookmarks, users] = await Promise.all([
        db.blogView.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true } }),
        db.clap.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true } }),
        db.comment.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true } }),
        db.bookmark.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true } }),
        db.user.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { createdAt: true } }),
    ]);

    const zeros = dayArray.reduce<Record<string, number>>((acc, d) => {
        acc[d] = 0;
        return acc;
    }, {} as Record<string, number>);

    const tally = (arr: { createdAt: Date }[]) => {
        const map: Record<string, number> = { ...zeros };
        arr.forEach((r) => {
            const day = formatDay(r.createdAt);
            if (map[day] !== undefined) map[day] += 1;
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

    const topPosts = await db.blog.findMany({
        where: {},
        orderBy: { views: "desc" },
        take: 10,
        select: {
            id: true,
            title: true,
            views: true,
            _count: { select: { claps: true } },
        },
    });

    return { success: { daily, topPosts } };
};
