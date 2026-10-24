/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import type { TwitterCardType } from "@/types/configs/metadata";
import type {
  SEOConfig,
  LegalPageContent,
  MediaSectionContent,
} from "@/types/configs/seo";

// Common keywords to reduce duplication
const COMMON_TECH_KEYWORDS = [
  "React",
  "Next.js",
  "Node.js",
  "AI",
  "Automation",
  "RAG Systems",
  "MVP development",
  "TypeScript",
  "JavaScript",
  "n8n",
  "AI Agent",
];

const COMMON_ROLE_KEYWORDS_EN = [
  "Full Stack Developer",
  "AI Engineer",
  "Web Developer",
  "Frontend Developer",
  "Backend Developer",
  "LLM Application Developer",
  "RAG Systems Developer",
];

const COMMON_ROLE_KEYWORDS_DE = [
  "Full Stack Entwickler",
  "AI Engineer",
  "KI-Entwickler",
  "Web Entwickler",
  "Frontend Entwickler",
  "Backend Entwickler",
  "LLM-Anwendungsentwickler",
  "RAG Systementwickler",
];

const COMMON_CONCEPTS_EN = [
  "ColdByDefault",
  "Yazan Abo-Ayash",
  "Portfolio",
  "API Development",
  "Responsive Design",
  "Modern Web Technologies",
  "AI Engineering",
  "LLM Applications",
  "RAG Systems",
  "AI Agents",
];

const COMMON_CONCEPTS_DE = [
  "ColdByDefault",
  "Yazan Abo-Ayash",
  "Portfolio",
  "API Entwicklung",
  "Responsive Design",
  "Moderne Webtechnologien",
  "AI Engineering",
  "LLM-Anwendungen",
  "RAG Systeme",
  "KI-Agenten",
];

// Regional keywords so people searching for developers around Schwetzingen /
// the Rhein-Neckar metro area find the portfolio. German set is the primary target; English set is a lighter subset for
// non-German searchers who still search by region name.
const REGIONAL_KEYWORDS_DE = [
  "Webentwickler Mannheim",
  "Full Stack Entwickler Rhein-Neckar",
  "Webentwicklung Ludwigshafen",
  "Softwareentwicklung Metropolregion Rhein-Neckar",
];

const REGIONAL_KEYWORDS_EN = [
  "Web Developer Rhein-Neckar",
  "Web Developer Mannheim",
  "Web Developer Heidelberg",
  "Full Stack Developer Schwetzingen Germany",
];

// Base configuration with shared values to reduce duplication
export const BASE_CONFIG = {
  author: "Yazan Abo-Ayash (ColdByDefault™)",
  siteUrl: "https://www.coldbydefault.com",
  siteName: "Yazan Abo-Ayash Portfolio © ColdByDefault™",
  twitter: {
    handle: "@ColdByDefault",
    cardType: "summary_large_image" as TwitterCardType,
  },
  structured: {
    name: "Yazan Abo-Ayash",
    email: "contact@yazan-abo-ayash.de",
    github: "https://github.com/yazanaboayash",
    skills: [
      "React",
      "Next.js",
      "Node.js",
      "Python",
      "TypeScript",
      "JavaScript",
      "Express.js",
      "PostgreSQL",
      "AI Engineering",
      "Large Language Models (LLM)",
      "RAG Systems",
      "Workflow Automation",
      "Docker",
      "Git",
      "Tailwind CSS",
      "n8n",
      "AI Agents",
      "Anthropic Claude API",
      "Azure AI",
      "pgvector",
      "Drizzle ORM",
      "Better Auth",
      "Stripe",
      "Model Context Protocol (MCP)",
      "Speech-to-Text and Text-to-Speech",
    ],
    // City + postal code only — the exact street address stays confined to the
    // Impressum.
    address: {
      locality: "Schwetzingen",
      postalCode: "68723",
      region: "Baden-Württemberg",
      country: "DE",
    },
  },
};

// English SEO Configuration
export const seoConfigEN: SEOConfig = {
  title:
    "Yazan Abo-Ayash | Full-Stack Developer & AI Engineer - ColdByDefault™",
  description:
    "Full-Stack Developer & AI Engineer. Production web applications with Next.js and TypeScript, and the AI inside them: LLM features, RAG systems, AI agents and MCP servers.",
  keywords: [
    ...COMMON_ROLE_KEYWORDS_EN,
    ...COMMON_TECH_KEYWORDS.map((tech) => `${tech} Developer`),
    "Computer Science Student",
    ...COMMON_CONCEPTS_EN,
    ...REGIONAL_KEYWORDS_EN,
  ],
  ...BASE_CONFIG,
  locale: "en_US",
  alternateLocales: ["de_DE"],
  openGraph: {
    title: "Yazan Abo-Ayash | Full-Stack Developer & AI Engineer",
    description:
      "Full-Stack Developer & AI Engineer building production web applications and LLM features: RAG systems, AI agents and MCP servers.",
    type: "website",
    image: "/og-image-en.jpg",
    imageAlt: "ColdByDefault™ Portfolio - Full-Stack Developer & AI Engineer",
  },
  structured: {
    ...BASE_CONFIG.structured,
    jobTitle: "Full-Stack Developer & AI Engineer",
    description:
      "Full-Stack Developer & AI Engineer specializing in Next.js, TypeScript, LLM applications, RAG systems, AI agents and MCP servers.",
  },
};

