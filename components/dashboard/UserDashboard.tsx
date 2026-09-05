import Link from "next/link";
import { ArrowUpRight, PenLine } from "lucide-react";

import UserDashboardCards from "@/components/dashboard/UserDashboardCards";
import UserDashboardChart from "@/components/dashboard/UserDashboardChart";
import UserDashboardRecent from "@/components/dashboard/UserDashboardRecent";
import UserDashboardDrafts from "@/components/dashboard/UserDashboardDrafts";

export interface RecentPost {
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

export interface TopViewedPost {
  id: string;
  title: string;
  views: number;
}

export interface WeeklyView {
  date: string;
  label: string;
  count: number;
}

export interface DraftPost {
  id: string;
  title: string;
  createdAt: Date;
  isPublished: boolean;
  approvalStatus: string;
}

export interface UserDashboardData {
  totalPosts: number;
  totalClaps: number;
  totalBookmarks: number;
  totalComments: number;
  totalViews: number;
  totalReaders: number;
  weeklyActiveReaders: number;
  readerStreak: number;
  recentPosts: RecentPost[];
  draftPosts: DraftPost[];
  topViewedPosts: TopViewedPost[];
  weeklyViews: WeeklyView[];
}

const UserDashboard = ({
  totalPosts,
  totalClaps,
  totalBookmarks,
  totalComments,
  totalViews,
  totalReaders,
  weeklyActiveReaders,
  readerStreak,
  recentPosts,
  draftPosts,
  topViewedPosts,
  weeklyViews,
}: UserDashboardData) => {
  const mostViewedPost = topViewedPosts[0];

  return (
    <main className="flex flex-col gap-6 py-6 sm:py-8 lg:py-10">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="h-1.5 bg-gradient-to-r from-[#5A1C4B] via-[#7A2D67] to-[#409FB6]" />

        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center rounded-full border border-[#5A1C4B]/15 bg-[#5A1C4B]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#5A1C4B] dark:border-[#409FB6]/25 dark:bg-[#409FB6]/10 dark:text-[#7BC4D4]">
              Creator overview
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              Your dashboard
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
              Track your publishing activity, readership, engagement, and recent
              article performance from one place.
            </p>
          </div>

          <Link
            href="/blog/create"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5A1C4B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A173E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A1C4B] focus-visible:ring-offset-2 sm:w-auto dark:focus-visible:ring-offset-slate-950"
          >
            <PenLine className="h-4 w-4" aria-hidden="true" />
            Create article
          </Link>
        </div>
      </section>

      <UserDashboardCards
        totalPosts={totalPosts}
        totalClaps={totalClaps}
        totalBookmarks={totalBookmarks}
        totalComments={totalComments}
        totalViews={totalViews}
        totalReaders={totalReaders}
        readerStreak={readerStreak}
      />

      <section className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <UserDashboardRecent posts={recentPosts} />

        <UserDashboardChart
          weeklyViews={weeklyViews}
          topPosts={topViewedPosts}
        />
      </section>

      <UserDashboardDrafts drafts={draftPosts} />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#5A1C4B] dark:text-[#7BC4D4]">
              Reader engagement
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              Audience snapshot
            </h2>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-500">
            Signed-in reader counts exclude your own account.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Unique signed-in readers
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
              {totalReaders.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Active readers · last 7 days
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
              {weeklyActiveReaders.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Most viewed published post
            </p>

            {mostViewedPost ? (
              <div className="mt-2">
                <p className="line-clamp-2 font-semibold text-slate-950 dark:text-white">
                  {mostViewedPost.title}
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-[#5A1C4B] dark:text-[#7BC4D4]">
                  {mostViewedPost.views.toLocaleString()} views
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                No published post performance yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default UserDashboard;
