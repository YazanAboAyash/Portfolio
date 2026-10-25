/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import type { Blog } from "@/types/hubs/blogs";
import { BLOG_LANGUAGE_NAMES } from "@/types/hubs/blogs";
import { cn } from "@/lib/utils";

const chip = "border border-border px-2 py-1 font-mono text-[11px]";

function BlogRow({ blog }: { blog: Blog }) {
  const t = useTranslations("Blog");
  const locale = useLocale();

  return (
    <article className="group relative grid gap-6 py-8 sm:grid-cols-[1fr_auto] sm:items-start">
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {blog.publishedAt ? (
            <time dateTime={new Date(blog.publishedAt).toISOString()}>
              {new Date(blog.publishedAt).toLocaleDateString(locale, {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              })}
            </time>
          ) : (
            <span>{t("draft")}</span>
          )}
          {blog.readingTime && (
            <>
              <span aria-hidden="true">/</span>
              <span>{t("minutesToRead", { count: blog.readingTime })}</span>
            </>
          )}
          {blog.language && (
            <>
              <span aria-hidden="true">/</span>
              <span>
                {BLOG_LANGUAGE_NAMES[
                  blog.language as keyof typeof BLOG_LANGUAGE_NAMES
                ] || blog.language.toUpperCase()}
              </span>
            </>
          )}
        </div>

        <h2 className="max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.02em] text-balance sm:text-3xl">
          {/* Stretched link: the whole row is the click target, one tab stop */}
          <Link
            href={`/blog/${blog.slug}`}
            className="transition-colors after:absolute after:inset-0 group-hover:text-foreground/70 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-foreground"
          >
            {blog.title}
          </Link>
        </h2>
        {blog.excerpt && (
          <p className="mt-4 line-clamp-3 max-w-2xl leading-7 text-pretty text-muted-foreground">
            {blog.excerpt}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2 text-muted-foreground">
          {blog.isFeatured && (
            <span className={cn(chip, "border-foreground bg-foreground text-background")}>
              {t("featured")}
            </span>
          )}
          {blog.category && <span className={chip}>{blog.category.name}</span>}
          {blog.tags?.slice(0, 3).map((tagRelation) => (
            <span key={tagRelation.id} className={chip}>
              {tagRelation.tag?.name}
            </span>
          ))}
          {blog.tags && blog.tags.length > 3 && (
            <span className={chip}>+{blog.tags.length - 3}</span>
          )}
        </div>
      </div>

      <span
        aria-hidden="true"
        className="hidden size-10 items-center justify-center border border-border transition-colors group-hover:border-foreground group-hover:bg-foreground group-hover:text-background sm:inline-flex"
      >
        <ArrowUpRight className="size-4" />
      </span>
    </article>
  );
}

interface BlogsListProps {
  blogs: Blog[];
  className?: string;
}

export function BlogsList({ blogs, className }: BlogsListProps) {
  const t = useTranslations("Blog");

  if (blogs.length === 0) {
    return (
      <div className="bg-surface px-6 py-16">
        <div>
          <p className="text-xl font-semibold tracking-[-0.01em]">
            {t("emptyTitle")}
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/80">
            {t("emptyDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className={cn("divide-y divide-border border-y border-border", className)}>
      {blogs.map((blog) => (
        <li key={blog.id}>
          <BlogRow blog={blog} />
        </li>
      ))}
    </ul>
  );
}