// German SEO Configuration
export const seoConfigDE: SEOConfig = {
  title:
    "Yazan Abo-Ayash | Full-Stack-Entwickler & AI Engineer - ColdByDefault™",
  description:
    "Full-Stack-Entwickler & AI Engineer. Produktive Webanwendungen mit Next.js und TypeScript – und die KI darin: LLM-Features, RAG-Systeme, KI-Agenten und MCP-Server.",
  keywords: [
    ...COMMON_ROLE_KEYWORDS_DE,
    ...COMMON_TECH_KEYWORDS.map((tech) => `${tech} Entwickler`),
    "Informatik",
    "Webentwicklung Deutschland",
    "Programmierer",
    "Softwareentwickler",
    "AI Entwickler",
    "Automatisierungsentwickler",
    "MVP Entwicklung",
    ...COMMON_CONCEPTS_DE,
    ...REGIONAL_KEYWORDS_DE,
  ],
  ...BASE_CONFIG,
  locale: "de_DE",
  alternateLocales: ["en_US"],
  openGraph: {
    title: "Yazan Abo-Ayash | Full-Stack-Entwickler & AI Engineer",
    description:
      "Full-Stack-Entwickler & AI Engineer: produktive Webanwendungen und LLM-Features – RAG-Systeme, KI-Agenten und MCP-Server.",
    type: "website",
    image: "/og-image-de.jpg",
    imageAlt: "ColdByDefault™ Portfolio - Full-Stack-Entwickler & AI Engineer",
  },
  structured: {
    ...BASE_CONFIG.structured,
    jobTitle: "Full-Stack-Entwickler & AI Engineer",
    description:
      "Full-Stack-Entwickler & AI Engineer, spezialisiert auf Next.js, TypeScript, LLM-Anwendungen, RAG-Systeme, KI-Agenten und MCP-Server.",
  },
};

// Legal page content data
export const legalPageContent: LegalPageContent = {
  privacy: {
    en: {
      title: "Privacy Policy",
      description:
        "Learn how we collect, use, and protect your personal information on our website.",
      keywords: [
        "privacy policy",
        "data protection",
        "GDPR",
        "personal information",
        "cookies",
      ],
      path: "/privacy",
    },
    de: {
      title: "Datenschutzerklärung",
      description:
        "Erfahren Sie, wie wir Ihre persönlichen Daten auf unserer Website sammeln, verwenden und schützen.",
      keywords: [
        "Datenschutzerklärung",
        "Datenschutz",
        "DSGVO",
        "persönliche Daten",
        "Cookies",
      ],
      path: "/privacy",
    },
  },
  impressum: {
    en: {
      title: "Legal Notice",
      description:
        "Legal information and contact details as required by German law.",
      keywords: [
        "legal notice",
        "impressum",
        "contact information",
        "legal requirements",
      ],
      path: "/impressum",
    },
    de: {
      title: "Impressum",
      description:
        "Rechtliche Informationen und Kontaktdaten nach deutschem Recht.",
      keywords: [
        "Impressum",
        "rechtliche Informationen",
        "Kontaktdaten",
        "Anbieterkennzeichnung",
      ],
      path: "/impressum",
    },
  },
  terms: {
    en: {
      title: "Terms of Service",
      description: "Terms and conditions for using our website and services.",
      keywords: [
        "terms of service",
        "terms and conditions",
        "user agreement",
        "legal terms",
      ],
      path: "/terms",
    },
    de: {
      title: "Nutzungsbedingungen",
      description:
        "Allgemeine Geschäftsbedingungen für die Nutzung unserer Website und Dienste.",
      keywords: [
        "Nutzungsbedingungen",
        "AGB",
        "Nutzungsvereinbarung",
        "rechtliche Bedingungen",
      ],
      path: "/terms",
    },
  },
};

