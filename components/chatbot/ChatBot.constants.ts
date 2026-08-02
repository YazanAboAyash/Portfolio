/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { ChatBotErrorCode } from "@/types/configs/chatbot";

export const CHATBOT_CONFIG = {
  // UI Constants
  DEFAULT_BOTTOM_OFFSET: 4, // 6 * 4 (1.5rem in Tailwind)
  FOOTER_PADDING: 4, // Extra padding to avoid footer overlap
  VISIBILITY_DELAY: 4000, // Show ChatBot button after 4 seconds

  // Message Limits
  MESSAGE_DISPLAY_LIMIT: 2000, // Max characters to display per message
  INPUT_MAX_LENGTH: 1000, // Max input length
  INPUT_MIN_LENGTH: 2, // Min input length to prevent spam

  // Chat Dimensions - Responsive
  CHAT_WIDTH: {
    DESKTOP: "24rem", // w-96 equivalent (384px)
    MOBILE: "20rem", // w-80 equivalent (320px) - balanced for mobile
    SMALL: "18rem", // w-72 equivalent (288px) - for very small screens if needed
  },
  CHAT_MIN_HEIGHT: {
    DESKTOP: "28rem", // min-h-[28rem]
    MOBILE: "24rem", // min-h-[24rem] - more compact on mobile
  },
  CHAT_MAX_HEIGHT: {
    DESKTOP: "32rem", // max-h-[32rem]
    MOBILE: "28rem", // max-h-[28rem] - more compact on mobile
  },
  MESSAGES_MAX_HEIGHT: {
    DESKTOP: "20rem", // max-h-[20rem]
    MOBILE: "16rem", // max-h-[16rem] - more compact on mobile
  },

  // Animation & Timing
  SCROLL_BEHAVIOR: "smooth" as ScrollBehavior,
  ANIMATION_DURATION: 300, // transition duration in ms
  BOUNCE_DELAY: {
    FIRST: -0.3, // [animation-delay:-0.3s]
    SECOND: -0.15, // [animation-delay:-0.15s]
    THIRD: 0, // no delay
  },

  // UI Sizing
  BUTTON_SIZE: {
    WIDTH: "3.5rem", // w-14
    HEIGHT: "3.5rem", // h-14
  },
  AVATAR_SIZE: {
    SMALL: {
      WIDTH: "1.5rem", // w-6
      HEIGHT: "1.5rem", // h-6
      ICON: "0.75rem", // w-3 h-3
    },
    MEDIUM: {
      WIDTH: "2.5rem", // w-10
      HEIGHT: "2.5rem", // h-10
      ICON: "1.25rem", // w-5 h-5
    },
  },

  // Position Classes - Responsive
  POSITION_CLASSES: {
    "bottom-left": "bottom-2 left-2 sm:left-4 md:left-6", // Progressive spacing increase
    "bottom-right": "right-2 sm:right-4 md:right-6", // Progressive spacing increase
    "top-left": "top-6 left-2 sm:left-4 md:left-6",
    "top-right": "top-6 right-2 sm:right-4 md:right-6",
  },

  // Responsive Width Classes
  RESPONSIVE_WIDTH_CLASSES: "w-80 sm:w-96", // 320px → 384px (good balance for mobile vs desktop)

  // Mobile breakpoint
  MOBILE_BREAKPOINT: 640, // Tailwind's sm breakpoint
};

export const CHATBOT_STYLES = {
  // Gradient Classes
  BUTTON_GRADIENT:
    "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
  AVATAR_GRADIENT: "bg-gradient-to-br from-primary to-primary/70",
  MESSAGE_USER_GRADIENT: "bg-gradient-to-br from-primary to-primary/90",
  WELCOME_ICON_GRADIENT: "bg-gradient-to-br from-primary/20 to-primary/10",

  // Shadow Classes
  BUTTON_SHADOW: "shadow-2xl hover:shadow-3xl",
  CARD_SHADOW: "shadow-2xl",
  INPUT_SHADOW: "shadow-lg hover:shadow-xl",

  // Border Classes
  CARD_BORDER: "border border-border/50 bg-background/95 backdrop-blur-xl",
  HEADER_BORDER: "border-b border-border/50",
  MESSAGE_BORDER: "bg-muted/80 backdrop-blur-sm border border-border/50",
  INPUT_BORDER: "bg-background border-border/50 focus:border-primary/50",

  // Rounded Classes
  BUTTON_ROUNDED: "rounded-full",
  MESSAGE_ROUNDED: "rounded-2xl",
  MESSAGE_USER_CORNER: "rounded-br-md",
  MESSAGE_ASSISTANT_CORNER: "rounded-bl-md",
  INPUT_ROUNDED: "rounded-full",

  // Animation Classes
  BOT_ANIMATION: "animate-subtle-shake",
  SPIN_ANIMATION: "animate-spin",
  BOUNCE_ANIMATION: "animate-bounce",

  // Scrollbar Classes
  SCROLLBAR: "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
};

export const CHATBOT_TRANSLATION_KEYS = {
  // Main Labels
  NAME: "name",
  PRONUNCIATION: "pronunciation",
  SUBTITLE: "subtitle",

  // Actions
  OPEN_ASSISTANT: "openAssistant",
  CLOSE_CHAT: "closeChat",

  // Greeting
  GREETING_TITLE: "greeting.title",
  GREETING_DESCRIPTION: "greeting.description",

  // Typing Indicator
  TYPING_STATUS: "typing.status",
  TYPING_THINKING: "typing.thinking",
  TYPING_PROCESSING: "typing.processing",

  // Status
  STATUS_GENERATING: "status.generating",

  // Input
  INPUT_PLACEHOLDER: "input.placeholder",
  INPUT_CHARACTER_LIMIT: "input.characterLimit",

  // Errors are resolved through CHATBOT_ERROR_TRANSLATION_KEYS below, keyed by
  // the API's error codes rather than listed individually here.

  // Accessibility
  ACCESSIBILITY_SEND_MESSAGE: "accessibility.sendMessage",
  ACCESSIBILITY_STOP_GENERATING: "accessibility.stopGenerating",
};

export const CHATBOT_GUIDED_ACTION_KEYS = [
  "guidedActions.website",
  "guidedActions.automation",
  "guidedActions.projects",
  "guidedActions.pricing",
  "guidedActions.contact",
] as const;

/**
 * Maps the bare error codes the API returns onto `ChatBot` translation keys.
 * The API never sends prose, so every failure the user sees is localised.
 */
export const CHATBOT_ERROR_TRANSLATION_KEYS: Record<
  ChatBotErrorCode | "NETWORK" | "UNKNOWN",
  string
> = {
  RATE_LIMIT_EXCEEDED: "errors.rateLimit",
  QUOTA_EXCEEDED: "errors.quotaExceeded",
  INVALID_INPUT: "errors.validation",
  SERVICE_UNAVAILABLE: "errors.serviceUnavailable",
  TIMEOUT: "errors.timeout",
  NETWORK: "errors.network",
  UNKNOWN: "errors.generic",
};
