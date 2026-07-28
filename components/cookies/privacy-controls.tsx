/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw, Trash2 } from "lucide-react";
import { useCookieConsent, useConsentActions } from "./use-cookie-consent";

const CHATBOT_STORAGE_KEYS = [
  "chatbot_messages",
  "chatbot_session",
  "chatbot_consent",
] as const;

/**
 * Art. 7(3) DSGVO requires withdrawing consent to be as easy as giving it. The
 * banner only ever appears once, so this is the permanent home for that control.
 */
export function PrivacyControls() {
  const t = useTranslations("Privacy.controls");
  const consent = useCookieConsent();
  const { accept, decline, withdraw } = useConsentActions();
  const [chatCleared, setChatCleared] = useState(false);

  const statusKey =
    consent === "accepted"
      ? "statusAccepted"
      : consent === "declined"
        ? "statusDeclined"
        : "statusUndecided";

  const handleClearChatData = () => {
    for (const key of CHATBOT_STORAGE_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Storage unavailable — nothing was persisted in the first place.
      }
    }
    setChatCleared(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{t("analyticsLabel")}</span>
          <span className="text-sm text-muted-foreground">{t(statusKey)}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={accept}
            size="sm"
            variant={consent === "accepted" ? "default" : "outline"}
            disabled={consent === "accepted"}
          >
            {consent === "accepted" && (
              <Check className="w-4 h-4 mr-1" aria-hidden="true" />
            )}
            {t("allowAnalytics")}
          </Button>
          <Button
            onClick={decline}
            size="sm"
            variant={consent === "declined" ? "default" : "outline"}
            disabled={consent === "declined"}
          >
            {consent === "declined" && (
              <Check className="w-4 h-4 mr-1" aria-hidden="true" />
            )}
            {t("refuseAnalytics")}
          </Button>
          <Button
            onClick={withdraw}
            size="sm"
            variant="ghost"
            disabled={consent === null}
          >
            <RotateCcw className="w-4 h-4 mr-1" aria-hidden="true" />
            {t("resetChoice")}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">{t("analyticsHint")}</p>
      </div>

      <div className="space-y-3">
        <span className="text-sm font-medium">{t("chatLabel")}</span>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleClearChatData} size="sm" variant="outline">
            <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" />
            {t("clearChatData")}
          </Button>
          {chatCleared && (
            <span
              className="text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              {t("chatCleared")}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t("chatHint")}</p>
      </div>
    </div>
  );
}
