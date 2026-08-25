"use client";

import { Sandpack } from "@codesandbox/sandpack-react";

import { useTheme } from "next-themes";

import { createSandpackConfig } from "@/lib/playground/runners";

import type { BrowserRunner } from "@/lib/playground/types";

interface SandpackWebPlaygroundProps {
  runner: BrowserRunner;

  code: string;
}

export default function SandpackWebPlayground({
  runner,
  code,
}: SandpackWebPlaygroundProps) {
  const { resolvedTheme } = useTheme();

  const config = createSandpackConfig(runner, code);

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        dark:border-slate-700
      "
    >
      <Sandpack
        template={config.template}
        files={config.files}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        options={{
          bundlerURL: "https://sandpack-bundler.codesandbox.io",

          showTabs: true,

          showLineNumbers: true,

          showConsole: true,

          showConsoleButton: true,

          editorHeight: 430,
        }}
      />
    </div>
  );
}
