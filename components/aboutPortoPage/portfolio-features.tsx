/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Eye,
  Code2,
  Database,
  GitBranch,
} from "lucide-react";

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  features: string[];
  highlight?: boolean;
}

const nextjsFeatures: FeatureItem[] = [
  {
    icon: Server,
    title: "Server Components & App Router",
    description:
      "Next.js 16.5.1 with React 19.1.1 server components for optimal performance",
    features: [
      "Zero-bundle server components",
      "Automatic static optimization",
      "Edge runtime support",
      "Streaming & Suspense",
      "Route groups (media), (legals)",
      "Parallel routes & intercepting",
    ],
    highlight: true,
  },
  {
    icon: Zap,
    title: "Performance Optimizations",
    description: "Lighthouse 100/100 with Core Web Vitals optimization",
    features: [
      "LCP < 2.5s consistently",
      "CLS < 0.1 layout stability",
      "FID < 100ms interactivity",
      "Image optimization & lazy loading",
      "Code splitting & tree shaking",
      "Vercel Edge Functions",
    ],
  },
  {
    icon: Shield,
    title: "Security Implementation",
    description: "Production-grade security with middleware and headers",
    features: [
      "Content Security Policy (CSP)",
      "Rate limiting middleware",
      "Request sanitization",
      "CSRF protection",
      "Secure headers (HSTS, X-Frame)",
      "Input validation with Zod",
    ],
  },
  {
    icon: Globe,
    title: "Internationalization",
    description: "next-intl 4.3.5 with 5 languages and SEO optimization",
    features: [
      "EN, DE, ES, FR, SV support",
      "Automatic locale detection",
      "SEO-optimized URLs",
      "Type-safe translations",
      "Dynamic routing",
      "Browser compatibility",
    ],
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Mobile-first approach with advanced responsive patterns",
    features: [
      "Tailwind CSS 4.1.12",
      "Custom responsive hooks",
      "Touch-friendly interfaces",
      "Progressive enhancement",
      "Cross-device compatibility",
      "Adaptive loading strategies",
    ],
  },
  {
    icon: Eye,
    title: "Accessibility & SEO",
    description: "WCAG 2.1 AA compliance with comprehensive SEO",
    features: [
      "Semantic HTML5 structure",
      "ARIA labels & roles",
      "Keyboard navigation",
      "Screen reader support",
      "JSON-LD structured data",
      "Open Graph optimization",
    ],
  },
  {
    icon: Code2,
    title: "TypeScript Excellence",
    description: "Strict TypeScript with comprehensive type safety",
    features: [
      "Zero 'any' types policy",
      "Discriminated unions",
      "Branded types",
      "Utility type patterns",
      "Runtime validation",
      "API type generation",
    ],
  },
  {
    icon: Database,
    title: "Data Layer",
    description: "Type-safe database operations with Prisma ORM",
    features: [
      "Neon PostgreSQL",
      "Prisma schema management",
      "Type-safe queries",
      "Migration management",
      "Connection pooling",
      "Edge-compatible queries",
    ],
  },
  {
    icon: GitBranch,
    title: "Development Workflow",
    description: "Modern development practices with quality assurance",
    features: [
      "ESLint 9.x strict rules",
      "Prettier code formatting",
      "Husky pre-commit hooks",
      "Automated testing",
      "Vercel deployment",
      "Performance monitoring",
    ],
  },
];

export function PortfolioFeatures() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Technical Excellence</h2>
        <p className="text-muted-foreground">
          Advanced Next.js 16 implementation showcasing modern web development
          practices
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {nextjsFeatures.map((feature, index) => (
          <Card
            key={index}
            className={`h-full transition-all hover:shadow-lg ${
              feature.highlight ? "ring-2 ring-primary/20 bg-primary/5" : ""
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    feature.highlight
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg leading-tight">
                    {feature.title}
                  </CardTitle>
                  {feature.highlight && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Core Feature
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feature.features.map((feat, featIndex) => (
                  <div key={featIndex} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 text-center">
        <h3 className="font-semibold mb-2">Portfolio Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-2xl font-bold text-primary">100/100</div>
            <div className="text-muted-foreground">Lighthouse Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">5</div>
            <div className="text-muted-foreground">Languages</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-muted-foreground">&apos;any&apos; Types</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">&lt;2.5s</div>
            <div className="text-muted-foreground">LCP Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
