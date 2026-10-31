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
import { LOCALE_NAMES } from "@/data/configs/i18n";
import { SEARCH_PAGES } from "@/data/configs/search";
import { SITE_ACTION_NAMES } from "@/data/configs/site-actions";
import { parseSiteAction } from "@/lib/site-actions";
import { CHATBOT_TRANSLATION_KEYS } from "./ChatBot.constants";

type ToolPart = Extract<
  ChatToolChipsProps["message"]["parts"][number],
  { toolCallId: string }
>;

const isSiteActionPart = (part: ToolPart) =>
  (SITE_ACTION_NAMES as readonly string[]).includes(getToolName(part));

function ToolChip({ part, label }: { part: ToolPart; label: string }) {
  const t = useTranslations("ChatBot");
  const pending =
    part.state === "input-streaming" || part.state === "input-available";
  const failed =
    part.state === "output-error" ||
    (part.state === "output-available" &&
      typeof part.output === "object" &&
      part.output !== null &&
      "error" in part.output);

  return (
    <li className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
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
}

/**
 * One chip per tool Reem ran for a reply, so the visitor can see what the
 * answer is based on. A tool that failed upstream still completes, carrying
 * `{ error }` as its output, and is shown as unavailable. Site actions are
 * listed apart, labelled with what was done.
 */
export const ChatToolChips = React.memo(function ChatToolChips({
  message,
}: ChatToolChipsProps) {
  const t = useTranslations("ChatBot");
  const tNav = useTranslations("Navigation");
  const tSections = useTranslations("SectionRail.sections");
  const toolParts = message.parts.filter(isToolUIPart);
  if (toolParts.length === 0) return null;

  const lookups = toolParts.filter((part) => !isSiteActionPart(part));
  const actions = toolParts.filter(isSiteActionPart);

  const lookupLabel = (part: ToolPart) => {
    const labelKey = `tools.${getToolName(part)}`;
    return t.has(labelKey)
      ? t(labelKey)
      : t(CHATBOT_TRANSLATION_KEYS.TOOLS_FALLBACK);
  };

  // The input is still streaming (or was rejected) until it parses
  const actionLabel = (part: ToolPart) => {
    const action = parseSiteAction(getToolName(part), part.input);
    if (!action) return t(CHATBOT_TRANSLATION_KEYS.TOOLS_ACTION_FALLBACK);

    switch (action.name) {
      case "navigate": {
        const page = SEARCH_PAGES.find(
          (entry) => entry.href === action.input.href,
        );
        return t("tools.navigate", {
          page: page ? tNav(page.labelKey) : action.input.href,
        });
      }
      case "scroll_to_section":
        return t("tools.scroll_to_section", {
          section: tSections(action.input.section),
        });
      case "set_theme":
        return t("tools.set_theme", { theme: action.input.theme });
      case "set_language":
        return t("tools.set_language", {
          language: LOCALE_NAMES[action.input.locale],
        });
      case "highlight_project":
        return t("tools.highlight_project", { project: action.input.title });
    }
  };

  return (
    <>
      {lookups.length > 0 && (
        <ul
          className="mb-2 flex flex-wrap gap-1.5"
          aria-label={t(CHATBOT_TRANSLATION_KEYS.TOOLS_LABEL)}
        >
          {lookups.map((part) => (
            <ToolChip
              key={part.toolCallId}
              part={part}
              label={lookupLabel(part)}
            />
          ))}
        </ul>
      )}
      {actions.length > 0 && (
        <ul
          className="mb-2 flex flex-wrap gap-1.5"
          aria-label={t(CHATBOT_TRANSLATION_KEYS.TOOLS_ACTIONS_LABEL)}
        >
          {actions.map((part) => (
            <ToolChip
              key={part.toolCallId}
              part={part}
              label={actionLabel(part)}
            />
          ))}
        </ul>
      )}
    </>
  );
});

export default ChatToolChips;
