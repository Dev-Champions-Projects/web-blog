"use client";

import { useEffect, useState } from "react";

import { Code2 } from "lucide-react";

import LocalWebPlayground from "@/components/playground/LocalWebPlayground";

import { loadWebPlaygroundDraft } from "@/lib/playground/drafts";

import type { WebPlaygroundExample } from "@/lib/playground/types";

const DEFAULT_EXAMPLE: WebPlaygroundExample = {
  kind: "web",

  id: "blank-tech-path-playground",

  groupId: "blank-tech-path-playground",

  label: "Web",

  primaryLanguage: "html",

  anchorBlockId: "blank-tech-path-playground",

  anchorCodeBlockIndex: 0,

  sourceBlockIds: [],

  files: {
    html: `<main class="card">
  <h1>
    Tech Path Playground
  </h1>

  <p>
    Edit the HTML, CSS and JavaScript,
    then click Run.
  </p>

  <button id="demoButton">
    Click me
  </button>
</main>`,

    css: `.card {
  max-width: 520px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-family: Arial, sans-serif;
}

button {
  padding: 10px 16px;
  cursor: pointer;
}`,

    javascript: `const button =
  document.querySelector(
    "#demoButton"
  );

if (button) {
  button.addEventListener(
    "click",
    function () {
      button.textContent =
        "It works!";
    }
  );
}`,
  },

  fromArticle: {
    html: false,

    css: false,

    javascript: false,
  },
};

export default function FullPlaygroundClient() {
  const [example, setExample] = useState<WebPlaygroundExample | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const draftId = params.get("draft");

    if (!draftId) {
      setExample(DEFAULT_EXAMPLE);

      return;
    }

    const loaded = loadWebPlaygroundDraft(draftId);

    setExample(loaded ?? DEFAULT_EXAMPLE);
  }, []);

  if (!example) {
    return (
      <div
        className="
          flex
          min-h-[70vh]
          items-center
          justify-center
          text-slate-500
        "
      >
        Loading playground...
      </div>
    );
  }

  return (
    <main
      className="
        mx-auto
        w-full
        max-w-[1600px]
        px-3
        py-6
        sm:px-6
        lg:px-8
      "
    >
      <header
        className="
          mb-6
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-[#409FB6]/15
            text-[#409FB6]
          "
        >
          <Code2 size={24} />
        </div>

        <div>
          <p
            className="
              text-sm
              font-semibold
              uppercase
              tracking-wide
              text-[#409FB6]
            "
          >
            Tech Path
          </p>

          <h1
            className="
              text-2xl
              font-bold
              md:text-3xl
            "
          >
            Web Playground
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Explore HTML, CSS and JavaScript without modifying the original
            article.
          </p>
        </div>
      </header>

      <LocalWebPlayground example={example} fullPage />
    </main>
  );
}
