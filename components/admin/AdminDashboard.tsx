import Link from "next/link";
import {
  BellRing,
  CheckCircle2,
  Clock3,
  FileText,
  PenSquare,
  Users,
} from "lucide-react";

import { getCounts } from "@/actions/admin/getCounts";
import { getAdminMetrics } from "@/actions/admin/getAdminMetrics";
import Alert from "@/components/common/Alert";

import AdminDashboardClient from "./AdminDashboardClient";
import AdminMetricsChart from "./AdminMetricsChart";
import AdminReviewQueue from "./AdminReviewQueue";

const numberFormatter = new Intl.NumberFormat("en-US");

const AdminDashboard = async () => {
  const countsResult = await getCounts();

  if (countsResult.error || !countsResult.success) {
    return (
      <Alert
        error
        message={countsResult.error ?? "Unable to load admin dashboard"}
      />
    );
  }

  const {
    userCount,
    blogCount,
    publishedBlogCount,
    pendingBlogCount,
    totalViews,
    totalClaps,
    totalComments,
    totalBookmarks,
  } = countsResult.success;

  const metricsResult = await getAdminMetrics(30);
  const daily = metricsResult.success?.daily ?? [];
  const topPosts = metricsResult.success?.topPosts ?? [];

  return (
    <main className="space-y-7 py-6 sm:py-8 lg:py-10">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="h-1.5 bg-gradient-to-r from-[#5A1C4B] via-[#7A2D67] to-[#409FB6]" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center rounded-full border border-[#5A1C4B]/15 bg-[#5A1C4B]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#5A1C4B] dark:border-[#409FB6]/25 dark:bg-[#409FB6]/10 dark:text-[#7BC4D4]">
                Tech Path administration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                Platform dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
                Review contributor submissions, manage platform activity, and
                monitor publishing and engagement from one operational view.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/blog/create"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5A1C4B] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A173E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A1C4B] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              >
                <PenSquare className="h-4 w-4" aria-hidden="true" />
                New article
              </Link>

              <Link
                href="/admin/notifications"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
              >
                <BellRing className="h-4 w-4" aria-hidden="true" />
                Notifications
              </Link>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
            <a
              href="#pending-reviews"
              className="group rounded-2xl border border-amber-200 bg-amber-50/70 p-5 transition hover:border-amber-300 hover:bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20 dark:hover:border-amber-800"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Awaiting review
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                    {numberFormatter.format(pendingBlogCount)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                  <Clock3 className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-600 dark:text-slate-400">
                  Contributor submissions requiring action
                </span>

                {pendingBlogCount > 0 ? (
                  <span className="shrink-0 rounded-full bg-amber-200/70 px-2.5 py-1 font-semibold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                    Action needed
                  </span>
                ) : null}
              </div>
            </a>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Published articles
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                    {numberFormatter.format(publishedBlogCount)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-500">
                Approved posts currently available to readers
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Registered users
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                    {numberFormatter.format(userCount)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-500">
                Total member accounts registered on Tech Path
              </p>
            </div>
          </div>
        </div>
      </section>

      <AdminReviewQueue />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#5A1C4B] dark:text-[#7BC4D4]">
              Platform overview
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              Engagement and content totals
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Select a metric to inspect the underlying users, posts, or
              engagement activity.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            {numberFormatter.format(blogCount)} total articles
          </div>
        </div>

        <AdminDashboardClient
          counts={{
            userCount,
            blogCount,
            publishedBlogCount,
            totalViews,
            totalClaps,
            totalComments,
            totalBookmarks,
          }}
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#5A1C4B] dark:text-[#7BC4D4]">
            Performance
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Site analytics
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Thirty-day activity trends and the strongest publicly available
            articles across the platform.
          </p>
        </div>

        {metricsResult.error ? (
          <Alert error message={metricsResult.error} />
        ) : (
          <AdminMetricsChart daily={daily} topPosts={topPosts} />
        )}
      </section>
    </main>
  );
};

export default AdminDashboard;
