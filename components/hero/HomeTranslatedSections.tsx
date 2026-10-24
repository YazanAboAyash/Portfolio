/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { CompanyBanner } from "@/components/companies";

/** Translated hero banner text + company banner */
export function HeroBannerSection() {
  const t = useTranslations("Home");
  return (
    <div className="frame flex flex-col gap-4">
      <p className="text-base font-medium text-foreground">
        {t("companiesContributing")}
      </p>
      <CompanyBanner />
    </div>
  );
}
