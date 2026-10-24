/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { Hero, HeroBannerSection } from "@/components/hero";
import dynamic from "next/dynamic";
import { LoadingSkeleton } from "@/components/visuals";
import { SectionRail } from "@/components/nav";

// Heavy sections load client-side. Each skeleton reserves roughly the
// section's rendered height (measured at 390 / 800 / 1440px) so the page
// does not jump as sections arrive.
const Capabilities = dynamic(
  () =>
    import("@/components/tech").then((mod) => ({ default: mod.Capabilities })),
  {
    loading: () => (
      <LoadingSkeleton className="frame min-h-344 md:min-h-222 lg:min-h-180" />
    ),
    ssr: false,
  },
);

const CertificationShowcase = dynamic(
  () =>
    import("@/components/cer").then((mod) => ({
      default: mod.CertificationShowcase,
    })),
  {
    loading: () => (
      <LoadingSkeleton className="frame min-h-436 md:min-h-312 lg:min-h-308" />
    ),
    ssr: false,
  },
);

const GitHubAskConsole = dynamic(
  () =>
    import("@/components/github").then((mod) => ({
      default: mod.GitHubAskConsole,
    })),
  {
    loading: () => (
      <LoadingSkeleton className="min-h-694 md:min-h-514 lg:min-h-264" />
    ),
    ssr: false,
  },
);

const CollaborationShowcase = dynamic(
  () =>
    import("@/components/collaboration").then((mod) => ({
      default: mod.CollaborationShowcase,
    })),
  {
    loading: () => (
      <LoadingSkeleton className="frame min-h-176 md:min-h-180 lg:min-h-172" />
    ),
    ssr: false,
  },
);

const ProjectsHomeShowcase = dynamic(
  () =>
    import("@/components/projects").then((mod) => ({
      default: mod.ProjectsHomeShowcase,
    })),
  {
    loading: () => (
      <LoadingSkeleton className="frame min-h-492 md:min-h-340 lg:min-h-334" />
    ),
    ssr: false,
  },
);

const ProductsHomeShowcase = dynamic(
  () =>
    import("@/components/products").then((mod) => ({
      default: mod.ProductsHomeShowcase,
    })),
  {
    loading: () => (
      <LoadingSkeleton className="frame min-h-220 md:min-h-284 lg:min-h-170" />
    ),
    ssr: false,
  },
);

const SpeedInsight = dynamic(
  () =>
    import("@/components/speed-insight").then((mod) => ({
      default: mod.SpeedInsight,
    })),
  {
    loading: () => (
      <LoadingSkeleton className="frame min-h-172 md:min-h-156 lg:min-h-110" />
    ),
    ssr: false,
  },
);

/** Space between home sections: clearly larger than any gap inside one. */
const SECTION = "py-16 md:py-24";

export default function HomeContent() {
  return (
    <div>
      {/* Section ruler pinned beside the scrollbar */}
      <SectionRail />

      <div
        className="flex min-h-[calc(100svh-4rem)] flex-col justify-between gap-12 pb-8"
        id="home"
      >
        <Hero />

        {/* Company Banner */}
        <HeroBannerSection />
      </div>

      {/* Main content section */}
      <div className="relative" id="home-content">
        {/* Content Container */}
        <div className="relative z-10">
          {/* PageSpeed Insights Section */}
          <SpeedInsight className={`frame ${SECTION}`} />

          {/* Collaboration Showcase Section */}
          <CollaborationShowcase className={`frame ${SECTION} pt-0 md:pt-0`} />

          {/* Project Showcase Section */}
          <ProjectsHomeShowcase className={`frame ${SECTION}`} />

          {/* Products Showcase Section */}
          <ProductsHomeShowcase className={SECTION} />

          <CertificationShowcase className={`frame ${SECTION}`} />

          {/* "Ask this site": the portfolio and GitHub over the site's MCP server */}
          <section className={`frame ${SECTION} pt-0 md:pt-0`} id="github">
            <GitHubAskConsole />
          </section>

          <Capabilities />
        </div>
      </div>
    </div>
  );
}
