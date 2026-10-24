/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { McpServer } from "@modelcontextprotocol/server";
import type { CallToolResult } from "@modelcontextprotocol/server";
import { z } from "zod";
import { githubDeclaredHighlights } from "@/data/configs/githubHighlights";
import { mcpConfig } from "@/data/configs/mcp";
import { projects } from "@/data/hubs/projectsData";
import { capabilities, techIconLabels } from "@/data/main/capabilitiesData";
import { certifications } from "@/data/main/certificationsData";
import { getGitHubOverview, toGitHubErrorCode } from "@/lib/github/service";
import { getPortfolioVersion } from "@/lib/utils";
import enMessages from "@/messages/en.json";
import type { GitHubFetchMeta } from "@/types/configs/github";

/**
 * Public, read-only MCP server over the portfolio: the owner's projects,
 * capabilities and certifications from `data/`, and their GitHub account.
 *
 * The GitHub username comes from the environment, never from tool input, so
 * the endpoint cannot be used as a general GitHub proxy on this token. All data
 * is public: lib/github filters private repositories out before it gets here.
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
  highlights: z.array(z.object({ label: z.string(), link: z.string() })),
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

const projectsSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string(),
      technologies: z.array(z.string()),
      license: z.string().nullable(),
      githubUrl: z.string(),
      liveUrl: z.string().nullable(),
      npmUrl: z.string().nullable(),
    }),
  ),
});

const capabilitiesSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      headline: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
    }),
  ),
});

const certificationsSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      issuer: z.string(),
      date: z.string(),
      description: z.string(),
    }),
  ),
});

const readOnly = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: true,
} as const;

/** Site data never leaves the server, so these tools are closed-world. */
const readOnlySiteData = { ...readOnly, openWorldHint: false } as const;

/**
 * English copy for data that stores translation keys (`Projects.descriptions.x`).
 * MCP clients get one language; a missing key falls back to the path itself.
 */
function message(path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        typeof node === "object" && node !== null
          ? (node as Record<string, unknown>)[key]
          : undefined,
      enMessages,
    );
  return typeof value === "string" ? value : path;
}

function toolResult(
  data: Record<string, unknown>,
  meta?: GitHubFetchMeta,
): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data) }],
    structuredContent: data,
    ...(meta && { _meta: { [mcpConfig.upstreamMetaKey]: meta } }),
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

export function createPortfolioMcpServer(): McpServer {
  const server = new McpServer(
    { name: mcpConfig.serverName, version: getPortfolioVersion() },
    {
      instructions:
        "Read-only access to the portfolio of Yazan Abo-Ayash, the owner of coldbydefault.com: open-source projects, capabilities and certifications from the site itself, plus their public GitHub profile, statistics and pinned repositories. GitHub results may be served from a cache of up to ten minutes; each GitHub result's _meta says whether it came live from GitHub or from cache.",
    },
  );

  server.registerTool(
    "get_projects",
    {
      title: "Projects",
      description:
        "Open-source projects shown on the site: description, category, technologies, license and links (GitHub, live site, npm).",
      outputSchema: projectsSchema,
      annotations: readOnlySiteData,
    },
    () =>
      toolResult({
        items: projects.map((project) => ({
          title: project.title,
          description: message(`Projects.descriptions.${project.description}`),
          category: message(`Projects.categories.${project.category}`),
          technologies: project.technologies,
          license: project.license
            ? message(`Projects.licenses.${project.license.text}`)
            : null,
          githubUrl: project.githubUrl,
          liveUrl: project.liveUrl ?? null,
          npmUrl: project.npmUrl ?? null,
        })),
      }),
  );

  server.registerTool(
    "get_capabilities",
    {
      title: "Capabilities",
      description:
        "What the owner delivers (AI in production, shipping, scaling, security), each with a short pitch and the main technologies used.",
      outputSchema: capabilitiesSchema,
      annotations: readOnlySiteData,
    },
    () =>
      toolResult({
        items: capabilities.map((capability) => ({
          id: capability.id,
          title: message(`Capabilities.${capability.titleKey}`),
          headline: message(`Capabilities.${capability.headlineKey}`),
          description: message(`Capabilities.${capability.descriptionKey}`),
          technologies: (capability.techIcons ?? []).map(
            (icon) => techIconLabels[icon] ?? icon,
          ),
        })),
      }),
  );

  server.registerTool(
    "get_certifications",
    {
      title: "Certifications",
      description:
        "Certifications and qualifications: title, issuing body, year and what each one covers.",
      outputSchema: certificationsSchema,
      annotations: readOnlySiteData,
    },
    () =>
      toolResult({
        items: certifications.map((certification) => ({
          title: certification.title,
          issuer: certification.issuerKey
            ? message(`Certifications.issuers.${certification.issuerKey}`)
            : certification.issuer,
          date: certification.date,
          description: message(
            `Certifications.descriptions.${certification.descriptionKey}`,
          ),
        })),
      }),
  );

  server.registerTool(
    "get_profile",
    {
      title: "GitHub profile",
      description:
        "Public GitHub profile: name, handle, bio, avatar, location, company, website and account creation date, plus highlights GitHub has no API for (such as program memberships).",
      outputSchema: profileSchema,
      annotations: readOnly,
    },
    () =>
      fromOverview((o) => ({
        ...o.profile,
        highlights: githubDeclaredHighlights.map(({ label, link }) => ({
          label,
          link,
        })),
      })),
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

  return server;
}
