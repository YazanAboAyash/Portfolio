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
 * Resolves the client IP from the proxy headers forwarded by the host
 */
export function getClientIP(request: NextRequest): string {
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "x-forwarded",
    "x-cluster-client-ip",
    "forwarded-for",
    "forwarded",
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      const ip = value.split(",")[0]?.trim();
      if (ip && ip !== "unknown") {
        return ip;
      }
    }
  }

  return "unknown";
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
 * ChatBot-specific input sanitization with XSS protection
 */
export function sanitizeChatInput(input: string): string {
  if (!input) return "";

  // Prevent ReDoS by limiting input length
  if (input.length > 10000) return "";

  // Secure HTML tag removal using character-by-character parsing
  let sanitized = "";
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
      sanitized += char;
    }
  }

  // Complete HTML entity encoding
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  // Remove script tags and dangerous protocols in a single pass
  sanitized = sanitized.replace(/(javascript|data|vbscript):/gi, "");

  // Remove potentially dangerous event handler attributes iteratively
  // This ensures complete removal of overlapping or nested patterns
  let previousLength;
  do {
    previousLength = sanitized.length;
    sanitized = sanitized.replace(/\bon\w+\s*=\s*[^>\s]*/gi, "");
  } while (sanitized.length !== previousLength);

  // Remove excessive whitespace but preserve line breaks
  sanitized = sanitized.replace(/\s{2,}/g, " ").trim();

  return sanitized;
}

/**
 * Advanced spam detection for chat messages
 */
export function isChatSpam(content: string): boolean {
  if (!content) return true;

  // Prevent ReDoS by limiting input length
  if (content.length > 10000) return true;

  // Check for common spam patterns (ReDoS-safe implementations)
  const spamPatterns = [
    /(.)\1{6,}/g, // Repeated characters (7+ times)
    /[A-Z]{8,}/g, // Excessive ALL CAPS
    /\b(CLICK|BUY|MONEY|FREE|URGENT|LIMITED|ACT NOW)\b/gi,
    /\$[0-9,]+/g, // Money amounts
    /\b[0-9]{3}[-.]?[0-9]{3}[-.]?[0-9]{4}\b/g, // Phone numbers (simplified, ReDoS safe)
    /https?:\/\/\S+/gi, // URLs (more efficient)
    /\b(bitcoin|crypto|lottery|casino|viagra|cialis)\b/gi,
  ];

  let spamScore = 0;
  spamPatterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      spamScore += matches.length;
    }
  });

  // Additional checks
  if (content.length < 2) spamScore += 2;
  if (content.length > 2000) spamScore += 3;

  // Check for repeated words
  const words = content.toLowerCase().split(/\s+/);
  const wordCounts = new Map();
  words.forEach((word) => {
    if (word.length > 3) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  });

  for (const count of wordCounts.values()) {
    if (count > 3) spamScore += 2;
  }

  return spamScore >= 4;
}
