/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  cardSurfaceGitHub,
  RevealGroup,
  RevealItem,
} from "@/components/visuals";
import { cn } from "@/lib/utils";
import type { GitHubLanguagesProps } from "@/types/configs/github";
import { githubCopy, LANGUAGE_BAR_LIMIT } from "./GitHub.constants";

// Neutral swatch for languages GitHub assigns no colour, and for "Other".
const FALLBACK_COLOR = "var(--muted-foreground)";

function percent(share: number): string {
  return share < 0.001 ? "<0.1%" : `${(share * 100).toFixed(1)}%`;
}

export default function GitHubLanguages({ languages }: GitHubLanguagesProps) {
  if (languages.length === 0) return null;

  const shown = languages.slice(0, LANGUAGE_BAR_LIMIT);
  const otherShare = languages
    .slice(LANGUAGE_BAR_LIMIT)
    .reduce((sum, lang) => sum + lang.share, 0);
  const segments = [
    ...shown.map((lang) => ({
      name: lang.name,
      color: lang.color ?? FALLBACK_COLOR,
      share: lang.share,
    })),
    ...(otherShare > 0
      ? [
          {
            name: githubCopy.languages.other,
            color: FALLBACK_COLOR,
            share: otherShare,
          },
        ]
      : []),
  ];

  return (
    <RevealGroup>
      <RevealItem>
        <Card className={cn(cardSurfaceGitHub, "relative overflow-hidden")}>
          <CardContent className="p-4 relative z-20 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {githubCopy.languages.title}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {githubCopy.languages.subtitle}
              </span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full">
              {segments.map((segment) => (
                <div
                  key={segment.name}
                  className="h-full"
                  style={{
                    width: `${segment.share * 100}%`,
                    backgroundColor: segment.color,
                  }}
                />
              ))}
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {segments.map((segment) => (
                <li
                  key={segment.name}
                  className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300"
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: segment.color }}
                  />
                  {segment.name}
                  <span className="text-slate-500 dark:text-slate-400">
                    {percent(segment.share)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </RevealItem>
    </RevealGroup>
  );
}
