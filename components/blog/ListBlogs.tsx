import { Blog, User } from "@prisma/client";
import BlogCard from "./BlogCard";
import Pagination from "./Pagination";

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
}

const ListBlogs = ({
  blogs,
  hasMore,
  currentPage,
  isUserProfile,
}: ListBlogsProps) => {
  return (
    <div className="max-w-[1200px] m-auto min-h-[85vh] px-4 pt-2">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} isUserProfile={isUserProfile} />
        ))}
      </section>

      <div className="mt-6">
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
