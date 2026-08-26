"use server";

import { BlogApprovalStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUserById } from "@/lib/user";
import { slugify } from "@/lib/slug";
import {
  BlogSchema,
  BlogSchemaType,
} from "@/schemas/BlogSchema";
import {
  notifyNewBlogSubscribers,
} from "@/lib/blogPushNotifications";


export const createBlog = async (
  values: BlogSchemaType,
) => {
  const session =
    await auth();


  if (
    !session?.user?.userId
  ) {
    return {
      error:
        "Please sign in before creating a blog.",
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
        "Invalid fields!",
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


  const isAdmin =
    currentUser.role ===
    "ADMIN";


  /*
   * The existing form sends isPublished=true
   * when its main action is pressed.
   *
   * ADMIN:
   *   true => publish immediately
   *
   * USER:
   *   true => submit for review
   */
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


  const now =
    new Date();


  const approvalStatus =
    publishImmediately
      ? BlogApprovalStatus.APPROVED
      : submitForReview
        ? BlogApprovalStatus.PENDING
        : BlogApprovalStatus.DRAFT;


  /*
   * =========================================
   * UNIQUE SLUG
   * =========================================
   */

  const base =
    slugify(
      validated.data.title ||
      "",
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
      await db.blog.findUnique({
        where: {
          slug:
            candidate,
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


  /*
   * =========================================
   * DUPLICATE GUARD
   * =========================================
   */

  try {
    const fiveMinutesAgo =
      new Date(
        Date.now() -
        5 *
        60 *
        1000,
      );


    const recent =
      await db.blog.findFirst({
        where: {
          userId:
            currentUserId,

          title:
            validated.data
              .title,

          content:
            validated.data
              .content,

          createdAt: {
            gte:
              fiveMinutesAgo,
          },
        },
      });


    if (recent) {
      return {
        error:
          "Duplicate blog detected. Did you submit twice?",
      };
    }
  } catch {
    // Duplicate checking must not block creation.
  }


  /*
   * =========================================
   * CREATE
   * =========================================
   *
   * We deliberately DO NOT spread the
   * browser-submitted userId/isPublished.
   */

  const created =
    await db.blog.create({
      data: {
        userId:
          currentUserId,

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

        slug:
          finalSlug,

        isPublished:
          publishImmediately,

        approvalStatus,

        submittedAt:
          submitForReview
            ? now
            : null,

        publishedAt:
          publishImmediately
            ? now
            : null,
      },
    });


  /*
   * =========================================
   * REVALIDATE
   * =========================================
   */

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
      `/user/${created.userId}/1`,
    );
  } catch {
    // Ignore cache invalidation failures.
  }


  /*
   * Only a real publication should trigger
   * subscriber notifications.
   *
   * USER review submission sends nothing.
   */

  if (
    publishImmediately
  ) {
    try {
      await notifyNewBlogSubscribers({
        id:
          created.id,

        title:
          created.title,

        slug:
          created.slug,

        coverImage:
          created.coverImage,

        tags:
          created.tags,

        userId:
          created.userId,
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
      created.id,

    slug:
      created.slug,
  };
};