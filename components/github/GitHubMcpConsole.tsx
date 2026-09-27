/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

"use client";

import { useState } from "react";
import { FaTerminal } from "react-icons/fa";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/Drawer";
import { mcpConfig } from "@/data/configs/mcp";
import { useGitHubMcpSession } from "@/hooks/use-github-mcp-session";
import type { McpLogEntry } from "@/types/configs/mcp";
import { githubCopy } from "./GitHub.constants";
import { describeUpstream, formatNumber } from "./GitHub.utils";

function prettyJson(body: string): string {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function LogLine({ entry }: { entry: McpLogEntry }) {
  switch (entry.kind) {
    case "exchange": {
      const rpc = [entry.rpcMethod, entry.toolName].filter(Boolean).join(" ");
      const ok = entry.status < 400;
      return (
        <div className="mb-1">
          <span className="text-gray-500">$</span>{" "}
          <span className="text-sky-400">
            {entry.httpMethod} {mcpConfig.endpointPath}
          </span>
          {rpc && <span className="text-green-400"> · {rpc}</span>}{" "}
          <span className={ok ? "text-green-400" : "text-red-400"}>
            → {entry.status}
          </span>{" "}
          <span className="text-gray-500">
            {formatNumber(entry.durationMs)} ms
          </span>
          {(entry.requestBody || entry.responseBody) && (
            <details className="ml-4">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-300 select-none">
                {githubCopy.mcp.showJson}
              </summary>
              {entry.requestBody && (
                <>
                  <div className="text-gray-500 mt-1">
                    {githubCopy.mcp.request}
                  </div>
                  <pre className="whitespace-pre-wrap break-all text-gray-300">
                    {prettyJson(entry.requestBody)}
                  </pre>
                </>
              )}
              {entry.responseBody && (
                <>
                  <div className="text-gray-500 mt-1">
                    {githubCopy.mcp.response}
                  </div>
                  <pre className="whitespace-pre-wrap break-all text-gray-300">
                    {prettyJson(entry.responseBody)}
                  </pre>
                </>
              )}
            </details>
          )}
        </div>
      );
    }
    case "connected":
      return (
        <div className="mb-1 text-green-400">
          ✓ {entry.serverName} v{entry.serverVersion} · protocol{" "}
          {entry.protocolVersion}
        </div>
      );
    case "tools":
      return (
        <div className="mb-1 text-green-400">
          ✓ {entry.names.length} tools: {entry.names.join(", ")}
        </div>
      );
    case "result":
      return (
        <div className="mb-1">
          {entry.errorCode ? (
            <div className="text-red-400">
              ✗ {entry.toolName}: {entry.errorCode}
            </div>
          ) : (
            <div className="text-green-400">✓ {entry.toolName}</div>
          )}
          {entry.upstream &&
            describeUpstream(entry.upstream).map((line) => (
              <div key={line} className="ml-4 text-yellow-300/80">
                {line}
              </div>
            ))}
        </div>
      );
    case "done":
      return (
        <div className="mt-2 text-green-400">
          ✓ {formatNumber(entry.requests)} HTTP requests in{" "}
          {formatNumber(entry.totalMs)} ms · session closed
        </div>
      );
    case "failed":
      return (
        <div className="mt-2 text-red-400">✗ {githubCopy.mcp.failed}</div>
      );
  }
}

export default function GitHubMcpConsole() {
  const { entries, status, run } = useGitHubMcpSession();
  const [copied, setCopied] = useState(false);
  const endpointUrl =
    typeof window === "undefined"
      ? mcpConfig.endpointPath
      : new URL(mcpConfig.endpointPath, window.location.origin).toString();

  const copyEndpoint = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(endpointUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the URL stays visible and selectable.
    }
  };

  const buttonLabel =
    status === "running"
      ? githubCopy.mcp.running
      : status === "idle"
        ? githubCopy.mcp.start
        : githubCopy.mcp.restart;

  return (
    <Drawer>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DrawerTrigger asChild>
              <Button variant="default" size="sm" className="cursor-pointer">
                <FaTerminal className="mr-2 h-4 w-4" />
                {githubCopy.mcp.trigger}
              </Button>
            </DrawerTrigger>
          </TooltipTrigger>
          <TooltipContent className="hidden lg:block">
            <p>{githubCopy.mcp.triggerHint}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DrawerContent>
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle>{githubCopy.mcp.title}</DrawerTitle>
            <DrawerDescription>{githubCopy.mcp.description}</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 flex-1 space-y-4">
            <Button
              onClick={() => void run()}
              disabled={status === "running"}
              className="w-full cursor-pointer"
            >
              {buttonLabel}
            </Button>

            <div
              className="bg-black rounded-lg p-4 h-72 overflow-y-auto font-mono text-xs"
              aria-live="polite"
            >
              {entries.length === 0 && status !== "running" && (
                <div className="text-green-400">
                  <span className="text-gray-500">$</span>{" "}
                  {githubCopy.mcp.idle} {endpointUrl}
                </div>
              )}
              {entries.map((entry, index) => (
                <LogLine key={index} entry={entry} />
              ))}
              {status === "running" && (
                <div className="text-yellow-400 animate-pulse">
                  <span className="text-gray-500">$</span> …
                </div>
              )}
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-sm font-medium">
                  {githubCopy.mcp.connectTitle}
                </span>
                <span className="text-xs text-muted-foreground">
                  {githubCopy.mcp.connectHint}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
                  {endpointUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer shrink-0"
                  onClick={() => void copyEndpoint()}
                >
                  {copied ? (
                    <Check className="mr-1 h-3 w-3" />
                  ) : (
                    <Copy className="mr-1 h-3 w-3" />
                  )}
                  {copied ? githubCopy.mcp.copied : githubCopy.mcp.copy}
                </Button>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="cursor-pointer">
                {githubCopy.mcp.close}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
