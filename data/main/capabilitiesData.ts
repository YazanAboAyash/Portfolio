/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type {
  Capability,
  CapabilitiesData,
  PipelineStage,
  StackGroup,
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
      "SiOllama",
      "SiHuggingface",
      "SiModelcontextprotocol",
      "SiGithubcopilot",
      "BsOpenai",
      "SiAnthropic",
      "SiElevenlabs",
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

/**
 * The path a change takes in every project, shown on the capabilities section.
 * Label, detail and practices come from `Capabilities.pipeline.stages.<id>`.
 */
export const pipelineStages: readonly PipelineStage[] = [
  { id: "commit" },
  { id: "check", capabilityId: "security" },
  { id: "preview", capabilityId: "launch" },
  { id: "deploy", capabilityId: "scale" },
  { id: "live" },
] as const;

/**
 * Readable names for the capability brand marks (`techIcons`), also used by
 * the MCP server's `get_capabilities`. Names, not copy: never translated.
 */
export const techIconLabels: Readonly<Record<string, string>> = {
  BsOpenai: "OpenAI",
  SiAnthropic: "Anthropic Claude",
  SiDocker: "Docker",
  SiElevenlabs: "ElevenLabs",
  SiGithubcopilot: "GitHub Copilot",
  SiHuggingface: "Hugging Face",
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
 * The stack explorer, one tab per group. Tool names and practices are plain
 * English and never translated.
 */
export const stackGroups: readonly StackGroup[] = [
  {
    id: "frontend",
    tools: [
      { id: "nextjs", name: "Next.js", icon: "SiNextdotjs" },
      { id: "react", name: "React", icon: "SiReact" },
      { id: "typescript", name: "TypeScript", icon: "SiTypescript" },
      { id: "javascript", name: "JavaScript", icon: "SiJavascript" },
      { id: "vite", name: "Vite", icon: "SiVite" },
      { id: "tailwind", name: "Tailwind CSS", icon: "SiTailwindcss" },
    ],
    practices: [],
  },
  {
    id: "backend",
    tools: [
      { id: "nodejs", name: "Node.js", icon: "SiNodedotjs" },
      { id: "postgres", name: "PostgreSQL", icon: "SiPostgresql" },
      { id: "neon", name: "Neon", icon: "SiNeon" },
      { id: "prisma", name: "Prisma", icon: "SiPrisma" },
      { id: "betterauth", name: "Better Auth", icon: "SiBetterauth" },
      { id: "pgvector", name: "pgvector" },
      { id: "entra", name: "Microsoft Entra ID" },
      { id: "n8n", name: "n8n" },
    ],
    practices: ["System design", "Integrations"],
  },
  {
    id: "ai",
    tools: [
      { id: "azureai", name: "Azure AI", icon: "AzureAi" },
      { id: "openai", name: "OpenAI", icon: "BsOpenai" },
      { id: "ollama", name: "Ollama", icon: "SiOllama" },
      {
        id: "mcp",
        name: "Model Context Protocol",
        icon: "SiModelcontextprotocol",
      },
    ],
    practices: [
      "RAG",
      "Context engineering",
      "AI engineering: skills & instructions",
    ],
  },
  {
    id: "infra",
    tools: [
      { id: "docker", name: "Docker", icon: "SiDocker" },
      { id: "kubernetes", name: "Kubernetes", icon: "SiKubernetes" },
      { id: "ubuntu", name: "Ubuntu Server", icon: "SiUbuntu" },
      { id: "nginx", name: "Nginx", icon: "SiNginx" },
      { id: "vercel", name: "Vercel", icon: "SiVercel" },
      { id: "githubactions", name: "GitHub Actions", icon: "SiGithubactions" },
    ],
    practices: ["CI/CD", "DevOps"],
  },
  {
    id: "workflow",
    tools: [
      { id: "git", name: "Git", icon: "SiGit" },
      { id: "github", name: "GitHub", icon: "SiGithub" },
      { id: "npm", name: "npm", icon: "SiNpm" },
      { id: "pnpm", name: "pnpm", icon: "SiPnpm" },
      { id: "notion", name: "Notion", icon: "SiNotion" },
      { id: "linear", name: "Linear", icon: "SiLinear" },
      { id: "playwright", name: "Playwright" },
    ],
    practices: [
      "Scrum",
      "Project management: tasks & tickets",
      "Documentation",
    ],
  },
] as const;

/**
 * Complete capabilities data
 */
export const capabilitiesData: CapabilitiesData = {
  capabilities,
} as const;

export default capabilitiesData;
