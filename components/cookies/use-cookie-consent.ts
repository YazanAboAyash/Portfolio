/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useCallback, useSyncExternalStore } from "react";

export type CookieConsent = "accepted" | "declined" | null;

const STORAGE_KEY = "cookie-consent";

/**
 * Same-tab notification channel. The native `storage` event only fires in *other*
 * tabs, so a purely storage-based store would leave the tab that made the choice
 * showing stale state until reload — which is exactly how analytics ended up
 * loading regardless of consent.
 */
const CONSENT_EVENT = "cookie-consent-change";

function subscribe(onChange: () => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };

  window.addEventListener(CONSENT_EVENT, onChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CONSENT_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}

function readConsent(): CookieConsent {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    // Storage disabled (private mode, blocked third-party storage). Treat an
    // unreadable store as "no consent recorded" so nothing optional loads.
    return null;
  }
}

/**
 * Server and first client render both report `null`. That is intentional: the
 * hydration-safe default must be the non-consented state, otherwise the very
 * first paint would already have loaded what consent is supposed to gate.
 */
function getServerSnapshot(): CookieConsent {
  return null;
}

export function setCookieConsent(consent: Exclude<CookieConsent, null>): void {
  try {
    localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    // Fall through to the event anyway so the current page still reacts.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function clearCookieConsent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function useCookieConsent(): CookieConsent {
  return useSyncExternalStore(subscribe, readConsent, getServerSnapshot);
}

/** Convenience wrapper for the common "may I load this?" question. */
export function useAnalyticsAllowed(): boolean {
  return useCookieConsent() === "accepted";
}

export function useConsentActions(): {
  accept: () => void;
  decline: () => void;
  withdraw: () => void;
} {
  const accept = useCallback(() => setCookieConsent("accepted"), []);
  const decline = useCallback(() => setCookieConsent("declined"), []);
  const withdraw = useCallback(() => clearCookieConsent(), []);

  return { accept, decline, withdraw };
}
