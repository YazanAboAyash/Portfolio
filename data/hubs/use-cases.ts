/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { UseCaseProject } from "@/types/hubs/use-cases";
import { Bot, Mic, Mail } from "lucide-react";

export const useCaseProjects: UseCaseProject[] = [
  {
    id: "project-4",
    titleKey: "Usecases.projects.project-4.title",
    descriptionKey: "Usecases.projects.project-4.description",
    screenshots: [
      "/assets/use-cases/use-case4-1.png",
      "/assets/use-cases/use-case4-2.png",
    ],
    techStack: [
      { name: "Next.js" },
      { name: "TypeScript" },
      { name: "OpenAI" },
    ],
    demoLink: "https://coldbydefault.com/automation-audit",
    githubLink: "",
    implementationAreasKey: "Usecases.projects.project-4.implementationAreas",
    icon: Bot,
  },
  {
    id: "project-1",
    titleKey: "Usecases.projects.project-1.title",
    descriptionKey: "Usecases.projects.project-1.description",
    screenshots: [
      "/assets/use-cases/use-case1-1.png",
      "/assets/use-cases/use-case1-2.png",
      "/assets/use-cases/use-case1-3.png",
      "/assets/use-cases/use-case1-4.png",
    ],
    techStack: [
      { name: "Next.js" },
      { name: "TypeScript" },
      { name: "Groq AI (Whisper)" },
      { name: "Notion API" },
    ],
    demoLink: "",
    githubLink: "https://github.com/yazanaboayash/meeting-intelligence",
    implementationAreasKey: "Usecases.projects.project-1.implementationAreas",
    icon: Mic,
  },
  {
    id: "project-3",
    titleKey: "Usecases.projects.project-3.title",
    descriptionKey: "Usecases.projects.project-3.description",
    screenshots: [
      "/assets/use-cases/use-case3-1.png",
      "/assets/use-cases/use-case3-2.png",
    ],
    techStack: [
      { name: "Next.js" },
      { name: "TypeScript" },
      { name: "Groq AI" },
      { name: "RAG" },
    ],
    demoLink: "https://coldbydefault.com/polite-email",
    githubLink: "",
    implementationAreasKey: "Usecases.projects.project-3.implementationAreas",
    icon: Mail,
  },
];
