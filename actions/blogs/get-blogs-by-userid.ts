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

    // defensive: dedupe blogs with identical title+content to avoid showing duplicate entries
    // (this prevents UI duplication while investigating root cause in the DB)
    const seen = new Map<string, typeof blogs[0]>();
    const deduped: typeof blogs = [];

    for (const b of blogs) {
      const key = `${b.title}::${b.content}`;
      if (!seen.has(key)) {
        seen.set(key, b);
        deduped.push(b);
      } else {
        // optional: log duplicate detection server-side for investigation
        // console.warn(`Duplicate blog detected for user ${userId}: ${b.id}`);
      }
    }

    const finalBlogs = deduped;

    const totalBlogsCount = await db.blog.count({
      where: {
        userId,
      },
    });

    // Note: `hasMore` remains based on total count in DB; UI may show fewer items because duplicates were removed.
    const hasMore = totalBlogsCount > page * limit;

    return { success: { blogs: finalBlogs, hasMore } };
  } catch (error) {
    return { error: "Error fetching blogs!" };
  }
};
