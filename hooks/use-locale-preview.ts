/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { SupportedLocale } from "@/types/configs/i18n";

/**
 * The language the visitor is pointing at in the language menu, if any. The
 * hero listens and shows its intro in that language until the menu closes.
 */
let previewLocale: SupportedLocale | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLocalePreview(locale: SupportedLocale | null) {
  if (previewLocale === locale) return;
  previewLocale = locale;
  listeners.forEach((listener) => listener());
}

export function useLocalePreview() {
  return useSyncExternalStore(
    subscribe,
    () => previewLocale,
    () => null,
  );
}

/** One chunk per locale, fetched the first time that language is previewed. */
const HERO_MESSAGES: Record<
  SupportedLocale,
  () => Promise<{ default: { Hero: { description: string } } }>
> = {
  en: () => import("@/messages/en.json"),
  de: () => import("@/messages/de.json"),
  es: () => import("@/messages/es.json"),
  fr: () => import("@/messages/fr.json"),
  sv: () => import("@/messages/sv.json"),
};

/**
 * `Hero.description` in the previewed language, or null while nothing is
 * previewed, the preview is the current locale, or its messages are loading.
 */
export function usePreviewDescription(currentLocale: string) {
  const preview = useLocalePreview();
  const [loaded, setLoaded] = useState<Partial<Record<SupportedLocale, string>>>(
    {},
  );

  useEffect(() => {
    if (!preview || preview === currentLocale || loaded[preview]) return;
    let cancelled = false;
    HERO_MESSAGES[preview]()
      .then((messages) => {
        if (cancelled) return;
        setLoaded((prev) => ({
          ...prev,
          [preview]: messages.default.Hero.description,
        }));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [preview, currentLocale, loaded]);

  if (!preview || preview === currentLocale) return null;
  const text = loaded[preview];
  return text ? { locale: preview, text } : null;
}
