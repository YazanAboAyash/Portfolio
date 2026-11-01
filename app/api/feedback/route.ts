/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createHash, createHmac } from "crypto";
import type {
  FeedbackErrorCode,
  FeedbackListResponse,
  FeedbackStatus,
  FeedbackSubmitResponse,
  FeedbackTopic,
  PublicFeedbackEntry,
} from "@/types/configs/feedback";
import {
  FEEDBACK_BURST_MAX,
  FEEDBACK_BURST_WINDOW_MS,
  FEEDBACK_DAILY_MAX,
  FEEDBACK_MAX_BODY_BYTES,
  FEEDBACK_MIN_FILL_MS,
  FEEDBACK_WALL_CACHE_TAG,
  FEEDBACK_WALL_SIZE,
} from "@/data/configs/feedback";
import { feedbackSchema } from "@/lib/feedback/schema";
import { moderateFeedback } from "@/lib/feedback/moderation";
import {
  RateLimiter,
  getClientIP,
  isChatSpam,
  sanitizeChatInput,
} from "@/lib/security";
import { prisma } from "@/lib/configs/prisma";

// Two moderation calls with a 6s ceiling each, plus the database.
export const maxDuration = 20;

const FEEDBACK_ENABLED = process.env.FEEDBACK_ENABLED === "true";
const FEEDBACK_HASH_SECRET = process.env.FEEDBACK_HASH_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const isConfigured = Boolean(
  FEEDBACK_ENABLED && FEEDBACK_HASH_SECRET && OPENAI_API_KEY,
);

