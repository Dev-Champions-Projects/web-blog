import Link from "next/link";
import { Clock3, Eye, Inbox } from "lucide-react";

import { getPendingBlogReviews } from "@/actions/admin/blog-review";
import { getBlogUrl } from "@/lib/slug";

import AdminReviewActions from "./AdminReviewActions";

function getExcerpt(content: string, maxLength = 180) {
  try {
    const parsed = JSON.parse(content);
    const values: string[] = [];

    function walk(value: unknown) {
      if (typeof value === "string") {
        values.push(value);
        return;
      }

      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;

        if (typeof record.text === "string") {
          values.push(record.text);
        }

        if (record.content !== undefined) {
          walk(record.content);
        }

        if (record.children !== undefined) {
          walk(record.children);
        }
      }
    }

    walk(parsed);

    const text = values.join(" ").replace(/\s+/g, " ").trim();

    if (!text) {
      return "No preview text available.";
    }

    return text.length > maxLength
      ? `${text.slice(0, maxLength).trim()}…`
      : text;
  } catch {
    return "Open the article preview to review its content.";
  }
}

export default async function AdminReviewQueue() {
  const result = await getPendingBlogReviews();

  if (result.error || !result.success) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/20">
        <p className="font-semibold text-rose-700 dark:text-rose-300">
          {result.error ?? "Unable to load pending articles."}
        </p>
      </section>
    );
  }

  const posts = result.success.blogs;

  return (
    <section
      id="pending-reviews"
      className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#5A1C4B] dark:text-[#7BC4D4]">
            Editorial queue
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Posts awaiting approval
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Preview contributor submissions and decide whether they are ready to
            become publicly available on Tech Path.
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
            posts.length > 0
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
          }`}
        >
          {posts.length} {posts.length === 1 ? "submission" : "submissions"}
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="mt-6 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
            <Inbox className="h-6 w-6" aria-hidden="true" />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-100">
            Review queue is clear
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            New contributor submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {posts.map((post) => {
            const previewUrl = getBlogUrl({
              id: post.id,
              title: post.title,
              slug: post.slug,
            });

            const author = post.user.name || post.user.email;
            const submittedDate = post.submittedAt ?? post.createdAt;

            return (
              <article
                key={post.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900 sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Pending review
                      </span>

                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}

                      {post.tags.length > 4 ? (
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-500">
                          +{post.tags.length - 4} more
                        </span>
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-lg font-bold leading-7 text-slate-950 sm:text-xl dark:text-white">
                      {post.title}
                    </h3>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {getExcerpt(post.content)}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        By{" "}
                        <strong className="font-semibold text-slate-700 dark:text-slate-200">
                          {author}
                        </strong>
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        Submitted{" "}
                        {submittedDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 lg:min-w-[220px] lg:items-stretch">
                    <Link
                      href={previewUrl}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      Preview article
                    </Link>

                    <AdminReviewActions blogId={post.id} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
