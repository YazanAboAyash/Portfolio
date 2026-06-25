/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import { SiNpm } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { projects } from "@/data/hubs/projectsData";
import { isFeaturedProject } from "./projects-showcase.utils";
import { Button } from "../ui/button";

const BOTGENOSSEN_TECHS = [
  "AI Avatar",
  "Multilingual",
  "Interactive",
  "Next.js",
  "TypeScript",
];

interface ProjectsHomeShowcaseProps {
  readonly className?: string;
}

export function ProjectsHomeShowcase({ className }: ProjectsHomeShowcaseProps) {
  const t = useTranslations("Projects");
  const tCategories = useTranslations("Projects.categories");
  const tDescriptions = useTranslations("Projects.descriptions");
  const tBot = useTranslations("Projects.botgenossen");

  return (
    <section className={className} id="projects">
      <h2 className="text-3xl font-light sm:text-4xl text-center mb-12 text-black dark:text-white">
        {t("title")}
      </h2>

      {/* ── Botgenossen featured collaboration card ── */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative bg-background/80 backdrop-blur-sm rounded-xl border border-amber-400/40 shadow-lg hover:shadow-amber-400/20 hover:shadow-xl hover:border-amber-400/70 transition-all duration-300 overflow-hidden group">
          {/* Top amber accent line */}
          <div className="h-1 shrink-0 bg-linear-to-r from-amber-500 via-yellow-400 to-amber-500" />

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-0">
            {/* Left: content */}
            <div className="pl-5 border-l-2 border-amber-400/30 group-hover:border-amber-400/70 transition-colors duration-300 p-6 md:p-8">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-500 border border-amber-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {tBot("live")}
                </span>
                <Badge
                  variant="secondary"
                  className="rounded-md border border-amber-400/25 bg-amber-400/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-[10px] font-semibold"
                >
                  {t("featuredCollab")}
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-md border border-border/50 bg-muted/70 px-2 py-0.5 text-[10px] font-medium"
                >
                  AI &amp; Automation
                </Badge>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-foreground group-hover:text-amber-500 transition-colors duration-200">
                {tBot("title")}
              </h3>

              {/* Description */}
              <p className="text-sm text-foreground/70 leading-relaxed mb-5 max-w-2xl">
                {tBot("description")}
              </p>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {BOTGENOSSEN_TECHS.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Footer: company + link */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/assets/companies/botgenossen.png"
                    alt="Botgenossen"
                    width={28}
                    height={28}
                    className="rounded-sm object-contain"
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    {tBot("company")}
                  </span>
                  <span className="text-muted-foreground/40 text-xs">·</span>
                  <span className="text-xs text-muted-foreground/60">
                    {tBot("role")}
                  </span>
                </div>

                <Link
                  href="https://www.buettelborn.de/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors duration-200"
                  aria-label="Visit Büttleborn city website"
                >
                  buettelborn.de
                  <FiExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right: large logo */}
            <div className="hidden md:flex items-center justify-center px-10 bg-amber-400/5 border-l border-amber-400/15">
              <Image
                src="/assets/companies/botgenossen.png"
                alt="Botgenossen logo"
                width={110}
                height={110}
                className="object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg hover:shadow-xl hover:border-muted-foreground/30 transition-all duration-300 overflow-hidden group flex flex-col"
          >
            {/* Top accent line */}
            <div
              className={`h-1 shrink-0 ${
                isFeaturedProject(project)
                  ? "bg-linear-to-r from-sky-500 via-blue-500 to-violet-500"
                  : "bg-linear-to-r from-border via-muted-foreground/20 to-border"
              }`}
            />

            <div className="pl-4 border-l-2 border-foreground/20 group-hover:border-foreground/60 transition-colors duration-300 p-5 flex flex-col flex-1">
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
              <h3 className="text-base font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
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
        ))}
      </div>

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
