/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClientIP, RateLimiter } from "@/lib/security";
import { getGitHubOverview, toGitHubErrorCode } from "@/lib/github/service";
import type { GitHubSnapshot } from "@/types/configs/github";

const rateLimiter = new RateLimiter(60000, 10);

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export async function GET(request: NextRequest) {
  if (!rateLimiter.isAllowed(getClientIP(request))) {
    return NextResponse.json(
      { error: "RATE_LIMIT_EXCEEDED" },
      { status: 429, headers: { ...securityHeaders, "Retry-After": "60" } },
    );
  }

  try {
    const overview = await getGitHubOverview();

    const body: GitHubSnapshot = {
      overview: overview.data,
      fetchedAt: overview.meta.fetchedAt,
    };

    return NextResponse.json(body, {
      headers: {
        ...securityHeaders,
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("GitHub API Error:", error);
    return NextResponse.json(
      { error: toGitHubErrorCode(error) },
      { status: 503, headers: securityHeaders },
    );
  }
}
