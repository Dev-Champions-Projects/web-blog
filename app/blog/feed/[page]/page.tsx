import type { Metadata } from "next";
import { getPublishedBlogs } from "@/actions/blogs/get-published-blogs";
import ListBlogs from "@/components/blog/ListBlogs";
import Alert from "@/components/common/Alert";
import Hero from "@/components/layout/Hero";
import {
  getSeoDescription,
  getSeoTitle,
  getSocialImageUrl,
  siteConfig,
} from "@/lib/seo";

interface BlogFeedProps {
  params: Promise<{ page: string }>;
  searchParams: Promise<{
    tag?: string;
    title?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: BlogFeedProps): Promise<Metadata> {
  const { page } = await params;
  const { tag, title } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  const pageTitle =
    currentPage === 1
      ? "Latest developer posts from Lagos, Nigeria and Africa"
      : `Page ${currentPage} — Developer posts from Lagos, Nigeria`;

  const pageDescription =
    title || tag
      ? getSeoDescription(
          `Search results for ${title ?? tag} on Dev Champions. Browse developer tutorials, insight pieces, and community stories from Lagos and across Africa.`,
        )
      : getSeoDescription(
          "Discover the latest developer tutorials, career growth guides, and technology insights from Lagos, Nigeria and the African developer community.",
        );

  const url = `${siteConfig.url}/blog/feed/${currentPage}`;

  return {
    title: getSeoTitle(pageTitle),
    description: pageDescription,
    openGraph: {
      title: getSeoTitle(pageTitle),
      description: pageDescription,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: getSocialImageUrl(),
          alt: siteConfig.name,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: getSeoTitle(pageTitle),
      description: pageDescription,
      images: [getSocialImageUrl()],
    },
    alternates: {
      canonical: url,
    },
  };
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
