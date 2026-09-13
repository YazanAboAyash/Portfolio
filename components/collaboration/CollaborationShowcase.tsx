/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import {
  cardRailFeatured,
  cardSurfaceFeatured,
  RevealGroup,
  RevealItem,
  ScrambleText,
} from "@/components/visuals";
import { cn } from "@/lib/utils";

const COLLABORATION_TECHS = [
  "AI Avatar",
  "Multilingual",
  "Interactive",
  "Next.js",
  "TypeScript",
];

interface CollaborationShowcaseProps {
  readonly className?: string;
}

export function CollaborationShowcase({
  className,
}: CollaborationShowcaseProps) {
  const t = useTranslations("Collaboration");
  const tProject = useTranslations("Collaboration.project");

  return (
    <section className={className} id="collaboration">
      <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-center mb-3 text-black dark:text-white">
        <ScrambleText text={t("title")} />
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-12">
        {t("subtitle")}
      </p>

      <RevealGroup className="max-w-6xl mx-auto">
        <RevealItem>
          <div className={cn(cardSurfaceFeatured, "relative overflow-hidden")}>
            {/* Top amber accent line */}
            <div className="h-1 shrink-0 bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500" />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-0">
              {/* Left: content */}
              <div className={cn(cardRailFeatured, "pl-5 p-6 md:p-8")}>
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-500 border border-amber-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {tProject("live")}
                  </span>
                  <Badge
                    variant="secondary"
                    className="rounded-md border border-amber-400/25 bg-amber-400/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px] font-semibold"
                  >
                    {t("badge")}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="rounded-md border border-border/50 bg-muted/70 px-2 py-0.5 text-[10px] font-medium"
                  >
                    AI &amp; Automation
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-semibold mb-3 text-foreground group-hover/card:text-amber-500 transition-colors duration-200">
                  {tProject("title")}
                </h3>

                {/* Description */}
                <p className="text-sm text-foreground/70 leading-relaxed mb-5 max-w-2xl">
                  {tProject("description")}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {COLLABORATION_TECHS.map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Footer: company + link */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src="/assets/companies/botgenossen.png"
                      alt="Botgenossen"
                      width={28}
                      height={28}
                      className="rounded-sm object-contain"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {tProject("company")}
                    </span>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <span className="text-xs text-muted-foreground/60">
                      {tProject("role")}
                    </span>
                  </div>

                  <Link
                    href="https://www.buettelborn.de/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors duration-200"
                    aria-label="Visit Büttleborn city website"
                  >
                    buettelborn.de
                    <FiExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>

              {/* Right: large logo */}
              <div className="hidden md:flex items-center justify-center px-10 bg-amber-400/5 border-l border-amber-400/15">
                <Image
                  src="/assets/companies/botgenossen.png"
                  alt="Botgenossen logo"
                  width={110}
                  height={110}
                  className="object-contain opacity-80 group-hover/card:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
