/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { OrbSize, OrbState } from "thinking-orbs";
import type { ChatBotErrorCode } from "@/types/configs/chatbot";

export const CHATBOT_CONFIG = {
  // Launcher timing. A first-time visitor already gets the cookie banner and the
  // language toast, so the launcher waits for the cookie choice instead of
  // joining them; FIRST_VISIT_FALLBACK_DELAY covers a banner closed without one.
  VISIBILITY_DELAY: 2000,
  FIRST_VISIT_FALLBACK_DELAY: 15000,

  // Message Limits
  MESSAGE_DISPLAY_LIMIT: 2000, // Max characters to display per message
  INPUT_MAX_LENGTH: 500, // Max input length — keep in sync with CHATBOT_MAX_MESSAGE_LENGTH (api/chatbot)
  INPUT_MIN_LENGTH: 2, // Min input length to prevent spam
  INPUT_COUNTER_THRESHOLD: 0.8, // Share of the limit at which the counter appears

  // Distance from the bottom (px) within which new content keeps the log pinned
  STICK_TO_BOTTOM_THRESHOLD: 80,

  // thinking-orbs typing indicator — 20 is the tuned inline-text preset
  TYPING_ORB: {
    STATE: "working" as OrbState,
    SIZE: 20 as OrbSize,
  },

  // Blobatar seed for every Reem avatar — hashed, never shown; changing it changes the face
  AVATAR_SEED: "Reem",
};

export const CHATBOT_TRANSLATION_KEYS = {
  // Main Labels
  NAME: "name",
  PRONUNCIATION: "pronunciation",
  SUBTITLE: "subtitle",

  // Actions
  OPEN_ASSISTANT: "openAssistant",
  CLOSE_CHAT: "closeChat",
  NEW_CHAT: "newChat",

  // Greeting
  GREETING_TITLE: "greeting.title",
  GREETING_DESCRIPTION: "greeting.description",

  // Starter questions on the empty state; each one is sent as typed
  SUGGESTIONS_LABEL: "suggestions.label",
  SUGGESTIONS: [
    "suggestions.projects",
    "suggestions.stack",
    "suggestions.availability",
    "suggestions.site",
  ],

  // Consent
  CONSENT_PROMPT: "consent.prompt",
  CONSENT_DESCRIPTION: "consent.description",
  CONSENT_DETAILS: "consent.details",
  CONSENT_ACCEPT: "consent.accept",
  CONSENT_DECLINE: "consent.decline",

  // Typing Indicator
  TYPING_THINKING: "typing.thinking",

  // Input
  INPUT_PLACEHOLDER: "input.placeholder",
  INPUT_CHARACTER_COUNT: "input.characterCount",
  INPUT_LIMIT_REACHED: "input.limitReached",

  // Errors are resolved through CHATBOT_ERROR_TRANSLATION_KEYS below, keyed by
  // the API's error codes rather than listed individually here.

  // Accessibility
  ACCESSIBILITY_SEND_MESSAGE: "accessibility.sendMessage",
  ACCESSIBILITY_STOP_GENERATING: "accessibility.stopGenerating",
  ACCESSIBILITY_CHAT_CONVERSATION: "accessibility.chatConversation",
  ACCESSIBILITY_PRONUNCIATION: "accessibility.pronunciation",
  ACCESSIBILITY_MESSAGE_FORM: "accessibility.messageForm",
  ACCESSIBILITY_TYPE_MESSAGE: "accessibility.typeMessage",
  ACCESSIBILITY_YOUR_MESSAGE_AT: "accessibility.yourMessageAt",
  ACCESSIBILITY_ASSISTANT_MESSAGE_AT: "accessibility.assistantMessageAt",
  ACCESSIBILITY_MESSAGE_FAILED: "accessibility.messageFailed",
} as const;

/**
 * Maps the bare error codes the API returns onto `ChatBot` translation keys.
 * The API never sends prose, so every failure the user sees is localised.
 */
export const CHATBOT_ERROR_TRANSLATION_KEYS: Record<
  ChatBotErrorCode | "NETWORK" | "UNKNOWN",
  string
> = {
  RATE_LIMIT_EXCEEDED: "errors.rateLimit",
  QUOTA_EXCEEDED: "errors.quotaExceeded",
  INVALID_INPUT: "errors.validation",
  SESSION_LIMIT_REACHED: "errors.sessionLimit",
  SERVICE_UNAVAILABLE: "errors.serviceUnavailable",
  TIMEOUT: "errors.timeout",
  NETWORK: "errors.network",
  UNKNOWN: "errors.generic",
};
