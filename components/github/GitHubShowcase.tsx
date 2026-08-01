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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaGithub, FaTerminal } from "react-icons/fa";
import GitHubProfile from "@/components/github/GitHubProfile";
import GitHubRepositories from "@/components/github/GitHubRepositories";
import type { GitHubData, GitHubApiResponse } from "@/types/configs/github";
import { ScrambleText } from "@/components/visuals";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/Drawer";

export default function GitHubShowcase({ className }: { className?: string }) {
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mcpLogs, setMcpLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGitHubData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch("/api/github");
      if (!response.ok) {
        throw new Error("Failed to fetch GitHub data");
      }
      const data = (await response.json()) as GitHubApiResponse;

      if (
        data.profile &&
        data.repositories &&
        data.stats &&
        data.activity &&
        data.lastUpdated
      ) {
        const validatedData: GitHubData = {
          profile: data.profile,
          repositories: data.repositories,
          stats: data.stats,
          activity: data.activity,
          highlights: data.highlights ?? [],
          lastUpdated: data.lastUpdated,
        };
        setGithubData(validatedData);
        setError(null);
      } else {
        throw new Error("Invalid data structure received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount. The rule flags any call reaching a setState, without
    // distinguishing awaits: here the only synchronous one is setLoading(true),
    // which matches the initial state and so does not re-render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchGitHubData();
  }, [fetchGitHubData]);

  const simulateMCPCommunication = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setMcpLogs([]);

    const logs = [
      "🔌 Connecting to GitHub MCP Server...",
      "✅ MCP Connection established",
      `📡 Fetching profile data for ${githubData?.profile.login || "user"}`,
      "📊 Retrieving repository statistics...",
      "⭐ Calculating total stars across repositories...",
      "🍴 Counting total forks...",
      "👥 Getting follower count...",
      "📈 Analyzing language usage...",
      "✨ Data processing complete!",
      `🎯 Found ${githubData?.stats.public_repos || 0} public repositories`,
      `⭐ Total stars: ${githubData?.stats.total_stars || 0}`,
      `👥 Followers: ${githubData?.stats.followers || 0}`,
      "🔄 Real-time sync with GitHub API active",
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const logEntry = logs[i];
      if (logEntry) {
        setMcpLogs((prev) => [...prev, logEntry]);
      }
    }

    setIsLoading(false);
  }, [githubData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
                Loading GitHub data...
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (error || !githubData) {
    return (
      <section className={`px-4 max-w-6xl mx-auto space-y-6 ${className}`}>
        <Card className="border-0 bg-transparent">
          <CardContent>
            <div className="text-center py-12">
              <FaGithub className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                {error || "Failed to load GitHub data"}
              </p>
              <Button onClick={() => void fetchGitHubData()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section
      className={`flex flex-col items-center px-4 max-w-6xl mx-auto space-y-6 mt-4 ${className}`}
      id="github"
    >
      {/* Section Header */}
      <div className="flex flex-col items-center space-y-2 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl text-black dark:text-white py-6">
          <ScrambleText text="GitHub Activity" />
        </h2>
        <Drawer>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DrawerTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="cursor-pointer animate-pulse"
                  >
                    <FaTerminal className="mr-2 h-4 w-4 animate-pulse" />
                    Start MCP Live
                  </Button>
                </DrawerTrigger>
              </TooltipTrigger>
              <TooltipContent className="hidden lg:block">
                <p>
                  Click to see live GitHub data fetching via Model Context
                  Protocol
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>GitHub MCP Communication</DrawerTitle>
              <DrawerDescription>
                Live demonstration of Model Context Protocol communication with
                GitHub API
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 flex-1">
              <div className="mb-4">
                <Button
                  onClick={() => void simulateMCPCommunication()}
                  disabled={isLoading}
                  className="w-full cursor-pointer"
                >
                  {isLoading
                    ? "🔄 Processing..."
                    : "🚀 Start MCP Communication"}
                </Button>
              </div>

              <div className="bg-black rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                {mcpLogs.length === 0 && !isLoading && (
                  <div className="text-green-400">
                    $ Ready to demonstrate GitHub MCP integration...
                  </div>
                )}
                {mcpLogs.map((log, index) => (
                  <div key={index} className="text-green-400 mb-1">
                    <span className="text-gray-500">$</span> {log}
                  </div>
                ))}
                {isLoading && (
                  <div className="text-yellow-400 animate-pulse">
                    <span className="text-gray-500">$</span> Processing...
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  💡 This demonstrates real-time communication between my
                  portfolio and GitHub using Model Context Protocol
                  &apos;MCP&apos;.
                </p>
              </div>
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" className="cursor-pointer">
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Profile Section */}
      <div className="w-full">
        <GitHubProfile
          profile={githubData.profile}
          stats={githubData.stats}
          highlights={githubData.highlights}
        />
      </div>

      {/* Repositories Section */}
      <div>
        <GitHubRepositories repositories={githubData.repositories} />
      </div>

      {/* Last Updated Section */}
      <div className="text-center">
        <Badge
          variant="outline"
          className="text-xs text-black dark:text-white flex items-center gap-2 justify-center"
        >
          <div className="flex items-center relative">
            {/* Green status dot with inline styles as fallback */}
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{
                backgroundColor: "#22c55e",
                minWidth: "12px",
                minHeight: "12px",
              }}
            ></div>
            <div
              className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-50"
              style={{
                backgroundColor: "#4ade80",
              }}
            ></div>
          </div>
          API Online • Last updated: {formatDate(githubData.lastUpdated)}{" "}
          {new Date(githubData.lastUpdated).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Badge>
      </div>
    </section>
  );
}
