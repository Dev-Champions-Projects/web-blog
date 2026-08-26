import { getBookmarks } from "@/actions/blogs/get-bookmarks";

import ListBlogs from "@/components/blog/ListBlogs";

import Alert from "@/components/common/Alert";

import Heading from "@/components/common/Heading";

interface BookmarksProps {
  params: Promise<{
    page: string;
  }>;
}

const Bookmarks = async ({ params }: BookmarksProps) => {
  const { page } = await params;

  const currentPage = Math.max(parseInt(page, 10) || 1, 1);

  const { success, error } = await getBookmarks({
    page: currentPage,

    limit: 5,
  });

  if (error) {
    return <Alert error message="Error fetching bookmarks" />;
  }

  if (!success) {
    return <Alert message="Unable to load bookmarks." />;
  }

  const { blogs, hasMore } = success;

  /*
   * ==========================================
   * EMPTY BOOKMARK STATE
   * ==========================================
   */

  const emptyTitle =
    currentPage > 1 ? "No bookmarks on this page" : "No bookmarks yet";

  const emptyDescription =
    currentPage > 1
      ? "There are no saved articles on this bookmarks page. Return to your first bookmarks page or explore more Tech Path articles."
      : "Articles you bookmark will appear here so you can easily return to tutorials, guides and insights you want to read again.";

  const emptyActionHref =
    currentPage > 1 ? "/blog/bookmarks/1" : "/blog/feed/1";

  const emptyActionLabel =
    currentPage > 1 ? "Back to bookmarks" : "Explore articles";

  const emptySecondaryHref =
    currentPage > 1 ? `/blog/bookmarks/${currentPage - 1}` : undefined;

  const emptySecondaryLabel = currentPage > 1 ? "Previous page" : undefined;

  return (
    <div>
      <div
        className="
          m-auto
          mt-6
          max-w-[1200px]
          px-4
        "
      >
        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-gradient-to-br
            from-slate-50
            via-white
            to-fuchsia-50/60
            px-5
            py-6

            sm:px-7
            sm:py-8

            dark:border-slate-800
            dark:from-slate-950
            dark:via-slate-950
            dark:to-[#35102e]
          "
        >
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.2em]
              text-[#5A1C4B]

              dark:text-[#7FD2EB]
            "
          >
            Your Library
          </p>

          <Heading title="Bookmarks" lg />

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-600

              dark:text-slate-400
            "
          >
            Keep your favourite Tech Path articles in one place and return to
            them whenever you need them.
          </p>
        </div>
      </div>

      <div
        className="
          mt-8
        "
      >
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
      </div>
    </div>
  );
};

export default Bookmarks;
