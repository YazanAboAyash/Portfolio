/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { OrbSize, OrbState } from "thinking-orbs";

/** Score threshold boundaries for color coding */
export const SCORE_THRESHOLDS = {
  good: 90,
  average: 50,
} as const;

/** Circle progress ring dimensions */
export const RING = {
  size: 60,
  strokeWidth: 5,
  radius: 25,
  circumference: 2 * Math.PI * 25,
} as const;

/** thinking-orbs loading indicator — 64 is the tuned avatar-scale preset */
export const LOADING_ORB = {
  state: "working" as OrbState,
  size: 64 as OrbSize,
} as const;

/** API endpoint path */
export const SPEED_INSIGHT_API = "/api/speed-insight" as const;

/** Cache duration in milliseconds (matches API revalidate: 1 hour) */
export const CACHE_DURATION_MS = 3_600_000 as const;

/** Minimum cooldown between manual refreshes (2 minutes) */
export const REFRESH_COOLDOWN_MS = 120_000 as const;
