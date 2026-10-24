/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { prisma } from "@/lib/configs/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type {
  Blog,
  CreateBlogRequest,
  UpdateBlogRequest,
  BlogListQuery,
  BlogListResponse,
} from "@/types/hubs/blogs";
import type { BlogAdminStats, BlogActivityItem } from "@/types/main/admin";
import { sanitizeInput } from "@/lib/security";
import { BlogUtilityService } from "@/lib/blog-admin/BlogUtilityService";

export class BlogQueryService {
  /**
   * Get admin statistics
   */
  static async getBlogAdminStats(): Promise<BlogAdminStats> {
    const [totalBlogs, publishedBlogs, draftBlogs, featuredBlogs, recentBlogs] =
      await Promise.all([
        prisma.blog.count(),
        prisma.blog.count({ where: { isPublished: true } }),
        prisma.blog.count({ where: { isDraft: true } }),
        prisma.blog.count({ where: { isFeatured: true } }),
        prisma.blog.findMany({
          orderBy: { updatedAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            slug: true,
            isPublished: true,
            updatedAt: true,
          },
        }),
      ]);

    // Calculate total views (sum of readCount)
    const totalViews = await prisma.blog.aggregate({
      _sum: {
        readCount: true,
      },
    });

    const recentActivity: BlogActivityItem[] = recentBlogs.map((blog) => ({
      id: blog.id,
      action: blog.isPublished ? "published" : "updated",
      blogTitle: blog.title,
      blogSlug: blog.slug,
      timestamp: blog.updatedAt,
    }));

    return {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      featuredBlogs,
      totalViews: totalViews._sum.readCount || 0,
      recentActivity,
    };
  }

  /**
   * Get all blogs for admin (including drafts)
   */
  static async getAdminBlogs(query?: BlogListQuery): Promise<BlogListResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      language,
      published,
      featured,
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = query || {};

    const where: Prisma.BlogWhereInput = {};

    if (published !== undefined) {
      where.isPublished = published;
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    if (search) {
      // Sanitize search input
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

    const [total, blogs] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
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
      }),
    ]);

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
  }

  /**
   * Create a new blog
   */
  static async createBlog(data: CreateBlogRequest): Promise<Blog> {
    // Sanitize all text content
    const sanitizedFields = BlogUtilityService.sanitizeBlogData(data);
    const sanitizedData = {
      ...data,
      title: sanitizedFields.title!,
      content: sanitizedFields.content!,
      excerpt: sanitizedFields.excerpt ?? null,
      metaTitle: sanitizedFields.metaTitle ?? null,
      metaDescription: sanitizedFields.metaDescription ?? null,
    };

    // Generate slug if not provided
    let slug =
      sanitizedData.slug ||
      BlogUtilityService.generateSlug(sanitizedData.title);
    slug = await BlogUtilityService.ensureUniqueSlug(slug);

    // Calculate reading time
    const readingTime = BlogUtilityService.calculateReadingTime(
      sanitizedData.content
    );

    const blog = await prisma.blog.create({
      data: {
        title: sanitizedData.title,
        slug,
        excerpt: sanitizedData.excerpt,
        content: sanitizedData.content,
        featuredImage: data.featuredImage || null,
        language: data.language || "en",
        metaTitle: sanitizedData.metaTitle,
        metaDescription: sanitizedData.metaDescription,
        isPublished: data.isPublished || false,
        isFeatured: data.isFeatured || false,
        isDraft: !data.isPublished,
        readingTime,
        publishedAt: data.isPublished ? new Date() : null,
        // Handle relations if needed
        ...(data.categoryId && {
          category: {
            connect: { id: data.categoryId },
          },
        }),
        ...(data.credits && {
          credits: {
            create: BlogUtilityService.sanitizeCreditsData(data.credits),
          },
        }),
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

    return blog as Blog;
  }

  /**
   * Update an existing blog
   */
  static async updateBlog(id: string, data: UpdateBlogRequest): Promise<Blog> {
    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        readingTime: true,
        isPublished: true,
        publishedAt: true,
      },
    });
    if (!existingBlog) {
      throw new Error("Blog not found");
    }

    // Sanitize all text content
    const sanitizedData = {
      ...data,
      ...BlogUtilityService.sanitizeBlogData(data),
    };

    // Handle slug update
    let slug = data.slug;
    if (slug && slug !== existingBlog.slug) {
      slug = await BlogUtilityService.ensureUniqueSlug(slug, id);
    }

    // Calculate reading time if content changed
    let readingTime = existingBlog.readingTime;
    if (sanitizedData.content) {
      readingTime = BlogUtilityService.calculateReadingTime(
        sanitizedData.content
      );
    }

    // Handle publish status change
    let publishedAt = existingBlog.publishedAt;
    if (data.isPublished && !existingBlog.isPublished) {
      publishedAt = new Date();
    } else if (data.isPublished === false) {
      publishedAt = null;
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        ...(sanitizedData.title && { title: sanitizedData.title }),
        ...(slug && { slug }),
        ...(sanitizedData.excerpt !== undefined && {
          excerpt: sanitizedData.excerpt,
        }),
        ...(sanitizedData.content && { content: sanitizedData.content }),
        ...(data.featuredImage !== undefined && {
          featuredImage: data.featuredImage,
        }),
        ...(data.language && { language: data.language }),
        ...(sanitizedData.metaTitle !== undefined && {
          metaTitle: sanitizedData.metaTitle,
        }),
        ...(sanitizedData.metaDescription !== undefined && {
          metaDescription: sanitizedData.metaDescription,
        }),
        ...(data.isPublished !== undefined && {
          isPublished: data.isPublished,
        }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isDraft !== undefined && { isDraft: data.isDraft }),
        ...(data.categoryId !== undefined && {
          category: data.categoryId
            ? { connect: { id: data.categoryId } }
            : { disconnect: true },
        }),
        readingTime,
        publishedAt,
        updatedAt: new Date(),
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

    // Handle credits separately due to upsert complexity
    if (data.credits) {
      const sanitizedCredits = BlogUtilityService.sanitizeCreditsData(
        data.credits
      );

      await prisma.blogCredit.upsert({
        where: { blogId: id },
        update: sanitizedCredits,
        create: {
          blogId: id,
          ...sanitizedCredits,
        },
      });
    }

    return blog as Blog;
  }

  /**
   * Delete a blog
   */
  static async deleteBlog(id: string): Promise<void> {
    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existingBlog) {
      throw new Error("Blog not found");
    }

    // Delete related data first (using transaction for consistency)
    await prisma.$transaction([
      prisma.blogTagRelation.deleteMany({ where: { blogId: id } }),
      prisma.blogCredit.deleteMany({ where: { blogId: id } }),
      prisma.blog.delete({ where: { id } }),
    ]);
  }

  /**
   * Get a blog by ID for admin
   */
  static async getAdminBlogById(id: string): Promise<Blog | null> {
    const blog = await prisma.blog.findUnique({
      where: { id },
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

    return blog as Blog | null;
  }

  /**
   * Get all categories for admin forms
   */
  static async getAdminCategories() {
    const categories = await prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
      },
    });
    return categories;
  }

  /**
   * Get all tags for admin forms
   */
  static async getAdminTags() {
    const tags = await prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return tags;
  }
}
