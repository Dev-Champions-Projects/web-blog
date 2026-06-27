import { getPublishedBlogs } from "@/actions/blogs/get-published-blogs";
import ListBlogs from "@/components/blog/ListBlogs";
import Alert from "@/components/common/Alert";
import Hero from "@/components/layout/Hero";

interface BlogFeedProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{
    tag: string;
    title: string;
  }>;
}

const BlogFeed = async ({ params, searchParams }: BlogFeedProps) => {
  const { page } = await params;

  const searchObj = await searchParams;

  const currentPage = parseInt(page, 10) || 1;

  const { success, error } = await getPublishedBlogs({
    page: currentPage,
    limit: 5,
    searchObj,
  });

  if (error) return <Alert error message="Error fetching blogs" />;

  if (!success) return <Alert message="No blogs!" />;

  const { blogs, hasMore } = success;

  return (
    <div>
      <Hero />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-700">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5A1C4B] dark:text-[#7fd2eb]">
            Latest Posts
          </p>
        </div>
        <ListBlogs blogs={blogs} hasMore={hasMore} currentPage={currentPage} />
      </section>
    </div>
  );
};

export default BlogFeed;
