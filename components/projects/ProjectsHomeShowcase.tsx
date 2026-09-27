/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import Link from "next/link";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { SiNpm } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { projects } from "@/data/hubs/projectsData";
import { isFeaturedProject } from "./projects-showcase.utils";
import { Button } from "../ui/button";
import {
  cardRail,
  cardSurface,
  RevealGroup,
  RevealItem,
  ScrambleText,
} from "@/components/visuals";
import { cn } from "@/lib/utils";

const linkPill =
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const linkPillOutline =
  "border-border bg-background/70 text-foreground hover:border-primary/50 hover:bg-primary/10";
const linkPillPrimary =
  "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90";
const linkPillNpm =
  "border-red-300 bg-background/70 text-red-600 hover:border-red-500 hover:bg-red-500/10 dark:border-red-700 dark:text-red-400";

interface ProjectsHomeShowcaseProps {
  readonly className?: string;
}

export function ProjectsHomeShowcase({ className }: ProjectsHomeShowcaseProps) {
  const t = useTranslations("Projects");
  const tCategories = useTranslations("Projects.categories");
  const tDescriptions = useTranslations("Projects.descriptions");

  return (
    <section className={className} id="projects">
      <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-center mb-3 text-black dark:text-white">
        <ScrambleText text={t("title")} />
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-12">
        {t("openSourceNote")}
      </p>

      <RevealGroup className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <RevealItem key={project.id} className="h-full">
            <div
              className={cn(
                cardSurface,
                "h-full overflow-hidden flex flex-col",
              )}
            >
              {/* Top accent line */}
              <div
                className={`h-1 shrink-0 ${
                  isFeaturedProject(project)
                    ? "bg-linear-to-r from-sky-500 via-blue-500 to-violet-500"
                    : "bg-linear-to-r from-border via-muted-foreground/20 to-border"
                }`}
              />

              <div className={cn(cardRail, "pl-4 p-5 flex flex-col flex-1")}>
                {/* Number + category */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-3xl font-bold text-foreground/45 select-none leading-none"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-center gap-2">
                    {isFeaturedProject(project) && (
                      <Badge className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
                        {t("featuredProject")}
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="rounded-md border border-border/50 bg-muted/70 px-2 py-0.5 text-[10px] font-medium"
                    >
                      {tCategories(project.category)}
                    </Badge>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold mb-2 text-foreground group-hover/card:text-primary transition-colors duration-200 line-clamp-1">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2 mb-4 flex-1">
                  {tDescriptions(project.description)}
                </p>

                {/* Tech tags — top 3 */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex flex-wrap items-center gap-2 mt-auto">
                  {project.githubUrl && (
                    <Link
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(linkPill, linkPillOutline)}
                    >
                      <FiGithub className="w-3.5 h-3.5" aria-hidden="true" />
                      {t("code")}
                      <span className="sr-only"> — {project.title}</span>
                    </Link>
                  )}
                  {project.liveUrl && (
                    <Link
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(linkPill, linkPillPrimary)}
                    >
                      <FiExternalLink
                        className="w-3.5 h-3.5"
                        aria-hidden="true"
                      />
                      {t("liveDemo")}
                      <span className="sr-only"> — {project.title}</span>
                    </Link>
                  )}
                  {project.npmUrl && (
                    <Link
                      href={project.npmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(linkPill, linkPillNpm)}
                    >
                      <SiNpm className="w-3.5 h-3.5" aria-hidden="true" />
                      {t("npmPackage")}
                      <span className="sr-only"> — {project.title}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* View all link */}
      <div className="mt-10 text-center">
        <Link href="/projects" target="_blank" rel="noopener noreferrer">
          <Button
            variant="default"
            className="gap-2 cursor-pointer hover:scale-105 transition-transform"
          >
            {t("viewAllProjects")}
            <FiExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
