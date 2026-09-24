/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ThinkingOrb } from "thinking-orbs";
import { CHATBOT_CONFIG, CHATBOT_TRANSLATION_KEYS } from "./ChatBot.constants";

export interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator = React.memo(function TypingIndicator({
  className = "",
}: TypingIndicatorProps) {
  const t = useTranslations("ChatBot");

  // Deliberately quiet: animated orb + name, no bubble. Screen readers get the status text,
  // so the orb's own role="img" label is hidden to avoid a double (untranslated) announcement.
  // theme="auto" follows the next-themes `dark` class; reduced motion gets a static frame.
  return (
    <div
      className={`flex justify-start ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <ThinkingOrb
          state={CHATBOT_CONFIG.TYPING_ORB.STATE}
          size={CHATBOT_CONFIG.TYPING_ORB.SIZE}
          aria-hidden="true"
        />
        <span className="text-xs text-muted-foreground font-medium">
          {t(CHATBOT_TRANSLATION_KEYS.NAME)}
        </span>
        <span className="sr-only">
          {t(CHATBOT_TRANSLATION_KEYS.TYPING_THINKING)}
        </span>
      </div>
    </div>
  );
});
