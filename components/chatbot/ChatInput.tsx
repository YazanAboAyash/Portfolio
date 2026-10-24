/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Square } from "lucide-react";
import type { ChatInputProps } from "@/types/configs/chatbot";
import { CHATBOT_CONFIG, CHATBOT_TRANSLATION_KEYS } from "./ChatBot.constants";

const COUNTER_FROM = Math.floor(
  CHATBOT_CONFIG.INPUT_MAX_LENGTH * CHATBOT_CONFIG.INPUT_COUNTER_THRESHOLD,
);

export const ChatInput = React.memo(
  React.forwardRef<HTMLTextAreaElement, ChatInputProps>(function ChatInput(
    { onSendMessage, status, onStop, disabled = false, className = "" },
    ref,
  ) {
    const [inputValue, setInputValue] = useState("");
    const t = useTranslations("ChatBot");

    const isLoading = status === "submitted" || status === "streaming";
    // maxLength stops typing/pasting past the cap; the counter shows near it
    const showCounter = inputValue.length >= COUNTER_FROM;
    const isAtLimit = inputValue.length >= CHATBOT_CONFIG.INPUT_MAX_LENGTH;
    const canSend =
      inputValue.trim().length >= CHATBOT_CONFIG.INPUT_MIN_LENGTH && !disabled;

    const submit = async () => {
      // The field stays editable while Reem replies (disabling it would drop
      // focus and close the keyboard on phones); only sending waits.
      if (!canSend || isLoading) return;

      // Basic client-side input sanitization
      const sanitizedMessage = inputValue
        .trim()
        .substring(0, CHATBOT_CONFIG.INPUT_MAX_LENGTH);

      setInputValue("");

      try {
        await onSendMessage(sanitizedMessage);
      } catch {
        // Error is handled by the parent component
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter sends, Shift+Enter adds a line; never send mid IME composition
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        void submit();
      }
    };

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className={`shrink-0 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3 ${className}`}
        aria-label={t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_MESSAGE_FORM)}
      >
        <div className="flex items-end gap-2 rounded-3xl border border-border bg-background py-1.5 pr-1.5 pl-4 transition-colors focus-within:border-ring">
          <Textarea
            ref={ref}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t(CHATBOT_TRANSLATION_KEYS.INPUT_PLACEHOLDER)}
            disabled={disabled}
            className="max-h-32 min-h-0 flex-1 resize-none overflow-y-auto rounded-none border-0 bg-transparent px-0 py-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
            maxLength={CHATBOT_CONFIG.INPUT_MAX_LENGTH}
            aria-describedby="chatbot-character-limit"
            aria-label={t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_TYPE_MESSAGE)}
          />
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              onClick={onStop}
              className="size-8 shrink-0 rounded-full"
              title={t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_STOP_GENERATING)}
            >
              <Square className="size-3 fill-current" aria-hidden="true" />
              <span className="sr-only">
                {t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_STOP_GENERATING)}
              </span>
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              disabled={!canSend}
              className="size-8 shrink-0 rounded-full"
              title={t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_SEND_MESSAGE)}
            >
              <ArrowUp aria-hidden="true" />
              <span className="sr-only">
                {t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_SEND_MESSAGE)}
              </span>
            </Button>
          )}
        </div>
        {showCounter && (
          <p
            className={`mt-1 pr-3 text-right text-xs tabular-nums ${isAtLimit ? "text-destructive" : "text-muted-foreground"}`}
            aria-hidden="true"
          >
            {t(CHATBOT_TRANSLATION_KEYS.INPUT_CHARACTER_COUNT, {
              count: inputValue.length,
              max: CHATBOT_CONFIG.INPUT_MAX_LENGTH,
            })}
          </p>
        )}
        <span
          id="chatbot-character-limit"
          aria-live="polite"
          className="sr-only"
        >
          {isAtLimit
            ? t(CHATBOT_TRANSLATION_KEYS.INPUT_LIMIT_REACHED, {
                max: CHATBOT_CONFIG.INPUT_MAX_LENGTH,
              })
            : ""}
        </span>
      </form>
    );
  }),
);
