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
      <section
        className="
          rounded-3xl
          border
          border-rose-200
          bg-rose-50
          p-6
          dark:border-rose-900
          dark:bg-rose-950/20
        "
      >
        <p
          className="
            font-semibold
            text-rose-700
            dark:text-rose-300
          "
        >
          {result.error ?? "Unable to load pending articles."}
        </p>
      </section>
    );
  }

  const posts = result.success.blogs;

  return (
    <section id="pending-reviews" className="space-y-5">
      <div
        className="
          flex
          flex-col
          gap-2
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-sm
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#409FB6]
            "
          >
            Editorial Queue
          </p>

          <h2
            className="
              mt-1
              text-2xl
              font-bold
              text-slate-950
              dark:text-white
            "
          >
            Posts awaiting approval
          </h2>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-600
              dark:text-slate-300
            "
          >
            Preview contributor submissions before they become visible anywhere
            on Tech Path.
          </p>
        </div>

        <span
          className="
            inline-flex
            w-fit
            rounded-full
            bg-amber-100
            px-3
            py-1
            text-sm
            font-bold
            text-amber-800
            dark:bg-amber-950/40
            dark:text-amber-300
          "
        >
          {posts.length} pending
        </span>
      </div>

      {posts.length === 0 ? (
        <div
          className="
            flex
            min-h-48
            flex-col
            items-center
            justify-center
            rounded-3xl
            border
            border-dashed
            border-slate-300
            bg-slate-50/70
            px-6
            text-center
            dark:border-slate-700
            dark:bg-slate-900/50
          "
        >
          <Inbox
            className="
              mb-3
              h-9
              w-9
              text-slate-400
            "
          />

          <h3 className="font-bold">Review queue is clear</h3>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            New contributor submissions will appear here.
          </p>
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            gap-4
          "
        >
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
                className="
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                    transition
                    hover:shadow-md
                    dark:border-slate-800
                    dark:bg-slate-950
                    sm:p-6
                  "
              >
                <div
                  className="
                      flex
                      flex-col
                      gap-5
                      lg:flex-row
                      lg:items-start
                      lg:justify-between
                    "
                >
                  <div
                    className="
                        min-w-0
                        flex-1
                      "
                  >
                    <div
                      className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                    >
                      <span
                        className="
                            rounded-full
                            bg-amber-100
                            px-2.5
                            py-1
                            text-xs
                            font-bold
                            text-amber-800
                            dark:bg-amber-950/40
                            dark:text-amber-300
                          "
                      >
                        Pending review
                      </span>

                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="
                                  rounded-full
                                  bg-slate-100
                                  px-2.5
                                  py-1
                                  text-xs
                                  text-slate-600
                                  dark:bg-slate-800
                                  dark:text-slate-300
                                "
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3
                      className="
                          mt-4
                          text-xl
                          font-bold
                          text-slate-950
                          dark:text-white
                        "
                    >
                      {post.title}
                    </h3>

                    <p
                      className="
                          mt-2
                          text-sm
                          leading-6
                          text-slate-600
                          dark:text-slate-300
                        "
                    >
                      {getExcerpt(post.content)}
                    </p>

                    <div
                      className="
                          mt-4
                          flex
                          flex-wrap
                          items-center
                          gap-x-5
                          gap-y-2
                          text-sm
                          text-slate-500
                          dark:text-slate-400
                        "
                    >
                      <span>
                        By{" "}
                        <strong
                          className="
                              font-semibold
                              text-slate-700
                              dark:text-slate-200
                            "
                        >
                          {author}
                        </strong>
                      </span>

                      <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                          "
                      >
                        <Clock3 size={15} />

                        {submittedDate.toLocaleDateString("en-GB", {
                          day: "numeric",

                          month: "short",

                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div
                    className="
                        flex
                        shrink-0
                        flex-col
                        gap-3
                        lg:items-end
                      "
                  >
                    <Link
                      href={previewUrl}
                      className="
                          inline-flex
                          min-h-10
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          border
                          border-slate-300
                          bg-white
                          px-4
                          text-sm
                          font-semibold
                          text-slate-700
                          transition
                          hover:bg-slate-50
                          dark:border-slate-700
                          dark:bg-slate-900
                          dark:text-slate-200
                          dark:hover:bg-slate-800
                        "
                    >
                      <Eye size={17} />
                      Preview
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
