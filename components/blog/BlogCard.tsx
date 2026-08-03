import Link from "next/link";
import { BlogWithUser } from "./ListBlogs";
import Image from "next/image";
import UserSummary from "./UserSummary";
import Tag from "../common/Tag";
import Reactions from "./Reactions";
import { auth } from "@/auth";

const BlogCard = async ({
  blog,
  isUserProfile,
}: {
  blog: BlogWithUser;
  isUserProfile?: boolean;
}) => {
  const session = await auth();
  const userId = session?.user.userId;
  const isOwner = userId === blog.userId;
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="cursor-pointer py-6 md:py-0">
      <div className="border-b border-slate-300 dark:border-slate-700 md:border md:rounded-2xl md:p-6 md:border-slate-200 dark:md:border-slate-700 md:bg-white/5 dark:md:bg-slate-900/60">
        <div className="flex items-center justify-between">
          {blog.user && (
            <UserSummary user={blog.user} createdDate={blog.createdAt} />
          )}
          {isOwner && isUserProfile && !blog.isPublished && (
            <p className="text-rose-500">Draft</p>
          )}
          {(isOwner || isAdmin) && isUserProfile && (
            <Link className="text-orange-400" href={`/blog/edit/${blog.id}`}>
              Edit
            </Link>
          )}
        </div>
        <div className="my-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="flex w-full min-w-0 flex-col justify-between gap-3">
            <Link
              href={`/blog/details/${blog.id}`}
              className="text-xl font-bold sm:text-2xl"
            >
              {blog.title}
            </Link>
            {!!blog.tags.length && (
              <div className="flex flex-wrap items-center gap-2 my-1">
                {blog.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
            <Reactions blog={blog} />
          </div>

          {blog.coverImage && (
            <Link
              href={`/blog/details/${blog.id}`}
              className="relative block h-[220px] w-full overflow-hidden rounded-md md:h-[110px] md:w-[180px] md:max-w-[180px] md:shrink-0"
            >
              <Image
                src={blog.coverImage}
                fill
                alt={blog.title}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 180px"
                unoptimized
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
