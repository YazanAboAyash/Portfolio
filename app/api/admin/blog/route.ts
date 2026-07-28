/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z, type ZodIssue } from "zod";
import type {
  BlogAdminResponse,
  BlogAdminAction,
  ApiErrorResponse,
} from "@/types/main/admin";
import type {
  CreateBlogRequest,
  UpdateBlogRequest,
  BlogListQuery,
} from "@/types/hubs/blogs";
import {
  getBlogAdminStats,
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getAdminBlogById,
  checkAdminRateLimit,
  getAdminCategories,
  getAdminTags,
  type AdminContext,
} from "@/lib/blog-admin/blog-admin";
import { createAdminSession, invalidateAdminSession } from "@/proxy";
import { adminAuthLimiter, getClientIP } from "@/lib/security";

// Enhanced authentication
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

/**
 * Rejects an unauthenticated request, throttling repeated token guesses.
 */
function rejectUnauthorized(clientIP: string): NextResponse<ApiErrorResponse> {
  if (!adminAuthLimiter.isAllowed(clientIP)) {
    return NextResponse.json(
      { error: "Too many failed authentication attempts" },
      { status: 429 },
    );
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isAuthorized(request: NextRequest): boolean {
  if (!ADMIN_TOKEN) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return false;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  if (token.length !== ADMIN_TOKEN.length) {
    return false;
  }

  let isEqual = true;
  for (let i = 0; i < token.length; i++) {
    if (token[i] !== ADMIN_TOKEN[i]) {
      isEqual = false;
    }
  }

  return isEqual;
}

function createAdminContext(request: NextRequest): AdminContext {
  return {
    clientIP: getClientIP(request),
    isAuthenticated: isAuthorized(request),
    userAgent: request.headers.get("user-agent") || undefined,
  };
}

function setAdminSessionCookie(response: NextResponse): void {
  const sessionToken = createAdminSession();

  response.cookies.set("PORTFOLIO_ADMIN_SESSION", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

function clearAdminSessionCookie(
  response: NextResponse,
  request: NextRequest,
): void {
  const sessionCookie = request.cookies.get("PORTFOLIO_ADMIN_SESSION");
  if (sessionCookie?.value) {
    invalidateAdminSession(sessionCookie.value);
  }
  response.cookies.delete("PORTFOLIO_ADMIN_SESSION");
}

// Validation schemas
const createBlogSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().optional(),
  excerpt: z
    .string()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  content: z.string().min(10).max(50000),
  featuredImage: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  language: z.enum(["en", "de", "es", "fr", "sv"]).optional(),
  categoryId: z.string().optional(),
  metaTitle: z
    .string()
    .max(60)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  metaDescription: z
    .string()
    .max(160)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  credits: z
    .object({
      originalAuthor: z.string().optional(),
      originalSource: z.string().optional(),
      sourceUrl: z.string().url().optional().or(z.literal("")),
      licenseType: z.string().optional(),
      creditText: z.string().optional(),
      translatedFrom: z.string().optional(),
      adaptedFrom: z.string().optional(),
    })
    .optional(),
});

const updateBlogSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z.string().optional(),
  excerpt: z
    .string()
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  content: z.string().min(10).max(50000).optional(),
  featuredImage: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  language: z.enum(["en", "de", "es", "fr", "sv"]).optional(),
  categoryId: z.string().optional(),
  metaTitle: z
    .string()
    .max(60)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  metaDescription: z
    .string()
    .max(160)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  credits: z
    .object({
      originalAuthor: z.string().optional(),
      originalSource: z.string().optional(),
      sourceUrl: z.string().url().optional().or(z.literal("")),
      licenseType: z.string().optional(),
      creditText: z.string().optional(),
      translatedFrom: z.string().optional(),
      adaptedFrom: z.string().optional(),
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
): Promise<NextResponse<BlogAdminResponse | ApiErrorResponse>> {
  const clientIP = getClientIP(request);
  if (!isAuthorized(request)) {
    return rejectUnauthorized(clientIP);
  }

  // Rate limiting
  if (!checkAdminRateLimit(clientIP)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Create admin context
  const context = createAdminContext(request);

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const blogId = searchParams.get("id");

  try {
    switch (action) {
      case "stats": {
        const stats = await getBlogAdminStats(context);
        const response = NextResponse.json({ success: true, data: stats });

        // Set session cookie on successful authentication
        if (!request.cookies.get("PORTFOLIO_ADMIN_SESSION")) {
          setAdminSessionCookie(response);
        }

        return response;
      }

      case "list": {
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = Math.min(
          parseInt(searchParams.get("limit") || "20", 10),
          50,
        );
        const search = searchParams.get("search") || undefined;
        const language = searchParams.get("language") || undefined;
        const published =
          searchParams.get("published") === "true"
            ? true
            : searchParams.get("published") === "false"
              ? false
              : undefined;
        const featured =
          searchParams.get("featured") === "true"
            ? true
            : searchParams.get("featured") === "false"
              ? false
              : undefined;

        const queryParams: Partial<BlogListQuery> = {
          page,
          limit,
        };

        if (published !== undefined) queryParams.published = published;
        if (featured !== undefined) queryParams.featured = featured;
        if (search) queryParams.search = search;
        if (language)
          queryParams.language = language as "en" | "de" | "es" | "fr" | "sv";

        const result = await getAdminBlogs(
          context,
          queryParams as BlogListQuery,
        );

        return NextResponse.json({ success: true, data: result });
      }

      case "get": {
        if (!blogId) {
          return NextResponse.json(
            { error: "Blog ID is required" },
            { status: 400 },
          );
        }

        const blog = await getAdminBlogById(context, blogId);
        if (!blog) {
          return NextResponse.json(
            { error: "Blog not found" },
            { status: 404 },
          );
        }

        return NextResponse.json({ success: true, data: blog });
      }

      case "categories": {
        const categories = await getAdminCategories(context);
        return NextResponse.json({ success: true, data: categories });
      }

      case "tags": {
        const tags = await getAdminTags(context);
        return NextResponse.json({ success: true, data: tags });
      }

      default:
        return NextResponse.json({
          message: "Blog Admin API",
          endpoints: {
            stats: "/api/admin/blog?action=stats",
            list: "/api/admin/blog?action=list&page=1&limit=20",
            get: "/api/admin/blog?action=get&id={blogId}",
            categories: "/api/admin/blog?action=categories",
            tags: "/api/admin/blog?action=tags",
          },
        });
    }
  } catch (error) {
    console.error("Blog Admin API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<BlogAdminResponse | ApiErrorResponse>> {
  const clientIP = getClientIP(request);
  if (!isAuthorized(request)) {
    return rejectUnauthorized(clientIP);
  }

  // Rate limiting
  if (!checkAdminRateLimit(clientIP)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Create admin context
  const context = createAdminContext(request);

  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 },
      );
    }

    let requestBody: BlogAdminAction;
    try {
      requestBody = (await request.json()) as BlogAdminAction;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { action, blogId, data } = requestBody;

    switch (action) {
      case "create": {
        const parseResult = createBlogSchema.safeParse(data);
        if (!parseResult.success) {
          return NextResponse.json(
            {
              error: "Validation failed",
              details: parseResult.error.issues.map((issue) => issue.message),
            },
            { status: 400 },
          );
        }

        const blog = await createBlog(
          context,
          parseResult.data as CreateBlogRequest,
        );

        return NextResponse.json({
          success: true,
          data: blog,
          message: "Blog created successfully",
        });
      }

      case "update": {
        if (!blogId) {
          return NextResponse.json(
            { error: "Blog ID is required for update" },
            { status: 400 },
          );
        }

        const parseResult = updateBlogSchema.safeParse(data);
        if (!parseResult.success) {
          return NextResponse.json(
            {
              error: "Validation failed",
              details: parseResult.error.issues.map(
                (issue: ZodIssue) =>
                  `${issue.path.join(".")}: ${issue.message}`,
              ),
            },
            { status: 400 },
          );
        }

        const blog = await updateBlog(
          context,
          blogId,
          parseResult.data as UpdateBlogRequest,
        );

        return NextResponse.json({
          success: true,
          data: blog,
          message: "Blog updated successfully",
        });
      }

      case "delete": {
        if (!blogId) {
          return NextResponse.json(
            { error: "Blog ID is required for deletion" },
            { status: 400 },
          );
        }

        await deleteBlog(context, blogId);

        return NextResponse.json({
          success: true,
          message: "Blog deleted successfully",
        });
      }

      case "publish": {
        if (!blogId) {
          return NextResponse.json(
            { error: "Blog ID is required" },
            { status: 400 },
          );
        }

        const blog = await updateBlog(context, blogId, {
          isPublished: true,
        });

        return NextResponse.json({
          success: true,
          data: blog,
          message: "Blog published successfully",
        });
      }

      case "unpublish": {
        if (!blogId) {
          return NextResponse.json(
            { error: "Blog ID is required" },
            { status: 400 },
          );
        }

        const blog = await updateBlog(context, blogId, {
          isPublished: false,
        });
        return NextResponse.json({
          success: true,
          data: blog,
          message: "Blog unpublished successfully",
        });
      }

      case "feature": {
        if (!blogId) {
          return NextResponse.json(
            { error: "Blog ID is required" },
            { status: 400 },
          );
        }

        const blog = await updateBlog(context, blogId, { isFeatured: true });

        return NextResponse.json({
          success: true,
          data: blog,
          message: "Blog featured successfully",
        });
      }

      case "unfeature": {
        if (!blogId) {
          return NextResponse.json(
            { error: "Blog ID is required" },
            { status: 400 },
          );
        }

        const blog = await updateBlog(context, blogId, { isFeatured: false });

        return NextResponse.json({
          success: true,
          data: blog,
          message: "Blog unfeatured successfully",
        });
      }

      case "logout": {
        const response = NextResponse.json({
          success: true,
          message: "Logged out successfully",
        });
        clearAdminSessionCookie(response, request);
        return response;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Blog Admin API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
