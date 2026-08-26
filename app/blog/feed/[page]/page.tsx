import type { Metadata } from "next";

import { getPublishedBlogs } from "@/actions/blogs/get-published-blogs";

import ListBlogs from "@/components/blog/ListBlogs";

import Alert from "@/components/common/Alert";

import Hero from "@/components/layout/Hero";

import BlogAlertsCard from "@/components/pwa/BlogAlertsCard";

import {
  getSeoDescription,
  getSeoTitle,
  getSocialImageUrl,
  siteConfig,
} from "@/lib/seo";

interface BlogFeedProps {
  params: Promise<{
    page: string;
  }>;

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

    /*
     * Filter/search result pages do not
     * need to compete with the main feed
     * in search engines.
     */
    ...(tag || title
      ? {
          robots: {
            index: false,

            follow: true,
          },
        }
      : {}),
  };
}

const BlogFeed = async ({
  params,

  searchParams,
}: BlogFeedProps) => {
  const { page } = await params;

  const searchObj = await searchParams;

  const currentPage = Math.max(
    parseInt(page, 10) || 1,

    1,
  );

  const { success, error } = await getPublishedBlogs({
    page: currentPage,

    /*
     * Keep 5 here for now if you haven't
     * applied the pagination update yet.
     *
     * Change to 8 whenever you decide
     * to apply that improvement.
     */
    limit: 5,

    searchObj,
  });

  if (error) {
    return <Alert error message="Error fetching blogs" />;
  }

  if (!success) {
    return <Alert message="No blogs!" />;
  }

  const { blogs, hasMore } = success;

  /*
   * ==========================================
   * CONTEXTUAL EMPTY STATE
   * ==========================================
   */

  let emptyTitle = "No articles yet";

  let emptyDescription =
    "There are no published articles available here yet. Check back soon for new developer tutorials and insights.";

  let emptyActionLabel = "Browse latest posts";

  let emptyActionHref = "/blog/feed/1";

  let emptySecondaryHref: string | undefined;

  let emptySecondaryLabel: string | undefined;

  /*
   * TAG FILTER
   */
  if (searchObj.tag) {
    emptyTitle = `No ${searchObj.tag} articles yet`;

    emptyDescription = `There are no published articles under the “${searchObj.tag}” topic yet. Explore the latest Tech Path posts or check back as new content is published.`;

    emptyActionLabel = "View all articles";

    emptyActionHref = "/blog/feed/1";
  } else if (searchObj.title) {

  /*
   * TITLE / SEARCH
   */
    emptyTitle = `No results for “${searchObj.title}”`;

    emptyDescription =
      "We couldn't find any published articles matching your search. Try another keyword or browse all Tech Path articles.";

    emptyActionLabel = "Browse all articles";

    emptyActionHref = "/blog/feed/1";
  } else if (currentPage > 1) {

  /*
   * PAGINATION
   *
   * Example:
   *
   * /blog/feed/20
   *
   * when only a few pages currently exist.
   */
    emptyTitle = "Nothing on this page yet";

    emptyDescription =
      "You've reached a page that doesn't currently contain any published articles. You can return to the latest posts or move back one page.";

    emptyActionLabel = "Latest posts";

    emptyActionHref = "/blog/feed/1";

    emptySecondaryHref = `/blog/feed/${currentPage - 1}`;

    emptySecondaryLabel = "Previous page";
  }

  return (
    <div>
      <Hero />

      {currentPage === 1 && !searchObj.tag && !searchObj.title && (
        <BlogAlertsCard />
      )}

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          py-12

          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            mb-8
            border-b
            border-slate-200
            pb-6

            dark:border-slate-700
          "
        >
          <p
            className="
              text-sm
              font-semibold
              uppercase
              tracking-[0.24em]
              text-[#5A1C4B]

              dark:text-[#7FD2EB]
            "
          >
            {searchObj.tag
              ? `${searchObj.tag} Posts`
              : searchObj.title
                ? "Search Results"
                : "Latest Posts"}
          </p>

          {searchObj.tag && (
            <h1
              className="
                mt-2
                text-2xl
                font-bold
                text-slate-950

                sm:text-3xl

                dark:text-white
              "
            >
              Articles about {searchObj.tag}
            </h1>
          )}

          {searchObj.title && (
            <h1
              className="
                mt-2
                text-2xl
                font-bold
                text-slate-950

                sm:text-3xl

                dark:text-white
              "
            >
              Search results for “{searchObj.title}”
            </h1>
          )}
        </div>

        <ListBlogs
          blogs={blogs}
          hasMore={hasMore}
          currentPage={currentPage}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          emptyActionHref={emptyActionHref}
          emptyActionLabel={emptyActionLabel}
          emptySecondaryHref={emptySecondaryHref}
          emptySecondaryLabel={emptySecondaryLabel}
        />
      </section>
    </div>
  );
};

export default BlogFeed;
