"use client";

import { useCallback } from "react";
import Link, { type LinkProps } from "next/link";
import { trackLinkClick, type AnalyticsEventParams } from "@/lib/analytics";

interface TrackedLinkProps extends LinkProps {
  eventLabel: string;
  eventParams?: AnalyticsEventParams;
}

export default function TrackedLink({
  eventLabel,
  eventParams,
  onClick,
  href,
  ...props
}: TrackedLinkProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      trackLinkClick(eventLabel, {
        href: typeof href === "string" ? href : href?.toString(),
        ...eventParams,
      });

      if (typeof onClick === "function") {
        onClick(event);
      }
    },
    [eventLabel, eventParams, href, onClick],
  );

  return <Link {...props} href={href} onClick={handleClick} />;
}
