/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { McpServer } from "@modelcontextprotocol/server";
import type { CallToolResult } from "@modelcontextprotocol/server";
import { mcpConfig } from "@/data/configs/mcp";
import { toGitHubErrorCode } from "@/lib/github/service";
import { portfolioTools } from "@/lib/mcp/portfolio-tools";
import { getPortfolioVersion } from "@/lib/utils";
import type { PortfolioTool, PortfolioToolOutput } from "@/types/configs/mcp";

/**
 * Public, read-only MCP server over the portfolio. The tools themselves live in
 * `portfolio-tools.ts`, shared with Reem's chat route; this file only exposes
 * them over MCP.
 */

function toolResult({ data, meta }: PortfolioToolOutput): CallToolResult {
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

export function createPortfolioMcpServer(): McpServer {
  const server = new McpServer(
    { name: mcpConfig.serverName, version: getPortfolioVersion() },
    {
      instructions:
        "Read-only access to the portfolio of Yazan Abo-Ayash, the owner of coldbydefault.com: open-source projects, capabilities and certifications from the site itself, plus their public GitHub profile, statistics and pinned repositories. GitHub results may be served from a cache of up to ten minutes; each GitHub result's _meta says whether it came live from GitHub or from cache.",
    },
  );

  for (const [name, tool] of Object.entries<PortfolioTool>(portfolioTools)) {
    server.registerTool(
      name,
      {
        title: tool.title,
        description: tool.description,
        outputSchema: tool.outputSchema,
        annotations: tool.annotations,
      },
      async () => {
        try {
          return toolResult(await tool.load());
        } catch (error) {
          return toolError(error);
        }
      },
    );
  }

  return server;
}
