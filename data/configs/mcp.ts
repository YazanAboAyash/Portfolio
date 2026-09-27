/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

/** Identifiers shared by the GitHub MCP server (`/api/mcp`) and the in-page client. */
export const mcpConfig = {
  endpointPath: "/api/mcp",
  serverName: "coldbydefault-github",
  clientName: "coldbydefault-portfolio",
  /**
   * `_meta` key on every tool result carrying where the data came from
   * (live GitHub call or cache) and the upstream requests behind it.
   */
  upstreamMetaKey: "com.coldbydefault/upstream",
} as const;
