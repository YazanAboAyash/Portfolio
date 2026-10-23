/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import type { AuditScoreBucket } from "@/types/live-tools/automation-audit";

const BUCKET_COLORS: Record<
  AuditScoreBucket,
  { ring: string; text: string; badge: string }
> = {
  high: {
    ring: "stroke-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  medium: {
    ring: "stroke-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    badge:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  low: {
    ring: "stroke-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
};

interface ScoreDisplayProps {
  score: number;
  bucket: AuditScoreBucket;
}

export function ScoreDisplay({ score, bucket }: ScoreDisplayProps) {
  const t = useTranslations("LiveTools.audit");
  const colors = BUCKET_COLORS[bucket];

  // SVG ring parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {t("scoreLabel")}
      </p>

      {/* Score ring */}
      <div className="relative inline-flex items-center justify-center">
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-border"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={`${colors.ring} transition-all duration-700 ease-out`}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-4xl font-bold ${colors.text}`}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>

      {/* Bucket badge */}
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}
      >
        {t(`scoreBucket.${bucket}`)}
      </span>

      {/* Description */}
      <p className="text-center text-muted-foreground text-sm max-w-xs">
        {t(`scoreBucketDesc.${bucket}`)}
      </p>
    </div>
  );
}
