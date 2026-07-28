/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import {
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
  SiNodedotjs,
  SiPrisma,
  SiPostgresql,
  SiDocker,
  SiVercel,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiMiro,
  SiLatex,
  SiCanvas,
  SiN8N,
} from "react-icons/si";
import { FaRobot } from "react-icons/fa";
import { TbAutomation } from "react-icons/tb";
import { FileText, Network, Workflow } from "lucide-react";

export interface TechItem {
  name: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface SubCategory {
  name: string;
  nameKey: string;
  items: TechItem[];
}

export interface ServiceGroup {
  category: string;
  categoryKey: string;
  descriptionKey: string;
  subCategories: SubCategory[];
}

export const serviceGroups: ServiceGroup[] = [
  {
    category: "AI & Automation",
    categoryKey: "aiAutomation",
    descriptionKey: "aiAutomationDesc",
    subCategories: [
      {
        name: "AI Assistants",
        nameKey: "aiAgents",
        items: [
          { name: "AI Agents", Icon: FaRobot },
          { name: "RAG Systems", Icon: Network },
          { name: "MCP", Icon: FileText },
        ],
      },
      {
        name: "Workflow Automation",
        nameKey: "workflowAutomation",
        items: [
          { name: "n8n", Icon: SiN8N },
          { name: "LangFlow", Icon: TbAutomation },
        ],
      },
    ],
  },
  {
    category: "Web & Backend MVPs",
    categoryKey: "webDevelopment",
    descriptionKey: "webDevelopmentDesc",
    subCategories: [
      {
        name: "Frontend",
        nameKey: "frontend",
        items: [
          { name: "TypeScript", Icon: SiTypescript },
          { name: "React", Icon: SiReact },
          { name: "Next.js", Icon: SiNextdotjs },
          { name: "TailwindCSS", Icon: SiTailwindcss },
        ],
      },
      {
        name: "Backend & Database",
        nameKey: "backend",
        items: [
          { name: "Node.js", Icon: SiNodedotjs },
          { name: "Prisma", Icon: SiPrisma },
          { name: "PostgreSQL", Icon: SiPostgresql },
        ],
      },
    ],
  },
  {
    category: "Enabling Skills",
    categoryKey: "enablingSkills",
    descriptionKey: "enablingSkillsDesc",
    subCategories: [
      {
        name: "DevOps & Deployment",
        nameKey: "devops",
        items: [
          { name: "Docker", Icon: SiDocker },
          { name: "Vercel", Icon: SiVercel },
          { name: "Git", Icon: SiGit },
          { name: "GitHub", Icon: SiGithub },
          { name: "GitHub Actions", Icon: SiGithubactions },
        ],
      },
      {
        name: "Documentation & Design",
        nameKey: "docsDesign",
        items: [
          { name: "System Design", Icon: Workflow },
          { name: "LaTeX", Icon: SiLatex },
          { name: "Miro", Icon: SiMiro },
          { name: "Canva", Icon: SiCanvas },
        ],
      },
    ],
  },
];

// Keep for backwards compatibility if needed
export interface TechGroup {
  category: string;
  categoryKey: string;
  items: TechItem[];
}

export const techGroups: TechGroup[] = serviceGroups.map((service) => ({
  category: service.category,
  categoryKey: service.categoryKey,
  items: service.subCategories.flatMap((sub) => sub.items),
}));
