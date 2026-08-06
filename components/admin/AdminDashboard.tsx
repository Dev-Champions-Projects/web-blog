import { getCounts } from "@/actions/admin/getCounts";
import Heading from "../common/Heading";
import Alert from "../common/Alert";
import {
  BarChart3,
  Users,
  FileText,
  Heart,
  MessageCircle,
  Bookmark,
} from "lucide-react";

const AdminDashboard = async () => {
  const res = await getCounts();

  if (res.error) return <Alert error message={res.error} />;

  const {
    userCount = 0,
    blogCount = 0,
    totalViews = 0,
    totalClaps = 0,
    totalComments = 0,
    totalBookmarks = 0,
  } = res.success ?? {};

  const stats = [
    {
      title: "Total users",
      value: userCount,
      icon: Users,
    },
    {
      title: "Published posts",
      value: blogCount,
      icon: FileText,
    },
    {
      title: "Total views",
      value: totalViews,
      icon: BarChart3,
    },
    {
      title: "Claps received",
      value: totalClaps,
      icon: Heart,
    },
    {
      title: "Comments",
      value: totalComments,
      icon: MessageCircle,
    },
    {
      title: "Bookmarks",
      value: totalBookmarks,
      icon: Bookmark,
    },
  ];

  return (
    <div className="space-y-10 py-10">
      <div className="text-center">
        <Heading title="Admin analytics" center lg />
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Monitor platform engagement and content performance at a glance. These
          metrics help you understand active users, publishing volume, and
          reader interaction.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100">
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
