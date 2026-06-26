'use client'

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { UserWithFollows } from "./UserProfile";
import UserSummary from "../blog/UserSummary";
import FollowButton from "./FollowButton";

const FollowerList = ({ user }: { user: UserWithFollows }) => {
    const [open, setOpen] = useState(false)

    return (<div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <span>
                    {user._count.followers} Followers
                </span>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] w-[90%]">
                <DialogHeader>
                    <DialogTitle>Followers</DialogTitle>
                </DialogHeader>
                <div>
                    {user.followers.map(
                        item => <div key={item.follower.id} className="flex gap-8 items-center justify-between">
                            <UserSummary user={item.follower} />
                            <FollowButton user={item.follower} isFollowing={!!item.follower.followers.length} isList={true} />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </div>);
}

export default FollowerList;