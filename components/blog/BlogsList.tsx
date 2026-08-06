/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Languages } from "lucide-react";
import type { Blog } from "@/types/hubs/blogs";
import { BLOG_LANGUAGE_NAMES } from "@/types/hubs/blogs";
import { LanguageBadge } from "@/components/blog";
import Image from "next/image";

interface BlogCardProps {
  blog: Blog;
  index: number;
}

function BlogCard({ blog, index }: BlogCardProps) {
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
    <Link href={`/blog/${blog.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        {(blog.featuredImage || imageSrc) && (
          <div className="w-full h-48 bg-muted rounded-t-lg overflow-hidden">
            <Image
              src={imageSrc}
              alt={blog.title}
              width={500}
              height={300}
              className="w-full h-full object-cover"
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
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            {blog.publishedAt
              ? new Date(blog.publishedAt).toLocaleDateString()
              : "Draft"}
            {blog.readingTime && (
              <>
                <Clock className="h-4 w-4 ml-2" aria-hidden="true" />
                {blog.readingTime} min read
              </>
            )}
            {blog.language && (
              <>
                <Languages className="h-4 w-4 ml-2" aria-hidden="true" />
                <span className="text-xs font-medium">
                  {BLOG_LANGUAGE_NAMES[
                    blog.language as keyof typeof BLOG_LANGUAGE_NAMES
                  ] || blog.language.toUpperCase()}
                </span>
              </>
            )}
          </div>
          <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
          {blog.excerpt && (
            <CardDescription className="line-clamp-3">
              {blog.excerpt}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {blog.isFeatured && (
              <Badge style={{ backgroundColor: "#15803d", color: "white" }}>
                Featured
              </Badge>
            )}
            {blog.language && blog.language !== "en" && (
              <LanguageBadge language={blog.language} size="sm" />
            )}
            {blog.category && (
              <Badge variant="outline">{blog.category.name}</Badge>
            )}
            {blog.tags?.slice(0, 2).map((tagRelation) => (
              <Badge key={tagRelation.id} variant="outline">
                {tagRelation.tag?.name}
              </Badge>
            ))}
            {blog.tags && blog.tags.length > 2 && (
              <Badge variant="outline">+{blog.tags.length - 2}</Badge>
            )}
            {blog.credits?.licenseType && (
              <Badge variant="secondary" className="text-xs">
                {blog.credits.licenseType}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface BlogsListProps {
  blogs: Blog[];
  className?: string;
}

export function BlogsList({ blogs, className }: BlogsListProps) {
  if (blogs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">No blogs found.</p>
          <p className="text-sm text-muted-foreground">
            Check back soon for new articles and insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {blogs.map((blog, index) => (
        <BlogCard key={blog.id} blog={blog} index={index} />
      ))}
    </div>
  );
}
