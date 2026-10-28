/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { BrainCircuit, Rocket, TrendingUp, Shield } from "lucide-react";
import { BsOpenai } from "react-icons/bs";
import {
  SiAnthropic,
  SiBetterauth,
  SiDocker,
  SiElevenlabs,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiGithubcopilot,
  SiHuggingface,
  SiJavascript,
  SiKubernetes,
  SiLinear,
  SiModelcontextprotocol,
  SiNeon,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiNotion,
  SiNpm,
  SiOllama,
  SiPnpm,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiUbuntu,
  SiVercel,
  SiVite,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";

// Icon mapping for dynamic rendering (lucide icons)
export const iconMap: Record<string, React.ElementType> = {
  BrainCircuit,
  Rocket,
  TrendingUp,
  Shield,
};

// Brand marks from react-icons/si, plus VscAzure and BsOpenai (simple-icons
// has no Azure or OpenAI mark)
export const techIconMap: Record<string, React.ElementType> = {
  AzureAi: VscAzure,
  BsOpenai,
  SiAnthropic,
  SiBetterauth,
  SiDocker,
  SiElevenlabs,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiGithubcopilot,
  SiHuggingface,
  SiJavascript,
  SiKubernetes,
  SiLinear,
  SiModelcontextprotocol,
  SiNeon,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiNotion,
  SiNpm,
  SiOllama,
  SiPnpm,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiUbuntu,
  SiVercel,
  SiVite,
  VscAzure,
};
