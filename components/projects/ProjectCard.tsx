/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { SiNpm } from "react-icons/si";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cardSurface, RevealItem } from "@/components/visuals";
import { cn } from "@/lib/utils";
import type { ProjectCardProps } from "@/types/hubs/projects";
import {
  useTruncationDetection,
  isFeaturedProject,
  getLicenseBadgeClasses,
  getLicenseEmoji,
} from "./projects-showcase.utils";

export function ProjectCard({ project, index: _index }: ProjectCardProps) {
  const t = useTranslations("Projects");
  const tCategories = useTranslations("Projects.categories");
  const tLicenses = useTranslations("Projects.licenses");
  const tDescriptions = useTranslations("Projects.descriptions");

  // Business logic hooks
  const { isTruncated, descriptionRef } = useTruncationDetection(
    project.description,
  );

  return (
    <RevealItem className="w-full h-full">
      <Card className={cn(cardSurface, "h-full gap-0 overflow-hidden py-0")}>
        {/* Top accent line - gradient for featured, subtle for the rest */}
        <div
          className={`h-1 shrink-0 ${
            isFeaturedProject(project)
              ? "bg-linear-to-r from-sky-500 via-blue-500 to-violet-500"
              : "bg-linear-to-r from-border via-muted-foreground/20 to-border"
          }`}
        />

        <CardHeader className="relative z-10 shrink-0 space-y-3 px-4 pt-4 pb-3">
          {/* Meta row: category badge + featured badge */}
          <div className="flex min-h-6 flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-md border border-border/50 bg-muted/70 px-2 py-0.5 text-[11px] font-medium"
            >
              {tCategories(project.category)}
            </Badge>
            {isFeaturedProject(project) && (
              <Badge className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
                {t("featuredProject")}
              </Badge>
            )}
          </div>

          {/* Title row */}
          <div className="min-h-12 overflow-hidden">
            <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight tracking-normal text-foreground transition-colors group-hover/card:text-primary lg:text-xl">
              {project.title}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex flex-1 flex-col px-4 pt-0 pb-3">
          {/* Description - fixed 3-line height */}
          <div className="min-h-16 shrink-0 overflow-hidden">
            <p
              ref={descriptionRef}
              className="line-clamp-3 text-sm leading-relaxed text-muted-foreground"
            >
              {tDescriptions(project.description)}
              {isTruncated && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400 ml-1 cursor-pointer underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("seeMoreOnGitHub")}
                </Link>
              )}
            </p>
          </div>

          <Separator className="my-4 shrink-0 bg-border/60" />

          {/* License - fixed h-7, empty slot keeps tech tags aligned when no license */}
          <div className="mb-3 flex h-7 shrink-0 items-center">
            {project.license && (
              <Badge
                variant={project.license.variant || "default"}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${getLicenseBadgeClasses(project.license.type)}`}
              >
                {getLicenseEmoji(project.license.type)}{" "}
                {tLicenses(project.license.text)}
              </Badge>
            )}
          </div>

          {/* Stack label */}
          <p className="mb-2 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Stack
          </p>

          {/* Tech tags - fills remaining space, scrollable */}
          <div className="min-h-10 flex-1 overflow-y-auto overflow-x-hidden pr-1">
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-border/50 bg-secondary/60 px-2 py-1 text-xs font-medium text-secondary-foreground/90 transition-colors group-hover/card:border-primary/20 group-hover/card:bg-primary/10"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </CardContent>

        <Separator className="shrink-0 bg-border/60" />

        <CardFooter className="relative z-10 shrink-0 bg-muted/20 px-4 py-3">
          <div className="flex w-full flex-wrap gap-2">
            {project.githubUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="relative z-10 min-w-28 flex-1 cursor-pointer border-border/70 bg-background/70 hover:bg-primary/10"
              >
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 truncate text-center"
                >
                  <FiGithub className="h-4 w-4" />
                  {t("code")}
                </Link>
              </Button>
            )}

            {project.npmUrl && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="relative z-10 min-w-28 flex-1 cursor-pointer border-red-300 bg-background/70 text-red-600 hover:border-red-500 hover:bg-red-500/10 dark:border-red-700 dark:text-red-400"
              >
                <Link
                  href={project.npmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 truncate text-center"
                >
                  <SiNpm className="h-4 w-4" aria-hidden="true" />
                  {t("npmPackage")}
                </Link>
              </Button>
            )}

            {project.liveUrl && (
              <Button
                size="sm"
                asChild
                className="relative z-10 min-w-28 flex-1 cursor-pointer shadow-sm hover:bg-primary/90"
              >
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 truncate text-center"
                >
                  <FiExternalLink className="h-4 w-4" />
                  {t("liveDemo")}
                </Link>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </RevealItem>
  );
}
