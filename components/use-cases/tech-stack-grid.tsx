/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import type { TechStack } from "@/types/hubs/use-cases";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  Code2,
  Sparkles,
  Package,
  Server,
  Blocks,
  type LucideIcon,
} from "lucide-react";
// React Icons
import {
  RiNextjsFill,
  RiReactjsFill,
  RiVuejsFill,
  RiJavascriptFill,
} from "react-icons/ri";
import {
  SiTypescript,
  SiTailwindcss,
  SiNotion,
  SiVercel,
  SiSupabase,
  SiPostgresql,
  SiMongodb,
  SiPrisma,
  SiStripe,
} from "react-icons/si";
// You can also use other icon libraries:
// import { IconName } from "@heroicons/react/24/outline";
// import { IconName } from "@tabler/icons-react";
// import { IconName } from "react-feather";

interface TechStackGridProps {
  techStack: TechStack[];
}

// Support multiple icon types
type IconComponent = LucideIcon | React.ComponentType<{ className?: string }>;

function getTechIcon(name: string): IconComponent {
  const iconMap: Record<string, IconComponent> = {
    // Databases - Using Simple Icons for better brand representation
    Supabase: SiSupabase,
    PostgreSQL: SiPostgresql,
    Neon: Database,
    MySQL: Database,
    MongoDB: SiMongodb,

    // Frameworks - Using React Icons for better brand representation
    "Next.js": RiNextjsFill,
    React: RiReactjsFill,
    Vue: RiVuejsFill,
    Nuxt: Code2,

    // AI/ML
    OpenAI: Sparkles,
    Anthropic: Sparkles,
    "Vercel AI SDK": Sparkles,
    "AI SDK": Sparkles,
    "Groq AI (Whisper)": Sparkles,

    // Tools
    TypeScript: SiTypescript,
    JavaScript: RiJavascriptFill,
    "Tailwind CSS": SiTailwindcss,
    "shadcn/ui": Blocks,
    "Notion API": SiNotion,

    // Backend/Services
    "Node.js": Server,
    Vercel: SiVercel,
    Stripe: SiStripe,
    tRPC: Server,
    Prisma: SiPrisma,
    Drizzle: Package,
  };

  return iconMap[name] || Package;
}

export function TechStackGrid({ techStack }: TechStackGridProps) {
  const t = useTranslations("Usecases");

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        {t("techStackLabel")}
      </h4>
      <div className="flex flex-wrap gap-2">
        {techStack.map((tech) => {
          const Icon = getTechIcon(tech.name);

          return (
            <Badge
              key={tech.name}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1.5"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{tech.name}</span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
