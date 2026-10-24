/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RotateCcw, X } from "lucide-react";
import { Blobatar } from "@blobatar/react";
import type { ChatHeaderProps } from "@/types/configs/chatbot";
import { CHATBOT_CONFIG, CHATBOT_TRANSLATION_KEYS } from "./ChatBot.constants";

export const ChatHeader = React.memo(function ChatHeader({
  onClose,
  onNewChat,
  hasMessages,
  isThinking,
  className = "",
}: ChatHeaderProps) {
  const t = useTranslations("ChatBot");

  return (
    <div
      className={`flex shrink-0 items-center justify-between gap-3 border-b border-border/60 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-3 ${className}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Blobatar
          name={CHATBOT_CONFIG.AVATAR_SEED}
          animate={isThinking ? "always" : "hover"}
          className="size-9 shrink-0"
          aria-hidden="true"
        />
        <div className="flex min-w-0 flex-col">
          <h2
            className="flex items-baseline gap-2 text-base leading-tight font-semibold text-foreground"
            id="chatbot-title"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Focusable so keyboard users can reach the pronunciation too */}
                <span tabIndex={0} className="rounded-sm cursor-help">
                  {t(CHATBOT_TRANSLATION_KEYS.NAME)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <span className="sr-only">
                  {t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_PRONUNCIATION)}:{" "}
                </span>
                {t(CHATBOT_TRANSLATION_KEYS.PRONUNCIATION)}
              </TooltipContent>
            </Tooltip>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              v{CHATBOT_CONFIG.VERSION}
            </span>
          </h2>
          <p
            className="truncate text-xs text-muted-foreground"
            id="chatbot-subtitle"
          >
            {t(CHATBOT_TRANSLATION_KEYS.SUBTITLE)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          disabled={!hasMessages}
          className="size-9 rounded-full"
          title={t(CHATBOT_TRANSLATION_KEYS.NEW_CHAT)}
        >
          <RotateCcw aria-hidden="true" />
          <span className="sr-only">{t(CHATBOT_TRANSLATION_KEYS.NEW_CHAT)}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-9 rounded-full"
          title={t(CHATBOT_TRANSLATION_KEYS.CLOSE_CHAT)}
        >
          <X aria-hidden="true" />
          <span className="sr-only">
            {t(CHATBOT_TRANSLATION_KEYS.CLOSE_CHAT)}
          </span>
        </Button>
      </div>
    </div>
  );
});
