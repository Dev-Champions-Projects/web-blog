"use server";

import {
  auth,
} from "@/auth";

import {
  db,
} from "@/lib/db";


export const getNotifications =
  async () => {
    const session =
      await auth();


    if (
      !session?.user
    ) {
      return {
        error:
          "Not logged in!",
      };
    }


    const userId =
      session.user
        .userId;


    try {
      const notifications =
        await db
          .notification
          .findMany({
            where: {
              recipientId:
                userId,
            },

            include: {
              sender: {
                select: {
                  name:
                    true,

                  id:
                    true,
                },
              },

              blog: {
                select: {
                  id:
                    true,

                  title:
                    true,

                  slug:
                    true,
                },
              },

              comment: {
                select: {
                  id:
                    true,

                  content:
                    true,

                  blogId:
                    true,
                },
              },
            },

            orderBy: {
              createdAt:
                "desc",
            },

            take:
              100,
          });


      const count =
        await db
          .notification
          .count({
            where: {
              recipientId:
                userId,
            },
          });


      if (
        count >
        100
      ) {
        const oldNotifications =
          await db
            .notification
            .findMany({
              where: {
                recipientId:
                  userId,
              },

              orderBy: {
                createdAt:
                  "desc",
              },

              skip:
                100,

              select: {
                id:
                  true,
              },
            });


        await db
          .notification
          .deleteMany({
            where: {
              id: {
                in:
                  oldNotifications.map(
                    (
                      notification,
                    ) =>
                      notification.id,
                  ),
              },
            },
          });
      }


      const unreadCount =
        await db
          .notification
          .count({
            where: {
              recipientId:
                userId,

              isRead:
                false,
            },
          });


      const formattedNotifications =
        notifications.map(
          (
            notification,
          ) => {
            let content =
              "";


            switch (
            notification.type
            ) {
              case "NEW_COMMENT":
                content =
                  `${notification.sender.name || "Someone"} commented on your blog post: "${notification.blog?.title}"`;

                break;


              case "COMMENT_REPLY":
                content =
                  `${notification.sender.name || "Someone"} replied to your comment: "${notification.comment?.content}"`;

                break;


              case "NEW_CLAP":
                content =
                  `${notification.sender.name || "Someone"} clapped your blog: "${notification.blog?.title}"`;

                break;


              case "FOLLOW":
                content =
                  `${notification.sender.name || "Someone"} followed you.`;

                break;


              case "NEW_ARTICLE":
                content =
                  `New on Tech Path: "${notification.blog?.title || notification.content || "New article"}"`;

                break;


              case "SYSTEM_ALERT":
                content =
                  notification.content ||
                  "Tech Path update";

                break;


              default:
                content =
                  `New notification from ${notification.sender.name || "Unknown"}`;
            }


            return {
              ...notification,

              content,
            };
          },
        );


      return {
        success: {
          notifications:
            formattedNotifications,

          unreadNotificationCount:
            unreadCount,
        },
      };
    } catch (
    error:
      any
    ) {
      return {
        error:
          error.message ||
          "Failed to fetch notifications",
      };
    }
  };