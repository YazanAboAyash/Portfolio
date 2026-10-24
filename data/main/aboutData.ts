/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

export interface AboutSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: "work" | "education" | "certification" | "project";
  icon?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: "frontend" | "backend" | "fullstack" | "tools" | "soft-skills";
}

export interface AboutData {
  personalInfo: {
    name: string;
    title: string;
    currentPosition: string;
    company: string;
    location: string;
    experience: string;
  };
  mainStory: string;
  sections: AboutSection[];
  achievements: Achievement[];
  currentFocus: string[];
  goals: string[];
  values: string[];
}

export const aboutData: AboutData = {
  personalInfo: {
    name: "Yazan Abo-Ayash",
    title:
      "Full-stack web applications and the AI inside them — LLM features, RAG systems, AI agents and MCP servers",
    currentPosition: "Full-Stack Developer & AI Engineer",
    company: "Botgenossen GmbH, Avarno GmbH",
    location: "Germany",
    experience: "3+ years",
  },
  mainStory:
    "I'm a full-stack developer and AI engineer, employed full-time at Botgenossen GmbH and Avarno GmbH. I build web applications end to end in Next.js, TypeScript and React — and the AI inside them: LLM features, retrieval (RAG) that answers from the right sources, agents that use tools safely, and MCP servers. IHK-certified Fachinformatiker for application development, with EU AI Act training.",
  sections: [
    {
      id: "journey",
      title: "My Journey",
      content:
        "Self-taught first, then IHK-certified. Most of what I know I learned by building: this website, open-source packages, and tools I use myself every day.",
      order: 1,
    },
    {
      id: "philosophy",
      title: "How I Work",
      content:
        "Honest, well-documented software over clever tricks. Strict TypeScript, tests where they matter, and privacy and regulation considered from the start — especially when AI is involved.",
      order: 2,
    },
    {
      id: "current-work",
      title: "What I Work On",
      content:
        "Full-stack web applications and the AI systems inside them: LLM integrations, RAG pipelines, AI agents with tool use, and MCP servers.",
      order: 3,
    },
  ],
  achievements: [
    {
      id: "ihk",
      title: "IHK Fachinformatiker",
      description: "Certified application developer (Anwendungsentwicklung)",
      date: "Completed",
      category: "certification",
      icon: "🎓",
    },
    {
      id: "eu-ai-act",
      title: "EU AI Act",
      description: "Trained on the obligations the EU AI Act places on AI systems",
      date: "Completed",
      category: "certification",
      icon: "⚖️",
    },
    {
      id: "mcp",
      title: "Public MCP Server",
      description:
        "A read-only Model Context Protocol server over my GitHub account, open to any MCP client",
      date: "Ongoing",
      category: "project",
      icon: "🔌",
    },
  ],
  currentFocus: [
    "Full-stack web applications with Next.js and TypeScript",
    "LLM applications, RAG systems and AI agents",
    "MCP servers and AI developer tooling",
    "Workflow automation where it removes real manual work",
  ],
  goals: [
    "Build AI features that hold up in production, not just in demos",
    "Go deeper on retrieval, agents and evaluation",
    "Keep contributing open-source tooling",
  ],
  values: [
    "Honest, well-documented software",
    "Privacy by design",
    "Long-term reliability over quick fixes",
    "Strict types and clear boundaries",
  ],
};
