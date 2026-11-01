/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

/**
 * Reem's retrieval index (lib/rag). The embedding model comes from the
 * `EMBEDDING_MODEL` env var; with it unset, Reem has no search tool and
 * indexing is skipped. The model's dimension is fixed in `vector(3072)` on
 * KnowledgeChunk.embedding (prisma/schema.prisma): changing the model means a
 * schema change and a full re-index.
 */
export const ragConfig = {
  /** Target chunk length in characters, and how much of the previous chunk repeats. */
  chunkSize: 1000,
  chunkOverlap: 150,
  topK: 5,
  /**
   * Cosine similarity below this is dropped unless the chunk also matches a
   * query keyword. With text-embedding-3-large, unrelated text scores ~0.15–0.2.
   */
  minScore: 0.25,
  /** Reciprocal rank fusion constant: higher flattens the gap between ranks. */
  rrfK: 60,
  siteUrl: "https://coldbydefault.com",
} as const;

export const SEARCH_KNOWLEDGE_TOOL_NAME = "search_knowledge";

export const SEARCH_KNOWLEDGE_DESCRIPTION =
  "Semantic search over Yazan's published blog posts, his notes (skills, career, how he works, FAQ, interests outside work) and this site's content (about, projects, products, capabilities, certifications, how the site is built). Pass a short, specific query in English or the visitor's language. Returns the best-matching passages with their title and URL.";

/** The page each static source links to, so Reem can cite where a fact lives. */
export const RAG_SOURCE_URLS = {
  about: `${ragConfig.siteUrl}/about`,
  projects: `${ragConfig.siteUrl}/projects#projects`,
  aboutPortfolio: `${ragConfig.siteUrl}/about-portfolio`,
  capabilities: `${ragConfig.siteUrl}/#capabilities`,
  certifications: `${ragConfig.siteUrl}/#cert`,
  blog: `${ragConfig.siteUrl}/blog`,
} as const;
