/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useState } from "react";
import { BlogsList, LanguageFilter, BlogBreadcrumb } from "@/components/blog";
import { LoadingSkeleton, SectionHeading } from "@/components/visuals";
import type { Blog, BlogLanguage } from "@/types/hubs/blogs";

interface BlogApiResponse {
  blogs: Blog[];
}

interface BlogPageClientProps {
  initialBlogs: Blog[];
}

export function BlogPageClient({ initialBlogs }: BlogPageClientProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [selectedLanguage, setSelectedLanguage] = useState<
    BlogLanguage | "all"
  >("all");
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (language: BlogLanguage | "all") => {
    setSelectedLanguage(language);
    setIsLoading(true);

    const fetchBlogs = async () => {
      try {
        const params = new URLSearchParams();
        if (language !== "all") {
          params.append("language", language);
        }

        const apiUrl = `/api/blog?${params.toString()}`;

        const response = await fetch(apiUrl);

        if (response.ok) {
          const data = (await response.json()) as BlogApiResponse;
          setBlogs(data.blogs);
        } else {
          console.error(
            "Blog API error:",
            response.status,
            response.statusText
          );
          // Fallback to client-side filtering
          if (language === "all") {
            setBlogs(initialBlogs);
          } else {
            setBlogs(initialBlogs.filter((blog) => blog.language === language));
          }
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        // Fallback to client-side filtering
        if (language === "all") {
          setBlogs(initialBlogs);
        } else {
          setBlogs(initialBlogs.filter((blog) => blog.language === language));
        }
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBlogs();
  };

  return (
    <div className="frame pt-4 pb-16 sm:pt-6 md:pt-10 md:pb-24">
      {/* Breadcrumb Navigation */}
      <BlogBreadcrumb className="mb-8" />

      <SectionHeading
        as="h1"
        title="Blogs"
        lead="Personal thoughts, tutorials, insights, and stories about various topics."
        className="mb-10"
      />

      {/* Language Filter */}
      <div
        role="group"
        aria-labelledby="blog-language-filter"
        className="mb-8 flex flex-col gap-3"
      >
        <p
          id="blog-language-filter"
          className="text-sm font-semibold text-muted-foreground"
        >
          Filter by Language:
        </p>
        <LanguageFilter
          selectedLanguage={selectedLanguage}
          onLanguageChange={handleLanguageChange}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3" aria-busy>
          {Array.from({ length: 3 }, (_, i) => (
            <LoadingSkeleton key={i} variant="blog" />
          ))}
        </div>
      ) : (
        <BlogsList blogs={blogs} />
      )}
    </div>
  );
}
