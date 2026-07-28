/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import type {
  ChatBotRequest,
  ChatBotResponse,
  ChatBotApiError,
  ChatBotRateLimit,
  ChatBotConfig,
  ChatMessage,
} from "@/types/configs/chatbot";
import { sanitizeChatInput, isChatSpam } from "@/lib/security";
import {
  REEM_SYSTEM_PROMPT,
  REEM_CONFIG,
} from "@/data/main/chatbot-system-prompt";
import {
  anonymizeIP,
  isChatLoggingEnabled,
  shouldAnonymizeIP,
} from "@/lib/chatbot-logging";
import { prisma } from "@/lib/configs/prisma";

// Environment configuration with validation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL;
const CHATBOT_ENABLED = process.env.CHATBOT_ENABLED === "true";

const chatbotConfig: ChatBotConfig = {
  maxMessagesPerSession: parseInt(
    process.env.CHATBOT_MAX_MESSAGES_PER_SESSION || "20",
    10,
  ),
  maxMessageLength: parseInt(
    process.env.CHATBOT_MAX_MESSAGE_LENGTH || "1000",
    10,
  ),
  rateLimitPerMinute: parseInt(
    process.env.CHATBOT_RATE_LIMIT_PER_MINUTE || "10",
    10,
  ),
  rateLimitPerHour: parseInt(
    process.env.CHATBOT_RATE_LIMIT_PER_HOUR || "50",
    10,
  ),
  sessionTimeoutMs: parseInt(
    process.env.CHATBOT_SESSION_TIMEOUT_MS || "1800000",
    10,
  ),
  systemPrompt: REEM_SYSTEM_PROMPT,
};

// Enhanced validation schemas with security checks
const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(chatbotConfig.maxMessageLength, "Message too long")
    .refine((val) => !isChatSpam(val), "Spam content detected")
    .transform((val) => sanitizeChatInput(val)),
  sessionId: z
    .string()
    .regex(/^session_[0-9]+_[a-f0-9]+$/, "Invalid session ID format")
    .optional(),
  context: z
    .object({
      page: z.string().max(200).optional(),
      userAgent: z.string().max(500).optional(),
      timestamp: z.number().optional(),
      language: z.string().max(10).optional(),
    })
    .optional(),
  csrfToken: z.string().min(32).max(64).optional(),
  consentGiven: z.boolean().optional(),
});

// In-memory rate limiting and session storage
const rateLimits = new Map<string, ChatBotRateLimit>();
const sessions = new Map<string, ChatMessage[]>();

// Utility functions
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  return cfConnectingIp || realIp || forwarded?.split(",")[0] || "127.0.0.1";
}

function generateSessionId(): string {
  const rand = randomBytes(16).toString("hex"); // 32 hex chars
  return `session_${Date.now()}_${rand}`;
}

function generateMessageId(): string {
  const rand = randomBytes(12).toString("hex"); // 24 hex chars
  return `msg_${Date.now()}_${rand}`;
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(clientIP);

  if (!limit) {
    rateLimits.set(clientIP, {
      minute: { count: 1, windowStart: now, lastRequest: now },
      hour: { count: 1, windowStart: now, lastRequest: now },
    });
    return false;
  }

  // Check minute window
  if (now - limit.minute.windowStart > 60000) {
    limit.minute = { count: 1, windowStart: now, lastRequest: now };
  } else {
    limit.minute.count++;
    limit.minute.lastRequest = now;
  }

  // Check hour window
  if (now - limit.hour.windowStart > 3600000) {
    limit.hour = { count: 1, windowStart: now, lastRequest: now };
  } else {
    limit.hour.count++;
    limit.hour.lastRequest = now;
  }

  return (
    limit.minute.count > chatbotConfig.rateLimitPerMinute ||
    limit.hour.count > chatbotConfig.rateLimitPerHour
  );
}

function getRateLimitInfo(clientIP: string): {
  remaining: number;
  resetTime: number;
} {
  const limit = rateLimits.get(clientIP);
  if (!limit) {
    return {
      remaining: chatbotConfig.rateLimitPerMinute,
      resetTime: Date.now() + 60000,
    };
  }

  const minuteRemaining = Math.max(
    0,
    chatbotConfig.rateLimitPerMinute - limit.minute.count,
  );
  const nextMinuteReset = limit.minute.windowStart + 60000;

  return {
    remaining: minuteRemaining,
    resetTime: nextMinuteReset,
  };
}

