/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Eye, Languages } from "lucide-react";
import type { Blog } from "@/types/hubs/blogs";
import { BLOG_LANGUAGE_NAMES } from "@/types/hubs/blogs";
import { LanguageBadge } from "@/components/blog";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import "highlight.js/styles/github-dark.css";

/** Square tags; `rounded-none` overrides the Shadcn badge corners. */
const tag = "rounded-none border-0 bg-surface";

interface BlogViewProps {
  blog: Blog;
  className?: string;
}

export function BlogView({ blog, className }: BlogViewProps) {
  const [imageSrc, setImageSrc] = useState(
    blog.featuredImage || "/assets/blogs/blogsFallback.png",
  );
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    if (!imageError && imageSrc !== "/assets/blogs/blogsFallback.png") {
      setImageError(true);
      setImageSrc("/assets/blogs/blogsFallback.png");
    }
  };
  return (
    <article className={className}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-6 text-[clamp(2.25rem,1.5rem+2.4vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.03em] text-balance">
          {blog.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          {blog.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {new Date(blog.publishedAt).toLocaleDateString()}
            </div>
          )}
          {blog.readingTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {blog.readingTime} min read
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" aria-hidden="true" />
            {blog.readCount} views
          </div>
          {blog.language && (
            <div className="flex items-center gap-1">
              <Languages className="h-4 w-4" aria-hidden="true" />
              {BLOG_LANGUAGE_NAMES[
                blog.language as keyof typeof BLOG_LANGUAGE_NAMES
              ] || blog.language.toUpperCase()}
            </div>
          )}
        </div>

        {/* Tags and Category */}
        <div className="flex flex-wrap gap-2 mb-6">
          {blog.isFeatured && (
            <Badge
              className="rounded-none"
              style={{ backgroundColor: "#15803d", color: "white" }}
            >
              Featured
            </Badge>
          )}
          {blog.language && blog.language !== "en" && (
            <LanguageBadge
              language={blog.language}
              showIcon={true}
              className={tag}
            />
          )}
          {blog.category && (
            <Badge variant="outline" className={tag}>
              {blog.category.name}
            </Badge>
          )}
          {blog.tags?.map((tagRelation) => (
            <Badge key={tagRelation.id} variant="outline" className={tag}>
              {tagRelation.tag?.name}
            </Badge>
          ))}
        </div>

        {/* Featured Image */}
        {(blog.featuredImage || imageSrc) && (
          <div className="mb-6 h-64 w-full overflow-hidden bg-surface md:h-96">
            <Image
              src={imageSrc}
              alt={blog.title}
              width={500}
              height={500}
              className="w-full h-full object-cover"
              onError={handleImageError}
              priority={false}
            />
          </div>
        )}

        <Separator />
      </div>

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight, rehypeRaw]}
          components={{
            // Headers
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold mb-6 mt-8 text-foreground border-b border-border pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold mb-4 mt-8 text-foreground border-b border-border pb-1">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold mb-3 mt-6 text-foreground">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-lg font-semibold mb-2 mt-4 text-foreground">
                {children}
              </h4>
            ),
            h5: ({ children }) => (
              <h5 className="text-base font-semibold mb-2 mt-3 text-foreground">
                {children}
              </h5>
            ),
            h6: ({ children }) => (
              <h6 className="text-sm font-semibold mb-2 mt-3 text-foreground">
                {children}
              </h6>
            ),

            // Paragraphs and text
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed text-foreground">{children}</p>
            ),

            // Code blocks and inline code
            code: ({ className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || "");
              const isCodeBlock = className?.includes("language-");

              return isCodeBlock ? (
                <div className="relative mb-4">
                  {match && (
                    <div className="absolute top-0 right-0 bg-surface-2 px-2 py-1 text-xs text-muted-foreground">
                      {match[1]}
                    </div>
                  )}
                  <pre className="overflow-x-auto bg-surface p-4">
                    <code {...props}>
                      <span>{children}</span>
                    </code>
                  </pre>
                </div>
              ) : (
                <code
                  className="bg-surface px-1.5 py-0.5 text-sm font-mono text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            },

            // Pre elements for code blocks
            pre: ({ children }) => <div className="mb-4">{children}</div>,

            // Lists
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-1 pl-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-1 pl-4">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-foreground leading-relaxed">{children}</li>
            ),

            // Blockquotes
            blockquote: ({ children }) => (
              <blockquote className="my-4 border-l-4 border-primary bg-surface py-2 pl-4 italic">
                {children}
              </blockquote>
            ),

            // Links
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-primary hover:text-primary/80 underline decoration-1 underline-offset-2 hover:decoration-2 transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),

            // Tables
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-border">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-border bg-surface px-3 py-2 text-left font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-border px-3 py-2">{children}</td>
            ),

            // Horizontal rule
            hr: () => <hr className="my-8 border-border" />,

            // Images
            img: ({ src, alt }) => {
              if (!src) return null;

              return (
                <div className="my-6">
                  <Image
                    src={typeof src === "string" ? src : ""}
                    alt={alt || ""}
                    width={800}
                    height={400}
                    className="h-auto w-full bg-surface"
                  />
                  {alt && (
                    <p className="text-sm text-muted-foreground text-center mt-2 italic">
                      {alt}
                    </p>
                  )}
                </div>
              );
            },

            // Strong and emphasis
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-foreground">{children}</em>
            ),
          }}
        >
          {blog.content}
        </ReactMarkdown>
      </div>

      {/* Credits */}
      {blog.credits && (
        <>
          <Separator className="mb-6" />
          <Card className="gap-4 rounded-none border-0 bg-surface py-6 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Credits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {blog.credits.originalAuthor && (
                <p>
                  <strong>Original Author:</strong>{" "}
                  {blog.credits.originalAuthor}
                </p>
              )}
              {blog.credits.originalSource && (
                <p>
                  <strong>Source:</strong> {blog.credits.originalSource}
                </p>
              )}
              {blog.credits.sourceUrl && (
                <p>
                  <strong>URL:</strong>{" "}
                  <a
                    href={blog.credits.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-semibold underline underline-offset-4"
                  >
                    {blog.credits.sourceUrl}
                  </a>
                </p>
              )}
              {blog.credits.licenseType && (
                <p>
                  <strong>License:</strong> {blog.credits.licenseType}
                </p>
              )}
              {blog.credits.translatedFrom && (
                <p>
                  <strong>Translated from:</strong>{" "}
                  {blog.credits.translatedFrom}
                </p>
              )}
              {blog.credits.adaptedFrom && (
                <p>
                  <strong>Adapted from:</strong> {blog.credits.adaptedFrom}
                </p>
              )}
              {blog.credits.creditText && (
                <p className="text-sm text-muted-foreground">
                  {blog.credits.creditText}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </article>
  );
}
