/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

// ---------------------------------------------------------------------------
// Normalised data served by lib/github to the MCP server and its console.
// ---------------------------------------------------------------------------

export interface GitHubLanguage {
  name: string;
  /** Linguist colour as reported by GitHub; null for languages without one. */
  color: string | null;
}

export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  url: string;
  createdAt: string;
  location: string | null;
  company: string | null;
  websiteUrl: string | null;
}

export interface GitHubStats {
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  followers: number;
  following: number;
  contributionsLastYear: number;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stars: number;
  forks: number;
  pushedAt: string | null;
  language: GitHubLanguage | null;
  topics: string[];
}

/** `pinned` when the profile has pinned repositories, else the most recently pushed ones. */
export type GitHubRepoSource = "pinned" | "recent";

export interface GitHubRepoList {
  source: GitHubRepoSource;
  items: GitHubRepo[];
}

export interface GitHubOverview {
  profile: GitHubProfile;
  stats: GitHubStats;
  repositories: GitHubRepoList;
}

/** One upstream request made to GitHub, as measured by the server. */
export interface GitHubUpstreamCall {
  api: "graphql" | "rest";
  endpoint: string;
  status: number;
  durationMs: number;
  rateLimitRemaining: number | null;
}

/** Where a piece of data came from — attached to every MCP tool result. */
export interface GitHubFetchMeta {
  source: "github" | "cache";
  /** True when GitHub failed and an expired cache entry was served instead. */
  stale: boolean;
  fetchedAt: string;
  ageSeconds: number;
  calls: GitHubUpstreamCall[];
}

export interface GitHubFetchResult<T> {
  data: T;
  meta: GitHubFetchMeta;
}

/** A fact GitHub exposes no API for, declared in `data/` instead. */
export interface GitHubDeclaredHighlight {
  id: string;
  label: string;
  link: string;
}

// ---------------------------------------------------------------------------
// Raw upstream shapes — only the fields lib/github actually reads.
// ---------------------------------------------------------------------------

export interface GitHubGraphQLRepoNode {
  name: string;
  isPrivate: boolean;
  isFork: boolean;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  forkCount: number;
  pushedAt: string | null;
  primaryLanguage: GitHubLanguage | null;
  repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
}

export interface GitHubGraphQLOverviewResponse {
  data?: {
    rateLimit: { remaining: number } | null;
    user: {
      login: string;
      name: string | null;
      bio: string | null;
      avatarUrl: string;
      url: string;
      createdAt: string;
      location: string | null;
      company: string | null;
      websiteUrl: string | null;
      followers: { totalCount: number };
      following: { totalCount: number };
      contributionsCollection: {
        contributionCalendar: { totalContributions: number };
      };
      pinnedItems: {
        nodes: Array<GitHubGraphQLRepoNode | Record<string, never>>;
      };
      repositories: { totalCount: number; nodes: GitHubGraphQLRepoNode[] };
    } | null;
  };
  errors?: Array<{ message: string; type?: string }>;
}
