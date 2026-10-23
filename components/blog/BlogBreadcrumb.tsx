/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SquareLibrary } from "lucide-react";
import type { Blog } from "@/types/hubs/blogs";

interface BlogBreadcrumbProps {
  /**
   * Current blog data when viewing a specific blog
   */
  blog?: Blog;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function BlogBreadcrumb({ blog, className }: BlogBreadcrumbProps) {
  const pathname = usePathname();
  const isBlogList = pathname === "/blog";
  const isBlogPost = pathname.startsWith("/blog/") && blog;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {/* Blogs */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/blog"
              className="flex items-center gap-1.5"
              aria-label="Go to home page"
            >
              <SquareLibrary className="h-4 w-4" />
              Blogs
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {/* Blog Section */}
        {isBlogList ? (
          <BreadcrumbItem>
            <BreadcrumbPage>Blogs</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            {isBlogPost && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage
                    className="max-w-50 truncate"
                    title={blog.title}
                  >
                    {blog.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
