/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";

/**
 * Validates GitHub API data type parameter
 */
export function validateDataType(type: string | null): string {
  const allowedTypes = ["profile", "repos", "stats", "activity", "all"];

  if (!type || !allowedTypes.includes(type)) {
    return "all";
  }

  return type;
}

/**
 * Rate limiting check
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private lastCleanup: number = Date.now();
  private readonly cleanupInterval: number = 300000; // 5 minutes

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();

    // Periodic cleanup to prevent memory leaks
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }

    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        (time) => now - time < this.windowMs
      );
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

/**
 * Resolves the client IP used as a rate-limit key and in audit logs.
 *
 * Only `x-forwarded-for` is consulted, and that is the whole point. Vercel
 * overwrites this header at the edge and refuses to forward an externally
 * supplied value specifically to prevent spoofing, so it is the one address here
 * the platform vouches for. `x-real-ip`, `cf-connecting-ip`, `x-client-ip` and
 * the rest arrive exactly as the caller wrote them — nothing is in front of this
 * app that rewrites them. Consulting those first let anyone reset their own
 * bucket by sending a fresh value on every request, which on the chatbot route
 * meant unlimited calls billed to the OpenAI key.
 *
 * **Do not add fallback headers here.** When `x-forwarded-for` is absent — local
 * dev, or a platform change — every caller collapses into one shared bucket and
 * is throttled together. That is the correct direction to fail: a rate limiter
 * that cannot tell callers apart must not issue each request a fresh allowance.
 */
export function getClientIP(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  // Vercel sets a single address, so the length cap is only there to stop a
  // malformed value from becoming an unbounded rate-limiter map key. 45 chars is
  // the longest valid textual IPv6 address (IPv4-mapped form).
  if (!ip || ip.length > 45) return "unknown";

  return ip;
}

/**
 * Throttles failed admin credential attempts on `app/api/admin/**`.
 *
 * Only rejected attempts are recorded, so a valid token is never locked out
 * and an attacker cannot exhaust the limit to deny the owner access. Must be
 * consulted on the rejection path itself — checking it after an early 401
 * return leaves token guessing unthrottled.
 *
 * State is in-memory and per-instance, so on serverless this is best-effort
 * mitigation rather than a hard guarantee.
 */
export const adminAuthLimiter = new RateLimiter(15 * 60 * 1000, 5);

/**
 * Enhanced input sanitization for contact forms
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Prevent ReDoS by limiting input length
  if (input.length > 10000) return "";

  // Secure HTML tag removal using character-by-character parsing
  let htmlStripped = "";
  let insideTag = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (char === "<") {
      insideTag = true;
      continue;
    }

    if (char === ">" && insideTag) {
      insideTag = false;
      continue;
    }

    if (!insideTag) {
      htmlStripped += char;
    }
  }

  // Complete HTML entity encoding
  htmlStripped = htmlStripped
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  // Remove common spam patterns (ReDoS-safe implementations)
  const spamPatterns = [
    /\b(viagra|cialis|casino|poker|lottery|bitcoin|crypto)\b/gi,
    /\b(click here|visit now|amazing offer|limited time)\b/gi,
    /\b(make money|earn money|work from home|get rich)\b/gi,
    /https?:\/\/\S+/g, // Remove URLs (more efficient)
  ];

  let sanitized = htmlStripped;
  spamPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, "[FILTERED]");
  });

  return sanitized.trim();
}

/**
 * Sanitizes error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Only return safe error messages
    if (error.message.includes("fetch")) {
      return "Network request failed";
    }
    if (error.message.includes("rate limit")) {
      return "Too many requests";
    }
    if (error.message.includes("404")) {
      return "Resource not found";
    }
    if (error.message.includes("403")) {
      return "Access denied";
    }
    if (error.message.includes("timeout")) {
      return "Request timeout";
    }
    if (error.message.includes("AI service")) {
      return error.message;
    }
  }

  return "Service temporarily unavailable";
}

/**
 * Normalises free-text a user typed before it is handed to a model provider and
 * persisted. Used by the chatbot turn and by the email-rewriter tools.
 *
 * Deliberately **not** an HTML sanitiser, and it must not become one again. This
 * text has no HTML sink: user turns render as plain text, assistant turns go
 * through `react-markdown` without `rehype-raw`, and React escapes both on the
 * way out. Escaping here bought nothing and corrupted the payload instead —
 * `I'm building a client's dashboard` reached OpenAI, and was stored in
 * `ChatMessage.content`, as `I&#x27;m building a client&#x27;s dashboard`, and
 * stripping `<…>` swallowed ordinary prose like `if x < 5 and y > 3`. Escaping
 * belongs at the sink; if a new surface ever renders this content as HTML, that
 * surface escapes it.
 *
 * What survives is the work that is actually this layer's job: a length ceiling,
 * and removal of characters that are never legitimate in typed text — C0/C1
 * controls (NUL in particular, which Postgres rejects outright in `text`) plus
 * the bidi-override and zero-width codepoints used to hide instructions from a
 * human reader while the model still sees them. ZWNJ/ZWJ (U+200C/U+200D) are
 * kept: Persian and Arabic text and emoji sequences need them.
 */
