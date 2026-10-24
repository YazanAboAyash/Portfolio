/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import {
  Monitor,
  Smartphone,
  RefreshCw,
  AlertCircle,
  Globe,
} from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ThinkingOrb } from "thinking-orbs";
import type { SpeedInsightScore } from "@/types/configs/speed-insight";
import { useSpeedInsight } from "./SpeedInsight.logic";
import {
  LOADING_ORB,
  RING,
  SCORE_THRESHOLDS,
} from "./SpeedInsight.constants";
import { cardSurface, RevealGroup, RevealItem } from "@/components/visuals";
import { cn } from "@/lib/utils";

/** Calculate stroke-dashoffset for the ring gauge */
function getOffset(score: number): number {
  return RING.circumference - (score / 100) * RING.circumference;
}

/** Map score to ring color */
function getRingColor(score: number): string {
  if (score >= SCORE_THRESHOLDS.good) return "stroke-green-500";
  if (score >= SCORE_THRESHOLDS.average) return "stroke-yellow-500";
  return "stroke-red-500";
}

/** Single score ring gauge */
function ScoreRing({ category }: { category: SpeedInsightScore }) {
  const offset = getOffset(category.score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-16 w-16 sm:h-20 sm:w-20">
        <svg
          viewBox="0 0 60 60"
          className="w-full h-full -rotate-90"
          aria-label={`${category.label}: ${category.score}%`}
          role="img"
        >
          {/* Background ring */}
          <circle
            cx={30}
            cy={30}
            r={RING.radius}
            fill="none"
            strokeWidth={RING.strokeWidth}
            className="stroke-muted"
          />
          {/* Score ring */}
          <circle
            cx={30}
            cy={30}
            r={RING.radius}
            fill="none"
            strokeWidth={RING.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={RING.circumference}
            strokeDashoffset={offset}
            className={`${getRingColor(category.score)} transition-all duration-1000 ease-out`}
          />
        </svg>
        {/* Score number */}
        <span
          className={`absolute inset-0 flex items-center justify-center text-lg font-bold tabular-nums sm:text-xl ${category.color}`}
          aria-hidden="true"
        >
          {category.score}
        </span>
      </div>
      <span className="max-w-28 text-center text-sm font-medium leading-tight text-foreground">
        {category.label}
      </span>
    </div>
  );
}

/** Loading state for a strategy tab — the orb's own untranslated label is hidden */
function StrategyLoading({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-36 flex-col items-center justify-center gap-3 py-3"
      role="status"
      aria-live="polite"
    >
      <ThinkingOrb
        state={LOADING_ORB.state}
        size={LOADING_ORB.size}
        aria-hidden="true"
      />
      <span className="text-sm text-foreground">{label}</span>
    </div>
  );
}

export default function SpeedInsight({ className }: { className?: string }) {
  const t = useTranslations("Home.speedInsight");
  const { desktop, mobile, loading, error, refetch, cooldownRemaining } =
    useSpeedInsight();

  const tabTrigger =
    "cursor-pointer gap-1.5 rounded-none border-0 px-3 text-sm font-semibold shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none dark:data-[state=active]:border-0 dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground";

  return (
    <section className={className} id="speed-insight" aria-label={t("title")}>
      <RevealGroup>
        <RevealItem>
          <div
            className={cn(
              cardSurface,
              "grid grid-cols-12 gap-x-6 gap-y-5 p-6 hover:bg-surface sm:p-8 md:gap-y-8 lg:p-10",
            )}
          >
            {/* Heading column */}
            <div className="col-span-12 flex flex-col gap-3 lg:col-span-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] sm:text-3xl">
                  {t("title")}
                </h2>
                {/* Live indicator */}
                {!error && !loading && (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75 motion-reduce:animate-none" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    {t("liveLabel")}
                  </span>
                )}
              </div>
              {/* Phones keep the title, the Live dot and the scores only */}
              <p className="hidden text-base leading-relaxed text-foreground md:block">
                {t("subtitle")}
              </p>

              {/* Portfolio URL indicator */}
              <p className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
                <Globe className="h-4 w-4" aria-hidden="true" />
                <span>{t("analyzingPortfolio")}</span>
              </p>

              <div className="mt-auto hidden flex-col gap-1 pt-2 text-sm text-muted-foreground md:flex">
                <span className="flex items-center gap-2">
                  <SiGoogle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {t("poweredBy")}
                </span>
                {desktop?.fetchedAt && (
                  <span>
                    {t("lastUpdated")}:{" "}
                    {new Date(desktop.fetchedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Scores column */}
            <div className="col-span-12 lg:col-span-8">
              {/* Error state */}
              {error && !loading && (
                <div className="flex min-h-36 flex-col items-center justify-center gap-3 text-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="text-base">{t("error")}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer rounded-none"
                    onClick={() => void refetch()}
                  >
                    <RefreshCw className="mr-1 h-4 w-4" />
                    {t("retry")}
                  </Button>
                </div>
              )}

              {/* Phones: one strip of the mobile scores, no tabs, rings or refresh */}
              {!error && (
                <div className="flex flex-col gap-2 md:hidden">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("mobile")}
                  </p>
                  {loading ? (
                    <StrategyLoading label={t("loading")} />
                  ) : mobile ? (
                    <div className="grid grid-cols-4 gap-0.5">
                      {mobile.categories.map((cat) => (
                        <div
                          key={cat.label}
                          className="flex flex-col items-center gap-1 bg-background px-1 py-3 text-center"
                        >
                          <span
                            className={cn(
                              "text-2xl font-bold tabular-nums",
                              cat.color,
                            )}
                          >
                            {cat.score}
                          </span>
                          <span className="text-xs leading-tight text-foreground">
                            {cat.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Data / Loading */}
              {!error && (
                <Tabs defaultValue="desktop" className="hidden w-full gap-6 md:flex">
                  <div className="flex items-center justify-between gap-4">
                    <TabsList className="h-10 rounded-none bg-background p-1">
                      <TabsTrigger value="desktop" className={tabTrigger}>
                        <Monitor className="h-4 w-4" aria-hidden="true" />
                        {t("desktop")}
                      </TabsTrigger>
                      <TabsTrigger value="mobile" className={tabTrigger}>
                        <Smartphone className="h-4 w-4" aria-hidden="true" />
                        {t("mobile")}
                      </TabsTrigger>
                    </TabsList>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void refetch()}
                      disabled={loading || cooldownRemaining > 0}
                      aria-label={
                        cooldownRemaining > 0
                          ? `${t("retry")} (${cooldownRemaining}s)`
                          : t("retry")
                      }
                      title={
                        cooldownRemaining > 0
                          ? `${cooldownRemaining}s`
                          : undefined
                      }
                      className="h-10 w-10 cursor-pointer rounded-none hover:bg-background"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>

                  <TabsContent value="desktop">
                    {loading ? (
                      <StrategyLoading label={t("loading")} />
                    ) : desktop ? (
                      <div className="grid grid-cols-2 justify-items-center gap-6 sm:grid-cols-4">
                        {desktop.categories.map((cat) => (
                          <ScoreRing key={cat.label} category={cat} />
                        ))}
                      </div>
                    ) : null}
                  </TabsContent>

                  <TabsContent value="mobile">
                    {loading ? (
                      <StrategyLoading label={t("loading")} />
                    ) : mobile ? (
                      <div className="grid grid-cols-2 justify-items-center gap-6 sm:grid-cols-4">
                        {mobile.categories.map((cat) => (
                          <ScoreRing key={cat.label} category={cat} />
                        ))}
                      </div>
                    ) : null}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
