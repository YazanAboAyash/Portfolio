/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Languages, Globe, X } from "lucide-react";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/data/configs/i18n";
import type { SupportedLocale } from "@/types/configs/i18n";

/** Language display names */
const languageNames: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  sv: "Svenska",
};

/** Delay before showing the toast after page is ready (ms) */
const TOAST_DELAY = 3000;

/** How long the toast stays before it dismisses itself (ms) */
const TOAST_DURATION = 4000;

const emptySubscribe = () => () => {};

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

function isSupportedLocale(lang: string): lang is SupportedLocale {
  return SUPPORTED_LOCALES.includes(lang as SupportedLocale);
}

/**
 * Auto-detects browser language, sets the correct locale cookie,
 * and shows a sleek toast telling the user the site adapted to them.
 */
const LocaleAutoDetect = () => {
  const router = useRouter();
  const t = useTranslations("localeDetect");
  const [showToast, setShowToast] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [toastData, setToastData] = useState({
    browserLang: "",
    switchedTo: "",
    isSupported: true,
    serverDetected: false,
  });

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => setShowToast(false), 400);
  }, []);

  // Step 1: Fix locale if needed (runs once, survives refresh)
  useEffect(() => {
    if (!isClient) return;
    // If we already fixed + showed in any tab/session, skip
    if (localStorage.getItem("locale-detection-done") === "true") return;

    const browserLangCookie = getCookie("PORTFOLIOVERSIONLATEST_BROWSER_LANG");
    const currentLocale =
      getCookie("PORTFOLIOVERSIONLATEST_LOCALE") ?? DEFAULT_LOCALE;
    const browserLang = navigator.language?.split("-")[0]?.toLowerCase() ?? "";
    if (!browserLang) return;

    const needsClientFix =
      !browserLangCookie ||
      browserLangCookie === "unknown" ||
      !isSupportedLocale(browserLangCookie);

    if (needsClientFix) {
      setCookie("PORTFOLIOVERSIONLATEST_BROWSER_LANG", browserLang);
      const detectedLocale = isSupportedLocale(browserLang)
        ? browserLang
        : DEFAULT_LOCALE;

      if (currentLocale !== detectedLocale) {
        setCookie("PORTFOLIOVERSIONLATEST_LOCALE", detectedLocale);
        // Store what we detected so we can show it after refresh
        sessionStorage.setItem(
          "locale-detection-result",
          JSON.stringify({
            browserLang,
            switchedTo: detectedLocale,
            isSupported: isSupportedLocale(browserLang),
            serverDetected: false,
          }),
        );
        router.refresh();
        return;
      }

      // No locale change needed, store result for toast
      sessionStorage.setItem(
        "locale-detection-result",
        JSON.stringify({
          browserLang,
          switchedTo: detectedLocale,
          isSupported: isSupportedLocale(browserLang),
          serverDetected: false,
        }),
      );
    } else if (browserLangCookie) {
      // Server detected correctly — store for toast
      sessionStorage.setItem(
        "locale-detection-result",
        JSON.stringify({
          browserLang: browserLang || browserLangCookie,
          switchedTo: currentLocale,
          isSupported: isSupportedLocale(browserLang || browserLangCookie),
          serverDetected: true,
        }),
      );
    }
  }, [isClient, router]);

  // Step 2: Show toast (reads stored result, works after refresh too)
  useEffect(() => {
    if (!isClient) return;
    if (localStorage.getItem("locale-detection-done") === "true") return;

    const stored = sessionStorage.getItem("locale-detection-result");
    if (!stored) return;

    let data: typeof toastData;
    try {
      data = JSON.parse(stored) as typeof toastData;
    } catch {
      return; // Invalid JSON, skip
    }

    // Nothing to tell when the site already speaks the browser's language
    if (data.isSupported && data.browserLang === data.switchedTo) {
      localStorage.setItem("locale-detection-done", "true");
      return;
    }

    const timer = setTimeout(() => {
      setToastData(data);
      setShowToast(true);
      setExiting(false);
      localStorage.setItem("locale-detection-done", "true");
    }, TOAST_DELAY);

    // Hide toast if another tab already dismissed it
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "locale-detection-done" && e.newValue === "true") {
        clearTimeout(timer);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isClient]);

  // Step 3: Auto-dismiss + cross-tab dismiss
  useEffect(() => {
    if (!showToast || exiting) return;
    const autoDismiss = setTimeout(() => dismiss(), TOAST_DURATION);

    // Dismiss in this tab when another tab sets the flag
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "locale-detection-done" && e.newValue === "true") {
        dismiss();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearTimeout(autoDismiss);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [showToast, exiting, dismiss]);

  if (!showToast) return null;

  const langName = languageNames[toastData.switchedTo] ?? toastData.switchedTo;
  const browserName =
    languageNames[toastData.browserLang] ?? toastData.browserLang.toUpperCase();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`
        fixed top-14 left-2 right-2 z-50
        sm:top-16 sm:left-auto sm:right-6 sm:max-w-sm
        transition-all duration-500 ease-out
        ${exiting ? "-translate-y-2 opacity-0 scale-95" : "translate-y-0 opacity-100 scale-100"}
      `}
    >
      <div className="relative overflow-hidden rounded-lg border border-sky-500/30 bg-background/95 backdrop-blur-md shadow-xl">
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 p-1.5 sm:p-1 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label={t("dismiss")}
        >
          <X className="h-4 w-4 sm:h-3 sm:w-3" />
        </button>

        <div className="px-3 py-2.5 sm:px-4 sm:py-3 flex items-start gap-2.5 sm:gap-3">
          {/* Icon */}
          <div className="shrink-0 mt-0.5 flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-sky-500/10 text-sky-500">
            {toastData.isSupported ? (
              <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
            <p className="text-[11px] sm:text-xs font-semibold text-foreground">
              {t("title")}
            </p>

            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
              {toastData.isSupported ? (
                <>
                  {t("browserLanguage")}:{" "}
                  <span className="font-medium text-foreground">
                    {browserName}
                  </span>{" "}
                  — {t("switchedTo")}{" "}
                  <span className="font-medium text-foreground">
                    {langName}
                  </span>
                </>
              ) : (
                <>
                  {t("browser")}:{" "}
                  <span className="font-medium text-foreground">
                    {browserName}
                  </span>{" "}
                  ({t("notSupported")}) — {t("using")}{" "}
                  <span className="font-medium text-foreground">
                    {langName}
                  </span>
                </>
              )}
            </p>

            {toastData.serverDetected && (
              <p className="text-[9px] sm:text-[10px] text-muted-foreground/70 flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-sky-500" />
                {t("serverDetected")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocaleAutoDetect;
