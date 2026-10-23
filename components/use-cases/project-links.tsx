/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

interface ProjectLinksProps {
  demoLink?: string | undefined;
  githubLink?: string | undefined;
}

export function ProjectLinks({ demoLink, githubLink }: ProjectLinksProps) {
  const t = useTranslations("Usecases");

  if (!demoLink && !githubLink) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {demoLink && (
        <Button asChild className="flex-1 min-w-35">
          <a href={demoLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
            {t("liveDemoButton")}
          </a>
        </Button>
      )}
      {githubLink && (
        <Button
          asChild
          variant="outline"
          className="flex-1 min-w-35 bg-transparent"
        >
          <a href={githubLink} target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4 mr-2" aria-hidden="true" />
            {t("viewCodeButton")}
          </a>
        </Button>
      )}
    </div>
  );
}
