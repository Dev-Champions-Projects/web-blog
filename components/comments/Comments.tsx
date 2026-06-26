import { auth } from "@/auth";
import { BlogWithUser } from "../blog/ListBlogs";
import Heading from "../common/Heading";
import AddCommentsForm from "./AddCommentsForm";
import { getComments } from "@/actions/comments/get-comments";
import ListComments from "./ListComments";

const Comments = async ({ blog }: { blog: BlogWithUser }) => {
    const session = await auth()

    const userId = session?.user.userId

    const { success } = await getComments(blog.id, null, userId)

    return (<div>
        <Heading title="Comments" />
        {userId && <AddCommentsForm blogId={blog.id} userId={userId} creatorId={blog.userId} />}
        {!!success?.comments.length && <ListComments comments={success.comments} />}
    </div>);
}

export default Comments;