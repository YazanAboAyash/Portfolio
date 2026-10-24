/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { CreateBlogRequest, UpdateBlogRequest } from "@/types/hubs/blogs";
import { BLOG_CONSTANTS } from "@/types/hubs/blogs";
import { RateLimiter } from "@/lib/security";

// Rate limiter for admin operations
const adminRateLimiter = new RateLimiter(60000, 100);

// Authentication context interface
interface AdminContext {
  clientIP: string;
  isAuthenticated: boolean;
  userAgent?: string | undefined;
}

export class BlogValidationService {
  /**
   * Validate admin authentication and rate limits
   */
  static validateAdminAccess(context: AdminContext): void {
    if (!context.isAuthenticated) {
      throw new Error("Unauthorized: Admin access required");
    }

    if (!adminRateLimiter.isAllowed(context.clientIP)) {
      throw new Error("Rate limit exceeded");
    }
  }

  /**
   * Validate blog data
   */
  static validateBlogData(
    data: CreateBlogRequest | UpdateBlogRequest
  ): string[] {
    const errors: string[] = [];

    if ("title" in data && data.title) {
      if (data.title.length < 3) {
        errors.push("Title must be at least 3 characters long");
      }
      if (data.title.length > BLOG_CONSTANTS.MAX_TITLE_LENGTH) {
        errors.push(
          `Title must be less than ${BLOG_CONSTANTS.MAX_TITLE_LENGTH} characters`
        );
      }
    }

    if ("content" in data && data.content) {
      if (data.content.length < BLOG_CONSTANTS.MIN_CONTENT_LENGTH) {
        errors.push(
          `Content must be at least ${BLOG_CONSTANTS.MIN_CONTENT_LENGTH} characters long`
        );
      }
      if (data.content.length > 50000) {
        errors.push("Content must be less than 50,000 characters");
      }
    }

    if (
      "excerpt" in data &&
      data.excerpt &&
      data.excerpt.length > BLOG_CONSTANTS.MAX_EXCERPT_LENGTH
    ) {
      errors.push(
        `Excerpt must be less than ${BLOG_CONSTANTS.MAX_EXCERPT_LENGTH} characters`
      );
    }

    if (
      "metaDescription" in data &&
      data.metaDescription &&
      data.metaDescription.length > BLOG_CONSTANTS.MAX_META_DESCRIPTION_LENGTH
    ) {
      errors.push(
        `Meta description must be less than ${BLOG_CONSTANTS.MAX_META_DESCRIPTION_LENGTH} characters`
      );
    }

    return errors;
  }
}

export type { AdminContext };
