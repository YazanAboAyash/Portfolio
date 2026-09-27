/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

/**
 * UI copy for the GitHub section. Deliberately English-only — this section is
 * not translated, so its copy lives here instead of messages/*.json.
 */

export const GITHUB_LOCALE = "en-US";

/** Languages shown individually before the rest collapse into "Other". */
export const LANGUAGE_BAR_LIMIT = 6;

export const githubCopy = {
  title: "GitHub Activity",
  loading: "Loading GitHub data…",
  retry: "Try again",
  errors: {
    RATE_LIMIT_EXCEEDED:
      "GitHub is rate-limiting requests right now. Please try again in a minute.",
    SERVICE_UNAVAILABLE: "GitHub data is unavailable right now.",
  },
  liveBadge: "Live from GitHub · updated",
  profile: {
    viewProfile: "View profile",
    highlights: "Highlights",
    memberSince: "Member since",
    avatarAlt: "GitHub profile picture of",
  },
  stats: {
    repos: "Repos",
    stars: "Stars",
    followers: "Followers",
    forks: "Forks",
    contributions: "Contributions, last year",
  },
  languages: {
    title: "Languages",
    subtitle: "Share of an average public repository",
    other: "Other",
  },
  repositories: {
    pinned: "Pinned repositories",
    recent: "Recently pushed repositories",
    pushed: "Pushed",
  },
  mcp: {
    trigger: "Live MCP session",
    triggerHint: "Query this profile through the site's own MCP server",
    title: "GitHub MCP server",
    description:
      "Your browser opens a real Model Context Protocol session with this site's MCP server. Every line below is an actual request and its response.",
    start: "Start MCP session",
    running: "Session running…",
    restart: "Run again",
    idle: "Ready. Start a session to call",
    close: "Close",
    connectTitle: "Connect your own MCP client",
    connectHint: "Streamable HTTP · no authentication · read-only",
    copy: "Copy",
    copied: "Copied",
    showJson: "JSON-RPC",
    request: "Request",
    response: "Response",
    failed: "Session failed. The last exchange above shows where.",
  },
} as const;
