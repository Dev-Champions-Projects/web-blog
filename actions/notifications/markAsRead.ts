"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const markAllNotificationsAsRead = async () => {
  const session = await auth();

  if (!session?.user) return { error: "Not logged in!" };

  await db.notification.updateMany({
    where: {
      recipientId: session.user.userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return { success: "All notifications marked as read!" };
};

export const markNotificationAsRead = async (notificationId: string) => {
  const session = await auth();

  if (!session?.user) return { error: "Not logged in!" };

  const notification = await db.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.recipientId !== session.user.userId) {
    return { error: "Something went wrong" };
  }

  await db.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return { success: "Notification marked as read!" };
};
