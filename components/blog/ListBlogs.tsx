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
    <div className="flex flex-col max-w-[800px] m-auto justify-between min-h-[85vh] px-4 pt-2">
      <section>
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} isUserProfile={isUserProfile} />
        ))}
      </section>

      <Pagination
        currentPage={currentPage}
        hasMore={hasMore}
        isUserProfile={isUserProfile}
      />
    </div>
  );
};

export default ListBlogs;
