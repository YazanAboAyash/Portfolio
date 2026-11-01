/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Quote, Star } from "lucide-react";
import { useFeedbackWall } from "@/hooks/use-feedback";
import { cardSurface } from "@/components/visuals";
import { cn } from "@/lib/utils";

/**
 * Approved feedback, newest first. Messages render as plain text: React
 * escapes them, and nothing here interprets markup or links.
 */
export default function FeedbackWall() {
  const t = useTranslations("Feedback");
  const format = useFormatter();
  const entries = useFeedbackWall();

  if (entries === undefined) {
    return (
      <div className="grid gap-2 sm:grid-cols-2" aria-busy="true">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="h-40 animate-pulse bg-surface motion-reduce:animate-none" />
        ))}
      </div>
    );
  }

  if (entries === null || entries.length === 0) {
    return (
      <div className="flex min-h-40 flex-col items-start justify-center gap-2 bg-surface p-6 md:p-8">
        <Quote className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <p className="text-lg font-semibold tracking-[-0.01em]">
          {entries === null ? t("wall.unavailable") : t("wall.emptyTitle")}
        </p>
        {entries !== null && (
          <p className="text-sm leading-relaxed text-foreground/80">
            {t("wall.emptyDescription")}
          </p>
        )}
      </div>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.id}>
          <figure
            className={cn(cardSurface, "flex h-full flex-col gap-4 px-5 py-5 md:px-6")}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="bg-background px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {t(`topics.${entry.topic}`)}
              </span>
              {entry.rating !== null && (
                <span
                  className="flex items-center gap-0.5"
                  role="img"
                  aria-label={t("wall.rating", { value: entry.rating })}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={cn(
                        "h-3.5 w-3.5",
                        value <= (entry.rating ?? 0)
                          ? "fill-foreground text-foreground"
                          : "text-muted-foreground/50",
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              )}
            </div>
            <blockquote className="flex-1 text-sm leading-relaxed whitespace-pre-line wrap-anywhere">
              {entry.message}
            </blockquote>
            <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold">
                {entry.name ?? t("wall.anonymous")}
              </span>
              <time
                dateTime={entry.createdAt}
                className="text-xs text-muted-foreground"
              >
                {format.dateTime(new Date(entry.createdAt), {
                  dateStyle: "medium",
                })}
              </time>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
