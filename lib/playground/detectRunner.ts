import {
    getBrowserRunner,
} from "@/lib/playground/runners";

import type {
    BrowserRunner,
    PlaygroundTarget,
    RunnableSnippet,
    WebFileKey,
    WebPlaygroundExample,
    WebPlaygroundFiles,
    WebPlaygroundSourceFlags,
} from "@/lib/playground/types";


interface UnknownBlock {
    id?:
    unknown;

    type?:
    unknown;

    props?: {
        language?:
        unknown;

        [key: string]:
        unknown;
    };

    content?:
    unknown;

    children?:
    unknown;
}


interface BlockRecord {
    position:
    number;

    codeBlockIndex:
    number | null;

    blockId:
    string;

    type:
    string;

    code:
    string;

    runner:
    BrowserRunner | null;

    webFile:
    WebFileKey | null;
}


interface TraversalState {
    position:
    number;

    codeBlockIndex:
    number;
}


const MAX_CONTEXT_NON_CODE_BLOCKS =
    4;


/*
 * =========================================================
 * TEXT EXTRACTION
 * =========================================================
 */

function getTextFromContent(
    content:
        unknown,
): string {
    if (
        typeof content ===
        "string"
    ) {
        return content;
    }


    if (
        !Array.isArray(
            content,
        )
    ) {
        return "";
    }


    return content
        .map(
            (item) => {
                if (
                    typeof item ===
                    "string"
                ) {
                    return item;
                }


                if (
                    !item ||
                    typeof item !==
                    "object"
                ) {
                    return "";
                }


                const candidate =
                    item as {
                        text?:
                        unknown;

                        content?:
                        unknown;
                    };


                if (
                    typeof candidate.text ===
                    "string"
                ) {
                    return candidate.text;
                }


                return getTextFromContent(
                    candidate.content,
                );
            },
        )
        .join("");
}


/*
 * =========================================================
 * SAFE LANGUAGE INFERENCE FOR OLD POSTS
 * =========================================================
 */

function looksLikeHtml(
    code:
        string,
) {
    const trimmed =
        code.trim();


    if (!trimmed) {
        return false;
    }


    if (
        /<!doctype\s+html/i.test(
            trimmed,
        )
    ) {
        return true;
    }


    return /<\/?(?:html|head|body|main|section|article|header|footer|nav|div|span|p|h[1-6]|a|button|input|form|label|ul|ol|li|table|tr|td|th|img|video|audio|canvas|select|option|textarea)\b[^>]*>/i.test(
        trimmed,
    );
}


