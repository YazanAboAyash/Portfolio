/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useCallback, useRef, useState } from "react";
import type { FetchLike } from "@modelcontextprotocol/client";
import { mcpConfig } from "@/data/configs/mcp";
import { getPortfolioVersion } from "@/lib/utils";
import type { GitHubFetchMeta } from "@/types/configs/github";
import type {
  McpExchangeEntry,
  McpLogEntry,
  McpSessionStatus,
  McpToolCallState,
} from "@/types/configs/mcp";

function describeRpc(
  body: string | null,
): Pick<McpExchangeEntry, "rpcMethod" | "toolName"> {
  if (body === null) return { rpcMethod: null, toolName: null };
  try {
    const message = JSON.parse(body) as {
      method?: unknown;
      params?: { name?: unknown };
    };
    return {
      rpcMethod: typeof message.method === "string" ? message.method : null,
      toolName:
        typeof message.params?.name === "string" ? message.params.name : null,
    };
  } catch {
    return { rpcMethod: null, toolName: null };
  }
}

function readUpstream(meta: unknown): GitHubFetchMeta | null {
  if (typeof meta !== "object" || meta === null) return null;
  const value = (meta as Record<string, unknown>)[mcpConfig.upstreamMetaKey];
  return typeof value === "object" && value !== null && "source" in value
    ? (value as GitHubFetchMeta)
    : null;
}

/**
 * Runs a real MCP session from the browser against `/api/mcp` with the
 * official client SDK, and records every HTTP exchange as it happens.
 *
 * Tools are discovered with `tools/list` and every tool without required
 * arguments is called — nothing about the server is assumed up front. The SDK
 * is imported on demand so it never weighs on the page until a session starts.
 */
export function useGitHubMcpSession() {
  const [entries, setEntries] = useState<McpLogEntry[]>([]);
  const [status, setStatus] = useState<McpSessionStatus>("idle");
  const running = useRef(false);

  const run = useCallback(async (): Promise<void> => {
    if (running.current) return;
    running.current = true;
    setEntries([]);
    setStatus("running");

    const append = (entry: McpLogEntry) =>
      setEntries((prev) => [...prev, entry]);
    const started = performance.now();
    let requests = 0;

    const loggingFetch: FetchLike = async (input, init) => {
      const requestStarted = performance.now();
      const response = await fetch(input, init);
      requests++;
      const requestBody = typeof init?.body === "string" ? init.body : null;
      const isJson =
        response.headers.get("content-type")?.includes("application/json") ??
        false;
      append({
        kind: "exchange",
        httpMethod: init?.method ?? "GET",
        ...describeRpc(requestBody),
        status: response.status,
        durationMs: Math.round(performance.now() - requestStarted),
        requestBody,
        responseBody: isJson ? await response.clone().text() : null,
      });
      return response;
    };

    const { Client, StreamableHTTPClientTransport } =
      await import("@modelcontextprotocol/client");
    const client = new Client(
      { name: mcpConfig.clientName, version: getPortfolioVersion() },
      { versionNegotiation: { mode: "auto" } },
    );
    const transport = new StreamableHTTPClientTransport(
      new URL(mcpConfig.endpointPath, window.location.origin),
      { fetch: loggingFetch },
    );

    try {
      await client.connect(transport);
      const server = client.getServerVersion();
      append({
        kind: "connected",
        protocolVersion: client.getNegotiatedProtocolVersion() ?? "",
        serverName: server?.name ?? "",
        serverVersion: server?.version ?? "",
      });

      const { tools } = await client.listTools();
      append({ kind: "tools", names: tools.map((tool) => tool.name) });

      for (const tool of tools) {
        if ((tool.inputSchema.required ?? []).length > 0) continue;
        const result = await client.callTool({ name: tool.name, arguments: {} });
        const firstContent = result.content[0];
        append({
          kind: "result",
          toolName: tool.name,
          errorCode:
            result.isError === true && firstContent?.type === "text"
              ? firstContent.text
              : null,
          upstream: readUpstream(result._meta),
        });
      }

      append({
        kind: "done",
        requests,
        totalMs: Math.round(performance.now() - started),
      });
      setStatus("done");
    } catch (error) {
      console.error("MCP session failed:", error);
      append({ kind: "failed" });
      setStatus("error");
    } finally {
      await client.close().catch(() => undefined);
      running.current = false;
    }
  }, []);

  return { entries, status, run };
}

/**
 * Calls a single tool on `/api/mcp` and keeps its result, for the "Ask this
 * site" console. Each call opens its own short session (initialize, call,
 * close), exactly what an outside MCP client does. A newer call supersedes one
 * still in flight.
 */
export function useMcpToolCall() {
  const [state, setState] = useState<McpToolCallState>({
    status: "idle",
    toolName: null,
    result: null,
    durationMs: null,
  });
  const latest = useRef(0);

  const call = useCallback(async (toolName: string): Promise<void> => {
    const id = ++latest.current;
    setState((prev) => ({ ...prev, status: "running", toolName }));
    const started = performance.now();

    const { Client, StreamableHTTPClientTransport } =
      await import("@modelcontextprotocol/client");
    const client = new Client(
      { name: mcpConfig.clientName, version: getPortfolioVersion() },
      { versionNegotiation: { mode: "auto" } },
    );
    const transport = new StreamableHTTPClientTransport(
      new URL(mcpConfig.endpointPath, window.location.origin),
    );

    try {
      await client.connect(transport);
      const result = await client.callTool({ name: toolName, arguments: {} });
      if (id !== latest.current) return;
      const firstContent = result.content[0];
      const errorCode =
        result.isError === true && firstContent?.type === "text"
          ? firstContent.text
          : null;
      setState({
        status: errorCode ? "error" : "done",
        toolName,
        durationMs: Math.round(performance.now() - started),
        result: {
          toolName,
          structuredContent:
            typeof result.structuredContent === "object" &&
            result.structuredContent !== null
              ? (result.structuredContent as Record<string, unknown>)
              : null,
          upstream: readUpstream(result._meta),
          errorCode,
          raw: result,
        },
      });
    } catch (error) {
      console.error("MCP tool call failed:", error);
      if (id !== latest.current) return;
      setState({
        status: "error",
        toolName,
        durationMs: null,
        result: null,
      });
    } finally {
      await client.close().catch(() => undefined);
    }
  }, []);

  return { ...state, call };
}
