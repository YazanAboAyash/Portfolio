/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { RevealGroup, RevealItem, SectionHeading } from "@/components/visuals";
import { capabilities } from "@/data/main/capabilitiesData";
import type { Capability } from "@/types/main/capabilities";
import { BrainCircuit, Rocket, TrendingUp, Shield } from "lucide-react";
import {
  SiAnthropic,
  SiDocker,
  SiModelcontextprotocol,
  SiNextdotjs,
  SiOllama,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";
import { useTranslations } from "next-intl";

// Icon mapping for dynamic rendering (lucide icons)
const iconMap: Record<string, React.ElementType> = {
  BrainCircuit,
  Rocket,
  TrendingUp,
  Shield,
};

// Tech icon mapping (react-icons/si, plus VscAzure — simple-icons has no Azure mark)
const techIconMap: Record<string, React.ElementType> = {
  SiAnthropic,
  SiDocker,
  SiModelcontextprotocol,
  SiNextdotjs,
  SiOllama,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiTypescript,
  SiVercel,
  VscAzure,
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
      <article className="flex h-full flex-col gap-4">
        <h3 className="flex items-center gap-3 text-2xl font-bold leading-tight tracking-[-0.015em]">
          {IconComponent && (
            <IconComponent className="h-6 w-6 shrink-0" aria-hidden="true" />
          )}
          {t(capability.titleKey)}
        </h3>
        <p className="text-lg font-semibold leading-snug">
          {t(capability.headlineKey)}
        </p>
        <p className="text-base leading-relaxed text-foreground">
          {t(capability.descriptionKey)}
        </p>
        {/* Tech Icons - subtle indicators */}
        {capability.techIcons && capability.techIcons.length > 0 && (
          <div className="mt-auto flex items-center gap-4 pt-2">
            {capability.techIcons.map((iconName) => {
              const TechIcon = techIconMap[iconName];
              return TechIcon ? (
                <TechIcon
                  key={iconName}
                  className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground"
                  aria-hidden="true"
                />
              ) : null;
            })}
          </div>
        )}
      </article>
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
      className="frame py-16 md:py-24"
      id="capabilities"
      aria-labelledby="capabilities-section-title"
      role="region"
    >
      <div className="grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 lg:col-span-4">
          <SectionHeading
            id="capabilities-section-title"
            title={t("title")}
            lead={t("subtitle")}
            className="lg:sticky lg:top-24"
          />
        </div>

        {/* Capabilities Grid */}
        <RevealGroup className="col-span-12 grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:col-span-8">
          {capabilities.map((capability) => (
            <CapabilityCard key={capability.id} capability={capability} t={t} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