function cleanupSessions(): void {
  const now = Date.now();
  for (const [sessionId, messages] of sessions.entries()) {
    const lastActivity = Math.max(
      ...messages.map((m) => m.timestamp.getTime()),
    );
    if (now - lastActivity > chatbotConfig.sessionTimeoutMs) {
      sessions.delete(sessionId);
    }
  }
}

function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [ip, limit] of rateLimits.entries()) {
    if (now - limit.hour.lastRequest > 3600000) {
      // 1 hour
      rateLimits.delete(ip);
    }
  }
}

interface OpenAIResponseContent {
  type?: string;
  text?: string;
}

interface OpenAIResponseOutput {
  type?: string;
  role?: string;
  content?: OpenAIResponseContent[];
}

interface OpenAIResponsePayload {
  output_text?: string;
  output?: OpenAIResponseOutput[];
  error?: {
    message?: string;
  };
}

function extractOpenAIResponseText(data: OpenAIResponsePayload): string | null {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const outputText = data.output
    ?.flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text)
    .filter((text): text is string => typeof text === "string")
    .join("\n")
    .trim();

  return outputText || null;
}

// OpenAI Responses API implementation
async function callOpenAIAPI(
  messages: ChatMessage[],
  systemPrompt: string,
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  if (!OPENAI_CHAT_MODEL) {
    throw new Error("OpenAI chat model not configured");
  }

  const openAIMessages = messages
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_CHAT_MODEL,
      instructions: systemPrompt,
      input: openAIMessages,
      max_output_tokens: 1024,
      store: false,
      text: {
        format: {
          type: "text",
        },
      },
    }),
  });

  if (!response.ok) {
    const errorData = (await response
      .json()
      .catch(() => ({}))) as OpenAIResponsePayload;
    const message = errorData.error?.message || "Unknown error";

    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after") || "60";
      throw new Error(`QUOTA_EXCEEDED:${retryAfter}:${message}`);
    }

    throw new Error(
      `OpenAI API error: ${response.status} - ${message}`,
    );
  }

  const data = (await response.json()) as OpenAIResponsePayload;
  const responseText = extractOpenAIResponseText(data);

  if (!responseText) {
    throw new Error("Invalid response from OpenAI API");
  }

  return responseText;
}

/**
 * Log chat session and messages to database (if logging is enabled AND user consented)
 */
async function logChatToDB(
  sessionId: string,
  clientIP: string,
  userMessage: ChatMessage,
  assistantMessage: ChatMessage,
  requestBody: ChatBotRequest,
): Promise<void> {
  if (!isChatLoggingEnabled()) {
    return; // Logging disabled
  }

  const hasConsent = requestBody.consentGiven || false;

  // GDPR Compliance: If user declined consent, don't save ANY data
  if (!hasConsent) {
    return; // No logging without consent - ephemeral chat only
  }

  try {
    // User consented - collect data with privacy protections
    const ipToStore = shouldAnonymizeIP() ? anonymizeIP(clientIP) : clientIP;

    // Check if session exists
    const existingSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!existingSession) {
      // Create new session
      await prisma.chatSession.create({
        data: {
          id: sessionId,
          ipAddress: ipToStore,
          ipCountry: null,
          ipCity: null,
          userAgent: requestBody.context?.userAgent || null,
          language: requestBody.context?.language || null,
          consentGiven: true,
          consentTimestamp: new Date(),
          totalMessages: 2, // User + assistant message
        },
      });
    } else {
      // Update existing session
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          lastActivityAt: new Date(),
          totalMessages: existingSession.totalMessages + 2,
          // Update consent if not already recorded
          ...(!existingSession.consentGiven && {
            consentGiven: true,
            consentTimestamp: new Date(),
          }),
        },
      });
    }

    // Log both messages with full context
    await prisma.chatMessage.createMany({
      data: [
        {
          id: userMessage.id,
          sessionId,
          role: userMessage.role,
          content: userMessage.content,
          timestamp: userMessage.timestamp,
          status: userMessage.status || null,
          pageContext: requestBody.context?.page || null,
          errorDetails: null,
        },
        {
          id: assistantMessage.id,
          sessionId,
          role: assistantMessage.role,
          content: assistantMessage.content,
          timestamp: assistantMessage.timestamp,
          status: assistantMessage.status || null,
          pageContext: requestBody.context?.page || null,
          errorDetails: null,
        },
      ],
    });
  } catch (error) {
    console.error("Failed to log chat to database:", error);
    // Don't throw - logging failure shouldn't break the chat functionality
  }
}

