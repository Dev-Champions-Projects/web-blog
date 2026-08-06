"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getCounts = async () => {
  const session = await auth();

  const isAdmin = session?.user.role === "ADMIN";

  if (!isAdmin) return { error: "Error fetching counts" };

  try {
    const userCount = await db.user.count();
    const blogCount = await db.blog.count();
    const totalClaps = await db.clap.count();
    const totalComments = await db.comment.count();
    const totalBookmarks = await db.bookmark.count();
    const viewAggregate = await db.blog.aggregate({
      _sum: {
        views: true,
      },
    });

    return {
      success: {
        userCount,
        blogCount,
        totalClaps,
        totalComments,
        totalBookmarks,
        totalViews: viewAggregate._sum.views ?? 0,
      },
    };
  } catch (error) {
    return { error: "Error fetching counts" };
  }
};
