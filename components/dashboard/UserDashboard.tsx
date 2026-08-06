import Heading from "@/components/common/Heading";
import UserDashboardCards from "@/components/dashboard/UserDashboardCards";
import UserDashboardChart from "@/components/dashboard/UserDashboardChart";
import UserDashboardRecent from "@/components/dashboard/UserDashboardRecent";

export interface RecentPost {
  id: string;
  title: string;
  createdAt: Date;
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

export interface UserDashboardData {
  totalPosts: number;
  totalClaps: number;
  totalBookmarks: number;
  totalComments: number;
  totalViews: number;
  totalReaders: number;
  weeklyActiveReaders: number;
  readerStreak: number;
  streak: number;
  recentPosts: RecentPost[];
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
  streak,
  recentPosts,
  topViewedPosts,
  weeklyViews,
}: UserDashboardData) => {
  const mostViewedPost = topViewedPosts[0];

  return (
    <div className="flex flex-col gap-6 py-10">
      <div className="flex flex-col gap-3">
        <Heading title="Your dashboard" lg />
        <p className="max-w-2xl text-slate-600 dark:text-slate-300">
          A quick snapshot of your blog activity, engagement, post views, and
          reading momentum.
        </p>
      </div>
      <UserDashboardCards
        totalPosts={totalPosts}
        totalClaps={totalClaps}
        totalBookmarks={totalBookmarks}
        totalComments={totalComments}
        totalViews={totalViews}
        totalReaders={totalReaders}
        streak={streak}
        readerStreak={readerStreak}
      />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.95fr]">
        <UserDashboardRecent posts={recentPosts} />
        <div className="w-full min-w-0 flex flex-col gap-4">
          <div className="w-full min-w-0 overflow-x-auto pb-2">
            <UserDashboardChart
              weeklyViews={weeklyViews}
              topPosts={topViewedPosts}
            />
          </div>
          <div className="w-full min-w-0 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Reader engagement summary
            </p>
            {mostViewedPost ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/70">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Most viewed post
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {mostViewedPost.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {mostViewedPost.views} views
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/70">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Total unique readers
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {totalReaders}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-950/70">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Weekly active readers
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {weeklyActiveReaders}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-600 dark:text-slate-400">
                No reader engagement yet. Once students start reading, this
                panel will track the most popular posts and active readers.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
