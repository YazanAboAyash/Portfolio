/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import {
  contactEmail,
  contactEmailLink,
  contactTopics,
} from "@/data/main/contact";
import { cardSurface, SectionHeading } from "@/components/visuals";
import { cn } from "@/lib/utils";

const groupLabelClass =
  "text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground";

const actionClass =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 whitespace-nowrap px-5 font-semibold sm:px-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/**
 * The home page's closing section: the address with a copy button, for
 * visitors without a mail app set up, and a few pre-filled drafts. Everything
 * is a plain mailto link, so no message passes through the site.
 */
export default function ContactSection({ className }: { className?: string }) {
  const t = useTranslations("Contact");
  const [copied, setCopied] = useState(false);

  const copyEmail = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the address stays visible and selectable.
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className={cn("scroll-mt-20", className)}
    >
      <SectionHeading
        id="contact-title"
        title={t("title")}
        lead={t("lead")}
        className="mb-10"
      />

      <div className="grid grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-12 flex flex-col gap-5 lg:col-span-5">
          <p className={groupLabelClass}>{t("emailLabel")}</p>
          <a
            href={contactEmailLink}
            className="w-fit text-2xl font-bold tracking-[-0.015em] underline decoration-surface-2 decoration-2 underline-offset-[6px] transition-colors wrap-anywhere hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground xl:text-3xl"
          >
            {contactEmail}
          </a>
          {/* Phones give the write action the spare width so it stays on one line */}
          <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:flex-wrap">
            <a
              href={contactEmailLink}
              className={cn(
                actionClass,
                "bg-primary text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
              )}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("write")}
            </a>
            <button
              type="button"
              onClick={() => void copyEmail()}
              aria-label={t("copyLabel")}
              className={cn(
                actionClass,
                "bg-surface transition-colors hover:bg-surface-2",
              )}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <span role="status" className="sr-only">
            {copied ? t("copied") : ""}
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("availability")}
          </p>
        </div>

        <div className="col-span-12 flex flex-col gap-5 lg:col-span-7">
          <p className={groupLabelClass}>{t("topicsTitle")}</p>
          <ul className="flex flex-col gap-2">
            {contactTopics.map((topic) => {
              const query = new URLSearchParams({
                subject: t(`topics.${topic}.subject`),
                body: t(`topics.${topic}.body`),
              });

              return (
                <li key={topic}>
                  <a
                    // URLSearchParams writes spaces as "+", which mail apps show literally
                    href={`${contactEmailLink}?${query.toString().replace(/\+/g, "%20")}`}
                    className={cn(
                      cardSurface,
                      "grid grid-cols-[1fr_auto] items-center gap-6 px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:px-6 md:py-5",
                    )}
                  >
                    <span>
                      <span className="block text-lg font-semibold tracking-[-0.01em]">
                        {t(`topics.${topic}.label`)}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-foreground/80">
                        {t(`topics.${topic}.description`)}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
