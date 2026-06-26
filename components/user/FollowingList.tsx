'use client'

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserWithFollows } from "./UserProfile";
import UserSummary from "../blog/UserSummary";
import FollowButton from "./FollowButton";

const FollowingList = ({ user }: { user: UserWithFollows }) => {
    const [open, setOpen] = useState(false)

    return (<div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <span>
                    {user._count.followings} Followings
                </span>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] w-[90%]">
                <DialogHeader>
                    <DialogTitle>Followings</DialogTitle>
                </DialogHeader>
                <div>
                    {user.followings.map(
                        item => <div key={item.following.id} className="flex gap-8 items-center justify-between">
                            <UserSummary user={item.following} />
                            <FollowButton user={item.following} isFollowing={!!item.following.followers.length} isList={true} />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </div>);
}

export default FollowingList;