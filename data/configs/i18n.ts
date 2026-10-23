/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

/** Locales the site is translated into; each needs a `messages/<locale>.json`. */
export const SUPPORTED_LOCALES = ["en", "de", "es", "fr", "sv"] as const;

/** Locale used when the cookie or browser language is missing or unsupported. */
export const DEFAULT_LOCALE = "de";
