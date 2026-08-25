"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Code2, Play, RotateCcw, Trash2 } from "lucide-react";

import type {
  WebFileKey,
  WebPlaygroundExample,
  WebPlaygroundFiles,
} from "@/lib/playground/types";

interface LocalWebPlaygroundProps {
  example: WebPlaygroundExample;

  fullPage?: boolean;
}

type ConsoleLevel = "log" | "warn" | "error";

interface ConsoleEntry {
  id: number;

  level: ConsoleLevel;

  text: string;
}

const FILE_LABELS: Record<WebFileKey, string> = {
  html: "HTML",

  css: "CSS",

  javascript: "JavaScript",
};

const FILE_ORDER: WebFileKey[] = ["html", "css", "javascript"];

/*
 * =========================================================
 * CONSOLE BRIDGE
 * =========================================================
 */

function createRuntimeBridge(channelId: string) {
  const safeChannel = JSON.stringify(channelId);

  return `<script>
(function () {
  const channel =
    ${safeChannel};

  function serialize(value) {
    if (typeof value === "string") {
      return value;
    }

    if (value instanceof Error) {
      return value.stack || value.message;
    }

    try {
      return JSON.stringify(
        value,
        null,
        2
      );
    } catch {
      return String(value);
    }
  }

  function send(level, values) {
    window.parent.postMessage(
      {
        source:
          "tech-path-playground",

        channel,

        level,

        values:
          values.map(serialize)
      },
      "*"
    );
  }

  ["log", "warn", "error"].forEach(
    function (level) {
      const original =
        console[level].bind(console);

      console[level] =
        function () {
          const values =
            Array.from(arguments);

          send(
            level,
            values
          );

          original.apply(
            console,
            values
          );
        };
    }
  );

  window.addEventListener(
    "error",
    function (event) {
      send(
        "error",
        [
          event.message ||
          "Unknown runtime error"
        ]
      );
    }
  );

  window.addEventListener(
    "unhandledrejection",
    function (event) {
      send(
        "error",
        [
          event.reason ||
          "Unhandled promise rejection"
        ]
      );
    }
  );
})();
<\/script>`;
}

/*
 * =========================================================
 * HTML DOCUMENT BUILDING
 * =========================================================
 */

