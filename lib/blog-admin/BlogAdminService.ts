/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type {
  Blog,
  CreateBlogRequest,
  UpdateBlogRequest,
  BlogListQuery,
  BlogListResponse,
} from "@/types/hubs/blogs";
import type { BlogAdminStats } from "@/types/main/admin";
import { RateLimiter } from "@/lib/security";
import {
  BlogValidationService,
  type AdminContext,
} from "@/lib/blog-admin/BlogValidationService";
import { BlogUtilityService } from "@/lib/blog-admin/BlogUtilityService";
import { BlogQueryService } from "@/lib/blog-admin/BlogQueryService";

// Rate limiter for admin operations
const adminRateLimiter = new RateLimiter(60000, 100);

export class BlogAdminService {
  /**
   * Get admin statistics
   */
  static async getBlogAdminStats(
    context: AdminContext
  ): Promise<BlogAdminStats> {
    BlogValidationService.validateAdminAccess(context);

    try {
      return await BlogQueryService.getBlogAdminStats();
    } catch (error) {
      BlogUtilityService.handleBlogError(error, "fetch blog statistics");
    }
  }

  /**
   * Get all blogs for admin (including drafts)
   */
  static async getAdminBlogs(
    context: AdminContext,
    query?: BlogListQuery
  ): Promise<BlogListResponse> {
    BlogValidationService.validateAdminAccess(context);

    try {
      return await BlogQueryService.getAdminBlogs(query);
    } catch (error) {
      BlogUtilityService.handleBlogError(error, "fetch blogs");
    }
  }

  /**
   * Create a new blog
   */
  static async createBlog(
    context: AdminContext,
    data: CreateBlogRequest
  ): Promise<Blog> {
    BlogValidationService.validateAdminAccess(context);

    // Validate input
    const errors = BlogValidationService.validateBlogData(data);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(", ")}`);
    }

    try {
      return await BlogQueryService.createBlog(data);
    } catch (error) {
      BlogUtilityService.handleBlogError(error, "create blog");
    }
  }

  /**
   * Update an existing blog
   */
  static async updateBlog(
    context: AdminContext,
    id: string,
    data: UpdateBlogRequest
  ): Promise<Blog> {
    BlogValidationService.validateAdminAccess(context);

    // Validate input
    const errors = BlogValidationService.validateBlogData(data);
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(", ")}`);
    }

    try {
      return await BlogQueryService.updateBlog(id, data);
    } catch (error) {
      BlogUtilityService.handleBlogError(error, "update blog");
    }
  }

  /**
   * Delete a blog
   */
  static async deleteBlog(context: AdminContext, id: string): Promise<void> {
    BlogValidationService.validateAdminAccess(context);

    try {
      await BlogQueryService.deleteBlog(id);
    } catch (error) {
      BlogUtilityService.handleBlogError(error, "delete blog");
    }
  }

  /**
   * Get a blog by ID for admin
   */
  static async getAdminBlogById(
    context: AdminContext,
    id: string
  ): Promise<Blog | null> {
    BlogValidationService.validateAdminAccess(context);

    try {
      return await BlogQueryService.getAdminBlogById(id);
    } catch (error) {
      BlogUtilityService.handleBlogError(error, "fetch blog");
    }
  }

  /**
   * Check rate limit for admin operations
   */
  static checkAdminRateLimit(clientIP: string): boolean {
    return adminRateLimiter.isAllowed(clientIP);
  }

  /**
   * Get all categories for admin forms
   */
  static async getAdminCategories(context: AdminContext) {
    BlogValidationService.validateAdminAccess(context);

    try {
      return await BlogQueryService.getAdminCategories();
    } catch (error) {
      BlogUtilityService.handleBlogError(error, "fetch categories");
    }
  }
}

// Export the AdminContext type for use in API routes
export type { AdminContext };
