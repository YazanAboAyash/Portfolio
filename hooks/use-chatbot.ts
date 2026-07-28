/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  ChatMessage,
  ChatBotResponse,
  ChatBotApiError,
} from "@/types/configs/chatbot";
import { CHATBOT_FALLBACK_MESSAGES } from "@/components/chatbot/ChatBot.constants";

interface UseChatBotReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  consentGiven: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  clearMessages: () => void;
  setConsent: (consent: boolean) => void;
}

// Storage keys for persistence
const STORAGE_KEY_MESSAGES = "chatbot_messages";
const STORAGE_KEY_SESSION = "chatbot_session";
const STORAGE_KEY_CONSENT = "chatbot_consent";

interface PersistedChatState {
  messages: ChatMessage[];
  sessionId: string | null;
  consentGiven: boolean;
}

const EMPTY_PERSISTED_STATE: PersistedChatState = {
  messages: [],
  sessionId: null,
  consentGiven: false,
};

/**
 * Read the previous conversation back out of localStorage. Runs as a lazy state
 * initializer rather than in an effect, so the restored conversation is present
 * on the first client render instead of causing a second one. On the server this
 * returns the empty state, which is what the panel renders while closed.
 */
function loadPersistedState(): PersistedChatState {
  if (typeof window === "undefined") {
    return EMPTY_PERSISTED_STATE;
  }

  try {
    const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const savedSession = localStorage.getItem(STORAGE_KEY_SESSION);
    const savedConsent = localStorage.getItem(STORAGE_KEY_CONSENT);

    return {
      // Convert timestamp strings back to Date objects
      messages: savedMessages
        ? (JSON.parse(savedMessages) as ChatMessage[]).map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        : [],
      sessionId: savedSession,
      consentGiven: savedConsent === "true",
    };
  } catch {
    // Clear corrupted data silently
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_CONSENT);
    return EMPTY_PERSISTED_STATE;
  }
}

export function useChatBot(): UseChatBotReturn {
  const [persisted] = useState(loadPersistedState);
  const [messages, setMessages] = useState<ChatMessage[]>(persisted.messages);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(persisted.consentGiven);
  const sessionIdRef = useRef<string | null>(persisted.sessionId);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
      } catch {
        // Storage quota exceeded or disabled - fail silently
      }
    }
  }, [messages]);

  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && sessionIdRef.current) {
      try {
        localStorage.setItem(STORAGE_KEY_SESSION, sessionIdRef.current);
      } catch {
        // Storage quota exceeded or disabled - fail silently
      }
    }
  }, []);

  // Clear chat history when user leaves the page completely
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleBeforeUnload = () => {
        localStorage.removeItem(STORAGE_KEY_MESSAGES);
        localStorage.removeItem(STORAGE_KEY_SESSION);
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }

    // Return empty cleanup function if window is not available
    return () => {};
  }, []);

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    sessionIdRef.current = null;

    // Also clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem(STORAGE_KEY_CONSENT);
    }
  }, []);

  const setConsent = useCallback((consent: boolean) => {
    setConsentGiven(consent);
    // Save consent to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_CONSENT, String(consent));
      } catch {
        // Storage quota exceeded or disabled - fail silently
      }
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim() || isLoading) return;

      // Clear any existing error
      setError(null);
      setIsLoading(true);

      // Create user message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        status: "sending",
      };

      // Add user message to UI
      setMessages((prev) => [...prev, userMessage]);

      try {
        const requestBody = {
          message: content.trim(),
          sessionId: sessionIdRef.current || undefined,
          context: {
            page:
              typeof window !== "undefined"
                ? window.location.pathname
                : undefined,
            userAgent:
              typeof window !== "undefined" ? navigator.userAgent : undefined,
            language:
              typeof window !== "undefined"
                ? navigator.language || undefined
                : undefined,
          },
          consentGiven, // Include consent status
        };

        const response = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        const data = (await response.json()) as
          | ChatBotResponse
          | ChatBotApiError;

        // Update user message status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: "sent" } : msg,
          ),
        );

        if (!response.ok || !("success" in data) || !data.success) {
          const errorData = data as ChatBotApiError;

          // Handle quota exceeded specifically
          if (errorData.code === "QUOTA_EXCEEDED" && errorData.retryAfter) {
            const retrySeconds = Math.ceil(errorData.retryAfter);
            throw new Error(
              `Reem is taking a short break. Please try again in ${retrySeconds} seconds.`,
            );
          }

          throw new Error(errorData.error || "Failed to send message");
        }

        if (!data.data) {
          throw new Error("Invalid response from server");
        }

        // Store session ID for future requests
        sessionIdRef.current = data.data.sessionId;

        // Save session ID to localStorage
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(STORAGE_KEY_SESSION, data.data.sessionId);
          } catch {
            // Storage quota exceeded or disabled - fail silently
          }
        }

        // Create assistant message
        const assistantMessage: ChatMessage = {
          id: data.data.messageId,
          role: "assistant",
          content: data.data.message,
          timestamp: new Date(),
          status: "sent",
        };

        // Add assistant message to UI
        setMessages((prev) => [...prev, assistantMessage]);

        setIsConnected(true);
      } catch (err) {
        // Update user message status to error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id ? { ...msg, status: "error" } : msg,
          ),
        );

        // Determine appropriate fallback message
        let errorMessage = CHATBOT_FALLBACK_MESSAGES.GENERIC_ERROR;

        if (err instanceof Error) {
          const errMsg = err.message.toLowerCase();

          if (
            errMsg.includes("network") ||
            errMsg.includes("fetch") ||
            errMsg.includes("connection")
          ) {
            errorMessage = CHATBOT_FALLBACK_MESSAGES.NETWORK_ERROR;
            setIsConnected(false);
          } else if (
            errMsg.includes("quota") ||
            errMsg.includes("rate limit") ||
            errMsg.includes("too many")
          ) {
            errorMessage = CHATBOT_FALLBACK_MESSAGES.RATE_LIMIT_ERROR;
          } else if (errMsg.includes("taking a short break")) {
            errorMessage = CHATBOT_FALLBACK_MESSAGES.QUOTA_EXCEEDED;
          } else if (errMsg.includes("timeout")) {
            errorMessage = CHATBOT_FALLBACK_MESSAGES.TIMEOUT_ERROR;
          } else if (
            errMsg.includes("validation") ||
            errMsg.includes("invalid")
          ) {
            errorMessage = CHATBOT_FALLBACK_MESSAGES.VALIDATION_ERROR;
          } else if (err.message && !errMsg.includes("failed to send")) {
            // Use the original error message if it's user-friendly
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, consentGiven],
  );

  return {
    messages,
    isLoading,
    isConnected,
    error,
    consentGiven,
    sendMessage,
    clearError,
    clearMessages,
    setConsent,
  };
}
