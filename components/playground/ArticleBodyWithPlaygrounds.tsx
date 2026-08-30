"use client";

import { useRef } from "react";

import BlockNoteEditor from "@/components/blog/editor/BlockNoteEditorClient";
import ArticleCodeCopyButtons from "@/components/blog/ArticleCodeCopyButtons";
import InlineCodePlaygrounds from "@/components/playground/InlineCodePlaygrounds";

interface ArticleBodyWithPlaygroundsProps {
  content: string;
}

export default function ArticleBodyWithPlaygrounds({
  content,
}: ArticleBodyWithPlaygroundsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={rootRef} data-tech-path-article-body>
      <BlockNoteEditor editable={false} initialContent={content} />

      <ArticleCodeCopyButtons rootRef={rootRef} />

      <InlineCodePlaygrounds content={content} rootRef={rootRef} />
    </div>
  );
}