export function sanitizeChatInput(input: string): string {
  if (!input) return "";

  // Prevent ReDoS by limiting input length
  if (input.length > 10000) return "";

  return (
    input
      // Line endings first: CR sits inside the control range stripped below, so
      // normalising afterwards would silently join the two halves of a CRLF.
      .replace(/\r\n?/g, "\n")
      // C0/C1 controls, except tab and newline, which are meaningful here.
      .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, "")
      // Zero-width space, bidi marks/overrides/isolates, BOM, and the Unicode
      // tag block — all invisible carriers for prompt injection.
      .replace(/[\u200B\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
      .replace(/[\u{E0000}-\u{E007F}]/gu, "")
      // Cap blank-line runs. Paragraph structure in a pasted message survives;
      // unbounded vertical padding does not.
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Cheap junk filter for the free text this site accepts from strangers — chat
 * turns and the email rewriter's input.
 *
 * Deliberately biased toward letting things through. A wrongly rejected message
 * is a lost client; a spam message that gets through costs a fraction of a cent
 * in model tokens, and the per-IP rate limiter bounds how many are possible. So
 * no signal counts on its own unless it has no innocent reading at all.
 *
 * The previous version scored a point per regex *match*, which is why an
 * enquiry quoting a budget, a phone number and a link scored three before it
 * said anything suspicious — a message naming a price and how to call back is
 * the single most valuable thing this site receives. Money amounts and phone
 * numbers are therefore no longer signals at any weight.
 *
 * English-only, knowingly: the vocabulary rules do not fire on de/es/fr/sv, so
 * those locales are covered by the structural rules alone. Widening that means
 * guessing at spam idiom in languages we cannot test, which risks exactly the
 * false positives this rewrite removes.
 */
export function isChatSpam(content: string): boolean {
  if (!content.trim()) return true;

  // Nothing below backtracks, but an unbounded input still gets scanned several
  // times over, so refuse it before doing that work.
  if (content.length > 10000) return true;

  const text = content.toLowerCase();
  const urls = content.match(/https?:\/\/\S+/gi)?.length ?? 0;
  let score = 0;

  // --- decisive alone (>= the threshold) ---

  // No innocent reading in an enquiry about web development.
  if (/\b(viagra|cialis|casino|lottery|payday loan)\b/.test(text)) score += 4;

  // Ten identical characters in a row is a keyboard mash. The old bound of
  // seven was reachable by ordinary emphasis ("soooooo"), and — because it
  // scored per match — a single mash still only counted one point, so
  // "aaaaaaaaaaaaaaaaaaaaaaaaa" used to pass while real leads did not.
  if (/(.)\1{9,}/.test(content)) score += 4;

  // A link farm. Three is suspicious; four is not a conversation.
  if (urls >= 4) score += 4;
  else if (urls === 3) score += 2;

  // --- weaker: real messages trip one of these, spam trips several ---

  // Shouting, measured as a share of the letters rather than as a run length.
  // `[A-Z]{8,}` flagged DSGVO and WCAG questions and ordinary German nouns.
  const letters = content.replace(/[^\p{L}]/gu, "").length;
  const upper = content.replace(/[^\p{Lu}]/gu, "").length;
  if (letters >= 20 && upper / letters >= 0.8) score += 3;

  if ((content.match(/!/g)?.length ?? 0) >= 4) score += 2;

  // Marketing vocabulary counts only in bulk. "Are you free next week", "I want
  // to buy a site" and "my budget is limited" are how real clients write, so any
  // one of these in isolation has to mean nothing.
  const promo = [
    /\bfree\b/,
    /\bfree money\b/,
    /\bclick (here|now)\b/,
    /\b(buy|order) now\b/,
    /\bact now\b/,
    /\blimited (time|offer)\b/,
    /\bguaranteed\b/,
    /\burgent\b/,
    /\bbitcoin\b/,
    /\bcrypto\b/,
    /\bwinner\b/,
  ];
  const promoHits = promo.filter((pattern) => pattern.test(text)).length;
  if (promoHits >= 3) score += 3;
  else if (promoHits === 2) score += 1;

  // Flooding a single word — decisive, because past ten words no sentence in any
  // language is half one token. Measured as a share rather than as the old
  // "any word four or more times", which fired on every long brief: over a few
  // hundred words, "that" and "would" reach four on their own.
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 10) {
    const counts = new Map<string, number>();
    for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
    if (Math.max(...counts.values()) / words.length > 0.5) score += 4;
  }

  return score >= 4;
}
