/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  smoothStream,
  streamText,
  validateUIMessages,
} from "ai";
import type {
  ChatBotErrorCode,
  ChatBotRateLimit,
  ChatBotConfig,
  ChatBotRequestContext,
  ReemUIMessage,
} from "@/types/configs/chatbot";
import { sanitizeChatInput, isChatSpam, getClientIP } from "@/lib/security";
import { positiveIntEnv } from "@/lib/env";
import { REEM_SYSTEM_PROMPT } from "@/data/main/chatbot-system-prompt";
import {
  anonymizeIP,
  isChatLoggingEnabled,
  shouldAnonymizeIP,
} from "@/lib/chatbot-logging";
import { prisma } from "@/lib/configs/prisma";

// Streaming replies outlive the default function budget on slower models.
export const maxDuration = 30;

// Environment configuration with validation
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL;
const CHATBOT_ENABLED = process.env.CHATBOT_ENABLED === "true";

// Every limit below is enforced with a `>` comparison or a Zod `.max()`, both of
// which silently misbehave against `NaN` — see `positiveIntEnv` for what a typo'd
// value used to cost. A malformed value now falls back to the default and says so.
const chatbotConfig: ChatBotConfig = {
  maxMessagesPerSession: positiveIntEnv("CHATBOT_MAX_MESSAGES_PER_SESSION", 20),
  maxMessageLength: positiveIntEnv("CHATBOT_MAX_MESSAGE_LENGTH", 1000),
  rateLimitPerMinute: positiveIntEnv("CHATBOT_RATE_LIMIT_PER_MINUTE", 10),
  rateLimitPerHour: positiveIntEnv("CHATBOT_RATE_LIMIT_PER_HOUR", 50),
  systemPrompt: REEM_SYSTEM_PROMPT,
};

// Said once per cold start rather than once per request: with the flag on but no
// model configured the route answers SERVICE_UNAVAILABLE to everyone, and that is
// indistinguishable from the chatbot being switched off on purpose.
if (CHATBOT_ENABLED && !OPENAI_CHAT_MODEL) {
  console.error(
    "[chatbot] CHATBOT_ENABLED is true but OPENAI_CHAT_MODEL is unset — every request will answer SERVICE_UNAVAILABLE.",
  );
}

/**
 * The conversation itself now lives on the client and arrives with every request,
 * so this schema only validates the envelope around it. `messages` is checked
 * structurally by `validateUIMessages` further down.
 */
const chatRequestSchema = z.object({
  messages: z
    .array(z.unknown())
    .min(1, "Conversation cannot be empty")
    .max(chatbotConfig.maxMessagesPerSession, "Conversation too long"),
  sessionId: z
    .string()
    .regex(/^session_[0-9]+_[a-f0-9]+$/, "Invalid session ID format")
    .optional(),
  context: z
    .object({
      page: z.string().max(200).optional(),
      userAgent: z.string().max(500).optional(),
      language: z.string().max(10).optional(),
    })
    .optional(),
  consentGiven: z.boolean().optional(),
});

// In-memory rate limiting. Per-instance on Vercel, so treat it as a speed bump
// rather than a hard guarantee.
const rateLimits = new Map<string, ChatBotRateLimit>();

// Utility functions
function generateSessionId(): string {
  const rand = randomBytes(16).toString("hex"); // 32 hex chars
  return `session_${Date.now()}_${rand}`;
}

/**
 * Ids for the assistant turn. Without this the SDK leaves `responseMessage.id`
 * empty on the server and lets the client mint one, which is no good here —
 * it is the primary key the transcript is stored under.
 */
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

function getRetryAfterSeconds(clientIP: string): number {
  const limit = rateLimits.get(clientIP);
  if (!limit) return 60;

  const nextMinuteReset = limit.minute.windowStart + 60000;
  return Math.max(1, Math.ceil((nextMinuteReset - Date.now()) / 1000));
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

/**
 * Errors reach the client as a bare code so the UI can translate them. Provider
 * error text is deliberately dropped — it can contain account and model details.
 */
function errorResponse(
  code: ChatBotErrorCode,
  status: number,
  headers?: Record<string, string>,
): NextResponse {
  return new NextResponse(code, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", ...headers },
  });
}

/**
 * Records why a turn failed, server-side only.
 *
 * The client receives a bare code and nothing else, which is what keeps provider
 * text out of the UI — but on its own that also means a bad `OPENAI_CHAT_MODEL`,
 * an expired key and a malformed payload are indistinguishable from the outside
 * and leave nothing behind to debug.
 *
 * What this must never record: message text, IP address, user agent, or the
 * session id. The privacy notice promises that nothing about an exchange stays
 * on the server once the reply has been sent unless the visitor consented to
 * storage, and these lines outlive the request. Correlate a report to a specific
 * request through Vercel's own `x-vercel-id` rather than minting an identifier
 * here. Anything added below must stay non-identifying: codes, counts, lengths.
 */
