"use server";

import {
  BlogApprovalStatus,
  Prisma,
} from "@prisma/client";

import {
  revalidatePath,
} from "next/cache";

import {
  auth,
} from "@/auth";

import {
  db,
} from "@/lib/db";

import {
  getUserById,
} from "@/lib/user";

import {
  slugify,
} from "@/lib/slug";

import {
  BlogSchema,
  BlogSchemaType,
} from "@/schemas/BlogSchema";

import {
  notifyNewBlogSubscribers,
} from "@/lib/blogPushNotifications";


export const editBlog =
  async (
    values:
      BlogSchemaType,

    blogId:
      string,
  ) => {
    const session =
      await auth();


    if (
      !session?.user?.userId
    ) {
      return {
        error:
          "Please sign in.",
      };
    }


    const validated =
      BlogSchema.safeParse(
        values,
      );


    if (
      !validated.success
    ) {
      return {
        error:
          "Invalid Fields!",
      };
    }


    const currentUserId =
      session.user.userId;


    const currentUser =
      await getUserById(
        currentUserId,
      );


    if (!currentUser) {
      return {
        error:
          "User does not exist!",
      };
    }


    const blog =
      await db.blog.findUnique({
        where: {
          id:
            blogId,
        },
      });


    if (!blog) {
      return {
        error:
          "Blog not found!",
      };
    }


    const isAdmin =
      currentUser.role ===
      "ADMIN";


    const ownsBlog =
      blog.userId ===
      currentUserId;


    /*
     * Only the author or an ADMIN can edit.
     */
    if (
      !ownsBlog &&
      !isAdmin
    ) {
      return {
        error:
          "Not authorized to edit this article.",
      };
    }


    const wantsPublication =
      validated.data
        .isPublished;


    if (
      wantsPublication &&
      !currentUser.emailVerified
    ) {
      return {
        error:
          "Verify your email before submitting an article.",
      };
    }


    const publishImmediately =
      isAdmin &&
      wantsPublication;


    const submitForReview =
      !isAdmin &&
      wantsPublication;


    const nextStatus =
      publishImmediately
        ? BlogApprovalStatus.APPROVED
        : submitForReview
          ? BlogApprovalStatus.PENDING
          : BlogApprovalStatus.DRAFT;


    const now =
      new Date();


    const firstPublication =
      publishImmediately &&
      blog.publishedAt ===
      null;


    const updateData:
      Prisma.BlogUpdateInput = {
      title:
        validated.data
          .title,

      content:
        validated.data
          .content,

      coverImage:
        validated.data
          .coverImage ||
        null,

      youtubeUrl:
        validated.data
          .youtubeUrl ||
        null,

      tags:
        validated.data
          .tags,

      /*
       * A normal user can NEVER set this true.
       */
      isPublished:
        publishImmediately,

      approvalStatus:
        nextStatus,

      submittedAt:
        submitForReview
          ? now
          : blog.submittedAt,
    };


    if (
      firstPublication
    ) {
      updateData.publishedAt =
        now;
    }


    /*
     * =========================================
     * TITLE / SLUG UPDATE
     * =========================================
     */

    if (
      validated.data.title !==
      blog.title
    ) {
      const base =
        slugify(
          validated.data
            .title,
        );


      let finalSlug:
        string |
        undefined =
        base ||
        undefined;


      if (finalSlug) {
        let candidate =
          finalSlug;


        let index =
          1;


        while (
          await db.blog.findFirst({
            where: {
              slug:
                candidate,

              NOT: {
                id:
                  blogId,
              },
            },
          })
        ) {
          index +=
            1;


          candidate =
            `${finalSlug}-${index}`;
        }


        finalSlug =
          candidate;
      }


      updateData.slug =
        finalSlug;
    }


    const updated =
      await db.blog.update({
        where: {
          id:
            blogId,
        },

        data:
          updateData,
      });


    try {
      revalidatePath(
        "/",
      );

      revalidatePath(
        "/blog/feed/1",
      );

      revalidatePath(
        "/admin",
      );

      revalidatePath(
        "/dashboard",
      );

      revalidatePath(
        `/user/${updated.userId}/1`,
      );

      revalidatePath(
        getBlogPath(
          updated,
        ),
      );
    } catch {
      // Ignore.
    }


    /*
     * Only first actual publication fires
     * a new-article alert.
     */

    if (
      firstPublication
    ) {
      try {
        await notifyNewBlogSubscribers({
          id:
            updated.id,

          title:
            updated.title,

          slug:
            updated.slug,

          coverImage:
            updated.coverImage,

          tags:
            updated.tags,

          userId:
            updated.userId,
        });
      } catch (
      error
      ) {
        console.error(
          "Blog published but subscriber notification failed:",
          error,
        );
      }
    }


    return {
      success:
        publishImmediately
          ? "Blog published"
          : submitForReview
            ? "Blog submitted for admin review"
            : "Blog saved as draft",

      blogId:
        updated.id,

      slug:
        updated.slug,
    };
  };


function getBlogPath(
  blog: {
    id:
    string;

    slug:
    string |
    null;
  },
) {
  return blog.slug
    ? `/blog/details/${blog.slug}-${blog.id}`
    : `/blog/details/${blog.id}`;
}