/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { Hero, HeroBannerSection } from "@/components/hero";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/visuals";
import { SectionRail } from "@/components/nav";

// Dynamically import heavy components with loading states
const Capabilities = dynamic(
  () =>
    import("@/components/tech").then((mod) => ({ default: mod.Capabilities })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  },
);

const CertificationShowcase = dynamic(
  () =>
    import("@/components/cer").then((mod) => ({
      default: mod.CertificationShowcase,
    })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  },
);

const GitHubAskConsole = dynamic(
  () =>
    import("@/components/github").then((mod) => ({
      default: mod.GitHubAskConsole,
    })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  },
);

const CollaborationShowcase = dynamic(
  () =>
    import("@/components/collaboration").then((mod) => ({
      default: mod.CollaborationShowcase,
    })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  },
);

const ProjectsHomeShowcase = dynamic(
  () =>
    import("@/components/projects").then((mod) => ({
      default: mod.ProjectsHomeShowcase,
    })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  },
);

const ProductsHomeShowcase = dynamic(
  () =>
    import("@/components/products").then((mod) => ({
      default: mod.ProductsHomeShowcase,
    })),
  {
    loading: () => <LoadingSkeleton />,
    ssr: false,
  },
);

const SpeedInsight = dynamic(
  () =>
    import("@/components/speed-insight").then((mod) => ({
      default: mod.SpeedInsight,
    })),
  {
    loading: () => <LoadingSkeleton />,
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
          <Suspense
            fallback={
              <div className="min-h-80">
                <LoadingSkeleton />
              </div>
            }
          >
            <SpeedInsight className={`frame ${SECTION}`} />
          </Suspense>

          {/* Collaboration Showcase Section */}
          <Suspense
            fallback={
              <div className="min-h-80">
                <LoadingSkeleton />
              </div>
            }
          >
            <CollaborationShowcase
              className={`frame ${SECTION} pt-0 md:pt-0`}
            />
          </Suspense>

          {/* Project Showcase Section */}
          <Suspense
            fallback={
              <div className="min-h-100">
                <LoadingSkeleton />
              </div>
            }
          >
            <ProjectsHomeShowcase className={`frame ${SECTION}`} />
          </Suspense>

          {/* Products Showcase Section */}
          <Suspense
            fallback={
              <div className="min-h-100">
                <LoadingSkeleton />
              </div>
            }
          >
            <ProductsHomeShowcase className={SECTION} />
          </Suspense>

          <Suspense
            fallback={
              <div className="min-h-100">
                <LoadingSkeleton />
              </div>
            }
          >
            <CertificationShowcase className={`frame ${SECTION}`} />
          </Suspense>

          {/* "Ask this site": the portfolio and GitHub over the site's MCP server */}
          <Suspense
            fallback={
              <div className="min-h-100">
                <LoadingSkeleton />
              </div>
            }
          >
            <section className={`frame ${SECTION} pt-0 md:pt-0`} id="github">
              <GitHubAskConsole />
            </section>
          </Suspense>

          <Suspense
            fallback={
              <div className="min-h-100">
                <LoadingSkeleton />
              </div>
            }
          >
            <Capabilities />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
