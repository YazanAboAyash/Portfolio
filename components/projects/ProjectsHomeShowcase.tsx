/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { SiNpm } from "react-icons/si";
import { useTranslations } from "next-intl";
import { projects } from "@/data/hubs/projectsData";
import { isFeaturedProject } from "./projects-showcase.utils";
import {
  cardSurface,
  RevealGroup,
  RevealItem,
  SectionHeading,
} from "@/components/visuals";
import { cn } from "@/lib/utils";

const linkBase =
  "inline-flex min-h-10 items-center gap-1.5 px-3.5 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const linkQuiet = "bg-background hover:bg-surface-2";
const linkPrimary =
  "bg-primary text-primary-foreground hover:bg-primary/85";

interface ProjectsHomeShowcaseProps {
  readonly className?: string;
}

export function ProjectsHomeShowcase({ className }: ProjectsHomeShowcaseProps) {
  const t = useTranslations("Projects");
  const tCategories = useTranslations("Projects.categories");
  const tDescriptions = useTranslations("Projects.descriptions");
  const [activeId, setActiveId] = useState(projects[0]?.id);
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
            className="inline-flex min-h-12 items-center gap-2 bg-primary px-6 font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {t("viewAllProjects")}
            <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid grid-cols-12 gap-x-6 gap-y-10">
      <RevealGroup className="col-span-12 flex flex-col gap-2 lg:col-span-8">
        {projects.map((project) => (
          <RevealItem key={project.id}>
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
              {/* Title, category, featured */}
              <div className="flex flex-col gap-1.5 md:col-span-4">
                <h3 className="text-xl font-semibold leading-tight tracking-[-0.01em] md:text-2xl">
                  {project.title}
                </h3>
                <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                  <span>{tCategories(project.category)}</span>
                  {isFeaturedProject(project) && (
                    <span className="font-semibold text-foreground">
                      {t("featuredProject")}
                    </span>
                  )}
                </p>
              </div>

              {/* Description and tech, top 3 */}
              <div className="flex flex-col gap-2 md:col-span-5">
                <p className="line-clamp-3 text-base leading-relaxed text-foreground">
                  {tDescriptions(project.description)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {project.technologies.slice(0, 3).join(" · ")}
                  {project.technologies.length > 3 &&
                    ` · +${project.technologies.length - 3}`}
                </p>
              </div>

              {/* Links */}
              <div className="flex flex-wrap items-center gap-2 md:col-span-3 md:justify-end">
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
        ))}
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
