/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ChevronDown, Shield } from "lucide-react";
import type { ChatConsentProps } from "@/types/configs/chatbot";
import { CHATBOT_TRANSLATION_KEYS } from "./ChatBot.constants";

/**
 * One-line logging opt-in above the input. It never blocks the chat: the API
 * stores nothing unless `consentGiven` is true, so ignoring this is a decline.
 * Both answers carry the same weight on purpose.
 */
export const ChatConsent = React.memo(function ChatConsent({
  onAccept,
  onDecline,
}: ChatConsentProps) {
  const t = useTranslations("ChatBot");
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mx-3 mb-1 shrink-0 rounded-2xl border border-border/60 bg-muted/40 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Shield
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        {/* basis keeps the question readable; the buttons wrap below it instead */}
        <p className="min-w-0 flex-1 basis-40 text-xs leading-snug text-foreground">
          {t(CHATBOT_TRANSLATION_KEYS.CONSENT_PROMPT)}{" "}
          <button
            type="button"
            onClick={() => setShowDetails((open) => !open)}
            aria-expanded={showDetails}
            aria-controls="chatbot-consent-details"
            className="inline-flex cursor-pointer items-center gap-0.5 font-medium text-foreground underline underline-offset-2 hover:decoration-2"
          >
            {t(CHATBOT_TRANSLATION_KEYS.CONSENT_DETAILS)}
            <ChevronDown
              className={`size-3 transition-transform ${showDetails ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onAccept}
            className="h-7 rounded-full px-3 text-xs"
          >
            {t(CHATBOT_TRANSLATION_KEYS.CONSENT_ACCEPT)}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDecline}
            className="h-7 rounded-full px-3 text-xs"
          >
            {t(CHATBOT_TRANSLATION_KEYS.CONSENT_DECLINE)}
          </Button>
        </div>
      </div>
      {/* Always mounted so aria-controls never points at a missing id */}
      <p
        id="chatbot-consent-details"
        hidden={!showDetails}
        className="mt-2 text-xs leading-relaxed text-muted-foreground"
      >
        {t(CHATBOT_TRANSLATION_KEYS.CONSENT_DESCRIPTION)}
      </p>
    </div>
  );
});
