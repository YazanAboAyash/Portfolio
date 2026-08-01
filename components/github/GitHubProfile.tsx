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
import { Cpu, CalendarDays } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  cardSurfaceGitHub,
  RevealGroup,
  RevealItem,
} from "@/components/visuals";
import { cn } from "@/lib/utils";
import type {
  GitHubProfile,
  GitHubStats,
  GitHubHighlight,
} from "@/types/configs/github";

interface GitHubProfileProps {
  profile: GitHubProfile;
  stats: GitHubStats;
  highlights: GitHubHighlight[];
}

export default function GitHubProfile({
  profile,
  stats,
  highlights,
}: GitHubProfileProps) {
  return (
    <RevealGroup>
      <RevealItem>
        <Card className={cn(cardSurfaceGitHub, "relative overflow-hidden")}>
          <CardContent className="p-3 relative z-20 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Side - Profile Info */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                  <Image
                    width={48}
                    height={48}
                    src={profile.avatar_url}
                    alt={`${profile.name || profile.login} GitHub profile picture`}
                    className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700"
                    loading="lazy"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {profile.name}
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
                      href={profile.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 cursor-pointer text-center w-full"
                    >
                      <FaGithub className="h-4 w-4" />
                      View Profile
                    </Link>
                  </Button>
                </div>

                {/* Highlights */}
                {highlights.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Highlights
                    </h4>
                    {highlights.map((highlight) => {
                      const icon =
                        highlight.label === "Developer Program Member" ? (
                          <Cpu className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                        ) : highlight.label === "Member Since" ? (
                          <CalendarDays className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                        ) : (
                          <span className="text-sm shrink-0">
                            {highlight.icon}
                          </span>
                        );

                      const content = (
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          {icon}
                          <span>
                            {highlight.label === "Member Since"
                              ? `Member since ${highlight.value}`
                              : highlight.value}
                          </span>
                        </div>
                      );

                      return highlight.link ? (
                        <Link
                          key={highlight.label}
                          href={highlight.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div key={highlight.label}>{content}</div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Side - Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center py-2 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <FaCode className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Repos
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {stats.public_repos}
                  </div>
                </div>

                <div className="text-center py-2 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <FaStar className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Stars
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {stats.total_stars}
                  </div>
                </div>

                <div className="text-center py-2 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <FaUsers className="h-3 w-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Followers
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {stats.followers}
                  </div>
                </div>
                <div className="text-center py-2 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <GoRepoForked className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Forks
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {stats.total_forks}
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
