# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal portfolio of Yazan Abo-Ayash (ColdByDefault), deployed on Vercel at `coldbydefault.com`. Next.js 16 (App Router, React 19, TS strict), Tailwind v4, Shadcn UI, next-intl, Prisma 7 on Neon Postgres. `AGENTS.md` and `.github/copilot-instructions.md` hold the same rules in longer form.

## Commands

```bash
npm run dev           # next dev --turbopack (binds 0.0.0.0)
npm run build         # next build --webpack (webpack, not Turbopack, for the Prisma WASM engine)
npm run lint          # eslint .   (lint:fix to autofix)
npm run typecheck     # tsc --noEmit (on a fresh checkout run `npx next typegen` first)
npm run i18n:check    # all messages/*.json must have exactly en.json's keys
npm run test:e2e      # Playwright, chromium only, tests in tests/e2e (test:e2e:ui for runner)
npm run db:generate | db:push | db:migrate   # db:migrate = `prisma migrate deploy`, not `migrate dev`
npm run deploy        # prisma migrate deploy && build
```

- There is **no** `npm run test`, `analyze`, `type-check`, or `db:seed`. `prisma.config.ts` names `prisma/seed.ts` as the seed, but that file does not exist.
- Single Playwright test: `npx playwright test tests/e2e/locale.spec.ts -g "name"`. It starts `npm run dev` itself unless `PLAYWRIGHT_BASE_URL` is set. Playwright is not run in CI.
- CI (`.github/workflows/ci.yml`) runs `i18n:check`, `lint`, `npx next typegen`, `typecheck`. `next-env.d.ts` and route types are gitignored, hence the typegen step. `prisma.config.ts` needs `DATABASE_URL` set even for `prisma generate`.
- The Prisma client is generated to `lib/generated/prisma` (gitignored). Run `npm run db:generate` if it is missing (`postinstall` normally does it). Import the DB via `lib/configs/prisma.ts`.
- `bump-version.yml` bumps the version on every push to `main` (`[skip ci]` commits). Don't bump versions by hand.

## Hard rules

