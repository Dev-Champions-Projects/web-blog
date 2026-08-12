import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const DETAIL_OPTIONS = new Set(["users", "posts", "claps", "comments", "bookmarks", "views"]);

export async function GET(req: Request) {
    try {
        const session = await auth();
        const isAdmin = session?.user.role === "ADMIN";

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const url = new URL(req.url);
        const type = url.searchParams.get("type");

        if (!type || !DETAIL_OPTIONS.has(type)) {
            return NextResponse.json({ error: "Missing or unsupported detail type." }, { status: 400 });
        }

        switch (type) {
            case "users": {
                const users = await db.user.findMany({
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                    },
                    take: 30,
                });

                return NextResponse.json({
                    success: {
                        heading: "User accounts",
                        description: "Manage registered users and remove accounts when needed.",
                        rows: users,
                    },
                });
            }
            case "posts": {
                const posts = await db.blog.findMany({
                    where: { isPublished: true },
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        views: true,
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    take: 30,
                });

                const blogIds = posts.map((p) => p.id);

                const clapGroups =
                    blogIds.length > 0
                        ? await db.clap.groupBy({
                            by: ["blogId"],
                            where: { blogId: { in: blogIds } },
                            _count: { _all: true },
                        })
                        : [];

                const bookmarkGroups =
                    blogIds.length > 0
                        ? await db.bookmark.groupBy({
                            by: ["blogId"],
                            where: { blogId: { in: blogIds } },
                            _count: { _all: true },
                        })
                        : [];

                const commentGroups =
                    blogIds.length > 0
                        ? await db.comment.groupBy({
                            by: ["blogId"],
                            where: { blogId: { in: blogIds } },
                            _count: { _all: true },
                        })
                        : [];

                const clapMap = new Map(clapGroups.map((g) => [g.blogId, g._count._all]));
                const bookmarkMap = new Map(
                    bookmarkGroups.map((g) => [g.blogId, g._count._all]),
                );
                const commentMap = new Map(
                    commentGroups.map((g) => [g.blogId, g._count._all]),
                );

                return NextResponse.json({
                    success: {
                        heading: "Published posts",
                        description: "Review recent published posts and their engagement volumes.",
                        rows: posts.map((post) => ({
                            id: post.id,
                            title: post.title,
                            createdAt: post.createdAt,
                            views: post.views,
                            claps: clapMap.get(post.id) ?? 0,
                            comments: commentMap.get(post.id) ?? 0,
                            bookmarks: bookmarkMap.get(post.id) ?? 0,
                            authorName: post.user.name ?? "Unknown author",
                        })),
                    },
                });
            }
            case "views": {
                const posts = await db.blog.findMany({
                    where: { isPublished: true },
                    orderBy: { views: "desc" },
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        views: true,
                        user: {
                            select: { name: true },
                        },
                    },
                    take: 30,
                });

                return NextResponse.json({
                    success: {
                        heading: "Top viewed posts",
                        description: "See the posts attracting the most readers and who created them.",
                        rows: posts.map((post) => ({
                            id: post.id,
                            title: post.title,
                            createdAt: post.createdAt,
                            views: post.views,
                            authorName: post.user.name ?? "Unknown author",
                        })),
                    },
                });
            }
            case "claps": {
                const claps = await db.clap.findMany({
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        createdAt: true,
                        user: {
                            select: { name: true },
                        },
                        blog: {
                            select: { id: true, title: true },
                        },
                    },
                    take: 40,
                });

                return NextResponse.json({
                    success: {
                        heading: "Claps received",
                        description: "Track which users clapped which published posts.",
                        rows: claps.map((clap) => ({
                            id: clap.id,
                            createdAt: clap.createdAt,
                            actorName: clap.user.name ?? "Unknown user",
                            blogTitle: clap.blog.title,
                        })),
                    },
                });
            }
            case "bookmarks": {
                const bookmarks = await db.bookmark.findMany({
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        createdAt: true,
                        user: {
                            select: { name: true },
                        },
                        blog: {
                            select: { id: true, title: true },
                        },
                    },
                    take: 40,
                });

                return NextResponse.json({
                    success: {
                        heading: "Bookmarks",
                        description: "Review who bookmarked posts and which content they saved.",
                        rows: bookmarks.map((bookmark) => ({
                            id: bookmark.id,
                            createdAt: bookmark.createdAt,
                            actorName: bookmark.user.name ?? "Unknown user",
                            blogTitle: bookmark.blog.title,
                        })),
                    },
                });
            }
            case "comments": {
                const comments = await db.comment.findMany({
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        user: {
                            select: { name: true },
                        },
                        blog: {
                            select: { id: true, title: true },
                        },
                    },
                    take: 40,
                });

                return NextResponse.json({
                    success: {
                        heading: "Comments",
                        description: "Inspect recent comment activity with commenter and post context.",
                        rows: comments.map((comment) => ({
                            id: comment.id,
                            createdAt: comment.createdAt,
                            actorName: comment.user.name ?? "Unknown user",
                            blogTitle: comment.blog.title,
                            content: comment.content,
                        })),
                    },
                });
            }
            default:
                return NextResponse.json({ error: "Unsupported detail type." }, { status: 400 });
        }
    } catch (error) {
        console.error("Admin dashboard detail error", error);
        return NextResponse.json({ error: "Failed to load admin details." }, { status: 500 });
    }
}
