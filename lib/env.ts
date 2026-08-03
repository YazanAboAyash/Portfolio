/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

/**
 * Reads an environment variable that is meant to hold a positive integer,
 * falling back to `fallback` when it is unset, empty, or malformed.
 *
 * The chatbot limits used to be read with `parseInt`, which gets this wrong in
 * three ways and announces none of them:
 *
 * - A typo'd value (`"twenty"`) yields `NaN`, and every comparison against `NaN`
 *   is `false`. `count > limit` never trips, so the rate limit and the message
 *   length cap switch *off* — uncapped provider spend, silently.
 * - `NaN` reaching a Zod `.max()` inverts the same mistake: `length <= NaN` is
 *   also `false`, so *every* request fails validation and the route 400s for
 *   everyone, which the UI shows as "please try rephrasing".
 * - `parseInt("20 messages")` quietly returns `20`, accepting a malformed value
 *   with a meaning nobody wrote down.
 *
 * A limit that cannot be trusted is worse than no limit, so anything that is not
 * a clean positive integer is refused and logged, and the caller gets the
 * documented default instead of an accidental one.
 */
export function positiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();

  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    console.error(
      `[env] ${name}="${raw}" is not a positive integer — falling back to ${fallback}.`,
    );
    return fallback;
  }

  return parsed;
}
