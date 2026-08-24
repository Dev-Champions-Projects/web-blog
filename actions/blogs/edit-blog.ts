"use server";

import {
  db,
} from "@/lib/db";

import {
  getUserById,
} from "@/lib/user";

import {
  BlogSchema,
  BlogSchemaType,
} from "@/schemas/BlogSchema";

import {
  slugify,
} from "@/lib/slug";

import {
  revalidatePath,
} from "next/cache";

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
    const vFields =
      BlogSchema.safeParse(
        values,
      );


    if (
      !vFields.success
    ) {
      return {
        error:
          "Invalid Fields!",
      };
    }


    const {
      userId,
      isPublished,
    } =
      vFields.data;


    const user =
      await getUserById(
        userId,
      );


    if (
      !user
    ) {
      return {
        error:
          "User does not exist!",
      };
    }


    if (
      isPublished &&
      !user.emailVerified
    ) {
      return {
        error:
          "Not authorized! Verify your email!",
      };
    }


    const blog =
      await db.blog.findUnique({
        where: {
          id:
            blogId,
        },
      });


    if (
      !blog
    ) {
      return {
        error:
          "Blog not found!",
      };
    }


    /*
     * Only the FIRST publication generates
     * article alerts.
     */

    const firstPublication =
      isPublished &&
      blog.publishedAt ===
      null;


    const updateData:
      any = {
      ...vFields.data,

      youtubeUrl:
        vFields.data
          .youtubeUrl ||
        null,
    };


    if (
      firstPublication
    ) {
      updateData
        .publishedAt =
        new Date();
    }


    if (
      vFields.data
        .title &&
      vFields.data
        .title !==
      blog.title
    ) {
      const base =
        slugify(
          vFields.data
            .title,
        );


      let finalSlug:
        string |
        undefined =
        base ||
        undefined;


      if (
        finalSlug
      ) {
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
      const path =
        getBlogPath(
          updated,
        );


      revalidatePath(
        path,
      );

      revalidatePath(
        "/blog/feed/1",
      );

      revalidatePath(
        `/user/${userId}/1`,
      );
    } catch {
      // Ignore.
    }


    if (
      firstPublication
    ) {
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
    }


    return {
      success:
        firstPublication
          ? "Blog published"
          : "Blog Updated",

      blogId,

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