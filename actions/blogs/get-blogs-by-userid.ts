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


export const getBlogsByUserId =
  async ({
    page = 1,
    limit = 5,
    userId,
  }: {
    page:
    number;

    limit:
    number;

    userId:
    string;
  }) => {
    const skip =
      (page - 1) *
      limit;


    const session =
      await auth();


    const viewerId =
      session?.user
        ?.userId;


    const where = {
      userId,

      isPublished:
        true,

      approvalStatus:
        BlogApprovalStatus.APPROVED,
    };


    try {
      const blogs =
        await db.blog.findMany({
          skip,

          take:
            limit,

          orderBy: {
            createdAt:
              "desc",
          },

          where,

          include: {
            user: {
              select: {
                id:
                  true,

                name:
                  true,

                image:
                  true,
              },
            },

            _count: {
              select: {
                claps:
                  true,

                comments:
                  true,
              },
            },

            claps: {
              where:
                viewerId
                  ? {
                    userId:
                      viewerId,
                  }
                  : undefined,

              select: {
                id:
                  true,
              },
            },

            bookmarks: {
              where:
                viewerId
                  ? {
                    userId:
                      viewerId,
                  }
                  : undefined,

              select: {
                id:
                  true,
              },
            },
          },
        });


      const seen =
        new Map<
          string,
          (typeof blogs)[number]
        >();


      const deduped:
        typeof blogs = [];


      for (
        const blog
        of blogs
      ) {
        const key =
          `${blog.title}::${blog.content}`;


        if (
          !seen.has(
            key,
          )
        ) {
          seen.set(
            key,
            blog,
          );

          deduped.push(
            blog,
          );
        }
      }


      const totalBlogsCount =
        await db.blog.count({
          where,
        });


      const hasMore =
        totalBlogsCount >
        page *
        limit;


      return {
        success: {
          blogs:
            deduped,

          hasMore,
        },
      };
    } catch (
    error
    ) {
      console.error(
        "Unable to fetch user blogs:",
        error,
      );


      return {
        error:
          "Error fetching blogs!",
      };
    }
  };