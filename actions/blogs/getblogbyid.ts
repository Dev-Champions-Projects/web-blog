"use server";

import {
  BlogApprovalStatus,
  Prisma,
} from "@prisma/client";

import {
  auth,
} from "@/auth";

import {
  db,
} from "@/lib/db";

import {
  parseIdFromSlugOrId,
} from "@/lib/slug";


const createBlogInclude =
  (
    currentUserId?:
      string,
  ) =>
    ({
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
          currentUserId
            ? {
              userId:
                currentUserId,
            }
            : {
              id: {
                equals:
                  "__anonymous__",
              },
            },

        select: {
          id:
            true,
        },
      },

      bookmarks: {
        where:
          currentUserId
            ? {
              userId:
                currentUserId,
            }
            : {
              id: {
                equals:
                  "__anonymous__",
              },
            },

        select: {
          id:
            true,
        },
      },
    }) satisfies Prisma.BlogInclude;


export const incrementBlogViews =
  async ({
    blogId,
  }: {
    blogId:
    string;
  }) => {
    if (!blogId) {
      return;
    }


    try {
      const session =
        await auth();


      const viewerId =
        session?.user
          ?.userId ??
        null;


      const idCandidate =
        parseIdFromSlugOrId(
          blogId,
        );


      const publicBlog =
        await db.blog.findFirst({
          where: {
            isPublished:
              true,

            approvalStatus:
              BlogApprovalStatus.APPROVED,

            OR: [
              {
                id:
                  idCandidate ??
                  blogId,
              },

              {
                slug:
                  blogId,
              },
            ],
          },

          select: {
            id:
              true,
          },
        });


      if (!publicBlog) {
        return;
      }


      /*
       * Keep the historical Blog.views counter and the
       * event-level BlogView analytics table in sync from
       * this point forward.
       *
       * Blog.views preserves historical totals.
       * BlogView gives us dated/viewer-specific analytics.
       *
       * The transaction guarantees that either both records
       * are updated or neither one is updated.
       */
      await db.$transaction([
        db.blog.update({
          where: {
            id:
              publicBlog.id,
          },

          data: {
            views: {
              increment:
                1,
            },
          },
        }),

        db.blogView.create({
          data: {
            blogId:
              publicBlog.id,

            userId:
              viewerId,
          },
        }),
      ]);
    } catch (
    error
    ) {
      console.error(
        "Unable to increment blog views",
        error,
      );
    }
  };


export const getBlogById =
  async ({
    blogId,
  }: {
    blogId:
    string;
  }) => {
    if (!blogId) {
      return {
        error:
          "No Blog ID",
      };
    }


    const session =
      await auth();


    const currentUserId =
      session?.user
        ?.userId;


    const isAdmin =
      session?.user
        ?.role ===
      "ADMIN";


    const include =
      createBlogInclude(
        currentUserId,
      );


    try {
      let blog =
        await db.blog.findUnique({
          where: {
            id:
              blogId,
          },

          include,
        });


      if (!blog) {
        const idCandidate =
          parseIdFromSlugOrId(
            blogId,
          );


        if (
          idCandidate &&
          idCandidate !==
          blogId
        ) {
          blog =
            await db.blog.findUnique({
              where: {
                id:
                  idCandidate,
              },

              include,
            });
        }
      }


      if (!blog) {
        blog =
          await db.blog.findUnique({
            where: {
              slug:
                blogId,
            },

            include,
          });
      }


      if (!blog) {
        return {
          success: {
            blog:
              null,
          },
        };
      }


      const isPublic =
        blog.isPublished &&
        blog.approvalStatus ===
        BlogApprovalStatus.APPROVED;


      const isOwner =
        Boolean(
          currentUserId &&
          blog.userId ===
          currentUserId,
        );


      const canPreview =
        isOwner ||
        isAdmin;


      if (
        !isPublic &&
        !canPreview
      ) {
        return {
          error:
            "This article is not available.",
        };
      }


      return {
        success: {
          blog,
        },
      };
    } catch (
    error
    ) {
      console.error(
        "Unable to fetch blog:",
        error,
      );


      return {
        error:
          "Error fetching blog content!",
      };
    }
  };