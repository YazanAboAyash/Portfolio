/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Blobatar } from "@blobatar/react";
import type { ChatWelcomeProps } from "@/types/configs/chatbot";
import { CHATBOT_CONFIG, CHATBOT_TRANSLATION_KEYS } from "./ChatBot.constants";

/** Empty state: who Reem is, plus a few questions worth asking first. */
export const ChatWelcome = React.memo(function ChatWelcome({
  onSuggestionSelect,
  disabled = false,
}: ChatWelcomeProps) {
  const t = useTranslations("ChatBot");

  return (
    <section
      className="flex flex-col gap-5 pt-2"
      aria-labelledby="chatbot-welcome-title"
    >
      <div className="flex flex-col items-start gap-3">
        <Blobatar
          name={CHATBOT_CONFIG.AVATAR_SEED}
          animate="always"
          className="size-12"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          <h3
            className="text-lg leading-snug font-semibold text-foreground"
            id="chatbot-welcome-title"
          >
            {t(CHATBOT_TRANSLATION_KEYS.GREETING_TITLE)}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t(CHATBOT_TRANSLATION_KEYS.GREETING_DESCRIPTION)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          {t(CHATBOT_TRANSLATION_KEYS.SUGGESTIONS_LABEL)}
        </p>
        <ul className="flex flex-col gap-2">
          {CHATBOT_TRANSLATION_KEYS.SUGGESTIONS.map((key) => {
            const suggestion = t(key);

            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onSuggestionSelect(suggestion)}
                  disabled={disabled}
                  className="w-full cursor-pointer rounded-xl border border-border px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
});
