/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Check, Copy, Cpu } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { RevealGroup, RevealItem, ScrambleText } from "@/components/visuals";
import { mcpConfig } from "@/data/configs/mcp";
import { useMcpToolCall } from "@/hooks/use-github-mcp-session";
import { useMeasuredHeight } from "@/hooks/use-measured-height";
import type { GitHubRepoList, GitHubStats } from "@/types/configs/github";
import type {
  McpCapability,
  McpCertification,
  McpGitHubProfile,
  McpProject,
} from "@/types/configs/mcp";
import GitHubMcpConsole from "./GitHubMcpConsole";
import { githubCopy } from "./GitHub.constants";
import { describeUpstream, formatDate, formatNumber } from "./GitHub.utils";

const copy = githubCopy.ask;

type ToolName = keyof typeof copy.tools;

/** Called once the console scrolls into view, so it never opens empty. */
const FIRST_TOOL: ToolName = "get_projects";

/** The server answers failed calls with a bare code; show its sentence instead. */
function describeError(code: string | null | undefined): string {
  return code === "RATE_LIMIT_EXCEEDED" || code === "SERVICE_UNAVAILABLE"
    ? githubCopy.errors[code]
    : copy.failed;
}

const STAT_KEYS = Object.keys(copy.statLabels) as Array<
  keyof typeof copy.statLabels
>;

/**
 * Readable rendering of a tool's structured output. The client SDK has
 * already validated it against the tool's output schema, so the casts below
 * only name shapes the server guarantees.
 */
