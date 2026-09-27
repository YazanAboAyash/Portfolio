/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { GitHubFetchMeta } from "@/types/configs/github";
import { GITHUB_LOCALE } from "./GitHub.constants";

const numberFormat = new Intl.NumberFormat(GITHUB_LOCALE);
const relativeFormat = new Intl.RelativeTimeFormat(GITHUB_LOCALE, {
  numeric: "auto",
});
const dateTimeFormat = new Intl.DateTimeFormat(GITHUB_LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
});

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

export function formatRelative(iso: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) {
      return relativeFormat.format(Math.round(seconds / size), unit);
    }
  }
  return relativeFormat.format(seconds, "second");
}

export function formatAge(ageSeconds: number): string {
  return formatRelative(new Date(Date.now() - ageSeconds * 1000).toISOString());
}

function apiLabel(api: GitHubFetchMeta["calls"][number]["api"]): string {
  return api === "graphql" ? "GraphQL" : "REST";
}

/** One line per upstream GitHub call behind an MCP tool result. */
export function describeUpstream(meta: GitHubFetchMeta): string[] {
  return meta.calls.map((call) => {
    const request = `GitHub ${apiLabel(call.api)} ${call.endpoint} · HTTP ${call.status} · ${formatNumber(call.durationMs)} ms`;
    const remaining =
      call.rateLimitRemaining === null
        ? ""
        : ` · ${formatNumber(call.rateLimitRemaining)} API requests left`;

    if (meta.stale) {
      return `↳ GitHub unreachable, serving cache fetched ${formatAge(meta.ageSeconds)} (${request})`;
    }
    if (meta.source === "cache") {
      return `↳ from server cache, fetched ${formatAge(meta.ageSeconds)} by ${request}${remaining}`;
    }
    return `↳ fetched live: ${request}${remaining}`;
  });
}
