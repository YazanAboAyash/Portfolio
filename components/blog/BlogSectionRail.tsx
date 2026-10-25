/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { cn } from "@/lib/utils";
import type { BlogHeading } from "@/types/hubs/blogs";

/** Id of the element that wraps the post body; progress is measured on it. */
export const BLOG_BODY_ID = "post-body";

/** Thin bar pinned to the top of the viewport, filling as the post is read. */
export function BlogProgressBar() {
  const { progress } = useReadingProgress(BLOG_BODY_ID, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-foreground"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}

interface BlogSectionRailProps {
  headings: BlogHeading[];
  readingTime: number;
}

/** Sticky "On this page" list with the active section and time left. */
export function BlogSectionRail({ headings, readingTime }: BlogSectionRailProps) {
  const t = useTranslations("Blog");
  const { progress, activeId } = useReadingProgress(
    BLOG_BODY_ID,
    headings.map((heading) => heading.id),
  );
  const minutesLeft =
    progress >= 0.98 ? 0 : Math.max(1, Math.ceil(readingTime * (1 - progress)));

  return (
    <nav
      aria-label={t("contents")}
      className="sticky top-24 hidden self-start lg:block"
    >
      <p className="mb-5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {t("onThisPage")}
      </p>
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-border" />
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 w-px bg-foreground transition-[height] duration-150 motion-reduce:transition-none"
          style={{ height: `${progress * 100}%` }}
        />
        <ol className="space-y-1">
          {headings.map(({ id, title }, index) => {
            const active = id === activeId;
            return (
              <li key={`${id}-${index}`}>
                <a
                  href={`#${id}`}
                  aria-current={active ? "location" : undefined}
                  className={cn(
                    "block py-1.5 pl-5 text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-foreground",
                    active
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {title}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="mt-6 pl-5 font-mono text-xs tabular-nums text-muted-foreground">
        {t("readingStatus", {
          percent: Math.round(progress * 100),
          minutes: minutesLeft,
        })}
      </p>
    </nav>
  );
}
