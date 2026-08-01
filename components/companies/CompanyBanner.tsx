/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { companiesData, type CompanyLogo } from "@/data/main/companiesData";
import Link from "next/link";

interface CompanyBannerProps {
  className?: string;
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  showTooltip?: boolean;
  showCompanyNames?: boolean;
}

const speedMap = {
  slow: "animate-scroll-slow",
  normal: "animate-scroll",
  fast: "animate-scroll-fast",
};

const directionMap = {
  left: "",
  right: "animate-reverse",
};

export function CompanyBanner({
  className,
  speed = "normal",
  direction = "right",
  pauseOnHover = true,
  showTooltip = true,
  showCompanyNames = true,
}: CompanyBannerProps) {
  // Triple the array to ensure seamless infinite loop
  const tripleLogos = [...companiesData, ...companiesData, ...companiesData];

  const animationClass = cn(
    speedMap[speed],
    directionMap[direction],
    pauseOnHover && "hover:pause",
  );

  return (
    <div
      className={cn(
        "company-banner-container bg-black/60 dark:bg-black/80",
        className,
      )}
    >
      <div className={cn("flex", animationClass)}>
        {tripleLogos.map((company, index) => (
          <CompanyLogoItem
            key={`${company.id}-${index}`}
            company={company}
            showTooltip={showTooltip}
            showCompanyName={showCompanyNames}
          />
        ))}
      </div>
    </div>
  );
}

interface CompanyLogoItemProps {
  company: CompanyLogo;
  showTooltip: boolean;
  showCompanyName: boolean;
}

function CompanyLogoItem({
  company,
  showTooltip,
  showCompanyName,
}: CompanyLogoItemProps) {
  const hasLogo = company.logo && company.logo.trim() !== "";

  const logoElement = (
    <div className="company-logo-item group relative transition-all duration-300">
      {hasLogo ? (
        <div className="logo-container">
          <Image
            src={company.logo!}
            alt={`${company.name} logo`}
            fill
            className="object-contain"
            sizes="auto"
            loading="eager"
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          />
        </div>
      ) : (
        <div className="text-logo">
          <span>{company.name.slice(0, 2).toUpperCase()}</span>
        </div>
      )}

      {showCompanyName && <span className="company-name">{company.name}</span>}

      {showTooltip && (
        <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 transform opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="rounded-lg bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg">
            <div className="font-medium">{company.name}</div>
            {company.period && (
              <div className="text-xs text-muted-foreground">
                {company.period}
              </div>
            )}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-popover"></div>
          </div>
        </div>
      )}
    </div>
  );

  if (company.url) {
    return (
      <Link
        href={company.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        {logoElement}
      </Link>
    );
  }

  return <div className="inline-block">{logoElement}</div>;
}

// Alternative variant with different styling
export function CompanyBannerMinimal({
  className,
  speed = "normal",
  direction = "left",
  showCompanyNames = false,
}: Omit<CompanyBannerProps, "pauseOnHover" | "showTooltip"> & {
  showCompanyNames?: boolean;
}) {
  const tripleLogos = [...companiesData, ...companiesData, ...companiesData];

  const animationClass = cn(speedMap[speed], directionMap[direction]);

  return (
    <div className={cn("company-banner-container", className)}>
      <div
        className={cn("flex border-y border-border/20 py-4", animationClass)}
      >
        {tripleLogos.map((company, index) => {
          const hasLogo = company.logo && company.logo.trim() !== "";

          return (
            <div key={`${company.id}-${index}`} className="company-logo-item">
              {hasLogo ? (
                <div className="logo-container">
                  <Image
                    src={company.logo!}
                    alt={`${company.name} logo`}
                    fill
                    className="object-contain"
                    sizes="40px"
                    loading="lazy"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                  />
                </div>
              ) : (
                <div className="text-logo">
                  <span>{company.name.slice(0, 2).toUpperCase()}</span>
                </div>
              )}

              {showCompanyNames && (
                <span className="company-name text-xs">{company.name}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { type CompanyLogo, companiesData };
