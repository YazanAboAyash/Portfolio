# Architecture Decision Records

This file records decisions with lasting architectural, privacy, or security impact—not routine implementation details or every change.

## Index

1. [Cookie-driven localization without locale-prefixed routes](#adr-0001-cookie-driven-localization-without-locale-prefixed-routes)
2. [Separate curated content from runtime persistence](#adr-0002-separate-curated-content-from-runtime-persistence)
3. [Privacy-conscious chatbot state and logging](#adr-0003-privacy-conscious-chatbot-state-and-logging)
4. [Public, read-only MCP interface](#adr-0004-public-read-only-mcp-interface)
5. [Scoped token authentication for admin APIs](#adr-0005-scoped-token-authentication-for-admin-apis)
6. [Next.js application deployed on Vercel](#adr-0006-nextjs-application-deployed-on-vercel)
7. [Stream chatbot responses through the Vercel AI SDK](#adr-0007-stream-chatbot-responses-through-the-vercel-ai-sdk)
8. [Use Webpack for Prisma WASM production builds](#adr-0008-use-webpack-for-prisma-wasm-production-builds)

## ADR 0001: Cookie-driven localization without locale-prefixed routes

- Status: Accepted
- Date: 2026-10-24

### Context

The site serves five translations (`en`, `de`, `es`, `fr`, and `sv`). Locale selection needs to work during server rendering and persist across navigation. The site also has established, unprefixed URLs and SEO metadata that should not be duplicated for each language.

### Decision

Use the `PORTFOLIOVERSIONLATEST_LOCALE` cookie as the runtime locale source. On first visits, `proxy.ts` detects a supported language from `Accept-Language` and sets the cookie; the request configuration validates it and falls back to German (`de`). Keep application routes unprefixed rather than adding a locale segment to every URL. Redirect the legacy `/de` paths and the recognized non-English locale prefixes to their unprefixed equivalents.

Keep the supported-locale list and default locale centralized, and require translation bundles to have matching keys.

### Consequences

- Server-rendered pages can use a visitor's saved language without a locale segment in the route.
- Each page has one canonical unprefixed path rather than a locale-prefixed route variant.
- A URL alone does not encode the visitor's language preference; the locale cookie is needed to reproduce it on later requests.
- Search engines and external links cannot target a language through a locale-prefixed path; language is selected by the visitor's cookie rather than by a URL-level `hreflang` variant.
- The legacy prefixes recognized by the proxy need redirects to preserve their destinations; other locale-looking paths are not a supported routing scheme.

## ADR 0002: Separate curated content from runtime persistence

- Status: Accepted
- Date: 2026-10-24

### Context

Most portfolio material is curated and changes with application releases. Blog posts are managed dynamically, and chatbot transcripts may be persisted for administration when both configuration and visitor consent allow it. Persisting all portfolio data would add operational and editorial overhead; keeping dynamic records in source would make routine updates and administration unnecessarily difficult.

### Decision

Keep curated projects, products, capabilities, certifications, and related portfolio configuration in static TypeScript modules and JSON files under `data/`. Use PostgreSQL on Neon, accessed through Prisma and its PostgreSQL adapter, for dynamic blog content and optional chatbot logs.

### Consequences

- Curated portfolio content is versioned and deployed with the application; TypeScript-backed content is type-checked, and none of it requires database reads to render.
- Blog content can be managed independently through the admin API.
- Chat transcripts are not persisted by default; database logging requires explicit runtime enablement and visitor consent (see ADR 0003).
- Database-backed features depend on the configured database connection.
- The Prisma WASM query compiler requires the production build to use the configured Webpack build path.

## ADR 0003: Privacy-conscious chatbot state and logging

- Status: Accepted
- Date: 2026-10-24

### Context

The chatbot runs on serverless infrastructure, where successive requests may reach different instances. Server-side conversation state would require shared storage for every visitor and would retain transcripts even when they are not needed. Chat content is also sensitive visitor-provided data.

### Decision

Keep the conversation transcript in browser `localStorage` and send the validated message history with each request. Do not rely on server-side session state to construct the model context.

Persist transcripts to PostgreSQL only when `CHATBOT_LOGGING_ENABLED` is true and the visitor has explicitly consented. Do not persist chat data when either condition is false. Configure OpenAI requests with `store: false` to opt out of provider-side response storage.

### Consequences

- Chat context works across serverless instances without a shared session store.
- Visitors who do not consent can use the chatbot without server-side transcript persistence.
- Browser-local history is specific to that browser storage and may be cleared by the visitor or browser; it is not a cross-device chat account.
- The server validates incoming messages and enforces conversation limits; it must not trust client history as an authorization signal.
- When logging is enabled and consented to, chat content and related session data are retained in the application database. There is currently no automatic purge; records are deleted manually during review or on a valid erasure request, as described in the privacy notice.
- `store: false` applies to OpenAI response storage; it is not a guarantee about all provider processing or network transmission.

## ADR 0004: Public, read-only MCP interface

- Status: Accepted
- Date: 2026-10-24

### Context

The portfolio's information is intended to be discoverable not only through the website but also by MCP clients. Requiring an account would obstruct that use case. Conversely, a general-purpose proxy or write-capable endpoint could expose private data or grant unintended access.

### Decision

Provide a public, unauthenticated, read-only MCP endpoint for explicitly selected public portfolio and GitHub information. Keep tools bounded to the portfolio's own data and the configured GitHub account. Filter private repositories from results, keep the GitHub identity in server configuration, and apply request-size and per-IP rate limits.

### Consequences

- Any MCP client can discover and read the information intentionally exposed by the tools.
- The endpoint does not provide write operations or accept a caller-selected GitHub account.
- New tools must be reviewed for public-data scope; private or administrative data must not be exposed through this endpoint.
- Rate limiting is an abuse control, not authentication or a guarantee against distributed traffic; the current limiter is in-memory per instance.
- The endpoint intentionally does not rely on Origin/Host validation as an authentication boundary because its intended audience is external clients.

## ADR 0005: Scoped token authentication for admin APIs

- Status: Accepted
- Date: 2026-10-24

### Context

The admin API serves both the site owner and a scheduled blog-writing routine. Giving the routine the owner's full permissions would make a leaked or misconfigured automation credential unnecessarily powerful. Admin API routes also need to enforce authorization independently of page or proxy behavior.

### Decision

Require an `Authorization`-header token on every admin API request and resolve it to one of two server-configured roles. Callers use the `Bearer` form; the current handlers also accept the raw token value for backwards compatibility.

- `ADMIN_TOKEN` grants the owner full blog administration.
- `BLOG_AGENT_TOKEN` grants the writing routine only the permitted reads (lists, categories, and tags) and draft creation.

Reject unauthorized requests and rate-limit repeated failed authentication attempts. Admin routes perform these checks themselves rather than relying on the proxy for authorization. The blog route may issue a signed `PORTFOLIO_ADMIN_SESSION` cookie, but no protected route currently validates it: it is non-authoritative and does not replace the per-request token check.

### Consequences

- A stolen agent token has narrower capabilities than the owner token.
- Each API caller must securely supply its token in the `Authorization` header on every request, using the `Bearer` form.
- Authentication policy must be maintained by each protected API route; proxy behavior alone is not a security boundary.
- The stateless session cookie is not an authority for admin API requests and is currently unused for authorization. It cannot revoke a token; token rotation is the mechanism for invalidating a compromised credential.

## ADR 0006: Next.js application deployed on Vercel

- Status: Accepted
- Date: 2026-10-24

### Context

The portfolio needs server-rendered pages, API route handlers, edge delivery, and deployment without maintaining application servers. Its runtime uses serverless behavior: requests may land on different instances, and in-memory state is not a durable shared store.

### Decision

Use Next.js App Router as the application framework and deploy the site on Vercel. Use framework route handlers for server APIs and Vercel's hosting and edge network for deployment and delivery. Do not rely on process-local state for durable sessions or globally consistent rate limiting.

### Consequences

- UI routes and server API handlers share one application and deployment model.
- Deployment and runtime behavior are coupled to Next.js and Vercel conventions.
- Instance-local memory is best-effort only; state requiring cross-request or cross-instance durability belongs in the browser or shared storage.
- Moving hosting providers requires validating route-handler, caching, streaming, and build behavior on the target platform.

## ADR 0007: Stream chatbot responses through the Vercel AI SDK

- Status: Accepted
- Date: 2026-10-24

### Context

The chatbot should deliver generated answers progressively rather than waiting for a complete response. It runs behind a server API, while the browser owns conversation history (see ADR 0003). The current provider integration is OpenAI, configured at runtime.

### Decision

Use the Vercel AI SDK's `streamText` on the server and its UI message stream transport to send incremental responses to the client. Use the OpenAI provider adapter and select the model through `OPENAI_CHAT_MODEL`; keep the chatbot disabled unless explicitly enabled and configured.

### Consequences

- Visitors can receive partial responses while generation continues.
- The application is coupled to the AI SDK message-stream contract and the OpenAI provider adapter.
- Changing provider or transport requires validating message conversion, streaming errors, limits, and the client transport—not just changing a model name.
- Provider credentials and model selection remain server-side configuration; they must not be exposed to the browser.

## ADR 0008: Use Webpack for Prisma WASM production builds

- Status: Accepted
- Date: 2026-10-24

### Context

The application uses Prisma 7 with the PostgreSQL adapter and a WASM-based query compiler. The production server bundle must include and load the generated Prisma client and support asynchronous WebAssembly. The repository's development and production build paths differ: development uses Turbopack, while the production build uses Webpack.

### Decision

Keep the production build on Webpack, enable server-side `asyncWebAssembly` support, and configure output tracing for Prisma runtime files. Do not switch the production build bundler without first verifying generated Prisma client inclusion and database operations in a production build.

### Consequences

- Production build configuration is part of the database runtime contract, not an interchangeable tooling preference.
- Build-tool changes must be validated against Prisma client generation, tracing, and deployed route handlers.
- Development bundling may differ from production, so development success alone does not establish that the deployed Prisma runtime works.
