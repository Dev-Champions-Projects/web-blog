import Link from "next/link";
import { getBlogUrl } from "@/lib/slug";

interface RecentPost {
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

interface UserDashboardRecentProps {
  posts: RecentPost[];
}

const UserDashboardRecent = ({ posts }: UserDashboardRecentProps) => {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Recent posts
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Latest activity
          </h2>
        </div>
      </div>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={getBlogUrl({ id: post.id, title: post.title })}
            className="block w-full min-w-0 rounded-3xl border border-slate-200 bg-slate-50 p-4 transition duration-200 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950/70 dark:hover:border-slate-600 dark:hover:bg-slate-900"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {post.title}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="min-w-0 truncate">
                  {post._count.claps} claps
                </span>
                <span className="min-w-0 truncate">
                  {post._count.comments} comments
                </span>
                <span className="min-w-0 truncate">
                  {post._count.bookmarks} saves
                </span>
                <span className="min-w-0 truncate">{post.views} views</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default UserDashboardRecent;
