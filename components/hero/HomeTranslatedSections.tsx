/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { CompanyBanner } from "@/components/companies";
import { PackageCard } from "@/components/services";
import { servicePackages } from "@/data/hubs/servicesData";
import { RevealGroup, RevealItem, ScrambleText } from "@/components/visuals";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Translated hero banner text + company banner */
export function HeroBannerSection() {
  const t = useTranslations("Home");
  return (
    <>
      <span className="text-sm font-medium text-center text-black dark:text-white">
        {t("companiesContributing")}
      </span>
      <CompanyBanner />
    </>
  );
}

/** Translated services section */
export function ServicesSection() {
  const t = useTranslations("Home");
  const tt = useTranslations("Services");

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-center mb-8 text-black dark:text-white">
          <ScrambleText text={t("services.title")} />
        </h2>
        <div className="flex justify-center mt-10">
          <Link
            href="/services"
            className="inline-flex items-center z-50 gap-2 px-6 py-3 rounded-lg border border-black bg-black 
            text-white dark:border-white dark:bg-white dark:text-black hover:bg-gray-800 
            dark:hover:bg-gray-200 transition-all duration-300 font-medium text-sm group"
          >
            {tt("cta.viewAllLink")}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        {/* max-w fits exactly 3 cards (3 x max-w-sm + 2 x gap-6) */}
        <RevealGroup className="flex flex-wrap justify-center gap-6 mt-10 mx-auto max-w-300">
          {servicePackages.map((pkg) => (
            <RevealItem key={pkg.id} className="w-full max-w-sm">
              <PackageCard pkg={pkg} variant="compact" />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
