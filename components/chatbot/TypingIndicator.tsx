/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ThinkingOrb } from "thinking-orbs";
import type { TypingIndicatorProps } from "@/types/configs/chatbot";
import { CHATBOT_CONFIG, CHATBOT_TRANSLATION_KEYS } from "./ChatBot.constants";

export const TypingIndicator = React.memo(function TypingIndicator({
  className = "",
}: TypingIndicatorProps) {
  const t = useTranslations("ChatBot");

  // Deliberately quiet: just the animated orb, sitting where Reem's avatar sits on
  // a reply. Screen readers get the status text, so the orb's own role="img" label
  // is hidden to avoid a double (untranslated) announcement. theme="auto" follows
  // the next-themes `dark` class; reduced motion gets a static frame.
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="flex size-6 shrink-0 items-center justify-center">
        <ThinkingOrb
          state={CHATBOT_CONFIG.TYPING_ORB.STATE}
          size={CHATBOT_CONFIG.TYPING_ORB.SIZE}
          aria-hidden="true"
        />
      </span>
      <span className="sr-only">
        {t(CHATBOT_TRANSLATION_KEYS.TYPING_THINKING)}
      </span>
    </div>
  );
});
