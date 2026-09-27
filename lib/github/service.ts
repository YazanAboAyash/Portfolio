/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import type {
  GitHubActivity,
  GitHubActivityKind,
  GitHubFetchMeta,
  GitHubFetchResult,
  GitHubGraphQLOverviewResponse,
  GitHubGraphQLRepoNode,
  GitHubLanguageShare,
  GitHubOverview,
  GitHubRepo,
  GitHubRestEvent,
  GitHubUpstreamCall,
} from "@/types/configs/github";

/**
 * Single source of GitHub data for `/api/github` and the `/api/mcp` server.
 *
 * Results are cached in memory per instance so a public MCP endpoint cannot
 * spend the token's rate limit: every caller inside the TTL is served the same
 * snapshot, and the returned meta says so. Fetches bypass Next's data cache on
 * purpose — the cache here is the only one, which keeps `source` truthful.
 */

const API_BASE = "https://api.github.com";
const CACHE_TTL_MS = 10 * 60 * 1000;
const REPO_CARD_LIMIT = 6;
/** Largest page the events API serves; tools slice it down per call. */
const EVENTS_PAGE_SIZE = 30;

export class GitHubConfigError extends Error {}

export class GitHubUpstreamError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

interface GitHubConfig {
  username: string;
  token: string;
}

function getConfig(): GitHubConfig {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;
  // GraphQL rejects anonymous requests, so the token is required, not optional.
  if (!username || !token) {
    throw new GitHubConfigError("GITHUB_USERNAME and GITHUB_TOKEN must be set");
  }
  return { username, token };
}

function headers(token: string): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "coldbydefault-portfolio",
  };
}

function parseRateLimit(response: Response): number | null {
  const value = response.headers.get("x-ratelimit-remaining");
  return value === null ? null : Number(value);
}

async function timedFetch(
  api: GitHubUpstreamCall["api"],
  endpoint: string,
  init: RequestInit,
): Promise<{ response: Response; call: GitHubUpstreamCall }> {
  const started = performance.now();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    cache: "no-store",
  });
  return {
    response,
    call: {
      api,
      endpoint,
      status: response.status,
      durationMs: Math.round(performance.now() - started),
      rateLimitRemaining: parseRateLimit(response),
    },
  };
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  value: T;
  fetchedAt: number;
  calls: GitHubUpstreamCall[];
}

interface CacheSlot<T> {
  entry: CacheEntry<T> | null;
  pending: Promise<CacheEntry<T>> | null;
}

function toMeta(
  entry: CacheEntry<unknown>,
  source: GitHubFetchMeta["source"],
  stale: boolean,
): GitHubFetchMeta {
  return {
    source,
    stale,
    fetchedAt: new Date(entry.fetchedAt).toISOString(),
    ageSeconds: Math.round((Date.now() - entry.fetchedAt) / 1000),
    calls: entry.calls,
  };
}

async function readThrough<T>(
  slot: CacheSlot<T>,
  load: () => Promise<CacheEntry<T>>,
): Promise<GitHubFetchResult<T>> {
  const cached = slot.entry;
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { data: cached.value, meta: toMeta(cached, "cache", false) };
  }

  // Concurrent callers share one upstream request.
  slot.pending ??= load().finally(() => {
    slot.pending = null;
  });

  try {
    const entry = await slot.pending;
    slot.entry = entry;
    return { data: entry.value, meta: toMeta(entry, "github", false) };
  } catch (error) {
    if (cached) {
      return { data: cached.value, meta: toMeta(cached, "cache", true) };
    }
    throw error;
  }
}

const overviewSlot: CacheSlot<GitHubOverview> = { entry: null, pending: null };
const activitySlot: CacheSlot<GitHubActivity[]> = {
  entry: null,
  pending: null,
};

// ---------------------------------------------------------------------------
// Overview (GraphQL)
// ---------------------------------------------------------------------------

const OVERVIEW_QUERY = `
fragment RepoCard on Repository {
  name
  isPrivate
  isFork
  description
  url
  homepageUrl
  stargazerCount
  forkCount
  pushedAt
  primaryLanguage { name color }
  repositoryTopics(first: 5) { nodes { topic { name } } }
  languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
    edges { size node { name color } }
  }
}

query Overview($login: String!, $pinned: Int!) {
  rateLimit { remaining }
  user(login: $login) {
    login
    name
    bio
    avatarUrl(size: 96)
    url
    createdAt
    location
    company
    websiteUrl
    followers { totalCount }
    following { totalCount }
    contributionsCollection { contributionCalendar { totalContributions } }
    pinnedItems(first: $pinned, types: REPOSITORY) { nodes { ...RepoCard } }
    repositories(
      first: 100
      ownerAffiliations: OWNER
      privacy: PUBLIC
      orderBy: { field: PUSHED_AT, direction: DESC }
    ) {
      totalCount
      nodes { ...RepoCard }
    }
  }
}`;

function isRepoNode(
  node: GitHubGraphQLRepoNode | Record<string, never>,
): node is GitHubGraphQLRepoNode {
  return "name" in node;
}

function toRepoCard(node: GitHubGraphQLRepoNode): GitHubRepo {
  return {
    name: node.name,
    description: node.description,
    url: node.url,
    homepageUrl: node.homepageUrl || null,
    stars: node.stargazerCount,
    forks: node.forkCount,
    pushedAt: node.pushedAt,
    language: node.primaryLanguage,
    topics: node.repositoryTopics.nodes.map((n) => n.topic.name),
  };
}

/**
 * Each repository contributes equally, split by its own byte ratio. Summing raw
 * bytes instead lets one repo with generated HTML or vendored code drown out
 * everything else.
 */
