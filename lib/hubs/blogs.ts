/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import { cache } from "react";
import type { Blog, BlogListQuery, BlogListResponse } from "@/types/hubs/blogs";
import { prisma } from "@/lib/configs/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { sanitizeInput } from "@/lib/security";

/**
 * Get all published blogs
 */
export async function getBlogs(
  query?: BlogListQuery,
): Promise<BlogListResponse> {
  const {
    page = 1,
    limit = 12,
    published,
    featured,
    search,
    language,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query || {};

  const where: Prisma.BlogWhereInput = {};

  if (published === true) {
    where.isPublished = true;
  }

  if (featured !== undefined) {
    where.isFeatured = featured;
  }

  if (search) {
    const sanitizedSearch = sanitizeInput(search);
    where.OR = [
      { title: { contains: sanitizedSearch, mode: "insensitive" } },
      { excerpt: { contains: sanitizedSearch, mode: "insensitive" } },
      { content: { contains: sanitizedSearch, mode: "insensitive" } },
    ];
  }

  if (language) {
    where.language = language;
  }

  const orderBy: Prisma.BlogOrderByWithRelationInput = {
    [sortBy]: sortOrder,
  };

  try {
    // Get total count for pagination
    const total = await prisma.blog.count({ where });

    // Get blogs with relations
    const blogs = await prisma.blog.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        credits: true,
      },
    });

    return {
      blogs: blogs as Blog[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
      filters: {
        categories: [],
        tags: [],
      },
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);

    return {
      blogs: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      filters: {
        categories: [],
        tags: [],
      },
    };
  }
}

/**
 * Get a single blog by slug and count the read.
 *
 * Wrapped in `cache()` below so a page render that resolves the blog in both
 * `generateMetadata` and the page body counts a single view, not two.
 */
async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
  if (!slug || typeof slug !== "string") {
    return null;
  }

  // Basic slug validation - only allow letters, numbers, hyphens
  const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
  if (!sanitizedSlug || sanitizedSlug.length === 0) {
    return null;
  }

  try {
    const blog = await prisma.blog.findFirst({
      where: {
        slug: sanitizedSlug,
        isPublished: true,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        credits: true,
      },
    });

    if (blog) {
      // Increment read count via raw SQL: a Prisma update would also stamp the
      // `@updatedAt` field, making every visitor read look like a content edit.
      try {
        await prisma.$executeRaw`UPDATE blogs SET "readCount" = "readCount" + 1 WHERE id = ${blog.id}`;

        // Return the blog with incremented read count
        return { ...blog, readCount: blog.readCount + 1 } as Blog;
      } catch (updateError) {
        console.error("Error updating read count:", updateError);
        return blog as Blog;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return null;
  }
}

/**
 * Get a single blog by slug (per-request deduplicated)
 */
export const getBlogBySlug = cache(fetchBlogBySlug);

/**
 * Get featured blogs
 */
export async function getFeaturedBlogs(limit: number = 3): Promise<Blog[]> {
  const response = await getBlogs({ featured: true, limit });
  return response.blogs;
}
