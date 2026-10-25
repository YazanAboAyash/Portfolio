/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import Link from "next/link";
import { ArrowUpRight, Check, ExternalLink, Github, Languages } from "lucide-react";
import {
  ABOUT_PORTFOLIO_CONTENT,
  ABOUT_PORTFOLIO_LINKS,
  ABOUT_PORTFOLIO_PRACTICES,
  ABOUT_PORTFOLIO_STACK,
} from "@/data/hubs/about-portfolio.data";
import {
  cardSurface,
  RevealGroup,
  RevealItem,
  SectionHeading,
} from "@/components/visuals";
import { cn } from "@/lib/utils";

const SECTION = "py-16 md:py-24";

export function AboutPortfolioPage() {
  const content = ABOUT_PORTFOLIO_CONTENT;

  return (
    <main lang="en" className="frame pb-16 md:pb-24">
      <header className="border-b border-foreground/10 py-16 md:py-24">
        <SectionHeading
          as="h1"
          id="about-portfolio-title"
          title={content.title}
          lead={content.lead}
          aside={
            <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Languages className="h-4 w-4" aria-hidden="true" />
              {content.languageNotice}
            </p>
          }
        />
        <p className="mt-10 max-w-3xl text-xl leading-relaxed text-foreground sm:text-2xl">
          {content.introduction}
        </p>
      </header>

      <section className={SECTION} aria-labelledby="site-at-a-glance">
        <SectionHeading
          id="site-at-a-glance"
          title={content.stackTitle}
          lead={content.stackLead}
          className="mb-10"
        />
        <RevealGroup className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ABOUT_PORTFOLIO_STACK.map(({ icon: Icon, label, value }) => (
            <RevealItem key={label}>
              <article className={cn(cardSurface, "flex min-h-36 flex-col justify-between p-6")}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <div className="mt-8">
                  <p className="text-xl font-semibold tracking-[-0.01em]">
                    {value}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                    {label}
                  </p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section
        className={cn(SECTION, "pt-0 md:pt-0")}
        aria-labelledby="site-principles"
      >
        <SectionHeading
          id="site-principles"
          title={content.principlesTitle}
          lead={content.principlesLead}
          className="mb-10"
        />
        <RevealGroup className="grid gap-2 lg:grid-cols-3">
          {content.principles.map(({ icon: Icon, title, description }) => (
            <RevealItem key={title}>
              <article className={cn(cardSurface, "flex h-full flex-col p-6 lg:p-8")}>
                <Icon className="h-6 w-6" aria-hidden="true" />
                <h2 className="mt-10 text-2xl font-semibold leading-tight tracking-[-0.01em]">
                  {title}
                </h2>
                <p className="mt-4 leading-relaxed text-foreground/80">
                  {description}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section
        className={cn(SECTION, "pt-0 md:pt-0")}
        aria-labelledby="site-practice"
      >
        <SectionHeading
          id="site-practice"
          title={content.practiceTitle}
          lead={content.practiceLead}
          className="mb-10"
        />
        <RevealGroup className="grid gap-2 md:grid-cols-2">
          {ABOUT_PORTFOLIO_PRACTICES.map(
            ({ icon: Icon, title, description, points }) => (
              <RevealItem key={title}>
                <article className={cn(cardSurface, "h-full p-6 lg:p-8")}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <h2 className="mt-10 text-2xl font-semibold leading-tight tracking-[-0.01em]">
                    {title}
                  </h2>
                  <p className="mt-4 max-w-[58ch] leading-relaxed text-foreground/80">
                    {description}
                  </p>
                  <ul className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/80">
                    {points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-foreground"
                          aria-hidden="true"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </RevealItem>
            ),
          )}
        </RevealGroup>
      </section>

      <section className={cn(SECTION, "pt-0 md:pt-0")} aria-labelledby="site-links">
        <SectionHeading
          id="site-links"
          title={content.linksTitle}
          lead={content.linksLead}
          className="mb-10"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          {ABOUT_PORTFOLIO_LINKS.map(({ href, label, description, external }) => {
            // Compare the parsed hostname; a substring check would match any URL containing "github.com".
            const Icon = external
              ? new URL(href).hostname === "github.com"
                ? Github
                : ExternalLink
              : ArrowUpRight;

            return (
              <Link
                key={href}
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={cn(
                  cardSurface,
                  "flex min-h-36 items-end justify-between gap-6 p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground lg:p-8",
                )}
              >
                <span>
                  <span className="block text-xl font-semibold tracking-[-0.01em]">
                    {label}
                  </span>
                  <span className="mt-2 block max-w-[36ch] text-sm leading-relaxed text-foreground/80">
                    {description}
                  </span>
                </span>
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
