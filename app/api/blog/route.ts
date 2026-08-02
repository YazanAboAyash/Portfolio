/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getBlogs } from "@/lib/hubs/blogs";
import type { BlogListQuery, BlogLanguage } from "@/types/hubs/blogs";
import { RateLimiter, getClientIP } from "@/lib/security";

// Rate limiter instance: 30 requests per minute
const rateLimiter = new RateLimiter(60000, 30);

export async function GET(request: NextRequest) {
  // Rate limiting check
  const clientIP = getClientIP(request);
  if (!rateLimiter.isAllowed(clientIP)) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": "30",
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    // Very simple parameter parsing
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = parseInt(searchParams.get("limit") || "12", 10) || 12;
    const search = searchParams.get("search") || undefined;
    const featured = searchParams.get("featured") === "true" || undefined;
    const language = searchParams.get("language") || undefined;

    const query: BlogListQuery = {
      page,
      limit,
    };

    if (search) query.search = search;
    if (featured) query.featured = featured;
    if (language) query.language = language as BlogLanguage;

    const result = await getBlogs(query);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch blogs",
      },
      {
        status: 500,
        headers: {
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
}
