"use client";
import Link from "next/link";
import { PiHandsClapping } from "react-icons/pi";
import { FaBookmark, FaRegBookmark, FaRegComment } from "react-icons/fa";
import { FaHandsClapping } from "react-icons/fa6";
import { useState } from "react";
import { BlogWithUser } from "./ListBlogs";
import { useSession } from "next-auth/react";
import { clapBlog } from "@/actions/blogs/clap-blog";
import { useRouter } from "next/navigation";
import { bookmarkBlog } from "@/actions/blogs/bookmark-blog";
import Alert from "../common/Alert";
import { toast } from "react-hot-toast";

const Reactions = ({ blog }: { blog: BlogWithUser }) => {
  const session = useSession();
  const userId = session.data?.user.userId;
  const [clapCount, setClapCount] = useState(blog._count.claps);
  const [userHasClapped, setUserHasClapped] = useState(
    !!userId && !!blog.claps.length,
  );
  const [userHasBookmarked, setUserHasBookmarked] = useState(
    !!userId && !!blog.bookmarks.length,
  );

  const router = useRouter();

  const handleGuestAction = (action: string) => {
    if (!userId) {
      toast.custom(
        () => (
          <div className="max-w-sm">
            <Alert
              message={
                <div className="text-sm">
                  <p>Please login to {action} this blog.</p>
                  <Link
                    href="/login"
                    className="mt-1 inline-block font-semibold underline text-sky-600 dark:text-sky-300"
                  >
                    Login now
                  </Link>
                </div>
              }
            />
          </div>
        ),
        { duration: 4000 },
      );

      return true;
    }

    return false;
  };

  const handleClap = async () => {
    if (handleGuestAction("clap")) return;

    const currentUserId = userId;
    if (!currentUserId) return;

    setClapCount((prevCount) =>
      userHasClapped ? prevCount - 1 : prevCount + 1,
    );
    setUserHasClapped((prevState) => !prevState);

    await clapBlog(blog.id, currentUserId);

    router.refresh();
  };

  const handleBookmark = async () => {
    if (handleGuestAction("bookmark")) return;

    const currentUserId = userId;
    if (!currentUserId) return;

    setUserHasBookmarked((prevState) => !prevState);

    const res = await bookmarkBlog(blog.id, currentUserId);

    if (res?.success) {
      toast.success(res.success);
    }

    if (res?.error) {
      toast.error(res.error);
    }

    router.refresh();
  };

  return (
    <div className="flex justify-between items-center w-full text-sm">
      <div className="flex items-center gap-4">
        <span
          onClick={handleClap}
          className="mr-4 flex items-center gap-1 cursor-pointer"
        >
          {userHasClapped ? (
            <FaHandsClapping size={20} />
          ) : (
            <PiHandsClapping size={20} />
          )}
          {clapCount}
        </span>
        <span className="flex items-center gap-1 cursor-pointer">
          <FaRegComment size={18} />
          {blog._count.comments}
        </span>
      </div>
      <div>
        <span onClick={handleBookmark}>
          {userHasBookmarked ? (
            <FaBookmark size={18} />
          ) : (
            <FaRegBookmark size={18} />
          )}
        </span>
      </div>
    </div>
  );
};

export default Reactions;
