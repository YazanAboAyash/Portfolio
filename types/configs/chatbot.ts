/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { ChatStatus, UIMessage } from "ai";

/**
 * Per-message metadata streamed alongside the assistant reply. `UIMessage` has no
 * timestamp of its own, but the transcript renders one, so the server stamps it on
 * the stream's `start` part and it travels with the message into localStorage.
 */
export interface ReemMessageMetadata {
  createdAt: number;
}

export type ReemUIMessage = UIMessage<ReemMessageMetadata>;

/**
 * Failures are reported to the client as a bare code, never as prose: `useChat`
 * surfaces a non-2xx body verbatim as `error.message`, so anything human-readable
 * put here would bypass i18n and could leak provider internals. The client maps
 * these onto translated strings.
 */
export type ChatBotErrorCode =
  | "RATE_LIMIT_EXCEEDED"
  | "QUOTA_EXCEEDED"
  | "INVALID_INPUT"
  | "SERVICE_UNAVAILABLE"
  | "TIMEOUT";

export interface ChatBotConfig {
  maxMessagesPerSession: number;
  maxMessageLength: number;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  systemPrompt: string;
}

/**
 * Fields the client sends alongside the `messages` array. `useChat` owns `messages`
 * itself; everything here rides along via the transport body.
 */
export interface ChatBotRequestContext {
  page?: string | undefined;
  userAgent?: string | undefined;
  language?: string | undefined;
}

export interface ChatBotUIProps {
  className?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: "light" | "dark" | "system";
}

export interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  status: ChatStatus;
  onStop: () => void;
  disabled?: boolean;
  className?: string;
}

export interface ChatMessageProps {
  message: ReemUIMessage;
  /** True for the assistant message currently receiving tokens. */
  isStreaming?: boolean;
  /** Delivery state, only meaningful for the most recent user message. */
  status?: "sent" | "error";
  className?: string;
}

export interface ChatHeaderProps {
  onClose: () => void;
  onNewChat: () => void;
  className?: string;
}

// Rate Limiting Types
export interface RateLimitEntry {
  count: number;
  windowStart: number;
  lastRequest: number;
}

export interface ChatBotRateLimit {
  minute: RateLimitEntry;
  hour: RateLimitEntry;
}

// Chat Logging Types
export interface ChatSessionLog {
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
  messages?: ChatMessageLog[];
}

export interface ChatMessageLog {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status: string | null;
  pageContext: string | null;
  errorDetails: string | null;
}

export interface ChatLogsResponse {
  sessions: ChatSessionLog[];
  total: number;
  hasMore: boolean;
}
