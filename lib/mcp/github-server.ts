/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import { McpServer } from "@modelcontextprotocol/server";
import type { CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";
import { mcpConfig } from "@/data/configs/mcp";
import {
  GITHUB_ACTIVITY_MAX,
  getGitHubActivity,
  getGitHubOverview,
  toGitHubErrorCode,
} from "@/lib/github/service";
import { getPortfolioVersion } from "@/lib/utils";
import type { GitHubFetchMeta } from "@/types/configs/github";

/**
 * Public, read-only MCP server over the portfolio owner's GitHub account.
 *
 * The username comes from the environment, never from tool input, so the
 * endpoint cannot be used as a general GitHub proxy on this token. All data is
 * public: lib/github filters private repositories out before it gets here.
 */

const languageSchema = z.object({
  name: z.string(),
  color: z.string().nullable(),
});

const profileSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string(),
  url: z.string(),
  createdAt: z.string(),
  location: z.string().nullable(),
  company: z.string().nullable(),
  websiteUrl: z.string().nullable(),
});

const statsSchema = z.object({
  publicRepos: z.number(),
  totalStars: z.number(),
  totalForks: z.number(),
  followers: z.number(),
  following: z.number(),
  contributionsLastYear: z.number(),
});

const repositoriesSchema = z.object({
  source: z.enum(["pinned", "recent"]),
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string().nullable(),
      url: z.string(),
      homepageUrl: z.string().nullable(),
      stars: z.number(),
      forks: z.number(),
      pushedAt: z.string().nullable(),
      language: languageSchema.nullable(),
      topics: z.array(z.string()),
    }),
  ),
});

const activitySchema = z.object({
  activity: z.array(
    z.object({
      id: z.string(),
      kind: z.string(),
      type: z.string(),
      repo: z.string(),
      createdAt: z.string(),
      ref: z.string().nullable(),
      refType: z.string().nullable(),
      action: z.string().nullable(),
      number: z.number().nullable(),
    }),
  ),
});

const readOnly = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: true,
} as const;

function toolResult(
  data: Record<string, unknown>,
  meta: GitHubFetchMeta,
): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data) }],
    structuredContent: data,
    _meta: { [mcpConfig.upstreamMetaKey]: meta },
  };
}

function toolError(error: unknown): CallToolResult {
  console.error("GitHub MCP tool error:", error);
  return {
    content: [{ type: "text", text: toGitHubErrorCode(error) }],
    isError: true,
  };
}

async function fromOverview(
  pick: (
    overview: Awaited<ReturnType<typeof getGitHubOverview>>["data"],
  ) => Record<string, unknown>,
): Promise<CallToolResult> {
  try {
    const { data, meta } = await getGitHubOverview();
    return toolResult(pick(data), meta);
  } catch (error) {
    return toolError(error);
  }
}

export function createGitHubMcpServer(): McpServer {
  const server = new McpServer(
    { name: mcpConfig.serverName, version: getPortfolioVersion() },
    {
      instructions:
        "Read-only access to the public GitHub profile of the owner of coldbydefault.com: profile, statistics, language breakdown, pinned repositories and recent public activity. Results may be served from a cache of up to ten minutes; each result's _meta says whether it came live from GitHub or from cache.",
    },
  );

  server.registerTool(
    "get_profile",
    {
      title: "GitHub profile",
      description:
        "Public GitHub profile: name, handle, bio, avatar, location, company, website and account creation date.",
      outputSchema: profileSchema,
      annotations: readOnly,
    },
    () => fromOverview((o) => ({ ...o.profile })),
  );

  server.registerTool(
    "get_stats",
    {
      title: "GitHub statistics",
      description:
        "Public repository count, total stars and forks across owned public repositories, followers, following, and contributions over the last year.",
      outputSchema: statsSchema,
      annotations: readOnly,
    },
    () => fromOverview((o) => ({ ...o.stats })),
  );

  server.registerTool(
    "get_languages",
    {
      title: "Language breakdown",
      description:
        "Languages across owned public, non-fork repositories. Each repository counts equally and is split by its own byte ratio; share is a fraction between 0 and 1.",
      outputSchema: z.object({
        languages: z.array(languageSchema.extend({ share: z.number() })),
      }),
      annotations: readOnly,
    },
    () => fromOverview((o) => ({ languages: o.languages })),
  );

  server.registerTool(
    "get_repositories",
    {
      title: "Featured repositories",
      description:
        "The repositories pinned on the profile, or the most recently pushed public repositories when none are pinned (see `source`).",
      outputSchema: repositoriesSchema,
      annotations: readOnly,
    },
    () => fromOverview((o) => ({ ...o.repositories })),
  );

  server.registerTool(
    "get_recent_activity",
    {
      title: "Recent public activity",
      description:
        "Most recent public GitHub events (pushes, pull requests, branches, releases, stars, …) as structured records, newest first.",
      inputSchema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(GITHUB_ACTIVITY_MAX)
          .default(10)
          .describe("How many events to return."),
      }),
      outputSchema: activitySchema,
      annotations: readOnly,
    },
    async ({ limit }) => {
      try {
        const { data, meta } = await getGitHubActivity(limit);
        return toolResult({ activity: data }, meta);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}
