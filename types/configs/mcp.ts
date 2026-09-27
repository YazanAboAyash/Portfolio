/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type { GitHubFetchMeta } from "@/types/configs/github";

export type McpSessionStatus = "idle" | "running" | "done" | "error";

/** One real HTTP round trip between the in-page client and /api/mcp. */
export interface McpExchangeEntry {
  kind: "exchange";
  httpMethod: string;
  rpcMethod: string | null;
  toolName: string | null;
  status: number;
  durationMs: number;
  requestBody: string | null;
  responseBody: string | null;
}

export interface McpConnectedEntry {
  kind: "connected";
  protocolVersion: string;
  serverName: string;
  serverVersion: string;
}

export interface McpToolsEntry {
  kind: "tools";
  names: string[];
}

export interface McpResultEntry {
  kind: "result";
  toolName: string;
  errorCode: string | null;
  upstream: GitHubFetchMeta | null;
}

export interface McpDoneEntry {
  kind: "done";
  requests: number;
  totalMs: number;
}

export interface McpFailedEntry {
  kind: "failed";
}

export type McpLogEntry =
  | McpExchangeEntry
  | McpConnectedEntry
  | McpToolsEntry
  | McpResultEntry
  | McpDoneEntry
  | McpFailedEntry;
