import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Eye,
  FileText,
  Flame,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";

interface UserDashboardCardsProps {
  totalPosts: number;
  totalClaps: number;
  totalBookmarks: number;
  totalComments: number;
  totalViews: number;
  totalReaders: number;
  readerStreak: number;
}

interface DashboardCard {
  key: string;
  title: string;
  description: string;
  value: number;
  icon: LucideIcon;
  iconClassName: string;
}

const numberFormatter = new Intl.NumberFormat("en-US");

const UserDashboardCards = ({
  totalPosts,
  totalClaps,
  totalBookmarks,
  totalComments,
  totalViews,
  totalReaders,
  readerStreak,
}: UserDashboardCardsProps) => {
  const cards: DashboardCard[] = [
    {
      key: "posts",
      title: "Total posts",
      description: "All posts you have created",
      value: totalPosts,
      icon: FileText,
      iconClassName:
        "bg-[#5A1C4B]/10 text-[#5A1C4B] dark:bg-[#5A1C4B]/25 dark:text-[#E7B9DA]",
    },
    {
      key: "views",
      title: "Total views",
      description: "Historical views across your posts",
      value: totalViews,
      icon: Eye,
      iconClassName:
        "bg-[#409FB6]/12 text-[#23778A] dark:bg-[#409FB6]/20 dark:text-[#8DD0DE]",
    },
    {
      key: "readers",
      title: "Unique readers",
      description: "Signed-in readers, excluding you",
      value: totalReaders,
      icon: Users,
      iconClassName:
        "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300",
    },
    {
      key: "claps",
      title: "Claps received",
      description: "Reactions across your posts",
      value: totalClaps,
      icon: Sparkles,
      iconClassName:
        "bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300",
    },
    {
      key: "bookmarks",
      title: "Total saves",
      description: "Bookmarks across your posts",
      value: totalBookmarks,
      icon: Bookmark,
      iconClassName:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
    },
    {
      key: "comments",
      title: "Comments received",
      description: "Comments left on your posts",
      value: totalComments,
      icon: MessageCircle,
      iconClassName:
        "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
    },
  ];

  return (
    <section aria-label="Dashboard metrics">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.key}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                    {numberFormatter.format(card.value)}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconClassName}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-500">
                {card.description}
              </p>
            </article>
          );
        })}

        <article className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20 sm:col-span-2 xl:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Reader activity streak
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                  {numberFormatter.format(readerStreak)}
                </p>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {readerStreak === 1 ? "day" : "days"}
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-500">
                Consecutive days with external reader activity on your posts.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <Flame className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default UserDashboardCards;
