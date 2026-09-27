/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaGithub, FaStar, FaCode, FaUsers } from "react-icons/fa";
import { GoRepoForked } from "react-icons/go";
import { Cpu, CalendarDays, Activity } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  cardSurfaceGitHub,
  RevealGroup,
  RevealItem,
} from "@/components/visuals";
import { cn } from "@/lib/utils";
import { githubDeclaredHighlights } from "@/data/configs/githubHighlights";
import type { GitHubProfileProps } from "@/types/configs/github";
import { githubCopy } from "./GitHub.constants";
import { formatNumber } from "./GitHub.utils";

export default function GitHubProfile({ profile, stats }: GitHubProfileProps) {
  const displayName = profile.name ?? profile.login;
  const statItems = [
    {
      label: githubCopy.stats.repos,
      value: stats.publicRepos,
      icon: <FaCode className="h-3 w-3 text-blue-600 dark:text-blue-400" />,
    },
    {
      label: githubCopy.stats.stars,
      value: stats.totalStars,
      icon: <FaStar className="h-3 w-3 text-yellow-500" />,
    },
    {
      label: githubCopy.stats.followers,
      value: stats.followers,
      icon: <FaUsers className="h-3 w-3 text-green-600 dark:text-green-400" />,
    },
    {
      label: githubCopy.stats.forks,
      value: stats.totalForks,
      icon: (
        <GoRepoForked className="h-3 w-3 text-purple-600 dark:text-purple-400" />
      ),
    },
  ];

  return (
    <RevealGroup>
      <RevealItem>
        <Card className={cn(cardSurfaceGitHub, "relative overflow-hidden")}>
          <CardContent className="p-3 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Side - Profile Info */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  {/* GitHub keeps the same avatar URL when the picture changes,
                      so the image optimizer's one-year cache (next.config.ts)
                      would pin the old one. `unoptimized` loads it from
                      GitHub's CDN, which revalidates within minutes. */}
                  <Image
                    width={48}
                    height={48}
                    src={profile.avatarUrl}
                    alt={`${githubCopy.profile.avatarAlt} ${displayName}`}
                    className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700"
                    loading="lazy"
                    unoptimized
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {displayName}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      @{profile.login}
                    </span>
                  </div>
                </div>
                {profile.bio && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {profile.bio}
                  </p>
                )}
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="cursor-pointer hover:bg-primary/10 relative z-10"
                  >
                    <Link
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 cursor-pointer text-center w-full"
                    >
                      <FaGithub className="h-4 w-4" />
                      {githubCopy.profile.viewProfile}
                    </Link>
                  </Button>
                </div>

                {/* Highlights */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {githubCopy.profile.highlights}
                  </h4>
                  {githubDeclaredHighlights.map((highlight) => (
                    <Link
                      key={highlight.id}
                      href={highlight.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Cpu className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                      {highlight.label}
                    </Link>
                  ))}
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                    {githubCopy.profile.memberSince}{" "}
                    {new Date(profile.createdAt).getFullYear()}
                  </div>
                </div>
              </div>

              {/* Right Side - Stats Grid */}
              <div className="grid grid-cols-2 gap-2 content-start">
                {statItems.map((item) => (
                  <div key={item.label} className="text-center py-2 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      {item.icon}
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {formatNumber(item.value)}
                    </div>
                  </div>
                ))}
                <div className="col-span-2 text-center py-2 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Activity className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {githubCopy.stats.contributions}
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {formatNumber(stats.contributionsLastYear)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </RevealItem>
    </RevealGroup>
  );
}
