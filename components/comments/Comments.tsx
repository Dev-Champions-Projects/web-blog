import { auth } from "@/auth";
import { BlogWithUser } from "../blog/ListBlogs";
import Heading from "../common/Heading";
import AddCommentsForm from "./AddCommentsForm";
import { getComments } from "@/actions/comments/get-comments";
import ListComments from "./ListComments";
import Alert from "../common/Alert";
import Link from "next/link";

const Comments = async ({ blog }: { blog: BlogWithUser }) => {
  const session = await auth();

  const userId = session?.user.userId;

  const { success } = await getComments(blog.id, null, userId);

  return (
    <div>
      <Heading title="Comments" />
      {userId && (
        <AddCommentsForm
          blogId={blog.id}
          userId={userId}
          creatorId={blog.userId}
        />
      )}
      {!!success?.comments.length && (
        <ListComments comments={success.comments} />
      )}
      {!userId && !success?.comments.length && (
        <Alert
          message={
            <div className="text-sm">
              No comments,{" "}
              <Link
                href="/login"
                className="font-semibold underline text-sky-600 dark:text-sky-300"
              >
                login to comment
              </Link>
            </div>
          }
        />
      )}
    </div>
  );
};

export default Comments;
