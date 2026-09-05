"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bookmark,
  ChevronRight,
  FileText,
  Heart,
  MessageCircle,
  Users,
} from "lucide-react";

import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DetailType =
  | "users"
  | "posts"
  | "claps"
  | "comments"
  | "bookmarks"
  | "views";

type AdminCounts = {
  userCount: number;
  blogCount: number;
  publishedBlogCount: number;
  totalViews: number;
  totalClaps: number;
  totalComments: number;
  totalBookmarks: number;
};

type AdminDashboardClientProps = {
  counts: AdminCounts;
};

type AdminRow = {
  id: string;
  createdAt: string;
  name?: string;
  email?: string;
  role?: string;
  title?: string;
  authorName?: string;
  blogTitle?: string;
  actorName?: string;
  content?: string;
  views?: number;
  claps?: number;
  comments?: number;
  bookmarks?: number;
  [key: string]: string | number | undefined;
};

type MetricCard = {
  title: string;
  value: number;
  type: DetailType;
  icon: LucideIcon;
  description: string;
  iconClassName: string;
};

const numberFormatter = new Intl.NumberFormat("en-US");

const formatDate = (value: string | undefined) => {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminDashboardClient = ({ counts }: AdminDashboardClientProps) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DetailType>("users");
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [localCounts, setLocalCounts] = useState<AdminCounts>(counts);

  useEffect(() => {
    setLocalCounts(counts);
  }, [counts]);

  const stats = useMemo<MetricCard[]>(
    () => [
      {
        title: "Total users",
        value: localCounts.userCount,
        type: "users",
        icon: Users,
        description: "Inspect registered accounts and account activity.",
        iconClassName:
          "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300",
      },
      {
        title: "Published posts",
        value: localCounts.publishedBlogCount,
        type: "posts",
        icon: FileText,
        description: "Approved articles currently available to readers.",
        iconClassName:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
      },
      {
        title: "Total views",
        value: localCounts.totalViews,
        type: "views",
        icon: BarChart3,
        description: "Historical view totals across all platform articles.",
        iconClassName:
          "bg-[#409FB6]/12 text-[#23778A] dark:bg-[#409FB6]/20 dark:text-[#8DD0DE]",
      },
      {
        title: "Claps received",
        value: localCounts.totalClaps,
        type: "claps",
        icon: Heart,
        description: "Reaction activity across Tech Path articles.",
        iconClassName:
          "bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300",
      },
      {
        title: "Comments",
        value: localCounts.totalComments,
        type: "comments",
        icon: MessageCircle,
        description: "Recent discussion activity with post context.",
        iconClassName:
          "bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300",
      },
      {
        title: "Bookmarks",
        value: localCounts.totalBookmarks,
        type: "bookmarks",
        icon: Bookmark,
        description: "Saved-post activity across registered readers.",
        iconClassName:
          "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
      },
    ],
    [localCounts],
  );

  const loadDetails = async (type: DetailType) => {
    setSelectedType(type);
    setOpen(true);
    setLoading(true);
    setError("");
    setRows([]);
    setHeading("");
    setDescription("");

    try {
      const response = await fetch(`/api/admin/dashboard?type=${type}`);
      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Failed to load details.");
        return;
      }

      setHeading(json.success.heading ?? "Details");
      setDescription(json.success.description ?? "");
      setRows(Array.isArray(json.success.rows) ? json.success.rows : []);
    } catch {
      setError("Unable to load admin details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Delete this user and all associated content?")) {
      return;
    }

    setDeletingUserId(userId);
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Unable to delete user.");
        return;
      }

      setRows((currentRows) => currentRows.filter((row) => row.id !== userId));

      /*
       * Deleting a user can cascade into blogs, comments,
       * bookmarks, claps and view records. Refresh the server
       * dashboard so every metric is recalculated instead of
       * mutating only the visible user count.
       */
      router.refresh();
    } catch {
      setError("Unable to delete user. Please try again.");
    } finally {
      setDeletingUserId("");
    }
  };

  const renderRow = (row: AdminRow, index: number) => {
    const commonDate = formatDate(row.createdAt);

    if (selectedType === "users") {
      return (
        <article
          key={`${row.id}-${index}`}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950 dark:text-white">
                {row.name || "Unnamed user"}
              </p>
              <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                {row.email || "No email provided"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">
                {row.role ?? "USER"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {commonDate}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="truncate text-xs text-slate-500 dark:text-slate-500">
              Account ID: {row.id}
            </p>

            <Button
              type="button"
              label={deletingUserId === row.id ? "Deleting…" : "Delete user"}
              outlined
              small
              className="self-start sm:self-auto"
              disabled={deletingUserId === row.id}
              onClick={() => handleDeleteUser(row.id)}
            />
          </div>
        </article>
      );
    }

    if (selectedType === "posts" || selectedType === "views") {
      return (
        <article
          key={`${row.id}-${index}`}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="line-clamp-2 font-semibold text-slate-950 dark:text-white">
                {row.title || "Untitled post"}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                By {row.authorName || "Unknown author"}
              </p>
            </div>

            <span className="shrink-0 text-xs text-slate-500 dark:text-slate-500">
              {commonDate}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Views
              </p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                {numberFormatter.format(row.views ?? 0)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Engagement
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {numberFormatter.format(row.claps ?? 0)} claps ·{" "}
                {numberFormatter.format(row.comments ?? 0)} comments ·{" "}
                {numberFormatter.format(row.bookmarks ?? 0)} saves
              </p>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article
        key={`${row.id}-${index}`}
        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="line-clamp-2 font-semibold text-slate-950 dark:text-white">
              {row.blogTitle || "Unknown post"}
            </p>
            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
              By {row.actorName || "Unknown user"}
            </p>
          </div>

          <span className="shrink-0 text-xs text-slate-500 dark:text-slate-500">
            {commonDate}
          </span>
        </div>

        {selectedType === "comments" && row.content ? (
          <p className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            {String(row.content).slice(0, 180)}
          </p>
        ) : null}
      </article>
    );
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <button
              key={stat.title}
              type="button"
              onClick={() => loadDetails(stat.type)}
              className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#409FB6] focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                    {numberFormatter.format(stat.value)}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClassName}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between gap-4">
                <p className="text-xs leading-5 text-slate-500 dark:text-slate-500">
                  {stat.description}
                </p>

                <ChevronRight
                  className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  aria-hidden="true"
                />
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[86vh] w-[94%] max-w-5xl overflow-hidden border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:px-7">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-950 dark:text-white">
                {heading || "Admin details"}
              </DialogTitle>

              {description ? (
                <DialogDescription className="mt-1 text-slate-500 dark:text-slate-400">
                  {description}
                </DialogDescription>
              ) : null}
            </DialogHeader>
          </div>

          <div className="max-h-[60vh] overflow-y-auto px-6 py-5 thin-scrollbar sm:px-7">
            {loading ? (
              <div className="space-y-3" aria-live="polite">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"
                  />
                ))}
              </div>
            ) : null}

            {error ? <Alert error message={error} /> : null}

            {!loading && !error && rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                No results are available for this metric yet.
              </div>
            ) : null}

            {!loading && !error && rows.length > 0 ? (
              <div className="grid gap-3">{rows.map(renderRow)}</div>
            ) : null}
          </div>

          <DialogFooter className="border-t border-slate-200 px-6 py-4 dark:border-slate-800 sm:px-7">
            <Button
              type="button"
              label="Close"
              onClick={() => setOpen(false)}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDashboardClient;
