/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cardSurface, RevealGroup, RevealItem } from "@/components/visuals";
import { cn } from "@/lib/utils";
import { capabilities } from "@/data/main/capabilitiesData";
import type { Capability } from "@/types/main/capabilities";
import { Rocket, TrendingUp, Shield, Globe } from "lucide-react";
import {
  SiNextdotjs,
  SiReact,
  SiVercel,
  SiDocker,
  SiPostgresql,
  SiTypescript,
  SiPrisma,
} from "react-icons/si";
import { useTranslations } from "next-intl";

// Icon mapping for dynamic rendering (lucide icons)
const iconMap: Record<string, React.ElementType> = {
  Rocket,
  TrendingUp,
  Shield,
  Globe,
};

// Tech icon mapping (react-icons/si)
const techIconMap: Record<string, React.ElementType> = {
  SiNextdotjs,
  SiReact,
  SiVercel,
  SiDocker,
  SiPostgresql,
  SiTypescript,
  SiPrisma,
};

/**
 * Individual Capability Card
 */
function CapabilityCard({
  capability,
  t,
}: {
  capability: Capability;
  t: ReturnType<typeof useTranslations>;
}) {
  const IconComponent = iconMap[capability.icon];

  return (
    <RevealItem className="h-full">
      <Card className={cn(cardSurface, "h-full")}>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-4">
            {IconComponent && (
              <div className="p-3 rounded-xl bg-muted text-foreground">
                <IconComponent className="h-6 w-6" aria-hidden="true" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1">
                {t(capability.titleKey)}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                {t(capability.headlineKey)}
              </p>
            </div>
          </div>
          <p className="text-sm text-foreground/80 dark:text-white/90 leading-relaxed">
            {t(capability.descriptionKey)}
          </p>
          {/* Tech Icons - subtle indicators */}
          {capability.techIcons && capability.techIcons.length > 0 && (
            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              {capability.techIcons.map((iconName) => {
                const TechIcon = techIconMap[iconName];
                return TechIcon ? (
                  <TechIcon
                    key={iconName}
                    className="h-4 w-4 text-foreground/50 dark:text-white/70 hover:text-foreground dark:hover:text-white transition-colors"
                    aria-hidden="true"
                  />
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </RevealItem>
  );
}

/**
 * Capabilities Section Component
 */
export default function Capabilities() {
  const t = useTranslations("Capabilities");

  return (
    <section
      className="px-4 max-w-6xl mx-auto py-16"
      id="capabilities"
      aria-labelledby="capabilities-section-title"
      role="region"
    >
      <div className="space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <h2
            id="capabilities-section-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold"
          >
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Capabilities Grid */}
        <RevealGroup className="grid sm:grid-cols-2 gap-6">
          {capabilities.map((capability) => (
            <CapabilityCard key={capability.id} capability={capability} t={t} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
