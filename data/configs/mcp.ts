/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

/** Identifiers shared by the portfolio MCP server (`/api/mcp`) and the in-page client. */
export const mcpConfig = {
  endpointPath: "/api/mcp",
  /**
   * The URL shown to visitors for their own MCP clients — always production,
   * even on localhost. The apex domain, since `www` answers with a redirect.
   */
  publicUrl: "https://coldbydefault.com/api/mcp",
  serverName: "coldbydefault",
  clientName: "coldbydefault-portfolio",
  /**
   * `_meta` key on every tool result carrying where the data came from
   * (live GitHub call or cache) and the upstream requests behind it.
   */
  upstreamMetaKey: "com.coldbydefault/upstream",
} as const;
