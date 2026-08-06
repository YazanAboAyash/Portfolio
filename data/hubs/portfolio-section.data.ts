/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

import {
  Code,
  Globe,
  Target,
  Gauge,
  Shield,
  Languages,
  Database,
  Zap,
  Palette,
  Settings,
  GitBranch,
  TestTube,
  Rocket,
  CheckCircle,
  Search,
  Smartphone,
  Monitor,
  Layers,
} from "lucide-react";
import type {
  TechStackItem,
  ArchitectureNode,
  WorkflowStep,
  CodeExample,
  PerformanceMetric,
} from "@/types/hubs/portfolio-section.types";

// Infrastructure Layer
export const infrastructureNodes: ArchitectureNode[] = [
  {
    icon: Globe,
    title: "CDN & Edge Network",
    subtitle: "Vercel Edge Network + Global Distribution",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Shield,
    title: "Security Proxy Layer",
    subtitle: "proxy.ts + CSP Headers + Route Guards + Locale Detection",
    color: "bg-red-500/10 text-red-600",
  },
];

// Application Layer
export const applicationNodes: ArchitectureNode[] = [
  {
    icon: Code,
    title: "App Router (Next.js 16)",
    subtitle: "File-based routing + Server Components + Edge Runtime",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: Layers,
    title: "Route Groups & Layouts",
    subtitle: "(media) + (legals) + (live-tools) + admin + Shared Layouts",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Zap,
    title: "Loading & Error States",
    subtitle: "Group-level loading.tsx + Error Boundaries + not-found.tsx",
    color: "bg-yellow-500/10 text-yellow-600",
  },
  {
    icon: Settings,
    title: "Component Architecture",
    subtitle: "Feature Folders + Barrel Exports + Logic Separation",
    color: "bg-indigo-500/10 text-indigo-600",
  },
];

// Data & API Layer
export const dataNodes: ArchitectureNode[] = [
  {
    icon: Target,
    title: "API Routes Structure",
    subtitle: "Typed Route Handlers + Zod Validation + Rate Limiting",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: Database,
    title: "Database Layer",
    subtitle: "Neon PostgreSQL + Prisma ORM + Type Safety",
    color: "bg-purple-700/10 text-purple-700",
  },
  {
    icon: Languages,
    title: "Internationalization",
    subtitle: "next-intl 4.11 (EN/DE/ES/FR/SV) + Cookie-driven Locale",
    color: "bg-teal-500/10 text-teal-600",
  },
];

// Legacy export for backward compatibility
export const architectureNodes: ArchitectureNode[] = [
  ...infrastructureNodes,
  ...applicationNodes,
  ...dataNodes,
];

export const techStacks: TechStackItem[] = [
  {
    icon: Code,
    title: "Frontend Development",
    description:
      "Modern reactive interfaces with Next.js 16.2 and React 19.2, using App Router, server components, and performance-focused rendering.",
    technologies: [
      "Next.js 16.2",
      "React 19.2",
      "TypeScript 5.x",
      "Server Components",
      "Framer Motion 12.x",
      "React Hooks",
    ],
    level: 95,
  },
  {
    icon: Database,
    title: "Backend & Database",
    description:
      "Type-safe backend architecture with Prisma 7.8 and Neon PostgreSQL, including validated API handlers and secure admin routes.",
    technologies: [
      "Prisma 7.8",
      "Neon PostgreSQL",
      "Zod Validation",
      "Next.js API Routes",
      "Admin Session Validation",
      "Rate Limited Endpoints",
    ],
    level: 90,
  },
  {
    icon: Palette,
    title: "UI/UX & Design",
    description:
      "Accessible, responsive design systems with modern animations and cross-platform compatibility for optimal user experience.",
    technologies: [
      "Tailwind CSS 4.1.12",
      "Radix UI Primitives",
      "shadcn/ui Components",
      "Embla Carousel 8.6.0",
      "Lucide React Icons",
      "Responsive Design",
    ],
    level: 88,
  },
  {
    icon: Zap,
    title: "Performance & SEO",
    description:
      "Lighthouse 100/100 optimization with advanced caching strategies, Core Web Vitals optimization, and comprehensive SEO implementation.",
    technologies: [
      "Core Web Vitals",
      "Image Optimization",
      "Code Splitting",
      "JSON-LD Schema",
      "Open Graph Meta",
      "Vercel Analytics",
    ],
    level: 100,
  },
  {
    icon: Settings,
    title: "Development Tools",
    description:
      "Strict TypeScript workflow with linting, e2e + accessibility checks, and CI security automation for reliable releases.",
    technologies: [
      "ESLint 9.x",
      "TypeScript Strict Mode",
      "Playwright + axe-core",
      "CodeQL + Dependency Review",
      "Vercel Deployment",
      "TypeDoc",
    ],
    level: 92,
  },
  {
    icon: Languages,
    title: "Internationalization",
    description:
      "Multi-language support with next-intl 4.11, cookie-driven locale selection, and SEO-aware metadata across five locales.",
    technologies: [
      "next-intl 4.11",
      "Cookie-driven Locale",
      "5 Languages (EN/DE/ES/FR/SV)",
      "Locale Detection",
      "SEO Localization",
      "Type-safe Messages",
    ],
    level: 85,
  },
];

export const workflowSteps: WorkflowStep[] = [
  {
    icon: Target,
    label: "Planning & Architecture",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Code,
    label: "TypeScript Development",
    color: "bg-green-500/10 text-green-600",
  },
  {
    icon: TestTube,
    label: "Lint + E2E + A11y Checks",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: GitBranch,
    label: "Version Control",
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    icon: Rocket,
    label: "Vercel Deployment",
    color: "bg-red-500/10 text-red-600",
  },
  {
    icon: CheckCircle,
    label: "Security + Performance Validation",
    color: "bg-indigo-500/10 text-indigo-600",
  },
];

