/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useAnalyticsAllowed } from "./use-cookie-consent";

/**
 * Vercel Analytics and Speed Insights are cookie-less, but they still read from
 * the visitor's terminal equipment and transmit page, referrer, device and coarse
 * location data. TDDDG §25 requires consent for that unless it is strictly
 * necessary to deliver the service, which performance telemetry is not. So both
 * scripts stay unmounted until the visitor actively accepts, and unmount again
 * the moment consent is withdrawn.
 */
export function ConsentedAnalytics() {
  const allowed = useAnalyticsAllowed();

  if (!allowed) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
