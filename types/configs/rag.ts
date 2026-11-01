/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

/** Where a knowledge chunk came from: a blog post, `data/`, or a `data/knowledge` note. */
export type KnowledgeSourceType = "blog" | "data" | "note";

/** One source before chunking. `sourceId` is stable across index runs. */
export interface KnowledgeDocument {
  sourceType: KnowledgeSourceType;
  sourceId: string;
  blogId?: string;
  title: string;
  url: string | null;
  language: string;
  text: string;
}

/** What `search_knowledge` hands to Reem: one chunk and how close it matched. */
export interface KnowledgeSearchResult {
  title: string;
  url: string | null;
  sourceType: KnowledgeSourceType;
  language: string;
  content: string;
  score: number;
}
