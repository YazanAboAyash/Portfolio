/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type ChatStatus } from "ai";
import type {
  ChatBotErrorCode,
  ReemUIMessage,
} from "@/types/configs/chatbot";
import { CHATBOT_ERROR_TRANSLATION_KEYS } from "@/components/chatbot/ChatBot.constants";

interface UseChatBotReturn {
  messages: ReemUIMessage[];
  status: ChatStatus;
  isLoading: boolean;
  /** Translation key for the current error, or null. */
  errorKey: string | null;
  consentGiven: boolean;
  sendMessage: (content: string) => Promise<void>;
  stop: () => void;
  clearError: () => void;
  clearMessages: () => void;
  setConsent: (consent: boolean) => void;
}

// Storage keys for persistence
const STORAGE_KEY_MESSAGES = "chatbot_messages";
const STORAGE_KEY_SESSION = "chatbot_session";
const STORAGE_KEY_CONSENT = "chatbot_consent";

const SESSION_ID_PATTERN = /^session_[0-9]+_[a-f0-9]+$/;

interface PersistedChatState {
  messages: ReemUIMessage[];
  sessionId: string;
  consentGiven: boolean;
}

/** Mirrors the format the API validates and Prisma stores as the session key. */
function generateSessionId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const rand = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );

  return `session_${Date.now()}_${rand}`;
}

/**
 * Read the previous conversation back out of localStorage. Runs as a lazy state
 * initializer rather than in an effect, so the restored conversation is present
 * on the first client render instead of causing a second one. On the server this
 * returns an empty state, which is what the panel renders while closed.
 */
function loadPersistedState(): PersistedChatState {
  if (typeof window === "undefined") {
    return { messages: [], sessionId: "", consentGiven: false };
  }

  try {
    const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const savedSession = localStorage.getItem(STORAGE_KEY_SESSION);
    const savedConsent = localStorage.getItem(STORAGE_KEY_CONSENT);

    return {
      messages: savedMessages
        ? (JSON.parse(savedMessages) as ReemUIMessage[])
        : [],
      sessionId:
        savedSession && SESSION_ID_PATTERN.test(savedSession)
          ? savedSession
          : generateSessionId(),
      consentGiven: savedConsent === "true",
    };
  } catch {
    // Clear corrupted data silently
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_CONSENT);
    return { messages: [], sessionId: generateSessionId(), consentGiven: false };
  }
}

/**
 * `useChat` reports a failed request by throwing with the raw response body as
 * the message, so the API's bare error codes arrive here verbatim.
 */
function toErrorTranslationKey(error: Error | undefined): string | null {
  if (!error) return null;

  const code = error.message.trim() as ChatBotErrorCode;
  if (code in CHATBOT_ERROR_TRANSLATION_KEYS) {
    return CHATBOT_ERROR_TRANSLATION_KEYS[code];
  }

  // A fetch that never reached the route (offline, DNS, CORS) rejects with a
  // TypeError rather than a response body.
  if (error instanceof TypeError) {
    return CHATBOT_ERROR_TRANSLATION_KEYS.NETWORK;
  }

  return CHATBOT_ERROR_TRANSLATION_KEYS.UNKNOWN;
}

export function useChatBot(): UseChatBotReturn {
  const [persisted] = useState(loadPersistedState);
  const [sessionId, setSessionId] = useState(persisted.sessionId);
  const [consentGiven, setConsentGiven] = useState(persisted.consentGiven);

  const {
    messages,
    sendMessage: send,
    status,
    error,
    stop,
    setMessages,
    clearError,
  } = useChat<ReemUIMessage>({
    id: sessionId,
    messages: persisted.messages,
    // `useChat` re-reads the transport on every send rather than capturing it
    // once, so rebuilding it each render is what keeps `consentGiven` current —
    // toggling consent mid-conversation takes effect on the very next message.
    // `body` stays a function so the page context is sampled at send time.
    transport: new DefaultChatTransport<ReemUIMessage>({
      api: "/api/chatbot",
      body: () => ({
        sessionId,
        consentGiven,
        context: {
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          language: navigator.language || undefined,
        },
      }),
    }),
  });

  // Persist the transcript so it survives a reload
  useEffect(() => {
    if (messages.length === 0) return;

    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch {
      // Storage quota exceeded or disabled - fail silently
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, sessionId);
    } catch {
      // Storage quota exceeded or disabled - fail silently
    }
  }, [sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(generateSessionId());

    try {
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem(STORAGE_KEY_CONSENT);
    } catch {
      // Storage disabled - fail silently
    }
  }, [setMessages]);

  const setConsent = useCallback((consent: boolean) => {
    setConsentGiven(consent);

    try {
      localStorage.setItem(STORAGE_KEY_CONSENT, String(consent));
    } catch {
      // Storage quota exceeded or disabled - fail silently
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      const text = content.trim();
      if (!text || status === "submitted" || status === "streaming") return;

      await send({
        text,
        metadata: { createdAt: Date.now() },
      });
    },
    [send, status],
  );

  return {
    messages,
    status,
    isLoading: status === "submitted" || status === "streaming",
    errorKey: toErrorTranslationKey(error),
    consentGiven,
    sendMessage,
    stop,
    clearError,
    clearMessages,
    setConsent,
  };
}
