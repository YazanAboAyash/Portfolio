/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import type { ProjectsShowcaseProps } from "@/types/hubs/projects";
import { productProjects, projects } from "@/data/hubs/projectsData";
import { ProjectCard } from "./ProjectCard";
import { RevealGroup, SectionHeading } from "@/components/visuals";

export default function ProjectsShowcase({ className }: ProjectsShowcaseProps) {
  const t = useTranslations("Projects");
  const all = [...productProjects, ...projects];

  return (
    <section
      className={className}
      id="projects"
      aria-labelledby="projects-heading"
    >
      {/* This component is the whole /projects page, so its title is the page's h1. */}
      <SectionHeading
        as="h1"
        id="projects-heading"
        title={t("title")}
        className="mb-10"
        aside={
          <p className="text-sm font-semibold text-muted-foreground">
            {t("allCount", { count: all.length })}
          </p>
        }
      />

      {/* Projects Grid */}
      <RevealGroup className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {all.map((project, index) => (
          <ProjectCard
            key={`${project.commercial ? "product" : "project"}-${project.id}`}
            project={project}
            index={index}
          />
        ))}
      </RevealGroup>
    </section>
  );
}
