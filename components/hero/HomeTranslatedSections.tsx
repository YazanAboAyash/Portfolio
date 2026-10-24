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
    <div className="flex flex-col gap-2">
      <span className="text-sm pb-4 font-medium text-center text-black dark:text-white">
        {t("companiesContributing")}
      </span>
      <CompanyBanner />
    </div>
  );
}