// Once per cold start: with the flag on but a secret missing, every submission
// answers SERVICE_UNAVAILABLE, which looks the same as the feature being off.
if (FEEDBACK_ENABLED && !isConfigured) {
  console.error(
    "[feedback] FEEDBACK_ENABLED is true but FEEDBACK_HASH_SECRET or OPENAI_API_KEY is unset — every submission will answer SERVICE_UNAVAILABLE.",
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

// In-memory and per instance, so only a speed bump; the daily limit below is
// the one that holds, because it counts rows in the database.
const burstLimiter = new RateLimiter(
  FEEDBACK_BURST_WINDOW_MS,
  FEEDBACK_BURST_MAX,
);

function errorResponse(code: FeedbackErrorCode, status: number): NextResponse {
  return new NextResponse(code, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/**
 * Logs why a submission was refused. Codes and lengths only: never the
 * message, the name or the IP, since these lines outlive the request.
 */
function reject(
  code: FeedbackErrorCode,
  status: number,
  reason: string,
): NextResponse {
  console.warn(`[feedback] ${code}: ${reason}`.slice(0, 300));
  return errorResponse(code, status);
}

function submitted(
  outcome: FeedbackSubmitResponse["outcome"],
): NextResponse<FeedbackSubmitResponse> {
  return NextResponse.json({ ok: true, outcome }, { status: 201 });
}

/**
 * What a bot gets for tripping a trap: the same answer as a real submission,
 * so it cannot tell which field gave it away. Nothing is stored.
 */
function fakeSuccess(reason: string): NextResponse {
  console.warn(`[feedback] dropped: ${reason}`);
  return submitted("queued");
}

/**
 * Refused content still gets a success. The visitor is never told their entry
 * was rejected — the form answers with a wry thank-you — so there is nothing to
 * reword and retry against. Why it was refused stays in this log line.
 */
function quietlyFiled(reason: string): NextResponse {
  console.warn(`[feedback] filed: ${reason}`.slice(0, 300));
  return submitted("filed");
}

/**
 * The client IP is never stored. A keyed hash is enough to count one sender's
 * submissions, and without the secret it cannot be reversed by hashing the
 * whole IPv4 space.
 */
function hashIP(ip: string): string {
  return createHmac("sha256", FEEDBACK_HASH_SECRET ?? "")
    .update(ip)
    .digest("hex");
}

/** Case and whitespace do not make a message new. */
function hashContent(message: string): string {
  return createHash("sha256")
    .update(message.toLowerCase().replace(/\s+/g, " ").trim())
    .digest("hex");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isConfigured) return errorResponse("SERVICE_UNAVAILABLE", 503);

  const clientIP = getClientIP(request);
  if (!burstLimiter.isAllowed(clientIP)) {
    return errorResponse("RATE_LIMIT_EXCEEDED", 429);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reject("INVALID_INPUT", 400, "content-type is not application/json");
  }

  // Checked on the declared size first so an oversized body is never read, then
  // on the body actually received, since the header is caller-supplied.
  const declaredBytes = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredBytes) && declaredBytes > FEEDBACK_MAX_BODY_BYTES) {
    return reject("INVALID_INPUT", 400, `content-length ${declaredBytes}`);
  }
  const rawBody = await request.text().catch(() => null);
  if (rawBody === null || rawBody.length > FEEDBACK_MAX_BODY_BYTES) {
    return reject("INVALID_INPUT", 400, "body unreadable or over the cap");
  }

  const parsed = feedbackSchema.safeParse(
    ((): unknown => {
      try {
        return JSON.parse(rawBody);
      } catch {
        return null;
      }
    })(),
  );
  if (!parsed.success) {
    // Issue paths and messages are our own strings and carry no user text.
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    return reject("INVALID_INPUT", 400, issues);
  }

  const input = parsed.data;

  if (input.website !== "") return fakeSuccess("honeypot filled");
  if (Date.now() - input.startedAt < FEEDBACK_MIN_FILL_MS) {
    return fakeSuccess("submitted too fast");
  }

  // Not stored: junk this obvious has nothing worth reviewing.
  if (isChatSpam(input.message)) {
    return quietlyFiled(`spam (length ${input.message.length})`);
  }

  const message = sanitizeChatInput(input.message);
  const name = sanitizeChatInput(input.name) || null;
  if (!message) {
    return reject("INVALID_INPUT", 400, "message empty after sanitisation");
  }

  const ipHash = hashIP(clientIP);
  const contentHash = hashContent(message);
  const since = new Date(Date.now() - DAY_MS);

  try {
    const [todayCount, duplicate] = await Promise.all([
      prisma.feedback.count({ where: { ipHash, createdAt: { gte: since } } }),
      prisma.feedback.findFirst({
        where: { ipHash, contentHash, createdAt: { gte: since } },
        select: { id: true },
      }),
    ]);

    if (duplicate) return reject("DUPLICATE", 409, "same message within 24h");
    if (todayCount >= FEEDBACK_DAILY_MAX) {
      return reject("DAILY_LIMIT", 429, `${todayCount} submissions within 24h`);
    }

    const moderation = await moderateFeedback(message, name);

    // The moderator can only ever reject. `approve` and `review` both wait for
    // the owner, and so does an entry the moderator could not see.
    const status: FeedbackStatus =
      moderation?.verdict === "reject" ? "rejected" : "pending";

    await prisma.feedback.create({
      data: {
        name,
        topic: input.topic,
        rating: input.rating,
        message,
        locale: input.locale,
        consentToPublish: input.consentToPublish,
        status,
        aiVerdict: moderation?.verdict ?? null,
        aiReasons: moderation?.reasons ?? [],
        aiFlaggedTerms: moderation?.flaggedTerms ?? [],
        ipHash,
        contentHash,
      },
    });

    // Rejected entries are kept so false positives can be found and approved.
    if (status === "rejected") {
      return quietlyFiled(
        `moderator: ${moderation?.reasons.join(", ") || "no reason given"}`,
      );
    }

    return submitted("queued");
  } catch (error) {
    // Name only: a Prisma error can quote the row back, and the row is the
    // visitor's message.
    console.error(
      `[feedback] storing failed (${
        error instanceof Error ? error.name : "unknown error"
      })`,
    );
    return errorResponse("SERVICE_UNAVAILABLE", 503);
  }
}

/**
 * The public wall: approved entries whose senders agreed to publication.
 * Selects only what is shown, so the hashes and moderator output never leave
 * the server.
 *
 * Cached in the Next data cache under a tag the admin route clears on every
 * change, so an approval — or taking a mistaken one back down — shows at
 * once instead of after the cache runs out. Dates are serialised inside,
 * because the cache stores JSON.
 */
const loadWall = unstable_cache(
  async (): Promise<PublicFeedbackEntry[]> => {
    const rows = await prisma.feedback.findMany({
      where: { status: "approved", consentToPublish: true },
      orderBy: { createdAt: "desc" },
      take: FEEDBACK_WALL_SIZE,
      select: {
        id: true,
        name: true,
        topic: true,
        rating: true,
        message: true,
        createdAt: true,
      },
    });

    return rows.map((row) => ({
      ...row,
      topic: row.topic as FeedbackTopic,
      createdAt: row.createdAt.toISOString(),
    }));
  },
  [FEEDBACK_WALL_CACHE_TAG],
  { tags: [FEEDBACK_WALL_CACHE_TAG], revalidate: 300 },
);

export async function GET(): Promise<
  NextResponse<FeedbackListResponse | { error: FeedbackErrorCode }>
> {
  try {
    return NextResponse.json(
      { entries: await loadWall() },
      {
        // Short at the edge: the tag above only clears Next's cache, so this
        // bounds how long a taken-down entry can linger in the CDN.
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    console.error(
      `[feedback] loading the wall failed (${
        error instanceof Error ? error.name : "unknown error"
      })`,
    );
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
