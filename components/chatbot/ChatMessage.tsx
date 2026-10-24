/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Blobatar } from "@blobatar/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessageProps, ReemUIMessage } from "@/types/configs/chatbot";
import { CHATBOT_CONFIG, CHATBOT_TRANSLATION_KEYS } from "./ChatBot.constants";

// Security helper to limit message content length for display
function sanitizeMessageForDisplay(content: string): string {
  return content.substring(0, CHATBOT_CONFIG.MESSAGE_DISPLAY_LIMIT);
}

/** A UI message carries its text across one or more parts; the transcript shows them joined. */
function joinTextParts(message: ReemUIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function isSafeMarkdownHref(href: string | undefined): href is string {
  if (!href) return false;

  return (
    href.startsWith("/") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:")
  );
}

const LINK_CLASSES =
  "font-medium text-blue-600 underline underline-offset-4 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 wrap-break-word";

export const ChatMessage = React.memo(function ChatMessage({
  message,
  failed = false,
  className = "",
}: ChatMessageProps) {
  const t = useTranslations("ChatBot");
  const isUser = message.role === "user";

  const sanitizedContent = React.useMemo(
    () => sanitizeMessageForDisplay(joinTextParts(message)),
    [message],
  );
  const formattedTime = React.useMemo(
    () =>
      new Date(message.metadata?.createdAt ?? Date.now()).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      ),
    [message.metadata?.createdAt],
  );

  // The assistant turn exists before its first token; render nothing until text arrives
  if (!isUser && !sanitizedContent) return null;

  const label = t(
    isUser
      ? CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_YOUR_MESSAGE_AT
      : CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_ASSISTANT_MESSAGE_AT,
    { time: formattedTime },
  );

  if (isUser) {
    return (
      <div
        className={`flex flex-col items-end gap-1 ${className}`}
        role="article"
        aria-label={label}
      >
        <div
          className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-foreground"
          title={formattedTime}
        >
          {sanitizedContent}
        </div>
        {failed && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3" aria-hidden="true" />
            {t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_MESSAGE_FAILED)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 ${className}`}
      role="article"
      aria-label={label}
    >
      <Blobatar
        name={CHATBOT_CONFIG.AVATAR_SEED}
        className="mt-0.5 size-6 shrink-0"
        alt=""
        aria-hidden="true"
      />
      <div
        className="min-w-0 flex-1 text-sm leading-relaxed text-foreground select-text"
        title={formattedTime}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node: _node, href, children, ...props }) => {
              if (!isSafeMarkdownHref(href)) {
                return <span>{children}</span>;
              }

              const isExternal = href.startsWith("https://");

              return (
                <a
                  {...props}
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={LINK_CLASSES}
                >
                  {children}
                </a>
              );
            },
            p: ({ node: _node, children }) => (
              <p className="mb-2 last:mb-0">{children}</p>
            ),
            ul: ({ node: _node, children }) => (
              <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>
            ),
            ol: ({ node: _node, children }) => (
              <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>
            ),
            li: ({ node: _node, children }) => (
              <li className="pl-1">{children}</li>
            ),
            strong: ({ node: _node, children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
            pre: ({ node: _node, children }) => (
              <pre className="my-2 overflow-x-auto rounded-md bg-muted p-2 text-xs [&_code]:bg-transparent [&_code]:p-0">
                {children}
              </pre>
            ),
            code: ({ node: _node, children }) => (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
                {children}
              </code>
            ),
          }}
        >
          {sanitizedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
});

export default ChatMessage;
