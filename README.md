<div align="center">

# ColdByDefault Portfolio · V6.0.11

Modern, secure, high‑performance developer portfolio built with Next.js 16, TypeScript, a strongly hardened edge-first architecture & multi‑locale SEO‑optimized delivery.

<img width="990" height="174" alt="Screenshot 2025-08-31 111906" src="https://github.com/user-attachments/assets/2a863d38-e178-42ee-85a9-75010601fb2b" />

1. **Live:** https://www.coldbydefault.com 
2. **Docs:** https://docs.coldbydefault.com/ 
3. **Stack:** 
- Next.js 16 · React 19.2.3 · TypeScript 5.x · Tailwind 4.1.12 · shadcn/ui 
- Embla Carousel · Framer Motion 12.x · next-intl 4.6 · Prisma ORM 7 
- Neon PostgreSQL · Zod 4.x · ESLint 9.x · Vercel

</div>

---

## Table of Contents

1. Overview
2. Technology Stack
3. Key Features
4. Internationalization (i18n)
5. SEO & Discoverability
6. Performance & Accessibility
7. Architecture Overview
8. API Surface
9. Security & Hardening
10. GitHub Actions & Automation
11. Privacy & Data Handling
12. Development (Local Setup)
13. Roadmap
14. License & Intellectual Property
15. Contact
16. Special Thanks

---

## 1. Overview

This portfolio serves as a professional showcase of engineering capability: performant UI, secure API integrations (GitHub, PageSpeed), accessibility‑focused design, production‑grade hardening, and now multi‑language + deep structured SEO implementation achieving a 100/100 Google Lighthouse SEO score (Sep 2025 validation). All code is proprietary and published strictly for viewing.

---

## 2. Technology Stack

Core:

* Next.js 16 (App Router, Server Components, Turbopack, Edge runtime where applicable)
* React 19.2.3, TypeScript 5.x (strict mode)
* Tailwind CSS 4.1.12 + PostCSS
* shadcn/ui (accessible primitives)
* Embla Carousel 8.6.0 (modern carousel with autoplay)
* Framer Motion 12.23.12 (animation system)
* next-intl 4.6 (runtime + server i18n)
* Zod 4.x (runtime schema validation)
* Vercel Hosting & Edge Network
* Vercel CRON Jobs (Automated Background Tasks & refresh Data)

Development & Quality:

* ESLint 9.x (flat config system, TypeScript-ESLint 8.41.0 integration)
* Strict type checking with zero `any` tolerance
* Enhanced import/export linting and validation
* Comprehensive type coverage for all API interfaces (`AdminStats`, `GitHubData`, `PageSpeedMetrics`)
* Discriminated unions for locale handling and error states
* TypeDoc for comprehensive documentation generation

Supporting & Utilities:

* Custom hooks (device, language, theming)
* CSP + HTTP security headers configuration
* Lightweight internal rate limiting & request sanitation
* Structured SEO config & JSON-LD generators
* Zod schema validation for type-safe runtime validation
* Prisma ORM for type-safe database operations
* Neon PostgreSQL for scalable data storage
* Dynamic browser language detection & auto-switching
* Advanced middleware for locale routing & redirections
* Dynamic sitemap & robots.txt generation

---

## 3. Key Features

User Experience & UI:

* Responsive, mobile‑first adaptive layout
* Theme switching (light/dark) with persistence
* Enhanced carousel showcases with autoplay (Embla Carousel 8.6.0)
* Animated hero, project & certification showcases
* Cookie consent banner & localized content (EN / DE / ES / SV / FR)
* Improved accessibility with ARIA support and keyboard navigation
* Browser language auto-detection with intelligent locale switching
* Advanced middleware for seamless locale routing
* Enhanced general styling & visual improvements

Content & Data:

* Dynamic project, technology, and certification data modules
* Real‑time GitHub MCP repository & profile fetch (sanitized & cached)
* Google PageSpeed Insights integration for performance transparency
* Enhanced type-safe API interfaces for all data endpoints
* Blog system with dynamic content management and filtering
* CRUD admin dashboard for comprehensive blog management
* Interactive chatbot system for visitor engagement
* Enhanced blog styling with error handling & fallbacks
* New dedicated pages: /media & /library for content showcase
* Dynamic sitemap & robots.txt generation for improved SEO
* Prisma ORM integration for efficient database operations

Engineering & Quality:

