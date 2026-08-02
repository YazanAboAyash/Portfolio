# ColdByDefault Portfolio — Copilot Instructions

## Stack

|            |                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------ |
| Framework  | Next.js 16.2.4, App Router, Turbopack (`dev`), Webpack (`build`)                                             |
| Language   | TypeScript strict mode, React 19                                                                             |
| Styling    | Tailwind CSS, Shadcn UI (`components/ui/` — do not modify)                                                   |
| i18n       | next-intl 4.11.0 · locales: `en`, `de`, `es`, `fr`, `sv` · messages in `messages/`                           |
| Database   | Prisma 7.8.0, WASM query engine, `@prisma/adapter-pg`, Neon PostgreSQL                                       |
| Auth       | Stateless HMAC-SHA256 tokens in `PORTFOLIO_ADMIN_SESSION` cookie — no server-side session state, no NextAuth |
| Proxy      | `proxy.ts` at root (Next.js 16 renamed `middleware.ts` → `proxy.ts`)                                         |
| Deployment | Vercel · `coldbydefault.com`                                                                                 |

## Key Rules

- **No `middleware.ts`** — the proxy file is `proxy.ts`
- **No NextAuth / `getServerSession`** — auth is `createAdminSession()` / `hasValidAdminSession()` in `proxy.ts`
- **No IP binding in sessions** — EU privacy compliance
- **No leaf-level `loading.tsx`** — one per route group covers all children: `(legals)`, `(live-tools)`, `(media)`, `admin`
- **No hardcoded user-facing text** — always use `useTranslations()` from next-intl
- **No `any` types** — use `unknown` or proper types
- **No overengineering** — don't add abstractions for single-use logic

## Real Scripts (`package.json`)

```
npm run dev          # next dev --turbopack
npm run build        # next build --webpack
npm run lint         # eslint .
npm run lint:fix     # eslint . --fix
npm run typecheck    # tsc --noEmit
npm run test:e2e     # playwright test (test:e2e:ui for the runner UI)
npm run db:push      # prisma db push
npm run db:migrate   # prisma migrate deploy
npm run db:seed      # tsx prisma/seed.ts
```

> `npm run test`, `npm run analyze`, `npm run type-check` do **not** exist.

## Folder Conventions

- `components/[Feature]/index.ts` — barrel export, always present
- `types/` — all TypeScript types (global, never inside component folders)
- `hooks/` — global hooks only (`use-chatbot`, `use-client`, `use-mobile`)
- `data/` — static data, no runtime fetching
- `lib/` — shared utilities, security helpers, blog-admin logic
- `app/api/` — API routes; admin routes verified independently of proxy
