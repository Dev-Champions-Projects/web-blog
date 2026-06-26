'use client'

import { useState } from "react";
import UserSummary from "../blog/UserSummary";
import { CommentWithUser } from "./ListComments";
import CommentReactions from "./CommentReactions";
import AddCommentsForm from "./AddCommentsForm";
import { useSession } from "next-auth/react";
import ListReplies from "./ListReplies";

const CommentCard = ({ comment }: { comment: CommentWithUser }) => {
    const session = useSession()
    const userId = session.data?.user.userId
    const [showForm, setShowForm] = useState<boolean>(false)
    const [showReplies, setShowReplies] = useState<boolean>(false)

    return (<div className="border-2 p-4 flex flex-col gap-2 rounded-md mt-6">
        <UserSummary user={comment.user} createdDate={comment.createdAt} />
        <p>{comment.content}</p>
        <CommentReactions comment={comment} setShowForm={setShowForm} setShowReplies={setShowReplies} />

        {(showForm || showReplies) && <div className="border-l-2 pl-2 my-2 ml-4">
            {userId && showForm && <AddCommentsForm blogId={comment.blogId} userId={userId} parentId={comment.id} repliedToId={comment.userId} placeholder="Add Reply" />}
            {showReplies && <ListReplies comment={comment} userId={userId} />}
        </div>}
    </div>);
}

export default CommentCard;