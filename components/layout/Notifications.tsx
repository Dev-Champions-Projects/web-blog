'use client'

import { getNotifications } from "@/actions/notifications/getNotifications";
import { markAllNotificationsAsRead, markNotificationAsRead } from "@/actions/notifications/markAsRead";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSocket } from "@/context/SocketContext";
import { cn } from "@/lib/utils";
import { Blog, Comment, Notification } from "@prisma/client";
import { Bell } from "lucide-react";
import moment from "moment";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type LatestNotification = Notification & {
    blog: Pick<Blog, 'id' | 'title'> | null;
    comment: Pick<Comment, 'id' | 'content' | 'blogId'> | null;
}

const Notifications = () => {
    const router = useRouter()
    const pathname = usePathname()

    const [notifications, setNotifications] = useState<LatestNotification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { refetchNotifications, handleRefetchNotifications } = useSocket()

    useEffect(() => {
        const handleFetch = async () => {
            setLoading(true)
            setError(null)

            try {
                const res = await getNotifications()

                if (res.success) {
                    setNotifications(res.success.notifications)
                    setUnreadCount(res.success.unreadNotificationCount)
                }

                if (res.error) {
                    setError(res.error)
                }
            } catch (error) {
                console.log(error)
                setError("An error occured!")
            } finally { setLoading(false) }
        }

        handleFetch()
    }, [refetchNotifications])

    useEffect(() => {
        const hash = window.location.hash;
        let timeoutId: ReturnType<typeof setTimeout>;

        if (hash) {
            timeoutId = setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 0);
        }

        return () => clearTimeout(timeoutId);
    }, [pathname]);

    const handleOpen = async (n: LatestNotification) => {
        console.log(n.entityType, n.senderId)
        if (n.entityType === 'BLOG' && n.blogId) {
            router.push(`/blog/details/${n.blogId}/#comments`)
        }

        if (n.entityType === 'COMMENT' && n.comment?.blogId) {
            router.push(`/blog/details/${n.comment?.blogId}/#${n.comment.id}`)
        }

        if (n.entityType === 'USER' && n.senderId) {
            router.push(`/user/${n.senderId}/1`)
        }

        await markNotificationAsRead(n.id)
        handleRefetchNotifications()
    }

    const markAllAsRead = async () => {
        await markAllNotificationsAsRead()
        handleRefetchNotifications()
    }

    return (<DropdownMenu>
        <DropdownMenuTrigger className="relative">
            {!!unreadCount && <div className="absolute bg-rose-500 h-6 w-6 rounded-full text-sm flex items-center justify-center bottom-2 left-2">
                <span>{unreadCount}</span>
            </div>}
            <Bell size={20} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[100%] max-w-[400px]">
            <div className="flex gap-4 justify-between mb-2 p-2">
                <h3 className="font-bold text-lg">Notifications</h3>
                <button onClick={markAllAsRead}>Mark all as read</button>
            </div>

            {loading && <DropdownMenuItem>
                <div className="text-sm text-gray-500">Loading...</div>
            </DropdownMenuItem>}

            {error && <DropdownMenuItem>
                <div className="text-sm text-rose-500">{error}</div>
            </DropdownMenuItem>}

            {!loading && !error && !!notifications.length && notifications.map((n) => {
                return <DropdownMenuItem onClick={() => handleOpen(n)} key={n.id} className={cn('text-sm cursor-pointer mb-4 flex flex-col items-start border', !n.isRead && "bg-secondary")}>
                    <div>{n.content}</div>
                    <span className="text-xs">{moment(new Date(n.createdAt)).fromNow()}</span>
                </DropdownMenuItem>
            })}
        </DropdownMenuContent>
    </DropdownMenu>);
}

export default Notifications;