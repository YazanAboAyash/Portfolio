/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { SpeedInsightScore } from "@/types/configs/speed-insight";
import { useSpeedInsight } from "./SpeedInsight.logic";
import { RING, SCORE_THRESHOLDS } from "./SpeedInsight.constants";
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
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-9 h-9">
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
          className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${category.color}`}
          aria-hidden="true"
        >
          {category.score}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground text-center font-medium max-w-18 leading-tight">
        {category.label}
      </span>
    </div>
  );
}

/** Loading skeleton for a strategy tab */
function StrategySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 justify-items-center py-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <Skeleton className="rounded-full w-9 h-9" />
          <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-16" />
        </div>
      ))}
    </div>
  );
}

export default function SpeedInsight({ className }: { className?: string }) {
  const t = useTranslations("Home.speedInsight");
  const { desktop, mobile, loading, error, refetch, cooldownRemaining } =
    useSpeedInsight();

  return (
    <section className={className} id="speed-insight" aria-label={t("title")}>
      <RevealGroup>
        <RevealItem>
          <Card className={cn(cardSurface, "max-w-3xl mx-auto")}>
            <CardHeader className="pb-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <SiGoogle
                      className="h-4 w-4 sm:h-5 sm:w-5 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg md:text-xl">
                      {t("title")}
                    </CardTitle>
                    <CardDescription className="text-[11px] sm:text-sm">
                      {t("subtitle")}
                    </CardDescription>
                  </div>
                </div>

                {/* Live indicator */}
                {!error && !loading && (
                  <Badge
                    variant="outline"
                    className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-1.5 sm:px-2.5 border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400 shrink-0"
                  >
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500" />
                    </span>
                    {t("liveLabel")}
                  </Badge>
                )}
              </div>

              {/* Portfolio URL indicator */}
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>{t("analyzingPortfolio")}</span>
              </div>
            </CardHeader>

            <CardContent>
              {/* Error state */}
              {error && !loading && (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                  <p className="text-sm text-muted-foreground">{t("error")}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void refetch()}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    {t("retry")}
                  </Button>
                </div>
              )}

              {/* Data / Loading */}
              {!error && (
                <Tabs defaultValue="desktop" className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <TabsList className="h-8 sm:h-10">
                      <TabsTrigger
                        value="desktop"
                        className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 cursor-pointer"
                      >
                        <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t("desktop")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="mobile"
                        className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 cursor-pointer"
                      >
                        <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
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
                      className="h-8 w-8"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>

                  <TabsContent value="desktop">
                    {loading ? (
                      <StrategySkeleton />
                    ) : desktop ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 justify-items-center py-3">
                        {desktop.categories.map((cat) => (
                          <ScoreRing key={cat.label} category={cat} />
                        ))}
                      </div>
                    ) : null}
                  </TabsContent>

                  <TabsContent value="mobile">
                    {loading ? (
                      <StrategySkeleton />
                    ) : mobile ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 justify-items-center py-3">
                        {mobile.categories.map((cat) => (
                          <ScoreRing key={cat.label} category={cat} />
                        ))}
                      </div>
                    ) : null}
                  </TabsContent>
                </Tabs>
              )}

              {/* Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-1 pt-3 border-t mt-2">
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  <SiGoogle
                    className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{t("poweredBy")}</span>
                </div>
                {desktop?.fetchedAt && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                    <span className="hidden sm:inline">
                      {t("lastUpdated")}:{" "}
                    </span>
                    {new Date(desktop.fetchedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