- The request hook is `proxy.ts` at the root. Never create `middleware.ts`.
- No NextAuth. No `any` (use `unknown`). No edits to `components/ui/` (Shadcn).
- No hardcoded user-facing strings: use `useTranslations()` (client) or `getTranslations()` (server). The one deliberate exception is the "Ask this site" MCP console (`components/github/`, the home page's `#github` section and the `/mcp` playground), which is English-only and keeps its copy in `components/github/GitHub.constants.ts`.
- No leaf `loading.tsx`. Only the root `app/loading.tsx` and the group-level ones under `(legals)`, `(media)`, `admin`.
- Types go in `types/`, hooks in `hooks/`, static data in `data/`. Never inside component folders.
- Each `components/<Feature>/` needs an `index.ts` barrel (`theme/` currently has none and is imported by file path).
- Prisma: parameterised queries only, no `$queryRaw` with interpolation.
- Don't add abstractions for single-use logic.

`.claude/hooks/` enforces part of this: edits to `components/ui/`, `middleware.ts`, `lib/generated/`, `.env*` (except `.env.example`) and `package-lock.json` are blocked, and every edit runs `eslint --fix` on TS/JS files or `i18n:check` on `messages/*.json`. When an edit is one of a pair (an import plus its usage), the hook may report a transient error until the second edit is in. `.claude/agents/` has `conventions-reviewer` (these rules against a diff) and `ui-a11y-reviewer` (Playwright + five-locale layout checks).

## Architecture

**i18n is cookie-based, not path-based.** There is no `[locale]` route segment. `i18n/request.ts` reads the `PORTFOLIOVERSIONLATEST_LOCALE` cookie (falls back to `de`) and loads `messages/<locale>.json`. `proxy.ts` sets that cookie for first-time visitors from `Accept-Language`, and 301-redirects legacy `/de/...` and other locale-prefixed paths to the unprefixed URL. Locales: `en de es fr sv`. `messages/en.json` is the source of truth and all five files must keep identical keys. The supported-locale list and default (`SUPPORTED_LOCALES`, `DEFAULT_LOCALE`) live in `data/configs/i18n.ts`; the `SupportedLocale` type is in `types/configs/i18n.ts`.

**`proxy.ts` is not the auth gate.** It only does locale detection and redirects, but it also exports `createAdminSession()` / `hasValidAdminSession()` (stateless HMAC-SHA256 cookie `PORTFOLIO_ADMIN_SESSION` = `{id}.{expiresAt}.{sig}`, 8h, no IP binding, signed with `ADMIN_TOKEN`). `invalidateAdminSession()` is a deliberate no-op; logout deletes the cookie. The blog admin route sets this cookie on login, but nothing currently calls `hasValidAdminSession()`: every admin API route authenticates by Bearer token on each request.

**Admin/blog API** (`app/api/admin/blog/route.ts`) authenticates via `Authorization: Bearer` tokens, compared in constant time, with two roles:
- `admin` (`ADMIN_TOKEN`): full CRUD.
- `agent` (`BLOG_AGENT_TOKEN`): scoped to list/categories/tags reads and creating drafts, for the scheduled blog-writing routine. Failed auth is throttled by `adminAuthLimiter`.

Business logic lives in `lib/blog-admin/` (`BlogAdminService`, `BlogQueryService`, `BlogValidationService`, `BlogUtilityService`). The public blog API (`app/api/blog`) hides drafts.

**Chatbot** (`app/api/chatbot/route.ts`): Vercel AI SDK `streamText` with `@ai-sdk/openai`. Gated by `CHATBOT_ENABLED` and `OPENAI_CHAT_MODEL`. Persona and system prompt are in `data/main/chatbot-system-prompt.ts` (`REEM_SYSTEM_PROMPT`). Limits come from `CHATBOT_*` env vars parsed by `positiveIntEnv` in `lib/env.ts`. Input sanitising and spam checks are in `lib/security.ts` (which also has `RateLimiter` and `getClientIP`). Logging to `ChatSession`/`ChatMessage` is opt-in (`CHATBOT_LOGGING_ENABLED`) with optional IP anonymisation, in `lib/chatbot-logging.ts`. Admin log viewing is in `app/api/admin/chatbot/logs` (`ADMIN_TOKEN` only).

**MCP server** (`app/api/mcp/route.ts` → `lib/mcp/portfolio-server.ts`): public, unauthenticated, read-only MCP endpoint over the portfolio, open to outside MCP clients by design. Six tools, defined in `lib/mcp/portfolio-tools.ts` and shared with the chatbot, which runs them in-process (not over HTTP) and shows each call as a chip (`components/chatbot/ChatToolChips.tsx`). Site data from `data/`, with translation keys resolved to English from `messages/en.json`: `get_projects`, `get_capabilities`, `get_certifications`. GitHub: `get_profile` (also returns the declared highlights from `data/configs/githubHighlights.ts`), `get_stats`, `get_repositories` (language stats and `get_recent_activity` were removed in Oct 2026 by choice; don't re-add them). New tools also need a button and a `Readable` renderer in `components/github/GitHubAskConsole.tsx`, with copy in `GitHub.constants.ts` (the `/mcp` playground shows every tool group; the home page only groups with `onHome: true`, today GitHub, plus the example question), plus a `ChatBot.tools.<name>` chip label in all five locales and a line in the "Tools" section of the chatbot system prompt. The GitHub username comes from env (`GITHUB_USERNAME`), never from tool input. It uses `lib/github/service.ts`, which filters out private repos, keeps a 10-minute in-memory cache so public traffic cannot drain the `GITHUB_TOKEN` rate limit. The route rate-limits 60 req/min per IP (in-memory, per instance). Config lives in `data/configs/mcp.ts`.

**Content is mostly static.** Projects, products, about and certification content are TS/JSON in `data/` (`data/hubs`, `data/main`), not fetched at runtime. Only blog and chat logs are in Postgres (`prisma/schema.prisma`: Blog, BlogCategory, BlogTag, BlogTagRelation, BlogCredit, ChatSession, ChatMessage).

**Route groups** under `app/`: `(legals)`, `(media)` (about, about-portfolio, blog, projects), plus `admin` and `api`. Each group has its own `layout.tsx` and `loading.tsx`.

**Build notes** (`next.config.ts`): server webpack config enables `asyncWebAssembly` for the Prisma WASM query compiler, and the security headers (including a CSP that still allows `unsafe-inline`/`unsafe-eval`) are set there. The DB adapter is `@prisma/adapter-pg`.

## Conventions

Source files start with a JSDoc header (`@author © ColdByDefault`, `@license`, `@version 7.x.x`). Keep it on new files. Import with the `@/` alias.