function Readable({
  tool,
  data,
}: {
  tool: string;
  data: Record<string, unknown>;
}) {
  if (tool === "get_projects") {
    const { items } = data as unknown as { items: McpProject[] };
    return (
      <RevealGroup as="ul" className="flex flex-col gap-5">
        {items.map((project) => (
          <RevealItem
            as="li"
            key={project.title}
            className="flex flex-col gap-0.5"
          >
            <a
              href={project.liveUrl ?? project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-lg font-semibold underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {project.title}
            </a>
            <span>{project.description}</span>
            <span className="text-sm text-muted-foreground">
              {[project.category, ...project.technologies].join(" · ")}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    );
  }

  if (tool === "get_capabilities") {
    const { items } = data as unknown as { items: McpCapability[] };
    return (
      <RevealGroup as="ul" className="flex flex-col gap-6">
        {items.map((capability) => (
          <RevealItem
            as="li"
            key={capability.id}
            className="flex flex-col gap-1"
          >
            <h4 className="text-lg font-semibold">
              {capability.title} · {capability.headline}
            </h4>
            <p className="max-w-[60ch]">{capability.description}</p>
            <span className="text-sm text-muted-foreground">
              {capability.technologies.join(" · ")}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    );
  }

  if (tool === "get_certifications") {
    const { items } = data as unknown as { items: McpCertification[] };
    return (
      <RevealGroup as="ul" className="flex flex-col gap-5">
        {items.map((certification) => (
          <RevealItem
            as="li"
            key={certification.title}
            className="flex flex-col gap-0.5"
          >
            <b className="text-lg font-semibold">{certification.title}</b>
            <span className="text-sm text-muted-foreground tabular-nums">
              {certification.issuer} · {certification.date}
            </span>
            <span className="max-w-[60ch]">{certification.description}</span>
          </RevealItem>
        ))}
      </RevealGroup>
    );
  }

  if (tool === "get_stats") {
    const stats = data as unknown as GitHubStats;
    return (
      <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
        {STAT_KEYS.map((key) => (
          <RevealItem key={key}>
            <b className="block text-5xl font-bold leading-none tracking-[-0.03em] tabular-nums">
              {formatNumber(stats[key])}
            </b>
            <span className="mt-2 block text-sm">{copy.statLabels[key]}</span>
          </RevealItem>
        ))}
      </RevealGroup>
    );
  }

  if (tool === "get_profile") {
    const profile = data as unknown as McpGitHubProfile;
    const displayName = profile.name ?? profile.login;
    const rows: Array<[string, string | null]> = [
      [copy.profile.company, profile.company],
      [copy.profile.location, profile.location],
      [copy.profile.website, profile.websiteUrl],
      [copy.profile.since, formatDate(profile.createdAt)],
    ];
    return (
      <RevealGroup className="flex flex-col gap-5">
        <RevealItem className="flex items-center gap-4">
          {/* GitHub keeps the same avatar URL when the picture changes, so the
              image optimizer's one-year cache (next.config.ts) would pin the
              old one. `unoptimized` loads it from GitHub's CDN, which
              revalidates within minutes. */}
          <Image
            width={64}
            height={64}
            src={profile.avatarUrl}
            alt={`${copy.profile.avatarAlt} ${displayName}`}
            className="h-16 w-16 rounded-full"
            unoptimized
          />
          <div>
            <h4 className="text-2xl font-bold leading-tight tracking-[-0.015em]">
              {displayName}
            </h4>
            <span className="text-muted-foreground">@{profile.login}</span>
          </div>
        </RevealItem>
        {profile.bio && (
          <RevealItem>
            <p className="max-w-[56ch]">{profile.bio}</p>
          </RevealItem>
        )}
        <RevealItem>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
            {rows
              .filter((row): row is [string, string] => Boolean(row[1]))
              .map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="font-semibold">{label}</dt>
                  <dd className="min-w-0 wrap-break-word">{value}</dd>
                </div>
              ))}
          </dl>
        </RevealItem>
        {profile.highlights.length > 0 && (
          <RevealItem className="flex flex-col gap-2">
            <h5 className="font-semibold">{copy.profile.highlights}</h5>
            {profile.highlights.map((highlight) => (
              <a
                key={highlight.link}
                href={highlight.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-2 underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground"
              >
                <Cpu className="h-4 w-4 shrink-0" aria-hidden="true" />
                {highlight.label}
              </a>
            ))}
          </RevealItem>
        )}
        <RevealItem>
          <a
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-fit items-center gap-2 bg-primary px-5 font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <FaGithub className="h-4 w-4" aria-hidden="true" />
            {copy.profile.viewProfile}
          </a>
        </RevealItem>
      </RevealGroup>
    );
  }

  if (tool === "get_repositories") {
    const { items } = data as unknown as GitHubRepoList;
    return (
      <RevealGroup as="ul" className="flex flex-col gap-5">
        {items.map((repo) => (
          <RevealItem as="li" key={repo.name} className="flex flex-col gap-0.5">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-lg font-semibold underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {repo.name}
            </a>
            <span>{repo.description ?? copy.noDescription}</span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {repo.language ? `${repo.language.name} · ` : ""}
              {formatNumber(repo.stars)} ★
              {repo.pushedAt
                ? ` · ${copy.lastPush} ${formatDate(repo.pushedAt)}`
                : ""}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    );
  }

  return null;
}

/**
 * "Ask this site": run one of the public MCP server's tools from the page and
 * read exactly what an agent receives, readable or as raw JSON. The full
 * protocol log stays one click away in {@link GitHubMcpConsole}.
 */
export default function GitHubAskConsole() {
  const { status, toolName, result, durationMs, call } = useMcpToolCall();
  const [view, setView] = useState<"readable" | "raw">("readable");
  const [copied, setCopied] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const inView = useInView(consoleRef, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [measureBody, bodyHeight] = useMeasuredHeight<HTMLDivElement>();

  useEffect(() => {
    if (inView) void call(FIRST_TOOL);
  }, [inView, call]);

  const copyUrl = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(mcpConfig.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the URL stays visible and selectable.
    }
  };

  const toggleClass = (on: boolean) =>
    `cursor-pointer px-3 py-1.5 text-sm font-semibold transition-colors ${
      on ? "bg-background" : "hover:bg-background/60"
    }`;

  return (
    <div
      id="mcp"
      className="grid scroll-mt-20 grid-cols-12 gap-x-6 gap-y-10"
      aria-labelledby="mcp-title"
      role="region"
    >
      <div className="col-span-12 flex min-w-0 flex-col gap-7 lg:col-span-5">
        <h2
          id="mcp-title"
          className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
        >
          <ScrambleText text={copy.title} />
        </h2>
        <p className="max-w-[44ch] text-base leading-relaxed sm:text-lg">
          {copy.intro}
        </p>

        <div
          aria-label={copy.toolsLabel}
          role="group"
          className="flex flex-col gap-5"
        >
          {copy.toolGroups.map((group) => (
            <div
              key={group.label}
              role="group"
              aria-labelledby={`mcp-group-${group.label}`}
              className="flex flex-col gap-1.5"
            >
              <h3
                id={`mcp-group-${group.label}`}
                className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                {group.label}
              </h3>
              {group.tools.map((name) => {
                const pressed = name === toolName;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => void call(name)}
                    className={`grid cursor-pointer grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left transition-[background-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                      pressed
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface hover:translate-x-1 hover:bg-surface-2 motion-reduce:hover:translate-x-0"
                    }`}
                  >
                    <span>
                      <b className="block text-lg font-semibold">
                        {copy.tools[name].label}
                      </b>
                      <span className="block text-base">
                        {copy.tools[name].hint}
                      </span>
                    </span>
                    <code className="font-mono text-sm">{name}</code>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex min-w-0 flex-col gap-2.5">
          <h3 className="text-base font-bold">{copy.addTitle}</h3>
          <p className="text-sm">{copy.addHint}</p>
          <div className="flex min-w-0 items-stretch bg-surface">
            <pre className="min-w-0 flex-1 overflow-x-auto px-4 py-3.5">
              <code className="font-mono text-sm">{mcpConfig.publicUrl}</code>
            </pre>
            <button
              type="button"
              onClick={() => void copyUrl()}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copied ? copy.copied : copy.copy}
            </button>
          </div>
        </div>

        {/* The full protocol log: initialize, tools/list, every call. */}
        <div>
          <GitHubMcpConsole />
        </div>
      </div>

      <div
        ref={consoleRef}
        data-ui
        className="col-span-12 flex min-w-0 flex-col bg-surface lg:col-span-7 lg:self-start"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-2 px-5 py-3">
          <code className="font-mono text-sm">
            POST {mcpConfig.endpointPath} · tools/call
            {toolName ? ` · ${toolName}` : ""}
          </code>
          <div
            role="group"
            aria-label={copy.viewLabel}
            className="flex gap-1 bg-surface-2 p-1"
          >
            <button
              type="button"
              aria-pressed={view === "readable"}
              onClick={() => setView("readable")}
              className={toggleClass(view === "readable")}
            >
              {copy.readable}
            </button>
            <button
              type="button"
              aria-pressed={view === "raw"}
              onClick={() => setView("raw")}
              className={toggleClass(view === "raw")}
            >
              {copy.raw}
            </button>
          </div>
        </div>

        {/* The panel takes the height of its result and glides between them. */}
        <m.div
          initial={false}
          animate={{ height: bodyHeight ?? "auto" }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }
          }
          className="min-w-0 overflow-hidden"
        >
          <div
            ref={measureBody}
            className="px-5 py-6"
            aria-live="polite"
            aria-busy={status === "running"}
          >
            {status === "error" ? (
              <p className="text-base">{describeError(result?.errorCode)}</p>
            ) : result?.structuredContent ? (
              // The last result stays, dimmed, while the next call runs.
              <div
                className={`transition-opacity duration-200 ${
                  status === "running" ? "opacity-40" : ""
                }`}
              >
                {view === "raw" ? (
                  <pre className="max-h-160 overflow-auto font-mono text-[0.8125rem] leading-relaxed">
                    <code>{JSON.stringify(result.raw, null, 2)}</code>
                  </pre>
                ) : (
                  <Readable
                    key={result.toolName}
                    tool={result.toolName}
                    data={result.structuredContent}
                  />
                )}
              </div>
            ) : status === "running" ? (
              <p className="text-base">
                {copy.calling} {toolName} …
              </p>
            ) : (
              <p className="text-base">{copy.idle}</p>
            )}
          </div>
        </m.div>

        <div className="flex flex-col gap-1 border-t border-surface-2 px-5 py-3 text-sm">
          {status === "running" ? (
            <span>
              {copy.calling} {toolName} …
            </span>
          ) : status !== "done" ? (
            <span>{mcpConfig.publicUrl}</span>
          ) : result?.upstream ? (
            describeUpstream(result.upstream).map((line) => (
              <span key={line}>{line}</span>
            ))
          ) : (
            <span>{copy.siteData}</span>
          )}
          {status === "done" && durationMs !== null && (
            <span className="text-muted-foreground">
              {formatNumber(durationMs)} ms {copy.tookMs}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
