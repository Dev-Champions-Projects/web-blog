"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { RefObject } from "react";

interface ArticleCodeCopyButtonsProps {
  rootRef: RefObject<HTMLDivElement | null>;
}

interface CopyMountPoint {
  id: string;
  element: HTMLElement;
  codeBlock: HTMLElement;
}

const COPY_MOUNT_ATTRIBUTE = "data-tech-path-code-copy-mount";
const CODE_BLOCK_HOST_CLASS = "tech-path-code-block-host";

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

  /*
   * Fallback for older or differently-rendered
   * BlockNote content.
   */
  return Array.from(root.querySelectorAll<HTMLElement>("pre")).map(
    (node) =>
      node.closest<HTMLElement>('[data-node-type="blockOuter"]') ??
      node.closest<HTMLElement>('[data-node-type="blockContainer"]') ??
      node,
  );
}

function getCodeText(codeBlock: HTMLElement): string {
  /*
   * Prefer the actual code element so UI labels,
   * language selectors and copy controls are not
   * accidentally included in the copied text.
   */
  const codeElement =
    codeBlock.querySelector<HTMLElement>("pre code") ??
    codeBlock.querySelector<HTMLElement>("pre") ??
    codeBlock.querySelector<HTMLElement>(
      '[data-content-type="codeBlock"] code',
    ) ??
    codeBlock.querySelector<HTMLElement>('[data-content-type="codeBlock"]');

  return codeElement?.innerText ?? codeElement?.textContent ?? "";
}

function removeExistingCopyMounts(root: HTMLElement) {
  root
    .querySelectorAll<HTMLElement>(`[${COPY_MOUNT_ATTRIBUTE}]`)
    .forEach((element) => {
      element.remove();
    });

  root
    .querySelectorAll<HTMLElement>(`.${CODE_BLOCK_HOST_CLASS}`)
    .forEach((element) => {
      element.classList.remove(CODE_BLOCK_HOST_CLASS);
    });
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);

    return;
  }

  /*
   * Small fallback for browsers where the
   * Clipboard API is unavailable.
   */
  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);

  textarea.select();

  const copied = document.execCommand("copy");

  textarea.remove();

  if (!copied) {
    throw new Error("Unable to copy code.");
  }
}

export default function ArticleCodeCopyButtons({
  rootRef,
}: ArticleCodeCopyButtonsProps) {
  const [mountPoints, setMountPoints] = useState<CopyMountPoint[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentRoot = rootRef.current;

    if (!currentRoot) {
      return;
    }

    const articleRoot: HTMLElement = currentRoot;

    removeExistingCopyMounts(articleRoot);
    setMountPoints([]);

    let disposed = false;
    let observer: MutationObserver | null = null;
    let animationFrame: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function installCopyButtons(): boolean {
      if (disposed) {
        return false;
      }

      const codeBlocks = getRenderedCodeBlocks(articleRoot);

      if (codeBlocks.length === 0) {
        return false;
      }

      const nextMountPoints: CopyMountPoint[] = [];

      codeBlocks.forEach((codeBlock, index) => {
        const blockId =
          codeBlock.getAttribute("data-id") ?? `article-code-${index}`;

        let mount = codeBlock.querySelector<HTMLElement>(
          `[${COPY_MOUNT_ATTRIBUTE}="${blockId}"]`,
        );

        codeBlock.classList.add(CODE_BLOCK_HOST_CLASS);

        if (!mount) {
          mount = document.createElement("div");

          mount.setAttribute(COPY_MOUNT_ATTRIBUTE, blockId);
          mount.className = "tech-path-code-copy-mount";

          codeBlock.appendChild(mount);
        }

        nextMountPoints.push({
          id: blockId,
          element: mount,
          codeBlock,
        });
      });

      if (!disposed) {
        setMountPoints(nextMountPoints);
      }

      return true;
    }

    function attemptInstall() {
      const installed = installCopyButtons();

      if (installed) {
        observer?.disconnect();
        observer = null;
      }
    }

    /*
     * BlockNote is dynamically rendered on the client,
     * so try once on the next frame and observe briefly
     * in case its DOM has not mounted yet.
     */
    animationFrame = window.requestAnimationFrame(attemptInstall);

    observer = new MutationObserver(attemptInstall);

    observer.observe(articleRoot, {
      childList: true,
      subtree: true,
    });

    timeoutId = setTimeout(() => {
      attemptInstall();

      observer?.disconnect();
      observer = null;
    }, 2500);

    return () => {
      disposed = true;

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      observer?.disconnect();

      removeExistingCopyMounts(articleRoot);
    };
  }, [rootRef]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  async function handleCopy(id: string, codeBlock: HTMLElement) {
    const code = getCodeText(codeBlock);

    if (!code.trim()) {
      return;
    }

    try {
      await copyText(code);

      setCopiedId(id);

      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }

      copiedTimerRef.current = setTimeout(() => {
        setCopiedId(null);
      }, 1800);
    } catch (error) {
      console.error("Unable to copy article code:", error);
    }
  }

  return (
    <>
      {mountPoints.map(({ id, element, codeBlock }) =>
        createPortal(
          <button
            type="button"
            onClick={() => void handleCopy(id, codeBlock)}
            aria-label={copiedId === id ? "Code copied" : "Copy code"}
            title={copiedId === id ? "Copied" : "Copy code"}
            className="
    group
    inline-flex
    h-8
    items-center
    gap-0
    overflow-hidden
    rounded-lg
    border
    border-white/15
    bg-slate-950/85
    px-2
    text-xs
    font-semibold
    text-slate-100
    shadow-md
    backdrop-blur
    transition-all
    duration-200
    hover:gap-1.5
    hover:border-[#409FB6]/70
    hover:bg-[#5A1C4B]
    focus:outline-none
    focus:ring-2
    focus:ring-[#409FB6]
    focus:ring-offset-1
    focus-visible:gap-1.5
  "
          >
            {copiedId === id ? (
              <>
                <Check size={14} className="shrink-0" />

                <span className="whitespace-nowrap">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} className="shrink-0" />

                <span
                  className="
          max-w-0
          overflow-hidden
          whitespace-nowrap
          opacity-0
          transition-all
          duration-200
          group-hover:max-w-[3rem]
          group-hover:opacity-100
          group-focus-visible:max-w-[3rem]
          group-focus-visible:opacity-100
        "
                >
                  Copy
                </span>
              </>
            )}
          </button>,
          element,
          id,
        ),
      )}
    </>
  );
}
