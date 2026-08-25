"use client";

import dynamic from "next/dynamic";

import { useEffect, useId, useRef } from "react";

import { Code2, ExternalLink, X } from "lucide-react";

import { createPortal } from "react-dom";

import LocalWebPlayground from "@/components/playground/LocalWebPlayground";

import { saveWebPlaygroundDraft } from "@/lib/playground/drafts";

import type { PlaygroundTarget } from "@/lib/playground/types";

interface PlaygroundModalProps {
  open: boolean;

  target: PlaygroundTarget | null;

  onClose: () => void;
}

const InteractiveWebPlayground = dynamic(
  () => import("@/components/playground/InteractiveWebPlayground"),

  {
    ssr: false,

    loading: () => (
      <div
        className="
            flex
            min-h-[350px]
            items-center
            justify-center
            rounded-xl
            border
            border-slate-700
            bg-slate-950
            p-8
            text-sm
            text-slate-400
          "
      >
        Loading Tech Path Playground...
      </div>
    ),
  },
);

export default function PlaygroundModal({
  open,
  target,
  onClose,
}: PlaygroundModalProps) {
  const titleId = useId();

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    const focusTimer = window.setTimeout(
      () => {
        closeButtonRef.current?.focus();
      },

      0,
    );

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);

      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  if (!open || !target || typeof document === "undefined") {
    return null;
  }

  function openFullPlayground() {
    if (!target || target.kind !== "web") {
      return;
    }

    const draftId = saveWebPlaygroundDraft(target);

    if (!draftId) {
      return;
    }

    window.open(
      `/playground?draft=${encodeURIComponent(draftId)}`,

      "_blank",

      "noopener,noreferrer",
    );
  }

  return createPortal(
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-black/75
        p-2
        backdrop-blur-sm
        sm:p-4
        lg:p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="
          flex
          h-[calc(100dvh-1rem)]
          w-full
          max-w-[1500px]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-700
          bg-[#020817]
          shadow-2xl
          sm:h-[calc(100dvh-2rem)]
          lg:h-[min(920px,calc(100dvh-3rem))]
        "
      >
        <header
          className="
            flex
            shrink-0
            flex-wrap
            items-center
            justify-between
            gap-3
            border-b
            border-slate-700
            px-4
            py-4
            sm:px-6
          "
        >
          <div
            className="
              flex
              min-w-0
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
                rounded-xl
                bg-[#409FB6]/15
                text-[#75c9da]
              "
            >
              <Code2 size={22} />
            </div>

            <div
              className="
                min-w-0
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#75c9da]
                "
              >
                Tech Path Playground
              </p>

              <h2
                id={titleId}
                className="
                  truncate
                  text-lg
                  font-bold
                  text-white
                  sm:text-xl
                "
              >
                {target.kind === "web"
                  ? "HTML + CSS + JavaScript"
                  : target.label}
              </h2>

              <p
                className="
                  hidden
                  text-sm
                  text-slate-400
                  sm:block
                "
              >
                Edit a temporary copy. The original article remains unchanged.
              </p>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            {target.kind === "web" && (
              <button
                type="button"
                onClick={openFullPlayground}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-600
                  px-3
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-200
                  transition
                  hover:bg-slate-800
                "
              >
                <ExternalLink size={17} />

                <span
                  className="
                    hidden
                    md:inline
                  "
                >
                  Open Full Playground
                </span>
              </button>
            )}

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close playground"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#6B1D57]
                px-3
                py-2.5
                font-semibold
                text-white
                transition
                hover:opacity-90
                sm:px-4
              "
            >
              <X size={19} />

              <span
                className="
                  hidden
                  sm:inline
                "
              >
                Close
              </span>
            </button>
          </div>
        </header>

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            p-2
            sm:p-4
          "
        >
          {target.kind === "web" ? (
            <LocalWebPlayground key={target.id} example={target} />
          ) : (
            <InteractiveWebPlayground
              key={target.id}
              runner={target.runner}
              code={target.code}
            />
          )}
        </div>
      </section>
    </div>,

    document.body,
  );
}
