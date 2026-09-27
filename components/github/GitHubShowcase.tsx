/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaGithub } from "react-icons/fa";
import { ScrambleText } from "@/components/visuals";
import type { GitHubSnapshot } from "@/types/configs/github";
import GitHubProfile from "./GitHubProfile";
import GitHubLanguages from "./GitHubLanguages";
import GitHubRepositories from "./GitHubRepositories";
import GitHubMcpConsole from "./GitHubMcpConsole";
import { githubCopy } from "./GitHub.constants";
import { formatDateTime } from "./GitHub.utils";

type ErrorCode = keyof typeof githubCopy.errors;

function toErrorCode(value: unknown): ErrorCode {
  return value === "RATE_LIMIT_EXCEEDED"
    ? "RATE_LIMIT_EXCEEDED"
    : "SERVICE_UNAVAILABLE";
}

export default function GitHubShowcase({ className }: { className?: string }) {
  const [snapshot, setSnapshot] = useState<GitHubSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorCode | null>(null);

  const fetchSnapshot = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch("/api/github");
      const body = (await response.json()) as
        | GitHubSnapshot
        | { error?: unknown };
      if (!response.ok || !("overview" in body)) {
        setError(toErrorCode("error" in body ? body.error : undefined));
        return;
      }
      setSnapshot(body);
      setError(null);
    } catch {
      setError("SERVICE_UNAVAILABLE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount. The rule flags any call reaching a setState, without
    // distinguishing awaits: here the only synchronous one is setLoading(true),
    // which matches the initial state and so does not re-render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSnapshot();
  }, [fetchSnapshot]);

  if (loading) {
    return (
      <section
        className={`px-4 max-w-6xl mx-auto space-y-6 min-h-100 ${className} flex`}
      >
        <Card className="border-0 bg-transparent">
          <CardContent>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700 dark:border-slate-300 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                {githubCopy.loading}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error || !snapshot) {
    return (
      <section className={`px-4 max-w-6xl mx-auto space-y-6 ${className}`}>
        <Card className="border-0 bg-transparent">
          <CardContent>
            <div className="text-center py-12">
              <FaGithub className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                {githubCopy.errors[error ?? "SERVICE_UNAVAILABLE"]}
              </p>
              <Button
                onClick={() => void fetchSnapshot()}
                className="mt-4 cursor-pointer"
              >
                {githubCopy.retry}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const { overview, fetchedAt } = snapshot;

  return (
    <div
      className={`flex flex-col items-center px-4 max-w-6xl mx-auto space-y-6 mt-4 ${className}`}
    >
      {/* Section Header */}
      <div className="flex flex-col items-center space-y-2 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-black dark:text-white py-6">
          <ScrambleText text={githubCopy.title} />
        </h2>
        <GitHubMcpConsole />
      </div>

      <div className="w-full space-y-4">
        <GitHubProfile profile={overview.profile} stats={overview.stats} />
        <GitHubLanguages languages={overview.languages} />
      </div>

      <GitHubRepositories repositories={overview.repositories} />

      <Badge
        variant="outline"
        className="text-xs text-black dark:text-white flex items-center gap-2 justify-center"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50 animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
        </span>
        {githubCopy.liveBadge} {formatDateTime(fetchedAt)}
      </Badge>
    </div>
  );
}
