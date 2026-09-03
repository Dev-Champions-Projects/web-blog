import Link from "next/link";
import { FilePenLine } from "lucide-react";
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

const UserDashboardDrafts = ({ drafts }: UserDashboardDraftsProps) => {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Your drafts
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Unpublished articles
          </h2>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <FilePenLine className="h-4 w-4" />
          {drafts.length}
        </div>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
          <p className="font-medium text-slate-700 dark:text-slate-200">
            No drafts yet
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Articles you save as drafts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Draft
                    </span>
                  </div>

                  <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                    {draft.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Created {new Date(draft.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={getBlogUrl({
                      id: draft.id,
                      title: draft.title,
                    })}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Preview
                  </Link>

                  <Link
                    href={`/blog/edit/${draft.id}`}
                    className="rounded-xl bg-[#5A1C4B] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Edit Draft
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboardDrafts;
