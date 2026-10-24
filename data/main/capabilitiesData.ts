/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { Capability, CapabilitiesData } from "@/types/main/capabilities";

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

/**
 * Complete capabilities data
 */
export const capabilitiesData: CapabilitiesData = {
  capabilities,
} as const;

export default capabilitiesData;
