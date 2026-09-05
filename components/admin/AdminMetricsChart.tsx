import Link from "next/link";
import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Trophy,
  UserPlus,
} from "lucide-react";

import { getBlogUrl } from "@/lib/slug";

interface DailyRow {
  date: string;
  views: number;
  claps: number;
  comments: number;
  bookmarks: number;
  newUsers: number;
}

interface TopPost {
  id: string;
  title: string;
  views: number;
  _count?: {
    claps: number;
  };
}

interface Props {
  daily: DailyRow[];
  topPosts: TopPost[];
}

interface TrendPanelProps {
  label: string;
  totalLabel: string;
  values: {
    date: string;
    count: number;
  }[];
  icon: typeof Eye;
  barClassName: string;
  iconClassName: string;
}

const numberFormatter = new Intl.NumberFormat("en-US");

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const TrendPanel = ({
  label,
  totalLabel,
  values,
  icon: Icon,
  barClassName,
  iconClassName,
}: TrendPanelProps) => {
  const recentValues = values.slice(-14);
  const maximum = Math.max(...recentValues.map((value) => value.count), 1);
  const total = values.reduce((sum, value) => sum + value.count, 0);

  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
            Last 14 days shown
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          {numberFormatter.format(total)}
        </p>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-500">
          {totalLabel} · 30 days
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        {recentValues.map((value) => {
          const width = value.count === 0 ? 0 : (value.count / maximum) * 100;

          return (
            <div
              key={value.date}
              className="grid grid-cols-[3.5rem_1fr_2.25rem] items-center gap-3"
            >
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-500">
                {shortDateFormatter.format(
                  new Date(`${value.date}T00:00:00.000Z`),
                )}
              </span>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${barClassName}`}
                  style={{ width: `${width}%` }}
                />
              </div>

              <span className="text-right text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-400">
                {numberFormatter.format(value.count)}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
};

const AdminMetricsChart = ({ daily, topPosts }: Props) => {
  const totalViews = daily.reduce((sum, row) => sum + row.views, 0);
  const totalEngagement = daily.reduce(
    (sum, row) => sum + row.claps + row.comments + row.bookmarks,
    0,
  );
  const newUsers = daily.reduce((sum, row) => sum + row.newUsers, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
            Recorded views · 30 days
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {numberFormatter.format(totalViews)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
            Engagement events · 30 days
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {numberFormatter.format(totalEngagement)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
            New users · 30 days
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {numberFormatter.format(newUsers)}
          </p>
        </div>
      </div>

      {daily.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <TrendPanel
            label="Views"
            totalLabel="recorded views"
            values={daily.map((row) => ({
              date: row.date,
              count: row.views,
            }))}
            icon={Eye}
            barClassName="bg-[#409FB6]"
            iconClassName="bg-[#409FB6]/12 text-[#23778A] dark:bg-[#409FB6]/20 dark:text-[#8DD0DE]"
          />

          <TrendPanel
            label="New users"
            totalLabel="registrations"
            values={daily.map((row) => ({
              date: row.date,
              count: row.newUsers,
            }))}
            icon={UserPlus}
            barClassName="bg-sky-600"
            iconClassName="bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300"
          />

          <TrendPanel
            label="Claps"
            totalLabel="claps"
            values={daily.map((row) => ({
              date: row.date,
              count: row.claps,
            }))}
            icon={Heart}
            barClassName="bg-rose-500"
            iconClassName="bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300"
          />

          <TrendPanel
            label="Comments"
            totalLabel="comments"
            values={daily.map((row) => ({
              date: row.date,
              count: row.comments,
            }))}
            icon={MessageCircle}
            barClassName="bg-violet-500"
            iconClassName="bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300"
          />

          <TrendPanel
            label="Bookmarks"
            totalLabel="bookmarks"
            values={daily.map((row) => ({
              date: row.date,
              count: row.bookmarks,
            }))}
            icon={Bookmark}
            barClassName="bg-amber-500"
            iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          No recent analytics data is available yet.
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Trophy
            className="h-4 w-4 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Top published posts by views
          </h3>
        </div>

        {topPosts.length > 0 ? (
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {topPosts.slice(0, 5).map((post, index) => (
              <Link
                key={post.id}
                href={getBlogUrl({
                  id: post.id,
                  title: post.title,
                })}
                className="group flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:ring-slate-800">
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 transition group-hover:text-[#5A1C4B] dark:text-slate-200 dark:group-hover:text-[#8DD0DE]">
                  {post.title}
                </span>

                <span className="hidden shrink-0 text-xs text-slate-500 dark:text-slate-500 sm:block">
                  {numberFormatter.format(post._count?.claps ?? 0)} claps
                </span>

                <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-400">
                  {numberFormatter.format(post.views)} views
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            No published-post performance data is available yet.
          </p>
        )}
      </section>

      <p className="text-xs leading-5 text-slate-500 dark:text-slate-500">
        Note: dated view analytics are based on BlogView events. Historical
        totals recorded before event-level view tracking was enabled remain in
        the platform-wide Total Views metric but cannot be assigned to past
        dates retroactively.
      </p>
    </div>
  );
};

export default AdminMetricsChart;
