"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  auth,
} from "@/auth";

import {
  db,
} from "@/lib/db";


export const deleteBlog =
  async (
    blogId:
      string,
  ) => {
    const session =
      await auth();


    const currentUserId =
      session?.user
        ?.userId;


    if (!currentUserId) {
      return {
        error:
          "Please sign in.",
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
          "Blog not found",
      };
    }


    const isAdmin =
      session.user.role ===
      "ADMIN";


    const ownsBlog =
      blog.userId ===
      currentUserId;


    if (
      !ownsBlog &&
      !isAdmin
    ) {
      return {
        error:
          "Unauthorized!",
      };
    }


    await db.blog.delete({
      where: {
        id:
          blog.id,
      },
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
        `/user/${blog.userId}/1`,
      );

      revalidatePath(
        `/blog/details/${blog.id}`,
      );
    } catch {
      // Ignore.
    }


    return {
      success:
        "Blog deleted",
    };
  };