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
                <div className="flex items-center gap-3 mt-auto">
                  {project.githubUrl && (
                    <Link
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} GitHub`}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      <FiGithub className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                  {project.liveUrl && (
                    <Link
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} live demo`}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      <FiExternalLink className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  )}
                  {project.npmUrl && (
                    <Link
                      href={project.npmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.title} npm`}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      <SiNpm className="w-4 h-4" aria-hidden="true" />
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
