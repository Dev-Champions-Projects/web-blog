"use server";

import { db } from "@/lib/db";
import { getUserById } from "@/lib/user";

export const bookmarkBlog = async (blogId: string, userId: string) => {
  const blog = await db.blog.findUnique({
    where: { id: blogId },
  });

  if (!blog) return { error: "Blog not found!" };

  const user = await getUserById(userId);

  if (!user) return { error: "User not found!" };

  const bookmark = await db.bookmark.findUnique({
    where: {
      userId_blogId: { userId, blogId },
    },
  });

  if (bookmark) {
    await db.bookmark.delete({
      where: { id: bookmark.id },
    });

    return { success: "Bookmark removed!" };
  } else {
    await db.bookmark.create({
      data: { userId, blogId },
    });
    return { success: "Bookmarked!" };
  }
};
