"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getBookmarks = async ({
  page = 1,
  limit = 5,
}: {
  page: number;
  limit: number;
}) => {
  const skip = (page - 1) * limit;

  const session = await auth();
  const userId = session?.user.userId;

  if (!userId) return { error: "User not found" };

  try {
    const bookmarks = await db.bookmark.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      where: { userId },
      include: {
        blog: {
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
        },
      },
    });

    const blogs = bookmarks
      .filter((bookmark) => bookmark.blog !== null)
      .map((bookmark) => bookmark.blog);

    const totalBookmarks = await db.bookmark.count({ where: { userId } });
    const hasMore = totalBookmarks > page * limit;

    return { success: { blogs, hasMore } };
  } catch (error) {
    return { error: "Error fetching bookmarks!" };
  }
};
