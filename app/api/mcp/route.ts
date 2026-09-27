/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { getClientIP, RateLimiter } from "@/lib/security";
import { createGitHubMcpServer } from "@/lib/mcp/github-server";

/**
 * Public Streamable HTTP endpoint for the GitHub MCP server. Serves the
 * 2026-07-28 protocol revision and falls back to stateless 2025-era serving,
 * so both current and older MCP clients can connect.
 *
 * No Origin/Host validation: that guards local servers against DNS rebinding,
 * and this one is public, unauthenticated and read-only by design.
 */

export const dynamic = "force-dynamic";

const handler = createMcpHandler(createGitHubMcpServer, {
  // Tools return in one step and emit nothing mid-call, so plain JSON
  // responses lose nothing and keep every exchange a single round trip.
  responseMode: "json",
  maxRequestBodySize: 64 * 1024,
  onerror: (error) => console.error("MCP handler error:", error),
});

// One full client session (discover, tools/list, one call per tool) is well
// under ten requests; this leaves room for a few sessions a minute per caller.
const rateLimiter = new RateLimiter(60_000, 60);

async function handle(request: NextRequest): Promise<Response> {
  if (!rateLimiter.isAllowed(getClientIP(request))) {
    return NextResponse.json(
      { error: "RATE_LIMIT_EXCEEDED" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }
  return handler.fetch(request);
}

export { handle as GET, handle as POST, handle as DELETE };
