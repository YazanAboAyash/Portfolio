<div align="center">

# ColdByDefault Portfolio · V7.0.10

---

A developer portfolio that turned into a product: an AI assistant that can drive the page, a public MCP server, a moderated feedback wall and an admin workspace, in five languages, on Next.js 16.

**Live:** https://www.coldbydefault.com
**Docs:** https://docs.coldbydefault.com/
**Releases:** https://github.com/YazanAboAyash/Portfolio/releases

Next.js 16.4 · React 19.2 · TypeScript 5 (strict) · Tailwind 4 · shadcn/ui · next-intl 4
Prisma 7 · Neon PostgreSQL + pgvector · Vercel AI SDK 7 · MCP TypeScript SDK 2 · Zod 4 · Playwright + axe-core · Vercel

</div>

---

## Two years of continuous development

The first commit landed on **29 December 2024**. Two years later the site is on its seventh major version, and it has never been rewritten from scratch.

<div align="center">

| 930+ commits | 110+ merged PRs | 7 major versions | 37 tagged versions | 5 locales | ~27k lines of TypeScript |
| :----------: | :-------------: | :--------------: | :----------------: | :-------: | :----------------------: |

</div>

- **v1 – v3 (Dec 2024 – spring 2025):** a static Next.js showcase grows its project hubs and first blog pages.
- **v4 – v5 (summer – autumn 2025):** internationalization with next-intl, a Prisma and PostgreSQL blog with an admin API, the first chatbot, a first MCP prototype, and CodeQL with a security hardening pass.
- **v6 (2026):** Reem moves to the Vercel AI SDK, the site gets one visual system, and the MCP server is rebuilt in TypeScript.
- **v7 (Oct 2026):** a quieter redesign, a portfolio-wide MCP server, site actions in chat, retrieval over the site's own content, visitor feedback and a unified admin workspace.

Coding time per major version, tracked by WakaTime:

<div align="center">

**v5 – v7** [![wakatime](https://wakatime.com/badge/user/c4621892-41e0-4c29-a8bc-05597d124f63/project/76e31353-a33c-4db5-9263-8ede3103f951.svg)](https://wakatime.com/badge/user/c4621892-41e0-4c29-a8bc-05597d124f63/project/76e31353-a33c-4db5-9263-8ede3103f951)
**v4** [![wakatime](https://wakatime.com/badge/user/c4621892-41e0-4c29-a8bc-05597d124f63/project/3cb24b80-9d06-4466-8578-315c61711973.svg)](https://wakatime.com/badge/user/c4621892-41e0-4c29-a8bc-05597d124f63/project/3cb24b80-9d06-4466-8578-315c61711973)
**v3** [![wakatime](https://wakatime.com/badge/user/c4621892-41e0-4c29-a8bc-05597d124f63/project/beb9337a-f033-4377-9e03-26f96c36a41a.svg)](https://wakatime.com/badge/user/c4621892-41e0-4c29-a8bc-05597d124f63/project/beb9337a-f033-4377-9e03-26f96c36a41a)
**v2** [![wakatime](https://wakatime.com/badge/user/c4621892-41e0-4c29-a8bc-05597d124f63/project/79c9876c-acce-48e7-b661-264f4bf514a5.svg)](https://wakatime.com/badge/user/c4621892-41e0-4c29-a8bc-05597d124f63/project/79c9876c-acce-48e7-b661-264f4bf514a5)
**v1** [![wakatime](https://wakatime.com/badge/user/c4621892-41e0-4c29-a8bc-05597d124f63/project/dfbc172c-fd3e-46d8-a8b1-31aeec64a895.svg)](https://wakatime.com/badge/user/c4621892-41e0-4c29-a8bc-05597d124f63/project/dfbc172c-fd3e-46d8-a8b1-31aeec64a895)

</div>

---

## What's inside

**Reem, the AI assistant.** Streams replies over SSE, searches the site's own blog posts, projects and notes (pgvector plus full-text search, fused by reciprocal rank), shares six read-only tools with the MCP server, and can act on the page: open a route, scroll to a section, switch theme or language, highlight a project. Every action is re-checked against allowlists in the browser before it runs.

**A public MCP server.** `/api/mcp` exposes projects, capabilities, certifications and GitHub data to any MCP client. The home page's "Ask this site" console is a real in-browser MCP session against it, and `/mcp` is a playground for every tool.

**A moderated feedback wall.** Honeypot, fill-time check, burst and daily limits, OpenAI moderation and a classifier that can only reject. Nothing is published until it is approved by hand.

**An admin workspace.** One login for blog CRUD, chat logs and feedback review. A separate, narrowly scoped `agent` token can create blog drafts and nothing else.

**Five languages.** English, German, Spanish, French and Swedish, negotiated by cookie rather than URL, with key parity enforced in CI.

---

## Built to be trusted

- Per-request nonce CSP, HSTS and a strict set of security headers
- Zod on every API boundary, per-IP rate limits, and error envelopes that never leak provider detail
- HMAC-signed admin sessions that one logout revokes on every device
- Consent-gated chat logging, `store: false` on model calls, and only a keyed hash of the IP for feedback
- CodeQL, dependency review, ESLint, strict types and i18n parity on every pull request
- Playwright end-to-end tests with axe accessibility checks, plus a Docker Compose stack that runs the production build against its own Postgres

---

## Named releases

Every merge to `main` bumps the version and publishes a GitHub release under a random Japanese name from `.github/release-names.txt`: recent ones include **FUDOSHIN 不動心**, **HIKARI 光** and **KANSO 簡素**. GitHub Copilot CLI writes the summary and themed sections, with a commit list grouped by type as the fallback. The full history is on the [releases page](https://github.com/YazanAboAyash/Portfolio/releases).

---

## License

Copyright © 2026 ColdByDefault. All rights reserved.

This repository is published for viewing only. Copying, modification, redistribution, derivative works and any commercial or personal reuse of the code, assets or design require prior written permission. See `LICENSE` for the formal wording.

---

## Contact

Portfolio: https://www.coldbydefault.com · Documentation: https://docs.coldbydefault.com/

For professional or security inquiries, use the channels listed on the site. Security reports follow `SECURITY.md`.

_P.S. If you find any bugs, they're not bugs - they're undocumented features!_

---

## Special Thanks

<div align="center">

Thank you to the companies whose free tiers make independent projects like this possible.

<br />

<a href="https://vercel.com">
  <img src="public/assets/icons/vercel.png" alt="Vercel" height="40" />
</a>

**[Vercel](https://vercel.com)**: hosting, the edge network and zero-config deployments.

<br />

<a href="https://neon.tech">
  <img src="public/assets/icons/neon.png" alt="Neon" height="40" />
</a>

**[Neon](https://neon.tech)**: serverless PostgreSQL with a generous free tier.

</div>

---

> Security research note: Responsible disclosure practices appreciated. Do not attempt exploitation against production infrastructure.
