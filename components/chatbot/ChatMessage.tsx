/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessageProps, ReemUIMessage } from "@/types/configs/chatbot";
import {
  CHATBOT_CONFIG,
  CHATBOT_STYLES,
  CHATBOT_TRANSLATION_KEYS,
} from "./ChatBot.constants";

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

export const ChatMessage = React.memo(function ChatMessage({
  message,
  isStreaming = false,
  status,
  className = "",
}: ChatMessageProps) {
  const t = useTranslations("ChatBot");
  const isUser = message.role === "user";

  const sanitizedContent = React.useMemo(
    () => sanitizeMessageForDisplay(joinTextParts(message)),
    [message]
  );
  const formattedTime = React.useMemo(
    () =>
      new Date(message.metadata?.createdAt ?? Date.now()).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    [message.metadata?.createdAt]
  );

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } group ${className}`}
      role="article"
      aria-label={`${
        isUser ? "Your" : "Assistant"
      } message from ${formattedTime}`}
    >
      <div className={`max-w-[85%] ${isUser ? "order-2" : "order-1"}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-6 h-6 ${CHATBOT_STYLES.BUTTON_ROUNDED} ${CHATBOT_STYLES.AVATAR_GRADIENT} flex items-center justify-center`}
              role="img"
              aria-label="Assistant avatar"
            >
              <Bot
                className="w-3 h-3 text-primary-foreground"
                aria-hidden="true"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {t(CHATBOT_TRANSLATION_KEYS.NAME)}
            </span>
            {isStreaming && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5"
                role="status"
              >
                <Loader2
                  className={`w-3 h-3 mr-1 ${CHATBOT_STYLES.SPIN_ANIMATION}`}
                  aria-hidden="true"
                />
                {t(CHATBOT_TRANSLATION_KEYS.STATUS_SENDING)}
              </Badge>
            )}
          </div>
        )}

        <div
          className={`p-3 ${
            CHATBOT_STYLES.MESSAGE_ROUNDED
          } text-sm leading-relaxed shadow-sm transition-all duration-200 group-hover:shadow-md ${
            isUser
              ? `${CHATBOT_STYLES.MESSAGE_USER_GRADIENT} text-primary-foreground ${CHATBOT_STYLES.MESSAGE_USER_CORNER}`
              : `${CHATBOT_STYLES.MESSAGE_BORDER} ${CHATBOT_STYLES.MESSAGE_ASSISTANT_CORNER} select-text [&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-blue-500 dark:[&_a]:text-blue-400 dark:[&_a:hover]:text-blue-300`
          }`}
          role="text"
          aria-describedby={isUser ? undefined : "assistant-message-info"}
        >
          {isUser ? (
            <span>{sanitizedContent}</span>
          ) : (
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
                      className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 wrap-break-word"
                    >
                      {children}
                    </a>
                  );
                },
                p: ({ node: _node, children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ node: _node, children }) => (
                  <ul className="my-2 ml-4 list-disc space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ node: _node, children }) => (
                  <ol className="my-2 ml-4 list-decimal space-y-1">
                    {children}
                  </ol>
                ),
                li: ({ node: _node, children }) => (
                  <li className="pl-1">{children}</li>
                ),
                strong: ({ node: _node, children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
              }}
            >
              {sanitizedContent}
            </ReactMarkdown>
          )}
        </div>

        {isUser && (
          <div
            className="flex items-center justify-end gap-2 mt-1"
            id="message-status"
          >
            <span
              className="text-xs text-muted-foreground"
              aria-label={`Sent at ${formattedTime}`}
            >
              {formattedTime}
            </span>
            {status === "sent" && (
              <CheckCircle2
                className="w-3 h-3 text-green-500"
                aria-label="Message sent successfully"
              />
            )}
            {status === "error" && (
              <AlertCircle
                className="w-3 h-3 text-destructive"
                aria-label="Message failed to send"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatMessage;
