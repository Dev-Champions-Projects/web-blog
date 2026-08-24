"use client";

import { getNotifications } from "@/actions/notifications/getNotifications";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/actions/notifications/markAsRead";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSocket } from "@/context/SocketContext";

import { cn } from "@/lib/utils";

import type { Blog, Comment, Notification } from "@prisma/client";

import { Bell } from "lucide-react";

import moment from "moment";

import { usePathname, useRouter } from "next/navigation";

import { getBlogUrl } from "@/lib/slug";

import { useEffect, useState } from "react";

export type LatestNotification = Notification & {
  blog: Pick<Blog, "id" | "title" | "slug"> | null;

  comment: Pick<Comment, "id" | "content" | "blogId"> | null;
};

export default function Notifications() {
  const router = useRouter();

  const pathname = usePathname();

  const [notifications, setNotifications] = useState<LatestNotification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const { refetchNotifications, handleRefetchNotifications } = useSocket();

  useEffect(() => {
    async function handleFetch() {
      setLoading(true);

      setError(null);

      try {
        const response = await getNotifications();

        if (response.success) {
          setNotifications(response.success.notifications);

          setUnreadCount(response.success.unreadNotificationCount);
        }

        if (response.error) {
          setError(response.error);
        }
      } catch {
        setError("Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    }

    void handleFetch();
  }, [refetchNotifications]);

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash) {
      return;
    }

    const timeout = setTimeout(
      () => {
        const element = document.querySelector(hash);

        element?.scrollIntoView({
          behavior: "smooth",
        });
      },

      0,
    );

    return () => clearTimeout(timeout);
  }, [pathname]);

  function getDestination(notification: LatestNotification) {
    /*
     * New articles go to the article itself.
     */

    if (notification.type === "NEW_ARTICLE" && notification.blog) {
      return getBlogUrl({
        id: notification.blog.id,

        title: notification.blog.title,

        slug: notification.blog.slug,
      });
    }

    /*
     * Admin/System alerts can point to
     * any safe internal Tech Path path.
     */

    if (notification.type === "SYSTEM_ALERT" && notification.url) {
      return notification.url;
    }

    if (notification.entityType === "BLOG" && notification.blogId) {
      const path = getBlogUrl({
        id: notification.blogId,

        title: notification.blog?.title,

        slug: notification.blog?.slug,
      });

      return `${path}#comments`;
    }

    if (notification.entityType === "COMMENT" && notification.comment?.blogId) {
      const path = getBlogUrl({
        id: notification.comment.blogId,
      });

      return `${path}#${notification.comment.id}`;
    }

    if (notification.entityType === "USER" && notification.senderId) {
      return `/user/${notification.senderId}/1`;
    }

    if (notification.url) {
      return notification.url;
    }

    return null;
  }

  async function handleOpen(notification: LatestNotification) {
    const destination = getDestination(notification);

    await markNotificationAsRead(notification.id);

    handleRefetchNotifications();

    if (destination) {
      router.push(destination);
    }
  }

  async function markAllAsRead() {
    await markAllNotificationsAsRead();

    handleRefetchNotifications();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative">
        {unreadCount > 0 && (
          <div className="absolute bottom-2 left-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}

        <Bell size={20} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="max-h-[70vh] w-[calc(100vw-2rem)] max-w-[400px] overflow-y-auto">
        <div className="mb-2 flex items-center justify-between gap-4 p-2">
          <h3 className="text-lg font-bold">Notifications</h3>

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs font-semibold text-[#5A1C4B]"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading && <DropdownMenuItem>Loading...</DropdownMenuItem>}

        {error && (
          <DropdownMenuItem className="text-rose-500">{error}</DropdownMenuItem>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="p-5 text-center text-sm text-gray-500">
            No notifications yet.
          </div>
        )}

        {!loading &&
          !error &&
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => void handleOpen(notification)}
              className={cn(
                "mb-2 flex cursor-pointer flex-col items-start rounded-xl border p-3 text-sm",

                !notification.isRead && "bg-secondary",
              )}
            >
              <div>{notification.content}</div>

              <span className="mt-1 text-xs text-gray-500">
                {moment(new Date(notification.createdAt)).fromNow()}
              </span>
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
