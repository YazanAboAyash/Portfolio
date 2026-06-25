/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  validateDataType,
  sanitizeErrorMessage,
  RateLimiter,
} from "@/lib/security";
import type {
  GitHubRepository,
  GitHubEvent,
  GitHubProfile,
  GitHubRepo,
  GitHubStats,
  GitHubActivity,
  GitHubHighlight,
  GitHubApiResponse,
} from "@/types/configs/github";

// Rate limiter instance
const rateLimiter = new RateLimiter(60000, 10);

class GitHubDataFetcher {
  private username: string;
  private token: string | undefined;
  private baseUrl = "https://api.github.com";

  constructor() {
    this.username = process.env.GITHUB_USERNAME || "yazanaboayash";
    this.token = process.env.GITHUB_TOKEN;
    if (!this.username) {
      console.warn("GITHUB_USERNAME is not set.");
    }
  }

  private get headers() {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Portfolio-Next-App",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async fetchProfile(): Promise<GitHubProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${this.username}`, {
        headers: this.headers,
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Profile fetch error:", response.status, errorText);
        throw new Error(
          `Failed to fetch profile: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const data: GitHubProfile = (await response.json()) as GitHubProfile;
      return data;
    } catch (error) {
      console.error("Profile fetch exception:", error);
      throw error;
    }
  }

  async fetchRepositories(limit = 6): Promise<GitHubRepo[]> {
    const response = await fetch(
      `${this.baseUrl}/users/${this.username}/repos?sort=updated&direction=desc&per_page=${limit}&type=owner`,
      {
        headers: this.headers,
        next: { revalidate: 1800 }, // Cache for 30 minutes
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.statusText}`);
    }

    const repos: GitHubRepository[] =
      (await response.json()) as GitHubRepository[];

    // Filter out forks and format data
    const formattedRepos = repos
      .filter((repo: GitHubRepository) => !repo.fork)
      .map(
        (repo: GitHubRepository): GitHubRepo => ({
          name: repo.name,
          description: repo.description || "",
          html_url: repo.html_url,
          language: repo.language || "",
          stargazers_count: repo.stargazers_count || 0,
          forks_count: repo.forks_count || 0,
          updated_at: repo.updated_at,
          topics: repo.topics || [],
          homepage: repo.homepage || "",
        }),
      );