function ensureHtmlDocument(html: string) {
  const trimmed = html.trim();

  if (/<html[\s>]/i.test(trimmed)) {
    return trimmed;
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>
      Tech Path Playground
    </title>
  </head>

  <body>
${trimmed}
  </body>
</html>`;
}

function injectCss(
  html: string,

  css: string,
) {
  const styleTag = `<style id="tech-path-playground-style">
${css}
</style>`;

  if (/<\/head>/i.test(html)) {
    return html.replace(
      /<\/head>/i,

      `${styleTag}
</head>`,
    );
  }

  return `${styleTag}
${html}`;
}

function injectBridge(
  html: string,

  bridge: string,
) {
  if (/<body([^>]*)>/i.test(html)) {
    return html.replace(
      /<body([^>]*)>/i,

      (match) =>
        `${match}
${bridge}`,
    );
  }

  return `${bridge}
${html}`;
}

function injectJavascript(
  html: string,

  javascript: string,
) {
  const safeJavascript = javascript.replace(/<\/script/gi, "<\\/script");

  const scriptTag = `<script>
${safeJavascript}
<\/script>`;

  if (/<\/body>/i.test(html)) {
    return html.replace(
      /<\/body>/i,

      `${scriptTag}
</body>`,
    );
  }

  return `${html}
${scriptTag}`;
}

function buildDocument(
  files: WebPlaygroundFiles,

  channelId: string,
) {
  const bridge = createRuntimeBridge(channelId);

  let documentSource = ensureHtmlDocument(files.html);

  documentSource = injectCss(documentSource, files.css);

  documentSource = injectBridge(documentSource, bridge);

  documentSource = injectJavascript(documentSource, files.javascript);

  return documentSource;
}

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function LocalWebPlayground({
  example,
  fullPage = false,
}: LocalWebPlaygroundProps) {
  const rawId = useId();

  const channelId = rawId.replace(/:/g, "");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [activeFile, setActiveFile] = useState<WebFileKey>(
    example.primaryLanguage,
  );

  const [files, setFiles] = useState<WebPlaygroundFiles>({
    ...example.files,
  });

  const [executedFiles, setExecutedFiles] = useState<WebPlaygroundFiles>({
    ...example.files,
  });

  const [runVersion, setRunVersion] = useState(0);

  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);

  const nextConsoleId = useRef(0);

  useEffect(() => {
    setFiles({
      ...example.files,
    });

    setExecutedFiles({
      ...example.files,
    });

    setActiveFile(example.primaryLanguage);

    setConsoleEntries([]);

    setRunVersion((current) => current + 1);
  }, [example.id, example.files, example.primaryLanguage]);

  const documentSource = useMemo(
    () => buildDocument(executedFiles, channelId),

    [executedFiles, channelId],
  );

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const data = event.data;

      if (
        !data ||
        data.source !== "tech-path-playground" ||
        data.channel !== channelId
      ) {
        return;
      }

      const level: ConsoleLevel =
        data.level === "warn"
          ? "warn"
          : data.level === "error"
            ? "error"
            : "log";

      const values: unknown[] = Array.isArray(data.values) ? data.values : [];

      const text = values.map((value: unknown) => String(value)).join(" ");

      nextConsoleId.current += 1;

      setConsoleEntries((current) => [
        ...current,

        {
          id: nextConsoleId.current,

          level,

          text,
        },
      ]);
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [channelId]);

  function updateFile(
    key: WebFileKey,

    value: string,
  ) {
    setFiles((current) => ({
      ...current,

      [key]: value,
    }));
  }

  function runCode() {
    setConsoleEntries([]);

    setExecutedFiles({
      ...files,
    });

    setRunVersion((current) => current + 1);
  }

  function resetCode() {
    setFiles({
      ...example.files,
    });

    setExecutedFiles({
      ...example.files,
    });

    setConsoleEntries([]);

    setRunVersion((current) => current + 1);
  }

  function getFileStatus(key: WebFileKey) {
    if (example.fromArticle[key]) {
      return "From article";
    }

    if (files[key].trim()) {
      return "Supporting";
    }

    return "Empty";
  }

  return (
    <section
      className="
        overflow-hidden
        rounded-xl
        border
        border-slate-700
        bg-[#0f1115]
      "
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
          border-b
          border-slate-700
          px-4
          py-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <Code2
            size={20}
            className="
              text-[#75c9da]
            "
          />

          <div>
            <p
              className="
                font-semibold
                text-white
              "
            >
              Web Playground
            </p>

            <p
              className="
                text-xs
                text-slate-400
              "
            >
              HTML + CSS + JavaScript from this article
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
          <button
            type="button"
            onClick={resetCode}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-slate-600
              px-3
              py-2
              text-sm
              font-medium
              text-slate-200
              transition
              hover:bg-slate-800
            "
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            type="button"
            onClick={runCode}
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-[#5A1C4B]
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:opacity-90
            "
          >
            <Play size={16} />
            Run
          </button>
        </div>
      </div>

      <div
        className="
          flex
          flex-wrap
          border-b
          border-slate-700
          bg-[#090b0f]
        "
      >
        {FILE_ORDER.map((key) => {
          const active = activeFile === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveFile(key)}
              className={`
                  border-r
                  border-slate-700
                  px-4
                  py-3
                  text-left
                  text-sm
                  transition

                  ${
                    active
                      ? "bg-[#111317] text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }
                `}
            >
              <span
                className="
                    block
                    font-semibold
                  "
              >
                {FILE_LABELS[key]}
              </span>

              <span
                className="
                    mt-0.5
                    block
                    text-[10px]
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
              >
                {getFileStatus(key)}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
        "
      >
        <div
          className="
            border-b
            border-slate-700
            lg:border-b-0
            lg:border-r
          "
        >
          <div
            className="
              border-b
              border-slate-700
              bg-[#111317]
              px-4
              py-2
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            {FILE_LABELS[activeFile]}
          </div>

          <textarea
            value={files[activeFile]}
            onChange={(event) => updateFile(activeFile, event.target.value)}
            spellCheck={false}
            aria-label={`${FILE_LABELS[activeFile]} code editor`}
            className={`
              w-full
              resize-none
              bg-[#111317]
              p-5
              font-mono
              text-sm
              leading-6
              text-slate-100
              outline-none

              ${fullPage ? "min-h-[520px]" : "min-h-[390px]"}
            `}
          />
        </div>

        <div
          className="
            flex
            min-h-[430px]
            flex-col
            bg-white
          "
        >
          <div
            className="
              border-b
              border-slate-200
              bg-slate-50
              px-4
              py-2
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Preview
          </div>

          <iframe
            key={runVersion}
            ref={iframeRef}
            title="Tech Path Web Playground Preview"
            srcDoc={documentSource}
            /*
             * Never add allow-same-origin.
             *
             * Article code must stay isolated
             * from the Tech Path application.
             */
            sandbox="allow-scripts"
            className={`
              w-full
              flex-1
              bg-white

              ${fullPage ? "min-h-[520px]" : "min-h-[390px]"}
            `}
          />
        </div>
      </div>

      <div
        className="
          border-t
          border-slate-700
          bg-[#090b0f]
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-800
            px-4
            py-2
          "
        >
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            Console
          </p>

          <button
            type="button"
            onClick={() => setConsoleEntries([])}
            className="
              inline-flex
              items-center
              gap-1
              text-xs
              text-slate-400
              transition
              hover:text-white
            "
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>

        <div
          className="
            max-h-48
            min-h-20
            overflow-y-auto
            px-4
            py-3
            font-mono
            text-sm
          "
        >
          {consoleEntries.length === 0 ? (
            <p
              className="
                text-slate-500
              "
            >
              No console output yet.
            </p>
          ) : (
            consoleEntries.map((entry) => (
              <div
                key={entry.id}
                className={
                  entry.level === "error"
                    ? "mb-2 whitespace-pre-wrap text-red-400"
                    : entry.level === "warn"
                      ? "mb-2 whitespace-pre-wrap text-amber-300"
                      : "mb-2 whitespace-pre-wrap text-slate-200"
                }
              >
                {entry.text}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
