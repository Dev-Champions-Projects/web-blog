import Link from "next/link";

import { BellRing } from "lucide-react";

import { getCounts } from "@/actions/admin/getCounts";

import { getAdminMetrics } from "@/actions/admin/getAdminMetrics";

import Heading from "../common/Heading";

import Alert from "../common/Alert";

import AdminDashboardClient from "./AdminDashboardClient";

import AdminMetricsChart from "./AdminMetricsChart";

const AdminDashboard = async () => {
  const res = await getCounts();

  if (res.error) {
    return <Alert error message={res.error} />;
  }

  const {
    userCount = 0,

    blogCount = 0,

    totalViews = 0,

    totalClaps = 0,

    totalComments = 0,

    totalBookmarks = 0,
  } = res.success ?? {};

  const metricsRes = await getAdminMetrics(30);

  const daily = metricsRes.success?.daily ?? [];

  const topPosts = metricsRes.success?.topPosts ?? [];

  return (
    <div className="space-y-10 py-10">
      <div className="text-center">
        <Heading title="Admin analytics" center lg />

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Monitor platform engagement and content performance at a glance.
        </p>

        <Link
          href="/admin/notifications"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5A1C4B] px-5 text-sm font-bold text-white"
        >
          <BellRing className="h-4 w-4" />
          Notification Center
        </Link>
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

      <div className="mt-10">
        <Heading title="Site analytics" />

        <div className="mt-4">
          <AdminMetricsChart daily={daily} topPosts={topPosts} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
