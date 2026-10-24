/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Clock, Mail } from "lucide-react";
import { contactEmailLink } from "@/data/main/contact";
import {
  cardSurface,
  RevealGroup,
  RevealItem,
  SectionHeading,
} from "@/components/visuals";
import { cn } from "@/lib/utils";
import type { AboutTranslations } from "@/types/configs/i18n";
import {
  ABOUT_COMPLIANCE_ITEMS,
  ABOUT_EXPLORE_LINKS,
} from "./AboutContent.constants";

/** Space between sections, the same rhythm as the home page. */
const SECTION = "py-16 md:py-24";

/** Both portraits stay in the DOM; the `dark` class picks one, as in the home hero. */
const PORTRAIT_SIZES = "(min-width: 768px) 50vw, 100vw";

const tag = "bg-surface px-2.5 py-1 text-sm font-medium";

const contactButton =
  "inline-flex min-h-12 w-full items-center justify-center gap-2.5 bg-primary px-6 font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:w-fit";

export function AboutContent() {
  const t = useTranslations("About");
  const tHero = useTranslations("Hero");
  const focusItems = t.raw(
    "currentFocusItems",
  ) as AboutTranslations["currentFocusItems"];
  const storyParagraphs = t.raw(
    "story.paragraphs",
  ) as AboutTranslations["story"]["paragraphs"];

  return (
    <div className="pb-16 md:pb-24">
      {/* Intro: copy beside the portrait, the home hero's grid */}
      <section
        aria-labelledby="about-name"
        className="frame grid grid-cols-12 gap-x-6 gap-y-8 pt-4 sm:pt-6 md:pt-10"
      >
        <div className="col-span-12 my-auto flex flex-col gap-6 md:col-span-6 md:pr-6 lg:pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(tag, "inline-flex items-center gap-2")}>
              <span
                className="h-2 w-2 rounded-full bg-red-500"
                aria-hidden="true"
              />
              {t("badge")}
            </span>
            {ABOUT_COMPLIANCE_ITEMS.map(({ key }) => (
              <span key={key} className={tag}>
                {t(`compliance.${key}.label`)}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h1
              id="about-name"
              className="text-[clamp(2.5rem,1.4rem+3.6vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.035em] text-balance"
            >
              {t("personalInfo.name")}
            </h1>
            <p className="max-w-[30ch] text-[clamp(1.25rem,1.05rem+0.8vw,1.75rem)] font-semibold leading-tight">
              {t("personalInfo.title")}
            </p>
          </div>

          <p className="max-w-[46ch] text-lg leading-relaxed text-foreground">
            {t("intro")}
          </p>

          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-muted-foreground">
              {t("focusTitle")}
            </p>
            <ul className="flex flex-wrap gap-2">
              {focusItems.map((focus) => (
                <li key={focus} className={tag}>
                  {focus}
                </li>
              ))}
            </ul>
          </div>

          <a href={contactEmailLink} className={contactButton}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            {t("cta.contact")}
          </a>
        </div>

        {/* Phones see the portrait first; from md it sits beside the copy */}
        <figure className="relative order-first col-span-12 aspect-6/5 overflow-hidden bg-surface sm:aspect-4/3 md:order-0 md:col-span-6 md:aspect-auto md:min-h-[min(68svh,46rem)]">
          <Image
            src="/portrait-light.jpg"
            alt={tHero("portraitAltLight")}
            fill
            priority
            sizes={PORTRAIT_SIZES}
            className="object-cover object-[50%_22%] dark:hidden"
          />
          <Image
            src="/portrait-dark.jpg"
            alt={tHero("portraitAltDark")}
            fill
            priority
            sizes={PORTRAIT_SIZES}
            className="hidden object-cover object-[50%_30%] dark:block"
          />
        </figure>
      </section>

      {/* A bit about me */}
      <section aria-labelledby="about-story" className={cn("frame", SECTION)}>
        <div className="grid grid-cols-12 gap-x-6 gap-y-8">
          <SectionHeading
            id="about-story"
            title={t("story.title")}
            className="col-span-12 self-start lg:col-span-5"
          />
          <div className="col-span-12 flex max-w-[65ch] flex-col gap-5 lg:col-span-7">
            {storyParagraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-lg leading-relaxed text-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* GDPR / DSGVO + EU AI Act — highlighted on purpose */}
      <section
        aria-labelledby="about-compliance"
        className={cn("frame", SECTION, "pt-0 md:pt-0")}
      >
        <SectionHeading
          id="about-compliance"
          title={t("compliance.title")}
          lead={t("compliance.subtitle")}
          className="mb-10"
        />
        <RevealGroup className="grid gap-2 md:grid-cols-2">
          {ABOUT_COMPLIANCE_ITEMS.map(({ key, icon: Icon }) => (
            <RevealItem key={key} className="h-full">
              <article
                className={cn(cardSurface, "flex h-full flex-col p-6 lg:p-8")}
              >
                <div className="mb-6 flex items-center justify-between gap-3">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <span className="text-sm font-semibold text-muted-foreground">
                    {t(`compliance.${key}.label`)}
                  </span>
                </div>
                <h3 className="mb-3 text-2xl font-semibold leading-tight tracking-[-0.01em]">
                  {t(`compliance.${key}.title`)}
                </h3>
                <p className="leading-relaxed text-foreground">
                  {t(`compliance.${key}.description`)}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t("compliance.note")}
        </p>
      </section>

      {/* Availability */}
      <section
        aria-labelledby="about-availability"
        className={cn("frame", SECTION, "pt-0 md:pt-0")}
      >
        <div className="grid grid-cols-12 gap-x-6 gap-y-6 border-l-4 border-red-500 bg-surface p-6 lg:p-10">
          <div className="col-span-12 flex flex-col gap-4 lg:col-span-8">
            <h2
              id="about-availability"
              className="flex items-start gap-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl"
            >
              <Clock
                className="mt-1.5 h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              {t("availability.title")}
            </h2>
            <p className="max-w-[65ch] leading-relaxed text-foreground">
              {t("availability.description")}
            </p>
          </div>
          <div className="col-span-12 flex items-end lg:col-span-4 lg:justify-end">
            <a href={contactEmailLink} className={contactButton}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("cta.contact")}
            </a>
          </div>
        </div>
      </section>

      {/* Links to the pages that already present the work */}
      <section aria-labelledby="about-explore" className="frame">
        <SectionHeading
          id="about-explore"
          title={t("explore.title")}
          className="mb-10"
        />
        <div className="grid gap-2 sm:grid-cols-3">
          {ABOUT_EXPLORE_LINKS.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className={cn(
                cardSurface,
                "group flex min-h-20 items-center justify-between gap-4 px-6 text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" aria-hidden="true" />
                {t(`explore.${key}`)}
              </span>
              <ArrowRight
                className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
