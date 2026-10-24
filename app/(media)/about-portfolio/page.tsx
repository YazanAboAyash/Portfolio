/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { Metadata } from "next";
import { AboutPortfolioPage } from "@/components/aboutPortoPage";
import { ABOUT_PORTFOLIO_METADATA } from "@/data/hubs/about-portfolio.data";

/** This technical page is deliberately authored and indexed in English. */
export const metadata: Metadata = {
  title: {
    absolute: `${ABOUT_PORTFOLIO_METADATA.title} | ColdByDefault`,
  },
  description: ABOUT_PORTFOLIO_METADATA.description,
  keywords: [...ABOUT_PORTFOLIO_METADATA.keywords],
  alternates: {
    canonical: "/about-portfolio",
  },
  openGraph: {
    title: ABOUT_PORTFOLIO_METADATA.title,
    description: ABOUT_PORTFOLIO_METADATA.description,
    url: "/about-portfolio",
    type: "website",
  },
};

export default function PortfolioDocumentation() {
  return <AboutPortfolioPage />;
}
