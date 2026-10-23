/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const languages: Record<string, { name: string }> = {
  en: { name: "English" },
  de: { name: "Deutsch" },
  es: { name: "Español" },
  fr: { name: "Français" },
  sv: { name: "Svenska" },
};

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

const LanguageSwitcher = () => {
  const router = useRouter();

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

  const changeLocale = (newLocale: string) => {
    if (!languages[newLocale]) return;
    setLocale(newLocale);
    setManuallySelected(true);
    // Update cookie using a function to avoid direct mutation warning
    const setCookie = (value: string) => {
      document.cookie = value;
    };
    setCookie(`PORTFOLIOVERSIONLATEST_LOCALE=${newLocale}; path=/;`);
    // 4. Refresh current route to re-render server components with new locale
    router.refresh(); // useRouter only works in Client Components :contentReference[oaicite:0]{index=0}
  };

  const getCurrentFlag = () => {
    return "🌐"; // Always show globe emoji
  };

  const getCurrentName = () => {
    if (isUnsupportedLang && browserLang !== currentLocale) {
      return `${languages[currentLocale]?.name ?? "English"} (Auto)`;
    }
    return languages[currentLocale]?.name ?? "English";
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center w-12 h-10 cursor-pointer hover:text-sky-600 transition-colors duration-300"
          aria-label={`Current language: ${getCurrentName()}. Click to change language`}
        >
          <Languages aria-hidden="true" />
          <span className="ml-1" aria-hidden="true">
            {getCurrentFlag()}
          </span>
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label="Language selection menu">
        {isUnsupportedLang && browserLang !== currentLocale && (
          <DropdownMenuItem disabled className="text-muted-foreground text-xs">
            Browser: {browserLang.toUpperCase()} (Unsupported)
          </DropdownMenuItem>
        )}
        {Object.entries(languages).map(([key, { name }]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => changeLocale(key)}
            aria-label={`Switch to ${name}`}
            className={currentLocale === key ? "bg-accent" : ""}
          >
            {name}
            {locale === key && isUnsupportedLang && (
              <span className="ml-auto text-xs text-muted-foreground">
                (Auto)
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
