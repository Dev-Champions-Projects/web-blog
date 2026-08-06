"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export const getPublishedBlogs = async ({
  page = 1,
  limit = 5,
  searchObj,
}: {
  page: number;
  limit: number;
  searchObj?: { tag?: string; title?: string };
}) => {
  const skip = (page - 1) * limit;
  const { tag, title } = searchObj ?? {};

  const session = await auth();
  const userId = session?.user.userId;

  const where: Prisma.BlogWhereInput = {
    isPublished: true,
  };

  if (title) {
    where.title = {
      contains: title,
      mode: "insensitive",
    };
  }

  if (tag) {
    where.tags = { has: tag };
  }

  try {
    const blogs = await db.blog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      where,
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
          where: userId ? { userId } : undefined,
          select: {
            id: true,
          },
        },
        bookmarks: {
          where: userId ? { userId } : undefined,
          select: {
            id: true,
          },
        },
      },
    });

    const totalBlogsCount = await db.blog.count({
      where,
    });

    const hasMore = totalBlogsCount > page * limit;

    return { success: { blogs, hasMore } };
  } catch (error) {
    console.error("getPublishedBlogs error", error);
    return { error: "Error fetching blogs!" };
  }
};
