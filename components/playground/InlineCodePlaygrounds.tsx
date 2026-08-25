"use client";

import { useEffect, useMemo, useState } from "react";

import type { RefObject } from "react";

import { ExternalLink, Play } from "lucide-react";

import { createPortal } from "react-dom";

import PlaygroundModal from "@/components/playground/PlaygroundModal";

import { extractPlaygroundTargets } from "@/lib/playground/detectRunner";

import { saveWebPlaygroundDraft } from "@/lib/playground/drafts";

import type { PlaygroundTarget } from "@/lib/playground/types";

interface InlineCodePlaygroundsProps {
  content: string;

  rootRef: RefObject<HTMLDivElement | null>;
}

interface MountPoint {
  target: PlaygroundTarget;

  element: HTMLElement;
}

const MOUNT_ATTRIBUTE = "data-tech-path-playground-mount";

function getRenderedCodeBlocks(root: HTMLElement): HTMLElement[] {
  const contentNodes = Array.from(
    root.querySelectorAll<HTMLElement>('[data-content-type="codeBlock"]'),
  );

  if (contentNodes.length > 0) {
    return contentNodes.map(
      (node) =>
        node.closest<HTMLElement>('[data-node-type="blockOuter"]') ??
        node.closest<HTMLElement>('[data-node-type="blockContainer"]') ??
        node,
    );
  }

  return Array.from(root.querySelectorAll<HTMLElement>("pre")).map(
    (node) =>
      node.closest<HTMLElement>('[data-node-type="blockOuter"]') ??
      node.closest<HTMLElement>('[data-node-type="blockContainer"]') ??
      node,
  );
}

function findRenderedBlockById(
  root: HTMLElement,

  blockId: string,
): HTMLElement | null {
  const outerBlocks = Array.from(
    root.querySelectorAll<HTMLElement>(
      '[data-node-type="blockOuter"][data-id]',
    ),
  );

  const outer = outerBlocks.find(
    (element) => element.getAttribute("data-id") === blockId,
  );

  if (outer) {
    return outer;
  }

  const containers = Array.from(
    root.querySelectorAll<HTMLElement>(
      '[data-node-type="blockContainer"][data-id]',
    ),
  );

  return (
    containers.find((element) => element.getAttribute("data-id") === blockId) ??
    null
  );
}

function findExistingMount(
  root: HTMLElement,

  targetId: string,
): HTMLElement | null {
  return (
    Array.from(root.querySelectorAll<HTMLElement>(`[${MOUNT_ATTRIBUTE}]`)).find(
      (element) => element.getAttribute(MOUNT_ATTRIBUTE) === targetId,
    ) ?? null
  );
}

function removeExistingMounts(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>(`[${MOUNT_ATTRIBUTE}]`)
    .forEach((element) => {
      element.remove();
    });
}

export default function InlineCodePlaygrounds({
  content,
  rootRef,
}: InlineCodePlaygroundsProps) {
  const targets = useMemo(
    () => extractPlaygroundTargets(content),

    [content],
  );

  const [mountPoints, setMountPoints] = useState<MountPoint[]>([]);

  const [activeTarget, setActiveTarget] = useState<PlaygroundTarget | null>(
    null,
  );

  useEffect(() => {
    const currentRoot = rootRef.current;

    if (!currentRoot) {
      return;
    }

    const articleRoot: HTMLElement = currentRoot;

    removeExistingMounts(articleRoot);

    setMountPoints([]);

    if (targets.length === 0) {
      return;
    }

    let disposed = false;

    let observer: MutationObserver | null = null;

    let animationFrame: number | null = null;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function installButtons(): boolean {
      if (disposed) {
        return false;
      }

      const fallbackCodeBlocks = getRenderedCodeBlocks(articleRoot);

      const nextMountPoints: MountPoint[] = [];

      targets.forEach((target) => {
        let codeBlock = findRenderedBlockById(
          articleRoot,
          target.anchorBlockId,
        );

        if (!codeBlock) {
          codeBlock = fallbackCodeBlocks[target.anchorCodeBlockIndex] ?? null;
        }

        if (!codeBlock) {
          return;
        }

        let mount = findExistingMount(articleRoot, target.id);

        if (!mount) {
          mount = document.createElement("div");

          mount.setAttribute(MOUNT_ATTRIBUTE, target.id);

          mount.className = "tech-path-inline-playground-mount";

          codeBlock.insertAdjacentElement("afterend", mount);
        }

        nextMountPoints.push({
          target,

          element: mount,
        });
      });

      if (nextMountPoints.length > 0 && !disposed) {
        setMountPoints(nextMountPoints);
      }

      return nextMountPoints.length === targets.length;
    }

    function attemptInstall() {
      const complete = installButtons();

      if (complete) {
        observer?.disconnect();

        observer = null;
      }
    }

    animationFrame = window.requestAnimationFrame(attemptInstall);

    observer = new MutationObserver(attemptInstall);

    observer.observe(articleRoot, {
      childList: true,

      subtree: true,
    });

    timeoutId = setTimeout(
      () => {
        attemptInstall();

        observer?.disconnect();

        observer = null;
      },

      2500,
    );

    return () => {
      disposed = true;

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      observer?.disconnect();

      removeExistingMounts(articleRoot);
    };
  }, [rootRef, targets]);

  function openFullPlayground(target: PlaygroundTarget) {
    if (target.kind !== "web") {
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

  if (targets.length === 0 && !activeTarget) {
    return null;
  }

  return (
    <>
      {mountPoints.map(({ target, element }) =>
        createPortal(
          <div
            className="
                mb-5
                mt-2
                flex
                justify-end
                gap-2
                px-1
              "
          >
            <button
              type="button"
              onClick={() => setActiveTarget(target)}
              aria-label={`Try ${target.label} code`}
              className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-[#5A1C4B]/20
                  bg-[#5A1C4B]
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:opacity-95
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#409FB6]
                  focus:ring-offset-2
                "
            >
              <Play size={16} />
              Try {target.label}
            </button>

            {target.kind === "web" && (
              <button
                type="button"
                onClick={() => openFullPlayground(target)}
                aria-label="Open in full Tech Path Playground"
                title="Open in full playground"
                className="
                    inline-flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    text-slate-700
                    shadow-sm
                    transition
                    hover:-translate-y-0.5
                    hover:bg-slate-100
                    dark:border-slate-700
                    dark:bg-slate-900
                    dark:text-slate-200
                    dark:hover:bg-slate-800
                  "
              >
                <ExternalLink size={16} />
              </button>
            )}
          </div>,

          element,

          target.id,
        ),
      )}

      <PlaygroundModal
        open={Boolean(activeTarget)}
        target={activeTarget}
        onClose={() => setActiveTarget(null)}
      />
    </>
  );
}
