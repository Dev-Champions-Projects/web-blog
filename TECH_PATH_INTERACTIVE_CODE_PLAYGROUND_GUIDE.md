# Tech Path Interactive Code Playground Integration Guide

**Project:** Dev Champions — Tech Path  
**Repository:** `Dev-Champions-Projects/web-blog`  
**Target stack:** Next.js 15.1.4, React 19, BlockNote 0.23.5, TypeScript, Tailwind CSS  
**Goal:** Add a second BlockNote content type called **Interactive Code Playground** so authors can publish runnable examples that readers can edit and execute directly inside Tech Path articles.

---

## 1. What We Are Building

Your existing BlockNote **Code Block** should remain. It is for readable code examples.

We will add a separate block:

```text
Interactive Code Playground
├── stores the author's starter code in the existing BlockNote JSON
├── lets readers edit the code locally
├── runs browser code inside Sandpack
├── shows preview/console output
└── never overwrites the article when a reader experiments
```

### Version 1 languages

Use **Sandpack** for:

- HTML
- CSS
- JavaScript

After that is stable, extend it to:

- TypeScript
- React
- React + TypeScript

A later, separate feature should add Python, Java, C, C++, Go, Rust, PHP, etc. through **Judge0**.

---

## 2. Target Architecture

```text
                         TECH PATH ARTICLE
                                │
                                ▼
                        BlockNote document
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
          Standard blocks              codePlayground block
 paragraphs/headings/images/code                │
                                                  ▼
                                            Sandpack
                                      HTML / CSS / JavaScript
                                                  │
                              ┌───────────────────┴───────────────────┐
                              ▼                                       ▼
                         Editable code                          Preview/console
```

Later:

```text
codePlayground
      │
      ├── Web languages ──> Sandpack
      │
      └── Other languages ──> /api/code/run ──> Judge0
```

### Critical security rule

Never execute public visitor code directly on the Tech Path/Render server with:

```ts
child_process.exec(...)
exec(...)
spawn("python", ...)
spawn("java", ...)
```

Server-side arbitrary code execution is outside the scope of version 1.

---

# 3. Production Safety Gate

Do not begin this feature until Tech Path production is stable again.

A Render rollback changes the live deployment, but it does **not** repair GitHub `main`.

Before starting, verify:

- `/blog/feed/1` works.
- Login works.
- Register works.
- Existing articles work.
- GitHub `main` contains the version you actually want to develop from.
- Local `main` matches `origin/main`.
- Working tree is clean.

For the current August 14 incident, the known-good commit immediately before the unstable merge was:

```text
20758020b6d7f002f59f402e9245dcbb4dda05da
```

Do **not** rewrite a shared `main` with `git reset --hard`. Complete the rollback/revert workflow first.

Then verify:

```powershell
git switch main
git pull --ff-only origin main
git status
git log --oneline --decorate -5
```

Expected:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

# 4. Create a Dedicated Feature Branch

```powershell
git switch main
git pull --ff-only origin main
git status
git switch -c feat/interactive-code-block
git branch --show-current
```

Expected:

```text
feat/interactive-code-block
```

Never build this feature directly on `main`.

---

# 5. Install Sandpack

Install the exact version:

```powershell
npm install @codesandbox/sandpack-react@2.20.0 --save-exact
```

Do **not** use:

```text
--legacy-peer-deps
```

Verify:

```powershell
npm ls @codesandbox/sandpack-react react react-dom
```

You should see the project using roughly:

```text
@codesandbox/sandpack-react@2.20.0
react@19.0.0
react-dom@19.0.0
```

Check:

```powershell
git status
```

The dependency install should mainly change:

```text
package.json
package-lock.json
```

---

# 6. Phase A — Prove Sandpack Works Before Touching BlockNote

Create:

```text
components/playground/WebPlayground.tsx
```

Use:

