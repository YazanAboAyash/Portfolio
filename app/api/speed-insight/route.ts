/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClientIP, RateLimiter, sanitizeErrorMessage } from "@/lib/security";
import type {
  RawPageSpeedResponse,
  SpeedInsightResult,
  SpeedInsightScore,
  SpeedInsightApiResponse,
} from "@/types/configs/speed-insight";

const PAGESPEED_API_URL =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const TARGET_URL =
  process.env.PAGESPEED_TARGET_URL || "https://coldbydefault.com";
const API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY;

// `?refresh` bypasses the 1h cache, so it is honoured at most once per window
// for everyone (per instance), whatever IP callers claim. Matches the refresh
// button's own 2-minute cooldown in the SpeedInsight component.
const LIVE_REFRESH_COOLDOWN_MS = 120_000;

// The button allows one refresh per 2 minutes; this leaves slack for a few tabs
// or users behind one address while stopping a script looping on `?refresh`.
const refreshLimiter = new RateLimiter(60_000, 5);

let lastLiveAttemptAt = 0;
/** Result of the most recent live attempt; null while none succeeded in it. */
let lastLiveBody: SpeedInsightApiResponse | null = null;

/** Upstream loads in progress, shared so concurrent requests make one pair of calls. */
const inFlight: Record<
  "live" | "cached",
  Promise<SpeedInsightApiResponse> | null
> = { live: null, cached: null };

/** Map a 0–1 score to a Tailwind color class */
function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

/** Parse the raw Google API response into our clean type */
function parseResult(
  raw: RawPageSpeedResponse,
  strategy: "mobile" | "desktop",
): SpeedInsightResult {
  const cats = raw.lighthouseResult.categories;

  const categories: SpeedInsightScore[] = Object.values(cats).map((cat) => {
    const pct = Math.round((cat.score ?? 0) * 100);
    return {
      label: cat.title,
      score: pct,
      color: getScoreColor(pct),
    };
  });

  return {
    url: raw.id,
    strategy,
    categories,
    fetchedAt: raw.lighthouseResult.fetchTime,
  };
}

/** Fetch PageSpeed data for a given strategy */
async function fetchPageSpeed(
  strategy: "mobile" | "desktop",
  forceRefresh = false,
): Promise<SpeedInsightResult> {
  const params = new URLSearchParams({
    url: TARGET_URL,
    strategy,
    category: "performance",
  });

  // Add all categories
  ["accessibility", "best-practices", "seo"].forEach((cat) =>
    params.append("category", cat),
  );

  if (API_KEY) {
    params.set("key", API_KEY);
  }

  const response = await fetch(`${PAGESPEED_API_URL}?${params.toString()}`, {
    headers: {
      Referer: TARGET_URL,
    },
    ...(forceRefresh
      ? { cache: "no-store" as const }
      : { next: { revalidate: 3600 } }), // Cache for 1 hour unless force refresh
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `PageSpeed API error (${strategy}): ${response.status} – ${errorText}`,
    );
  }

  const data = (await response.json()) as RawPageSpeedResponse;
  return parseResult(data, strategy);
}

/** Fetch both strategies, joining a load of the same kind already in flight */
function loadBoth(forceRefresh: boolean): Promise<SpeedInsightApiResponse> {
  const key = forceRefresh ? "live" : "cached";
  const pending =
    inFlight[key] ??
    Promise.all([
      fetchPageSpeed("desktop", forceRefresh),
      fetchPageSpeed("mobile", forceRefresh),
    ])
      .then(([desktop, mobile]) => ({ desktop, mobile }))
      .finally(() => {
        inFlight[key] = null;
      });
  inFlight[key] = pending;
  return pending;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const wantsRefresh = request.nextUrl.searchParams.has("refresh");

  if (wantsRefresh && !refreshLimiter.isAllowed(getClientIP(request))) {
    return NextResponse.json(
      { error: "RATE_LIMIT_EXCEEDED", desktop: null, mobile: null },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // A refresh inside the cooldown joins the live load still running, or gets
  // its result, or falls back to the cached data. Google is never called twice.
  const now = Date.now();
  const goLive =
    wantsRefresh &&
    (inFlight.live !== null ||
      now - lastLiveAttemptAt >= LIVE_REFRESH_COOLDOWN_MS);

  try {
    let body: SpeedInsightApiResponse;
    if (goLive) {
      if (!inFlight.live) {
        lastLiveAttemptAt = now;
        lastLiveBody = null;
      }
      body = await loadBoth(true);
      lastLiveBody = body;
    } else if (wantsRefresh && lastLiveBody) {
      body = lastLiveBody;
    } else {
      body = await loadBoth(false);
    }

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  } catch (error) {
    console.error("PageSpeed API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch PageSpeed data",
        message: sanitizeErrorMessage(error),
        desktop: null,
        mobile: null,
      } satisfies SpeedInsightApiResponse & { message: string },
      {
        status: 500,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      },
    );
  }
}
