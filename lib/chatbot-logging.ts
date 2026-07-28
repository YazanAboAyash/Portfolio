/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

/**
 * Geolocation lookup was removed deliberately: it forwarded the visitor's full,
 * un-anonymised IP to ip-api.com, an undisclosed third-country recipient whose
 * keyless tier is not licensed for commercial use. The ipCountry/ipCity columns
 * are retained for historical rows but are no longer populated.
 */

/**
 * Anonymize IP address by removing last octet (IPv4) or last 4 groups (IPv6)
 * This helps with GDPR compliance by not storing full IP addresses
 * @param ip - IP address to anonymize
 * @returns Anonymized IP address
 */
export function anonymizeIP(ip: string): string {
  if (ip.includes(":")) {
    // IPv6 - Keep first 64 bits (4 groups), zero out last 64 bits
    // Properly handle compressed notation (::)

    try {
      // Expand compressed IPv6 addresses
      let expanded = ip;
      if (ip.includes("::")) {
        const sides = ip.split("::");
        const leftGroups = sides[0] ? sides[0].split(":") : [];
        const rightGroups = sides[1] ? sides[1].split(":") : [];
        const missingGroups = 8 - leftGroups.length - rightGroups.length;
        const middleGroups = Array(missingGroups).fill("0");
        expanded = [...leftGroups, ...middleGroups, ...rightGroups].join(":");
      }

      // Split into groups and take first 4 (network prefix)
      const groups = expanded.split(":");
      if (groups.length >= 4) {
        // Keep first 4 groups, zero out the rest
        const networkPrefix = groups.slice(0, 4).join(":");
        return `${networkPrefix}::`;
      }

      // Fallback for malformed addresses
      return ip;
    } catch {
      // If parsing fails, return as-is
      return ip;
    }
  } else {
    // IPv4 - remove last octet
    const parts = ip.split(".");
    return parts.slice(0, -1).join(".") + ".0";
  }
}

/**
 * Check if chat logging is enabled via environment variable
 */
export function isChatLoggingEnabled(): boolean {
  return process.env.CHATBOT_LOGGING_ENABLED === "true";
}

/**
 * Check if IP should be anonymized (GDPR compliance)
 */
export function shouldAnonymizeIP(): boolean {
  return process.env.CHATBOT_ANONYMIZE_IP !== "false"; // Default to true
}