* Modular component architecture (segmented domains: hero, github, projects, tech, seo, ui primitives)
* ESLint 9.x flat config with strict TypeScript integration
* Enhanced type safety and performance optimizations
* Zero-tolerance policy for `any` types across the codebase
* Centralized & locale‑aware SEO handling (`SEOHead`, dynamic OG tags, canonical + `hreflang`)
* Schema.org structured data generation (Person, Breadcrumbs)
* 100/100 Lighthouse SEO score target (validated Sep 2025)
* No hydration warnings / zero console errors goal
* Comprehensive TypeScript coverage (SEO config types, i18n message surfaces, rate limiting utilities)

Security & Privacy (summary):

* Hardened headers, CSP, origin isolation mindset
* Input & error sanitization on API boundaries
* Zero hard‑coded credentials; environment isolation
* Rate limiting to mitigate abuse vectors
* Reinforced type safety to narrow attack surface (literal unions for locales & metadata)

---

## 4. Internationalization (i18n)

Runtime locale negotiation with graceful fallbacks:

* Framework: `next-intl` (server aware, streaming compatible)
* Supported locales: `en`, `de`, `es`, `sv`, `fr`
* Browser Language Detection: Automatic detection & intelligent switching
* Advanced Middleware: Seamless locale routing with proper redirections
* Selection Order: Browser preference → Default `en`
* Message Bundles: JSON under `messages/` (typed access enhancements on roadmap)

---

## 5. SEO & Discoverability

Advanced multi‑locale SEO system delivering consistent structured metadata:

* Config‑driven locale specific SEO objects
* Open Graph & Twitter card variants per locale (images, titles, descriptions)
* JSON-LD generation for Person + BreadcrumbList
* Canonical + alternate `hreflang` tags
* Keyword curation & skill taxonomy powering `knowsAbout`
* Dynamic sitemap.xml generation with automatic locale & page discovery
* Dynamic robots.txt with proper crawling directives
* Enhanced SEO improvements across all pages & components
* CSP‑compatible (no unsafe inline script proliferation)
* Verified 100/100 Lighthouse SEO score (Sep 2025) & 100 PageSpeed Insights SEO metric

---

## 6. Performance & Accessibility

Focus Areas:

* First Meaningful Paint minimization via streaming & selective client components
* Efficient image delivery (static assets + modern formats where suitable)
* Reduced JavaScript footprint (edge/server rendering bias)
* Accessible semantic structure (landmarks, labels, focus states)

---

## 7. Architecture Overview

High‑level structure:

* `app/` — Next.js routing (App Router, layouts, localized paths)
* `components/` — Domain + UI abstraction layers (hero, github, ui primitives, accessibility focus)
* `data/` — Structured static metadata (projects, certifications, tech)
* `lib/` — Cross‑cutting utilities (security, SEO, rate limiting / monitoring)
* `hooks/` — Custom React hooks (language, mobile detection, client gating)
* `public/` — Static assets (images, logos, sitemap, robots)

Design Principles:

* Separation of concerns (data vs presentation)
* Minimal surface area for API routes
* Immutable, typed content modules

---

## 8. API Surface

Comprehensive API endpoints with security-first design:

| Endpoint         | Purpose                                           | Notes                             |
| --- | --- | --- |
| `/api/about`     | Returns profile / about metadata                   | Static + typed                     |
| `/api/blog`       | Blog content management and retrieval             | Prisma + Zod                       |
| `/api/github`     | Fetches GitHub profile + repos (filtered)         | Tokenized (env)                   |
| `/api/pagespeed` | Surfaces PageSpeed metrics                         | Enhanced caching + error handling |
| `/api/chatbot`   | Interactive AI chatbot (Reem) for visitor queries |  OpenAI Responses API              |
| `/api/admin`     | Administrative operations for content             | Secured endpoints                 |

Controls:

* Input validation & schema constraints with Zod
* Standardized error envelopes (no internal leakage)
* Rate limiting (per IP windowed)
* Type-safe database operations via Prisma ORM
* Enhanced security headers and CSP compliance

---

## 9. Security & Hardening

Last internal assessment: 2025‑09 (latest iteration) — no known unresolved critical/high issues.

Implemented Layers (expanded in 4.11.15):

1. Transport & Headers: HSTS, CSP, X-Content-Type-Options, X-Frame-Options (deny), Referrer-Policy, Permissions-Policy..
2. Abuse Mitigation..
3. Dependency Hygiene: Routine audit (npm audit) — zero known CVEs at last scan; periodic verification of transitive packages relevant to security headers & i18n.
4. Automated Security: CodeQL Advanced Security Scanning for JavaScript, TypeScript, and Python with multi-language matrix analysis.
5. Dependency Security: Automated dependency review workflows blocking vulnerable dependencies in pull requests.

Security Posture Snapshot:

* Critical: 0
* High: 0
* Medium: 0
* Low/Informational: Monitored
* Automated Scanning: Active (CodeQL + Dependency Review)

