"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { EntityType, NotificationType } from "@prisma/client";

export const createNotification = async ({
  recipientId,
  type,
  blogId,
  commentId,
  entityType,
  content,
}: {
  recipientId: string;
  type: NotificationType;
  entityType?: EntityType;
  content?: string;
  blogId?: string;
  commentId?: string;
}) => {
  const session = await auth();

  if (!session?.user.userId) {
    return { error: "Not authenticated!" };
  }

  if (session.user.userId === recipientId) {
    return { error: "Failed to send notification to self!" };
  }

  const recipient = await db.user.findUnique({
    where: { id: recipientId },
  });

  if (!recipient) {
    return { error: "Recipient not found!" };
  }

  try {
    await db.notification.create({
      data: {
        senderId: session.user.userId,
        recipientId,
        type,
        blogId,
        commentId,
        entityType,
        content,
      },
    });

    return { success: "Notification sent!" };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { error: "Failed to send notification!" };
  }
};
