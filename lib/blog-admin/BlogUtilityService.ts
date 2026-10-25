/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { prisma } from "@/lib/configs/prisma";
import type {
  BlogCredit,
  CreateBlogRequest,
  UpdateBlogRequest,
} from "@/types/hubs/blogs";
import { sanitizeInput, sanitizeErrorMessage } from "@/lib/security";

export class BlogUtilityService {
  /**
   * Sanitize blog content while preserving markdown formatting
   */
  static sanitizeBlogContent(content: string): string {
    if (!content) return "";

    let sanitized = content;

    // Remove HTML tags completely (but preserve markdown)
    let prevSanitized;
    do {
      prevSanitized = sanitized;
      sanitized = sanitized.replace(/<[^>]*>/g, "");
    } while (sanitized !== prevSanitized);

    // Remove script tags and dangerous protocols
    sanitized = sanitized.replace(/javascript:/gi, "");
    sanitized = sanitized.replace(/data:/gi, "");
    sanitized = sanitized.replace(/vbscript:/gi, "");

    // Remove potentially dangerous attributes
    let prevAttrSanitized;
    do {
      prevAttrSanitized = sanitized;
      sanitized = sanitized.replace(/on\w+\s*=\s*[^>]*/gi, "");
    } while (sanitized !== prevAttrSanitized);

    // PRESERVE markdown formatting - DO NOT remove whitespace or newlines
    // Only remove NULL characters and other control characters that could be dangerous
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    return sanitized;
  }

  /**
   * Common error handler with sanitized messages
   */
  static handleBlogError(error: unknown, operation: string): never {
    console.error(`Blog ${operation} error:`, error);
    const sanitizedMessage = sanitizeErrorMessage(error);
    throw new Error(`Failed to ${operation}: ${sanitizedMessage}`);
  }

  /**
   * Generate a unique slug from title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Ensure unique slug by appending number if needed (simplified)
   */
  static async ensureUniqueSlug(
    slug: string,
    excludeId?: string
  ): Promise<string> {
    const maxAttempts = 10;

    for (let counter = 0; counter < maxAttempts; counter++) {
      const testSlug = counter === 0 ? slug : `${slug}-${counter}`;

      const existing = await prisma.blog.findFirst({
        where: {
          slug: testSlug,
          ...(excludeId && { id: { not: excludeId } }),
        },
        select: { id: true },
      });

      if (!existing) {
        return testSlug;
      }
    }

    // Final fallback with timestamp
    const timestamp = Date.now();
    return `${slug}-${timestamp}`;
  }

  /**
   * Calculate reading time based on content
   */
  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Sanitize blog data fields
   */
  static sanitizeBlogData(data: CreateBlogRequest | UpdateBlogRequest) {
    return {
      title:
        "title" in data && data.title ? sanitizeInput(data.title) : undefined,
      content:
        "content" in data && data.content
          ? this.sanitizeBlogContent(data.content)
          : undefined,
      excerpt:
        "excerpt" in data && data.excerpt !== undefined
          ? data.excerpt
            ? sanitizeInput(data.excerpt)
            : null
          : undefined,
      metaTitle:
        "metaTitle" in data && data.metaTitle !== undefined
          ? data.metaTitle
            ? sanitizeInput(data.metaTitle)
            : null
          : undefined,
      metaDescription:
        "metaDescription" in data && data.metaDescription !== undefined
          ? data.metaDescription
            ? sanitizeInput(data.metaDescription)
            : null
          : undefined,
    };
  }

  /**
   * Sanitize credits data fields
   */
  static sanitizeCreditsData(
    credits: Omit<BlogCredit, "id" | "blogId" | "createdAt" | "updatedAt">
  ) {
    return {
      originalAuthor: sanitizeInput(credits.originalAuthor || ""),
      originalSource: credits.originalSource
        ? sanitizeInput(credits.originalSource)
        : null,
      sourceUrl: credits.sourceUrl || null,
      creditText: credits.creditText ? sanitizeInput(credits.creditText) : null,
      translatedFrom: credits.translatedFrom || null,
      adaptedFrom: credits.adaptedFrom || null,
    };
  }
}
