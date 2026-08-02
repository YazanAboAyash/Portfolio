/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ChatLogsResponse, ChatSessionLog } from "@/types/configs/chatbot";
import { prisma } from "@/lib/configs/prisma";
import { adminAuthLimiter, getClientIP } from "@/lib/security";

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

function isAuthorized(request: NextRequest): boolean {
  if (!ADMIN_TOKEN) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  if (token.length !== ADMIN_TOKEN.length) return false;

  let isEqual = true;
  for (let i = 0; i < token.length; i++) {
    if (token[i] !== ADMIN_TOKEN[i]) isEqual = false;
  }

  return isEqual;
}

// Validation schema for query params
const chatLogsFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  searchQuery: z.string().max(200).optional(),
  minMessages: z.coerce.number().min(0).max(1000).optional(),
  hasConsent: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ChatLogsResponse | { error: string }>> {
  if (!isAuthorized(request)) {
    return rejectUnauthorized(request);
  }

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const filters = chatLogsFilterSchema.parse({
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      searchQuery: searchParams.get("searchQuery") || undefined,
      minMessages: searchParams.get("minMessages") || undefined,
      hasConsent: searchParams.get("hasConsent") || undefined,
      isActive: searchParams.get("isActive") || undefined,
      limit: searchParams.get("limit") || "20",
      offset: searchParams.get("offset") || "0",
    });

    // Build where clause
    const where: Record<string, unknown> = {};

    if (filters.startDate) {
      where.startedAt = {
        ...((where.startedAt as Record<string, unknown>) || {}),
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      where.startedAt = {
        ...((where.startedAt as Record<string, unknown>) || {}),
        lte: new Date(filters.endDate),
      };
    }

    if (filters.minMessages !== undefined) {
      where.totalMessages = {
        gte: filters.minMessages,
      };
    }

    if (filters.hasConsent !== undefined) {
      where.consentGiven = filters.hasConsent;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Get total count
    const total = await prisma.chatSession.count({ where });

    // Fetch sessions with messages
    const sessions = await prisma.chatSession.findMany({
      where,
      include: {
        messages: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      take: filters.limit,
      skip: filters.offset,
    });

    // Transform to response format
    const sessionsData: ChatSessionLog[] = sessions.map(
      (session: {
        id: string;
        ipAddress: string | null;
        ipCountry: string | null;
        ipCity: string | null;
        userAgent: string | null;
        language: string | null;
        startedAt: Date;
        lastActivityAt: Date;
        endedAt: Date | null;
        isActive: boolean;
        consentGiven: boolean;
        consentTimestamp: Date | null;
        totalMessages: number;
        messages: Array<{
          id: string;
          sessionId: string;
          role: string;
          content: string;
          timestamp: Date;
          status: string | null;
          pageContext: string | null;
          errorDetails: string | null;
        }>;
      }) => ({
        id: session.id,
        ipAddress: session.ipAddress,
        ipCountry: session.ipCountry,
        ipCity: session.ipCity,
        userAgent: session.userAgent,
        language: session.language,
        startedAt: session.startedAt,
        lastActivityAt: session.lastActivityAt,
        endedAt: session.endedAt,
        isActive: session.isActive,
        consentGiven: session.consentGiven,
        consentTimestamp: session.consentTimestamp,
        totalMessages: session.totalMessages,
        messages: session.messages.map((msg) => ({
          id: msg.id,
          sessionId: msg.sessionId,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: msg.timestamp,
          status: msg.status,
          pageContext: msg.pageContext,
          errorDetails: msg.errorDetails,
        })),
      }),
    );

    // Apply search filter on content (if provided)
    const filteredSessions = filters.searchQuery
      ? sessionsData.filter((session) =>
          session.messages?.some((msg) =>
            msg.content
              .toLowerCase()
              .includes(filters.searchQuery!.toLowerCase()),
          ),
        )
      : sessionsData;

    return NextResponse.json({
      sessions: filteredSessions,
      total,
      hasMore: filters.offset + filters.limit < total,
    });
  } catch (error) {
    console.error("Error fetching chat logs:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: `Validation error: ${error.issues.map((e) => e.message).join(", ")}`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch chat logs" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/chatbot/logs/:sessionId
 * Delete a specific chat session and its messages
 */
export async function DELETE(
  request: NextRequest,
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  if (!isAuthorized(request)) {
    return rejectUnauthorized(request);
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Delete session (messages will be cascade deleted)
    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json(
      { error: "Failed to delete chat session" },
      { status: 500 },
    );
  }
}