export const codeExamples: CodeExample[] = [
  {
    title: "Admin Session Validation",
    language: "TypeScript",
    code: `// Stateless HMAC cookie session validation
export function hasValidAdminSession(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;

  const [randomId, expiresAtRaw, signature] = token.split(".");
  if (!randomId || !expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const payload = randomId + "." + expiresAtRaw;
  const expectedSignature = createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`,
  },
  {
    title: "Chat Input Validation",
    language: "TypeScript",
    code: `// Validate and sanitize chat input before provider calls
const body = await request.json();
const parsed = chatRequestSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
}

const cleanedMessage = sanitizeChatInput(parsed.data.message);
if (!cleanedMessage) {
  return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
}

if (isChatSpam(cleanedMessage)) {
  return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
}

const rateLimit = await chatbotLimiter.check(getClientIP(request));
if (!rateLimit.success) {
  return NextResponse.json({ error: "RATE_LIMIT_EXCEEDED" }, { status: 429 });
}`,
  },
  {
    title: "Feature Folder Pattern",
    language: "TypeScript",
    code: `// Feature-oriented component organization
components/blog/
  index.ts                 // Barrel exports
  BlogPageClient.tsx       // Main UI component
  BlogView.tsx             // Presentation component
  BlogsList.tsx            // List rendering component

types/
  main/                    // Shared object interfaces
  hubs/                    // Section-specific types

lib/blog-admin/
  blog-create.service.ts   // Business logic and validation
  blog-update.service.ts   // Update workflows
  blog-query.service.ts    // Read/query operations`,
  },
];

// Route Structure Details
export const routeStructure = {
  rootLayout: {
    name: "Root Layout",
    path: "app/layout.tsx",
    features: [
      "Theme Provider",
      "Navigation",
      "Footer",
      "Analytics",
      "Internationalization",
    ],
  },
  routeGroups: [
    {
      name: "(media)",
      description: "Public content routes",
      routes: ["about", "about-portfolio", "blog", "projects", "services"],
      layout: "Specialized media layout with enhanced SEO",
    },
    {
      name: "(live-tools)",
      description: "Interactive tool pages",
      routes: ["automation-audit", "polite-email", "rio-calculator"],
      layout: "Tool-focused layout with shared loading state",
    },
    {
      name: "(legals)",
      description: "Legal pages",
      routes: ["impressum", "privacy"],
      layout: "Clean legal document layout",
    },
    {
      name: "admin",
      description: "Admin dashboard",
      routes: ["blog", "chatbot"],
      layout: "Protected admin interface",
    },
  ],
  apiRoutes: [
    "api/about/*",
    "api/admin/*",
    "api/automation-audit/*",
    "api/blog/*",
    "api/chatbot/*",
    "api/email-rewrite/*",
    "api/github/*",
    "api/speed-insight/*",
  ],
};

// Component Organization
export const componentStructure = {
  pattern: "Feature Folders + Global Types/Hooks + Logic Separation",
  structure: [
    {
      folder: "components/[ComponentName]/",
      files: [
        "index.ts (Exports)",
        "ComponentName.tsx (UI)",
        "ComponentName.utils.ts (Utilities)",
        "ComponentName.logic.ts (Business Logic)",
        "ComponentName.constants.ts (Constants)",
      ],
    },
    {
      folder: "hooks/",
      description: "Global reusable hooks",
      examples: ["use-chatbot.ts", "use-client.ts", "use-mobile.ts"],
    },
    {
      folder: "lib/",
      description: "Cross-component utilities",
      examples: ["security.ts", "configs/seo.ts", "blog-admin/*"],
    },
  ],
};

export const performanceMetrics: PerformanceMetric[] = [
  {
    icon: Gauge,
    title: "Core Web Vitals",
    description:
      "Lighthouse 100/100 performance scores with optimized Core Web Vitals metrics for exceptional user experience.",
    items: [
      "Largest Contentful Paint (LCP) < 2.5s",
      "Cumulative Layout Shift (CLS) < 0.1",
    ],
    score: 95,
  },
  {
    icon: Search,
    title: "SEO Optimization",
    description:
      "Comprehensive SEO implementation achieving 100/100 Lighthouse SEO score with structured data and meta optimization.",
    items: [
      "JSON-LD structured data schema",
      "Multi-language SEO optimization",
    ],
    score: 100,
  },
  {
    icon: Zap,
    title: "Build Optimization",
    description:
      "Optimized builds with Next.js 16, selective client boundaries, and targeted code-splitting for predictable runtime performance.",
    items: [
      "Server-first rendering strategy",
      "Targeted dynamic imports for heavy client modules",
    ],
    score: 91,
  },
  {
    icon: Monitor,
    title: "Accessibility",
    description:
      "WCAG 2.1 AA compliance with comprehensive accessibility features ensuring inclusive user experience.",
    items: ["Screen reader compatibility", "Color contrast ≥ 4.5:1 ratio"],
    score: 92,
  },
  {
    icon: Smartphone,
    title: "Mobile Performance",
    description:
      "Mobile-first responsive design with route-group loading states and accessible interactions across screen sizes.",
    items: [
      "Responsive breakpoint optimization",
      "Touch-first navigation and controls",
    ],
    score: 80,
  },
  {
    icon: Shield,
    title: "Security & Headers",
    description:
      "Production-grade security implementation with CSP headers, rate limiting, and comprehensive security measures.",
    items: [
      "Content Security Policy (CSP) headers",
      "Input validation & Zod schemas",
    ],
    score: 97,
  },
];
