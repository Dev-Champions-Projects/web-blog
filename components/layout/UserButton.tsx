'use client'

import { LogOut, Pencil, Shield, User, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { FaRegBookmark } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation";

const UserButton = () => {

    const session = useSession()
    const isAdmin = session.data?.user.role === 'ADMIN'
    const imageUrl = session.data?.user.image || ""
    const router = useRouter()

    return (<DropdownMenu>
        <DropdownMenuTrigger>
            <Avatar>
                <AvatarImage src={imageUrl} />
                <AvatarFallback className="border-2 border-slate-500 dark:border-slate-50">
                    <UserRound />
                </AvatarFallback>
            </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem>
                <button onClick={() => router.push(`/user/${session.data?.user.userId}/1`)} className="flex items-center gap-2">
                    <User size={18} /> Profile
                </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <button onClick={() => router.push('/blog/create')} className="flex items-center gap-2">
                    <Pencil size={18} /> Create Post
                </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
                <button onClick={() => router.push('/blog/bookmarks/1')} className="flex items-center gap-2">
                    <FaRegBookmark size={16} /> Bookmarks
                </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isAdmin && <>
                <DropdownMenuItem>
                    <button onClick={() => router.push('/admin')} className="flex items-center gap-2">
                        <Shield size={18} /> Admin
                    </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
            </>}
            <DropdownMenuItem>
                <button onClick={() => signOut()} className="flex items-center gap-2">
                    <LogOut size={18} /> Sign OUt
                </button>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>);
}

export default UserButton;