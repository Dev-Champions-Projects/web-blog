"use server";

import {
  BlogApprovalStatus,
} from "@prisma/client";

import {
  auth,
} from "@/auth";

import {
  db,
} from "@/lib/db";


export const getCounts =
  async () => {
    const session =
      await auth();


    if (
      session?.user.role !==
      "ADMIN"
    ) {
      return {
        error:
          "Error fetching counts",
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
      ] =
        await Promise.all([
          db.user.count(),

          db.blog.count(),

          db.blog.count({
            where: {
              isPublished:
                true,

              approvalStatus:
                BlogApprovalStatus.APPROVED,
            },
          }),

          db.blog.count({
            where: {
              approvalStatus:
                BlogApprovalStatus.PENDING,
            },
          }),

          db.clap.count(),

          db.comment.count(),

          db.bookmark.count(),

          db.blog.aggregate({
            _sum: {
              views:
                true,
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

          totalViews:
            viewAggregate._sum
              .views ??
            0,
        },
      };
    } catch (
    error
    ) {
      console.error(
        "Unable to fetch admin counts:",
        error,
      );


      return {
        error:
          "Error fetching counts",
      };
    }
  };