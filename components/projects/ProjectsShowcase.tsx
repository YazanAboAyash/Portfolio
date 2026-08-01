/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { m, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import type { ProjectsShowcaseProps } from "@/types/hubs/projects";
import { useProjectsFilter, getAllCategories } from "./projects-showcase.utils";
import { ProjectCard } from "./ProjectCard";
import { ProjectsFilter } from "./ProjectsFilter";
import { RevealGroup } from "@/components/visuals";

export default function ProjectsShowcase({ className }: ProjectsShowcaseProps) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const t = useTranslations("Projects");

  // Business logic hooks
  const { selectedCategory, setSelectedCategory, filteredProjects } =
    useProjectsFilter();
  const categories = getAllCategories();

  return (
    <section
      className={className}
      id="projects"
      ref={sectionRef}
      aria-labelledby="projects-heading"
    >
      <Card className="max-w-7xl mx-auto border-0! bg-transparent dark:bg-transparent shadow-none">
        <m.div
          initial={{ y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <CardTitle
            id="projects-heading"
            className="text-3xl font-light sm:text-4xl text-center mb-8 text-black dark:text-white"
            role="heading"
            aria-level={2}
          >
            {t("title")}
          </CardTitle>
        </m.div>

        {/* Category Filter */}
        <ProjectsFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          isInView={isInView}
        />

        {/* Projects Grid */}
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </RevealGroup>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">{t("noProjectsFound")}</p>
          </m.div>
        )}
      </Card>
    </section>
  );
}