function computeLanguageShares(
  repos: GitHubGraphQLRepoNode[],
): GitHubLanguageShare[] {
  const totals = new Map<string, GitHubLanguageShare>();
  let counted = 0;

  for (const repo of repos) {
    if (repo.isFork) continue;
    const repoBytes = repo.languages.edges.reduce((sum, e) => sum + e.size, 0);
    if (repoBytes === 0) continue;
    counted++;

    for (const { size, node } of repo.languages.edges) {
      const current = totals.get(node.name);
      totals.set(node.name, {
        name: node.name,
        color: node.color,
        share: (current?.share ?? 0) + size / repoBytes,
      });
    }
  }

  return [...totals.values()]
    .map((lang) => ({ ...lang, share: lang.share / counted }))
    .sort((a, b) => b.share - a.share);
}

async function loadOverview(): Promise<CacheEntry<GitHubOverview>> {
  const { username, token } = getConfig();
  const { response, call } = await timedFetch("graphql", "/graphql", {
    method: "POST",
    headers: { ...headers(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      query: OVERVIEW_QUERY,
      variables: { login: username, pinned: REPO_CARD_LIMIT },
    }),
  });

  if (!response.ok) {
    throw new GitHubUpstreamError("GraphQL request failed", response.status);
  }

  const json = (await response.json()) as GitHubGraphQLOverviewResponse;
  const user = json.data?.user;
  if (json.errors?.length || !user) {
    throw new GitHubUpstreamError("GraphQL returned errors", response.status);
  }
  if (json.data?.rateLimit) {
    call.rateLimitRemaining = json.data.rateLimit.remaining;
  }

  // A token owned by this account can see its private repositories. Filter
  // them explicitly so no private name ever reaches a public response.
  const publicRepos = user.repositories.nodes.filter((r) => !r.isPrivate);
  const pinned = user.pinnedItems.nodes
    .filter(isRepoNode)
    .filter((r) => !r.isPrivate);
  const repoCards =
    pinned.length > 0
      ? { source: "pinned" as const, items: pinned.map(toRepoCard) }
      : {
          source: "recent" as const,
          items: publicRepos
            .filter((r) => !r.isFork)
            .slice(0, REPO_CARD_LIMIT)
            .map(toRepoCard),
        };

  const overview: GitHubOverview = {
    profile: {
      login: user.login,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      url: user.url,
      createdAt: user.createdAt,
      location: user.location,
      company: user.company,
      websiteUrl: user.websiteUrl || null,
    },
    stats: {
      publicRepos: user.repositories.totalCount,
      totalStars: publicRepos.reduce((sum, r) => sum + r.stargazerCount, 0),
      totalForks: publicRepos.reduce((sum, r) => sum + r.forkCount, 0),
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      contributionsLastYear:
        user.contributionsCollection.contributionCalendar.totalContributions,
    },
    languages: computeLanguageShares(publicRepos),
    repositories: repoCards,
  };

  return { value: overview, fetchedAt: Date.now(), calls: [call] };
}

export function getGitHubOverview(): Promise<
  GitHubFetchResult<GitHubOverview>
> {
  return readThrough(overviewSlot, loadOverview);
}

// ---------------------------------------------------------------------------
// Activity (REST — GraphQL has no public events feed)
// ---------------------------------------------------------------------------

const EVENT_KINDS: Record<string, GitHubActivityKind> = {
  PushEvent: "push",
  CreateEvent: "create",
  DeleteEvent: "delete",
  PullRequestEvent: "pullRequest",
  PullRequestReviewEvent: "review",
  IssuesEvent: "issue",
  IssueCommentEvent: "issueComment",
  ReleaseEvent: "release",
  WatchEvent: "star",
  ForkEvent: "fork",
  PublicEvent: "public",
};

function toActivity(event: GitHubRestEvent): GitHubActivity {
  const payload = event.payload ?? {};
  const kind = EVENT_KINDS[event.type] ?? "other";

  // Push payloads no longer carry commits, only the ref that moved.
  const ref =
    kind === "release"
      ? (payload.release?.tag_name ?? null)
      : (payload.ref?.replace(/^refs\/(heads|tags)\//, "") ?? null);

  return {
    id: event.id,
    kind,
    type: event.type,
    repo: event.repo?.name ?? "",
    createdAt: event.created_at,
    ref,
    refType: payload.ref_type ?? null,
    action: payload.action ?? null,
    number:
      payload.number ??
      payload.pull_request?.number ??
      payload.issue?.number ??
      null,
  };
}

async function loadActivity(): Promise<CacheEntry<GitHubActivity[]>> {
  const { username, token } = getConfig();
  const { response, call } = await timedFetch(
    "rest",
    `/users/${encodeURIComponent(username)}/events/public?per_page=${EVENTS_PAGE_SIZE}`,
    { headers: headers(token) },
  );

  if (!response.ok) {
    throw new GitHubUpstreamError("Events request failed", response.status);
  }

  const events = (await response.json()) as GitHubRestEvent[];
  return { value: events.map(toActivity), fetchedAt: Date.now(), calls: [call] };
}

export async function getGitHubActivity(
  limit: number,
): Promise<GitHubFetchResult<GitHubActivity[]>> {
  const result = await readThrough(activitySlot, loadActivity);
  return { data: result.data.slice(0, limit), meta: result.meta };
}

export const GITHUB_ACTIVITY_MAX = EVENTS_PAGE_SIZE;

/** Maps a service failure to one of the bare error codes the UI translates. */
export function toGitHubErrorCode(
  error: unknown,
): "SERVICE_UNAVAILABLE" | "RATE_LIMIT_EXCEEDED" {
  if (
    error instanceof GitHubUpstreamError &&
    (error.status === 403 || error.status === 429)
  ) {
    return "RATE_LIMIT_EXCEEDED";
  }
  return "SERVICE_UNAVAILABLE";
}
