/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Calendar, Clock, Languages } from "lucide-react";
import type { Blog } from "@/types/hubs/blogs";
import { BLOG_LANGUAGE_NAMES } from "@/types/hubs/blogs";
import { cardSurface } from "@/components/visuals";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BlogCardProps {
  blog: Blog;
  index: number;
}

function BlogCard({ blog, index }: BlogCardProps) {
  const t = useTranslations("Blog");
  const locale = useLocale();
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
    <article className={cn(cardSurface, "h-full overflow-hidden")}>
      <Link
        href={`/blog/${blog.slug}`}
        className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        {(blog.featuredImage || imageSrc) && (
          <div className="h-48 w-full overflow-hidden bg-surface-2">
            <Image
              src={imageSrc}
              alt={blog.title}
              width={500}
              height={300}
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.02] motion-reduce:transition-none"
              onError={handleImageError}
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              quality={80}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/80">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            {blog.publishedAt
              ? new Date(blog.publishedAt).toLocaleDateString(locale, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : t("draft")}
            {blog.readingTime && (
              <>
                <Clock className="ml-2 h-4 w-4" aria-hidden="true" />
                {t("minutesToRead", { count: blog.readingTime })}
              </>
            )}
            {blog.language && (
              <>
                <Languages className="ml-2 h-4 w-4" aria-hidden="true" />
                <span className="text-xs font-medium">
                  {BLOG_LANGUAGE_NAMES[
                    blog.language as keyof typeof BLOG_LANGUAGE_NAMES
                  ] || blog.language.toUpperCase()}
                </span>
              </>
            )}
          </div>
          <h2 className="mt-8 line-clamp-2 text-2xl font-semibold leading-tight tracking-[-0.01em]">
            {blog.title}
          </h2>
          {blog.excerpt && (
            <p className="mt-4 line-clamp-3 leading-relaxed text-foreground/80">
              {blog.excerpt}
            </p>
          )}
          <div className="mt-auto flex flex-wrap gap-2 pt-8 text-xs font-semibold">
            {blog.isFeatured && (
              <span className="bg-foreground px-2 py-1 text-background">
                {t("featured")}
              </span>
            )}
            {blog.category && (
              <span className="bg-background px-2 py-1">
                {blog.category.name}
              </span>
            )}
            {blog.tags?.slice(0, 2).map((tagRelation) => (
              <span key={tagRelation.id} className="bg-background px-2 py-1">
                {tagRelation.tag?.name}
              </span>
            ))}
            {blog.tags && blog.tags.length > 2 && (
              <span className="bg-background px-2 py-1">
                +{blog.tags.length - 2}
              </span>
            )}
            {blog.credits?.licenseType && (
              <span className="bg-background px-2 py-1">
                {blog.credits.licenseType}
              </span>
            )}
          </div>
        </div>
      </Link>
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
    <div className={cn("grid gap-2 md:grid-cols-2 lg:grid-cols-3", className)}>
      {blogs.map((blog, index) => (
        <BlogCard key={blog.id} blog={blog} index={index} />
      ))}
    </div>
  );
}
