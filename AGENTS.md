# ColdByDefault Portfolio — Agent Instructions

This file provides context for AI coding agents working in this repository.
See also `CLAUDE.md` (Claude Code) and `.github/copilot-instructions.md` (VS Code Copilot), which carry the same rules.

---

## Project Overview

Personal portfolio of Yazan Abo-Ayash (ColdByDefault). Deployed at `coldbydefault.com` on Vercel.
Features: blog, projects, products, about, portfolio MCP server ("Ask this site" console and `/mcp` playground), AI chatbot (Reem) with site actions, visitor feedback wall, admin workspace.

---

## Stack

| Layer      | Technology                                                                     |
| ---------- | ------------------------------------------------------------------------------ |
| Framework  | Next.js 16.4, App Router, Turbopack (dev), Webpack (build)                     |
| Language   | TypeScript 5 strict mode, React 19                                             |
| Styling    | Tailwind CSS v4, Shadcn UI (`components/ui/` — never modify)                   |
| i18n       | next-intl 4.11 · 5 locales: `en`, `de`, `es`, `fr`, `sv` · cookie-based        |
| Database   | Prisma 7.8, WASM query engine, `@prisma/adapter-pg`, Neon PostgreSQL           |
| Auth       | Bearer tokens or a stateless HMAC-SHA256 session cookie — no NextAuth          |
| Proxy      | `proxy.ts` (root) — Next.js 16 renamed `middleware.ts` to `proxy.ts`           |
| Deployment | Vercel                                                                         |

---

## Folder Map

```
app/                        Next.js App Router
  (legals)/                 Route group — impressum, privacy
  (media)/                  Route group — about, about-portfolio, blog, mcp, projects
  admin/                    Admin workspace: hub, blog, chatbot logs, feedback review
  api/                      API routes
    admin/                  blog, chatbot/logs, feedback, session (each checks auth itself)
    about/                  Profile metadata
    blog/                   Public blog API (drafts hidden)
    chatbot/                AI chatbot endpoint
    feedback/               Visitor feedback submit + public wall
    mcp/                    Public read-only portfolio MCP server
    speed-insight/          PageSpeed metrics

components/                 All UI — one folder per feature, always has index.ts barrel
  ui/                       Shadcn UI primitives (DO NOT EDIT)
  admin/                    Admin workspace shell, hub, feedback review
  visuals/                  Motion background, loading skeletons, CentralizedLoading
  blog/ chatbot/ feedback/ github/ ...   Feature components

data/                       Static data only — no runtime fetching (configs/, hubs/, main/)
hooks/                      Global React hooks (use-chatbot, use-site-actions, use-feedback, use-blog-admin, ...)
i18n/                       next-intl request config
lib/                        Shared utilities: security, blog-admin, feedback, github, mcp, site-actions
messages/                   Translation JSON: en.json de.json es.json fr.json sv.json
prisma/                     schema.prisma, migrations/
proxy.ts                    Locale detection + legacy redirects; admin session helpers (NOT an auth gate)
types/                      All TypeScript types — global, never inside component folders
public/assets/              Images, icons, use-case visuals
scripts/                    check-i18n-keys.mjs
.github/
  scripts/                  create-release.sh
  workflows/                GitHub Actions (ci, bump-version, codeql, dependency-review)
  release-names.txt         Name pool for releases
  release-template.md       Release body template
  copilot-instructions.md   VS Code Copilot always-on context
  CODEOWNERS                All files owned by @yazanaboayash
```

---

## Authentication

- `proxy.ts` only does locale detection and redirects. It is **not** an auth gate; it just exports the session helpers.
- Cookie name: `PORTFOLIO_ADMIN_SESSION`, format `{randomId}.{expiresAt}.{hmacSig}`, 8h, signed with `ADMIN_TOKEN`
- Functions: `createAdminSession()` and `hasValidAdminSession(request)` in `proxy.ts`
- `invalidateAdminSession()` is a no-op — logout is handled by cookie deletion
- **No IP binding** — EU privacy compliance
- `app/admin/layout.tsx` wraps every admin page in `AdminWorkspace`, which logs in via `app/api/admin/session` (GET status, POST `{ token }` sets the cookie, DELETE clears it; POST/DELETE require a same-origin `Origin`)
- Every route under `app/api/admin/**` checks auth itself: an `Authorization: Bearer` token, or the session cookie **only when that header is absent** (the cookie always means the `admin` role). The admin hooks rely on the cookie.
- `/api/admin/blog` has two token roles: `admin` (`ADMIN_TOKEN`, full CRUD) and `agent` (`BLOG_AGENT_TOKEN`, list/categories reads and draft creation only). Other admin routes accept the admin token only. Failed auth is throttled by `adminAuthLimiter`.

---

## Hard Rules

