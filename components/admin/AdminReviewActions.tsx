"use client";

import { useState, useTransition } from "react";

import { Check, X } from "lucide-react";

import { useRouter } from "next/navigation";

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

  function approve() {
    setMessage(null);

    startTransition(async () => {
      const result = await approveBlog(blogId);

      if (result.error) {
        setMessage(result.error);

        return;
      }

      router.refresh();
    });
  }

  function reject() {
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
  }

  return (
    <div
      className="
        flex
        flex-col
        gap-2
      "
    >
      <div
        className="
          flex
          flex-wrap
          gap-2
        "
      >
        <button
          type="button"
          disabled={isPending}
          onClick={approve}
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-emerald-600
            px-4
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-emerald-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <Check size={17} />

          {isPending ? "Working..." : "Approve & Publish"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={reject}
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-rose-200
            bg-rose-50
            px-4
            text-sm
            font-semibold
            text-rose-700
            transition
            hover:bg-rose-100
            disabled:cursor-not-allowed
            disabled:opacity-60
            dark:border-rose-900
            dark:bg-rose-950/30
            dark:text-rose-300
          "
        >
          <X size={17} />
          Reject
        </button>
      </div>

      {message && (
        <p
          className="
            text-sm
            text-rose-600
            dark:text-rose-300
          "
        >
          {message}
        </p>
      )}
    </div>
  );
}
