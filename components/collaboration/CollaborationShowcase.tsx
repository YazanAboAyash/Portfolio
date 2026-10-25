/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  cardRailFeatured,
  cardSurfaceFeatured,
  RevealGroup,
  RevealItem,
  SectionHeading,
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
    <section
      className={className}
      id="collaboration"
      aria-labelledby="collaboration-title"
    >
      <SectionHeading
        id="collaboration-title"
        title={t("title")}
        lead={t("subtitle")}
        className="mb-12"
      />

      <RevealGroup>
        <RevealItem>
          <article
            className={cn(
              cardSurfaceFeatured,
              "grid grid-cols-1 hover:bg-surface md:grid-cols-12",
            )}
          >
            {/* Left: content */}
            <div
              className={cn(
                cardRailFeatured,
                "flex flex-col gap-5 p-6 sm:p-8 md:col-span-8 lg:p-12",
              )}
            >
              {/* Title */}
              <h3 className="max-w-[24ch] text-2xl font-bold leading-tight tracking-[-0.015em] md:text-3xl">
                {tProject("title")}
              </h3>

              <p className="max-w-2xl text-base leading-relaxed text-foreground md:text-lg">
                {tProject("description")}
              </p>

              {/* Tech */}
              <p className="text-sm text-muted-foreground">
                {COLLABORATION_TECHS.join(" · ")}
              </p>

              {/* Status: live, team project, field */}
              <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
                <span className="inline-flex items-center gap-2 text-green-700 dark:text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-500 motion-safe:animate-pulse" />
                  {tProject("live")}
                </span>
                <span>{t("badge")}</span>
                <span className="text-muted-foreground">AI &amp; Automation</span>
              </p>

              {/* Footer: company + link */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/assets/companies/botgenossen.png"
                    alt="Botgenossen"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                  <span className="text-sm font-semibold">
                    {tProject("company")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    · {tProject("role")}
                  </span>
                </div>

                <Link
                  href="https://www.buettelborn.de/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  aria-label={tProject("visitSite")}
                >
                  buettelborn.de
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right: large logo on the next tone step */}
            <div className="hidden items-center justify-center bg-surface-2 p-10 md:col-span-4 md:flex">
              <Image
                src="/assets/companies/botgenossen.png"
                alt="Botgenossen logo"
                width={140}
                height={140}
                className="object-contain transition-transform duration-500 group-hover/card:scale-105 motion-reduce:transition-none"
              />
            </div>
          </article>
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
