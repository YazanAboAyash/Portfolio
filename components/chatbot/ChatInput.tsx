/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Square } from "lucide-react";
import type { ChatInputProps } from "@/types/configs/chatbot";
import {
  CHATBOT_CONFIG,
  CHATBOT_STYLES,
  CHATBOT_TRANSLATION_KEYS,
} from "./ChatBot.constants";

export const ChatInput = React.memo(
  React.forwardRef<HTMLInputElement, ChatInputProps>(function ChatInput(
    { onSendMessage, status, onStop, disabled = false, className = "" },
    ref,
  ) {
    const [inputValue, setInputValue] = useState("");
    const t = useTranslations("ChatBot");

    const isLoading = status === "submitted" || status === "streaming";

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isLoading || disabled) return;

      // Basic client-side input sanitization
      const sanitizedMessage = inputValue
        .trim()
        .substring(0, CHATBOT_CONFIG.INPUT_MAX_LENGTH);

      // Simple spam detection
      if (sanitizedMessage.length < CHATBOT_CONFIG.INPUT_MIN_LENGTH) return;

      setInputValue("");

      try {
        await onSendMessage(sanitizedMessage);
      } catch {
        // Error is handled by the parent component
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Allow Shift+Enter for new lines, but Enter alone submits
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSubmit(e as React.FormEvent);
      }
    };

    return (
      <div
        className={`p-2 sm:p-3 bg-muted/20 shrink-0 ${className}`}
        role="form"
      >
        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="flex gap-2 sm:gap-3"
          aria-label="Send message to assistant"
        >
          <div className="flex-1 relative">
            <Input
              ref={ref}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t(CHATBOT_TRANSLATION_KEYS.INPUT_PLACEHOLDER)}
              disabled={isLoading || disabled}
              className={`pr-12 ${CHATBOT_STYLES.INPUT_BORDER} ${CHATBOT_STYLES.INPUT_ROUNDED} transition-all duration-200 placeholder:text-muted-foreground/60`}
              maxLength={CHATBOT_CONFIG.INPUT_MAX_LENGTH}
              aria-describedby="character-count"
              aria-label="Type your message"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <span
                className="text-xs text-muted-foreground"
                id="character-count"
                aria-live="polite"
              >
                {inputValue.length}
                {t(CHATBOT_TRANSLATION_KEYS.INPUT_CHARACTER_LIMIT)}
              </span>
            </div>
          </div>
          {isLoading ? (
            <Button
              type="button"
              onClick={onStop}
              className={`px-4 ${CHATBOT_STYLES.BUTTON_GRADIENT} ${CHATBOT_STYLES.INPUT_ROUNDED} ${CHATBOT_STYLES.INPUT_SHADOW} transition-all duration-200`}
              aria-label={t(
                CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_STOP_GENERATING,
              )}
              title={t(
                CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_STOP_GENERATING,
              )}
            >
              <Square className="h-4 w-4 fill-current" aria-hidden="true" />
              <span className="sr-only">
                {t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_STOP_GENERATING)}
              </span>
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!inputValue.trim() || disabled}
              className={`px-4 ${CHATBOT_STYLES.BUTTON_GRADIENT} ${CHATBOT_STYLES.INPUT_ROUNDED} ${CHATBOT_STYLES.INPUT_SHADOW} transition-all duration-200`}
              aria-label={t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_SEND_MESSAGE)}
              title={t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_SEND_MESSAGE)}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">
                {t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_SEND_MESSAGE)}
              </span>
            </Button>
          )}
        </form>
      </div>
    );
  }),
);
