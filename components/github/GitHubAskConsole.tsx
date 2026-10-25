/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Copy, Cpu } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { RevealGroup, RevealItem } from "@/components/visuals";
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

/** A tool button, or the example question (answered from `get_projects`). */
type Selection = ToolName | "example";

/** What counts as "uses AI" for the example: matched against category and technologies. */
const AI_PATTERN = /\b(AI|LLM|LangChain)\b/;

/** Below Tailwind's lg the tools stack above the response panel. */
const STACKED_QUERY = "(max-width: 1023px)";

/** The server answers failed calls with a bare code; show its sentence instead. */
function describeError(code: string | null | undefined): string {
  return code === "RATE_LIMIT_EXCEEDED" || code === "SERVICE_UNAVAILABLE"
    ? githubCopy.errors[code]
    : copy.failed;
}

const STAT_KEYS = Object.keys(copy.statLabels) as Array<
  keyof typeof copy.statLabels
>;

/** Phones get a compact readable view; Raw JSON always has the full response. */
const CLAMP_ON_PHONES = "line-clamp-2 md:line-clamp-none";
const TECH_FROM_MD = "hidden text-sm text-muted-foreground md:block";

function ProjectList({ items }: { items: McpProject[] }) {
  return (
    <RevealGroup as="ul" className="flex flex-col gap-5">
      {items.map((project) => (
        <RevealItem as="li" key={project.title} className="flex flex-col gap-0.5">
          <a
            href={project.liveUrl ?? project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-lg font-semibold underline decoration-transparent underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {project.title}
          </a>
          <span className={CLAMP_ON_PHONES}>{project.description}</span>
          <span className={TECH_FROM_MD}>
            {[project.category, ...project.technologies].join(" · ")}
          </span>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

/**
 * The example question, answered the way an agent would: one `get_projects`
 * call, then only the projects whose category or stack mention AI.
 */
function ExampleAnswer({ data }: { data: Record<string, unknown> }) {
  const { items } = data as unknown as { items: McpProject[] };
  const matches = items.filter((project) =>
    [project.category, ...project.technologies].some((value) =>
      AI_PATTERN.test(value),
    ),
  );

  return (
    <div className="flex flex-col gap-5">
      <p className="flex flex-col gap-1">
        <span className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {copy.example.questionLabel}
        </span>
        <span className="text-lg">{copy.example.question}</span>
      </p>
      <p className="text-lg font-semibold">
        {matches.length} of {items.length} {copy.example.answer}
      </p>
      <ProjectList items={matches} />
    </div>
  );
}

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
    return <ProjectList items={items} />;
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
            <p className={`max-w-[60ch] ${CLAMP_ON_PHONES}`}>
              {capability.description}
            </p>
            <span className={TECH_FROM_MD}>
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
            <span className={`max-w-[60ch] ${CLAMP_ON_PHONES}`}>
              {certification.description}
            </span>
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
            <span className={CLAMP_ON_PHONES}>
              {repo.description ?? copy.noDescription}
            </span>
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
 * read exactly what an agent receives, readable or as raw JSON.
 *
 * The home page shows the example question and the GitHub tools (the rest of
 * its data is already on the page) and links to /mcp. The /mcp playground has
 * every tool and the full protocol log in {@link GitHubMcpConsole}.
 */
export default function GitHubAskConsole({
  variant = "home",
}: {
  variant?: "home" | "page";
}) {
  const { status, toolName, result, durationMs, call } = useMcpToolCall();
  // Starts on the example, which runs as soon as the console scrolls into view
  const [selected, setSelected] = useState<Selection>("example");
  const [view, setView] = useState<"readable" | "raw">("readable");
  const [copied, setCopied] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const inView = useInView(consoleRef, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [measureBody, bodyHeight] = useMeasuredHeight<HTMLDivElement>();

  const isPage = variant === "page";
  const Heading = isPage ? "h1" : "h2";
  const toolGroups = copy.toolGroups.filter((group) => isPage || group.onHome);

  const run = useCallback(
    (selection: Selection) => {
      setSelected(selection);
      void call(selection === "example" ? "get_projects" : selection);

      // Below lg the response sits under the tools, often below the fold
      const panel = consoleRef.current;
      if (
        panel &&
        window.matchMedia(STACKED_QUERY).matches &&
        panel.getBoundingClientRect().top > window.innerHeight / 2
      ) {
        panel.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [call, reduceMotion],
  );

  // Run the example once in view, so the panel never opens empty
  useEffect(() => {
    if (inView) void call("get_projects");
  }, [inView, call]);

  const toolButtonClass = (pressed: boolean) =>
    `grid cursor-pointer grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 text-left md:py-4 transition-[background-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
      pressed
        ? "bg-primary text-primary-foreground"
        : "bg-surface hover:translate-x-1 hover:bg-surface-2 motion-reduce:hover:translate-x-0"
    }`;

  const groupLabelClass =
    "text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground";

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
      className="grid scroll-mt-20 grid-cols-12 gap-x-6 gap-y-7 lg:gap-y-10"
      aria-labelledby="mcp-title"
      role="region"
    >
      {/*
        Below lg this column dissolves into the grid so the response panel can
        sit straight under the tools (`order` puts the connect block and the
        live session after it). From lg it is the left column again.
      */}
      <div className="contents lg:col-span-5 lg:flex lg:min-w-0 lg:flex-col lg:gap-7">
        <Heading
          id="mcp-title"
          className="col-span-12 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
        >
          {copy.title}
        </Heading>
        <p className="col-span-12 max-w-[44ch] text-base leading-relaxed sm:text-lg">
          {isPage ? copy.intro : copy.introShort}
        </p>

        <div
          aria-label={copy.toolsLabel}
          role="group"
          className="col-span-12 flex flex-col gap-5"
        >
          <div
            role="group"
            aria-labelledby="mcp-group-example"
            className="flex flex-col gap-1.5"
          >
            <h3 id="mcp-group-example" className={groupLabelClass}>
              {copy.example.label}
            </h3>
            <button
              type="button"
              aria-pressed={selected === "example"}
              onClick={() => run("example")}
              className={toolButtonClass(selected === "example")}
            >
              <span>
                <b className="block text-lg font-semibold">
                  {copy.example.question}
                </b>
                <span className="hidden text-base md:block">
                  {copy.example.hint}
                </span>
              </span>
              <code className="font-mono text-sm">get_projects</code>
            </button>
          </div>

          {toolGroups.map((group) => (
            <div
              key={group.label}
              role="group"
              aria-labelledby={`mcp-group-${group.label}`}
              className="flex flex-col gap-1.5"
            >
              <h3 id={`mcp-group-${group.label}`} className={groupLabelClass}>
                {group.label}
              </h3>
              {group.tools.map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={selected === name}
                  onClick={() => run(name)}
                  className={toolButtonClass(selected === name)}
                >
                  <span>
                    <b className="block text-lg font-semibold">
                      {copy.tools[name].label}
                    </b>
                    <span className="hidden text-base md:block">
                      {copy.tools[name].hint}
                    </span>
                  </span>
                  <code className="font-mono text-sm">{name}</code>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="order-1 col-span-12 flex min-w-0 flex-col gap-2.5 lg:order-0">
          <h3 className="text-base font-bold">{copy.addTitle}</h3>
          <p className="hidden text-sm md:block">{copy.addHint}</p>
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

        {isPage ? (
          // The full protocol log: initialize, tools/list, every call.
          <div className="order-1 col-span-12 lg:order-0">
            <GitHubMcpConsole />
          </div>
        ) : (
          <Link
            href="/mcp"
            className="order-1 col-span-12 inline-flex w-fit items-center gap-2 font-semibold underline decoration-surface-2 decoration-2 underline-offset-4 transition-colors hover:decoration-foreground lg:order-0"
          >
            {copy.playground}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div
        ref={consoleRef}
        data-ui
        className="col-span-12 flex min-w-0 scroll-mt-20 flex-col bg-surface lg:col-span-7 lg:self-start"
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

        {/*
          The panel takes the height of its result and glides between them.
          Nothing animates until the first measurement: going from "auto" to
          px makes framer-motion measure the layout, and it restores the scroll
          position afterwards, which cancels any smooth scroll in progress.
        */}
        <m.div
          initial={false}
          {...(bodyHeight !== null && { animate: { height: bodyHeight } })}
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
                ) : selected === "example" &&
                  result.toolName === "get_projects" ? (
                  <ExampleAnswer data={result.structuredContent} />
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
              <p className="text-base">
                <span className="lg:hidden">{copy.idleStacked}</span>
                <span className="hidden lg:inline">{copy.idle}</span>
              </p>
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
