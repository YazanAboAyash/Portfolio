/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

/**
 * UI copy for the GitHub section. Deliberately English-only — this section is
 * not translated, so its copy lives here instead of messages/*.json.
 */

export const GITHUB_LOCALE = "en-US";

export const githubCopy = {
  errors: {
    RATE_LIMIT_EXCEEDED:
      "GitHub is rate-limiting requests right now. Please try again in a minute.",
    SERVICE_UNAVAILABLE: "GitHub data is unavailable right now.",
  },
  mcp: {
    trigger: "Live MCP session",
    triggerHint: "Call every tool of the site's own MCP server",
    title: "This site's MCP server",
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
  page: {
    title: "MCP playground",
    description:
      "Call every tool of coldbydefault.com's public MCP server from the browser and see exactly what an AI agent receives.",
  },
  ask: {
    title: "Ask this site",
    /** The /mcp playground. */
    intro:
      "coldbydefault.com runs a public MCP server. AI clients such as Claude can read my projects, capabilities, certifications and GitHub through it. Run one of its tools and see exactly what an agent receives.",
    /** The home page section. */
    introShort:
      "This site runs a public MCP server, so AI agents like Claude can query my work directly. Try the example question or a GitHub tool.",
    toolsLabel: "MCP tools",
    example: {
      label: "Example",
      question: "Which projects use AI?",
      hint: "One get_projects call, answered from its result",
      questionLabel: "Question",
      answer: "open-source projects use AI:",
    },
    toolGroups: [
      {
        label: "Portfolio",
        tools: ["get_projects", "get_capabilities", "get_certifications"],
        onHome: false,
      },
      {
        label: "GitHub",
        tools: ["get_profile", "get_stats", "get_repositories"],
        onHome: true,
      },
    ],
    tools: {
      get_projects: {
        label: "Projects",
        hint: "Open-source work and the stack behind it",
      },
      get_capabilities: {
        label: "Capabilities",
        hint: "What I deliver, and with which tools",
      },
      get_certifications: {
        label: "Certifications",
        hint: "Certificates, issuers and years",
      },
      get_profile: { label: "Profile", hint: "Who is behind the account" },
      get_stats: { label: "Stats", hint: "Repositories, stars, contributions" },
      get_repositories: {
        label: "Featured repositories",
        hint: "Pinned, or the most recently pushed",
      },
    },
    addTitle: "Connect your own MCP client",
    addHint:
      "Add this URL as a remote MCP server in Claude, ChatGPT, Cursor or VS Code. Streamable HTTP, no sign-in, read-only.",
    playground: "Open the full MCP playground",
    copy: "Copy",
    copied: "Copied",
    viewLabel: "Response view",
    readable: "Readable",
    raw: "Raw JSON",
    calling: "Calling",
    idle: "Pick a tool on the left to call it live.",
    /** Below lg the tools sit above the response panel. */
    idleStacked: "Pick a tool above to call it live.",
    failed: "The call failed. Try again in a moment.",
    tookMs: "round trip",
    siteData: "↳ served from the site's own data, no upstream call",
    statLabels: {
      publicRepos: "public repositories",
      totalStars: "stars",
      totalForks: "forks",
      followers: "followers",
      contributionsLastYear: "contributions, last year",
    },
    profile: {
      company: "Company",
      location: "Location",
      website: "Website",
      since: "On GitHub since",
      highlights: "Highlights",
      viewProfile: "View profile on GitHub",
      avatarAlt: "GitHub profile picture of",
    },
    noDescription: "No description",
    lastPush: "last push",
  },
} as const;
