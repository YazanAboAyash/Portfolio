/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";
import type React from "react";
import { useState, useMemo } from "react";
import type { CalculatorInputs } from "@/types/live-tools/live-tools";
import { calculateROI, formatCurrency } from "@/components/live-tools/rio";
import { CTAButton } from "@/components/ui/cta-button";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const ROICalculator: React.FC = () => {
  const tt = useTranslations("Services");
  const t = useTranslations("LiveTools.rio");

  // Default values to show a "good" example initially
  const [inputs, setInputs] = useState<CalculatorInputs>({
    hoursPerWeek: 5,
    hourlyRate: 45,
    automationCost: 2500,
  });

  // Derived state: Recalculates automatically when inputs change
  const metrics = useMemo(() => calculateROI(inputs), [inputs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Prevent negative numbers or NaN
    const numValue = Number.parseFloat(value);
    setInputs((prev) => ({
      ...prev,
      [name]: isNaN(numValue) ? 0 : Math.max(0, numValue),
    }));
  };

  return (
    <Card
      className="w-full max-w-4xl mx-auto px-3 py-4 h-full flex flex-col 
    bg-background/80 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300
"
    >
      {/* Header Section */}
      <div className="p-8 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("title")}
        </h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Input Section */}
        <div className="w-full md:w-1/2 p-8 space-y-6">
          <div>
            <label
              htmlFor="hoursPerWeek"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {t("inputs.hoursPerWeek")}
            </label>
            <input
              type="number"
              id="hoursPerWeek"
              name="hoursPerWeek"
              value={inputs.hoursPerWeek}
              onChange={handleInputChange}
              className="w-full h-11 px-4 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              placeholder="e.g. 5"
            />
          </div>

          <div>
            <label
              htmlFor="hourlyRate"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {t("inputs.hourlyRate")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={inputs.hourlyRate}
                onChange={handleInputChange}
                className="w-full h-11 px-4 pl-9 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder="e.g. 45"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("inputs.hourlyRateHint")}
            </p>
          </div>

          <div>
            <label
              htmlFor="automationCost"
              className="block text-sm font-medium text-foreground mb-2"
            >
              {t("inputs.automationCost")}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <input
                type="number"
                id="automationCost"
                name="automationCost"
                value={inputs.automationCost}
                onChange={handleInputChange}
                className="w-full h-11 px-4 pl-9 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                placeholder="e.g. 2000"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="w-full md:w-1/2 p-8 border-t md:border-t-0 md:border-l border-border flex flex-col justify-center">
          <div className="space-y-5">
            <div className="p-5 bg-card rounded-xl border border-border shadow-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                {t("results.burnRateLabel")}
              </p>
              <p className="text-3xl font-bold text-destructive mt-2">
                {formatCurrency(metrics.annualCost)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("results.burnRateDesc")}
              </p>
            </div>

            {metrics.isProfitable ? (
              <div className="p-5 rounded-xl border mt-2">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-semibold">
                  {t("results.savingsLabel")}
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {formatCurrency(metrics.firstYearSavings)}
                </p>
                <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                    {t("results.roiTimelineLabel")}
                  </p>
                  <p className="text-emerald-800 dark:text-emerald-300 text-sm mt-1">
                    The automation pays for itself in just{" "}
                    <span className="font-bold underline">
                      {metrics.breakEvenWeeks} weeks
                    </span>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="p-5 rounded-xl border mt-2 border-amber-200">
                  <p className="text-sm text-amber-800 dark:text-amber-400 font-semibold">
                    {t("results.notProfitableTitle")}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                    {t("results.notProfitableDesc")}
                  </p>
                </div>
                {/* CTA */}
                <CTAButton label={tt("cta.button")} className="mt-4" />
              </div>
            )}

            {/* Dynamic Call To Action */}
            {metrics.isProfitable && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Want to save that{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(metrics.firstYearSavings)}{" "}
                  </span>
                  ?
                </p>
                {/* CTA */}
                <CTAButton label={tt("cta.button")} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cross-link to Automation Audit */}
      <div className="px-8 pb-6 pt-0 border-t border-border mt-2">
        <Link
          href="/automation-audit"
          className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors py-3"
        >
          {t("auditPromo")}
        </Link>
      </div>
    </Card>
  );
};

export default ROICalculator;
