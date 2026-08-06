/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ServicePackage } from "@/types/hubs/services";
import { cardSurface } from "@/components/visuals";
import { cn } from "@/lib/utils";
import {
  Cog,
  Brain,
  Settings,
  Globe,
  Database,
  Check,
  Clock,
  Info,
  ListPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";

/** Icon mapping for dynamic rendering */
const iconMap: Record<string, React.ElementType> = {
  Cog,
  Brain,
  Settings,
  Globe,
  Database,
};

interface PackageCardProps {
  readonly pkg: ServicePackage;
  readonly variant?: "compact" | "detailed";
}

/**
 * Displays a service package card with pricing, features, and CTA.
 * Scroll motion is supplied by the caller via `RevealItem`.
 * @param variant - "compact" for homepage preview, "detailed" for full information (default)
 */
export function PackageCard({ pkg, variant = "detailed" }: PackageCardProps) {
  const t = useTranslations("Services");
  const IconComponent = iconMap[pkg.icon];
  const extras = pkg.extras ?? [];

  return (
    <div className="w-full h-full flex flex-col">
      <Card
        className={cn(
          cardSurface,
          "h-full flex flex-col relative overflow-hidden"
        )}
      >
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
          </div>
          <p className="text-2xl font-bold text-foreground/80">
            {t(pkg.headlineKey)}
          </p>
          {variant === "detailed" && (
            <p className="text-muted-foreground">{t(pkg.descriptionKey)}</p>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-6">
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
          <ul
            className={cn(
              "space-y-3",
              variant === "detailed" &&
                "sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3 sm:space-y-0"
            )}
          >
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

          {/* Scope note — what this package does or doesn't cover */}
          {variant === "detailed" && pkg.scopeNote && (
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3">
              <Info
                className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/80">
                  {t(pkg.scopeNote.labelKey)}:
                </span>{" "}
                {t(pkg.scopeNote.textKey)}
              </p>
            </div>
          )}

          {/* Full price list — every priced extra for this package, in a dialog */}
          {variant === "detailed" && extras.length > 0 && (
            <div className="pt-4 border-t mt-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <ListPlus className="h-4 w-4" aria-hidden="true" />
                    {t("packages.extras.seeAll")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {t("packages.extras.dialogTitle", {
                        package: t(pkg.nameKey),
                      })}
                    </DialogTitle>
                    <DialogDescription>
                      {t("packages.extras.dialogDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <ul className="divide-y">
                    {extras.map((extra, index) => (
                      <li
                        key={index}
                        className="flex items-baseline justify-between gap-4 py-3 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {t(extra.labelKey)}
                        </span>
                        <span className="font-medium shrink-0">
                          {t(extra.priceKey)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground/80 italic">
                    {t("packages.extras.finalPrice")}
                  </p>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
