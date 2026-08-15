/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

// Supported locales
const supportedLocales = ["en", "de", "es", "fr", "sv"];

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

function signToken(payload: string): string {
  return createHmac("sha256", ADMIN_TOKEN || "")
    .update(payload)
    .digest("hex");
}

export function hasValidAdminSession(request: NextRequest): boolean {
  if (!ADMIN_TOKEN) return false;

  const sessionCookie = request.cookies.get("PORTFOLIO_ADMIN_SESSION");
  if (!sessionCookie?.value) return false;

  const parts = sessionCookie.value.split(".");
  if (parts.length !== 3) return false;

  const [sessionId, expiresAtStr, sig] = parts;
  if (!sessionId || !expiresAtStr || !sig) return false;

  // Verify HMAC signature
  const payload = `${sessionId}.${expiresAtStr}`;
  const expectedSig = signToken(payload);
  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return false;

  // Check expiration
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

export function createAdminSession(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const sessionId = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const expiresAt = Date.now() + SESSION_DURATION;
  const payload = `${sessionId}.${expiresAt}`;
  const sig = signToken(payload);

  return `${payload}.${sig}`;
}

export function invalidateAdminSession(_sessionId: string): void {
  // Stateless tokens cannot be server-side invalidated.
  // Logout is handled by deleting the session cookie in the API route.
}

/**
 * Handle automatic locale detection based on browser language
 * Sets PORTFOLIOVERSIONLATEST_LOCALE for i18n and PORTFOLIOVERSIONLATEST_BROWSER_LANG for UI hints
 *
 * Note: PORTFOLIOVERSIONLATEST_BROWSER_LANG is informational only (used by language-switcher
 * and locale-auto-detect components). It should NOT gate the locale detection bypass.
 */
function handleLocaleDetection(request: NextRequest): NextResponse | null {
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
    // Fallback to default "de". Client-side LocaleAutoDetect component
    // will correct this using navigator.language if needed.
    const response = NextResponse.next();
    response.cookies.set("PORTFOLIOVERSIONLATEST_LOCALE", "de", {
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
  let detectedLocale = "de"; // default
  let browserLang = "de";

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
  const response = NextResponse.next();
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
    "/services",
    "/projects",
    "/rio-calculator",
    "/automation-audit",
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

  // Only redirect /de routes (legacy German locale routes)
  if (pathname.startsWith("/de")) {
    const newPath = pathname.replace(/^\/de/, "");
    const redirectPath = newPath === "" ? "/" : newPath;

    return NextResponse.redirect(
      new URL(redirectPath, request.url),
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
      const newPath = pathname.replace(/^\/[a-z]{2}/, "");
      const redirectPath = newPath === "" ? "/" : newPath;

      return NextResponse.redirect(new URL(redirectPath, request.url), {
        status: 301,
      });
    }
  }

  // Handle automatic locale detection for first-time visitors
  const response = handleLocaleDetection(request);
  if (response) return response;

  return NextResponse.next();
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.well-known).*)",
  ],
};
