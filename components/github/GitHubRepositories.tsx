/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaStar } from "react-icons/fa";
import { GoRepoForked } from "react-icons/go";
import { ChevronDown, ChevronUp } from "lucide-react";
import { m } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  cardSurfaceGitHub,
  RevealGroup,
  RevealItem,
} from "@/components/visuals";
import { cn } from "@/lib/utils";
import type { GitHubRepositoriesProps } from "@/types/configs/github";
import { githubCopy } from "./GitHub.constants";
import { formatNumber, formatRelative } from "./GitHub.utils";

const TOPIC_LIMIT = 3;

export default function GitHubRepositories({
  repositories,
}: GitHubRepositoriesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (repositories.items.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <h3 className="flex justify-center mb-4">
        <button
          type="button"
          aria-expanded={isExpanded}
          className="inline-flex items-center justify-center gap-2 cursor-pointer bg-white dark:bg-black hover:shadow-lg rounded-lg px-6 py-3 transition-all duration-200 text-xl font-semibold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-slate-100 select-none whitespace-nowrap"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {githubCopy.repositories[repositories.source]}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0" />
          )}
        </button>
      </h3>
      <m.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repositories.items.map((repo) => (
            <RevealItem key={repo.name} className="h-full">
              <Card
                className={cn(cardSurfaceGitHub, "h-full relative overflow-hidden")}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Link
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
                    >
                      {repo.name}
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="secondary" className="text-xs">
                        <FaStar className="mr-1 h-3 w-3" />
                        {formatNumber(repo.stars)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <GoRepoForked className="mr-1 h-3 w-3" />
                        {formatNumber(repo.forks)}
                      </Badge>
                    </div>
                  </div>
                  {repo.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    {repo.language && (
                      <Badge variant="outline" className="text-xs">
                        <span
                          className="w-2 h-2 rounded-full mr-1"
                          style={{
                            backgroundColor:
                              repo.language.color ?? "var(--muted-foreground)",
                          }}
                        />
                        {repo.language.name}
                      </Badge>
                    )}
                    {repo.pushedAt && (
                      <Badge variant="outline" className="text-xs">
                        {githubCopy.repositories.pushed}{" "}
                        {formatRelative(repo.pushedAt)}
                      </Badge>
                    )}
                  </div>
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {repo.topics.slice(0, TOPIC_LIMIT).map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {repo.topics.length > TOPIC_LIMIT && (
                        <Badge variant="secondary" className="text-xs">
                          +{repo.topics.length - TOPIC_LIMIT}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>
      </m.div>
    </div>
  );
}
