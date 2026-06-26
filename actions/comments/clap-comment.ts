"use server";

import { db } from "@/lib/db";
import { getUserById } from "@/lib/user";

export const clapComment = async (commentId: string, userId: string) => {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) return { error: "Comment not found!" };

  const user = await getUserById(userId);

  if (!user) return { error: "User not found!" };

  const clap = await db.commentClap.findUnique({
    where: {
      userId_commentId: { userId, commentId },
    },
  });

  if (clap) {
    await db.commentClap.delete({
      where: { id: clap.id },
    });

    return { success: "Unclapped!" };
  } else {
    await db.commentClap.create({
      data: { userId, commentId },
    });
    return { success: "Clapped" };
  }
};