```tsx
"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";

export default function WebPlayground() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <p className="font-semibold">💻 Try It Yourself</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Edit the code and see the result.
        </p>
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
    <title>Tech Path Playground</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="/index.js"></script>
  </body>
</html>`,

          "/styles.css": `body {
  font-family: Arial, sans-serif;
  padding: 2rem;
}

h1 {
  color: #5A1C4B;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}`,

          "/index.js": `import "./styles.css";

document.querySelector("#app").innerHTML = \`
  <h1>Hello Tech Path!</h1>
  <p>Edit this example and see what happens.</p>
  <button id="helloButton">Click me</button>
\`;

document
  .querySelector("#helloButton")
  ?.addEventListener("click", () => {
    console.log("Hello from Tech Path!");
  });`,
        }}
        options={{
          showTabs: true,
          showLineNumbers: true,
          showConsole: true,
          showConsoleButton: true,
        }}
      />
    </div>
  );
}
```

---

# 7. Create a Temporary Test Page

Create:

```text
app/playground/page.tsx
```

Use:

```tsx
import WebPlayground from "@/components/playground/WebPlayground";

export default function PlaygroundPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Tech Path Code Playground
        </h1>

        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Experimental interactive coding environment.
        </p>
      </div>

      <WebPlayground />
    </main>
  );
}
```

Run:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000/playground
```

Test:

- Code tabs appear.
- HTML/JS/CSS are editable.
- Preview updates.
- Console works.
- Light theme works.
- Dark theme works.
- Refresh resets reader edits.
- No fatal browser-console errors.

Stop:

```text
Ctrl + C
```

Then:

```powershell
npm run build
```

Do not touch BlockNote until this stage works.

---

# 8. Create the Reusable Runtime Component

Create:

```text
components/playground/InteractiveWebPlayground.tsx
```

Use:

```tsx
"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";

interface InteractiveWebPlaygroundProps {
  title?: string;
  html: string;
  css: string;
  javascript: string;
  showConsole?: boolean;
}

export default function InteractiveWebPlayground({
  title = "Try It Yourself",
  html,
  css,
  javascript,
  showConsole = true,
}: InteractiveWebPlaygroundProps) {
  const { resolvedTheme } = useTheme();

  return (
    <section
      className="my-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
      contentEditable={false}
    >
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <p className="font-semibold">💻 {title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Edit the code and see the result.
        </p>
      </div>

      <Sandpack
        template="vanilla"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        files={{
          "/index.html": html,
          "/styles.css": css,
          "/index.js": javascript,
        }}
        options={{
          showTabs: true,
          showLineNumbers: true,
          showConsole,
          showConsoleButton: showConsole,
        }}
      />
    </section>
  );
}
```

---

# 9. How Persistence Must Work

There are two different editing modes.

## Author edits

The author's starter code must be saved inside the BlockNote document JSON.

Conceptually:

```json
{
  "type": "codePlayground",
  "props": {
    "title": "Try It Yourself",
    "html": "<h1>Hello</h1>",
    "css": "h1 { color: purple; }",
    "javascript": "console.log('Hello');",
    "showConsole": true
  }
}
```

## Reader edits

Reader experiments stay only inside Sandpack.

They must:

```text
NOT save to Prisma
NOT modify the blog
NOT modify the author's starter code
NOT affect other readers
```

Refreshing the page should restore the author's original starter code.

---

# 10. No Prisma Migration Is Required

Your current editor already saves:

```tsx
JSON.stringify(editor.document)
```

and loads that JSON again when rendering a blog.

Therefore the custom block props can be stored inside the existing article content.

For version 1:

```text
No new Prisma model
No migration
No prisma db push
```

Do not mix database schema changes into this feature.

---

# 11. Recommended File Structure

```text
components/
├── blog/
│   └── editor/
│       ├── BlockNoteEditor.tsx
│       ├── BlockNoteEditorClient.tsx
│       ├── blockSchema.ts
│       ├── editor.css
│       └── blocks/
│           └── CodePlaygroundBlock.tsx
│
└── playground/
    ├── WebPlayground.tsx
    └── InteractiveWebPlayground.tsx
```

