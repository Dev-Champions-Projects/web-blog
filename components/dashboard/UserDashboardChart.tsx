import { Eye } from "lucide-react";

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

  return (
    <div className="w-full min-w-0">
      <div className="w-full min-w-0 flex flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Weekly views trend
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Reading momentum
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100">
            <Eye size={24} />
          </div>
        </div>

        {weeklyViews.length ? (
          <div className="space-y-4">
            {weeklyViews.map((item) => {
              const width = Math.max((item.count / maxCount) * 100, 10);

              return (
                <div key={item.date} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-400">
            Weekly reading activity will appear here once readers start viewing
            your posts.
          </div>
        )}

        {topPosts.length > 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Top posts by views
            </p>
            <div className="mt-4 space-y-3">
              {topPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-3xl bg-white p-3 shadow-sm dark:bg-slate-900"
                >
                  <span className="min-w-0 truncate font-medium text-slate-900 dark:text-slate-100">
                    {post.title}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {post.views}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardChart;
