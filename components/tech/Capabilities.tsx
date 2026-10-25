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
import { StackExplorer } from "./StackExplorer";

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
      {/* Title and headline only; the longer description is served by the MCP tools */}
      <article className="flex h-full flex-col gap-2 bg-surface p-4 md:gap-4 md:bg-transparent md:p-0">
        <h3 className="flex items-center gap-2 text-lg font-bold leading-tight tracking-[-0.015em] md:gap-3 md:text-2xl">
          {IconComponent && (
            <IconComponent
              className="h-5 w-5 shrink-0 md:h-6 md:w-6"
              aria-hidden="true"
            />
          )}
          {t(capability.titleKey)}
        </h3>
        <p className="text-sm leading-snug md:text-lg md:font-semibold">
          {t(capability.headlineKey)}
        </p>
        {/* Tech Icons - subtle indicators */}
        {capability.techIcons && capability.techIcons.length > 0 && (
          <div className="mt-auto hidden items-center gap-4 pt-2 md:flex">
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

        <div className="col-span-12 flex flex-col gap-10 md:gap-16 lg:col-span-8">
          {/* Capabilities Grid */}
          <RevealGroup className="grid grid-cols-2 gap-0.5 md:gap-x-12 md:gap-y-16">
            {capabilities.map((capability) => (
              <CapabilityCard
                key={capability.id}
                capability={capability}
                t={t}
              />
            ))}
          </RevealGroup>

          <StackExplorer />
        </div>
      </div>
    </section>
  );
}