// API Routes
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ChatBotResponse | ChatBotApiError>> {
  // Check if chatbot is enabled
  if (!CHATBOT_ENABLED) {
    return NextResponse.json(
      {
        error: "ChatBot service is currently unavailable",
        code: "SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  // Get client IP and check rate limiting
  const clientIP = getClientIP(request);

  if (isRateLimited(clientIP)) {
    const rateLimitInfo = getRateLimitInfo(clientIP);
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        code: "RATE_LIMIT_EXCEEDED",
        details: rateLimitInfo,
      },
      { status: 429 },
    );
  }

  try {
    // Validate content type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        {
          error: "Content-Type must be application/json",
          code: "INVALID_INPUT",
        },
        { status: 400 },
      );
    }

    // Parse and validate request body
    let requestBody: ChatBotRequest;
    try {
      const rawBody = (await request.json()) as unknown;
      const validatedBody = chatRequestSchema.parse(rawBody);
      requestBody = validatedBody as ChatBotRequest;
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof z.ZodError
              ? `Validation error: ${error.issues
                  .map((e) => e.message)
                  .join(", ")}`
              : "Invalid request body",
          code: "INVALID_INPUT",
        },
        { status: 400 },
      );
    }

    // Generate or validate session ID
    const sessionId = requestBody.sessionId || generateSessionId();

    // Get or initialize session messages
    const sessionMessages = sessions.get(sessionId) || [];

    // Check session message limit
    if (sessionMessages.length >= chatbotConfig.maxMessagesPerSession) {
      return NextResponse.json(
        {
          error: `Maximum ${chatbotConfig.maxMessagesPerSession} messages per session exceeded`,
          code: "INVALID_INPUT",
        },
        { status: 400 },
      );
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: "user",
      content: requestBody.message.trim(),
      timestamp: new Date(),
      status: "sent",
    };

    // Add user message to session
    sessionMessages.push(userMessage);

    // Check if this is the first user message (only 1 message = the user's first message)
    const isFirstMessage = sessionMessages.length === 1;

    // Modify system prompt for first message to include greeting instruction
    let systemPrompt = chatbotConfig.systemPrompt;
    if (isFirstMessage) {
      systemPrompt += `\n\nIMPORTANT: This is the user's first message in this conversation. Start warmly and briefly introduce yourself only if it helps. If the user picked a guided starter like website, automation, projects, pricing, or contact, route them directly and include the most relevant source links.`;
    }

    // Call OpenAI
    const aiResponse = await callOpenAIAPI(sessionMessages, systemPrompt);

    // Create assistant message
    const assistantMessage: ChatMessage = {
      id: generateMessageId(),
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
      status: "sent",
    };

    // Add assistant message to session
    sessionMessages.push(assistantMessage);

    // Update session storage
    sessions.set(sessionId, sessionMessages);

    // Log to database (async, non-blocking)
    logChatToDB(
      sessionId,
      clientIP,
      userMessage,
      assistantMessage,
      requestBody,
    ).catch((err) => {
      console.error("Chat logging failed:", err);
    });

    // Cleanup old sessions and rate limits periodically during requests
    if (Math.random() < 0.1) {
      cleanupSessions();
      cleanupRateLimits();
    }

    const rateLimitInfo = getRateLimitInfo(clientIP);

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
        sessionId,
        messageId: assistantMessage.id,
      },
      rateLimitInfo,
    });
  } catch (error) {
    // Check for quota exceeded error
    if (error instanceof Error && error.message.startsWith("QUOTA_EXCEEDED:")) {
      const [, retryAfter, message] = error.message.split(":");
      const retrySeconds = retryAfter ? parseFloat(retryAfter) : 60;
      return NextResponse.json(
        {
          error:
            message || "AI service quota exceeded. Please try again later.",
          code: "QUOTA_EXCEEDED",
          retryAfter: retrySeconds || 60,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(retrySeconds || 60)),
          },
        },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? "AI service temporarily unavailable"
            : "Internal server error",
        code: "SERVICE_UNAVAILABLE",
      },
      { status: 500 },
    );
  }
}

export function GET(): NextResponse<{
  status: string;
  config: Partial<ChatBotConfig>;
  assistant: typeof REEM_CONFIG;
}> {
  return NextResponse.json({
    status: CHATBOT_ENABLED ? "available" : "disabled",
    config: {
      maxMessageLength: chatbotConfig.maxMessageLength,
      maxMessagesPerSession: chatbotConfig.maxMessagesPerSession,
    },
    assistant: REEM_CONFIG,
  });
}
