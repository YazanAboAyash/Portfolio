/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Hero, HeroBannerSection, ServicesSection } from "@/components/hero";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/visuals";
import { ShowcaseSection } from "@/components/use-cases";

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


const GitHubShowcase = dynamic(
  () =>
    import("@/components/github").then((mod) => ({
      default: mod.GitHubShowcase,
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

export default function HomeContent() {
  return (
    <div>
      {/* Scroll Indicator */}
      <div className="hidden lg:block lg:absolute lg:bottom-24 lg:left-1/6 xl:left-1/5 xl:bottom-40 2xl:left-1/4 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2"></div>
        </div>
      </div>

      <div className="min-h-screen flex flex-col justify-evenly" id="home">
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
            <SpeedInsight className="pb-32 px-4 sm:px-6 lg:px-8" />
          </Suspense>

          {/* Project Showcase Section */}
          <Suspense
            fallback={
              <div className="min-h-100">
                <LoadingSkeleton />
              </div>
            }
          >
            <ProjectsHomeShowcase className="py-24 px-4 sm:px-6 lg:px-8" />
          </Suspense>

          <Suspense
            fallback={
              <div className="min-h-100">
                <LoadingSkeleton />
              </div>
            }
          >
            <CertificationShowcase className="py-24 px-4 sm:px-6 lg:px-8" />
          </Suspense>

          {/* Service Packages Section */}
          <Suspense
            fallback={
              <div className="min-h-150">
                <LoadingSkeleton />
              </div>
            }
          >
            <ServicesSection />
          </Suspense>

          <Suspense
            fallback={
              <div className="min-h-125">
                <LoadingSkeleton />
              </div>
            }
          >
            <section className="py-24 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <ShowcaseSection />
              </div>
            </section>
          </Suspense>

          {/* GitHub Showcase Section */}
          <Suspense
            fallback={
              <div className="min-h-100">
                <LoadingSkeleton />
              </div>
            }
          >
            <section className="py-24 px-4 sm:px-6 lg:px-8" id="github">
              <div className="max-w-6xl mx-auto">
                <GitHubShowcase />
              </div>
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

          <Suspense fallback={<LoadingSkeleton />}></Suspense>
        </div>
      </div>
    </div>
  );
}
