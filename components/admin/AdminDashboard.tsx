import { getCounts } from "@/actions/admin/getCounts";
import Heading from "../common/Heading";
import Alert from "../common/Alert";
import AdminDashboardClient from "./AdminDashboardClient";

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

      <AdminDashboardClient
        counts={{
          userCount,
          blogCount,
          totalViews,
          totalClaps,
          totalComments,
          totalBookmarks,
        }}
      />
    </div>
  );
};

export default AdminDashboard;
