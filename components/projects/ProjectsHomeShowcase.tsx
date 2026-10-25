/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { SiNpm } from "react-icons/si";
import { useTranslations } from "next-intl";
import { projects } from "@/data/hubs/projectsData";
import {
  isFeaturedProject,
  projectLinkBase as linkBase,
  projectLinkPrimary as linkPrimary,
  projectLinkQuiet as linkQuiet,
} from "./projects-showcase.utils";
import {
  cardSurface,
  RevealGroup,
  RevealItem,
  SectionHeading,
} from "@/components/visuals";
import { cn } from "@/lib/utils";

/** Rows shown on phones; the rest wait behind the "All projects" link. */
const MOBILE_ROWS = 4;

/** Phones show these parts only for the open row; from md they always show. */
const whenOpen = (open: boolean) => (open ? "flex" : "hidden md:flex");

interface ProjectsHomeShowcaseProps {
  readonly className?: string;
}

export function ProjectsHomeShowcase({ className }: ProjectsHomeShowcaseProps) {
  const t = useTranslations("Projects");
  const tCategories = useTranslations("Projects.categories");
  const tSummaries = useTranslations("Projects.summaries");
  const [activeId, setActiveId] = useState(projects[0]?.id);
  // The one row expanded on phones; desktop rows are always expanded
  const [openId, setOpenId] = useState<number | null>(null);
  const rowIds = useId();
  const active = projects.find((project) => project.id === activeId);

  return (
    <section
      className={className}
      id="projects"
      aria-labelledby="projects-title"
    >
      <SectionHeading
        id="projects-title"
        title={t("title")}
        lead={t("openSourceNote")}
        className="mb-10"
        aside={
          <Link
            href="/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-12 items-center gap-2 bg-primary px-6 font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:inline-flex"
          >
            {t("viewAllProjects")}
            <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid grid-cols-12 gap-x-6 gap-y-10">
      <RevealGroup className="col-span-12 flex flex-col gap-2 lg:col-span-8">
        {projects.map((project, index) => {
          const open = project.id === openId;
          const detailsId = `${rowIds}-${project.id}-details`;
          const linksId = `${rowIds}-${project.id}-links`;

          return (
            <RevealItem
              key={project.id}
              className={cn(index >= MOBILE_ROWS && "hidden md:block")}
            >
              {/* Pointing at or tabbing into a row shows it in the preview. */}
              <article
                onPointerEnter={() => setActiveId(project.id)}
                onFocus={() => setActiveId(project.id)}
                className={cn(
                  cardSurface,
                  "grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:p-6 md:grid-cols-12 md:items-baseline",
                  project.id === activeId && "lg:bg-surface-2",
                )}
              >
                {/* Title, category, featured; on phones a summary and the toggle */}
                <div className="flex items-start justify-between gap-4 md:col-span-4">
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <h3 className="text-xl font-semibold leading-tight tracking-[-0.01em] md:text-2xl">
                      {project.title}
                    </h3>
                    <p className="text-sm leading-snug text-foreground/80 md:hidden">
                      {tSummaries(project.description)}
                    </p>
                    <p
                      className={cn(
                        "flex-wrap items-center gap-x-3 text-sm text-muted-foreground",
                        whenOpen(open),
                      )}
                    >
                      <span>{tCategories(project.category)}</span>
                      {isFeaturedProject(project) && (
                        <span className="font-semibold text-foreground">
                          {t("featuredProject")}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : project.id)}
                    aria-expanded={open}
                    aria-controls={`${detailsId} ${linksId}`}
                    className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:hidden"
                  >
                    <span aria-hidden="true">{open ? "−" : "+"}</span>
                    <span className="sr-only">
                      {t("toggleDetails")} — {project.title}
                    </span>
                  </button>
                </div>

                {/* One-line outcome (phones show it under the title) and tech, top 3 */}
                <div
                  id={detailsId}
                  className={cn("flex-col gap-2 md:col-span-5", whenOpen(open))}
                >
                  <p className="hidden text-base leading-relaxed text-foreground md:block">
                    {tSummaries(project.description)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {project.technologies.slice(0, 3).join(" · ")}
                    {project.technologies.length > 3 &&
                      ` · +${project.technologies.length - 3}`}
                  </p>
                </div>

                {/* Links */}
                <div
                  id={linksId}
                  className={cn(
                    "flex-wrap items-center gap-2 md:col-span-3 md:justify-end",
                    whenOpen(open),
                  )}
                >
                  {project.githubUrl && (
                    <Link
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(linkBase, linkQuiet)}
                    >
                      <FiGithub className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("code")}
                      <span className="sr-only"> — {project.title}</span>
                    </Link>
                  )}
                  {project.liveUrl && (
                    <Link
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(linkBase, linkPrimary)}
                    >
                      <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("liveDemo")}
                      <span className="sr-only"> — {project.title}</span>
                    </Link>
                  )}
                  {project.npmUrl && (
                    <Link
                      href={project.npmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(linkBase, linkQuiet)}
                    >
                      <SiNpm
                        className="h-3.5 w-3.5 text-red-600 dark:text-red-400"
                        aria-hidden="true"
                      />
                      {t("npmPackage")}
                      <span className="sr-only"> — {project.title}</span>
                    </Link>
                  )}
                </div>
              </article>
            </RevealItem>
          );
        })}

        {/* Phones: the heading's link moves under the shortened list */}
        <Link
          href="/projects"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:hidden"
        >
          {t("allCount", { count: projects.length })}
          <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </RevealGroup>

      {/* Preview of the row in focus: its title card, or its name set large. */}
      {active && (
        <aside aria-hidden="true" className="col-span-4 hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-4">
            <div className="relative aspect-2/1 overflow-hidden bg-surface">
              {active.image ? (
                <Image
                  key={active.id}
                  src={active.image}
                  alt=""
                  fill
                  sizes="33vw"
                  className="object-cover motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
                />
              ) : (
                <span className="absolute inset-x-5 bottom-4 text-4xl font-bold leading-none tracking-[-0.03em]">
                  {active.title}
                </span>
              )}
            </div>
            <p className="text-lg font-semibold leading-snug">{active.title}</p>
            <p className="text-sm text-muted-foreground">
              {active.technologies.join(" · ")}
            </p>
          </div>
        </aside>
      )}
      </div>
    </section>
  );
}
