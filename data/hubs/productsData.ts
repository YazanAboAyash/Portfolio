/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

export interface ProductMedia {
  type: "image" | "video";
  src: string;
  /** Shown while a video loads; ignored for images. */
  poster?: string;
  alt: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  media: ProductMedia;
  technologies: string[];
  /** Key into `Projects.categories` — used when the product is listed on /projects. */
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    title: "Princeps",
    description: "princeps",
    media: {
      type: "video",
      src: "/assets/products/princeps.mp4",
      poster: "/assets/products/princeps.png",
      alt: "Princeps AI workspace demo",
    },
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
    category: "aiMl",
  },
  {
    id: 2,
    title: "LogiX",
    description: "logix",
    media: {
      type: "image",
      src: "/assets/products/logix.jpg",
      alt: "LogiX working-time recording screenshot",
    },
    technologies: ["TypeScript", "PostgreSQL", "Self-hosted", "Compliance Engine"],
    category: "compliance",
  },
];