function looksLikeCss(
    code:
        string,
) {
    const trimmed =
        code.trim();


    if (!trimmed) {
        return false;
    }


    /*
     * Needs both:
     * - something that resembles a selector
     * - a CSS-style declaration inside braces
     *
     * This prevents us from blindly treating
     * JSON/JS objects as CSS.
     */
    const selectorBlock =
        /(?:^|})\s*(?:[.#][A-Za-z_][\w-]*|[A-Za-z][\w-]*(?:[.#][\w-]+)?|\[[^\]]+\]|:[A-Za-z-]+)[^{]*\{[^{}]*\}/m;


    const declaration =
        /(?:--[\w-]+|[A-Za-z-]{2,})\s*:\s*[^;{}]+;?/m;


    return (
        selectorBlock.test(
            trimmed,
        ) &&
        declaration.test(
            trimmed,
        )
    );
}


function looksLikeJavaScript(
    code:
        string,
) {
    const trimmed =
        code.trim();


    if (!trimmed) {
        return false;
    }


    return (
        /\b(?:const|let|var|function|class|async|await|return|new)\b/.test(
            trimmed,
        ) ||
        /=>/.test(
            trimmed,
        ) ||
        /\b(?:document|window|console)\./.test(
            trimmed,
        ) ||
        /\.addEventListener\s*\(/.test(
            trimmed,
        )
    );
}


function resolveRunner(
    language:
        unknown,

    code:
        string,
): BrowserRunner | null {
    /*
     * Explicit language always wins.
     */
    const explicitRunner =
        getBrowserRunner(
            language,
        );


    if (
        explicitRunner
    ) {
        return explicitRunner;
    }


    const normalizedLanguage =
        typeof language ===
            "string"
            ? language
                .trim()
                .toLowerCase()
            : "";


    /*
     * Do not guess when an explicit but
     * unsupported language is present.
     *
     * JSON, Bash, YAML, Python, etc. should
     * stay ordinary code until they have
     * their own safe runner.
     */
    const genericLanguages =
        new Set([
            "",
            "text",
            "plain",
            "plaintext",
            "none",
        ]);


    if (
        !genericLanguages.has(
            normalizedLanguage,
        )
    ) {
        return null;
    }


    if (
        looksLikeHtml(
            code,
        )
    ) {
        return getBrowserRunner(
            "html",
        );
    }


    if (
        looksLikeCss(
            code,
        )
    ) {
        return getBrowserRunner(
            "css",
        );
    }


    if (
        looksLikeJavaScript(
            code,
        )
    ) {
        return getBrowserRunner(
            "javascript",
        );
    }


    return null;
}


/*
 * =========================================================
 * RUNNER → WEB FILE
 * =========================================================
 */

function getWebFile(
    runner:
        BrowserRunner | null,
): WebFileKey | null {
    if (!runner) {
        return null;
    }


    if (
        runner.kind ===
        "html"
    ) {
        return "html";
    }


    if (
        runner.kind ===
        "css"
    ) {
        return "css";
    }


    if (
        runner.kind ===
        "javascript"
    ) {
        return "javascript";
    }


    return null;
}


/*
 * =========================================================
 * FLATTEN BLOCKNOTE
 * =========================================================
 */

function flattenBlocks(
    blocks:
        unknown[],

    records:
        BlockRecord[],

    state:
        TraversalState,
) {
    blocks.forEach(
        (rawBlock) => {
            if (
                !rawBlock ||
                typeof rawBlock !==
                "object"
            ) {
                return;
            }


            const block =
                rawBlock as UnknownBlock;


            const position =
                state.position;


            state.position +=
                1;


            const type =
                typeof block.type ===
                    "string"
                    ? block.type
                    : "unknown";


            const blockId =
                typeof block.id ===
                    "string"
                    ? block.id
                    : `generated-block-${position}`;


            let codeBlockIndex:
                number | null =
                null;


            let code =
                "";


            let runner:
                BrowserRunner | null =
                null;


            let webFile:
                WebFileKey | null =
                null;


            if (
                type ===
                "codeBlock"
            ) {
                codeBlockIndex =
                    state.codeBlockIndex;


                state.codeBlockIndex +=
                    1;


                code =
                    getTextFromContent(
                        block.content,
                    ).trim();


                runner =
                    resolveRunner(
                        block.props
                            ?.language,

                        code,
                    );


                webFile =
                    getWebFile(
                        runner,
                    );
            }


            records.push({
                position,

                codeBlockIndex,

                blockId,

                type,

                code,

                runner,

                webFile,
            });


            if (
                Array.isArray(
                    block.children,
                )
            ) {
                flattenBlocks(
                    block.children,
                    records,
                    state,
                );
            }
        },
    );
}


function parseArticleBlocks(
    serializedContent:
        string,
): BlockRecord[] {
    try {
        const parsed =
            JSON.parse(
                serializedContent,
            );


        if (
            !Array.isArray(
                parsed,
            )
        ) {
            return [];
        }


        const records:
            BlockRecord[] =
            [];


        flattenBlocks(
            parsed,
            records,
            {
                position:
                    0,

                codeBlockIndex:
                    0,
            },
        );


        return records;
    } catch (
    error
    ) {
        console.warn(
            "Unable to parse Tech Path article playground content:",
            error,
        );


        return [];
    }
}


/*
 * =========================================================
 * SUPPORTING HTML GENERATION
 * =========================================================
 */

function collectCssSelectorNames(
    css:
        string,
) {
    const classes =
        new Set<string>();


    const ids =
        new Set<string>();


    const selectorPattern =
        /([^{}]+)\{/g;


    let match:
        RegExpExecArray |
        null;


    while (
        (
            match =
            selectorPattern.exec(
                css,
            )
        ) !== null
    ) {
        const selectorText =
            match[1] ?? "";


        if (
            selectorText
                .trim()
                .startsWith("@")
        ) {
            continue;
        }


        for (
            const classMatch
            of selectorText.matchAll(
                /\.([A-Za-z_][\w-]*)/g,
            )
        ) {
            classes.add(
                classMatch[1],
            );
        }


        for (
            const idMatch
            of selectorText.matchAll(
                /#([A-Za-z_][\w-]*)/g,
            )
        ) {
            ids.add(
                idMatch[1],
            );
        }
    }


    return {
        classes:
            Array.from(
                classes,
            ).slice(
                0,
                5,
            ),

        ids:
            Array.from(
                ids,
            ).slice(
                0,
                5,
            ),
    };
}


function collectJsSelectorNames(
    javascript:
        string,
) {
    const classes =
        new Set<string>();


    const ids =
        new Set<string>();


    for (
        const match
        of javascript.matchAll(
            /querySelector(?:All)?\(\s*["'`]([#.][A-Za-z_][\w-]*)["'`]\s*\)/g,
        )
    ) {
        const selector =
            match[1];


        if (
            selector.startsWith(
                "#",
            )
        ) {
            ids.add(
                selector.slice(
                    1,
                ),
            );
        }


        if (
            selector.startsWith(
                ".",
            )
        ) {
            classes.add(
                selector.slice(
                    1,
                ),
            );
        }
    }


    for (
        const match
        of javascript.matchAll(
            /getElementById\(\s*["'`]([A-Za-z_][\w-]*)["'`]\s*\)/g,
        )
    ) {
        ids.add(
            match[1],
        );
    }


    return {
        classes:
            Array.from(
                classes,
            ).slice(
                0,
                5,
            ),

        ids:
            Array.from(
                ids,
            ).slice(
                0,
                5,
            ),
    };
}


function chooseElementForName(
    name:
        string,

    attribute:
        "id" | "class",
) {
    const lower =
        name.toLowerCase();


    const attributeValue =
        `${attribute}="${name}"`;


    if (
        lower.includes(
            "button",
        ) ||
        lower.includes(
            "btn",
        ) ||
        lower.includes(
            "submit",
        ) ||
        lower.includes(
            "toggle",
        ) ||
        lower.includes(
            "click",
        )
    ) {
        return `<button ${attributeValue}>
  ${name}
</button>`;
    }


    if (
        lower.includes(
            "input",
        ) ||
        lower.includes(
            "email",
        ) ||
        lower.includes(
            "search",
        )
    ) {
        return `<input
  ${attributeValue}
  placeholder="${name}"
/>`;
    }


    return `<div ${attributeValue}>
  ${name}
</div>`;
}


function generateSupportingHtml(
    css:
        string,

    javascript:
        string,
) {
    const cssSelectors =
        collectCssSelectorNames(
            css,
        );


    const jsSelectors =
        collectJsSelectorNames(
            javascript,
        );


    const classNames =
        Array.from(
            new Set([
                ...cssSelectors.classes,
                ...jsSelectors.classes,
            ]),
        ).slice(
            0,
            5,
        );


    const ids =
        Array.from(
            new Set([
                ...cssSelectors.ids,
                ...jsSelectors.ids,
            ]),
        ).slice(
            0,
            5,
        );


    const generatedElements =
        [
            ...ids.map(
                (id) =>
                    chooseElementForName(
                        id,
                        "id",
                    ),
            ),

            ...classNames.map(
                (className) =>
                    chooseElementForName(
                        className,
                        "class",
                    ),
            ),
        ];


    const uniqueElements =
        Array.from(
            new Set(
                generatedElements,
            ),
        );


    const extraMarkup =
        uniqueElements.length
            ? uniqueElements.join(
                "\n\n",
            )
            : `<div class="card">
  Example card
</div>

<button class="button">
  Example button
</button>`;


    return `<main class="tech-path-demo">
  <h1>
    Tech Path Playground
  </h1>

  <p>
    Supporting HTML was generated so the
    article's CSS or JavaScript has something
    to interact with.
  </p>

  ${extraMarkup}
</main>`;
}


/*
 * =========================================================
 * FIND NEARBY HTML / CSS / JS CONTEXT
 * =========================================================
 */

function findContextForAnchor(
    records:
        BlockRecord[],

    anchorArrayIndex:
        number,
) {
    const anchor =
        records[
        anchorArrayIndex
        ];


    if (
        !anchor ||
        !anchor.webFile
    ) {
        return [];
    }


    const selected =
        new Map<
            WebFileKey,
            BlockRecord
        >();


    selected.set(
        anchor.webFile,
        anchor,
    );


    function scan(
        direction:
            -1 | 1,
    ) {
        let nonCodeBlocks =
            0;


        for (
            let index =
                anchorArrayIndex +
                direction;

            index >= 0 &&
            index <
            records.length;

            index +=
            direction
        ) {
            const candidate =
                records[
                index
                ];


            /*
             * Heading means a new conceptual
             * section. Do not cross it.
             */
            if (
                candidate.type ===
                "heading"
            ) {
                break;
            }


            if (
                candidate.type ===
                "codeBlock"
            ) {
                /*
                 * Unsupported/config/server code
                 * separates playground contexts.
                 */
                if (
                    !candidate.webFile
                ) {
                    break;
                }


                /*
                 * Encountering another block of the
                 * same language usually signals a new
                 * example. Don't cross it.
                 */
                if (
                    candidate.webFile ===
                    anchor.webFile
                ) {
                    break;
                }


                if (
                    !selected.has(
                        candidate.webFile,
                    )
                ) {
                    selected.set(
                        candidate.webFile,
                        candidate,
                    );
                }


                nonCodeBlocks =
                    0;


                if (
                    selected.size ===
                    3
                ) {
                    break;
                }


                continue;
            }


            nonCodeBlocks +=
                1;


            if (
                nonCodeBlocks >
                MAX_CONTEXT_NON_CODE_BLOCKS
            ) {
                break;
            }
        }
    }


    /*
     * We search both directions because:
     *
     * HTML may appear before CSS,
     * JS may appear after CSS, etc.
     */
    scan(
        -1,
    );


    scan(
        1,
    );


    return Array.from(
        selected.values(),
    ).sort(
        (
            first,
            second,
        ) =>
            first.position -
            second.position,
    );
}


/*
 * =========================================================
 * BUILD CONTEXTUAL WEB EXAMPLE
 * =========================================================
 */

function createWebExample(
    records:
        BlockRecord[],

    anchorArrayIndex:
        number,
): WebPlaygroundExample | null {
    const anchor =
        records[
        anchorArrayIndex
        ];


    if (
        !anchor ||
        !anchor.runner ||
        !anchor.webFile ||
        anchor.codeBlockIndex ===
        null
    ) {
        return null;
    }


    const contextBlocks =
        findContextForAnchor(
            records,
            anchorArrayIndex,
        );


    const htmlBlock =
        contextBlocks.find(
            (record) =>
                record.webFile ===
                "html",
        );


    const cssBlock =
        contextBlocks.find(
            (record) =>
                record.webFile ===
                "css",
        );


    const javascriptBlock =
        contextBlocks.find(
            (record) =>
                record.webFile ===
                "javascript",
        );


    const fromArticle:
        WebPlaygroundSourceFlags = {
        html:
            Boolean(
                htmlBlock,
            ),

        css:
            Boolean(
                cssBlock,
            ),

        javascript:
            Boolean(
                javascriptBlock,
            ),
    };


    const css =
        cssBlock?.code ??
        "";


    const javascript =
        javascriptBlock
            ?.code ??
        "";


    const html =
        htmlBlock?.code ??
        generateSupportingHtml(
            css,
            javascript,
        );


    const files:
        WebPlaygroundFiles = {
        html,

        css,

        javascript,
    };


    const sourceBlockIds =
        contextBlocks.map(
            (record) =>
                record.blockId,
        );


    const groupId =
        sourceBlockIds
            .slice()
            .sort()
            .join("--");


    return {
        kind:
            "web",

        /*
         * Every article block needs a unique
         * Try It portal even when several
         * buttons share the same contextual
         * workspace.
         */
        id:
            `web-${anchor.blockId}`,

        groupId:
            groupId ||
            anchor.blockId,

        label:
            anchor.runner.label,

        primaryLanguage:
            anchor.webFile,

        anchorBlockId:
            anchor.blockId,

        anchorCodeBlockIndex:
            anchor.codeBlockIndex,

        sourceBlockIds,

        files,

        fromArticle,
    };
}


/*
 * =========================================================
 * PUBLIC API
 * =========================================================
 */

export function extractPlaygroundTargets(
    serializedContent:
        string,
): PlaygroundTarget[] {
    const records =
        parseArticleBlocks(
            serializedContent,
        );


    const targets:
        PlaygroundTarget[] =
        [];


    records.forEach(
        (
            record,
            arrayIndex,
        ) => {
            if (
                record.type !==
                "codeBlock" ||
                !record.runner ||
                record.codeBlockIndex ===
                null ||
                !record.code
            ) {
                return;
            }


            if (
                record.webFile
            ) {
                const example =
                    createWebExample(
                        records,
                        arrayIndex,
                    );


                if (example) {
                    targets.push(
                        example,
                    );
                }


                return;
            }


            const snippet:
                RunnableSnippet = {
                kind:
                    "snippet",

                id:
                    `snippet-${record.blockId}`,

                blockId:
                    record.blockId,

                anchorBlockId:
                    record.blockId,

                anchorCodeBlockIndex:
                    record.codeBlockIndex,

                codeBlockIndex:
                    record.codeBlockIndex,

                language:
                    record.runner.language,

                label:
                    record.runner.label,

                code:
                    record.code,

                runner:
                    record.runner,
            };


            targets.push(
                snippet,
            );
        },
    );


    return targets;
}


/*
 * Kept for compatibility with any earlier
 * code that still imports this function.
 */
export function extractRunnableSnippets(
    serializedContent:
        string,
): RunnableSnippet[] {
    const records =
        parseArticleBlocks(
            serializedContent,
        );


    return records
        .filter(
            (
                record,
            ) =>
                record.type ===
                "codeBlock" &&
                Boolean(
                    record.runner,
                ) &&
                record.codeBlockIndex !==
                null &&
                Boolean(
                    record.code,
                ),
        )
        .map(
            (record) => {
                const runner =
                    record.runner as BrowserRunner;


                const index =
                    record.codeBlockIndex as number;


                return {
                    kind:
                        "snippet" as const,

                    id:
                        `snippet-${record.blockId}`,

                    blockId:
                        record.blockId,

                    anchorBlockId:
                        record.blockId,

                    anchorCodeBlockIndex:
                        index,

                    codeBlockIndex:
                        index,

                    language:
                        runner.language,

                    label:
                        runner.label,

                    code:
                        record.code,

                    runner,
                };
            },
        );
}