---

## 10. GitHub Actions & Automation

Automated security and quality workflows ensuring code integrity and vulnerability management:

**CodeQL Advanced Security Scanning:**

* **Triggers**: Push to main, pull requests, scheduled weekly
* **Languages**: Actions, JavaScript/TypeScript, Python
* **Purpose**: Static analysis for security vulnerabilities, code quality issues, and potential attack vectors
* **Advanced Features**: Multi-language matrix analysis, configurable query packs, integration with GitHub Security tab

**Dependency Review:**

* **Triggers**: Pull requests to main branch
* **Purpose**: Scans dependency changes for known vulnerabilities and license compliance
* **Features**: Blocks PRs with vulnerable dependencies, provides detailed security reports in PR comments
* **Integration**: Automated comments on pull requests with dependency security analysis

**Lighthouse CI Performance Budgets:**

* **Triggers**: Pushes and pull requests to main branch, plus manual dispatch
* **Purpose**: Fails regressions before deployment when Lighthouse scores, Core Web Vitals lab metrics, or resource budgets cross configured thresholds
* **Budgets**: Performance score >= 0.80, accessibility score >= 0.95, LCP <= 2.5s, CLS <= 0.1, TBT <= 300ms, script <= 375 KiB, image <= 1,250 KiB, total page weight <= 2,000 KiB
* **Reports**: Saved as GitHub Actions artifacts from local filesystem output; no public temporary Lighthouse upload required

**Vercel CRON Jobs & Automation:**

* **PageSpeed Data Refresh**: Automated background refresh every 12 hours (`0 */12 * * *`)
* **Endpoint**: `/api/pagespeed/refresh` with extended 5-minute execution timeout
* **Purpose**: Keeps PageSpeed Insights data current without user-initiated requests
* **Caching Strategy**: 12-hour cache with 24-hour stale-while-revalidate for optimal performance
* **Vercel Redirections**: Advanced URL redirections & routing optimizations
* **Automated Background Tasks**: Comprehensive automation for data freshness & performance
* **Integration**: Seamless background updates maintaining data freshness for performance transparency

**Documentation & Quality Automation:**

* **TypeDoc Generation**: Automated documentation generation covering components, app, types, hooks, data, and more
* **Live Documentation**: Available at [https://docs.coldbydefault.com/](https://docs.coldbydefault.com/) with comprehensive API and component documentation
* **Command Integration**: `docs` script for comprehensive TypeDoc documentation pipeline
* **Coverage**: Expands across all major project directories with TypeScript configuration integration
* **Quality Gates**: Enhanced ESLint flat config system with TypeScript-ESLint integration

---

## 11. Privacy & Data Handling

* No invasive tracking; minimal analytical surface.
* Cookie consent banner gating non‑essential storage.
* No third‑party ad or profiling scripts.

---

## 12. Development (Local Setup)

Proprietary code; cloning allowed for personal viewing only (no reuse / redistribution).

Prerequisites: Node 20+ (LTS recommended), pnpm or npm.

Install & Run:

```bash
pnpm install
pnpm dev

```

---

## 13. License & Intellectual Property

Copyright © 2026 ColdByDefault. All rights reserved.

This repository is provided exclusively for viewing professional capability.

Restrictions (Summary):

- No copying, modification, redistribution, or derivative works.
- No commercial or personal reuse of code, assets, or design patterns.
- Use beyond viewing requires explicit prior written permission.

Refer to `LICENSE` & `COPYRIGHT` files for formal wording.

---

## 14. Contact
Portfolio: https://www.coldbydefault.com

Documentation: https://docs.coldbydefault.com/ 

For professional or security inquiries, reach out via the official channels listed above.
_P.S. If you find any bugs, they're not bugs - they're undocumented features!_

---

## 15. Special Thanks

<div align="center">

A heartfelt thank you to the amazing companies that provide free tiers and support for developers. Your generosity enables independent developers and open-source projects to thrive.

<br />

<a href="https://vercel.com">
  <img src="public/assets/icons/vercel.png" alt="Vercel" height="40" />
</a>

**[Vercel](https://vercel.com)** — For providing exceptional hosting, edge network, and deployment infrastructure that powers this portfolio with zero-config deployments and blazing-fast performance.

<br />

<a href="https://neon.tech">
  <img src="public/assets/icons/neon.png" alt="Neon" height="40" />
</a>

**[Neon](https://neon.tech)** — For offering a serverless PostgreSQL database with generous free tier, enabling scalable and reliable data storage without infrastructure overhead.

</div>

---

> Security research note: Responsible disclosure practices appreciated. Do not attempt exploitation against production infrastructure.
