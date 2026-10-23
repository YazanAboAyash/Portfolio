/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { Loader2, Zap } from "lucide-react";
import { CTAButton } from "@/components/ui/cta-button";
import type { AuditResult } from "@/types/live-tools/automation-audit";

interface RecommendationsProps {
  result: AuditResult | null;
  loading: boolean;
  ctaButtonLabel: string;
}

export function Recommendations({
  result,
  loading,
  ctaButtonLabel,
}: RecommendationsProps) {
  const t = useTranslations("LiveTools.audit");

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
        <p className="text-sm">{t("loading")}</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <section aria-label={t("topAutomations")} className="space-y-5">
      {/* AI summary */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {result.summary}
      </p>

      {/* Automation cards */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          {t("topAutomations")}
        </h3>
        <ul className="space-y-3">
          {result.topAutomations.map((automation, index) => (
            <li
              key={index}
              className="p-4 rounded-lg border border-border bg-card/60 flex gap-3"
            >
              <Zap
                className="h-4 w-4 text-primary mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div className="space-y-1 min-w-0">
                <p className="font-medium text-foreground text-sm">
                  {automation.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">{t("tool")}</span>{" "}
                  {automation.tool}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">{t("timeSaved")}</span>{" "}
                  {automation.timeSaved}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="pt-2 space-y-2 text-center">
        <p className="text-sm text-muted-foreground">{result.ctaMessage}</p>
        <CTAButton label={ctaButtonLabel} className="w-full sm:w-auto" />
      </div>
    </section>
  );
}
