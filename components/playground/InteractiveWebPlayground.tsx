"use client";

import dynamic from "next/dynamic";

import LocalWebPlayground from "@/components/playground/LocalWebPlayground";

import type {
  BrowserRunner,
  WebFileKey,
  WebPlaygroundExample,
} from "@/lib/playground/types";

interface InteractiveWebPlaygroundProps {
  runner?: BrowserRunner | null;

  code?: string | null;
}

const SandpackWebPlayground = dynamic(
  () => import("@/components/playground/SandpackWebPlayground"),

  {
    ssr: false,

    loading: () => (
      <div
        className="
            rounded-xl
            border
            border-slate-700
            bg-slate-950
            p-8
            text-center
            text-sm
            text-slate-400
          "
      >
        Starting the Tech Path framework playground...
      </div>
    ),
  },
);

function createSingleWebExample(
  runner: BrowserRunner,

  code: string,
): WebPlaygroundExample {
  let primaryLanguage: WebFileKey = "javascript";

  if (runner.kind === "html") {
    primaryLanguage = "html";
  }

  if (runner.kind === "css") {
    primaryLanguage = "css";
  }

  const files = {
    html:
      primaryLanguage === "html"
        ? code
        : `<main class="tech-path-demo">
  <h1>Tech Path Playground</h1>
  <div class="card">
    Example card
  </div>
  <button class="button">
    Example button
  </button>
</main>`,

    css: primaryLanguage === "css" ? code : "",

    javascript: primaryLanguage === "javascript" ? code : "",
  };

  return {
    kind: "web",

    id: "single-web-example",

    groupId: "single-web-example",

    label: runner.label,

    primaryLanguage,

    anchorBlockId: "single-web-example",

    anchorCodeBlockIndex: 0,

    sourceBlockIds: ["single-web-example"],

    files,

    fromArticle: {
      html: primaryLanguage === "html",

      css: primaryLanguage === "css",

      javascript: primaryLanguage === "javascript",
    },
  };
}

export default function InteractiveWebPlayground({
  runner,
  code,
}: InteractiveWebPlaygroundProps) {
  if (!runner || typeof code !== "string" || !code.trim()) {
    return (
      <div
        className="
          rounded-xl
          border
          border-amber-200
          bg-amber-50
          p-4
          text-sm
          text-amber-800
          dark:border-amber-900
          dark:bg-amber-950/30
          dark:text-amber-300
        "
      >
        This code example cannot be opened in the Tech Path playground.
      </div>
    );
  }

  if (runner.engine === "local-web") {
    return (
      <LocalWebPlayground example={createSingleWebExample(runner, code)} />
    );
  }

  return <SandpackWebPlayground runner={runner} code={code} />;
}
