import type {
    Server as SocketIOServer,
} from "socket.io";


type TechPathGlobal =
    typeof globalThis & {
        techPathIO?:
        SocketIOServer;
    };


const techPathGlobal =
    globalThis as TechPathGlobal;


/**
 * Tell one logged-in user's connected
 * browser tabs/devices to refresh their
 * notification bell.
 */
export function emitNotificationToUser(
    userId: string,
) {
    if (!userId) {
        return false;
    }


    const io =
        techPathGlobal.techPathIO;


    if (!io) {
        return false;
    }


    io
        .to(`user:${userId}`)
        .emit(
            "getNotifications",
        );


    return true;
}


/**
 * Refresh notification bells for several
 * authenticated users.
 *
 * Duplicate IDs are removed first so a
 * recipient is emitted to only once.
 */
export function emitNotificationToUsers(
    userIds: string[],
) {
    const uniqueUserIds =
        Array.from(
            new Set(
                userIds.filter(Boolean),
            ),
        );


    uniqueUserIds.forEach(
        (userId) => {
            emitNotificationToUser(
                userId,
            );
        },
    );
}