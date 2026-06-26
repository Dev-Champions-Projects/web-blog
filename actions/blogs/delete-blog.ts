"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const deleteBlog = async (blogId: string) => {
  const session = await auth();
  const userId = session?.user.userId;

  const blog = await db.blog.findUnique({ where: { id: blogId } });

  if (!blog) return { error: "blog not found" };

  if (blog.userId !== userId) return { error: "unauthorized!" };

  await db.blog.delete({
    where: { id: blog.id },
  });

  return { success: "blog deleted" };
};
