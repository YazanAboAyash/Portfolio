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
      <LoadingSkeleton className="frame min-h-142 md:min-h-262 lg:min-h-221" />
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
      <LoadingSkeleton className="frame min-h-151 md:min-h-162 lg:min-h-284" />
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
      <LoadingSkeleton className="min-h-316 md:min-h-382 lg:min-h-208" />
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
      <LoadingSkeleton className="frame min-h-154 md:min-h-204 lg:min-h-198" />
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
      <LoadingSkeleton className="frame min-h-178 md:min-h-340 lg:min-h-335" />
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
      <LoadingSkeleton className="frame min-h-182 md:min-h-284 lg:min-h-171" />
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
      <LoadingSkeleton className="frame min-h-78 md:min-h-133 lg:min-h-87" />
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
          {/* Collaboration Showcase Section */}
          <CollaborationShowcase className={`frame ${SECTION}`} />

          {/* Project Showcase Section */}
          <ProjectsHomeShowcase className={`frame ${SECTION}`} />

          {/* Products Showcase Section */}
          <ProductsHomeShowcase className={SECTION} />

          <Capabilities />

          {/* "Ask this site": the portfolio and GitHub over the site's MCP server */}
          <section className={`frame ${SECTION} pt-0 md:pt-0`} id="github">
            <GitHubAskConsole />
          </section>

          <CertificationShowcase className={`frame ${SECTION} pt-0 md:pt-0`} />

          {/* PageSpeed Insights Section: supporting proof, so it closes the page */}
          <SpeedInsight className={`frame ${SECTION} pt-0 md:pt-0`} />
        </div>
      </div>
    </div>
  );
}
