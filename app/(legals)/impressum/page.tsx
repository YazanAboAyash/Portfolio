/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { Metadata } from "next";
import { User, Phone, FileEdit } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { generateLegalPageSEO } from "@/lib/configs/seo";
import Link from "next/link";

/**
 * Without this the route inherits the (legals) group layout's metadata, which is
 * hardcoded to the privacy page.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return generateLegalPageSEO("impressum", locale);
}

/**
 * The review date is fixed rather than `new Date()`. A notice that always claims
 * to have been updated today tells the reader nothing about when its contents
 * were actually checked. Bump this by hand whenever the legal notice changes.
 */
const LAST_REVIEWED = "2026-10-24";

/** One flat field per block, the v7 card. */
const block = "bg-surface p-6 lg:p-8";
const blockTitle =
  "mb-5 flex items-center gap-3 text-xl font-semibold tracking-[-0.01em]";

export default async function Impressum() {
  const t = await getTranslations("Impressum");

  return (
    <div className="frame pt-4 pb-16 sm:pt-6 md:pt-10 md:pb-24">
      {/* Header */}
      <div className="mb-10 max-w-2xl space-y-3">
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="text-lg leading-relaxed text-foreground/80">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {/* Contact Information - § 5 DDG */}
        <section className={block}>
          <h2 className={blockTitle}>
            <User className="h-5 w-5" aria-hidden="true" />
            {t("provider.title")}
          </h2>
          <address className="space-y-1 not-italic">
            <p className="font-medium">{t("provider.name")}</p>
            <p className="text-foreground/80">{t("provider.address")}</p>
            <p className="text-foreground/80">{t("provider.city")}</p>
            <p className="text-foreground/80">{t("provider.country")}</p>
          </address>
        </section>

        {/* Contact */}
        <section className={block}>
          <h2 className={blockTitle}>
            <Phone className="h-5 w-5" aria-hidden="true" />
            {t("contact.title")}
          </h2>
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{t("contact.email")}</span>
            <Link
              href={`mailto:${t("contact.emailValue")}`}
              className="font-semibold underline decoration-surface-2 decoration-2 underline-offset-[6px] transition-colors hover:decoration-foreground"
            >
              {t("contact.emailValue")}
            </Link>
          </p>
        </section>

        {/* Editorial Responsibility (for Blog) */}
        <section className={`${block} md:col-span-2`}>
          <h2 className={blockTitle}>
            <FileEdit className="h-5 w-5" aria-hidden="true" />
            {t("editorial.title")}
          </h2>
          <address className="space-y-1 not-italic">
            <p className="font-medium">{t("editorial.name")}</p>
            <p className="text-foreground/80">{t("editorial.address")}</p>
            <p className="text-foreground/80">{t("editorial.city")}</p>
          </address>
        </section>
      </div>

      {/* Last Updated */}
      <p className="mt-6 text-sm text-muted-foreground">
        {t("lastUpdated")} {LAST_REVIEWED}
      </p>
    </div>
  );
}
