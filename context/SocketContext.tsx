'use client'

import { useSession } from "next-auth/react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client'

interface iSocketContext {
    refetchNotifications: boolean
    sendNotification: (recipientId: string) => void
    handleRefetchNotifications: () => void
}

export const SocketContext = createContext<iSocketContext | null>(null)

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
    const session = useSession()
    const user = session.data?.user
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isSocketConnected, setIsSocketConnected] = useState(false)
    const [refetchNotifications, setRefetchNotifications] = useState(true)

    const sendNotification = useCallback((recipientId: string) => {
        if (user && socket && isSocketConnected) {
            socket.emit('onNotification', recipientId)
        }
    }, [user, socket, isSocketConnected])

    const handleRefetchNotifications = () => {
        setRefetchNotifications(prev => !prev)
    }

    //initialize a new socket
    useEffect(() => {
        if (!user) return;

        const newSocket = io()
        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [user])

    //listen for connection
    useEffect(() => {
        if (socket === null) return

        function onConnect() {
            setIsSocketConnected(true)
        }

        function onDisconnect() {
            setIsSocketConnected(false)
        }


        function onNotification() {
            handleRefetchNotifications()
        }

        socket.on('connect', onConnect)
        socket.on('disconnect', onDisconnect)
        socket.on('getNotifications', onNotification)

        return () => {
            socket.off('connect', onConnect)
            socket.off('disconnect', onDisconnect)
            socket.on('getNotifications', onNotification)
        }
    }, [socket])

    //set up online users
    useEffect(() => {
        if (!socket || !isSocketConnected || !user) return

        socket.emit('addOnlineUser', user.userId)

    }, [socket, isSocketConnected, user])


    return <SocketContext.Provider value={{
        refetchNotifications,
        sendNotification,
        handleRefetchNotifications
    }}>
        {children}
    </SocketContext.Provider>
}

export const useSocket = () => {
    const context = useContext(SocketContext)

    if (context === null) {
        throw new Error("useSocket must be used within a SocketProvider")
    }

    return context
}