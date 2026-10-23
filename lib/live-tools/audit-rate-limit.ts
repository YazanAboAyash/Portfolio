/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import { MAX_AUDIT_USES_PER_IP } from "@/data/live-tools/automation-audit";

// In-memory store for rate limiting (resets on server restart)
const ipUsageMap = new Map<string, { count: number; resetAt: number }>();

const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
// Bounds memory: once reached, expired entries are swept before a new IP is added.
const MAX_TRACKED_IPS = 10_000;
// Longest valid textual IPv6 address; matches the cap in `getClientIP`.
const MAX_KEY_LENGTH = 45;

function toKey(ip: string): string {
  return ip.trim().toLowerCase().slice(0, MAX_KEY_LENGTH);
}

/**
 * Consumes one audit slot for `ip`. Call only after the request has been
 * validated, so a malformed request never costs the caller a daily audit.
 */
export function checkAuditRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const key = toKey(ip);
  const usage = ipUsageMap.get(key);

  if (!usage || now > usage.resetAt) {
    if (!usage && ipUsageMap.size >= MAX_TRACKED_IPS) {
      for (const [storedKey, entry] of ipUsageMap) {
        if (now > entry.resetAt) ipUsageMap.delete(storedKey);
      }
      // Still full of live entries: drop the oldest-inserted one.
      if (ipUsageMap.size >= MAX_TRACKED_IPS) {
        const oldest = ipUsageMap.keys().next().value;
        if (oldest !== undefined) ipUsageMap.delete(oldest);
      }
    }

    ipUsageMap.set(key, { count: 1, resetAt: now + RESET_INTERVAL_MS });
    return { allowed: true, remaining: MAX_AUDIT_USES_PER_IP - 1 };
  }

  if (usage.count < MAX_AUDIT_USES_PER_IP) {
    usage.count++;
    return { allowed: true, remaining: MAX_AUDIT_USES_PER_IP - usage.count };
  }

  return { allowed: false, remaining: 0 };
}

export function getAuditRemainingUses(ip: string): number {
  const now = Date.now();
  const usage = ipUsageMap.get(toKey(ip));

  if (!usage || now > usage.resetAt) {
    return MAX_AUDIT_USES_PER_IP;
  }

  return Math.max(0, MAX_AUDIT_USES_PER_IP - usage.count);
}
