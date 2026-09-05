"use server";

import {
  BlogApprovalStatus,
  UserRole,
} from "@prisma/client";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const getCounts = async () => {
  const session = await auth();

  if (
    !session?.user ||
    session.user.role !== UserRole.ADMIN
  ) {
    return {
      error: "Error fetching counts",
    };
  }

  try {
    const [
      userCount,
      blogCount,
      publishedBlogCount,
      pendingBlogCount,
      totalClaps,
      totalComments,
      totalBookmarks,
      viewAggregate,
    ] = await Promise.all([
      /*
       * Every registered account on the platform.
       */
      db.user.count(),

      /*
       * Every blog record regardless of editorial state.
       * This includes drafts, pending, approved and rejected posts.
       */
      db.blog.count(),

      /*
       * Articles that are genuinely public.
       * Both conditions are required so inconsistent/legacy records
       * cannot inflate the published total.
       */
      db.blog.count({
        where: {
          isPublished: true,
          approvalStatus: BlogApprovalStatus.APPROVED,
        },
      }),

      /*
       * Contributor submissions that are actually waiting for review.
       */
      db.blog.count({
        where: {
          isPublished: false,
          approvalStatus: BlogApprovalStatus.PENDING,
        },
      }),

      db.clap.count(),
      db.comment.count(),
      db.bookmark.count(),

      /*
       * Blog.views remains the canonical historical platform view total.
       * Older visits may predate BlogView event recording.
       */
      db.blog.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      success: {
        userCount,
        blogCount,
        publishedBlogCount,
        pendingBlogCount,
        totalClaps,
        totalComments,
        totalBookmarks,
        totalViews: viewAggregate._sum.views ?? 0,
      },
    };
  } catch (error) {
    console.error(
      "Unable to fetch admin counts:",
      error
    );

    return {
      error: "Error fetching counts",
    };
  }
};
