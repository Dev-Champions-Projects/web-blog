"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const deleteComment = async (commentId: string) => {
  const session = await auth();
  const userId = session?.user.userId;

  const comment = await db.comment.findUnique({ where: { id: commentId } });

  if (!comment) return { error: "comment not found" };

  if (comment.userId !== userId) return { error: "unauthorized!" };

  await db.comment.delete({
    where: { id: comment.id },
  });

  revalidatePath(`/blog/details/${comment.blogId}`);

  return { success: "comment deleted" };
};
