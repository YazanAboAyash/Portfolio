/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ExternalLink,
  Languages,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import {
  ABOUT_PORTFOLIO_CONTENT,
  ABOUT_PORTFOLIO_DOCS_URL,
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
import { SUPPORTED_LOCALES } from "@/data/configs/i18n";
import { portfolioTools } from "@/lib/mcp/portfolio-tools";
import { cn, getPortfolioVersion } from "@/lib/utils";

const SECTION = "py-16 md:py-24";
const EYEBROW = "font-mono text-xs uppercase tracking-widest text-muted-foreground";
const PRIMARY_ACTION =
  "inline-flex min-h-12 items-center justify-center gap-2.5 bg-primary px-6 font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export function AboutPortfolioPage() {
  const content = ABOUT_PORTFOLIO_CONTENT;
  const stats = [
    { value: "16", label: content.statLabels.next },
    {
      value: String(SUPPORTED_LOCALES.length).padStart(2, "0"),
      label: content.statLabels.locales,
    },
    {
      value: String(Object.keys(portfolioTools).length).padStart(2, "0"),
      label: content.statLabels.tools,
    },
  ];

  return (
    <main lang="en" className="frame pb-16 md:pb-24">
      <header className="grid gap-12 border-b border-foreground/10 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className={cn(EYEBROW, "flex flex-wrap items-center gap-x-3 gap-y-1")}>
            <span>
              {content.eyebrow} / v{getPortfolioVersion()}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5" aria-hidden="true" />
              {content.languageNotice}
            </span>
          </p>
          <h1
            id="about-portfolio-title"
            className="mt-6 text-4xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-6xl xl:text-7xl"
          >
            {content.title}
            <span className="block text-muted-foreground">
              {content.titleAccent}
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-foreground/80 sm:text-xl">
            {content.introduction}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href="#site-at-a-glance" className={PRIMARY_ACTION}>
              {content.stackAction}
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={ABOUT_PORTFOLIO_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold underline decoration-surface-2 decoration-2 underline-offset-[6px] transition-colors hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {content.docsAction}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-2 lg:w-88">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className={cn(cardSurface, "flex flex-col-reverse gap-1 p-5")}
            >
              <dt className="text-sm text-foreground/80">{label}</dt>
              <dd className="text-3xl font-bold tabular-nums tracking-tight">
                {value}
              </dd>
            </div>
          ))}
        </dl>
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
                ? SiGithub
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

      <section
        className="flex flex-wrap items-end justify-between gap-10 border-t border-foreground/10 pt-16 md:pt-24"
        aria-labelledby="site-closing"
      >
        <div>
          <p className={EYEBROW}>{content.closingEyebrow}</p>
          <h2
            id="site-closing"
            className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
          >
            {content.closingTitle}
            <span className="block italic text-muted-foreground">
              {content.closingAccent}
            </span>
          </h2>
        </div>
        <Link href="/" className={PRIMARY_ACTION}>
          {content.closingAction}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
