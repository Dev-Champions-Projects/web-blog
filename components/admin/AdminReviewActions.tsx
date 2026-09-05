"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";

import { approveBlog, rejectBlog } from "@/actions/admin/blog-review";

interface AdminReviewActionsProps {
  blogId: string;
}

export default function AdminReviewActions({
  blogId,
}: AdminReviewActionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const approve = () => {
    setMessage(null);

    startTransition(async () => {
      const result = await approveBlog(blogId);

      if (result.error) {
        setMessage(result.error);
        return;
      }

      router.refresh();
    });
  };

  const reject = () => {
    const confirmed = window.confirm(
      "Return this article to the author? It will remain unpublished.",
    );

    if (!confirmed) {
      return;
    }

    setMessage(null);

    startTransition(async () => {
      const result = await rejectBlog(blogId);

      if (result.error) {
        setMessage(result.error);
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <button
          type="button"
          disabled={isPending}
          onClick={approve}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="h-4 w-4" aria-hidden="true" />
          )}
          {isPending ? "Working…" : "Approve"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={reject}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50 dark:focus-visible:ring-offset-slate-950"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Reject
        </button>
      </div>

      {message ? (
        <p
          className="text-xs font-medium text-rose-600 dark:text-rose-300"
          role="alert"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
