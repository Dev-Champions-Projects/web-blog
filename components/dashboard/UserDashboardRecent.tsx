import Link from "next/link";
import { Bookmark, Eye, MessageCircle, Sparkles } from "lucide-react";

import { getBlogUrl } from "@/lib/slug";

interface RecentPost {
  id: string;
  title: string;
  createdAt: Date;
  publishedAt: Date | null;
  views: number;

  _count: {
    claps: number;
    comments: number;
    bookmarks: number;
  };
}

interface UserDashboardRecentProps {
  posts: RecentPost[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const UserDashboardRecent = ({ posts }: UserDashboardRecentProps) => {
  return (
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
      <div>
        <p className="text-sm font-semibold text-[#5A1C4B] dark:text-[#7BC4D4]">
          Recent publishing
        </p>

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
          Latest activity
        </h2>
      </div>

      {posts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            No published posts yet
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your latest approved and published articles will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
          {posts.map((post) => {
            const activityDate = post.publishedAt ?? post.createdAt;

            return (
              <Link
                key={post.id}
                href={getBlogUrl({
                  id: post.id,
                  title: post.title,
                })}
                className="group block py-4 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-semibold leading-6 text-slate-900 transition group-hover:text-[#5A1C4B] dark:text-slate-100 dark:group-hover:text-[#8DD0DE]">
                      {post.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      Published {dateFormatter.format(new Date(activityDate))}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Published
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    {post.views.toLocaleString()} views
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {post._count.claps.toLocaleString()} claps
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    {post._count.comments.toLocaleString()} comments
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                    {post._count.bookmarks.toLocaleString()} saves
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default UserDashboardRecent;
