/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useCookieConsent, useConsentActions } from "./use-cookie-consent";

export function CookiesBanner() {
  const [delayElapsed, setDelayElapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const t = useTranslations("CookieBanner");

  const consent = useCookieConsent();
  const { accept, decline } = useConsentActions();

  // Show after a short delay for better UX. Decisions made in another tab —
  // including a withdrawal from the privacy page — flow in through the shared
  // consent store, so every open tab reacts without a reload.
  useEffect(() => {
    const timer = setTimeout(() => setDelayElapsed(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // A withdrawal resets the banner so the visitor can make a fresh choice.
  useEffect(() => {
    if (consent === null) setDismissed(false);
  }, [consent]);

  const handleClose = () => {
    // Closing without choosing records nothing: analytics stay off and we ask
    // again on the next visit. Silence is never treated as consent.
    setDismissed(true);
  };

  if (consent !== null || !delayElapsed || dismissed) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-6 md:right-6 z-10",
        "animate-in slide-in-from-bottom-5 duration-500",
        "max-w-md md:max-w-lg lg:max-w-xl ml-auto",
      )}
    >
      <Card className="border-2 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-11 w-11"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t("close")}</span>
        </Button>

        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="shrink-0">
              <Cookie className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("title")}
                </CardTitle>
                <CardDescription className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {t("description")}{" "}
                  <a
                    href="/privacy"
                    className="text-primary hover:underline"
                    onClick={handleClose}
                    aria-label={t("learnMoreAriaLabel")}
                  >
                    {t("learnMore")}
                  </a>
                </CardDescription>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={accept}
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    {t("acceptAll")}
                  </Button>
                  <Button
                    onClick={decline}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    {t("essentialOnly")}
                  </Button>
                </div>
                <Button
                  onClick={decline}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("declineAnalytics")}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
