export type BrowserRunnerLanguage =
    | "html"
    | "css"
    | "javascript"
    | "typescript"
    | "jsx"
    | "tsx";


export type SandpackTemplate =
    | "vanilla"
    | "vanilla-ts"
    | "react"
    | "react-ts";


export type RunnerEngine =
    | "local-web"
    | "sandpack";


export type RunnerKind =
    | "html"
    | "css"
    | "javascript"
    | "typescript"
    | "react"
    | "react-typescript";


export interface BrowserRunner {
    language:
    BrowserRunnerLanguage;

    label:
    string;

    aliases:
    readonly string[];

    engine:
    RunnerEngine;

    template:
    SandpackTemplate;

    kind:
    RunnerKind;
}


export interface SandpackConfig {
    template:
    SandpackTemplate;

    files:
    Record<string, string>;
}


/*
 * =========================================================
 * WEB PLAYGROUND
 * =========================================================
 */

export type WebFileKey =
    | "html"
    | "css"
    | "javascript";


export interface WebPlaygroundFiles {
    html:
    string;

    css:
    string;

    javascript:
    string;
}


export interface WebPlaygroundSourceFlags {
    html:
    boolean;

    css:
    boolean;

    javascript:
    boolean;
}


export interface WebPlaygroundExample {
    kind:
    "web";

    id:
    string;

    /*
     * Used when several nearby article
     * blocks belong to the same concept.
     */
    groupId:
    string;

    label:
    string;

    primaryLanguage:
    WebFileKey;

    /*
     * The particular code block where
     * this Try It button is attached.
     */
    anchorBlockId:
    string;

    anchorCodeBlockIndex:
    number;

    /*
     * All article code blocks contributing
     * to this workspace.
     */
    sourceBlockIds:
    string[];

    files:
    WebPlaygroundFiles;

    /*
     * true = code came directly from article
     * false = supporting/empty content
     */
    fromArticle:
    WebPlaygroundSourceFlags;
}


/*
 * =========================================================
 * NON-WEB / FRAMEWORK SNIPPETS
 * =========================================================
 */

export interface RunnableSnippet {
    kind:
    "snippet";

    id:
    string;

    blockId:
    string;

    anchorBlockId:
    string;

    anchorCodeBlockIndex:
    number;

    /*
     * Kept for compatibility with earlier
     * playground code.
     */
    codeBlockIndex:
    number;

    language:
    BrowserRunnerLanguage;

    label:
    string;

    code:
    string;

    runner:
    BrowserRunner;
}


export type PlaygroundTarget =
    | WebPlaygroundExample
    | RunnableSnippet;


/*
 * =========================================================
 * TEMPORARY FULL-PLAYGROUND DRAFT
 * =========================================================
 */

export interface PlaygroundDraft {
    version:
    1;

    createdAt:
    number;

    example:
    WebPlaygroundExample;
}