/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type {
  Capability,
  CapabilitiesData,
  StackTech,
} from "@/types/main/capabilities";

/**
 * How I build, framed as outcomes
 * Translation keys map to Capabilities section in messages/*.json
 * Tech icons are subtle indicators (react-icons/si identifiers)
 */
export const capabilities: readonly Capability[] = [
  {
    id: "ai",
    icon: "BrainCircuit",
    titleKey: "ai.title",
    headlineKey: "ai.headline",
    descriptionKey: "ai.description",
    techIcons: [
      "SiAnthropic",
      "VscAzure",
      "SiOllama",
      "SiModelcontextprotocol",
      "SiPostgresql",
    ],
  },
  {
    id: "launch",
    icon: "Rocket",
    titleKey: "launch.title",
    headlineKey: "launch.headline",
    descriptionKey: "launch.description",
    techIcons: ["SiNextdotjs", "SiReact", "SiVercel"],
  },
  {
    id: "scale",
    icon: "TrendingUp",
    titleKey: "scale.title",
    headlineKey: "scale.headline",
    descriptionKey: "scale.description",
    techIcons: ["SiVercel", "SiDocker", "SiPostgresql"],
  },
  {
    id: "security",
    icon: "Shield",
    titleKey: "security.title",
    headlineKey: "security.headline",
    descriptionKey: "security.description",
    techIcons: ["VscAzure", "SiTypescript", "SiPrisma", "SiPostgresql"],
  },
] as const;

/** Readable names for `techIcons`, for the MCP server's `get_capabilities`. */
export const techIconLabels: Readonly<Record<string, string>> = {
  SiAnthropic: "Anthropic Claude",
  SiDocker: "Docker",
  SiModelcontextprotocol: "Model Context Protocol",
  SiNextdotjs: "Next.js",
  SiOllama: "Ollama",
  SiPostgresql: "PostgreSQL",
  SiPrisma: "Prisma",
  SiReact: "React",
  SiTypescript: "TypeScript",
  SiVercel: "Vercel",
  VscAzure: "Microsoft Azure",
};

/**
 * Technologies on the stack explorer, in display order per group.
 * Labels come from `Capabilities.explorer.tech.<id>` in messages/*.json.
 */
export const stackTechs: readonly StackTech[] = [
  {
    id: "llm",
    group: "ai",
    aliases: ["LLM", "LangChain", "Groq AI (Whisper)"],
    site: "OpenAI · Vercel AI SDK",
  },
  { id: "rag", group: "ai", aliases: ["pgvector"] },
  {
    id: "agents",
    group: "ai",
    aliases: ["AI Agents", "Agent Skills", "Claude Code", "GitHub Copilot CLI"],
  },
  { id: "mcp", group: "ai", aliases: [], site: "/api/mcp" },
  { id: "ollama", group: "ai", aliases: ["Ollama"] },
  {
    id: "nextjs",
    group: "frontend",
    aliases: ["Next.js"],
    site: "Next.js 16 · App Router",
  },
  {
    id: "react",
    group: "frontend",
    aliases: ["React", "Next.js"],
    site: "React 19",
  },
  {
    id: "typescript",
    group: "frontend",
    aliases: ["TypeScript"],
    site: "TypeScript strict",
  },
  {
    id: "tailwind",
    group: "frontend",
    aliases: ["Tailwind CSS"],
    site: "Tailwind CSS 4",
  },
  {
    id: "motion",
    group: "frontend",
    aliases: ["Framer Motion"],
    site: "Framer Motion 12",
  },
  {
    id: "i18n",
    group: "frontend",
    aliases: ["next-internationalization"],
    site: "next-intl",
  },
  {
    id: "postgres",
    group: "backend",
    aliases: ["PostgreSQL", "NeonDB"],
    site: "Neon PostgreSQL",
  },
  { id: "prisma", group: "backend", aliases: ["Prisma"], site: "Prisma 7" },
  {
    id: "auth",
    group: "backend",
    aliases: ["Better Auth", "BetterAuth", "Kinde Auth", "Customizable Auth"],
  },
  { id: "stripe", group: "backend", aliases: ["Stripe"] },
  { id: "docker", group: "backend", aliases: ["Docker"] },
  { id: "vercel", group: "tooling", aliases: [], site: "Vercel" },
  {
    id: "seo",
    group: "tooling",
    aliases: ["SEO", "JSON-LD"],
    site: "JSON-LD · sitemap",
  },
  { id: "npm", group: "tooling", aliases: ["npm package"] },
  { id: "notion", group: "tooling", aliases: ["Notion API"] },
  {
    id: "playwright",
    group: "tooling",
    aliases: [],
    site: "Playwright + axe-core",
  },
] as const;

/**
 * Complete capabilities data
 */
export const capabilitiesData: CapabilitiesData = {
  capabilities,
} as const;

export default capabilitiesData;
