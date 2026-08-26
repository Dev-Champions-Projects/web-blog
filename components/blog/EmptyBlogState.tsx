import Link from "next/link";

import { ArrowLeft, FileSearch } from "lucide-react";

interface EmptyBlogStateProps {
  title?: string;

  description?: string;

  actionHref?: string;

  actionLabel?: string;

  secondaryHref?: string;

  secondaryLabel?: string;
}

const EmptyBlogState = ({
  title = "No articles yet",

  description = "There are no published articles available here yet.",

  actionHref = "/blog/feed/1",

  actionLabel = "Browse latest posts",

  secondaryHref,

  secondaryLabel,
}: EmptyBlogStateProps) => {
  return (
    <div
      className="
        flex
        min-h-[420px]
        w-full
        items-center
        justify-center
        rounded-3xl
        border
        border-dashed
        border-slate-300
        bg-slate-50/70
        px-6
        py-16
        text-center

        dark:border-slate-700
        dark:bg-slate-900/40
      "
    >
      <div
        className="
          flex
          max-w-lg
          flex-col
          items-center
        "
      >
        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-[#5A1C4B]/10
            text-[#5A1C4B]

            dark:bg-[#7FD2EB]/10
            dark:text-[#7FD2EB]
          "
        >
          <FileSearch size={30} />
        </div>

        <h2
          className="
            mt-6
            text-2xl
            font-bold
            tracking-tight
            text-slate-950

            sm:text-3xl

            dark:text-white
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-3
            max-w-md
            text-sm
            leading-7
            text-slate-600

            sm:text-base

            dark:text-slate-400
          "
        >
          {description}
        </p>

        <div
          className="
            mt-7
            flex
            flex-col
            gap-3

            sm:flex-row
          "
        >
          <Link
            href={actionHref}
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              rounded-xl
              bg-[#5A1C4B]
              px-5
              text-sm
              font-semibold
              text-white
              transition

              hover:bg-[#48163c]

              dark:bg-[#7FD2EB]
              dark:text-slate-950
              dark:hover:bg-[#9BE4F4]
            "
          >
            {actionLabel}
          </Link>

          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-5
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
              <ArrowLeft size={16} />

              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyBlogState;
