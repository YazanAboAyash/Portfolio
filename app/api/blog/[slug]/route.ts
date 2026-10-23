/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getBlogBySlug } from "@/lib/hubs/blogs";
import { getClientIP, RateLimiter } from "@/lib/security";
import { generateBlogSEO } from "@/lib/configs/seo";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/data/configs/i18n";

// Rate limiter for blog slug endpoint
const rateLimiter = new RateLimiter(60000, 30); // 30 requests per minute

const localeSchema = z.enum(SUPPORTED_LOCALES);

// Zod schema for blog slug validation
const blogSlugSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug cannot be empty")
    .max(200, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
    .transform((slug) => slug.toLowerCase()),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    // Rate limiting check
    // getClientIP ignores spoofable fallback headers such as x-real-ip;
    // requests without a usable IP share the single "unknown" bucket.
    const clientIP = getClientIP(request);
    if (!rateLimiter.isAllowed(clientIP)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }

    // Await params and validate slug parameter
    const { slug: rawSlug } = await params;
    const parseResult = blogSlugSchema.safeParse({ slug: rawSlug });

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid blog slug",
          details: parseResult.error.issues.map((issue) => issue.message),
        },
        {
          status: 400,
          headers: {
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }

    const { slug } = parseResult.data;
    const blog = await getBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        {
          status: 404,
          headers: {
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }

    // SEO locale: an explicit ?locale= is preferred because it is part of the
    // URL and therefore the cache key. Without it, fall back to the primary
    // Accept-Language subtag and mark the response as varying on that header.
    const localeParam = request.nextUrl.searchParams.get("locale");
    let locale: string;
    if (localeParam !== null) {
      const localeResult = localeSchema.safeParse(localeParam);
      if (!localeResult.success) {
        return NextResponse.json(
          { error: "Unsupported locale" },
          {
            status: 400,
            headers: {
              "X-Content-Type-Options": "nosniff",
            },
          },
        );
      }
      locale = localeResult.data;
    } else {
      const primaryLanguage = request.headers
        .get("accept-language")
        ?.split(",")[0]
        ?.split(";")[0]
        ?.split("-")[0]
        ?.trim()
        .toLowerCase();
      const headerResult = localeSchema.safeParse(primaryLanguage);
      locale = headerResult.success ? headerResult.data : DEFAULT_LOCALE;
    }

    let seoData;
    try {
      seoData = generateBlogSEO(blog, locale);
    } catch (seoError) {
      console.error("Error generating SEO data:", seoError);
      seoData = null;
    }

    return NextResponse.json(
      {
        blog,
        ...(seoData && { seo: seoData }),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=600, stale-while-revalidate=1200", // 10 min cache, 20 min stale
          "X-Content-Type-Options": "nosniff",
          ...(localeParam === null && { Vary: "Accept-Language" }),
        },
      },
    );
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      {
        status: 500,
        headers: {
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
}