1. **`proxy.ts` not `middleware.ts`** — Next.js 16 renamed it; never create `middleware.ts`
2. **No NextAuth** — do not suggest `getServerSession`, `authOptions`, or any NextAuth import
3. **No `any`** — use `unknown` or proper types in all TypeScript
4. **No hardcoded public-facing text** — use next-intl for public pages. Admin pages (`app/admin/`, `components/admin/`, and `components/blog/dashboard/`) stay English-only with hardcoded text. The "Ask this site" MCP console (`components/github/`) is also English-only, with copy in `GitHub.constants.ts`.
5. **No leaf `loading.tsx`** — only `app/loading.tsx` and the group-level ones under `(legals)`, `(media)`, `admin`
6. **No overengineering** — no abstractions, helpers, or HOCs for single-use logic
7. **Shadcn UI is read-only** — never edit files inside `components/ui/`
8. **Types stay global** — never define types or hooks inside component folders

---

## Valid Scripts

```bash
npm run dev           # next dev --turbopack
npm run build         # next build --webpack
npm run lint          # eslint .
npm run lint:fix      # eslint . --fix
npm run typecheck     # tsc --noEmit (run `npx next typegen` first on a fresh checkout)
npm run i18n:check    # all messages/*.json must have exactly en.json's keys
npm run test:e2e      # playwright test (test:e2e:ui for the runner UI)
npm run db:push       # prisma db push
npm run db:migrate    # prisma migrate deploy
npm run db:generate   # prisma generate
npm run deploy        # prisma migrate deploy && build
```

**These do NOT exist:** `npm run test`, `npm run analyze`, `npm run type-check`, `npm run db:seed` (`prisma.config.ts` names `prisma/seed.ts`, but that file does not exist)

---

## Database

- ORM: Prisma 7 with WASM query engine; client generated to `lib/generated/prisma` (gitignored), imported via `lib/configs/prisma.ts`
- Adapter: `@prisma/adapter-pg` (Neon serverless)
- Schema: `prisma/schema.prisma` — Blog, BlogCategory, BlogCredit, ChatSession, ChatMessage, Feedback
- Always use parameterised Prisma queries — no `$queryRaw` with string interpolation
- `prisma generate` runs automatically via `postinstall`; `prisma.config.ts` needs `DATABASE_URL` set even for that

---

## i18n

- Locale comes from the `PORTFOLIOVERSIONLATEST_LOCALE` cookie (default `de`); there is no `[locale]` route segment
- Source of truth: `messages/en.json`
- All 5 locales must have key parity (`npm run i18n:check`)
- Use `useTranslations("Namespace")` in client components
- Use `getTranslations("Namespace")` in server components / route handlers

---

## Feature Notes

- **MCP server** (`app/api/mcp` → `lib/mcp/`): public, read-only, six tools shared with the chatbot. A new tool also needs a button and renderer in `components/github/GitHubAskConsole.tsx`, copy in `GitHub.constants.ts`, a `ChatBot.tools.<name>` label in all five locales and a line in the chatbot system prompt.
- **Chatbot site actions** (`navigate`, `scroll_to_section`, `set_theme`, `set_language`, `highlight_project`): server tools with a no-op `execute`; the browser re-validates each call with `parseSiteAction` (`lib/site-actions.ts`, allowlists in `data/configs/site-actions.ts`) and runs it via `hooks/use-site-actions.ts`.
- **Visitor feedback** (`app/api/feedback`, `lib/feedback/`): gated by `FEEDBACK_ENABLED`. AI moderation can only reject; everything else stays `pending` until approved by hand in `/admin/feedback`. The raw IP is never stored, only an HMAC of it.

---

## Component Conventions

```
components/[Feature]/
├── index.ts              # Barrel export — required
├── Feature.tsx           # Main UI component
├── Feature.logic.ts      # Business logic (optional)
├── Feature.utils.ts      # Utilities (optional)
└── Feature.constants.ts  # Constants (optional)
```

- Types → `types/`
- Hooks → `hooks/`
- Static data → `data/`
- Shared utilities → `lib/`

---

## CI / GitHub Actions

| Workflow                | Trigger              | Purpose                                                                       |
| ----------------------- | -------------------- | ----------------------------------------------------------------------------- |
| `ci.yml`                | PR / push to `main`  | `i18n:check`, `lint`, `next typegen`, `typecheck`                             |
| `bump-version.yml`      | push to `main`       | Bumps version in `package.json` + `README.md`, tags, publishes a named release |
| `codeql.yml`            | push / PR / schedule | CodeQL security analysis                                                      |
| `dependency-review.yml` | PR                   | Dependency vulnerability check                                                |

The bump workflow commits with `[skip ci]` to prevent loops. The patch counts up to 10, then rolls into the next minor (7.0.10 → 7.1.0); for a major release, set the version in `package.json` in the PR. Releases are published by `.github/scripts/create-release.sh` (preview with `DRY_RUN=1 bash .github/scripts/create-release.sh <tag>`).

Playwright is **not** wired into CI — `npm run test:e2e` runs locally only. The Lighthouse CI
workflow was retired in v6.0.10; performance is tracked via Vercel Speed Insights instead.
