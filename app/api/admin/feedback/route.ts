/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type {
  AdminFeedbackEntry,
  AdminFeedbackListResponse,
  FeedbackStatus,
  FeedbackTopic,
  ModerationVerdict,
} from "@/types/configs/feedback";
import {
  FEEDBACK_STATUSES,
  FEEDBACK_TOPICS,
  FEEDBACK_WALL_CACHE_TAG,
} from "@/data/configs/feedback";
import { prisma } from "@/lib/configs/prisma";
import { adminAuthLimiter, getClientIP } from "@/lib/security";
import { hasValidAdminSession } from "@/lib/admin-session";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

/**
 * Rejects an unauthenticated request, throttling repeated token guesses.
 */
function rejectUnauthorized(request: NextRequest): NextResponse<{
  error: string;
}> {
  if (!adminAuthLimiter.isAllowed(getClientIP(request))) {
    return NextResponse.json(
      { error: "Too many failed authentication attempts" },
      { status: 429 },
    );
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * `ADMIN_TOKEN` as a Bearer header, or the admin workspace's session cookie.
 * `admin` only: the blog agent token has no business with visitor feedback.
 */
async function isAuthorized(request: NextRequest): Promise<boolean> {
  if (!ADMIN_TOKEN) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return hasValidAdminSession(request);

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  const actual = Buffer.from(token);
  const expected = Buffer.from(ADMIN_TOKEN);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const listFilterSchema = z.object({
  status: z.enum([...FEEDBACK_STATUSES, "all"]).default("pending"),
  topic: z.enum(FEEDBACK_TOPICS).optional(),
  searchQuery: z.string().trim().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const reviewSchema = z
  .object({
    id: z.string().min(1).max(40),
    status: z.enum(FEEDBACK_STATUSES),
    // Erases the display name for good, so a fine message with a bad name can
    // still be published, as Anonymous.
    clearName: z.boolean().optional(),
  })
  .strict();

/**
 * Every change can alter what the wall shows, so the wall's cached query is
 * expired at once — a mistaken approval comes down without waiting it out.
 */
function expireWall(): void {
  revalidateTag(FEEDBACK_WALL_CACHE_TAG, { expire: 0 });
}

const idSchema = z.string().min(1).max(40);

export async function GET(
  request: NextRequest,
): Promise<NextResponse<AdminFeedbackListResponse | { error: string }>> {
  if (!(await isAuthorized(request))) return rejectUnauthorized(request);

  const { searchParams } = new URL(request.url);
  const parsed = listFilterSchema.safeParse({
    status: searchParams.get("status") || undefined,
    topic: searchParams.get("topic") || undefined,
    searchQuery: searchParams.get("searchQuery") || undefined,
    limit: searchParams.get("limit") || undefined,
    offset: searchParams.get("offset") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  const { status, topic, searchQuery, limit, offset } = parsed.data;

  // Topic and search narrow the counts too, so the tabs describe the same set
  // the list is drawn from; only the status filter is left out of them.
  const base = {
    ...(topic && { topic }),
    ...(searchQuery && {
      OR: [
        { message: { contains: searchQuery, mode: "insensitive" as const } },
        { name: { contains: searchQuery, mode: "insensitive" as const } },
      ],
    }),
  };
  const where = status === "all" ? base : { ...base, status };

  try {
    const [rows, total, grouped] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          name: true,
          topic: true,
          rating: true,
          message: true,
          locale: true,
          consentToPublish: true,
          status: true,
          aiVerdict: true,
          aiReasons: true,
          aiFlaggedTerms: true,
          createdAt: true,
          reviewedAt: true,
        },
      }),
      prisma.feedback.count({ where }),
      prisma.feedback.groupBy({
        by: ["status"],
        where: base,
        _count: { _all: true },
      }),
    ]);

    const counts: Record<FeedbackStatus, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
    for (const group of grouped) {
      if (group.status in counts) {
        counts[group.status as FeedbackStatus] = group._count._all;
      }
    }

    const entries: AdminFeedbackEntry[] = rows.map((row) => ({
      ...row,
      topic: row.topic as FeedbackTopic,
      status: row.status as FeedbackStatus,
      aiVerdict: row.aiVerdict as ModerationVerdict | null,
      createdAt: row.createdAt.toISOString(),
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
    }));

    return NextResponse.json(
      { entries, total, hasMore: offset + entries.length < total, counts },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      `[admin/feedback] listing failed (${
        error instanceof Error ? error.name : "unknown error"
      })`,
    );
    return NextResponse.json(
      { error: "Failed to load feedback" },
      { status: 500 },
    );
  }
}

/**
 * Sets an entry's status. Approving is the only way anything reaches the
 * public wall, and only entries whose senders consented ever appear there.
 */
export async function PATCH(
  request: NextRequest,
): Promise<NextResponse<{ ok: true } | { error: string }>> {
  if (!(await isAuthorized(request))) return rejectUnauthorized(request);

  const parsed = reviewSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { id, status, clearName } = parsed.data;

  try {
    const { count } = await prisma.feedback.updateMany({
      where: { id },
      data: {
        status,
        reviewedAt: status === "pending" ? null : new Date(),
        ...(clearName && { name: null }),
      },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    expireWall();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      `[admin/feedback] review failed (${
        error instanceof Error ? error.name : "unknown error"
      })`,
    );
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 },
    );
  }
}

/** Removes an entry for good, e.g. when a visitor asks for deletion. */
export async function DELETE(
  request: NextRequest,
): Promise<NextResponse<{ ok: true } | { error: string }>> {
  if (!(await isAuthorized(request))) return rejectUnauthorized(request);

  const parsed = idSchema.safeParse(
    new URL(request.url).searchParams.get("id"),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const { count } = await prisma.feedback.deleteMany({
      where: { id: parsed.data },
    });

    if (count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    expireWall();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      `[admin/feedback] delete failed (${
        error instanceof Error ? error.name : "unknown error"
      })`,
    );
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 },
    );
  }
}
