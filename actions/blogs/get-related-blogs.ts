"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getRelatedBlogs = async ({
    blogId,
    tags,
    limit = 4,
}: {
    blogId: string;
    tags: string[];
    limit?: number;
}) => {
    const session = await auth();
    const userId = session?.user.userId;

    try {
        const blogs = await db.blog.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            where: {
                isPublished: true,
                id: { not: blogId },
                ...(tags.length ? { tags: { hasSome: tags } } : {}),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        claps: true,
                        comments: true,
                    },
                },
                claps: {
                    where: {
                        userId,
                    },
                    select: {
                        id: true,
                    },
                },
                bookmarks: {
                    where: {
                        userId,
                    },
                    select: {
                        id: true,
                    },
                },
            },
        });

        return { success: { blogs } };
    } catch (error) {
        return { error: "Error fetching related blogs!" };
    }
};
