/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import {
  Bot,
  Boxes,
  Database,
  Globe2,
  LockKeyhole,
  Route,
  ShieldCheck,
  TestTube2,
} from "lucide-react";

export const ABOUT_PORTFOLIO_METADATA = {
  title: "About this site",
  description:
    "A concise technical overview of the ColdByDefault portfolio: its stack, architecture, privacy posture, and quality workflow.",
  keywords: [
    "ColdByDefault portfolio",
    "Next.js portfolio architecture",
    "TypeScript",
    "Vercel",
    "MCP server",
  ],
} as const;

export const ABOUT_PORTFOLIO_CONTENT = {
  title: "About this site",
  lead: "The technology and principles behind the ColdByDefault portfolio.",
  languageNotice: "Written in English",
  introduction:
    "This is a working portfolio, not a template: a place to show the projects, explain the thinking behind them, and make the underlying information useful to both people and tools.",
  stackTitle: "At a glance",
  stackLead:
    "A server-first Next.js application, with a deliberately small client surface where interaction adds value.",
  principlesTitle: "A quieter version of the site",
  principlesLead:
    "Version 7 trades visual noise for a clearer hierarchy: direct headings, flat fields, purposeful motion, and room for the work itself.",
  practiceTitle: "Built for a public portfolio",
  practiceLead:
    "The implementation treats trust, maintenance, and discoverability as product concerns rather than finishing touches.",
  linksTitle: "Keep exploring",
  linksLead:
    "Read the generated reference material or see the public work behind the site.",
  principles: [
    {
      icon: Route,
      title: "Content comes first",
      description:
        "Projects, writing, and capabilities lead the experience. The interface stays out of their way while still making the connections between them easy to follow.",
    },
    {
      icon: Boxes,
      title: "One system, not one-off pages",
      description:
        "Shared page framing, section headings, flat surface cards, and motion rules keep new content visually consistent without flattening every page into the same layout.",
    },
    {
      icon: LockKeyhole,
      title: "Privacy is part of the design",
      description:
        "The site avoids invasive tracking. Optional chatbot logging requires explicit consent, and public APIs expose only intentionally selected information.",
    },
  ],
} as const;

export const ABOUT_PORTFOLIO_STACK = [
  {
    icon: Globe2,
    value: "Next.js 16",
    label: "App Router and server-first rendering",
  },
  {
    icon: Boxes,
    value: "React 19 + TypeScript",
    label: "Strict, typed application code",
  },
  {
    icon: Route,
    value: "Tailwind CSS 4",
    label: "The v7 visual system and responsive layout",
  },
  {
    icon: Database,
    value: "Prisma + Neon",
    label: "PostgreSQL for the blog and consented chat logs",
  },
  {
    icon: Bot,
    value: "AI SDK + MCP",
    label: "Streaming assistant and public read-only tools",
  },
  {
    icon: Globe2,
    value: "Vercel",
    label: "Hosting, edge delivery, analytics, and speed insights",
  },
] as const;

export const ABOUT_PORTFOLIO_PRACTICES = [
  {
    icon: ShieldCheck,
    title: "Guarded at the edges",
    description:
      "The public and administrative surfaces have different responsibilities, so their checks stay close to the routes that need them.",
    points: [
      "Validated input and request-size limits on API routes",
      "Rate limiting for AI, MCP, and administrative endpoints",
      "Stateless HMAC-signed admin sessions and independent API authorization",
    ],
  },
  {
    icon: TestTube2,
    title: "Checked before it ships",
    description:
      "The routine is intentionally boring: types and linting catch problems early, then browser and accessibility checks cover the public experience.",
    points: [
      "TypeScript strict mode and ESLint across the application",
      "Playwright end-to-end tests with axe accessibility assertions",
      "CodeQL and dependency review in GitHub Actions, with Vercel deployment",
    ],
  },
] as const;

export const ABOUT_PORTFOLIO_LINKS = [
  {
    href: "https://docs.coldbydefault.com/",
    label: "Technical documentation",
    description: "Generated API and component reference material.",
    external: true,
  },
  {
    href: "https://github.com/yazanaboayash",
    label: "GitHub",
    description: "Public repositories and open-source work by ColdByDefault.",
    external: true,
  },
] as const;
