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

import Alert from "../common/Alert";

import AdminDashboardClient from "./AdminDashboardClient";

import AdminMetricsChart from "./AdminMetricsChart";

import AdminReviewQueue from "./AdminReviewQueue";

const AdminDashboard = async () => {
  const res = await getCounts();

  if (res.error || !res.success) {
    return (
      <Alert error message={res.error ?? "Unable to load admin dashboard"} />
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
  } = res.success;

  const metricsRes = await getAdminMetrics(30);

  const daily = metricsRes.success?.daily ?? [];

  const topPosts = metricsRes.success?.topPosts ?? [];

  return (
    <div
      className="
        space-y-10
        py-8
        md:py-10
      "
    >
      {/* ===================================================== */}
      {/* ADMIN HERO */}
      {/* ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-[2rem]
          border
          border-slate-200
          bg-gradient-to-br
          from-fuchsia-50
          via-white
          to-sky-50
          shadow-[0_20px_60px_-20px_rgba(15,23,42,0.20)]

          dark:border-white/10
          dark:from-slate-950
          dark:via-[#3b1233]
          dark:to-[#112d43]
          dark:shadow-[0_24px_65px_-25px_rgba(0,0,0,0.8)]
        "
      >
        {/* Decorative background elements */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-fuchsia-200/30
            blur-3xl

            dark:bg-fuchsia-500/10
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-28
            left-1/3
            h-72
            w-72
            rounded-full
            bg-sky-200/40
            blur-3xl

            dark:bg-sky-400/10
          "
        />

        <div
          className="
            relative
            z-10
            p-6
            sm:p-8
            lg:p-10
          "
        >
          {/* Header */}

          <div
            className="
              flex
              flex-col
              gap-8

              xl:flex-row
              xl:items-start
              xl:justify-between
            "
          >
            <div
              className="
                max-w-3xl
              "
            >
              <p
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-[#7A1F63]

                  sm:text-sm

                  dark:text-[#86DDF1]
                "
              >
                Tech Path Administration
              </p>

              <h1
                className="
                  mt-3
                  max-w-3xl
                  text-3xl
                  font-bold
                  leading-tight
                  tracking-tight
                  text-slate-950

                  sm:text-4xl
                  lg:text-5xl

                  dark:text-white
                "
              >
                Content &amp; platform dashboard
              </h1>

              <p
                className="
                  mt-4
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-600

                  sm:text-base

                  dark:text-slate-300
                "
              >
                Review community submissions, publish trusted articles and
                monitor how the platform is performing.
              </p>
            </div>

            {/* Hero actions */}

            <div
              className="
                flex
                flex-col
                gap-3

                sm:flex-row

                xl:justify-end
              "
            >
              <Link
                href="/blog/create"
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-[#6A1B56]
                  px-5
                  text-sm
                  font-bold
                  text-white
                  shadow-md
                  transition

                  hover:bg-[#551544]
                  hover:shadow-lg

                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#6A1B56]/40
                  focus:ring-offset-2

                  dark:bg-white
                  dark:text-slate-950
                  dark:hover:bg-slate-100
                  dark:focus:ring-white/40
                  dark:focus:ring-offset-slate-950
                "
              >
                <PenSquare size={18} />
                New article
              </Link>

              <Link
                href="/admin/notifications"
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-slate-300
                  bg-white/80
                  px-5
                  text-sm
                  font-bold
                  text-slate-800
                  shadow-sm
                  backdrop-blur
                  transition

                  hover:border-slate-400
                  hover:bg-white
                  hover:shadow-md

                  focus:outline-none
                  focus:ring-2
                  focus:ring-sky-300
                  focus:ring-offset-2

                  dark:border-white/15
                  dark:bg-white/5
                  dark:text-white
                  dark:hover:border-white/25
                  dark:hover:bg-white/10
                  dark:focus:ring-sky-400/40
                  dark:focus:ring-offset-slate-950
                "
              >
                <BellRing size={18} />
                Notifications
              </Link>
            </div>
          </div>

          {/* ================================================= */}
          {/* HERO STAT CARDS */}
          {/* ================================================= */}

          <div
            className="
              mt-9
              grid
              grid-cols-1
              gap-4

              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {/* Awaiting review */}

            <div
              className="
                group
                rounded-3xl
                border
                border-amber-200/80
                bg-white/80
                p-5
                shadow-sm
                backdrop-blur
                transition

                hover:-translate-y-0.5
                hover:shadow-md

                dark:border-amber-400/15
                dark:bg-white/[0.06]
                dark:hover:bg-white/[0.08]
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <span
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-amber-100
                      text-amber-700

                      dark:bg-amber-400/10
                      dark:text-amber-300
                    "
                  >
                    <Clock3 size={19} />
                  </span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-slate-600

                      dark:text-slate-300
                    "
                  >
                    Awaiting review
                  </span>
                </div>

                {pendingBlogCount > 0 && (
                  <span
                    className="
                      rounded-full
                      bg-amber-100
                      px-2.5
                      py-1
                      text-xs
                      font-bold
                      text-amber-700

                      dark:bg-amber-400/10
                      dark:text-amber-300
                    "
                  >
                    Action needed
                  </span>
                )}
              </div>

              <p
                className="
                  mt-5
                  text-4xl
                  font-bold
                  tracking-tight
                  text-slate-950

                  dark:text-white
                "
              >
                {pendingBlogCount}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500

                  dark:text-slate-400
                "
              >
                Contributor submissions waiting for approval
              </p>
            </div>

            {/* Published */}

            <div
              className="
                group
                rounded-3xl
                border
                border-emerald-200/80
                bg-white/80
                p-5
                shadow-sm
                backdrop-blur
                transition

                hover:-translate-y-0.5
                hover:shadow-md

                dark:border-emerald-400/15
                dark:bg-white/[0.06]
                dark:hover:bg-white/[0.08]
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-100
                    text-emerald-700

                    dark:bg-emerald-400/10
                    dark:text-emerald-300
                  "
                >
                  <CheckCircle2 size={19} />
                </span>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-600

                    dark:text-slate-300
                  "
                >
                  Published
                </span>
              </div>

              <p
                className="
                  mt-5
                  text-4xl
                  font-bold
                  tracking-tight
                  text-slate-950

                  dark:text-white
                "
              >
                {publishedBlogCount}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500

                  dark:text-slate-400
                "
              >
                Approved articles currently available to readers
              </p>
            </div>

            {/* Registered users */}

            <div
              className="
                group
                rounded-3xl
                border
                border-sky-200/80
                bg-white/80
                p-5
                shadow-sm
                backdrop-blur
                transition

                hover:-translate-y-0.5
                hover:shadow-md

                md:col-span-2

                xl:col-span-1

                dark:border-sky-400/15
                dark:bg-white/[0.06]
                dark:hover:bg-white/[0.08]
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-sky-100
                    text-sky-700

                    dark:bg-sky-400/10
                    dark:text-sky-300
                  "
                >
                  <Users size={19} />
                </span>

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-600

                    dark:text-slate-300
                  "
                >
                  Registered users
                </span>
              </div>

              <p
                className="
                  mt-5
                  text-4xl
                  font-bold
                  tracking-tight
                  text-slate-950

                  dark:text-white
                "
              >
                {userCount}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500

                  dark:text-slate-400
                "
              >
                Total members registered on Tech Path
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* EDITORIAL MODERATION QUEUE */}
      {/* ===================================================== */}

      <AdminReviewQueue />

      {/* ===================================================== */}
      {/* PLATFORM OVERVIEW */}
      {/* ===================================================== */}

      <section
        className="
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm

          sm:p-6

          dark:border-slate-800
          dark:bg-slate-950
        "
      >
        <div
          className="
            mb-6
            flex
            flex-col
            gap-3

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#409FB6]/10
                text-[#2E869B]

                dark:bg-[#409FB6]/15
                dark:text-[#7FD2EB]
              "
            >
              <FileText size={21} />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  text-slate-950

                  sm:text-2xl

                  dark:text-white
                "
              >
                Platform overview
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500

                  dark:text-slate-400
                "
              >
                Engagement across all Tech Path content.
              </p>
            </div>
          </div>

          <span
            className="
              w-fit
              rounded-full
              border
              border-slate-200
              bg-slate-50
              px-3
              py-1.5
              text-xs
              font-semibold
              text-slate-600

              dark:border-slate-800
              dark:bg-slate-900
              dark:text-slate-300
            "
          >
            {blogCount} total articles
          </span>
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
      </section>

      {/* ===================================================== */}
      {/* ANALYTICS */}
      {/* ===================================================== */}

      <section
        className="
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm

          sm:p-6

          dark:border-slate-800
          dark:bg-slate-950
        "
      >
        <div
          className="
            mb-6
          "
        >
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.18em]
              text-[#7A1F63]

              dark:text-[#7FD2EB]
            "
          >
            Performance
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-bold
              text-slate-950

              sm:text-2xl

              dark:text-white
            "
          >
            Site analytics
          </h2>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-500

              dark:text-slate-400
            "
          >
            Thirty-day activity and top-performing articles across the Tech Path
            platform.
          </p>
        </div>

        <AdminMetricsChart daily={daily} topPosts={topPosts} />
      </section>
    </div>
  );
};

export default AdminDashboard;
