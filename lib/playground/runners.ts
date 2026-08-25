import type {
    BrowserRunner,
    SandpackConfig,
} from "@/lib/playground/types";


export const browserRunners:
    readonly BrowserRunner[] = [
        {
            language:
                "html",

            label:
                "HTML",

            aliases: [
                "html",
                "htm",
                "markup",
            ],

            engine:
                "local-web",

            template:
                "vanilla",

            kind:
                "html",
        },

        {
            language:
                "css",

            label:
                "CSS",

            aliases: [
                "css",
            ],

            engine:
                "local-web",

            template:
                "vanilla",

            kind:
                "css",
        },

        {
            language:
                "javascript",

            label:
                "JavaScript",

            aliases: [
                "javascript",
                "js",
                "ecmascript",
            ],

            engine:
                "local-web",

            template:
                "vanilla",

            kind:
                "javascript",
        },

        {
            language:
                "typescript",

            label:
                "TypeScript",

            aliases: [
                "typescript",
                "ts",
            ],

            engine:
                "sandpack",

            template:
                "vanilla-ts",

            kind:
                "typescript",
        },

        {
            language:
                "jsx",

            label:
                "React / JSX",

            aliases: [
                "jsx",
                "react",
                "reactjs",
            ],

            engine:
                "sandpack",

            template:
                "react",

            kind:
                "react",
        },

        {
            language:
                "tsx",

            label:
                "React / TypeScript",

            aliases: [
                "tsx",
                "react-ts",
                "react-typescript",
            ],

            engine:
                "sandpack",

            template:
                "react-ts",

            kind:
                "react-typescript",
        },
    ];


const runnerAliases =
    new Map<
        string,
        BrowserRunner
    >();


browserRunners.forEach(
    (runner) => {
        runner.aliases.forEach(
            (alias) => {
                runnerAliases.set(
                    alias
                        .trim()
                        .toLowerCase(),

                    runner,
                );
            },
        );
    },
);


export function getBrowserRunner(
    language:
        unknown,
): BrowserRunner | null {
    if (
        typeof language !==
        "string"
    ) {
        return null;
    }


    const normalized =
        language
            .trim()
            .toLowerCase();


    if (!normalized) {
        return null;
    }


    return (
        runnerAliases.get(
            normalized,
        ) ??
        null
    );
}


export function createSandpackConfig(
    runner:
        BrowserRunner,

    code:
        string,
): SandpackConfig {
    switch (
    runner.kind
    ) {
        case "typescript":
            return {
                template:
                    "vanilla-ts",

                files: {
                    "/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>
      Tech Path TypeScript Playground
    </title>
  </head>

  <body>
    <main id="app"></main>

    <script
      type="module"
      src="/index.ts"
    ></script>
  </body>
</html>`,

                    "/index.ts":
                        code,
                },
            };


        case "react":
            return {
                template:
                    "react",

                files: {
                    "/App.js":
                        code,
                },
            };


        case "react-typescript":
            return {
                template:
                    "react-ts",

                files: {
                    "/App.tsx":
                        code,
                },
            };


        default:
            return {
                template:
                    "vanilla",

                files: {
                    "/index.js":
                        code,
                },
            };
    }
}