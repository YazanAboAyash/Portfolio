/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";
import {
  CHATBOT_CONFIG,
  CHATBOT_STYLES,
  CHATBOT_TRANSLATION_KEYS,
} from "./ChatBot.constants";

export interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator = React.memo(function TypingIndicator({
  className = "",
}: TypingIndicatorProps) {
  const t = useTranslations("ChatBot");

  return (
    <div
      className={`flex justify-start ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-[80%]">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-6 h-6 ${CHATBOT_STYLES.BUTTON_ROUNDED} ${CHATBOT_STYLES.AVATAR_GRADIENT} flex items-center justify-center`}
            role="img"
            aria-label={t(
              CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_ASSISTANT_AVATAR,
            )}
          >
            <Bot
              className="w-3 h-3 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {t(CHATBOT_TRANSLATION_KEYS.TYPING_STATUS)}
          </span>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
            {t(CHATBOT_TRANSLATION_KEYS.TYPING_THINKING)}
          </Badge>
        </div>
        <div
          className={`${CHATBOT_STYLES.MESSAGE_BORDER} p-3 rounded-lg`}
          aria-describedby="typing-description"
        >
          <div className="flex items-center gap-1">
            <div
              className="flex space-x-1"
              role="img"
              aria-label={t(
                CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_TYPING_ANIMATION,
              )}
            >
              <div
                className={`w-2 h-2 bg-primary/60 ${CHATBOT_STYLES.BUTTON_ROUNDED} ${CHATBOT_STYLES.BOUNCE_ANIMATION}`}
                style={{
                  animationDelay: `${CHATBOT_CONFIG.BOUNCE_DELAY.FIRST}s`,
                }}
                aria-hidden="true"
              ></div>
              <div
                className={`w-2 h-2 bg-primary/60 ${CHATBOT_STYLES.BUTTON_ROUNDED} ${CHATBOT_STYLES.BOUNCE_ANIMATION}`}
                style={{
                  animationDelay: `${CHATBOT_CONFIG.BOUNCE_DELAY.SECOND}s`,
                }}
                aria-hidden="true"
              ></div>
              <div
                className={`w-2 h-2 bg-primary/60 ${CHATBOT_STYLES.BUTTON_ROUNDED} ${CHATBOT_STYLES.BOUNCE_ANIMATION}`}
                style={{
                  animationDelay: `${CHATBOT_CONFIG.BOUNCE_DELAY.THIRD}s`,
                }}
                aria-hidden="true"
              ></div>
            </div>
            <span
              className="text-xs text-muted-foreground ml-2"
              id="typing-description"
            >
              {t(CHATBOT_TRANSLATION_KEYS.TYPING_PROCESSING)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