function diagnostic(
  level: "warn" | "error",
  stage: string,
  error?: unknown,
): void {
  let detail = "";
  if (error instanceof Error) {
    detail = ` — ${error.name}: ${error.message}`;
  } else if (error !== undefined) {
    detail = ` — ${String(error)}`;
  }

  // Capped: provider messages run long and occasionally quote the payload back.
  const line = `[chatbot] ${stage}${detail}`.slice(0, 500);

  if (level === "warn") console.warn(line);
  else console.error(line);
}

/**
 * Refuses the turn and says why. Every 400 below is a bare `INVALID_INPUT` to the
 * caller, so without a reason recorded here "the bot rejects everything" is an
 * unanswerable bug report — which is exactly how a malformed limit env var used
 * to present.
 */
function rejectInvalid(reason: string): NextResponse {
  diagnostic("warn", `rejected: ${reason}`);
  return errorResponse("INVALID_INPUT", 400);
}

const CHATBOT_ERROR_CODES: readonly string[] = [
  "RATE_LIMIT_EXCEEDED",
  "QUOTA_EXCEEDED",
  "INVALID_INPUT",
  "SERVICE_UNAVAILABLE",
  "TIMEOUT",
];

/**
 * True when the error is just our own code coming back around.
 *
 * The SDK surfaces a failed stream to `onError` twice: once carrying the real
 * provider error, then again wrapping the bare string the first call returned.
 * Only the first tells you anything, so the second is dropped rather than
 * writing `Error: SERVICE_UNAVAILABLE` under every genuine diagnostic.
 */
function isAlreadyMappedCode(error: unknown): boolean {
  return error instanceof Error && CHATBOT_ERROR_CODES.includes(error.message);
}

function toErrorCode(error: unknown): ChatBotErrorCode {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (
    message.includes("rate limit") ||
    message.includes("quota") ||
    message.includes("429")
  ) {
    return "QUOTA_EXCEEDED";
  }

  if (message.includes("timeout") || message.includes("aborted")) {
    return "TIMEOUT";
  }

  return "SERVICE_UNAVAILABLE";
}

/** Flattens a UI message's text parts into the plain string we store and moderate. */
function extractText(message: ReemUIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();
}

/**
 * Log chat session and messages to database (if logging is enabled AND user consented)
 */
async function logChatToDB(
  sessionId: string,
  clientIP: string,
  userMessage: ReemUIMessage,
  assistantMessage: ReemUIMessage,
  context: ChatBotRequestContext | undefined,
  consentGiven: boolean,
): Promise<void> {
  if (!isChatLoggingEnabled()) {
    return; // Logging disabled
  }

  // GDPR Compliance: If user declined consent, don't save ANY data
  if (!consentGiven) {
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
          userAgent: context?.userAgent || null,
          language: context?.language || null,
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

    // Log this turn's two messages. Message IDs are generated on the client and
    // the whole history is replayed on every request, so a retry can re-present
    // an ID that is already stored — skipDuplicates keeps that from throwing.
    await prisma.chatMessage.createMany({
      data: [
        {
          id: userMessage.id,
          sessionId,
          role: "user",
          content: extractText(userMessage),
          timestamp: new Date(userMessage.metadata?.createdAt ?? Date.now()),
          status: "sent",
          pageContext: context?.page || null,
          errorDetails: null,
        },
        {
          id: assistantMessage.id,
          sessionId,
          role: "assistant",
          content: extractText(assistantMessage),
          timestamp: new Date(
            assistantMessage.metadata?.createdAt ?? Date.now(),
          ),
          status: "sent",
          pageContext: context?.page || null,
          errorDetails: null,
        },
      ],
      skipDuplicates: true,
    });
  } catch (error) {
    // Name only: a Prisma error can quote the offending row back, and the row
    // here is the visitor's message. Never throw — losing the transcript must
    // not cost the user their reply.
    diagnostic(
      "error",
      `persisting the transcript failed (${
        error instanceof Error ? error.name : "unknown error"
      })`,
    );
  }
}

