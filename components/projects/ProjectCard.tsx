/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
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
import { Separator } from "@/components/ui/separator";
import { SiGithub, SiNpm } from "react-icons/si";
import { ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { contactEmailLink } from "@/data/main/contact";
import { cardSurface, RevealItem } from "@/components/visuals";
import { cn } from "@/lib/utils";
import { projectAnchorId } from "@/lib/site-actions";
import type { ProjectCardProps } from "@/types/hubs/projects";
import {
  useTruncationDetection,
  isFeaturedProject,
  getLicenseBadgeClasses,
  getLicenseEmoji,
  projectLinkBase,
  projectLinkPrimary,
  projectLinkQuiet,
} from "./projects-showcase.utils";

const tagBase = "px-2 py-0.5 text-xs font-medium";

/** Links share the footer row evenly, as the old buttons did. */
const footerLink = "min-w-28 flex-1 justify-center";

export function ProjectCard({ project, index: _index }: ProjectCardProps) {
  const t = useTranslations("Projects");
  const tCategories = useTranslations("Projects.categories");
  const tLicenses = useTranslations("Projects.licenses");
  const tDescriptions = useTranslations("Projects.descriptions");
  const tProducts = useTranslations("Products");
  const description = project.commercial
    ? tProducts(`descriptions.${project.description}`)
    : tDescriptions(project.description);

  // Business logic hooks
  const { isTruncated, descriptionRef } = useTruncationDetection(
    project.description,
  );

  return (
    <RevealItem className="w-full h-full">
      {/* Reem's highlight_project scrolls here and sets data-highlighted */}
      <Card
        id={projectAnchorId(project)}
        className={cn(
          cardSurface,
          "h-full gap-0 overflow-hidden py-0 data-highlighted:ring-2 data-highlighted:ring-primary motion-safe:data-highlighted:animate-pulse",
        )}
      >
        {/* Top accent line - solid for featured and products, quiet for the rest */}
        <div
          className={cn(
            "h-1 shrink-0",
            isFeaturedProject(project)
              ? "bg-primary"
              : project.commercial
                ? "bg-emerald-700 dark:bg-emerald-500"
                : "bg-surface-2",
          )}
        />

        <CardHeader className="relative z-10 shrink-0 space-y-3 px-5 pt-5 pb-3">
          {/* Meta row: category tag + featured tag */}
          <div className="flex min-h-6 flex-wrap items-center gap-2">
            <span className={cn(tagBase, "bg-background")}>
              {tCategories(project.category)}
            </span>
            {isFeaturedProject(project) && (
              <span
                className={cn(
                  tagBase,
                  "bg-primary font-semibold text-primary-foreground",
                )}
              >
                {t("featuredProject")}
              </span>
            )}
            {project.commercial && (
              <span
                className={cn(tagBase, "bg-emerald-700 font-semibold text-white")}
              >
                {t("availableToBuy")}
              </span>
            )}
          </div>

          {/* Title row */}
          <div className="min-h-12 overflow-hidden">
            <CardTitle className="line-clamp-2 text-xl font-semibold leading-tight tracking-[-0.01em] text-foreground lg:text-2xl">
              {project.title}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 flex flex-1 flex-col px-5 pt-0 pb-4">
          {/* Description - fixed 3-line height */}
          <div className="min-h-16 shrink-0 overflow-hidden">
            <p
              ref={descriptionRef}
              className="line-clamp-3 text-sm leading-relaxed text-foreground/80"
            >
              {description}
              {isTruncated && project.githubUrl && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 cursor-pointer font-semibold text-foreground underline underline-offset-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("seeMoreOnGitHub")}
                </Link>
              )}
            </p>
          </div>

          <Separator className="my-4 shrink-0 bg-background" />

          {/* License - fixed h-7, empty slot keeps tech tags aligned when no license */}
          <div className="mb-3 flex h-7 shrink-0 items-center">
            {project.license && (
              <Badge
                variant={project.license.variant || "default"}
                className={`rounded-none px-2.5 py-1 text-[11px] font-medium ${getLicenseBadgeClasses(project.license.type)}`}
              >
                {getLicenseEmoji(project.license.type)}{" "}
                {tLicenses(project.license.text)}
              </Badge>
            )}
          </div>

          {/* Stack label */}
          <p className="mb-2 shrink-0 text-sm font-semibold text-muted-foreground">
            Stack
          </p>

          {/* Tech tags - fills remaining space, scrollable */}
          <div className="min-h-10 flex-1 overflow-y-auto overflow-x-hidden pr-1">
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span key={tech} className={cn(tagBase, "bg-background py-1")}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="relative z-10 shrink-0 px-5 pt-0 pb-5">
          <div className="flex w-full flex-wrap gap-2">
            {project.commercial && (
              <a
                href={contactEmailLink}
                className={cn(projectLinkBase, projectLinkPrimary, footerLink)}
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {tProducts("requestDemo")}
              </a>
            )}

            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(projectLinkBase, projectLinkQuiet, footerLink)}
              >
                <SiGithub className="h-3.5 w-3.5" aria-hidden="true" />
                {t("code")}
                <span className="sr-only"> — {project.title}</span>
              </Link>
            )}

            {project.npmUrl && (
              <Link
                href={project.npmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(projectLinkBase, projectLinkQuiet, footerLink)}
              >
                <SiNpm
                  className="h-3.5 w-3.5 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
                {t("npmPackage")}
                <span className="sr-only"> — {project.title}</span>
              </Link>
            )}

            {project.liveUrl && (
              <Link
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(projectLinkBase, projectLinkPrimary, footerLink)}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                {t("liveDemo")}
                <span className="sr-only"> — {project.title}</span>
              </Link>
            )}
          </div>
        </CardFooter>
      </Card>
    </RevealItem>
  );
}
