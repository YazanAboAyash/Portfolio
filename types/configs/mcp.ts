/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type {
  GitHubDeclaredHighlight,
  GitHubFetchMeta,
  GitHubProfile,
} from "@/types/configs/github";

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

/** Output of `get_profile`: the live profile plus the facts declared in `data/`. */
export interface McpGitHubProfile extends GitHubProfile {
  highlights: Array<Pick<GitHubDeclaredHighlight, "label" | "link">>;
}

/** One item of `get_projects`, with translation keys already resolved to English. */
export interface McpProject {
  title: string;
  description: string;
  category: string;
  technologies: string[];
  license: string | null;
  githubUrl: string;
  liveUrl: string | null;
  npmUrl: string | null;
}

/** One item of `get_capabilities`. */
export interface McpCapability {
  id: string;
  title: string;
  headline: string;
  description: string;
  technologies: string[];
}

/** One item of `get_certifications`. */
export interface McpCertification {
  title: string;
  issuer: string;
  date: string;
  description: string;
}

/** What one tool call through the "Ask this site" console returned. */
export interface McpToolCallResult {
  /** The tool this result belongs to; it can differ from a newer call in flight. */
  toolName: string;
  /** Typed output, validated by the client against the tool's output schema. */
  structuredContent: Record<string, unknown> | null;
  upstream: GitHubFetchMeta | null;
  /** The error text the server returned with `isError`, if any. */
  errorCode: string | null;
  /** The whole `CallToolResult`, for the raw JSON view. */
  raw: unknown;
}

export interface McpToolCallState {
  status: McpSessionStatus;
  toolName: string | null;
  result: McpToolCallResult | null;
  durationMs: number | null;
}
