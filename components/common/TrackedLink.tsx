"use client";

import {
  useCallback,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import Link, { type LinkProps } from "next/link";
import { trackLinkClick, type AnalyticsEventParams } from "@/lib/analytics";

type AnchorProps = Omit<ComponentPropsWithoutRef<"a">, "href">;

interface TrackedLinkProps extends LinkProps, AnchorProps {
  children: ReactNode;
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
