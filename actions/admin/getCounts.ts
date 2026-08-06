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
    const viewRows = await db.blog.findMany({
      select: {
        views: true,
      },
    });
    const totalViews = viewRows.reduce((sum, row) => sum + row.views, 0);

    return {
      success: {
        userCount,
        blogCount,
        totalClaps,
        totalComments,
        totalBookmarks,
        totalViews,
      },
    };
  } catch (error) {
    return { error: "Error fetching counts" };
  }
};
