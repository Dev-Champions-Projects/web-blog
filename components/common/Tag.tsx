"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback } from "react";
import queryString, { StringifiableRecord } from "query-string";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface TagProps {
  children: React.ReactNode;
  selected?: boolean;
}

const Tag = ({ children, selected }: TagProps) => {
  const router = useRouter();
  const params = useSearchParams();

  const handleClick = useCallback(() => {
    const tagName = typeof children === "string" ? children : String(children);

    if (tagName === "All") {
      trackEvent("select_content", {
        content_type: "tag",
        item_name: "All",
      });
      router.push("/blog/feed/1");
      return;
    }

    let currentQuery = {};

    if (params) {
      currentQuery = queryString.parse(params.toString());
    }

    const updatedQuery: StringifiableRecord | undefined = {
      ...currentQuery,
      tag: tagName,
    };

    const url = queryString.stringifyUrl(
      {
        url: "/blog/feed/1",
        query: updatedQuery,
      },
      {
        skipNull: true,
        skipEmptyString: true,
      },
    );

    trackEvent("select_content", {
      content_type: "tag",
      item_name: tagName,
    });

    router.push(url);
  }, [children, params, router]);

  return (
    <span
      onClick={handleClick}
      className={cn(
        "inline-flex items-center rounded bg-secondary px-2 py-1 text-sm cursor-pointer",
        selected && "bg-primary text-secondary",
      )}
    >
      {children}
    </span>
  );
};

export default Tag;
