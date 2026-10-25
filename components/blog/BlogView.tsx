/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import {
  Children,
  isValidElement,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Clock, Eye, Link2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";
import { getBlogHeadings, slugifyHeading } from "@/lib/blog-headings";
import { cn } from "@/lib/utils";
import type { Blog } from "@/types/hubs/blogs";
import { BLOG_LANGUAGE_NAMES } from "@/types/hubs/blogs";
import { BlogCopyLinkButton, BlogPostActions } from "./BlogPostActions";
import {
  BLOG_BODY_ID,
  BlogProgressBar,
  BlogSectionRail,
} from "./BlogSectionRail";
import { BlogTaskList } from "./BlogTaskList";

const FALLBACK_IMAGE = "/assets/blogs/blogsFallback.png";

/** Mono, square chip used for language, category and tags. */
const chip = "border border-border px-2.5 py-1 font-mono text-xs";

const bodyText = "text-[1.0625rem] leading-8 text-pretty text-foreground/90";

/** Square bullets on direct children only, so task lists keep their boxes. */
const bulletList =
  "space-y-3 [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.8rem] [&>li]:before:size-1.5 [&>li]:before:bg-foreground [&>li]:before:content-['']";

/** Numbered steps in outlined squares, drawn with a CSS counter. */
const stepList =
  "space-y-5 [counter-reset:step] [&>li]:relative [&>li]:min-h-8 [&>li]:pl-11 [&>li]:[counter-increment:step] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-0.5 [&>li]:before:flex [&>li]:before:size-7 [&>li]:before:items-center [&>li]:before:justify-center [&>li]:before:border [&>li]:before:border-foreground [&>li]:before:font-mono [&>li]:before:text-xs [&>li]:before:content-[counter(step)]";

/** Plain text of rendered markdown children, for heading ids. */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

interface BlogViewProps {
  blog: Blog;
  className?: string;
}

export function BlogView({ blog, className }: BlogViewProps) {
  const t = useTranslations("Blog");
  const locale = useLocale();
  const [imageSrc, setImageSrc] = useState(blog.featuredImage || FALLBACK_IMAGE);
  const headings = useMemo(() => getBlogHeadings(blog.content), [blog.content]);

  const readingTime =
    blog.readingTime ??
    Math.max(1, Math.round(blog.content.split(/\s+/).length / 200));
  const languageName =
    BLOG_LANGUAGE_NAMES[blog.language as keyof typeof BLOG_LANGUAGE_NAMES] ||
    blog.language.toUpperCase();

  return (
    <>
      <BlogProgressBar />

      <article className={className}>
        {/* Header */}
        <header>
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("allPosts")}
            </Link>
            <BlogCopyLinkButton />
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
            {blog.publishedAt && (
              <time dateTime={new Date(blog.publishedAt).toISOString()}>
                {new Date(blog.publishedAt).toLocaleDateString(locale, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </time>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {t("minutesToRead", { count: readingTime })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3.5" aria-hidden="true" />
              {t("views", { count: blog.readCount })}
            </span>
            <span className={cn(chip, "py-0.5 uppercase tracking-wider")}>
              {languageName}
            </span>
            {blog.isFeatured && (
              <span className="bg-foreground px-2 py-0.5 uppercase tracking-wider text-background">
                {t("featured")}
              </span>
            )}
          </div>

          <h1 className="max-w-4xl text-[clamp(2.25rem,1.5rem+2.4vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance">
            {blog.title}
          </h1>
          {blog.excerpt && (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
              {blog.excerpt}
            </p>
          )}

          {(blog.category || (blog.tags && blog.tags.length > 0)) && (
            <ul
              className="mt-6 flex flex-wrap gap-2 text-muted-foreground"
              aria-label={t("topics")}
            >
              {blog.category && <li className={chip}>{blog.category.name}</li>}
              {blog.tags?.map((tagRelation) => (
                <li key={tagRelation.id} className={chip}>
                  {tagRelation.tag?.name}
                </li>
              ))}
            </ul>
          )}

          <div className="relative mt-10 aspect-[21/9] overflow-hidden border border-border bg-surface">
            <Image
              src={imageSrc}
              alt={blog.title}
              fill
              priority
              sizes="(min-width: 1152px) 72rem, 100vw"
              className="object-cover"
              onError={() => setImageSrc(FALLBACK_IMAGE)}
            />
          </div>
        </header>

        <div
          className={cn(
            "mt-14 grid gap-12",
            headings.length > 0 && "lg:grid-cols-[minmax(0,1fr)_14rem]",
          )}
        >
          {/* Content */}
          <div id={BLOG_BODY_ID} className="min-w-0 max-w-3xl space-y-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeHighlight, rehypeRaw]}
              components={{
                h1: ({ children }) => (
                  <h2 className="pt-6 text-3xl font-bold tracking-tight text-balance">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => {
                  const id = slugifyHeading(textOf(children));
                  return (
                    <h2
                      id={id}
                      className="scroll-mt-24 pt-8 text-2xl font-semibold tracking-tight text-balance md:text-3xl"
                    >
                      <a
                        href={`#${id}`}
                        className="group inline-flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                      >
                        {children}
                        <Link2
                          className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                          aria-hidden="true"
                        />
                        <span className="sr-only">{t("linkToSection")}</span>
                      </a>
                    </h2>
                  );
                },
                h3: ({ children }) => (
                  <h3 className="pt-4 text-xl font-semibold tracking-tight">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="pt-2 text-lg font-semibold">{children}</h4>
                ),
                h5: ({ children }) => (
                  <h5 className="text-base font-semibold">{children}</h5>
                ),
                h6: ({ children }) => (
                  <h6 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {children}
                  </h6>
                ),

                p: ({ children }) => <p className={bodyText}>{children}</p>,

                // Fenced blocks carry a language class; everything else is inline
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  if (!className?.includes("language-")) {
                    return (
                      <code className="border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.85em]">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <div className="relative border border-border">
                      {match && (
                        <div className="absolute top-0 right-0 border-b border-l border-border bg-surface-2 px-2 py-1 font-mono text-xs text-muted-foreground">
                          {match[1]}
                        </div>
                      )}
                      <pre className="overflow-x-auto bg-surface p-4 text-sm leading-6">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                },
                pre: ({ children }) => <div>{children}</div>,

                ul: ({ className, children }) =>
                  className?.includes("contains-task-list") ? (
                    <BlogTaskList>{children}</BlogTaskList>
                  ) : (
                    <ul className={bulletList}>{children}</ul>
                  ),
                ol: ({ children }) => <ol className={stepList}>{children}</ol>,
                li: ({ className, children }) => {
                  if (!className?.includes("task-list-item")) {
                    return <li className={bodyText}>{children}</li>;
                  }
                  // GFM puts the checkbox first; keep the rest as one flex item
                  const [box, ...text] = Children.toArray(children);
                  return (
                    <li>
                      <label className="flex cursor-pointer items-start gap-3 p-2 leading-7 text-foreground/90 transition-colors hover:bg-surface-2 has-[:checked]:text-muted-foreground has-[:checked]:line-through has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-foreground">
                        {box}
                        <span>{text}</span>
                      </label>
                    </li>
                  );
                },
                // GFM renders task boxes disabled; make them tickable
                input: ({ type, checked }) =>
                  type === "checkbox" ? (
                    <input
                      type="checkbox"
                      defaultChecked={checked}
                      className="mt-1.5 size-4 shrink-0 cursor-pointer accent-foreground"
                    />
                  ) : null,

                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-foreground pl-5 italic [&_p]:text-muted-foreground">
                    {children}
                  </blockquote>
                ),

                a: ({ children, href }) => {
                  const external = href?.startsWith("http");
                  return (
                    <a
                      href={href}
                      className="font-medium underline decoration-1 underline-offset-4 transition-all hover:decoration-2"
                      {...(external && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })}
                    >
                      {children}
                    </a>
                  );
                },

                table: ({ children }) => (
                  <div className="overflow-x-auto border border-border">
                    <table className="w-full min-w-[34rem] text-left text-sm [&_tbody_tr]:border-t [&_tbody_tr]:border-border [&_td:first-child]:font-medium [&_td:first-child]:text-foreground [&_td:first-child_code]:whitespace-nowrap">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-surface">{children}</thead>
                ),
                th: ({ children }) => (
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3.5 leading-6 text-muted-foreground">
                    {children}
                  </td>
                ),

                hr: () => <hr className="my-12 border-border" />,

                img: ({ src, alt }) => {
                  if (!src || typeof src !== "string") return null;
                  return (
                    <span className="block">
                      <Image
                        src={src}
                        alt={alt || ""}
                        width={1200}
                        height={675}
                        className="h-auto w-full border border-border bg-surface"
                      />
                      {alt && (
                        <span className="mt-2 block text-center text-sm text-muted-foreground">
                          {alt}
                        </span>
                      )}
                    </span>
                  );
                },

                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {blog.content}
            </ReactMarkdown>
          </div>

          {headings.length > 0 && (
            <BlogSectionRail headings={headings} readingTime={readingTime} />
          )}
        </div>

        <footer className="mt-20 max-w-3xl space-y-10 border-t border-border pt-10">
          {blog.credits && (
            <section aria-labelledby="blog-credits" className="bg-surface p-6">
              <h2
                id="blog-credits"
                className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground"
              >
                {t("credits.title")}
              </h2>
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
                {(
                  [
                    ["originalAuthor", blog.credits.originalAuthor],
                    ["source", blog.credits.originalSource],
                    ["license", blog.credits.licenseType],
                    ["translatedFrom", blog.credits.translatedFrom],
                    ["adaptedFrom", blog.credits.adaptedFrom],
                  ] as const
                ).map(
                  ([key, value]) =>
                    value && (
                      <div key={key} className="contents">
                        <dt className="font-semibold">{t(`credits.${key}`)}</dt>
                        <dd className="text-muted-foreground">{value}</dd>
                      </div>
                    ),
                )}
                {blog.credits.sourceUrl && (
                  <div className="contents">
                    <dt className="font-semibold">{t("credits.url")}</dt>
                    <dd>
                      <a
                        href={blog.credits.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all underline underline-offset-4"
                      >
                        {blog.credits.sourceUrl}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              {blog.credits.creditText && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {blog.credits.creditText}
                </p>
              )}
            </section>
          )}

          <div className="space-y-5">
            <p className="text-muted-foreground">{t("shareLead")}</p>
            <BlogPostActions title={blog.title} />
          </div>
        </footer>
      </article>
    </>
  );
}
