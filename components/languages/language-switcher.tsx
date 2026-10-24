/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { LOCALE_NAMES, SUPPORTED_LOCALES } from "@/data/configs/i18n";
import { setLocalePreview } from "@/hooks/use-locale-preview";
import type { SupportedLocale } from "@/types/configs/i18n";

const languages: Record<string, { name: string }> = Object.fromEntries(
  SUPPORTED_LOCALES.map((code) => [code, { name: LOCALE_NAMES[code] }]),
);

const emptySubscribe = () => () => {};

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function getInitialLocale(): string {
  const cookieLocale = getCookie("PORTFOLIOVERSIONLATEST_LOCALE");
  if (cookieLocale && languages[cookieLocale]) {
    return cookieLocale;
  }
  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.slice(0, 2);
    return languages[browserLang] ? browserLang : "en";
  }
  return "en";
}

function getInitialBrowserLang(): string {
  const cookieBrowserLang = getCookie("PORTFOLIOVERSIONLATEST_BROWSER_LANG");
  // Prefer navigator.language over cookie if cookie is "unknown" (server couldn't detect)
  if (cookieBrowserLang && cookieBrowserLang !== "unknown")
    return cookieBrowserLang;
  if (typeof navigator !== "undefined") {
    return navigator.language.slice(0, 2).toLowerCase();
  }
  return cookieBrowserLang ?? "en";
}

interface LanguageSwitcherProps {
  /** Classes for the trigger, so the navbar and the mobile sheet can size it. */
  readonly className?: string;
}

const LanguageSwitcher = ({ className = "" }: LanguageSwitcherProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  // Use useSyncExternalStore for initial values from cookies/browser
  const initialLocale = useSyncExternalStore(
    emptySubscribe,
    getInitialLocale,
    () => "en",
  );

  const initialBrowserLang = useSyncExternalStore(
    emptySubscribe,
    getInitialBrowserLang,
    () => "en",
  );

  // State for user-changed values
  const [locale, setLocale] = useState<string | null>(null);
  const [manuallySelected, setManuallySelected] = useState(false);

  // Use state value if manually changed, otherwise use initial value
  const currentLocale = locale ?? initialLocale;
  const browserLang = initialBrowserLang;
  const isUnsupportedLang = !manuallySelected && !languages[browserLang];
  // Only the home page has the intro the preview rewrites.
  const canPreview = pathname === "/";

  const changeLocale = (newLocale: string) => {
    if (!languages[newLocale]) return;
    setLocale(newLocale);
    setManuallySelected(true);
    setLocalePreview(null);
    // Update cookie using a function to avoid direct mutation warning
    const setCookie = (value: string) => {
      document.cookie = value;
    };
    setCookie(`PORTFOLIOVERSIONLATEST_LOCALE=${newLocale}; path=/;`);
    // Refresh current route to re-render server components with new locale
    router.refresh();
  };

  const preview = (code: SupportedLocale) => {
    if (canPreview) setLocalePreview(code);
  };

  const getCurrentName = () => {
    if (isUnsupportedLang && browserLang !== currentLocale) {
      return `${languages[currentLocale]?.name ?? "English"} (Auto)`;
    }
    return languages[currentLocale]?.name ?? "English";
  };

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(open) => {
        if (!open) setLocalePreview(null);
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`inline-flex h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 px-3 text-[0.9375rem] font-semibold transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${className}`}
          aria-label={`Current language: ${getCurrentName()}. Click to change language`}
        >
          <Languages className="h-4 w-4" aria-hidden="true" />
          <span aria-hidden="true">{currentLocale.toUpperCase()}</span>
          <span className="sr-only">Change language</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        aria-label="Language selection menu"
        className="min-w-56 rounded-none border-0 p-1.5 shadow-[0_12px_40px_oklch(0_0_0/0.18),0_0_0_1px_var(--surface-2)]"
        onPointerLeave={() => setLocalePreview(null)}
      >
        {canPreview && (
          <p className="px-3 pb-1.5 pt-2 text-sm text-muted-foreground">
            {t("languagePreviewHint")}
          </p>
        )}
        {isUnsupportedLang && browserLang !== currentLocale && (
          <DropdownMenuItem
            disabled
            className="rounded-none text-xs text-muted-foreground"
          >
            Browser: {browserLang.toUpperCase()} (Unsupported)
          </DropdownMenuItem>
        )}
        {SUPPORTED_LOCALES.map((key) => (
          <DropdownMenuItem
            key={key}
            lang={key}
            onClick={() => changeLocale(key)}
            onFocus={() => preview(key)}
            onPointerEnter={() => preview(key)}
            aria-label={`Switch to ${LOCALE_NAMES[key]}`}
            aria-current={currentLocale === key ? "true" : undefined}
            className={`flex cursor-pointer justify-between gap-4 rounded-none px-3 py-2.5 text-base focus:bg-surface ${
              currentLocale === key ? "font-bold" : ""
            }`}
          >
            <span>
              {LOCALE_NAMES[key]}
              {locale === key && isUnsupportedLang && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (Auto)
                </span>
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              {key.toUpperCase()}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
