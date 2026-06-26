"use server";

import { db } from "@/lib/db";

export const getBlogsByUserId = async ({
  page = 1,
  limit = 5,
  userId,
}: {
  page: number;
  limit: number;
  userId: string;
}) => {
  const skip = (page - 1) * limit;

  try {
    const blogs = await db.blog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      where: {
        userId,
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

    const totalBlogsCount = await db.blog.count({
      where: {
        userId,
      },
    });

    const hasMore = totalBlogsCount > page * limit;

    return { success: { blogs, hasMore } };
  } catch (error) {
    return { error: "Error fetching blogs!" };
  }
};
