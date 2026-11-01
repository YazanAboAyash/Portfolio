/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/data/configs/i18n";
import { contentSecurityPolicy } from "@/lib/csp";

const supportedLocales: readonly string[] = SUPPORTED_LOCALES;

/**
 * Handle automatic locale detection based on browser language
 * Sets PORTFOLIOVERSIONLATEST_LOCALE for i18n and PORTFOLIOVERSIONLATEST_BROWSER_LANG for UI hints
 *
 * Note: PORTFOLIOVERSIONLATEST_BROWSER_LANG is informational only (used by language-switcher
 * and locale-auto-detect components). It should NOT gate the locale detection bypass.
 */
function handleLocaleDetection(
  request: NextRequest,
  requestHeaders: Headers,
): NextResponse | null {
  // Check if locale cookie already exists - this is the only required check
  const existingLocale = request.cookies.get(
    "PORTFOLIOVERSIONLATEST_LOCALE",
  )?.value;

  // If user already has a valid locale preference, respect it
  if (existingLocale && supportedLocales.includes(existingLocale)) {
    return null;
  }

  // Get Accept-Language header for first-time visitors
  const acceptLanguage = request.headers.get("accept-language");

  if (!acceptLanguage) {
    // No Accept-Language header (privacy mode / stripped by browser)
    // Fallback to the default locale. Client-side LocaleAutoDetect component
    // will correct this using navigator.language if needed.
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.set("PORTFOLIOVERSIONLATEST_LOCALE", DEFAULT_LOCALE, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
    response.cookies.set("PORTFOLIOVERSIONLATEST_BROWSER_LANG", "unknown", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  // Parse Accept-Language header to get primary language
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const parts = lang.trim().split(";");
      if (!parts[0]) return null;

      const code = parts[0].toLowerCase();
      const qualityPart = parts[1]?.split("=")[1];
      const quality = qualityPart ? parseFloat(qualityPart) : 1;
      return { code, quality };
    })
    .filter((lang): lang is { code: string; quality: number } => lang !== null)
    .sort((a, b) => b.quality - a.quality);

  // Find the best matching supported locale
  let detectedLocale: string = DEFAULT_LOCALE;
  let browserLang: string = DEFAULT_LOCALE;

  for (const lang of languages) {
    const langCode = lang.code.split("-")[0]; // Extract main language code
    if (!langCode) continue;

    browserLang = langCode;

    if (supportedLocales.includes(langCode)) {
      detectedLocale = langCode;
      break;
    }
  }

  // Set cookies and continue
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set("PORTFOLIOVERSIONLATEST_LOCALE", detectedLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });

  // Store the actual browser language for UI purposes
  response.cookies.set("PORTFOLIOVERSIONLATEST_BROWSER_LANG", browserLang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define valid routes to avoid redirecting legitimate paths
  const validRoutes = [
    "/",
    "/about",
    "/projects",
    "/blog",
    "/library",
    "/media",
    "/impressum",
    "/admin",
    "/api",
  ];

  // Check if it's a valid route or sub-route
  const isValidRoute = validRoutes.some((route) => {
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // Only redirect /de routes (legacy German locale routes). The trailing slash
  // matters: a bare prefix match lets /dehttps:/evil.com strip down to an
  // absolute URL. Only the pathname of a clone is set, so the scheme and host
  // can never change.
  if (pathname === "/de" || pathname.startsWith("/de/")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.slice("/de".length) || "/";

    return NextResponse.redirect(
      redirectUrl,
      { status: 301 }, // Permanent redirect for SEO
    );
  }

  // Redirect other unknown locale patterns
  const localePattern = /^\/([a-z]{2})(\/.*)?$/;
  const match = pathname.match(localePattern);

  if (match && !isValidRoute) {
    const locale = match[1];
    // Redirect if it looks like a locale code and isn't a valid route
    if (
      locale &&
      ["es", "fr", "sv", "it", "pt", "ru", "ja", "ko", "zh"].includes(locale)
    ) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = match[2] ?? "/";

      return NextResponse.redirect(redirectUrl, { status: 301 });
    }
  }

  // A fresh nonce per page view. Next reads it from the request's CSP header
  // and puts it on its own scripts; the layout reads `x-nonce` for next-themes.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  // Handle automatic locale detection for first-time visitors
  const response =
    handleLocaleDetection(request, requestHeaders) ??
    NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (now generated dynamically)
     * - .well-known (for verification files)
     * - any path with a file extension (public/ static assets — video, images,
     *   fonts, etc.) so Vercel's CDN serves them directly and honors Range
     *   requests; letting the proxy touch them breaks video seeking/autoplay
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.well-known|.*\\..*).*)",
  ],
};
