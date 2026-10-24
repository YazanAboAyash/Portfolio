/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

/** Individual Lighthouse audit category */
export interface SpeedInsightCategory {
  /** Category identifier */
  id: string;
  /** Display title */
  title: string;
  /** Score from 0 to 1 (multiply by 100 for percentage) */
  score: number | null;
}

/** Parsed result for a single category */
export interface SpeedInsightScore {
  /** Category name (e.g., "Performance") */
  label: string;
  /** Score as percentage (0–100) */
  score: number;
  /** Color class based on score threshold */
  color: string;
}

/** Full parsed PageSpeed result */
export interface SpeedInsightResult {
  /** URL that was analyzed */
  url: string;
  /** Strategy used: mobile or desktop */
  strategy: "mobile" | "desktop";
  /** Array of category scores */
  categories: SpeedInsightScore[];
  /** ISO timestamp of the analysis */
  fetchedAt: string;
}

/** API response shape from our internal route */
export interface SpeedInsightApiResponse {
  /** Desktop analysis result */
  desktop: SpeedInsightResult | null;
  /** Mobile analysis result */
  mobile: SpeedInsightResult | null;
  /** Error message if the request failed */
  error?: string;
}

/** Raw Google PageSpeed Insights API category shape */
export interface RawLighthouseCategory {
  id: string;
  title: string;
  score: number | null;
}

/** Raw Google PageSpeed Insights API response (partial) */
export interface RawPageSpeedResponse {
  id: string;
  lighthouseResult: {
    categories: Record<string, RawLighthouseCategory>;
    fetchTime: string;
  };
}
