/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { RAG_SOURCE_URLS, ragConfig } from "@/data/configs/rag";
import {
  ABOUT_PORTFOLIO_CONTENT,
  ABOUT_PORTFOLIO_LINKS,
  ABOUT_PORTFOLIO_PRACTICES,
  ABOUT_PORTFOLIO_STACK,
} from "@/data/hubs/about-portfolio.data";
import { products } from "@/data/hubs/productsData";
import { projects } from "@/data/hubs/projectsData";
import { aboutData } from "@/data/main/aboutData";
import aboutProfile from "@/data/main/aboutProfile.json";
import {
  capabilities,
  stackGroups,
  techIconLabels,
} from "@/data/main/capabilitiesData";
import { certifications } from "@/data/main/certificationsData";
import { message } from "@/lib/mcp/portfolio-tools";
import enMessages from "@/messages/en.json";
import type { KnowledgeDocument } from "@/types/configs/rag";

/**
 * Everything Reem can retrieve besides blog posts, as English prose. The
 * pages and SEO keep rendering from `data/`; this only reads it, so the index
 * never drifts from what the site shows (as long as `rag:index` runs on deploy).
 */

/** Presentation fields and UI labels that carry no facts. */
const SKIPPED_KEYS = new Set([
  "icon",
  "image",
  "media",
  "meta",
  "id",
  "order",
  "socialLinks",
  "explore",
  "cta",
]);

function label(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function indent(text: string, first: string, rest: string): string {
  return text
    .split("\n")
    .map((line, index) => (index === 0 ? first : rest) + line)
    .join("\n");
}

/** Nested data as YAML-like "Key: value" lines, which embed far better than JSON. */
function toProse(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => toProse(item))
      .filter(Boolean)
      .map((text) => indent(text, "- ", "  "))
      .join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([key, item]) => !SKIPPED_KEYS.has(key) && typeof item !== "function")
      .map(([key, item]) => {
        const text = toProse(item);
        if (!text) return "";
        return text.includes("\n")
          ? `${label(key)}:\n${indent(text, "  ", "  ")}`
          : `${label(key)}: ${text}`;
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function dataDoc(
  sourceId: string,
  title: string,
  url: string,
  text: string,
): KnowledgeDocument {
  return { sourceType: "data", sourceId, title, url, language: "en", text };
}

function aboutDocuments(): KnowledgeDocument[] {
  const profileSections = Object.entries(aboutProfile).filter(
    ([key]) => !SKIPPED_KEYS.has(key),
  );

  return [
    dataDoc("about:page", "About Yazan", RAG_SOURCE_URLS.about, toProse(enMessages.About)),
    dataDoc("about:story", "About Yazan — story and values", RAG_SOURCE_URLS.about, toProse(aboutData)),
    dataDoc(
      "about:hero",
      "Yazan in short",
      RAG_SOURCE_URLS.about,
      toProse({
        role: enMessages.Hero.fullStackDeveloper,
        description: enMessages.Hero.description,
        focusedOn: enMessages.Hero.now.focusItems,
        contact: enMessages.Contact.lead,
        availability: enMessages.Contact.availability,
      }),
    ),
    ...profileSections.map(([key, section]) =>
      dataDoc(
        `about-profile:${key}`,
        `About Yazan — ${label(key).toLowerCase()}`,
        RAG_SOURCE_URLS.about,
        toProse(section),
      ),
    ),
  ];
}

function workDocuments(): KnowledgeDocument[] {
  return [
    ...products.map((product) =>
      dataDoc(
        `product:${product.description}`,
        product.title,
        RAG_SOURCE_URLS.projects,
        toProse({
          kind: "Commercial product (closed source)",
          description: message(`Products.descriptions.${product.description}`),
          technologies: product.technologies.join(", "),
        }),
      ),
    ),
    ...projects.map((project) =>
      dataDoc(
        `project:${project.description}`,
        project.title,
        RAG_SOURCE_URLS.projects,
        toProse({
          kind: "Open-source project",
          description: message(`Projects.descriptions.${project.description}`),
          category: message(`Projects.categories.${project.category}`),
          technologies: project.technologies.join(", "),
          license: project.license
            ? message(`Projects.licenses.${project.license.text}`)
            : null,
          github: project.githubUrl,
          liveSite: project.liveUrl,
          npm: project.npmUrl,
        }),
      ),
    ),
  ];
}

function capabilityDocuments(): KnowledgeDocument[] {
  return [
    ...capabilities.map((capability) =>
      dataDoc(
        `capability:${capability.id}`,
        `What Yazan delivers — ${message(`Capabilities.${capability.titleKey}`)}`,
        RAG_SOURCE_URLS.capabilities,
        toProse({
          headline: message(`Capabilities.${capability.headlineKey}`),
          description: message(`Capabilities.${capability.descriptionKey}`),
          technologies: (capability.techIcons ?? [])
            .map((icon) => techIconLabels[icon] ?? icon)
            .join(", "),
        }),
      ),
    ),
    dataDoc(
      "capabilities:pipeline",
      "How a change ships in Yazan's projects",
      RAG_SOURCE_URLS.capabilities,
      toProse(enMessages.Capabilities.pipeline),
    ),
    dataDoc(
      "capabilities:stack",
      "Yazan's tech stack",
      RAG_SOURCE_URLS.capabilities,
      toProse(
        stackGroups.map((group) => ({
          layer: message(`Capabilities.stack.groups.${group.id}`),
          tools: group.tools.map((tool) => tool.name).join(", "),
          practices: group.practices.join(", "),
        })),
      ),
    ),
    ...certifications.map((certification) =>
      dataDoc(
        `certification:${certification.descriptionKey}`,
        `Certification — ${certification.title}`,
        RAG_SOURCE_URLS.certifications,
        toProse({
          issuer: certification.issuerKey
            ? message(`Certifications.issuers.${certification.issuerKey}`)
            : certification.issuer,
          year: certification.date,
          description: message(
            `Certifications.descriptions.${certification.descriptionKey}`,
          ),
        }),
      ),
    ),
  ];
}

/** `data/knowledge/*.md`, titled by their first `# ` heading. README.md documents the folder. */
async function noteDocuments(): Promise<KnowledgeDocument[]> {
  const dir = path.join(process.cwd(), ragConfig.notesDir);
  const files = (await readdir(dir)).filter(
    (file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md",
  );

  return Promise.all(
    files.map(async (file) => {
      const text = await readFile(path.join(dir, file), "utf8");
      const name = file.replace(/\.md$/, "");
      return {
        sourceType: "note" as const,
        sourceId: `note:${name}`,
        title: /^#\s+(.+)$/m.exec(text)?.[1]?.trim() ?? label(name),
        url: RAG_SOURCE_URLS.about,
        language: "en",
        text,
      };
    }),
  );
}

export async function buildStaticDocuments(): Promise<KnowledgeDocument[]> {
  const documents = [
    ...aboutDocuments(),
    ...workDocuments(),
    ...capabilityDocuments(),
    dataDoc(
      "site:about-portfolio",
      "How this portfolio site is built",
      RAG_SOURCE_URLS.aboutPortfolio,
      toProse({
        overview: ABOUT_PORTFOLIO_CONTENT,
        stack: ABOUT_PORTFOLIO_STACK,
        practices: ABOUT_PORTFOLIO_PRACTICES,
        links: ABOUT_PORTFOLIO_LINKS,
      }),
    ),
    ...(await noteDocuments()),
  ];
  return documents.filter((document) => document.text.trim());
}
