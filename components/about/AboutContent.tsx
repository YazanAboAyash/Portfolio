/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CTAButton } from "@/components/ui/cta-button";
import {
  cardRail,
  cardSurface,
  RevealGroup,
  RevealItem,
} from "@/components/visuals";
import { cn } from "@/lib/utils";
import type { AboutTranslations } from "@/types/configs/i18n";
import {
  ABOUT_COMPLIANCE_ITEMS,
  ABOUT_EXPLORE_LINKS,
} from "./AboutContent.constants";

const sectionHeading =
  "text-2xl font-bold sm:text-3xl text-black dark:text-white";

export function AboutContent() {
  const t = useTranslations("About");
  const focusItems = t.raw(
    "currentFocusItems",
  ) as AboutTranslations["currentFocusItems"];
  const storyParagraphs = t.raw(
    "story.paragraphs",
  ) as AboutTranslations["story"]["paragraphs"];
  const workingItems = t.raw(
    "workingWithMe.items",
  ) as AboutTranslations["workingWithMe"]["items"];

  return (
    <div className="min-h-screen px-4 pt-12 pb-24 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-20">
        {/* Hero */}
        <section
          aria-labelledby="about-name"
          className={cn(cardSurface, "p-8 lg:p-12")}
        >
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="w-fit gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full bg-red-500"
                    aria-hidden="true"
                  />
                  {t("badge")}
                </Badge>
                {ABOUT_COMPLIANCE_ITEMS.map(({ key }) => (
                  <Badge key={key}>{t(`compliance.${key}.label`)}</Badge>
                ))}
              </div>
              <h1
                id="about-name"
                className="bg-linear-to-r from-black/90 to-gray-500 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl lg:text-5xl dark:from-gray-900 dark:to-gray-200"
              >
                {t("personalInfo.name")}
              </h1>
              <p className="text-xl font-semibold leading-relaxed text-primary">
                {t("personalInfo.title")}
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("intro")}
              </p>
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {t("focusTitle")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {focusItems.map((focus) => (
                    <Badge key={focus} variant="secondary">
                      {focus}
                    </Badge>
                  ))}
                </div>
              </div>
              <CTAButton
                label={t("cta.contact")}
                className="w-full cursor-pointer sm:w-fit"
              />
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/aboutMe.jpg"
                alt={t("personalInfo.name")}
                fill
                className="object-cover"
                quality={85}
                sizes="(max-width: 768px) 300px, (max-width: 1024px) 400px, 500px"
                priority
              />
            </div>
          </div>
        </section>

        {/* A bit about me */}
        <section aria-labelledby="about-story" className="max-w-3xl space-y-5">
          <h2 id="about-story" className={sectionHeading}>
            {t("story.title")}
          </h2>
          {storyParagraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-lg leading-relaxed text-muted-foreground"
            >
              {paragraph}
            </p>
          ))}
        </section>

        {/* GDPR / DSGVO + EU AI Act — highlighted on purpose */}
        <section aria-labelledby="about-compliance" className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 id="about-compliance" className={sectionHeading}>
              {t("compliance.title")}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("compliance.subtitle")}
            </p>
          </div>
          <RevealGroup className="grid gap-6 md:grid-cols-2">
            {ABOUT_COMPLIANCE_ITEMS.map(({ key, icon: Icon }) => (
              <RevealItem key={key} className="h-full">
                <article className={cn(cardSurface, "h-full p-6 lg:p-8")}>
                  <div className={cn(cardRail, "pl-5")}>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border/50 bg-muted/70 text-foreground">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <Badge>{t(`compliance.${key}.label`)}</Badge>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-foreground">
                      {t(`compliance.${key}.title`)}
                    </h3>
                    <p className="leading-relaxed text-muted-foreground">
                      {t(`compliance.${key}.description`)}
                    </p>
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground/80">
            {t("compliance.note")}
          </p>
        </section>

        {/* Working with me + availability */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className={cn(cardSurface, "p-6 lg:p-8")}>
            <div className={cn(cardRail, "space-y-5 pl-5")}>
              <h2 className={sectionHeading}>{t("workingWithMe.title")}</h2>
              <ul className="space-y-3">
                {workingItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 leading-relaxed text-muted-foreground"
                  >
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className={cn(
              cardSurface,
              "flex flex-col border-red-500/40 p-6 hover:border-red-500/70 hover:shadow-red-500/15 lg:p-8",
            )}
          >
            <div className="mb-4 flex items-center gap-3">
              <Clock
                className="h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className={sectionHeading}>{t("availability.title")}</h2>
            </div>
            <p className="mb-6 flex-1 leading-relaxed text-muted-foreground">
              {t("availability.description")}
            </p>
            <CTAButton
              label={t("cta.contact")}
              className="w-full cursor-pointer sm:w-fit"
            />
          </div>
        </section>

        {/* Links to the pages that already present the work */}
        <section aria-labelledby="about-explore" className="space-y-6">
          <h2 id="about-explore" className={sectionHeading}>
            {t("explore.title")}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ABOUT_EXPLORE_LINKS.map(({ key, href, icon: Icon }) => (
              <Button
                key={key}
                asChild
                variant="outline"
                className="h-12 cursor-pointer justify-between"
              >
                <Link href={href}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {t(`explore.${key}`)}
                  </span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
