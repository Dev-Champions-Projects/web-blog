"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const deleteBlog = async (blogId: string) => {
  const session = await auth();
  const userId = session?.user.userId;

  const blog = await db.blog.findUnique({ where: { id: blogId } });

  if (!blog) return { error: "blog not found" };

  if (blog.userId !== userId) return { error: "unauthorized!" };

  await db.blog.delete({
    where: { id: blog.id },
  });

  try {
    revalidatePath(`/blog/feed/1`);
    revalidatePath(`/user/${userId}/1`);
    // revalidate detail path in case of slug mapping
    revalidatePath(`/blog/details/${blog.id}`);
  } catch (e) {
    // ignore
  }

  return { success: "blog deleted" };
};
