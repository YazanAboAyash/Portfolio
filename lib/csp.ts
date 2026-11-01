/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

// Imported by next.config.ts, so relative imports only: no `@/` alias here.

const isDev = process.env.NODE_ENV === "development";

/**
 * The site's Content-Security-Policy.
 *
 * With a nonce (pages, set per request by proxy.ts): Next reads the nonce from
 * this header and puts it on its own scripts, and 'strict-dynamic' trusts what
 * those load (Vercel Analytics), so no injected inline script runs. The hosts
 * after it only matter to browsers too old for 'strict-dynamic'.
 *
 * Without one (next.config.ts, for everything the proxy skips, such as the 404
 * for a dotted path): Next adds no nonces there, so inline scripts have to stay
 * allowed. If a host sends both headers, the browser enforces both, which is
 * still the nonce policy.
 *
 * Styles keep 'unsafe-inline' either way: a nonce in style-src would switch it
 * off, and Tailwind and framer-motion set style attributes nonces can't cover.
 * 'unsafe-eval' is dev-only (React uses eval for its error overlays).
 */
export function contentSecurityPolicy(nonce?: string): string {
  const scriptSources = nonce
    ? [`'nonce-${nonce}'`, "'strict-dynamic'"]
    : ["'unsafe-inline'"];

  return [
    "default-src 'self'",
    [
      "script-src 'self'",
      ...scriptSources,
      ...(isDev ? ["'unsafe-eval'"] : []),
      "https://vercel.live https://va.vercel-scripts.com",
    ].join(" "),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://avatars.githubusercontent.com https://github.com",
    "font-src 'self' data:",
    "connect-src 'self' https://api.github.com https://www.googleapis.com https://generativelanguage.googleapis.com https://vercel.live https://vitals.vercel-analytics.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(process.env.NODE_ENV === "production"
      ? ["upgrade-insecure-requests"]
      : []),
  ].join("; ");
}
