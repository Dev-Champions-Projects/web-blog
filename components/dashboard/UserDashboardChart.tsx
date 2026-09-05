import Link from "next/link";
import { BarChart3, Eye, Trophy } from "lucide-react";

import { getBlogUrl } from "@/lib/slug";

interface TopViewedPost {
  id: string;
  title: string;
  views: number;
}

interface WeeklyView {
  date: string;
  label: string;
  count: number;
}

interface UserDashboardChartProps {
  weeklyViews: WeeklyView[];
  topPosts: TopViewedPost[];
}

const UserDashboardChart = ({
  weeklyViews,
  topPosts,
}: UserDashboardChartProps) => {
  const maxCount = Math.max(...weeklyViews.map((item) => item.count), 1);

  const totalWeeklyViews = weeklyViews.reduce(
    (total, item) => total + item.count,
    0,
  );

  const dailyAverage = weeklyViews.length
    ? Math.round(totalWeeklyViews / weeklyViews.length)
    : 0;

  return (
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#5A1C4B] dark:text-[#7BC4D4]">
            Last 7 days
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Reading momentum
          </h2>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#409FB6]/12 text-[#23778A] dark:bg-[#409FB6]/20 dark:text-[#8DD0DE]">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Eye className="h-4 w-4" aria-hidden="true" />
            Weekly views
          </div>

          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {totalWeeklyViews.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daily average
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {dailyAverage.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {weeklyViews.map((item) => {
          const width = item.count === 0 ? 0 : (item.count / maxCount) * 100;

          return (
            <div
              key={item.date}
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3"
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-500">
                {item.label}
              </span>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                <div
                  className="h-full rounded-full bg-[#409FB6] transition-[width] duration-300"
                  style={{ width: `${width}%` }}
                />
              </div>

              <span className="min-w-8 text-right text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                {item.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-7 border-t border-slate-200 pt-6 dark:border-slate-800">
        <div className="mb-4 flex items-center gap-2">
          <Trophy
            className="h-4 w-4 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Top posts by views
          </h3>
        </div>

        {topPosts.length > 0 ? (
          <div className="space-y-2.5">
            {topPosts.slice(0, 3).map((post, index) => (
              <Link
                key={post.id}
                href={getBlogUrl({
                  id: post.id,
                  title: post.title,
                })}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-900/70"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                  {post.title}
                </span>

                <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                  {post.views.toLocaleString()} views
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Publish an approved article to start building post-performance data.
          </p>
        )}
      </div>
    </section>
  );
};

export default UserDashboardChart;
