import Link from "next/link";
import { FilePenLine, PencilLine } from "lucide-react";

import { getBlogUrl } from "@/lib/slug";

interface DraftPost {
  id: string;
  title: string;
  createdAt: Date;
  isPublished: boolean;
  approvalStatus: string;
}

interface UserDashboardDraftsProps {
  drafts: DraftPost[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const UserDashboardDrafts = ({ drafts }: UserDashboardDraftsProps) => {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#5A1C4B] dark:text-[#7BC4D4]">
            Work in progress
          </p>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Draft articles
          </h2>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <FilePenLine className="h-3.5 w-3.5" aria-hidden="true" />
          {drafts.length.toLocaleString()}{" "}
          {drafts.length === 1 ? "draft" : "drafts"}
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            No drafts right now
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Articles you save without submitting or publishing will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {drafts.map((draft) => (
            <article
              key={draft.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Draft
                  </span>

                  <h3 className="mt-3 line-clamp-2 font-semibold leading-6 text-slate-900 dark:text-slate-100">
                    {draft.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                    Created {dateFormatter.format(new Date(draft.createdAt))}
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-400">
                  <PencilLine className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={getBlogUrl({
                    id: draft.id,
                    title: draft.title,
                  })}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
                >
                  Preview
                </Link>

                <Link
                  href={`/blog/edit/${draft.id}`}
                  className="inline-flex items-center justify-center rounded-lg bg-[#5A1C4B] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#4A173E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A1C4B] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                >
                  Edit draft
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default UserDashboardDrafts;
