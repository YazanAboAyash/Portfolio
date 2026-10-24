/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CircleAlert } from "lucide-react";
import { Blobatar } from "@blobatar/react";
import "blobatar/motion.css";
import { useChatBot } from "@/hooks/use-chatbot";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import type { ChatBotUIProps } from "@/types/configs/chatbot";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatWelcome } from "./ChatWelcome";
import { ChatConsent } from "./ChatConsent";
import { TypingIndicator } from "./TypingIndicator";
import { CHATBOT_CONFIG, CHATBOT_TRANSLATION_KEYS } from "./ChatBot.constants";

/**
 * Mouse and keyboard users land in the input. On touch screens focusing it would
 * raise the keyboard over the suggestions, so focus goes to the panel instead.
 */
function prefersInputFocus(): boolean {
  return window.matchMedia("(pointer: fine)").matches;
}

export function ChatBot({ className = "" }: ChatBotUIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  // Whether new content should keep the log scrolled to the end. Cleared when
  // the visitor scrolls up to reread, so streaming does not yank them back down.
  const stickToBottomRef = useRef(true);
  const returnFocusRef = useRef(false);
  const t = useTranslations("ChatBot");
  const cookieConsent = useCookieConsent();

  const {
    messages,
    status,
    isLoading,
    errorKey,
    consentAnswered,
    sendMessage,
    stop,
    clearError,
    clearMessages,
    setConsent,
  } = useChatBot();

  const lastMessage = messages[messages.length - 1];
  // Covers both "submitted" and a stream that has opened but not yet sent text
  const awaitingFirstToken =
    isLoading &&
    !(
      lastMessage?.role === "assistant" &&
      lastMessage.parts.some((part) => part.type === "text" && part.text)
    );

  const showConsent = !consentAnswered && messages.length === 0;

  // Hold the launcher back until the cookie choice is made, so a first visit
  // does not stack three prompts at once; returning visitors see it quickly.
  useEffect(() => {
    if (isVisible) return;

    const delay =
      cookieConsent === null
        ? CHATBOT_CONFIG.FIRST_VISIT_FALLBACK_DELAY
        : CHATBOT_CONFIG.VISIBILITY_DELAY;
    const timer = setTimeout(() => setIsVisible(true), delay);

    return () => clearTimeout(timer);
  }, [cookieConsent, isVisible]);

  // Keep the newest message in view unless the visitor has scrolled away
  useEffect(() => {
    const log = logRef.current;
    if (!log || !stickToBottomRef.current) return;

    log.scrollTop = log.scrollHeight;
  }, [messages, awaitingFirstToken, errorKey, isOpen]);

  // Move focus into the panel on open and back to the launcher on close
  useEffect(() => {
    if (isOpen) {
      (prefersInputFocus() ? chatInputRef.current : panelRef.current)?.focus();
    } else if (returnFocusRef.current) {
      returnFocusRef.current = false;
      launcherRef.current?.focus();
    }
  }, [isOpen]);

  // Escape closes from anywhere: focus can fall back to <body> when the element
  // holding it unmounts (a suggestion, once the conversation starts)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      returnFocusRef.current = true;
      setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleOpenChat = () => {
    // A stale error from an earlier visit should not greet the visitor
    clearError();
    stickToBottomRef.current = true;
    setIsOpen(true);
  };

  const handleCloseChat = () => {
    returnFocusRef.current = true;
    setIsOpen(false);
  };

  const handleLogScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    stickToBottomRef.current =
      scrollHeight - scrollTop - clientHeight <
      CHATBOT_CONFIG.STICK_TO_BOTTOM_THRESHOLD;
  };

  const handleNewChat = () => {
    clearMessages();
    clearError();
    stickToBottomRef.current = true;
    chatInputRef.current?.focus();
  };

  const handleSendMessage = async (message: string) => {
    stickToBottomRef.current = true;

    try {
      await sendMessage(message);
    } catch {
      // Error is handled by the hook and displayed to user
    }
  };

  if (!isVisible) return null;

  if (!isOpen) {
    return (
      <Button
        ref={launcherRef}
        onClick={handleOpenChat}
        size="icon"
        className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-50 size-14 cursor-pointer rounded-full border border-primary/20 shadow-lg transition-transform hover:scale-105 animate-in fade-in-0 zoom-in-75 duration-300 motion-reduce:animate-none motion-reduce:hover:scale-100 md:bottom-6 md:left-6 ${className}`}
        title={t(CHATBOT_TRANSLATION_KEYS.OPEN_ASSISTANT)}
      >
        {/* size-* class opts out of the Button's [&_svg]:size-4 override */}
        <Blobatar
          name={CHATBOT_CONFIG.AVATAR_SEED}
          animate="always"
          className="size-10"
          aria-hidden="true"
        />
        <span className="sr-only">
          {t(CHATBOT_TRANSLATION_KEYS.OPEN_ASSISTANT)}
        </span>
      </Button>
    );
  }

  // Full screen on phones; a panel anchored where the launcher sits from `sm` up
  return (
    <div
      ref={panelRef}
      className={`fixed inset-0 z-50 flex h-dvh flex-col bg-background outline-none animate-in fade-in-0 slide-in-from-bottom-4 duration-200 motion-reduce:animate-none sm:inset-auto sm:bottom-4 sm:left-4 sm:h-[min(40rem,calc(100dvh-6rem))] sm:w-100 sm:origin-bottom-left sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl sm:zoom-in-95 md:bottom-6 md:left-6 ${className}`}
      role="dialog"
      aria-labelledby="chatbot-title"
      aria-describedby="chatbot-subtitle"
      aria-modal="false"
      tabIndex={-1}
    >
      <ChatHeader
        onClose={handleCloseChat}
        onNewChat={handleNewChat}
        hasMessages={messages.length > 0}
        isThinking={isLoading}
      />

      {/* Focusable so keyboard users can scroll a transcript with no links in it */}
      <div
        ref={logRef}
        onScroll={handleLogScroll}
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
        role="log"
        aria-live="polite"
        aria-label={t(CHATBOT_TRANSLATION_KEYS.ACCESSIBILITY_CHAT_CONVERSATION)}
      >
        <div className="flex flex-col gap-5">
          {messages.length === 0 && !isLoading && (
            <ChatWelcome
              onSuggestionSelect={(suggestion) => {
                // The clicked button unmounts with the welcome screen
                (prefersInputFocus()
                  ? chatInputRef.current
                  : panelRef.current
                )?.focus();
                void handleSendMessage(suggestion);
              }}
            />
          )}

          {messages.map((message) => (
            <ChatMessageComponent
              key={message.id}
              message={message}
              failed={
                message.id === lastMessage?.id &&
                message.role === "user" &&
                status === "error"
              }
            />
          ))}

          {awaitingFirstToken && <TypingIndicator />}

          {errorKey && (
            <div
              className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              <CircleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{t(errorKey)}</span>
            </div>
          )}
        </div>
      </div>

      {showConsent && (
        <ChatConsent
          onAccept={() => setConsent(true)}
          onDecline={() => setConsent(false)}
        />
      )}

      <ChatInput
        onSendMessage={handleSendMessage}
        status={status}
        onStop={stop}
        ref={chatInputRef}
      />
    </div>
  );
}

export default ChatBot;
