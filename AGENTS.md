# ColdByDefault Portfolio — Agent Instructions

This file provides context for AI coding agents working in this repository.
See also `.github/copilot-instructions.md` for the VS Code Copilot-specific version.

---

## Project Overview

Personal portfolio of Yazan Abo-Ayash (ColdByDefault). Deployed at `coldbydefault.com` on Vercel.
Features: blog, projects, services, about, live tools (email rewriter, ROI calculator), admin dashboard, AI chatbot.

---

## Stack

| Layer      | Technology                                                               |
| ---------- | ------------------------------------------------------------------------ |
| Framework  | Next.js 16.2.4, App Router, Turbopack (dev), Webpack (build)             |
| Language   | TypeScript 5 strict mode, React 19                                       |
| Styling    | Tailwind CSS v4, Shadcn UI (`components/ui/` — never modify)             |
| i18n       | next-intl 4.11.0 · 5 locales: `en`, `de`, `es`, `fr`, `sv`               |
| Database   | Prisma 7.8.0, WASM query engine, `@prisma/adapter-pg`, Neon PostgreSQL   |
| Auth       | Stateless HMAC-SHA256 tokens — no NextAuth, no server-side session state |
| Proxy      | `proxy.ts` (root) — Next.js 16 renamed `middleware.ts` to `proxy.ts`     |
| Deployment | Vercel                                                                   |

---

## Folder Map

```
app/                        Next.js App Router
  (legals)/                 Route group — impressum, privacy
  (live-tools)/             Route group — polite-email, rio-calculator
  (media)/                  Route group — about, about-portfolio, blog, projects, services
  admin/                    Protected admin dashboard (blog management, chatbot config)
  api/                      API routes
    admin/                  Admin CRUD (auth-gated independently of proxy)
    blog/                   Public blog API
    chatbot/                AI chatbot endpoint
    email-rewrite/          Email rewriter (live tool)
    github/                 GitHub stats
    speed-insight/          Vercel Speed Insights proxy
  booking-confirmed/        Post-booking page

components/                 All UI — one folder per feature, always has index.ts barrel
  ui/                       Shadcn UI primitives (DO NOT EDIT)
  visuals/                  Motion background, loading skeletons, CentralizedLoading
  blog/ cer/ chatbot/ ...   Feature components

data/                       Static data only — no runtime fetching
hooks/                      Global React hooks: use-chatbot, use-client, use-mobile
i18n/                       next-intl request config
lib/                        Shared utilities, security helpers, blog-admin logic
messages/                   Translation JSON: en.json de.json es.json fr.json sv.json
prisma/                     schema.prisma, migrations/, seed.ts
proxy.ts                    Route protection + locale redirect (NOT middleware.ts)
types/                      All TypeScript types — global, never inside component folders
public/assets/              Images, icons, use-case visuals
.github/
  agents/                   Custom VS Code Copilot agents
  instructions/             Auto-loaded instructions for .ts/.tsx files
  skills/                   On-demand skills (i18n-checker, portfolio-architecture)
  workflows/                GitHub Actions (bump-version, codeql, dependency-review)
  copilot-instructions.md   VS Code Copilot always-on context
  CODEOWNERS                All files owned by @yazanaboayash
```

---

## Authentication

- Cookie name: `PORTFOLIO_ADMIN_SESSION`
- Format: `{randomId}.{expiresAt}.{hmacSig}`
- Functions: `createAdminSession()` and `hasValidAdminSession(request)` in `proxy.ts`
- `invalidateAdminSession()` is a no-op — logout is handled by cookie deletion
- **No IP binding** — EU privacy compliance
- Admin API routes (`app/api/admin/**`) re-verify the session independently of the proxy

---

## Hard Rules

1. **`proxy.ts` not `middleware.ts`** — Next.js 16 renamed it; never create `middleware.ts`
2. **No NextAuth** — do not suggest `getServerSession`, `authOptions`, or any NextAuth import
3. **No `any`** — use `unknown` or proper types in all TypeScript
4. **No hardcoded user-facing text** — all strings via `useTranslations()` from next-intl
5. **No leaf `loading.tsx`** — group-level files cover all children; don't add per-page ones
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
npm run typecheck     # tsc --noEmit
npm run test:e2e      # playwright test (test:e2e:ui for the runner UI)
npm run db:push       # prisma db push
npm run db:migrate    # prisma migrate deploy
npm run db:seed       # tsx prisma/seed.ts
npm run db:generate   # prisma generate
```

**These do NOT exist:** `npm run test`, `npm run analyze`, `npm run type-check`

---

## Database

- ORM: Prisma 7 with WASM query engine
- Adapter: `@prisma/adapter-pg` (Neon serverless)
- Schema: `prisma/schema.prisma`
- Always use parameterised Prisma queries — no `$queryRaw` with string interpolation
- `prisma generate` runs automatically via `postinstall`

---

## i18n

- Source of truth: `messages/en.json`
- All 5 locales must have key parity
- Use `useTranslations("Namespace")` in client components
- Use `getTranslations("Namespace")` in server components / route handlers

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

| Workflow                | Trigger              | Purpose                                                           |
| ----------------------- | -------------------- | ----------------------------------------------------------------- |
| `bump-version.yml`      | push to `main`       | Bumps patch version in `package.json` + `README.md`, tags release |
| `codeql.yml`            | push / PR / schedule | CodeQL security analysis                                          |
| `dependency-review.yml` | PR                   | Dependency vulnerability check                                    |

The bump workflow commits with `[skip ci]` to prevent loops.

Playwright is **not** wired into CI — `npm run test:e2e` runs locally only. The Lighthouse CI
workflow was retired in v6.0.10; performance is tracked via Vercel Speed Insights instead.