// Media section content data
export const mediaSectionContent: MediaSectionContent = {
  about: {
    en: {
      title: "About Me - Full Stack Developer",
      description:
        "Learn more about my journey, philosophy, and passion for creating exceptional digital experiences. Currently interning at Avarno GmbH, specializing in Next.js, React, and modern web technologies.",
      keywords: [
        "about",
        "developer",
        "full stack",
        ...COMMON_TECH_KEYWORDS,
        "web development",
        "software engineer",
        "Avarno GmbH",
      ],
      path: "/about",
    },
    de: {
      title: "Über Mich - Full Stack Entwickler",
      description:
        "Erfahren Sie mehr über meinen Werdegang, meine Philosophie und meine Leidenschaft für die Erstellung außergewöhnlicher digitaler Erlebnisse. Derzeit Praktikant bei Avarno GmbH, spezialisiert auf Next.js, React und moderne Webtechnologien.",
      keywords: [
        "über mich",
        "Entwickler",
        "Full Stack",
        ...COMMON_TECH_KEYWORDS,
        "Webentwicklung",
        "Software Ingenieur",
        "Avarno GmbH",
      ],
      path: "/about",
    },
  },
  blog: {
    en: {
      title: "Blog - Web Development & Technology",
      description:
        "Discover articles about web development, programming, and technology. Sharing insights and tutorials on modern development practices.",
      keywords: [
        "blog",
        "articles",
        "tutorials",
        "web development",
        "programming",
        "technology",
        ...COMMON_TECH_KEYWORDS.slice(0, 2), // Just Next.js and React for blog
      ],
      path: "/blog",
    },
    de: {
      title: "Blog - Webentwicklung & Technologie",
      description:
        "Entdecken Sie Artikel über Webentwicklung, Programmierung und Technologie. Teilen von Einblicken und Tutorials zu modernen Entwicklungspraktiken.",
      keywords: [
        "Blog",
        "Artikel",
        "Tutorials",
        "Webentwicklung",
        "Programmierung",
        "Technologie",
        ...COMMON_TECH_KEYWORDS.slice(0, 2), // Just Next.js and React for blog
      ],
      path: "/blog",
    },
  },
  projects: {
    en: {
      title: "Projects - Full Stack Development Showcase",
      description:
        "Explore my portfolio of web development projects, including full-stack applications, React components, and modern web solutions.",
      keywords: [
        "projects",
        "portfolio",
        "web development",
        "full stack",
        ...COMMON_TECH_KEYWORDS.slice(0, 3), // React, Next.js, Node.js
        "applications",
      ],
      path: "/projects",
    },
    de: {
      title: "Projekte - Full Stack Entwicklung Showcase",
      description:
        "Entdecken Sie mein Portfolio von Webentwicklungsprojekten, einschließlich Full-Stack-Anwendungen, React-Komponenten und modernen Web-Lösungen.",
      keywords: [
        "Projekte",
        "Portfolio",
        "Webentwicklung",
        "Full Stack",
        ...COMMON_TECH_KEYWORDS.slice(0, 3), // React, Next.js, Node.js
        "Anwendungen",
      ],
      path: "/projects",
    },
  },
  library: {
    en: {
      title: "Library - Code Resources & Components",
      description:
        "Browse through my collection of reusable components, code snippets, and development resources for modern web applications.",
      keywords: [
        "library",
        "components",
        "code resources",
        "snippets",
        "reusable",
        "web development",
      ],
      path: "/library",
    },
    de: {
      title: "Bibliothek - Code Ressourcen & Komponenten",
      description:
        "Durchstöbern Sie meine Sammlung von wiederverwendbaren Komponenten, Code-Snippets und Entwicklungsressourcen für moderne Webanwendungen.",
      keywords: [
        "Bibliothek",
        "Komponenten",
        "Code Ressourcen",
        "Snippets",
        "wiederverwendbar",
        "Webentwicklung",
      ],
      path: "/library",
    },
  },
  aboutPortfolio: {
    en: {
      title: "About This Portfolio - Architecture & Tech Stack",
      description:
        "A technical walkthrough of how this portfolio is built: Next.js App Router architecture, tech stack, workflows, and performance metrics.",
      keywords: [
        "portfolio architecture",
        "tech stack",
        ...COMMON_TECH_KEYWORDS,
        "App Router",
        "web performance",
      ],
      path: "/about-portfolio",
    },
    de: {
      title: "Über dieses Portfolio - Architektur & Tech-Stack",
      description:
        "Ein technischer Einblick in den Aufbau dieses Portfolios: Next.js App-Router-Architektur, Tech-Stack, Workflows und Performance-Kennzahlen.",
      keywords: [
        "Portfolio Architektur",
        "Tech-Stack",
        ...COMMON_TECH_KEYWORDS,
        "App Router",
        "Web Performance",
      ],
      path: "/about-portfolio",
    },
  },
};
