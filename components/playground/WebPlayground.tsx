"use client";

import { Sandpack } from "@codesandbox/sandpack-react";

import { useTheme } from "next-themes";

export default function WebPlayground() {
  const { resolvedTheme } = useTheme();

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        dark:border-slate-700
        dark:bg-slate-950
      "
    >
      <div
        className="
          border-b
          border-slate-200
          px-5
          py-4
          dark:border-slate-700
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
          "
        >
          <div>
            <h2
              className="
                text-lg
                font-bold
                text-slate-950
                dark:text-white
              "
            >
              Try It Yourself
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              Edit the code and see the result instantly.
            </p>
          </div>

          <span
            className="
              rounded-full
              bg-[#5A1C4B]/10
              px-3
              py-1
              text-xs
              font-semibold
              text-[#5A1C4B]
              dark:bg-[#409FB6]/15
              dark:text-[#75c9da]
            "
          >
            Tech Path Playground
          </span>
        </div>
      </div>

      <Sandpack
        template="vanilla"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        files={{
          "/index.html": `<!doctype html>
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

    <link
      rel="stylesheet"
      href="/styles.css"
    />
  </head>

  <body>
    <main id="app"></main>

    <script
      type="module"
      src="/index.js"
    ></script>
  </body>
</html>`,

          "/styles.css": `body {
  font-family:
    Arial,
    sans-serif;

  margin: 0;

  padding: 2rem;

  background:
    #fafafa;
}

h1 {
  color:
    #5A1C4B;
}

p {
  color:
    #334155;

  line-height:
    1.6;
}

button {
  border:
    0;

  border-radius:
    8px;

  padding:
    10px 16px;

  background:
    #5A1C4B;

  color:
    white;

  cursor:
    pointer;
}

button:hover {
  opacity:
    0.9;
}`,

          "/index.js": `const app =
  document.querySelector(
    "#app"
  );


if (app) {
  app.innerHTML = \`
    <h1>
      Hello Tech Path!
    </h1>

    <p>
      Change this code and
      watch the preview update.
    </p>

    <button
      id="helloButton"
    >
      Click me
    </button>
  \`;
}


const helloButton =
  document.querySelector(
    "#helloButton"
  );


if (helloButton) {
  helloButton.addEventListener(
    "click",

    function () {
      console.log(
        "Hello from Tech Path!"
      );

      helloButton.textContent =
        "It works!";
    }
  );
}`,
        }}
        options={{
          bundlerURL: "https://sandpack-bundler.codesandbox.io",

          showTabs: true,

          showLineNumbers: true,

          showConsole: true,

          showConsoleButton: true,

          editorHeight: 420,
        }}
      />
    </section>
  );
}
