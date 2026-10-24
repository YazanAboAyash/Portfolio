/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import VersionDisplay from "@/components/VersionDisplay";
import { useLatestPost } from "@/hooks/use-latest-post";
import { cn } from "@/lib/utils";

/** How long each focus item stays before the next one rotates in. */
const FOCUS_INTERVAL_MS = 3000;

const LABEL =
  "text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground";
const CELL = "group flex min-w-0 flex-col gap-1.5 text-left";
/** Latest post and This site: the blog and the site link stay in the nav and footer on phones. */
const CELL_FROM_SM = cn(CELL, "hidden sm:flex");

/** "Now" strip under the hero copy: current focus, latest post, this site. */
export function HeroNow() {
  const t = useTranslations("Hero.now");
  const locale = useLocale();
  const post = useLatestPost();

  const focusItems = t.raw("focusItems") as string[];
  const [focusIndex, setFocusIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Rotate on a timer unless the visitor is pointing at it or asked for less motion
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setFocusIndex((i) => (i + 1) % focusItems.length),
      FOCUS_INTERVAL_MS,
    );
    return () => clearInterval(timer);
  }, [paused, focusItems.length]);

  return (
    <section
      aria-label={t("label")}
      className="grid grid-cols-1 gap-x-8 gap-y-5 border-t border-surface-2 pt-5 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3"
    >
      <button
        type="button"
        onClick={() => setFocusIndex((i) => (i + 1) % focusItems.length)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        aria-label={`${t("focus")}: ${focusItems[focusIndex]}. ${t("nextFocus")}`}
        className={`${CELL} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground`}
      >
        <span className={`${LABEL} flex items-center gap-2`}>
          {t("focus")}
          <span className="tabular-nums" aria-hidden="true">
            {focusIndex + 1}/{focusItems.length}
          </span>
        </span>
        <span className="flex items-start gap-1.5 text-sm font-semibold leading-snug">
          {/* All items share one grid cell so the tallest sets the height
              and rotating never shifts the page */}
          <span className="grid">
            {focusItems.map((item, i) => (
              <span
                key={item}
                aria-hidden="true"
                className={`col-start-1 row-start-1 transition-opacity duration-300 motion-reduce:transition-none ${
                  i === focusIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                {item}
              </span>
            ))}
          </span>
          <ArrowRight
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </span>
      </button>

      <div className={CELL_FROM_SM}>
        <span className={LABEL}>{t("latestPost")}</span>
        {post === undefined ? (
          <span className="h-14 w-full animate-pulse bg-surface motion-reduce:animate-none" />
        ) : post ? (
          <Link
            href={`/blog/${post.slug}`}
            className="group/post min-h-14 text-sm font-semibold leading-snug"
          >
            <span className="line-clamp-3 underline decoration-surface-2 decoration-2 underline-offset-4 transition-colors group-hover/post:decoration-foreground">
              {post.title}
            </span>
            {post.publishedAt ? (
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                {new Intl.DateTimeFormat(locale, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(new Date(post.publishedAt))}
              </span>
            ) : null}
          </Link>
        ) : (
          <Link
            href="/blog"
            className="text-sm font-semibold underline decoration-surface-2 decoration-2 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {t("allPosts")}
          </Link>
        )}
      </div>

      <div className={CELL_FROM_SM}>
        <span className={LABEL}>{t("site")}</span>
        <Link
          href="/about-portfolio"
          className="inline-flex items-start gap-1 text-sm font-semibold leading-snug underline decoration-surface-2 decoration-2 underline-offset-4 transition-colors hover:decoration-foreground"
        >
          <span>
            <VersionDisplay className="tabular-nums" /> · {t("siteLink")}
          </span>
          <ArrowUpRight
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
