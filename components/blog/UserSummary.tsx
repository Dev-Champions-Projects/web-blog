import { User } from "@prisma/client";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserRound } from "lucide-react";
import moment from 'moment'

export interface UserSummaryProps {
    user: Pick<User, 'id' | 'name' | 'image'>
    createdDate?: Date | null
}

const UserSummary = ({ user, createdDate }: UserSummaryProps) => {
    return (<Link href={`/user/${user.id}/1`} className="flex gap-2 items-center">
        <Avatar className="w-6 h-6">
            <AvatarImage src={user?.image || ''} />
            <AvatarFallback className="border-2 border-slate-500 dark:border-slate-50">
                <UserRound />
            </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 text-sm">
            <p>{user.name}</p>
            {createdDate && <p>{moment(new Date(createdDate)).fromNow()}</p>}
        </div>
    </Link>);
}

export default UserSummary;