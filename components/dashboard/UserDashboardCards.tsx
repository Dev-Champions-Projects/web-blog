import { Sparkles, Bookmark, MessageCircle, Heart, Eye } from "lucide-react";

interface UserDashboardCardsProps {
  totalPosts: number;
  totalClaps: number;
  totalBookmarks: number;
  totalComments: number;
  totalViews: number;
  totalReaders: number;
  streak: number;
  readerStreak: number;
}

const cardData = [
  {
    title: "Total posts",
    icon: Heart,
    descriptor: "Published posts",
    key: "posts",
  },
  {
    title: "Total claps",
    icon: Sparkles,
    descriptor: "All reaction counts",
    key: "claps",
  },
  {
    title: "Saved count",
    icon: Bookmark,
    descriptor: "Total bookmarks across your posts",
    key: "bookmarks",
  },
  {
    title: "Total views",
    icon: Eye,
    descriptor: "All post view counts",
    key: "views",
  },
  {
    title: "Total readers",
    icon: MessageCircle,
    descriptor: "Unique students reading your posts",
    key: "readers",
  },
  {
    title: "Comment count",
    icon: MessageCircle,
    descriptor: "Reader engagement",
    key: "comments",
  },
];

const UserDashboardCards = ({
  totalPosts,
  totalClaps,
  totalBookmarks,
  totalComments,
  totalViews,
  totalReaders,
  readerStreak,
}: UserDashboardCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cardData.map((card) => {
        const value =
          card.key === "posts"
            ? totalPosts
            : card.key === "claps"
              ? totalClaps
              : card.key === "bookmarks"
                ? totalBookmarks
                : card.key === "views"
                  ? totalViews
                  : card.key === "readers"
                    ? totalReaders
                    : totalComments;

        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="group rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.descriptor}
                </p>
                <h3 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {value}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100">
                <Icon size={24} />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              {card.title}
            </p>
          </div>
        );
      })}
      <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Reader streak
            </p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
              {readerStreak} day{readerStreak === 1 ? "" : "s"}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#f8efc1] text-amber-700 shadow-sm dark:bg-amber-900 dark:text-amber-100">
            <Sparkles size={24} />
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Consecutive days readers viewed your posts.
        </p>
      </div>
    </div>
  );
};

export default UserDashboardCards;
