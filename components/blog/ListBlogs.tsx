import { Blog, User } from "@prisma/client";

import BlogCard from "./BlogCard";

import Pagination from "./Pagination";

import EmptyBlogState from "./EmptyBlogState";

export type BlogWithUser = Blog & {
  user: Pick<User, "id" | "name" | "image">;

  _count: {
    claps: number;

    comments: number;
  };

  claps: {
    id: string;
  }[];

  bookmarks: {
    id: string;
  }[];
};

interface ListBlogsProps {
  blogs: BlogWithUser[];

  hasMore: boolean;

  currentPage: number;

  isUserProfile?: boolean;

  emptyTitle?: string;

  emptyDescription?: string;

  emptyActionHref?: string;

  emptyActionLabel?: string;

  emptySecondaryHref?: string;

  emptySecondaryLabel?: string;
}

const ListBlogs = ({
  blogs,

  hasMore,

  currentPage,

  isUserProfile,

  emptyTitle,

  emptyDescription,

  emptyActionHref,

  emptyActionLabel,

  emptySecondaryHref,

  emptySecondaryLabel,
}: ListBlogsProps) => {
  /*
   * ==========================================
   * EMPTY STATE
   * ==========================================
   */

  if (blogs.length === 0) {
    return (
      <div
        className="
          m-auto
          min-h-[60vh]
          max-w-[1200px]
          px-4
          pt-2
        "
      >
        <EmptyBlogState
          title={emptyTitle}
          description={emptyDescription}
          actionHref={emptyActionHref}
          actionLabel={emptyActionLabel}
          secondaryHref={emptySecondaryHref}
          secondaryLabel={emptySecondaryLabel}
        />
      </div>
    );
  }

  /*
   * ==========================================
   * BLOG LIST
   * ==========================================
   */

  return (
    <div
      className="
        m-auto
        min-h-[85vh]
        max-w-[1200px]
        px-4
        pt-2
      "
    >
      <section
        className="
          grid
          grid-cols-1
          gap-6

          md:grid-cols-2
        "
      >
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} isUserProfile={isUserProfile} />
        ))}
      </section>

      <div
        className="
          mt-8
        "
      >
        <Pagination
          currentPage={currentPage}
          hasMore={hasMore}
          isUserProfile={isUserProfile}
        />
      </div>
    </div>
  );
};

export default ListBlogs;
