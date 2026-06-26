"use client"

import { useEffect, useState, useTransition } from "react";
import { CommentWithUser } from "./ListComments";
import { getComments } from "@/actions/comments/get-comments";
import ReplyCard from "./ReplyCard";

const ListReplies = ({ comment, userId }: { comment: CommentWithUser, userId?: string }) => {
    const [replies, setReplies] = useState<CommentWithUser[]>([])
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>()

    useEffect(() => {

        startTransition(() => {
            getComments(comment.blogId, comment.id, userId).then(res => {
                if (res.error) {
                    setError(res.error)
                }

                if (res.success) {
                    setReplies(res.success.comments)
                }
            })
        })

    }, [comment, userId])

    return (<div className="text-sm">
        {isPending && <p>Loading...</p>}
        {error && <p className="text-rose-500">{error}</p>}
        {!isPending && !error && replies.map(r => <div key={r.id}>
            <ReplyCard reply={r} />
        </div>)}
    </div>);
}

export default ListReplies;