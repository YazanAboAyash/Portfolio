/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import type { UseCaseProject } from "@/types/hubs/use-cases";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScreenshotGallery } from "./screenshot-gallery";
import { TechStackGrid } from "./tech-stack-grid";
import { ImplementationAreas } from "./implementation-areas";
import { ProjectLinks } from "./project-links";
import { Separator } from "@/components/ui/separator";
import { cardSurface } from "@/components/visuals";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: UseCaseProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations();

  return (
    <Card className={cn(cardSurface, "flex flex-col h-full")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-balance">
          {project.icon && (
            <project.icon className="h-5 w-5 shrink-0 text-primary" />
          )}
          {t(project.titleKey)}
        </CardTitle>
        <CardDescription className="text-pretty">
          {t(project.descriptionKey)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 flex-1">
        <ScreenshotGallery
          screenshots={project.screenshots}
          projectTitle={t(project.titleKey)}
        />

        <Separator />

        <TechStackGrid techStack={project.techStack} />

        <ImplementationAreas
          implementationAreasKey={project.implementationAreasKey}
        />
      </CardContent>

      <CardFooter>
        <ProjectLinks
          demoLink={project.demoLink}
          githubLink={project.githubLink}
        />
      </CardFooter>
    </Card>
  );
}
