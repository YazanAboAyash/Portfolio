/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Blobatar } from "@blobatar/react";
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
  const dotDelays = [
    CHATBOT_CONFIG.BOUNCE_DELAY.FIRST,
    CHATBOT_CONFIG.BOUNCE_DELAY.SECOND,
    CHATBOT_CONFIG.BOUNCE_DELAY.THIRD,
  ];

  // Deliberately quiet: animated avatar + dots, no label or bubble. Screen readers get the status text.
  return (
    <div
      className={`flex justify-start ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <Blobatar
          name={CHATBOT_CONFIG.AVATAR_SEED}
          animate="always"
          className="size-6"
          aria-hidden="true"
        />
        <span className="text-xs text-muted-foreground font-medium">
          {t(CHATBOT_TRANSLATION_KEYS.NAME)}
        </span>
        <div className="flex items-center gap-1 ml-1" aria-hidden="true">
          {dotDelays.map((delay) => (
            <span
              key={delay}
              className={`w-1.5 h-1.5 bg-muted-foreground/60 ${CHATBOT_STYLES.BUTTON_ROUNDED} ${CHATBOT_STYLES.BOUNCE_ANIMATION}`}
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
        <span className="sr-only">
          {t(CHATBOT_TRANSLATION_KEYS.TYPING_THINKING)}
        </span>
      </div>
    </div>
  );
});