Later for Judge0:

```text
app/
└── api/
    └── code/
        └── run/
            └── route.ts
```

---

# 12. Create the Custom BlockNote Playground Block

Tech Path is pinned to BlockNote `0.23.5`.

Create:

```text
components/blog/editor/blocks/CodePlaygroundBlock.tsx
```

Start with:

```tsx
"use client";

import { createReactBlockSpec } from "@blocknote/react";
import InteractiveWebPlayground from "@/components/playground/InteractiveWebPlayground";

export function createCodePlaygroundBlock(authoring: boolean) {
  return createReactBlockSpec(
    {
      type: "codePlayground",
      propSchema: {
        title: {
          default: "Try It Yourself",
        },
        html: {
          default: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>Tech Path Playground</title>
  </head>
  <body>
    <main id="app">
      <h1>Hello Tech Path!</h1>
    </main>
    <script type="module" src="/index.js"></script>
  </body>
</html>`,
        },
        css: {
          default: `body {
  font-family: Arial, sans-serif;
  padding: 2rem;
}

h1 {
  color: #5A1C4B;
}`,
        },
        javascript: {
          default: `console.log("Hello from Tech Path!");`,
        },
        showConsole: {
          default: true,
        },
      },
      content: "none",
    },
    {
      render: ({ block, editor }) => {
        const updateProps = (
          props: Partial<typeof block.props>,
        ) => {
          editor.updateBlock(block, {
            props,
          });
        };

        return (
          <div className="w-full" contentEditable={false}>
            {authoring && (
              <details className="mb-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <summary className="cursor-pointer font-semibold">
                  Configure Interactive Playground
                </summary>

                <div className="mt-4 flex flex-col gap-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Title</span>
                    <input
                      className="rounded border px-3 py-2 dark:bg-slate-900"
                      value={block.props.title}
                      onChange={(event) =>
                        updateProps({ title: event.target.value })
                      }
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">HTML</span>
                    <textarea
                      className="min-h-48 rounded border p-3 font-mono text-sm dark:bg-slate-900"
                      value={block.props.html}
                      onChange={(event) =>
                        updateProps({ html: event.target.value })
                      }
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">CSS</span>
                    <textarea
                      className="min-h-40 rounded border p-3 font-mono text-sm dark:bg-slate-900"
                      value={block.props.css}
                      onChange={(event) =>
                        updateProps({ css: event.target.value })
                      }
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">JavaScript</span>
                    <textarea
                      className="min-h-40 rounded border p-3 font-mono text-sm dark:bg-slate-900"
                      value={block.props.javascript}
                      onChange={(event) =>
                        updateProps({ javascript: event.target.value })
                      }
                    />
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={block.props.showConsole}
                      onChange={(event) =>
                        updateProps({
                          showConsole: event.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">Show console</span>
                  </label>
                </div>
              </details>
            )}

            <InteractiveWebPlayground
              title={block.props.title}
              html={block.props.html}
              css={block.props.css}
              javascript={block.props.javascript}
              showConsole={block.props.showConsole}
            />
          </div>
        );
      },
    },
  );
}
```

### Version-safety note

Your installed TypeScript definitions are the authority.

If a BlockNote method signature differs in `0.23.5`, do not silence the compiler with `any`. Inspect the installed type definition and adapt the code.

---

# 13. Register the Custom Schema

Create:

```text
components/blog/editor/blockSchema.ts
```

Use:

```ts
import {
  BlockNoteSchema,
  defaultBlockSpecs,
} from "@blocknote/core";

import { createCodePlaygroundBlock } from "./blocks/CodePlaygroundBlock";

export function createTechPathBlockSchema(
  authoring: boolean,
) {
  return BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,
      codePlayground:
        createCodePlaygroundBlock(authoring)(),
    },
  });
}
```

## Critical

Never remove:

```ts
...defaultBlockSpecs
```

If you omit the default BlockNote specs, existing articles with paragraphs, headings, lists, images and normal code blocks can stop rendering correctly.

---

# 14. Update `BlockNoteEditor.tsx`

Use the custom schema for both authoring and public read-only rendering.

Recommended structure:

```tsx
"use client";

import { PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";
import { useMemo } from "react";

import { createTechPathBlockSchema } from "./blockSchema";

import "@blocknote/mantine/style.css";
import "./editor.css";

interface BlockNoteEditorProps {
  onChange?: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const BlockNoteEditor = ({
  onChange,
  initialContent,
  editable,
}: BlockNoteEditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const authoring = editable !== false;

  const schema = useMemo(
    () => createTechPathBlockSchema(authoring),
    [authoring],
  );

  const handleImgUploads = async (file: File) => {
    const res = await edgestore.publicFiles.upload({
      file,
    });

    return res.url;
  };

  const editor = useCreateBlockNote({
    schema,
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: handleImgUploads,
  });

  return (
    <BlockNoteView
      editor={editor}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onChange={
        onChange
          ? () => onChange(JSON.stringify(editor.document))
          : () => {}
      }
      editable={editable}
    />
  );
};

export default BlockNoteEditor;
```

Keep:

```tsx
JSON.stringify(editor.document)
```

This is what persists the custom block props in the blog content.

---

# 15. First Insertion UX: Use a Visible Button

Do not make slash-menu integration the first dependency.

BlockNote's menu APIs have changed between releases. First get a stable production feature using a clear author-only button:

```text
+ Interactive Playground
```

Conceptual insertion logic:

```ts
const referenceBlock =
  editor.document[editor.document.length - 1];

if (!referenceBlock) {
  return;
}

editor.insertBlocks(
  [
    {
      type: "codePlayground",
      props: {
        title: "Try It Yourself",
      },
    },
  ],
  referenceBlock,
  "after",
);
```

Author-only UI:

```tsx
{editable !== false && (
  <button
    type="button"
    onClick={insertPlayground}
    className="mb-3 rounded-lg bg-[#5A1C4B] px-4 py-2 text-sm font-semibold text-white"
  >
    + Interactive Playground
  </button>
)}
```

If TypeScript shows that `insertBlocks` has a different exact signature in `0.23.5`, follow the installed definitions instead of using `as any`.

---

# 16. Add Slash-Menu Integration Later

After the button version is stable, inspect the exact helpers available in your installed BlockNote packages:

```powershell
Get-ChildItem `
  -Recurse `
  node_modules\@blocknoteeact `
  -File |
Select-String -Pattern `
  "SuggestionMenuController|getDefaultReactSlashMenuItems|filterSuggestionItems"
```

Also:

```powershell
Get-ChildItem `
  -Recurse `
  node_modules\@blocknote\core `
  -File |
Select-String -Pattern `
  "SuggestionMenu|SlashMenu|insertBlocks"
```

Then implement:

```text
/ Interactive Playground
```

using the APIs actually available in `0.23.5`.

Do not copy a latest-version BlockNote menu example blindly into this pinned project.

---

# 17. End-to-End Save/Publish Test

Create a draft containing:

1. Paragraph
2. Heading
3. Image
4. Normal code block
5. Interactive playground
6. Paragraph after the playground

Use starter code:

### HTML

```html
<!doctype html>
<html>
<body>
  <button id="button">Click me</button>
  <p id="message"></p>

  <script type="module" src="/index.js"></script>
</body>
</html>
```

### CSS

```css
body {
  font-family: Arial, sans-serif;
  padding: 2rem;
}

button {
  background: #5A1C4B;
  color: white;
  border: 0;
  border-radius: 8px;
  padding: 10px 16px;
}
```

### JavaScript

```js
const button = document.querySelector("#button");
const message = document.querySelector("#message");

button?.addEventListener("click", () => {
  if (message) {
    message.textContent =
      "Your JavaScript is working!";
  }
});
```

Then:

- Save draft.
- Reload editor.
- Confirm starter code persists.
- Publish.
- Open public article.
- Confirm playground appears.
- Modify code as a reader.
- Confirm preview changes.
- Refresh article.
- Confirm reader modifications reset.
- Re-open the article editor.
- Confirm author's starter code is still intact.

---

# 18. Backward-Compatibility Test

Before merging, open several existing Tech Path posts created before the playground existed.

Confirm:

- paragraphs render
- headings render
- images render
- lists render
- standard code blocks render
- tags render
- comments render
- related posts render
- editing existing articles still works

This is why your schema must retain:

```ts
...defaultBlockSpecs
```

---

# 19. Add TypeScript and React Only After Version 1 Is Stable

In a later commit/PR, add a runtime property such as:

```ts
runtime: {
  default: "javascript",
  values: [
    "javascript",
    "typescript",
    "react",
    "react-ts",
  ],
},
```

Map to Sandpack templates:

```ts
const templates = {
  javascript: "vanilla",
  typescript: "vanilla-ts",
  react: "react",
  "react-ts": "react-ts",
} as const;
```

Do not combine this expansion with the initial BlockNote integration if the first version has not yet passed production testing.

---

# 20. Performance Guidance

Interactive playgrounds are heavier than normal code blocks.

Test articles with:

- 1 playground
- 3 playgrounds
- 5 playgrounds

on desktop and mobile.

Later optimizations can include:

- dynamic import
- lazy mounting
- "Open Playground" button
- mount when near viewport
- limit the number of playgrounds per article

If Sandpack causes SSR/hydration issues, use a client-only dynamic import:

```tsx
"use client";

import dynamic from "next/dynamic";

const InteractiveWebPlayground =
  dynamic(
    () =>
      import(
        "@/components/playground/InteractiveWebPlayground"
      ),
    {
      ssr: false,
      loading: () => (
        <div className="rounded-lg border p-4">
          Loading interactive playground...
        </div>
      ),
    },
  );

export default InteractiveWebPlayground;
```

Only add this if it is actually needed.

---

# 21. Build Validation

Before every push:

```powershell
npm run build
```

Also:

```powershell
git diff --check
git status
```

Do not push known TypeScript/build failures.

---

# 22. Recommended Commit Structure

### Commit 1

```powershell
git add package.json package-lock.json
git add components/playground/WebPlayground.tsx
git add app/playground/page.tsx

git commit -m "feat(playground): add standalone Sandpack runtime"
```

### Commit 2

```powershell
git add components/playground/InteractiveWebPlayground.tsx

git commit -m "feat(playground): add reusable interactive web sandbox"
```

### Commit 3

```powershell
git add components/blog/editor/blocks/CodePlaygroundBlock.tsx
git add components/blog/editor/blockSchema.ts
git add components/blog/editor/BlockNoteEditor.tsx

git commit -m "feat(editor): add interactive code playground block"
```

### Commit 4 — insertion UX

```powershell
git add components/blog/editor/BlockNoteEditor.tsx

git commit -m "feat(editor): add playground insertion control"
```

Optional later:

```powershell
git commit -m "feat(editor): add playground to slash menu"
```

---

# 23. Push and PR

```powershell
git push -u origin feat/interactive-code-block
```

Create a PR into:

```text
main
```

Suggested title:

```text
feat: add interactive code playground to Tech Path articles
```

Suggested PR body:

```markdown
## Summary

Adds an interactive code playground to Tech Path while preserving
the existing BlockNote code block.

## Features

- Adds Sandpack-based browser code execution
- Adds reusable interactive web playground
- Adds custom BlockNote playground block
- Stores starter code inside existing BlockNote article JSON
- Allows readers to edit/run code without modifying the article
- Preserves existing BlockNote block types

## Initial language support

- HTML
- CSS
- JavaScript

## Validation

- [ ] npm install succeeds
- [ ] npm run build succeeds
- [ ] Existing articles still render
- [ ] Existing article editing still works
- [ ] Playground saves and reloads with article content
- [ ] Published playground is editable by readers
- [ ] Reader changes are temporary only
- [ ] Dark mode tested
- [ ] Light mode tested
- [ ] Mobile tested
- [ ] Desktop tested
```

Review **Files changed** before merging.

Use **Squash and merge** after validation.

---

# 24. Later Phase — Python, Java, C, C++, etc. with Judge0

Do not mix this into the Sandpack PR.

Later:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/multilanguage-code-runner
```

Architecture:

```text
Reader
   │
   ▼
Interactive Playground
   │
   ▼
POST /api/code/run
   │
   ▼
Tech Path Next.js route
   │
   ▼
Judge0
   │
   ▼
sandbox
   │
   ▼
stdout / stderr / compile result
```

Create:

```text
app/api/code/run/route.ts
```

Use server-only environment variables:

```env
JUDGE0_BASE_URL=https://your-judge0-instance.example.com
JUDGE0_API_KEY=your-server-side-key
```

Never use:

```env
NEXT_PUBLIC_JUDGE0_API_KEY=...
```

for a secret.

---

# 25. Judge0 Security Requirements

Before public server-side code execution:

- allowlist supported languages
- validate requests with Zod
- cap source-code size
- cap stdin size
- cap output size
- enforce execution timeout
- enforce memory limit
- rate-limit requests
- limit concurrency
- keep credentials server-only
- do not expose internal errors/secrets
- do not cache `/api/code/run`
- do not run user code through `child_process`

Query the `/languages` endpoint of the Judge0 instance you actually use. Do not blindly copy stale language IDs from tutorials.

---

# 26. PWA Rule

Tech Path already has a service worker.

When `/api/code/run` is eventually added, never cache it.

Generally keep:

```text
/api/
```

out of generic PWA cache-first behavior unless a route has a deliberate caching policy.

Do not mix PWA rewriting into the first playground PR.

---

# 27. Troubleshooting

## `Unknown block type codePlayground`

The custom schema is probably not being used by both editor and published article rendering.

Use the shared schema in the common `BlockNoteEditor.tsx`.

---

## Old articles stop rendering

You probably forgot:

```ts
...defaultBlockSpecs
```

Restore it.

---

## Author playground code disappears after reload

The configuration UI may be changing local/Sandpack state only.

Author changes must update the BlockNote block props through:

```ts
editor.updateBlock(...)
```

so they become part of `editor.document`.

---

## Reader changes save into the article

That is incorrect.

Reader edits should remain inside Sandpack only. Public reader interactions must not call `editor.updateBlock(...)`.

---

## Build fails because a BlockNote helper is missing

Check exact installed versions:

```powershell
npm ls @blocknote/core @blocknote/react @blocknote/mantine
```

Search local type files:

```powershell
Get-ChildItem `
  -Recurse `
  node_modules\@blocknote `
  -File |
Select-String -Pattern `
  "createReactBlockSpec|insertBlocks|updateBlock"
```

Adapt to pinned `0.23.5`.

Do not fix it by adding `any` everywhere.

---

## Blank Sandpack preview

Check:

- template
- HTML entry
- script path
- CSS import
- browser console
- Sandpack console
- malformed starter code

---

## Production shows stale behavior

Because Tech Path is a PWA, inspect the service-worker cache/version separately.

Do not mix PWA fixes into this feature branch.

---

# 28. Final Acceptance Checklist

## Compatibility

- [ ] Existing articles render unchanged
- [ ] Standard BlockNote code blocks still work
- [ ] Images still work
- [ ] Existing article editing works

## Authoring

- [ ] Author can insert an Interactive Playground
- [ ] Starter HTML can be edited
- [ ] Starter CSS can be edited
- [ ] Starter JavaScript can be edited
- [ ] Playground title can be changed
- [ ] Show-console setting persists
- [ ] Playground survives save/reload
- [ ] Playground survives publish/edit/re-publish

## Reader

- [ ] Reader can edit code
- [ ] Preview/output works
- [ ] Console works when enabled
- [ ] Reader edits never alter the article
- [ ] Refresh restores the author's starter code

## Technical

- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No fatal browser-console errors
- [ ] No Prisma migration
- [ ] No direct server-side arbitrary code execution
- [ ] Mobile tested
- [ ] Desktop tested
- [ ] Dark mode tested
- [ ] Light mode tested

## Git

- [ ] Feature lives on `feat/interactive-code-block`
- [ ] Focused commits
- [ ] PR reviewed
- [ ] No unrelated GA/PWA/auth changes mixed in

---

# 29. Recommended Delivery Order

Follow this exact order:

```text
1. Restore and verify production
2. Repair GitHub main to the intended stable state
3. Create feat/interactive-code-block
4. Install Sandpack
5. Build standalone /playground proof
6. Run npm run build
7. Build reusable playground component
8. Add custom BlockNote block
9. Register schema with defaultBlockSpecs
10. Add simple author insertion button
11. Test create/save/publish/reload
12. Test old posts
13. Build again
14. Push branch
15. Open PR
16. Review and squash-merge
17. Add slash-menu UX afterward
18. Add TS/React afterward
19. Add Judge0 in a separate future PR
```

This keeps failures isolated and protects production.

---

# 30. Quick Command Checklist

Once production is stable:

```powershell
git switch main
git pull --ff-only origin main
git status
git switch -c feat/interactive-code-block
```

Install:

```powershell
npm install @codesandbox/sandpack-react@2.20.0 --save-exact
npm ls @codesandbox/sandpack-react react react-dom
```

Develop:

```powershell
npm run dev
```

Validate:

```powershell
npm run build
git diff --check
git status
```

Push:

```powershell
git push -u origin feat/interactive-code-block
```

---

# 31. Version Notes

This guide targets the project's current dependency line:

```text
Next.js                15.1.4
React                  19.0.0
React DOM              19.0.0
@blocknote/core        0.23.5
@blocknote/react       0.23.5
@blocknote/mantine     0.23.5
Prisma                 6.2.1
```

Recommended initial Sandpack pin:

```text
@codesandbox/sandpack-react 2.20.0
```

Avoid combining this feature with framework upgrades.

Do not put all of these in one branch:

```text
Next upgrade
React upgrade
BlockNote upgrade
Prisma upgrade
PWA rewrite
GA rewrite
Interactive playground
```

---

# 32. References

- Tech Path repository: `https://github.com/Dev-Champions-Projects/web-blog`
- BlockNote custom blocks: `https://www.blocknotejs.org/docs/features/custom-schemas/custom-blocks`
- BlockNote repository/tag: `v0.23.5`
- Sandpack: `https://sandpack.codesandbox.io/`
- Judge0: `https://ce.judge0.com/docs`

When latest documentation and installed TypeScript definitions disagree, use the API supported by the pinned package unless you intentionally perform a separate upgrade.

---

# 33. Definition of Done

For Tech Path, the feature is "perfectly done" when:

1. Production stays stable.
2. Existing blogs are unaffected.
3. Authors can insert a runnable block.
4. Starter code persists in existing article JSON.
5. Readers can safely edit and run it.
6. Reader edits do not modify the article.
7. Sandpack handles browser execution.
8. No public arbitrary code runs directly on Render.
9. The build passes.
10. The feature is isolated in its own branch/PR.
11. The architecture is ready for Judge0 later.

---

**Suggested feature branch:** `feat/interactive-code-block`  
**Suggested first release:** HTML + CSS + JavaScript  
**Second release:** TypeScript + React  
**Later release:** Python + Java + C/C++ through Judge0
