/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { Project } from "@/data/hubs/projectsData";

export interface ProjectsShowcaseProps {
  className?: string;
}

export interface ProjectCardProps {
  project: Project;
  index: number;
}

export interface ProjectCardState {
  copied: boolean;
  isTruncated: boolean;
  isHovered: boolean;
}

export interface UseProjectLogicReturn {
  handleCopyCloneLink: (githubUrl: string) => Promise<void>;
  copied: boolean;
  setCopied: (copied: boolean) => void;
}

// Re-export for convenience
export type { Project };