    return formattedRepos.slice(0, limit);
  }

  async fetchStats(): Promise<GitHubStats> {
    // Get owned repositories for statistics
    const ownedReposResponse = await fetch(
      `${this.baseUrl}/users/${this.username}/repos?per_page=100&type=owner`,
      {
        headers: this.headers,
        next: { revalidate: 3600 },
      },
    );

    if (!ownedReposResponse.ok) {
      throw new Error(
        `Failed to fetch owned repos for stats: ${ownedReposResponse.statusText}`,
      );
    }

    const ownedRepos: GitHubRepository[] =
      (await ownedReposResponse.json()) as GitHubRepository[];
    const profile: GitHubProfile = await this.fetchProfile();

    // Calculate statistics
    const totalStars = ownedRepos.reduce(
      (sum: number, repo: GitHubRepository) =>
        sum + (repo.stargazers_count || 0),
      0,
    );

    const totalForks = ownedRepos.reduce(
      (sum: number, repo: GitHubRepository) => sum + (repo.forks_count || 0),
      0,
    );

    const languages: Record<string, number> = {};
    // Count languages from owned repositories
    ownedRepos.forEach((repo: GitHubRepository) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    const languageEntries = Object.entries(languages);
    const mostUsedLanguage =
      languageEntries.length > 0
        ? languageEntries.sort(([, a], [, b]) => b - a)[0]?.[0] || "Unknown"
        : "Unknown";

    return {
      public_repos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      total_stars: totalStars,
      total_forks: totalForks,
      most_used_language: mostUsedLanguage,
      languages,
    };
  }

  async fetchRecentActivity(limit = 5): Promise<GitHubActivity[]> {
    const response = await fetch(
      `${this.baseUrl}/users/${this.username}/events/public?per_page=${limit}`,
      {
        headers: this.headers,
        next: { revalidate: 900 }, // Cache for 15 minutes
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch activity: ${response.statusText}`);
    }

    const events: GitHubEvent[] = (await response.json()) as GitHubEvent[];
    return events.slice(0, limit).map(
      (event: GitHubEvent): GitHubActivity => ({
        type: event.type,
        repo: event.repo?.name || "",
        created_at: event.created_at,
        action: this.formatEventAction(event),
      }),
    );
  }

  buildHighlights(
    profile: GitHubProfile,
    _stats: GitHubStats,
  ): GitHubHighlight[] {
    const highlights: GitHubHighlight[] = [];

    highlights.push({
      label: "Developer Program Member",
      value: "Developer Program Member",
      icon: "💻",
      link: "https://docs.github.com/en/integrations/concepts/github-developer-program",
    });

    const createdYear = new Date(profile.created_at).getFullYear();
    highlights.push({
      label: "Member Since",
      value: String(createdYear),
      icon: "📅",
    });

    return highlights;
  }

  private formatEventAction(event: GitHubEvent): string {
    const eventType = event.type;
    const repoName = event.repo?.name?.split("/").pop() || "";

    switch (eventType) {
      case "PushEvent": {
        const commits = event.payload?.commits?.length || 0;
        return `Pushed ${commits} commit${
          commits !== 1 ? "s" : ""
        } to ${repoName}`;
      }
      case "CreateEvent": {
        const refType = event.payload?.ref_type || "";
        return `Created ${refType} in ${repoName}`;
      }
      case "ForkEvent":
        return `Forked ${repoName}`;
      case "WatchEvent":
        return `Starred ${repoName}`;
      case "IssuesEvent": {
        const issueAction = event.payload?.action || "";
        return `${
          issueAction.charAt(0).toUpperCase() + issueAction.slice(1)
        } issue in ${repoName}`;
      }
      case "PullRequestEvent": {
        const prAction = event.payload?.action || "";
        return `${
          prAction.charAt(0).toUpperCase() + prAction.slice(1)
        } pull request in ${repoName}`;
      }
      default:
        return `${eventType.replace("Event", "")} in ${repoName}`;
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientIP =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Rate limiting check
  if (!rateLimiter.isAllowed(clientIP)) {
    return NextResponse.json(
      { error: "Too many requests", message: "Please try again later" },
      {
        status: 429,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Retry-After": "60",
        },
      },
    );
  }

  const dataType = validateDataType(searchParams.get("type"));

  try {
    const fetcher = new GitHubDataFetcher();
    let data: GitHubApiResponse = {};

    switch (dataType) {
      case "profile":
        data = { profile: await fetcher.fetchProfile() };
        break;
      case "repos":
        data = { repositories: await fetcher.fetchRepositories() };
        break;
      case "stats":
        data = { stats: await fetcher.fetchStats() };
        break;
      case "activity":
        data = { activity: await fetcher.fetchRecentActivity() };
        break;
      case "all":
      default: {
        const [profile, repos, stats, activity] = await Promise.all([
          fetcher.fetchProfile(),
          fetcher.fetchRepositories(),
          fetcher.fetchStats(),
          fetcher.fetchRecentActivity(),
        ]);

        const highlights = fetcher.buildHighlights(profile, stats);

        data = {
          profile,
          repositories: repos,
          stats,
          activity,
          highlights,
          lastUpdated: new Date().toISOString(),
        };
        break;
      }
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      },
    });
  } catch (error) {
    console.error("GitHub API Error:", error);

    // Sanitized error response
    const errorDetails = {
      error: "Failed to fetch GitHub data",
      message: sanitizeErrorMessage(error),
      timestamp: new Date().toISOString(),
      dataType: dataType,
    };

    return NextResponse.json(errorDetails, {
      status: 500,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  }
}
