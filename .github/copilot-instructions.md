# ColdByDefault Portfolio — Copilot Instructions

## Stack

|            |                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js 16.4, App Router, Turbopack (`dev`), Webpack (`build`)                                                         |
| Language   | TypeScript strict mode, React 19                                                                                       |
| Styling    | Tailwind CSS v4, Shadcn UI (`components/ui/` — do not modify)                                                          |
| i18n       | next-intl 4.11 · locales: `en`, `de`, `es`, `fr`, `sv` · cookie-based, messages in `messages/`                         |
| Database   | Prisma 7.8, WASM query engine, `@prisma/adapter-pg`, Neon PostgreSQL                                                   |
| Auth       | Bearer tokens or a stateless HMAC-SHA256 `PORTFOLIO_ADMIN_SESSION` cookie — no server-side session state, no NextAuth |
| Proxy      | `proxy.ts` at root (Next.js 16 renamed `middleware.ts` → `proxy.ts`)                                                   |
| Deployment | Vercel · `coldbydefault.com`                                                                                           |

## Key Rules

- **No `middleware.ts`** — the proxy file is `proxy.ts`, and it is not an auth gate (locale detection and redirects only)
- **No NextAuth / `getServerSession`** — the session helpers are `createAdminSession()` / `hasValidAdminSession()` in `proxy.ts`
- **Admin API routes check auth themselves** — Bearer token, or the session cookie only when no `Authorization` header is sent
- **No IP binding in sessions** — EU privacy compliance
- **No leaf-level `loading.tsx`** — only `app/loading.tsx` and one per route group: `(legals)`, `(media)`, `admin`
- **No hardcoded public-facing text** — use next-intl for public pages. Admin pages (`app/admin/`, `components/admin/`, and `components/blog/dashboard/`) stay English-only with hardcoded text. The MCP console (`components/github/`) is English-only too, with copy in `GitHub.constants.ts`.
- **No `any` types** — use `unknown` or proper types
- **No overengineering** — don't add abstractions for single-use logic

## Real Scripts (`package.json`)

```
npm run dev          # next dev --turbopack
npm run build        # next build --webpack
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run typecheck    # tsc --noEmit
npm run i18n:check   # all messages/*.json must match en.json's keys
npm run test:e2e     # playwright test (test:e2e:ui for the runner UI)
npm run db:push      # prisma db push
npm run db:migrate   # prisma migrate deploy
npm run db:generate  # prisma generate
```

> `npm run test`, `npm run analyze`, `npm run type-check`, `npm run db:seed` do **not** exist.

## Folder Conventions

- `components/[Feature]/index.ts` — barrel export, always present
- `types/` — all TypeScript types (global, never inside component folders)
- `hooks/` — global hooks only (e.g. `use-chatbot`, `use-site-actions`, `use-feedback`, `use-blog-admin`)
- `data/` — static data, no runtime fetching
- `lib/` — shared utilities, security helpers, blog-admin, feedback, github, mcp, site-actions
- `app/api/` — API routes; admin routes verify auth independently of the proxy
