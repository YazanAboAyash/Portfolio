/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { RevealGroup, RevealItem, SectionHeading } from "@/components/visuals";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { capabilities, techIconLabels } from "@/data/main/capabilitiesData";
import { useTranslations } from "next-intl";
import { iconMap, techIconMap } from "./capability-icons";
import { ShipPipeline } from "./ShipPipeline";
import { StackExplorer } from "./StackExplorer";

/**
 * Brand marks, named to screen readers and in a tooltip on hover or focus
 * (below md, where there is no hover, as a caption instead).
 */
function TechIconRow({ icons }: { readonly icons: readonly string[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-1">
      {icons.map((id) => {
        const TechIcon = techIconMap[id];
        const label = techIconLabels[id] ?? id;
        if (!TechIcon) return null;

        return (
          <li key={id} className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  role="img"
                  aria-label={label}
                  className="flex h-10 w-10 cursor-help items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  <TechIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
            {/* Phones get no hover, so the name sits beside the mark there */}
            <span className="pr-3 text-sm md:hidden" aria-hidden="true">
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Capabilities Section Component
 *
 * AI leads as what gets built; Ship, Security and Scale appear as the stages
 * of the pipeline every change takes on its way to production.
 */
export default function Capabilities() {
  const t = useTranslations("Capabilities");
  const ai = capabilities.find((capability) => capability.id === "ai");
  const AiIcon = ai ? iconMap[ai.icon] : null;

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

        <div className="col-span-12 flex flex-col gap-12 md:gap-16 lg:col-span-8">
          {/* What gets built */}
          {ai && (
            <RevealGroup>
              <RevealItem>
                <article className="flex flex-col gap-3 bg-surface p-6 md:gap-4 md:p-8">
                  <h3 className="flex items-center gap-3 text-2xl font-bold leading-tight tracking-[-0.015em] md:text-3xl">
                    {AiIcon && (
                      <AiIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    )}
                    {t(ai.titleKey)}
                  </h3>
                  <p className="text-lg font-semibold leading-snug md:text-xl">
                    {t(ai.headlineKey)}
                  </p>
                  <p className="hidden max-w-[60ch] leading-relaxed md:block">
                    {t(ai.descriptionKey)}
                  </p>

                  {/* Who provides the models, kept apart from what gets built */}
                  <dl className="mt-2 flex flex-col gap-4 border-t border-border pt-4">
                    {ai.techIcons && ai.techIcons.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm font-semibold text-muted-foreground">
                          {t("ai.providers")}
                        </dt>
                        <dd className="-ml-2.5">
                          <TechIconRow icons={ai.techIcons} />
                        </dd>
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <dt className="text-sm font-semibold text-muted-foreground">
                        {t("ai.buildsLabel")}
                      </dt>
                      <dd className="font-semibold">{t("ai.builds")}</dd>
                    </div>
                  </dl>
                </article>
              </RevealItem>
            </RevealGroup>
          )}

          {/* How it ships */}
          <div className="flex flex-col gap-8 md:gap-10">
            <div className="flex max-w-2xl flex-col gap-3">
              <h3 className="text-2xl font-bold leading-tight tracking-[-0.015em] md:text-3xl">
                {t("pipeline.title")}
              </h3>
              <p className="leading-relaxed md:text-lg">{t("pipeline.lead")}</p>
            </div>
            <ShipPipeline />
          </div>

          {/* Stack */}
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex max-w-2xl flex-col gap-3">
              <h3 className="text-2xl font-bold leading-tight tracking-[-0.015em] md:text-3xl">
                {t("stack.title")}
              </h3>
              <p className="leading-relaxed md:text-lg">{t("stack.lead")}</p>
            </div>
            <StackExplorer />
          </div>
        </div>
      </div>
    </section>
  );
}
