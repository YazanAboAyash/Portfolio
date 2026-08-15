---
name: portfolio-architecture
description: "Portfolio codebase explorer. Use when starting a new task and needing codebase context, understanding folder layout, finding where a feature lives, mapping data flow, or onboarding to the project structure."
argument-hint: "Area to explore (e.g. 'blog', 'admin', 'auth', 'i18n') or leave blank for full overview"
---

# Portfolio Architecture Explorer

Produces a concise structural summary of the ColdByDefault portfolio to orient work in the correct files.

## When to Use

- Starting a new feature and unsure where code lives
- Tracing data flow from UI → hook → API → DB
- Finding the right file before searching or editing

## Stack Snapshot

| Layer      | Technology                                                       |
| ---------- | ---------------------------------------------------------------- |
| Framework  | Next.js 16.2.4, App Router, Turbopack                            |
| UI         | React 19, TypeScript strict, Tailwind CSS, Shadcn UI             |
| i18n       | next-intl 4.11.0 · 5 locales: `en`, `de`, `es`, `fr`, `sv`       |
| Database   | Prisma 7.8.0, Neon PostgreSQL, WASM query engine                 |
| Auth       | Stateless HMAC-SHA256 tokens in `PORTFOLIO_ADMIN_SESSION` cookie |
| Proxy      | `proxy.ts` (Next.js 16 renamed from `middleware.ts`)             |
| Deployment | Vercel                                                           |

## Folder Map

```
app/                      Next.js App Router pages
  (legals)/               Route group — legal pages (impressum, privacy)
  (live-tools)/           Route group — interactive tools
  (media)/                Route group — content pages (about, blog, projects, services)
  admin/                  Protected admin dashboard
  api/                    API routes (admin, blog, chatbot, github, automation-audit, speed-insight)
  booking-confirmed/      Post-booking confirmation page

components/               All UI components
  ui/                     Shadcn UI primitives (do not modify)
  visuals/                Motion background, loading skeletons
  [feature]/              Each feature has its own folder with index.ts barrel

data/                     Static data (no runtime fetching)
  configs/                App-level config objects
  hubs/                   Feature-specific static data
  main/                   Core data (certs, skills, etc.)

hooks/                    Global React hooks (use-chatbot, use-client, use-mobile)
i18n/                     next-intl request config
lib/                      Shared utilities, security, blog admin helpers
messages/                 Translation JSON files (en/de/es/fr/sv)
prisma/                   Schema, migrations, seed
public/assets/            Static assets (images, icons, use-cases)
types/                    Global TypeScript types
```

## Procedure

1. If a specific area is given, `search` for files matching that feature in `app/`, `components/`, `lib/`, `hooks/`, `data/`.
2. Read the barrel `index.ts` for the relevant component folder.
3. Trace the data path: `data/` or `lib/hubs/` → hook or API route → component.
4. Return a compact summary: relevant files, their roles, and where to start editing.
