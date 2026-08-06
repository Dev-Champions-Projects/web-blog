"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Bookmark,
  FileText,
  Heart,
  MessageCircle,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";

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
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DetailType>("users");
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [heading, setHeading] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [deletingUserId, setDeletingUserId] = useState<string>("");
  const [localCounts, setLocalCounts] = useState<AdminCounts>(counts);

  const stats = useMemo(
    () => [
      {
        title: "Total users",
        value: localCounts.userCount,
        type: "users" as const,
        icon: Users,
        description:
          "View active accounts and remove unsafe or inactive profiles.",
      },
      {
        title: "Published posts",
        value: localCounts.blogCount,
        type: "posts" as const,
        icon: FileText,
        description:
          "See the most recent published posts and their engagement counts.",
      },
      {
        title: "Total views",
        value: localCounts.totalViews,
        type: "views" as const,
        icon: BarChart3,
        description:
          "Review the top viewed posts and understand where readers are engaging.",
      },
      {
        title: "Claps received",
        value: localCounts.totalClaps,
        type: "claps" as const,
        icon: Heart,
        description:
          "Browse the users who clapped posts and the posts they engaged with.",
      },
      {
        title: "Comments",
        value: localCounts.totalComments,
        type: "comments" as const,
        icon: MessageCircle,
        description:
          "Inspect recent comment activity with author and post context.",
      },
      {
        title: "Bookmarks",
        value: localCounts.totalBookmarks,
        type: "bookmarks" as const,
        icon: Bookmark,
        description: "Track saved posts and the users that bookmarked them.",
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
      const result = await fetch(`/api/admin/dashboard?type=${type}`);
      const json = await result.json();

      if (!result.ok) {
        setError(json.error || "Failed to load details.");
        return;
      }

      setHeading(json.success.heading ?? "Details");
      setDescription(json.success.description ?? "");
      setRows(Array.isArray(json.success.rows) ? json.success.rows : []);
    } catch (fetchError) {
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

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Unable to delete user.");
        return;
      }

      setRows((currentRows) => currentRows.filter((row) => row.id !== userId));
      setLocalCounts((current) => ({
        ...current,
        userCount: Math.max(current.userCount - 1, 0),
      }));
    } catch (deleteError) {
      setError("Unable to delete user. Please try again.");
    } finally {
      setDeletingUserId("");
    }
  };

  const renderRow = (row: AdminRow, index: number) => {
    const commonDate = formatDate(row.createdAt as string | undefined);

    if (selectedType === "users") {
      return (
        <div
          key={`${row.id}-${index}`}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                {row.name || "Unnamed user"}
              </p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                {row.email || "No email provided"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>{row.role ?? "USER"}</span>
              <span>{commonDate}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Account ID: {row.id}
            </p>
            <Button
              type="button"
              label={deletingUserId === row.id ? "Deleting…" : "Delete user"}
              outlined
              small
              className="self-start sm:self-auto"
              disabled={deletingUserId === row.id}
              onClick={() => handleDeleteUser(row.id as string)}
            />
          </div>
        </div>
      );
    }

    if (selectedType === "posts" || selectedType === "views") {
      return (
        <div
          key={`${row.id}-${index}`}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                {row.title || "Untitled post"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                By {row.authorName || "Unknown author"}
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {commonDate}
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-3 text-sm text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              Views: {row.views ?? 0}
            </div>
            <div className="rounded-2xl bg-white/80 p-3 text-sm text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              Claps: {row.claps ?? 0} · Bookmarks: {row.bookmarks ?? 0} ·
              Comments: {row.comments ?? 0}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={`${row.id}-${index}`}
        className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
              {row.blogTitle || "Unknown post"}
            </p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              By {row.actorName || "Unknown user"}
            </p>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {commonDate}
          </div>
        </div>
        {selectedType === "comments" && row.content && (
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {String(row.content).slice(0, 140)}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.title}
              type="button"
              onClick={() => loadDetails(stat.type)}
              className="group rounded-[2rem] border border-slate-200 bg-white/90 p-6 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
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
              <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {stat.description}
              </p>
            </button>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[90%] max-h-[80vh] overflow-visible">
          <DialogHeader>
            <DialogTitle>{heading || "Admin details"}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>

          <div className="mt-6 space-y-4 overflow-y-auto max-h-[60vh] pr-2 thin-scrollbar">
            {loading && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading details…
              </p>
            )}
            {error && <Alert error message={error} />}
            {!loading && !error && rows.length === 0 && (
              <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300">
                No results available yet. Try a different metric or refresh the
                page.
              </p>
            )}
            {!loading && !error && rows.length > 0 && (
              <div className="grid gap-4">{rows.map(renderRow)}</div>
            )}
          </div>

          <DialogFooter>
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
