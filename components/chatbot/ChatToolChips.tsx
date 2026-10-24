/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Check, LoaderCircle } from "lucide-react";
import { getToolName, isToolUIPart } from "ai";
import type { ChatToolChipsProps } from "@/types/configs/chatbot";
import { CHATBOT_TRANSLATION_KEYS } from "./ChatBot.constants";

/**
 * One chip per tool Reem ran for a reply, so the visitor can see what the
 * answer is based on. A tool that failed upstream still completes, carrying
 * `{ error }` as its output, and is shown as unavailable.
 */
export const ChatToolChips = React.memo(function ChatToolChips({
  message,
}: ChatToolChipsProps) {
  const t = useTranslations("ChatBot");
  const toolParts = message.parts.filter(isToolUIPart);
  if (toolParts.length === 0) return null;

  return (
    <ul
      className="mb-2 flex flex-wrap gap-1.5"
      aria-label={t(CHATBOT_TRANSLATION_KEYS.TOOLS_LABEL)}
    >
      {toolParts.map((part) => {
        const labelKey = `tools.${getToolName(part)}`;
        const label = t.has(labelKey)
          ? t(labelKey)
          : t(CHATBOT_TRANSLATION_KEYS.TOOLS_FALLBACK);
        const pending =
          part.state === "input-streaming" || part.state === "input-available";
        const failed =
          part.state === "output-error" ||
          (part.state === "output-available" &&
            typeof part.output === "object" &&
            part.output !== null &&
            "error" in part.output);

        return (
          <li
            key={part.toolCallId}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
          >
            {pending ? (
              <LoaderCircle
                className="size-3 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : failed ? (
              <AlertCircle className="size-3" aria-hidden="true" />
            ) : (
              <Check className="size-3" aria-hidden="true" />
            )}
            {label}
            {failed && (
              <span className="sr-only">
                {" "}
                ({t(CHATBOT_TRANSLATION_KEYS.TOOLS_FAILED)})
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
});

export default ChatToolChips;
