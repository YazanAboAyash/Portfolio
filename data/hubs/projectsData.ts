/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

export interface Project {
  id: number;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  npmUrl?: string;
  featured: boolean;
  category: string;
  license?: {
    type: "copyright" | "open-source" | "fully-open" | "mit" | "agpl";
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Portfolio Website v6",
    description: "portfolioWebsite",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "React Icons",
    ],
    githubUrl: "https://github.com/yazanaboayash/portfolio",
    liveUrl: "https://coldbydefault.com",
    image: "/assets/projects/alltracks.png",
    featured: false,
    category: "webDevelopment",
    license: {
      type: "copyright",
      text: "copyright",
      variant: "destructive",
    },
  },
  {
    id: 2,
    title: "beRich.Hub v5",
    description: "berichHub",
    technologies: [
      "Next.js",
      "React",
      "PostgreSQL",
      "Kinde Auth",
      "NeonDB",
      "LLM",
      "LangChain",
      "next-internationalization",
    ],
    githubUrl: "https://github.com/yazanaboayash/berichhub",
    featured: false,
    image: "/assets/projects/berich.png",
    category: "fullStack",
    license: {
      type: "open-source",
      text: "openSource",
      variant: "secondary",
    },
  },
  {
    id: 3,
    title: "Voice-to-Notion Automation",
    description: "voiceToNotion",
    image: "/assets/projects/meeting.png",
    technologies: ["Next.js", "TypeScript", "Groq AI (Whisper)", "Notion API"],
    githubUrl: "https://github.com/yazanaboayash/meeting-intelligence",
    featured: false,
    category: "aiMl",
    license: {
      type: "copyright",
      text: "copyright",
      variant: "destructive",
    },
  },
  {
    id: 5,
    title: "next-seo-lite",
    description: "nextJsSeoOptimization",
    image: "/assets/projects/next-seo.png",
    technologies: ["Next.js", "TypeScript", "npm package", "SEO", "JSON-LD"],
    githubUrl: "https://github.com/yazanaboayash/next-seo-lite",
    npmUrl: "https://www.npmjs.com/package/@coldbydefault/next-seo-lite",
    featured: false,
    category: "fullStack",
    license: {
      type: "mit",
      text: "mit",
      variant: "secondary",
    },
  },
  {
    id: 6,
    title: "Customizable Better-Auth Demo",
    description: "customizableBetterAuth",
    image: "/assets/projects/auth.png",
    technologies: ["Next.js", "TypeScript", "BetterAuth", "Customizable Auth"],
    githubUrl: "https://github.com/yazanaboayash/ready-to-use-auth",
    liveUrl: "",
    featured: false,
    category: "fullStack",
    license: {
      type: "mit",
      text: "mit",
      variant: "secondary",
    },
  },
  {
    id: 7,
    title: "Princeps",
    description: "princeps",
    technologies: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "pgvector",
      "Prisma",
      "Better Auth",
      "Stripe",
      "Ollama",
      "Docker",
    ],
    githubUrl: "https://github.com/yazanaboayash/princeps",
    image: "/assets/projects/princeps.png",
    featured: true,
    category: "aiMl",
    license: {
      type: "agpl",
      text: "agpl",
      variant: "secondary",
    },
  },
];
