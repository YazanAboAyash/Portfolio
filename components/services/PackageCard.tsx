/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ServicePackage } from "@/types/hubs/services";
import { m } from "framer-motion";
import {
  Rocket,
  Cog,
  Brain,
  Settings,
  Globe,
  Bot,
  Zap,
  Check,
  Clock,
} from "lucide-react";
import { useTranslations } from "next-intl";

/** Icon mapping for dynamic rendering */
const iconMap: Record<string, React.ElementType> = {
  Rocket,
  Cog,
  Brain,
  Settings,
  Globe,
  Bot,
  Zap,
};

/** Animation variant for fade-in-up effect */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface PackageCardProps {
  readonly pkg: ServicePackage;
  readonly variant?: "compact" | "detailed";
}

/**
 * Displays a service package card with pricing, features, and CTA
 * @param variant - "compact" for homepage preview, "detailed" for full information (default)
 */
export function PackageCard({ pkg, variant = "detailed" }: PackageCardProps) {
  const t = useTranslations("Services");
  const IconComponent = iconMap[pkg.icon];

  return (
    <m.div variants={fadeInUp} className="w-full max-w-sm">
      <Card className="h-full relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-background/80 backdrop-blur-sm border-border/50 hover:border-muted-foreground/30">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            {IconComponent && (
              <div className="p-2 rounded-lg bg-muted">
                <IconComponent className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-xl font-semibold">{t(pkg.nameKey)}</h3>
            </div>
            <Badge variant="outline" className="ml-auto shrink-0">
              {t(`packages.tiers.${pkg.tier}`)}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-sky-500">
            {t(pkg.headlineKey)}
          </p>
          {variant === "detailed" && (
            <p className="text-muted-foreground">{t(pkg.descriptionKey)}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing & Timeline */}
          {variant === "detailed" && (
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <p className="text-2xl font-bold">{t(pkg.pricingKey)}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>{t(pkg.timelineKey)}</span>
              </div>
            </div>
          )}

          {/* Features List */}
          <ul className="space-y-3">
            {(variant === "compact"
              ? pkg.features.slice(0, 3)
              : pkg.features
            ).map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check
                  className="h-5 w-5 text-green-500 shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="text-sm">{t(feature.textKey)}</span>
              </li>
            ))}
          </ul>
          {variant === "compact" && pkg.features.length > 3 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{pkg.features.length - 3} more features
            </p>
          )}
        </CardContent>
      </Card>
    </m.div>
  );
}