// API Routes
export async function POST(request: NextRequest): Promise<Response> {
  // Check if chatbot is enabled
  if (!CHATBOT_ENABLED || !OPENAI_CHAT_MODEL) {
    return errorResponse("SERVICE_UNAVAILABLE", 503);
  }

  // Get client IP and check rate limiting
  const clientIP = getClientIP(request);

  if (isRateLimited(clientIP)) {
    return errorResponse("RATE_LIMIT_EXCEEDED", 429, {
      "Retry-After": String(getRetryAfterSeconds(clientIP)),
    });
  }

  // Cleanup stale rate limit entries periodically during requests
  if (Math.random() < 0.1) {
    cleanupRateLimits();
  }

  // Validate content type
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return rejectInvalid("content-type is not application/json");
  }

  // Parse and validate the request envelope
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    // Zod issue paths and messages are our own strings and carry no user text.
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    return rejectInvalid(`request envelope failed validation — ${issues}`);
  }

  const { sessionId = generateSessionId(), context, consentGiven } = parsed.data;

  // Structurally validate the client-supplied conversation
  let uiMessages: ReemUIMessage[];
  try {
    uiMessages = await validateUIMessages<ReemUIMessage>({
      messages: parsed.data.messages,
    });
  } catch (error) {
    // Name only, deliberately: this error is derived from the message parts
    // themselves, so its text can quote the conversation back at us.
    return rejectInvalid(
      `conversation failed structural validation (${
        error instanceof Error ? error.name : "unknown error"
      })`,
    );
  }

  // The client owns the history now, so a forged system turn would be a direct
  // route around REEM_SYSTEM_PROMPT. The system prompt is set server-side only.
  if (uiMessages.some((message) => message.role === "system")) {
    return rejectInvalid("client supplied a system turn");
  }

  const lastMessage = uiMessages[uiMessages.length - 1];
  if (!lastMessage || lastMessage.role !== "user") {
    return rejectInvalid("last message is not a user turn");
  }

  // Moderate the turn the user actually just typed. Split apart so the logs say
  // which rule fired — "too long" and "looks like spam" need different fixes.
  const rawText = extractText(lastMessage);
  if (!rawText) {
    return rejectInvalid("last user turn carries no text");
  }
  if (rawText.length > chatbotConfig.maxMessageLength) {
    return rejectInvalid(
      `message length ${rawText.length} exceeds limit ${chatbotConfig.maxMessageLength}`,
    );
  }
  if (isChatSpam(rawText)) {
    return rejectInvalid(`message classified as spam (length ${rawText.length})`);
  }

  const sanitizedText = sanitizeChatInput(rawText);
  if (!sanitizedText) {
    return rejectInvalid("message was empty after sanitisation");
  }

  // Feed the model the sanitized text rather than the raw client string
  const sanitizedLastMessage: ReemUIMessage = {
    ...lastMessage,
    parts: [{ type: "text", text: sanitizedText }],
  };
  const conversation = [...uiMessages.slice(0, -1), sanitizedLastMessage];

  // Only one user message means this is the opening turn of the conversation
  let systemPrompt = chatbotConfig.systemPrompt;
  if (conversation.length === 1) {
    systemPrompt += `\n\nIMPORTANT: This is the user's first message in this conversation. Start warmly and briefly introduce yourself only if it helps. If the user picked a guided starter like website, automation, projects, pricing, or contact, route them directly and include the most relevant source links.`;
  }

  const result = streamText({
    model: openai(OPENAI_CHAT_MODEL),
    system: systemPrompt,
    messages: await convertToModelMessages(conversation),
    maxOutputTokens: 1024,
    abortSignal: request.signal,
    experimental_transform: smoothStream({ chunking: "word" }),
    // `store: false` opts the request out of OpenAI-side response retention.
    // The Responses API defaults it to true and the SDK omits the field unless
    // it is set here, so this is load-bearing: the privacy notice promises it.
    providerOptions: { openai: { store: false } },
  });

  return result.toUIMessageStreamResponse<ReemUIMessage>({
    originalMessages: conversation,
    generateMessageId,
    messageMetadata: ({ part }) =>
      part.type === "start" ? { createdAt: Date.now() } : undefined,
    onFinish: ({ responseMessage, isAborted }) => {
      if (isAborted) return;

      void logChatToDB(
        sessionId,
        clientIP,
        sanitizedLastMessage,
        responseMessage,
        context,
        consentGiven ?? false,
      );
    },
    // `toErrorCode` collapses everything into one of five codes for the client;
    // this is the only place the original error is still available, so it gets
    // recorded before being thrown away.
    onError: (error) => {
      const code = toErrorCode(error);
      if (!isAlreadyMappedCode(error)) {
        diagnostic(
          "error",
          `stream failed as ${code} (model=${OPENAI_CHAT_MODEL})`,
          error,
        );
      }
      return code;
    },
  });
}

/**
 * Availability probe. Deliberately exposes nothing about the assistant itself:
 * the prompt's facts and policy stay server-side, so this cannot be used to
 * enumerate services, pricing or behaviour without talking to Reem.
 */
export function GET(): NextResponse<{
  status: string;
  config: Partial<ChatBotConfig>;
}> {
  return NextResponse.json({
    status: CHATBOT_ENABLED ? "available" : "disabled",
    config: {
      maxMessageLength: chatbotConfig.maxMessageLength,
      maxMessagesPerSession: chatbotConfig.maxMessagesPerSession,
    },
  });
}
